import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import os

def train_and_save_model(dataset_path):
    print(f"Loading dataset from: {dataset_path}")
    
    try:
        df = pd.read_csv(dataset_path)
    except FileNotFoundError:
        print("ERROR: Dataset not found. Please verify the path.")
        return

    # Clean missing critical values
    df = df.dropna(subset=['created_datetime', 'police_station'])

    # Convert datetime strings to pandas datetime objects
    # Example format: 2023-11-20 00:28:46+00
    df['created_datetime'] = pd.to_datetime(df['created_datetime'], errors='coerce')
    df = df.dropna(subset=['created_datetime'])

    # Extract features
    df['hour'] = df['created_datetime'].dt.hour
    df['day_of_week'] = df['created_datetime'].dt.dayofweek

    # Aggregate violations to predict total violations per hour per station
    print("Aggregating violation counts by hour, day, and police station...")
    agg_df = df.groupby(['police_station', 'day_of_week', 'hour']).size().reset_index(name='violation_count')

    # Encode categorical variable (police_station)
    print("Encoding police station names...")
    le = LabelEncoder()
    agg_df['police_station_encoded'] = le.fit_transform(agg_df['police_station'])

    # Prepare features (X) and target (y)
    X = agg_df[['police_station_encoded', 'day_of_week', 'hour']]
    y = agg_df['violation_count']

    # Initialize and train the Random Forest model
    print("Training Random Forest Regressor...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # Calculate simple accuracy metric (R^2 Score)
    score = model.score(X, y)
    print(f"Model trained successfully. Training R^2 Score: {score:.4f}")

    # Create output directory
    os.makedirs('models', exist_ok=True)

    # Save the model and the label encoder
    model_path = 'models/model.pkl'
    encoder_path = 'models/encoder.pkl'
    
    joblib.dump(model, model_path)
    joblib.dump(le, encoder_path)
    
    print(f"Model saved to {model_path}")
    print(f"Encoder saved to {encoder_path}")

if __name__ == "__main__":
    DATASET_PATH = r"c:\Users\ACER\Downloads\jan to may police violation_anonymized791b166.csv"
    train_and_save_model(DATASET_PATH)
