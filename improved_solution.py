"""
IMPROVED SOLUTION — Gridlock Hackathon 2.0
Target: 93+ score (from 87)

Key improvements over v1:
1. Target encoding (geohash, hour, road features × demand)
2. Location × Time interaction aggregates
3. CatBoost added as 3rd model
4. Optimized hyperparameters
5. Better ensemble weights
"""

import os, warnings, logging
warnings.filterwarnings('ignore')
os.environ['PYTHONWARNINGS'] = 'ignore'
for n in ('lightgbm','xgboost','catboost','py.warnings','root'):
    logging.getLogger(n).setLevel(logging.ERROR)

import pandas as pd
import numpy as np
from sklearn.model_selection import KFold
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error
import lightgbm as lgb  # type: ignore
import xgboost as xgb   # type: ignore
try:
    from catboost import CatBoostRegressor  # type: ignore
    CATBOOST_OK = True
except Exception:
    CATBOOST_OK = False

try:
    import pygeohash as pgh  # type: ignore
    GEO_OK = True
except Exception:
    pgh = None; GEO_OK = False

print("=" * 60)
print("IMPROVED TRAFFIC DEMAND PREDICTION — v2")
print("=" * 60)

# ──────────────────────────────────────────────────────────────
# 1. LOAD DATA
# ──────────────────────────────────────────────────────────────
train = pd.read_csv('dataset/dataset/train.csv')
test  = pd.read_csv('dataset/dataset/test.csv')
sample_sub = pd.read_csv('dataset/dataset/sample_submission.csv')
print(f"Train: {train.shape} | Test: {test.shape}")

# ──────────────────────────────────────────────────────────────
# 2. BASE FEATURE ENGINEERING
# ──────────────────────────────────────────────────────────────
def base_features(df):
    df = df.copy()
    # Geohash decode
    if GEO_OK and 'geohash' in df.columns:
        try:
            dec = df['geohash'].apply(lambda x: pgh.decode(str(x)))
            df['lat'] = dec.apply(lambda x: x[0])
            df['lon'] = dec.apply(lambda x: x[1])
        except:
            df['lat'] = 0.0; df['lon'] = 0.0
    # Geohash prefixes
    df['gh3'] = df['geohash'].str[:3]
    df['gh4'] = df['geohash'].str[:4]
    df['gh5'] = df['geohash'].str[:5]
    df['gh6'] = df['geohash'].str[:6]  # more granular

    # Timestamp
    parts = df['timestamp'].astype(str).str.split(':', expand=True)
    df['hour']   = parts[0].astype(float)
    df['minute'] = parts[1].astype(float)
    df['hour_minute']      = df['hour'] * 60 + df['minute']
    df['is_peak_morning']  = ((df['hour'] >= 7)  & (df['hour'] <= 10)).astype(int)
    df['is_peak_evening']  = ((df['hour'] >= 17) & (df['hour'] <= 20)).astype(int)
    df['is_business_hour'] = ((df['hour'] >= 9)  & (df['hour'] <= 18)).astype(int)
    df['is_night']         = ((df['hour'] >= 22) | (df['hour'] <= 5)).astype(int)
    df['sin_hour']         = np.sin(2 * np.pi * df['hour'] / 24)
    df['cos_hour']         = np.cos(2 * np.pi * df['hour'] / 24)
    df['sin_minute']       = np.sin(2 * np.pi * df['minute'] / 60)
    df['cos_minute']       = np.cos(2 * np.pi * df['minute'] / 60)

    # Day
    df['sin_day'] = np.sin(2 * np.pi * df['day'] / 7)
    df['cos_day'] = np.cos(2 * np.pi * df['day'] / 7)

    # Temperature
    df['Temperature'] = pd.to_numeric(df['Temperature'], errors='coerce')
    return df

train = base_features(train)
test  = base_features(test)
print(f"After base FE -> Train: {train.shape}")

# ──────────────────────────────────────────────────────────────
# 3. LABEL ENCODE CATEGORICALS
# ──────────────────────────────────────────────────────────────
cat_cols = ['RoadType', 'LargeVehicles', 'Landmarks', 'Weather',
            'gh3', 'gh4', 'gh5', 'gh6']
cat_cols = [c for c in cat_cols if c in train.columns]
for col in cat_cols:
    le = LabelEncoder()
    combined = pd.concat([train[col].astype(str).fillna('NaN'),
                          test[col].astype(str).fillna('NaN')])
    le.fit(combined)
    train[col] = le.transform(train[col].astype(str).fillna('NaN'))
    test[col]  = le.transform(test[col].astype(str).fillna('NaN'))
print(f"Label encoded: {cat_cols}")

