"""
ADVANCED SOLUTION v3 — Gridlock Hackathon 2.0
Target: 93+ Score

Major Upgrades:
1. Historical lag features (demand from previous day at same time)
2. Advanced stacking meta-model (Ridge Regression) instead of manual blending
3. Extra spatial features (Lat/Lon rounding grids)
4. MLPRegressor (Neural Network) added to the ensemble
"""

import os, warnings, logging
warnings.filterwarnings('ignore')
os.environ['PYTHONWARNINGS'] = 'ignore'
for n in ('lightgbm','xgboost','catboost','py.warnings','root'):
    logging.getLogger(n).setLevel(logging.ERROR)

import pandas as pd
import numpy as np
from sklearn.model_selection import KFold
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_squared_error
from sklearn.linear_model import Ridge
from sklearn.neural_network import MLPRegressor
import lightgbm as lgb  # type: ignore
import xgboost as xgb  # type: ignore
from catboost import CatBoostRegressor  # type: ignore
import pygeohash as pgh  # type: ignore

print("=" * 60)
print("ADVANCED TRAFFIC DEMAND PREDICTION — v3")
print("=" * 60)

# ──────────────────────────────────────────────────────────────
# 1. LOAD DATA
# ──────────────────────────────────────────────────────────────
train = pd.read_csv('dataset/dataset/train.csv')
test  = pd.read_csv('dataset/dataset/test.csv')

print(f"Train: {train.shape} | Test: {test.shape}")

# ──────────────────────────────────────────────────────────────
# 2. HISTORICAL DEMAND FEATURES (The "Secret Sauce")
# ──────────────────────────────────────────────────────────────
# Since test is all day 49, the demand at the exact same location and time
# on day 48 is incredibly predictive.
print("\nBuilding historical lag features...")

# Create historical map from Day 48
day48 = train[train['day'] == 48].copy()

# Let's do it cleanly with a dataframe merge
hist_exact = day48.groupby(['geohash', 'timestamp'])['demand'].mean().reset_index()
hist_exact.rename(columns={'demand': 'hist_demand_exact'}, inplace=True)

# Also get hour-level history just in case exact minute is missing
day48['hour_str'] = day48['timestamp'].apply(lambda x: x.split(':')[0])
hist_hour = day48.groupby(['geohash', 'hour_str'])['demand'].mean().reset_index()
hist_hour.rename(columns={'demand': 'hist_demand_hour'}, inplace=True)

train['hour_str'] = train['timestamp'].apply(lambda x: str(x).split(':')[0])
test['hour_str']  = test['timestamp'].apply(lambda x: str(x).split(':')[0])

train = pd.merge(train, hist_exact, on=['geohash', 'timestamp'], how='left')
train = pd.merge(train, hist_hour, on=['geohash', 'hour_str'], how='left')

test = pd.merge(test, hist_exact, on=['geohash', 'timestamp'], how='left')
test = pd.merge(test, hist_hour, on=['geohash', 'hour_str'], how='left')

# ──────────────────────────────────────────────────────────────
# 3. BASE FEATURE ENGINEERING
# ──────────────────────────────────────────────────────────────
def base_features(df):
    df = df.copy()
    # Geohash decode
    dec = df['geohash'].apply(lambda x: pgh.decode(str(x)) if pd.notnull(x) else (0.0, 0.0))
    df['lat'] = dec.apply(lambda x: x[0])
    df['lon'] = dec.apply(lambda x: x[1])
    
    # Geohash grids
    df['gh3'] = df['geohash'].str[:3]
    df['gh4'] = df['geohash'].str[:4]
    df['gh5'] = df['geohash'].str[:5]
    df['gh6'] = df['geohash'].str[:6]

    # Timestamp
    parts = df['timestamp'].astype(str).str.split(':', expand=True)
    df['hour']   = parts[0].astype(float)
    df['minute'] = parts[1].astype(float)
    df['hour_minute']      = df['hour'] * 60 + df['minute']
    df['is_peak_morning']  = ((df['hour'] >= 7)  & (df['hour'] <= 10)).astype(int)
    df['is_peak_evening']  = ((df['hour'] >= 17) & (df['hour'] <= 20)).astype(int)
    df['is_night']         = ((df['hour'] >= 22) | (df['hour'] <= 5)).astype(int)
    df['sin_hour']         = np.sin(2 * np.pi * df['hour'] / 24)
    df['cos_hour']         = np.cos(2 * np.pi * df['hour'] / 24)

    # Temperature
    df['Temperature'] = pd.to_numeric(df['Temperature'], errors='coerce')
    
    # Grid locations (rounds lat/lon to simulate neighborhoods)
    df['lat_round'] = df['lat'].round(3)
    df['lon_round'] = df['lon'].round(3)
    
    return df

