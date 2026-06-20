import pandas as pd
import json
import os

print("Extracting data from train.csv...")

df = pd.read_csv('dataset/dataset/train.csv')

# The 40 Bengaluru locations used in the UI
bengaluruLocations = [
  "Silk Board Junction", "Marathahalli Bridge", "Koramangala Sony", "Indiranagar 100ft",
  "MG Road Metro", "Hebbal Flyover", "Electronic City Ph1", "Whitefield Tech Park",
  "Tin Factory", "Madiwala Checkpost", "KR Puram Station", "Majestic Station",
  "Richmond Circle", "Domlur Flyover", "Bellandur ORR", "HSR Layout Sector 1",
  "Jayanagar 4th Block", "BTM Layout Tank", "Yeshwanthpur", "Peenya Ind Area",
  "Kalyan Nagar", "Banashankari", "Malleswaram 8th Cross", "Basavanagudi",
  "Kengeri Satellite Town", "Yelahanka New Town", "Jalahalli Cross", "Vidyaranyapura",
  "Sahakarnagar", "Hennur Cross", "Mahadevapura", "Kundalahalli Gate",
  "Brookefield", "Hoodi Circle", "Kaggadasapura", "CV Raman Nagar",
  "Ulsoor Lake", "Shivajinagar", "Frazer Town", "Cox Town"
]

# Get the top 40 geohashes by count to map to our 40 locations
top_geohashes = df['geohash'].value_counts().head(40).index.tolist()

output_data = {}

for i, loc in enumerate(bengaluruLocations):
    if i < len(top_geohashes):
        gh = top_geohashes[i]
        subset = df[df['geohash'] == gh]
        
        # Extract features
        avg_demand = subset['demand'].mean()
        road_type = subset['RoadType'].mode()[0] if not subset['RoadType'].mode().empty else "Residential"
        lanes = subset['NumberofLanes'].mode()[0] if not subset['NumberofLanes'].mode().empty else 2
        weather = subset['Weather'].mode()[0] if not subset['Weather'].mode().empty else "Clear"
        
        # Clean up Temperature (some are missing/NaN)
        subset['Temperature'] = pd.to_numeric(subset['Temperature'], errors='coerce')
        avg_temp = subset['Temperature'].mean()
        if pd.isna(avg_temp):
            avg_temp = 25.0
            
        output_data[loc] = {
            "geohash": gh,
            "demand": float(avg_demand),
            "RoadType": str(road_type),
            "NumberofLanes": int(lanes),
            "Weather": str(weather),
            "Temperature": round(float(avg_temp), 1)
        }

# Ensure directory exists
out_dir = 'parking_prototype/frontend/src/data'
os.makedirs(out_dir, exist_ok=True)

out_file = os.path.join(out_dir, 'real_traffic_data.json')
with open(out_file, 'w') as f:
    json.dump(output_data, f, indent=4)

print(f"Successfully extracted real CSV data to {out_file}")
