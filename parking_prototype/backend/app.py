from flask import Flask, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import datetime
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from flask import request

app = Flask(__name__)
CORS(app)

# Load the trained model and encoder
try:
    model = joblib.load('models/model.pkl')
    le = joblib.load('models/encoder.pkl')
    print("Model and encoder loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

load_dotenv()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY and GEMINI_API_KEY != "YOUR_API_KEY_HERE" else None

# Hardcode some dummy coordinates for the police stations to display on map
STATION_COORDS = {
    "Madiwala": {"lat": 12.9231, "lng": 77.6187},
    "Bellandur": {"lat": 12.9304, "lng": 77.6784},
    "Byatarayanapura": {"lat": 13.0610, "lng": 77.5925},
    "Koramangala": {"lat": 12.9372, "lng": 77.6269},
    "Indiranagar": {"lat": 12.9784, "lng": 77.6408},
    "Whitefield": {"lat": 12.9698, "lng": 77.7499},
    "Electronic City": {"lat": 12.8399, "lng": 77.6770},
    "HSR Layout": {"lat": 12.9121, "lng": 77.6446},
    "Hebbal": {"lat": 13.0354, "lng": 77.5971},
    "Marathahalli": {"lat": 12.9553, "lng": 77.7011}
}

def _get_predictions():
    if model is None:
        return []

    now = datetime.datetime.now()
    current_hour = now.hour
    current_day = now.weekday()
    stations = le.classes_
    predictions = []
    
    for i, station in enumerate(stations):
        coords = STATION_COORDS.get(station, {
            "lat": 12.9716 + (hash(station) % 100) * 0.0005, 
            "lng": 77.5946 + ((hash(station) // 100) % 100) * 0.0005
        })
        station_encoded = le.transform([station])[0]
        features = pd.DataFrame([{
            'police_station_encoded': station_encoded,
            'day_of_week': current_day,
            'hour': current_hour
        }])
        pred_count = model.predict(features)[0]
        pred_count = max(5, int(pred_count * 15))
        impact_score = min(99, int((pred_count / 100) * 100))
        raw_impact_score = impact_score * 50
        
        predictions.append({
            "id": f"ML_{i}",
            "locationName": station,
            "lat": coords["lat"],
            "lng": coords["lng"],
            "total_violations": pred_count,
            "impact_score": raw_impact_score
        })
        
    predictions.sort(key=lambda x: x["total_violations"], reverse=True)
    return predictions

@app.route('/api/hotspots', methods=['GET'])
def get_hotspots():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
    return jsonify({"hotspots": _get_predictions()})

@app.route('/api/predict_timeline', methods=['GET'])
def get_predict_timeline():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    current_day = datetime.datetime.now().weekday()
    stations = le.classes_
    timeline = []

    for hour in range(24):
        hourly_total = 0
        for station in stations:
            station_encoded = le.transform([station])[0]
            features = pd.DataFrame([{
                'police_station_encoded': station_encoded,
                'day_of_week': current_day,
                'hour': hour
            }])
            pred_count = model.predict(features)[0]
            hourly_total += max(5, int(pred_count * 15))
            
        timeline.append({
            "time": f"{hour}:00",
            "demand": hourly_total,
            "confidence": [int(hourly_total * 0.92), int(hourly_total * 1.08)]
        })

    return jsonify({"timeline": timeline})

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    messages = data.get('messages', [])
    
    if not client:
        return jsonify({"response": "Generative AI is currently disabled. Please add your Google Gemini API Key to the `backend/.env` file and restart the backend server."})

    all_hotspots = _get_predictions()
    hotspot_context = "\n".join([f"- {h['locationName']}: {h['total_violations']} expected violations, Risk Score: {h['impact_score']}/100" for h in all_hotspots])

    system_prompt = f"""
    You are the AI Operations Copilot for the Bengaluru Traffic Command Center.
    You monitor traffic telemetry, analyze hotspots, and recommend resource dispatch (like Heavy Tow Units).
    You are strictly an operations AI. If the user asks an out-of-bounds question (e.g., sports, cooking, coding help, general knowledge), politely decline and state your operational parameters.
    If the user asks for the status of a location that is NOT in the telemetry data below, you must reply: "I do not have telemetry for [Location]. That location is not present in the current uploaded dataset."
    
    Current Live Traffic ML Telemetry data:
    {hotspot_context}
    
    Keep responses concise, professional, and formatted in markdown. Use bullet points where appropriate.
    """

    contents = []
    for msg in messages[:-1]:
        role = 'model' if msg['role'] == 'assistant' else 'user'
        if msg['content'].strip():
            contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg['content'])]))

    latest_message = messages[-1]['content'] if messages else ""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents + [latest_message],
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
            )
        )
        return jsonify({"response": response.text})
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return jsonify({"response": f"**System Error:** Connecting to Generative AI Backend failed: {e}"})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