train = base_features(train)
test  = base_features(test)

# ──────────────────────────────────────────────────────────────
# 4. TARGET ENCODING (OOF)
# ──────────────────────────────────────────────────────────────
N_FOLDS = 5
kf = KFold(n_splits=N_FOLDS, shuffle=True, random_state=42)

target_encode_cols = ['gh3', 'gh4', 'gh5', 'gh6', 'hour', 'RoadType']
ALPHA = 10

def target_encode_oof(train_df, test_df, col, target):
    global_mean = train_df[target].mean()
    train_enc = np.zeros(len(train_df))
    for fold, (tr_idx, val_idx) in enumerate(kf.split(train_df)):
        tr, val = train_df.iloc[tr_idx], train_df.iloc[val_idx]
        stats = tr.groupby(col)[target].agg(['mean', 'count'])
        smooth = (stats['count'] * stats['mean'] + ALPHA * global_mean) / (stats['count'] + ALPHA)
        train_enc[val_idx] = val[col].map(smooth).fillna(global_mean).values
    
    stats = train_df.groupby(col)[target].agg(['mean', 'count'])
    smooth = (stats['count'] * stats['mean'] + ALPHA * global_mean) / (stats['count'] + ALPHA)
    test_enc = test_df[col].map(smooth).fillna(global_mean).values
    return train_enc, test_enc

for col in target_encode_cols:
    tr_enc, te_enc = target_encode_oof(train, test, col, 'demand')
    train[f'te_{col}'] = tr_enc
    test[f'te_{col}']  = te_enc

# ──────────────────────────────────────────────────────────────
# 5. CATEGORICAL ENCODING
# ──────────────────────────────────────────────────────────────
cat_cols = ['RoadType', 'LargeVehicles', 'Landmarks', 'Weather', 'gh3', 'gh4', 'gh5', 'gh6']
for col in cat_cols:
    le = LabelEncoder()
    combined = pd.concat([train[col].astype(str).fillna('NaN'), test[col].astype(str).fillna('NaN')])
    le.fit(combined)
    train[col] = le.transform(train[col].astype(str).fillna('NaN'))
    test[col]  = le.transform(test[col].astype(str).fillna('NaN'))

# ──────────────────────────────────────────────────────────────
# 6. PREPARE FEATURES
# ──────────────────────────────────────────────────────────────
exclude = ['Index', 'demand', 'timestamp', 'geohash', 'hour_str']
feature_cols = [c for c in train.columns if c not in exclude and train[c].dtype in [np.float64, np.int64, np.float32, np.int32]]

X = train[feature_cols].copy()
y = train['demand'].copy()
X_test = test[feature_cols].copy()

# Fill NaN (crucial for Neural Network and Ridge)
medians = X.median()
X = X.fillna(medians)
X_test = X_test.fillna(medians)

# Scale features for Neural Network
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_test_scaled = scaler.transform(X_test)

print(f"\nTraining on {len(feature_cols)} features...")

# ──────────────────────────────────────────────────────────────
# 7. TRAINING LEVEL-1 MODELS
# ──────────────────────────────────────────────────────────────
# We will collect Out-Of-Fold predictions for STACKING
oof_lgb = np.zeros(len(X))
oof_xgb = np.zeros(len(X))
oof_cat = np.zeros(len(X))
oof_mlp = np.zeros(len(X))

test_lgb = np.zeros(len(X_test))
test_xgb = np.zeros(len(X_test))
test_cat = np.zeros(len(X_test))
test_mlp = np.zeros(len(X_test))

print("\nTraining Base Models (LGBM, XGB, CatBoost, NeuralNet)...")

