# WellSync ML Integration - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Ensure Flask ML API is Running

```bash
# Terminal 1: Start the Flask ML API
cd path/to/flask-ml-api
python app.py

# Output:
# 🏥 HEALTH ML API SERVER STARTING...
# ✅ System initialization complete!
# * Running on http://0.0.0.0:5000
```

### 2. Generate Training Data (First Time Only)

Make a POST request to initialize the ML models:

```bash
# Option A: Using curl
curl -X POST http://localhost:5000/api/ml/generate-training-data

# Option B: Using the app's endpoint once running
# Navigate to dashboard and the system will guide you
```

This generates synthetic health data and trains the ML models (~30-60 seconds).

### 3. Environment Variables

Add to `.env.local` in the Next.js project:

```env
# .env.local
NEXT_PUBLIC_ML_API_URL=http://localhost:5000
ML_API_URL=http://localhost:5000
```

### 4. Start the Next.js App

```bash
# Terminal 2: Start Next.js development server
npm run dev

# Access at http://localhost:3000
```

## 📊 Using ML Features

### Dashboard
1. Go to **Dashboard** page
2. See **Health Score** card showing overall health (0-100)
3. View **Health Alerts** if any anomalies detected
4. Click **📊 Full Report** for comprehensive analysis

### Goals
1. Go to **Goals** page
2. Each goal now shows **AI Tips** based on your data
3. Tips update automatically as you add measurements

### Measurements
1. Add measurements normally
2. ML analysis updates automatically
3. Dashboard shows real-time health insights

## 🔧 Available ML Endpoints

### Public (Through Frontend)
- Dashboard health analysis
- Goal progress tracking
- Trend predictions
- Full comprehensive reports

### Admin (Direct API)
```bash
# Check system status
curl http://localhost:5000/api/ml/status

# Get model status
curl http://localhost:5000/api/admin/model/status

# Retrain models
curl -X POST http://localhost:5000/api/admin/model/retrain
```

## 📁 New Files Created

```
src/
├── pages/
│   └── api/
│       └── ml/
│           ├── status.ts              # ML system status
│           ├── analyze-user.ts        # User health analysis
│           ├── goal-analysis.ts       # Goal insights
│           ├── trends.ts              # Trend prediction
│           └── full-report.ts         # Comprehensive report
├── components/
│   └── MLReportComponent.tsx          # Report display component
└── pages/
    ├── dashboard.tsx                  # Updated with ML features
    └── goals.tsx                      # Updated with ML tips

utils/
└── mlClient.ts                        # ML API client service

ML_INTEGRATION_GUIDE.md                # Complete documentation
```

## 🎯 What's New in Dashboard

### Health Score Card
- **0-100 score** based on all your measurements
- Color-coded status (green/yellow/orange/red)
- Health summary text

### Health Alerts
- **Critical anomalies** flagged in real-time
- Severity levels (high/medium/low)
- Actionable tips for each alert

### Full Report
- **Comprehensive analysis** tab
- All anomalies, trends, and goals in one place
- Personalized recommendations
- Print-ready format

## 🎯 What's New in Goals

### AI-Powered Tips
- Each goal shows 2-3 tips generated from your data
- Tips based on goal type and your progress
- Updates as you make measurements

### Goal Progress Analysis
- ML calculates direction (up/down/maintain)
- Compares progress against baseline
- Shows percentage complete

## ⚙️ Configuration

### Flask ML API Settings
In `app.py`, adjust:

```python
# Default training data size
synthetic_dataset = data_gen.generate_balanced_dataset(
    n_users=2000,    # Number of synthetic users
    days=90          # Days of data to generate
)

# Model retraining schedule
# (Currently manual, can be automated with APScheduler)
```

### Forecast Period
Default: 7 days
Adjustable via API parameter `forecast_days`

```typescript
const report = await mlAPI.generateFullReport(
  measures,
  goals,
  profile,
  14  // 14-day forecast instead of 7
);
```

## 🔍 Debugging

### Check ML API Status
```typescript
// In browser console
import { mlAPI } from '@/utils/mlClient';

// Check system status
await mlAPI.getStatus();

// Check health
await mlAPI.healthCheck();
```

### View Server Logs
```bash
# Flask server logs
# Shows all ML processing steps
# Look for: ✅ Success or ❌ Error indicators
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Failed to connect to ML API" | Check Flask server is running on :5000 |
| "Models not trained" | POST to /api/ml/generate-training-data |
| "No measures found" | Add at least one measurement first |
| Empty tips/analysis | Wait for ML analysis to complete (1-2 sec) |

## 📊 API Response Examples

### Health Analysis Response
```json
{
  "anomalies": [
    {
      "type": "HIGH_BLOOD_PRESSURE",
      "severity": "medium",
      "message": "Elevated blood pressure: 142 mmHg",
      "tip": "Monitor regularly"
    }
  ],
  "health_score": 75,
  "summary": "Good health",
  "trends": {
    "weight": {
      "method": "linear_fallback",
      "slope_per_sec": -0.00001,
      "forecast": [...]
    }
  },
  "goals": [...]
}
```

### Full Report Response
```json
{
  "generated_at": "2025-01-15T10:30:00",
  "summary": "Good health",
  "health_score": 75,
  "anomalies": [...],
  "trends": {...},
  "goals": [...],
  "tips": [
    "Aim for a modest calorie deficit (250-500 kcal/day)",
    "Prioritize high-protein meals"
  ],
  "profile": {...}
}
```

## 🎓 Learning Resources

- **Full Documentation**: See `ML_INTEGRATION_GUIDE.md`
- **Flask API Code**: Check `app.py` in Flask project
- **ML Pipeline**: See `ml_pipeline/balanced_ml.py`
- **Type Definitions**: Check `utils/mlClient.ts`

## 🚦 Next Steps

1. ✅ Start Flask server
2. ✅ Generate training data
3. ✅ Start Next.js app
4. ✅ Add some measurements
5. ✅ View ML analysis on dashboard
6. ✅ Check goal recommendations
7. ✅ Generate full report

## 📞 Support

For issues:
1. Check Flask server console logs
2. Verify environment variables
3. Ensure MongoDB connection (if using persistence)
4. Check .env.local has ML_API_URL

## 🎉 You're All Set!

The ML system is now integrated and ready to provide intelligent health insights. Start tracking measurements and watch the ML system learn from your data!
