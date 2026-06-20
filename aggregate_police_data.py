import pandas as pd
import json
import os

csv_path = r"c:\Users\ACER\Downloads\jan to may police violation_anonymized791b166.csv"
print(f"Loading {csv_path}...")

# Load data
df = pd.read_csv(csv_path)
print(f"Loaded {len(df)} rows.")

import pygeohash as pgh

# Drop missing lat/lng
df = df.dropna(subset=['latitude', 'longitude'])

print("Encoding geohashes (precision 7 = ~150m localized hotspots)...")
# Using precision 7 gives us highly localized 150m street-level hotspots
df['geohash'] = df.apply(lambda row: pgh.encode(row['latitude'], row['longitude'], precision=7), axis=1)

# Group by localized hotspot
clusters = df.groupby('geohash')

frontend_data = {}
backend_hotspots = []

for gh, group in clusters:
    total_violations = len(group)
    
    # Generate a human readable name
    # Find most common junction if exists
    junctions = group['junction_name'].value_counts()
    best_name = None
    for j in junctions.index:
        if j != 'No Junction' and str(j).strip() != '' and str(j).lower() != 'nan':
            best_name = str(j)
            break
            
    # Fallback to Police station + Geohash
    if not best_name:
        ps_counts = group['police_station'].value_counts()
        ps = ps_counts.index[0] if len(ps_counts) > 0 else "Unknown"
        best_name = f"{ps} Street ({gh})"
    
    # Calculate Lat/Lng (mean)
    lat = group['latitude'].mean()
    lng = group['longitude'].mean()
    
    # Breakdown by violation type
    v_counts = group['violation_type'].value_counts().head(4)
    breakdown = {}
    for k, v in v_counts.items():
        clean_k = str(k).replace('[', '').replace(']', '').replace('"', '')
        if ',' in clean_k:
            clean_k = clean_k.split(',')[0]
        breakdown[clean_k] = int(v)
        
    demand = min(1.0, total_violations / 5000.0) # Assume 5k is high for a 150m stretch
    
    frontend_data[best_name] = {
        "demand": demand,
        "RoadType": "Main Road",
        "NumberofLanes": 2, 
        "Weather": "Clear",
        "Temperature": 28.0 
    }
    
    backend_hotspots.append({
        "id": f"HS_{gh}",
        "locationName": best_name,
        "lat": lat,
        "lng": lng,
        "total_violations": total_violations,
        "impact_score": int((total_violations / len(df)) * 150000), 
        "breakdown": breakdown
    })

# Sort backend_hotspots by total violations
backend_hotspots = sorted(backend_hotspots, key=lambda x: x['total_violations'], reverse=True)

# Keep top 40 for frontend performance if needed, or all
top_stations = backend_hotspots[:40]
top_names = [s['locationName'] for s in top_stations]

# Filter frontend_data to only top 40 to match
frontend_data = {k: v for k, v in frontend_data.items() if k in top_names}

frontend_path = r"C:\Users\ACER\OneDrive\Desktop\Flipkart\parking_prototype\frontend\src\data\real_traffic_data.json"
backend_path = r"C:\Users\ACER\OneDrive\Desktop\Flipkart\parking_prototype\backend\hotspots.json"

with open(frontend_path, 'w') as f:
    json.dump(frontend_data, f, indent=4)
print(f"Saved {len(frontend_data)} frontend locations to {frontend_path}")

with open(backend_path, 'w') as f:
    json.dump({"hotspots": top_stations}, f, indent=4)
print(f"Saved {len(top_stations)} backend hotspots to {backend_path}")

print("Data extraction complete.")