for fold, (tr_idx, val_idx) in enumerate(kf.split(X, y)):
    print(f"--- Fold {fold+1} ---")
    X_tr, y_tr = X.iloc[tr_idx], y.iloc[tr_idx]
    X_va, y_va = X.iloc[val_idx], y.iloc[val_idx]
    X_tr_s, X_va_s = X_scaled[tr_idx], X_scaled[val_idx]
    
    # 1. LightGBM
    dtrain = lgb.Dataset(X_tr, label=y_tr)
    dval   = lgb.Dataset(X_va, label=y_va)
    m_lgb = lgb.train({'objective':'regression', 'metric':'rmse', 'learning_rate':0.03, 'num_leaves':127, 'verbose':-1, 'seed':42},
                      dtrain, num_boost_round=3000, valid_sets=[dval], callbacks=[lgb.early_stopping(100, verbose=False)])
    oof_lgb[val_idx] = m_lgb.predict(X_va)
    test_lgb += m_lgb.predict(X_test) / N_FOLDS
    
    # 2. XGBoost
    dtr = xgb.DMatrix(X_tr, label=y_tr)
    dva = xgb.DMatrix(X_va, label=y_va)
    m_xgb = xgb.train({'objective':'reg:squarederror', 'eval_metric':'rmse', 'learning_rate':0.03, 'max_depth':7, 'verbosity':0, 'seed':42},
                      dtr, num_boost_round=3000, evals=[(dva, 'val')], early_stopping_rounds=100, verbose_eval=False)
    oof_xgb[val_idx] = m_xgb.predict(dva)
    test_xgb += m_xgb.predict(xgb.DMatrix(X_test)) / N_FOLDS
    
    # 3. CatBoost
    m_cat = CatBoostRegressor(iterations=3000, learning_rate=0.03, depth=7, eval_metric='RMSE', verbose=0, random_seed=42)
    m_cat.fit(X_tr, y_tr, eval_set=(X_va, y_va), early_stopping_rounds=100)
    oof_cat[val_idx] = m_cat.predict(X_va)
    test_cat += m_cat.predict(X_test) / N_FOLDS
    
    # 4. Neural Network (MLP)
    m_mlp = MLPRegressor(hidden_layer_sizes=(64, 32), learning_rate_init=0.01, max_iter=20, random_state=42, early_stopping=True)
    m_mlp.fit(X_tr_s, y_tr)
    oof_mlp[val_idx] = m_mlp.predict(X_va_s)
    test_mlp += m_mlp.predict(X_test_scaled) / N_FOLDS

print(f"\nLevel-1 OOF RMSE:")
print(f"LightGBM : {np.sqrt(mean_squared_error(y, oof_lgb)):.5f}")
print(f"XGBoost  : {np.sqrt(mean_squared_error(y, oof_xgb)):.5f}")
print(f"CatBoost : {np.sqrt(mean_squared_error(y, oof_cat)):.5f}")
print(f"NeuralNet: {np.sqrt(mean_squared_error(y, oof_mlp)):.5f}")

# ──────────────────────────────────────────────────────────────
# 8. STACKING META-MODEL (Level-2)
# ──────────────────────────────────────────────────────────────
# Instead of guessing weights, let a Ridge Regression model learn the best combination
print("\nTraining Stacking Meta-Model (Ridge)...")

X_oof = np.column_stack((oof_lgb, oof_xgb, oof_cat, oof_mlp))
X_test_meta = np.column_stack((test_lgb, test_xgb, test_cat, test_mlp))

meta_model = Ridge(alpha=1.0)
meta_model.fit(X_oof, y)

final_oof_preds = meta_model.predict(X_oof)
final_test_preds = meta_model.predict(X_test_meta)

# Clip bounds
final_test_preds = np.clip(final_test_preds, 0.0, 1.0)

ens_rmse = np.sqrt(mean_squared_error(y, final_oof_preds))
print(f"\n🏆 Final Stacked Ensemble OOF RMSE: {ens_rmse:.5f}")
print(f"Meta-Model Weights (LGB, XGB, CAT, MLP): {meta_model.coef_}")

# ──────────────────────────────────────────────────────────────
# 9. SAVE SUBMISSION
# ──────────────────────────────────────────────────────────────
submission = pd.DataFrame({'Index': test['Index'], 'demand': final_test_preds})
submission.to_csv('submission_v3.csv', index=False)
print(f"\nSaved to submission_v3.csv")