# ──────────────────────────────────────────────────────────────
# 4. TARGET ENCODING  ← BIG IMPROVEMENT
# ──────────────────────────────────────────────────────────────
# We encode location & time columns with mean demand
# Using out-of-fold to prevent data leakage

N_FOLDS = 5
kf = KFold(n_splits=N_FOLDS, shuffle=True, random_state=42)

target_encode_cols = ['gh3', 'gh4', 'gh5', 'gh6', 'hour', 'RoadType', 'Weather']
ALPHA = 10  # smoothing factor

def target_encode_oof(train_df, test_df, col, target, n_splits=5, alpha=10):
    """Out-of-fold target encoding with smoothing to prevent leakage."""
    global_mean = train_df[target].mean()
    train_enc = np.zeros(len(train_df))
    test_enc  = np.zeros(len(test_df))

    for fold, (tr_idx, val_idx) in enumerate(
            KFold(n_splits=n_splits, shuffle=True, random_state=42).split(train_df)):
        tr_part  = train_df.iloc[tr_idx]
        val_part = train_df.iloc[val_idx]
        stats = tr_part.groupby(col)[target].agg(['mean', 'count'])
        stats.columns = ['mean', 'count']
        # Smoothed mean: (count*mean + alpha*global_mean) / (count + alpha)
        stats['smooth'] = (stats['count'] * stats['mean'] + alpha * global_mean) / (stats['count'] + alpha)
        val_mapped = val_part[col].map(stats['smooth']).fillna(global_mean)
        train_enc[val_idx] = val_mapped.values

    # For test: use full training data stats
    stats = train_df.groupby(col)[target].agg(['mean', 'count'])
    stats.columns = ['mean', 'count']
    stats['smooth'] = (stats['count'] * stats['mean'] + alpha * global_mean) / (stats['count'] + alpha)
    test_enc = test_df[col].map(stats['smooth']).fillna(global_mean).values
    return train_enc, test_enc

print("\nApplying target encoding...")
for col in target_encode_cols:
    if col in train.columns and col in test.columns:
        tr_enc, te_enc = target_encode_oof(train, test, col, 'demand',
                                            n_splits=N_FOLDS, alpha=ALPHA)
        train[f'te_{col}'] = tr_enc
        test[f'te_{col}']  = te_enc
        print(f"  te_{col} done")

# ──────────────────────────────────────────────────────────────
# 5. INTERACTION FEATURES  ← KEY IMPROVEMENT
# ──────────────────────────────────────────────────────────────
# Location × Hour demand (where is it busy at what time?)
print("\nBuilding interaction features...")

interact_pairs = [
    ('gh4', 'hour'),   # area demand by hour
    ('gh5', 'hour'),   # precise location demand by hour
    ('gh4', 'is_peak_morning'),
    ('gh4', 'is_peak_evening'),
]

def interaction_target_encode(train_df, test_df, col1, col2, target, alpha=10):
    global_mean = train_df[target].mean()
    key_train   = train_df[col1].astype(str) + '_' + train_df[col2].astype(str)
    key_test    = test_df[col1].astype(str)  + '_' + test_df[col2].astype(str)
    train_enc   = np.zeros(len(train_df))
    test_enc    = np.zeros(len(test_df))

    for fold, (tr_idx, val_idx) in enumerate(
            KFold(n_splits=N_FOLDS, shuffle=True, random_state=42).split(train_df)):
        key_tr  = key_train.iloc[tr_idx]
        y_tr    = train_df[target].iloc[tr_idx]
        key_val = key_train.iloc[val_idx]
        stats = pd.DataFrame({'key': key_tr, 'y': y_tr}).groupby('key')['y'].agg(['mean','count'])
        stats['smooth'] = (stats['count']*stats['mean'] + alpha*global_mean) / (stats['count']+alpha)
        train_enc[val_idx] = key_val.map(stats['smooth']).fillna(global_mean).values

    stats = pd.DataFrame({'key': key_train, 'y': train_df[target]}).groupby('key')['y'].agg(['mean','count'])
    stats['smooth'] = (stats['count']*stats['mean'] + alpha*global_mean) / (stats['count']+alpha)
    test_enc = key_test.map(stats['smooth']).fillna(global_mean).values
    return train_enc, test_enc

for c1, c2 in interact_pairs:
    if c1 in train.columns and c2 in train.columns:
        tr_enc, te_enc = interaction_target_encode(train, test, c1, c2, 'demand')
        fname = f'ix_{c1}_{c2}'
        train[fname] = tr_enc
        test[fname]  = te_enc
        print(f"  {fname} done")

# ──────────────────────────────────────────────────────────────
# 6. PREPARE FEATURES
# ──────────────────────────────────────────────────────────────
exclude = ['Index', 'demand', 'timestamp', 'geohash']
feature_cols = [c for c in train.columns
                if c not in exclude
                and train[c].dtype in [np.float64, np.int64, np.float32, np.int32]]

