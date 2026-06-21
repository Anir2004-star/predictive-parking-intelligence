# 🚗 AI Traffic & Parking Management System

**Flipkart Grid Hackathon 2.0 Submission**  
A comprehensive, AI-driven traffic and parking management ecosystem designed to predict, visualize, and mitigate urban congestion caused by unorganized parking.

---

## 🎯 Project Overview
Unorganized parking is a leading cause of urban gridlock. This project attacks the problem from two angles:
1. **Machine Learning Predictive Engine**: A highly accurate forecasting model that predicts normalized traffic demand across different geohash locations and time horizons.
2. **AI Traffic Command Center**: An interactive, dynamic React dashboard serving as a "Digital Twin" of the city. It visualizes critical congestion nodes, provides root-cause analysis (SHAP breakdowns), and simulates resource dispatch.

**Hackathon Score Achieved:** ~92.27% Accuracy (91.54 Score)

---

## ✨ Key Features (Frontend Dashboard)

- **AI Traffic Command Center**: A live city map highlighting traffic corridors (Green/Yellow/Red). Pulsing markers isolate bottlenecks specifically induced by parking violations.
- **Hotspot Intelligence**: A ranked leaderboard of the top 40 critical congestion nodes. Includes an AI SHAP breakdown explaining the exact drivers of the congestion (e.g., Wrong Parking 42%, Metro Traffic 13%).
- **Predictive Analytics**: A vectorized time-series forecasting tool visualizing volume peaks (+30m, +1h, +3h) to allow enforcement agencies to preemptively deploy units. Includes a dynamic dataset router to drill down into 140+ individual police stations.
- **Incident Response Engine**: An automated dispatcher that evaluates the severity of capacity loss, analyzes nearby response units, and generates a dynamic Recovery Forecast for any selected hotspot.
- **Generative AI Copilot**: A true LLM conversational interface powered by the **Google Gemini API**. The Copilot ingests the live telemetry matrix of all 140+ stations simultaneously, allowing operators to ask complex analytical questions (e.g., *"What is the risk score for Adugodi and show in map?"*) with intelligent intent matching and persistent chat history.

---

## 🧠 Machine Learning Architecture

The predictive engine utilizes state-of-the-art tree-based regressors (XGBoost / CatBoost / LightGBM) integrated in a stacked grandmaster architecture (`v5_grandmaster.py`). 

### Feature Engineering Highlights:
- **Geospatial Processing**: Decoded geohashes to precise latitudes/longitudes. Extracted hierarchical location buckets (gh3, gh4, gh5) and applied frequency encoding.
- **Temporal Periodicity**: Created 15-min and 30-min time bins. Extracted peak-hour flags and applied cyclical encoding (sin/cos) to capture the natural rhythm of city traffic.
- **OOF Target Encoding**: Applied 10-Fold Out-Of-Fold safe target encoding on high-cardinality interactive features (e.g., `gh5 x time_bin_30m`) to prevent data leakage and overfitting.
- **Label Encoding**: Processed categorical anomalies such as RoadType, LargeVehicles, Landmarks, and Weather.

---

## 📂 Repository Structure

```text
📦 Flipkart
 ┣ 📂 parking_prototype/        # The Full Web Application
 ┃ ┣ 📂 frontend/               # React / Vite SPA Dashboard
 ┃ ┃ ┣ 📂 src/
 ┃ ┃ ┃ ┣ 📂 components/         # Reusable UI components (Sidebar, Layouts)
 ┃ ┃ ┃ ┣ 📂 pages/              # Dashboard Views
 ┃ ┃ ┃ ┃ ┣ 📜 CommandCenter.jsx
 ┃ ┃ ┃ ┃ ┣ 📜 HotspotIntelligence.jsx
 ┃ ┃ ┃ ┃ ┣ 📜 PredictiveAnalytics.jsx
 ┃ ┃ ┃ ┃ ┣ 📜 IncidentResponse.jsx
 ┃ ┃ ┃ ┃ ┣ 📜 Copilot.jsx
 ┃ ┃ ┃ ┃ ┣ 📜 ExecutiveDashboard.jsx
 ┃ ┃ ┃ ┃ ┣ 📜 CauseAnalysis.jsx
 ┃ ┃ ┃ ┃ ┣ 📜 EnforcementOptimizer.jsx
 ┃ ┃ ┃ ┃ ┣ 📜 ImpactSimulator.jsx
 ┃ ┃ ┃ ┃ ┗ 📜 Home.jsx
 ┃ ┃ ┃ ┣ 📜 App.jsx             # React Router logic
 ┃ ┃ ┃ ┗ 📜 index.css           # Custom UI design system & GSAP animations
 ┃ ┃ ┣ 📜 package.json
 ┃ ┃ ┗ 📜 vite.config.js
 ┃ ┣ 📂 backend/                # Python / Flask Machine Learning API Server
 ┃ ┃ ┣ 📜 app.py                # Core API, Model Inferences, and Gemini LLM router
 ┃ ┃ ┣ 📜 train_model.py        # Random Forest model training script
 ┃ ┃ ┣ 📜 requirements.txt      # Python dependencies
 ┃ ┃ ┗ 📜 .env                  # API Keys (Google Gemini)
 ┃ ┗ 📂 data_pipeline/          # Python scripts for data ingestion and processing
 ┃   ┗ 📂 datasets/             
 ┃     ┗ 📜 dataset.zip         # Compressed raw telemetry data (300k+ records)
 ┣ 📜 v5_grandmaster.py         # Advanced ML Model Pipeline & Training script
 ┣ 📜 improved_solution.py      # Baseline XGBoost model
 ┣ 📜 extract_csv_data.py       # Data extraction and anonymization utilities
 ┣ 📜 aggregate_police_data.py  # Script bridging real-world data to the model
 ┗ 📜 approach.txt              # Hackathon methodology breakdown
```

---

## 🚀 How to Run

### 1. Run the ML Training
Ensure you have the required Python dependencies (`pandas`, `numpy`, `xgboost`, `catboost`, `scikit-learn`, `pygeohash`).
```bash
python v5_grandmaster.py
```

### 2. Start the Python Backend API & Generative AI
Navigate to the backend directory, install the Python dependencies, configure your API keys, and run the Flask server.
```bash
cd parking_prototype/backend
pip install -r requirements.txt
```
**Important:** You must add your Google Gemini API Key to enable the Generative AI Copilot. Create a `.env` file in the `backend` folder:
```env
GEMINI_API_KEY=your_api_key_here
```
Start the server:
```bash
python app.py
```

### 3. Start the Frontend Dashboard
Open a new terminal, navigate to the frontend directory, install dependencies, and run the Vite dev server.
```bash
cd parking_prototype/frontend
npm install
npm run dev
```

---
*Built for the Flipkart Grid Hackathon by Anirban Choudhury.*
