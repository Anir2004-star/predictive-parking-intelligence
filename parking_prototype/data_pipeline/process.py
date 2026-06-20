import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
import json
from datetime import datetime
import os

print("Starting Data Pipeline...")
csv_path = r"c:\Users\ACER\Downloads\jan to may police violation_anonymized791b166.csv"
output_path = r"C:\Users\ACER\OneDrive\Desktop\Flipkart\parking_prototype\backend\hotspots.json"

# Load a sample or the whole dataset (we will load the whole dataset but filter it)
print("Loading data...")
try:
    df = pd.read_csv(csv_path)
except Exception as e:
    print(f"Error loading CSV: {e}")
    exit(1)

print(f"Total rows loaded: {len(df)}")

# Filter for parking violations
parking_keywords = ['PARKING']
def is_parking_violation(v_type):
    if pd.isna(v_type):
        return False
    v_type_upper = str(v_type).upper()
    return any(keyword in v_type_upper for keyword in parking_keywords)

print("Filtering for parking violations...")
df['is_parking'] = df['violation_type'].apply(is_parking_violation)
parking_df = df[df['is_parking']].copy()

print(f"Total parking violations: {len(parking_df)}")

# Drop rows with missing coordinates
parking_df = parking_df.dropna(subset=['latitude', 'longitude'])

# Extract hour for temporal analysis
parking_df['created_datetime'] = pd.to_datetime(parking_df['created_datetime'], errors='coerce')
parking_df['hour'] = parking_df['created_datetime'].dt.hour

def get_time_period(hour):
    if pd.isna(hour):
        return "Unknown"
    if 7 <= hour < 11:
        return "Morning Peak"
    elif 11 <= hour < 16:
        return "Midday"
    elif 16 <= hour < 20:
        return "Evening Peak"
    else:
        return "Night Off-Peak"

parking_df['time_period'] = parking_df['hour'].apply(get_time_period)

# Clustering
print("Clustering hotspots using DBSCAN...")
# Epsilon 0.001 is approx 100 meters
coords = parking_df[['latitude', 'longitude']].values
# For 300k rows, DBSCAN might be slow. Let's take a sample or use a faster approach if it's too large.
# Let's round coordinates to 3 decimal places (approx 100m) to group them as a simple grid instead of DBSCAN to save time and memory for this prototype.
parking_df['lat_bin'] = parking_df['latitude'].round(3)
parking_df['lon_bin'] = parking_df['longitude'].round(3)

# Group by the bins
print("Aggregating into Hotspots...")
hotspots = parking_df.groupby(['lat_bin', 'lon_bin']).agg(
    total_violations=('id', 'count'),
    morning_peak=('time_period', lambda x: (x == 'Morning Peak').sum()),
    evening_peak=('time_period', lambda x: (x == 'Evening Peak').sum()),
    midday=('time_period', lambda x: (x == 'Midday').sum()),
    night=('time_period', lambda x: (x == 'Night Off-Peak').sum()),
    common_offence=('violation_type', lambda x: x.mode().iloc[0] if not x.empty else 'Unknown')
).reset_index()

# Calculate Impact Score
# Heuristic: base score = total violations
# Multiplier: if highly concentrated in peak hours, multiply
def calculate_impact(row):
    peak_ratio = (row['morning_peak'] + row['evening_peak']) / max(1, row['total_violations'])
    # 1.0 to 1.5 multiplier based on peak ratio
    multiplier = 1.0 + (peak_ratio * 0.5)
    return round(row['total_violations'] * multiplier, 2)

hotspots['impact_score'] = hotspots.apply(calculate_impact, axis=1)

# Sort by impact score
hotspots = hotspots.sort_values(by='impact_score', ascending=False)

# Convert to JSON format for the frontend
hotspot_list = []
for idx, row in hotspots.iterrows():
    # Only keep significant hotspots (e.g., > 10 violations) to keep payload small
    if row['total_violations'] > 10:
        hotspot_list.append({
            "id": f"HS_{idx}",
            "lat": row['lat_bin'],
            "lng": row['lon_bin'],
            "total_violations": int(row['total_violations']),
            "impact_score": float(row['impact_score']),
            "breakdown": {
                "Morning Peak": int(row['morning_peak']),
                "Evening Peak": int(row['evening_peak']),
                "Midday": int(row['midday']),
                "Night": int(row['night'])
            },
            "primary_offence": row['common_offence']
        })

print(f"Total significant hotspots generated: {len(hotspot_list)}")

with open(output_path, 'w') as f:
    json.dump({"hotspots": hotspot_list}, f, indent=2)

print(f"Data saved to {output_path}")