print(f"\nTotal features: {len(feature_cols)}")
print(f"Features: {feature_cols}")

X      = train[feature_cols].copy()
y      = train['demand'].copy()
X_test = test[feature_cols].copy()

medians = X.median()
X       = X.fillna(medians)
X_test  = X_test.fillna(medians)
print(f"\nX: {X.shape} | NaN: {X.isnull().sum().sum()}")
print(f"X_test: {X_test.shape} | NaN: {X_test.isnull().sum().sum()}")

# ──────────────────────────────────────────────────────────────
# 7. LIGHTGBM v2 — Tuned
# ──────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("TRAINING LightGBM v2 (5-Fold CV)...")
print("="*60)

lgb_params = {
    'objective'         : 'regression',
    'metric'            : 'rmse',
    'learning_rate'     : 0.03,       # slower = more careful
    'num_leaves'        : 255,        # more complex trees
    'max_depth'         : -1,
    'min_child_samples' : 15,
    'feature_fraction'  : 0.75,
    'bagging_fraction'  : 0.75,
    'bagging_freq'      : 5,
    'reg_alpha'         : 0.05,
    'reg_lambda'        : 0.05,
    'min_split_gain'    : 0.0,
    'random_state'      : 42,
    'n_jobs'            : -1,
    'verbose'           : -1,
}

lgb_oof    = np.zeros(len(X))
lgb_preds  = np.zeros(len(X_test))
lgb_scores = []
lgb_model  = None

for fold, (tr_idx, val_idx) in enumerate(kf.split(X, y)):
    X_tr, X_val = X.iloc[tr_idx], X.iloc[val_idx]
    y_tr, y_val = y.iloc[tr_idx], y.iloc[val_idx]
    dtrain = lgb.Dataset(X_tr, label=y_tr)
    dval   = lgb.Dataset(X_val, label=y_val, reference=dtrain)
    lgb_model = lgb.train(
        lgb_params, dtrain,
        num_boost_round=5000,
        valid_sets=[dval],
        callbacks=[lgb.early_stopping(150, verbose=False),
                   lgb.log_evaluation(0)],
    )
    val_pred         = lgb_model.predict(X_val, num_iteration=lgb_model.best_iteration)
    lgb_oof[val_idx] = val_pred
    lgb_preds       += lgb_model.predict(X_test, num_iteration=lgb_model.best_iteration) / N_FOLDS
    rmse = np.sqrt(mean_squared_error(y_val, val_pred))
    lgb_scores.append(rmse)
    print(f"  Fold {fold+1}  RMSE: {rmse:.5f}  |  Iter: {lgb_model.best_iteration}")

print(f"\nLightGBM CV RMSE: {np.mean(lgb_scores):.5f} +/- {np.std(lgb_scores):.5f}")

# ──────────────────────────────────────────────────────────────
# 8. XGBOOST v2 — Tuned
# ──────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("TRAINING XGBoost v2 (5-Fold CV)...")
print("="*60)

xgb_params = {
    'objective'        : 'reg:squarederror',
    'eval_metric'      : 'rmse',
    'learning_rate'    : 0.03,
    'max_depth'        : 8,
    'min_child_weight' : 3,
    'subsample'        : 0.75,
    'colsample_bytree' : 0.75,
    'colsample_bylevel': 0.75,
    'reg_alpha'        : 0.05,
    'reg_lambda'       : 0.5,
    'gamma'            : 0.01,
    'seed'             : 42,
    'nthread'          : -1,
    'verbosity'        : 0,
}

xgb_oof    = np.zeros(len(X))
xgb_preds  = np.zeros(len(X_test))
xgb_scores = []

for fold, (tr_idx, val_idx) in enumerate(kf.split(X, y)):
    X_tr, X_val = X.iloc[tr_idx], X.iloc[val_idx]
    y_tr, y_val = y.iloc[tr_idx], y.iloc[val_idx]
    dtrain = xgb.DMatrix(X_tr, label=y_tr)
    dval   = xgb.DMatrix(X_val, label=y_val)
    dtest  = xgb.DMatrix(X_test)
    model = xgb.train(
        xgb_params, dtrain,
        num_boost_round=5000,
        evals=[(dval, 'val')],
        early_stopping_rounds=150,
        verbose_eval=False,
    )
    val_pred         = model.predict(dval)
    xgb_oof[val_idx] = val_pred
    xgb_preds       += model.predict(dtest) / N_FOLDS
    rmse = np.sqrt(mean_squared_error(y_val, val_pred))
    xgb_scores.append(rmse)
    print(f"  Fold {fold+1}  RMSE: {rmse:.5f}  |  Iter: {model.best_iteration}")

print(f"\nXGBoost CV RMSE: {np.mean(xgb_scores):.5f} +/- {np.std(xgb_scores):.5f}")

# ──────────────────────────────────────────────────────────────
# 9. CATBOOST (if installed)
# ──────────────────────────────────────────────────────────────
cat_oof   = np.zeros(len(X))
cat_preds = np.zeros(len(X_test))
cat_scores = []

if CATBOOST_OK:
    print("\n" + "="*60)
    print("TRAINING CatBoost (5-Fold CV)...")
    print("="*60)
    for fold, (tr_idx, val_idx) in enumerate(kf.split(X, y)):
        X_tr, X_val = X.iloc[tr_idx], X.iloc[val_idx]
        y_tr, y_val = y.iloc[tr_idx], y.iloc[val_idx]
        cb = CatBoostRegressor(
            iterations=5000,
            learning_rate=0.03,
            depth=8,
            l2_leaf_reg=3,
            subsample=0.75,
            colsample_bylevel=0.75,
            early_stopping_rounds=150,
            eval_metric='RMSE',
            random_seed=42,
            verbose=0,
        )
        cb.fit(X_tr, y_tr, eval_set=(X_val, y_val), verbose=False)
        val_pred         = cb.predict(X_val)
        cat_oof[val_idx] = val_pred
        cat_preds       += cb.predict(X_test) / N_FOLDS
        rmse = np.sqrt(mean_squared_error(y_val, val_pred))
        cat_scores.append(rmse)
        print(f"  Fold {fold+1}  RMSE: {rmse:.5f}  |  Iter: {cb.best_iteration_}")
    print(f"\nCatBoost CV RMSE: {np.mean(cat_scores):.5f} +/- {np.std(cat_scores):.5f}")
else:
    print("\nCatBoost not installed — skipping")

# ──────────────────────────────────────────────────────────────
# 10. ENSEMBLE
# ──────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("ENSEMBLE")
print("="*60)

lgb_rmse = np.sqrt(mean_squared_error(y, lgb_oof))
xgb_rmse = np.sqrt(mean_squared_error(y, xgb_oof))

if CATBOOST_OK and len(cat_scores) > 0:
    cat_rmse = np.sqrt(mean_squared_error(y, cat_oof))
    # Inverse-RMSE weighting
    inv_lgb = 1 / lgb_rmse
    inv_xgb = 1 / xgb_rmse
    inv_cat = 1 / cat_rmse
    total   = inv_lgb + inv_xgb + inv_cat
    w_lgb = inv_lgb / total
    w_xgb = inv_xgb / total
    w_cat = inv_cat / total
    ensemble_oof   = w_lgb * lgb_oof   + w_xgb * xgb_oof   + w_cat * cat_oof
    ensemble_preds = w_lgb * lgb_preds + w_xgb * xgb_preds + w_cat * cat_preds
    print(f"Weights → LGB: {w_lgb:.3f}  XGB: {w_xgb:.3f}  CAT: {w_cat:.3f}")
    print(f"CatBoost  OOF RMSE: {cat_rmse:.5f}")
else:
    inv_lgb = 1 / lgb_rmse; inv_xgb = 1 / xgb_rmse
    total   = inv_lgb + inv_xgb
    w_lgb = inv_lgb / total; w_xgb = inv_xgb / total
    ensemble_oof   = w_lgb * lgb_oof   + w_xgb * xgb_oof
    ensemble_preds = w_lgb * lgb_preds + w_xgb * xgb_preds
    print(f"Weights → LGB: {w_lgb:.3f}  XGB: {w_xgb:.3f}")

ensemble_preds = np.clip(ensemble_preds, 0.0, 1.0)
ens_rmse = np.sqrt(mean_squared_error(y, ensemble_oof))

print(f"\nLightGBM  OOF RMSE : {lgb_rmse:.5f}")
print(f"XGBoost   OOF RMSE : {xgb_rmse:.5f}")
print(f"Ensemble  OOF RMSE : {ens_rmse:.5f}  <-- BEST")
print(f"\nPredictions → min: {ensemble_preds.min():.5f}  max: {ensemble_preds.max():.5f}  mean: {ensemble_preds.mean():.5f}")

# ──────────────────────────────────────────────────────────────
# 11. SAVE SUBMISSION
# ──────────────────────────────────────────────────────────────
submission = pd.DataFrame({'Index': test['Index'], 'demand': ensemble_preds})
submission.to_csv('submission.csv', index=False)
print(f"\n{'='*60}")
print(f"submission.csv saved! ({len(submission):,} rows)")
print(submission.head(10).to_string(index=False))
print("="*60)
print("DONE! Upload submission.csv to HackerEarth.")
