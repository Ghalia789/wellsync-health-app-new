# ML Integration - Examples & Troubleshooting

## 💡 Code Examples

### Example 1: Using ML Client Directly in Components

```typescript
// components/HealthScoreCard.tsx
import { useEffect, useState } from 'react';
import { mlAPI } from '@/utils/mlClient';

export default function HealthScoreCard() {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const analysis = await mlAPI.analyzeUserHealth([]);
        setScore(analysis.health_score);
      } catch (error) {
        console.error('Failed to fetch health score:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4 bg-blue-50 rounded">
      <p>Health Score: {score}</p>
    </div>
  );
}
```

### Example 2: Displaying Anomalies

```typescript
// components/AnomaliesDisplay.tsx
import { useEffect, useState } from 'react';

interface Anomaly {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  tip?: string;
}

export default function AnomaliesDisplay() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  useEffect(() => {
    const fetchAnomalies = async () => {
      const res = await fetch('/api/ml/analyze-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setAnomalies(data.anomalies || []);
    };

    fetchAnomalies();
  }, []);

  if (anomalies.length === 0) {
    return <div className="text-green-600">✓ No anomalies detected</div>;
  }

  return (
    <div className="space-y-2">
      {anomalies.map((anomaly, idx) => (
        <div
          key={idx}
          className={`p-3 rounded ${
            anomaly.severity === 'high'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          <p className="font-medium">{anomaly.message}</p>
          {anomaly.tip && <p className="text-sm">{anomaly.tip}</p>}
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Goal Tips Display

```typescript
// components/GoalTips.tsx
import { useEffect, useState } from 'react';
import { mlAPI } from '@/utils/mlClient';

interface GoalTipsProps {
  goal: {
    type: string;
    description: string;
    targetValue: number;
  };
}

export default function GoalTips({ goal }: GoalTipsProps) {
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const response = await fetch('/api/ml/goal-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goals: [goal] }),
        });
        const data = await response.json();
        const insights = data.insights?.[0];
        setTips(insights?.tips || []);
      } catch (error) {
        console.error('Failed to fetch tips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, [goal]);

  if (loading) return <div>Loading tips...</div>;

  return (
    <div className="bg-blue-50 p-3 rounded">
      <p className="font-medium mb-2">💡 AI Tips:</p>
      <ul className="space-y-1">
        {tips.map((tip, idx) => (
          <li key={idx} className="text-sm text-blue-800">
            • {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Example 4: Trend Chart Integration

```typescript
// components/TrendChart.tsx
import { useEffect, useState } from 'react';
import { mlAPI } from '@/utils/mlClient';

export default function TrendChart() {
  const [trends, setTrends] = useState<any>({});
  const [selectedMeasure, setSelectedMeasure] = useState('weight');

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch('/api/ml/trends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        setTrends(data.trends || {});
      } catch (error) {
        console.error('Failed to fetch trends:', error);
      }
    };

    fetchTrends();
  }, []);

  const trend = trends[selectedMeasure];

  if (!trend) {
    return <div>No trend data available</div>;
  }

  return (
    <div>
      <select onChange={(e) => setSelectedMeasure(e.target.value)}>
        {Object.keys(trends).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>

      <div className="mt-4">
        <p>Method: {trend.method}</p>
        {trend.forecast && (
          <div className="mt-2">
            <p>Forecast (next 7 days):</p>
            <ul>
              {trend.forecast.map((item: any, idx: number) => (
                <li key={idx}>
                  {new Date(item.ds).toLocaleDateString()}: {item.yhat.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
```

## 🐛 Troubleshooting Guide

### Issue 1: "Failed to connect to ML API"

**Symptoms**:
- Error messages mentioning connection timeout
- ML features not working
- Status page shows API unavailable

**Solutions**:

1. **Check Flask server is running**:
   ```bash
   # Terminal where Flask is running should show:
   # * Running on http://0.0.0.0:5000
   
   # Or test connection:
   curl http://localhost:5000/api/health
   ```

2. **Verify environment variables**:
   ```bash
   # Check .env.local
   echo $ML_API_URL
   # Should show: http://localhost:5000
   ```

3. **Check network connectivity**:
   ```bash
   # Ping the Flask server
   ping localhost
   # Port should be open
   lsof -i :5000
   ```

4. **Restart both servers**:
   ```bash
   # Kill Flask process
   pkill -f "python app.py"
   
   # Kill Node process
   npm run dev  # Restart Next.js
   
   # Restart Flask
   python app.py
   ```

### Issue 2: "Models not trained yet"

**Symptoms**:
- Error when trying to analyze user
- Status shows `training_complete: false`

**Solutions**:

1. **Generate training data**:
   ```bash
   # Call this endpoint once
   curl -X POST http://localhost:5000/api/ml/generate-training-data
   
   # Or through admin endpoint if exposed
   ```

2. **Check training progress**:
   ```bash
   # In browser console
   import { mlAPI } from '@/utils/mlClient';
   await mlAPI.getStatus();
   ```

3. **Wait for training**:
   - Initial training takes 30-60 seconds
   - Don't restart servers during training

### Issue 3: "No measures found for user"

**Symptoms**:
- Analysis returns empty error
- No health score shown
- Goal analysis fails

**Solutions**:

1. **Add measurements first**:
   - Go to Dashboard > Add Measurement
   - Add at least one weight measurement

2. **Verify measures exist**:
   ```typescript
   // In browser console
   const res = await fetch('/api/measures');
   const data = await res.json();
   console.log(data.measures);
   ```

3. **Check measurement data**:
   ```typescript
   // Ensure measures have required fields:
   // - idUser
   // - type
   // - value
   // - timestamp
   ```

### Issue 4: "Goal analysis returns empty insights"

**Symptoms**:
- Goals page doesn't show AI tips
- Goal analysis endpoint returns null

**Solutions**:

1. **Check goal creation**:
   - Ensure goal has all required fields
   - Goal type must match enum (WEIGHT_LOSS, etc.)

2. **Verify matching measures**:
   - For WEIGHT_LOSS goal: Need weight measurements
   - For HEART_HEALTH: Need blood pressure measurements

3. **Check date ranges**:
   ```typescript
   // Goal startDate should be <= today
   // Goal endDate should be >= today
   ```

4. **Fetch analysis manually**:
   ```typescript
   import { mlAPI } from '@/utils/mlClient';
   const analysis = await mlAPI.analyzeGoalProgress(measures, goals);
   console.log(analysis);
   ```

### Issue 5: "Analysis is slow (>5 seconds)"

**Symptoms**:
- ML endpoints taking too long
- Timeout errors on reports

**Solutions**:

1. **Check measure count**:
   ```typescript
   // Too many measures can slow analysis
   // Limit to 200 most recent:
   const res = await fetch('/api/measures?limit=200');
   ```

2. **Optimize forecast period**:
   ```typescript
   // Longer forecasts are slower
   const report = await mlAPI.generateFullReport(
     measures,
     goals,
     profile,
     7  // Use 7 instead of 30
   );
   ```

3. **Check Flask server performance**:
   ```bash
   # Monitor Flask logs for slow operations
   # Check CPU and memory usage
   ```

4. **Reduce goal complexity**:
   - Fewer goals = faster analysis
   - Simplify goal date ranges

### Issue 6: "Health score always 100 or 0"

**Symptoms**:
- Score doesn't change with measurements
- Always shows extreme values

**Solutions**:

1. **Add diverse measurements**:
   - Need multiple types (weight, BP, glucose, etc.)
   - Need multiple data points over time

2. **Check anomaly thresholds**:
   - Health score based on anomalies detected
   - Add measurements outside normal ranges

3. **Verify measure validity**:
   ```typescript
   // Ensure values are realistic:
   // Weight: 30-200 kg
   // BP: 60-200 mmHg
   // Glucose: 40-400 mg/dL
   ```

### Issue 7: "403 Unauthorized on ML endpoints"

**Symptoms**:
- Getting 401/403 errors from ML API routes
- Session not found error

**Solutions**:

1. **Check authentication**:
   ```typescript
   // Ensure user is logged in
   const session = await getSession();
   if (!session) {
     // Redirect to login
   }
   ```

2. **Verify session cookie**:
   - Check browser dev tools > Application > Cookies
   - NextAuth session should be present

3. **Check NextAuth config**:
   - Verify auth configuration in `[...nextauth].ts`
   - Ensure session is properly serialized

## 🔍 Debug Mode

Enable debug logging:

```typescript
// utils/mlClient.ts - Add debug logging
async function fetchFromML<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${ML_API_BASE}${endpoint}`;
  
  // Debug log
  console.log('🔍 ML Request:', {
    url,
    method: options.method || 'GET',
    body: options.body
  });

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  // Debug log response
  console.log('🔍 ML Response:', {
    status: response.status,
    statusText: response.statusText,
  });

  return response.json();
}
```

## 📋 Debug Checklist

When issues occur, verify:

- ✓ Flask server running on `:5000`
- ✓ Models trained (check `/api/ml/status`)
- ✓ User has measurements
- ✓ Environment variables set
- ✓ User is authenticated
- ✓ Network connectivity
- ✓ Browser console for errors
- ✓ Flask server logs for details
- ✓ Database connection (if using MongoDB)
- ✓ No syntax errors in recent changes

## 🚀 Performance Optimization Tips

### 1. Limit Measures in Analysis
```typescript
// Instead of all measures
const allMeasures = await fetch('/api/measures?limit=1000');

// Use limited set
const recentMeasures = await fetch('/api/measures?limit=100');
```

### 2. Cache ML Results
```typescript
// Add caching layer
const cache = new Map();

export async function getAnalysisWithCache(userId: string) {
  const key = `analysis_${userId}`;
  
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const analysis = await mlAPI.analyzeUserHealth([]);
  cache.set(key, analysis);
  
  // Invalidate after 5 minutes
  setTimeout(() => cache.delete(key), 5 * 60 * 1000);
  
  return analysis;
}
```

### 3. Use Shorter Forecast Periods
```typescript
// Default 7 days is usually sufficient
// 30+ day forecasts are slower

const report = await mlAPI.generateFullReport(
  measures,
  goals,
  profile,
  7  // Keep at 7 for better performance
);
```

### 4. Batch ML Requests
```typescript
// Don't fire requests in parallel
// Sequential is faster for shared resources

const analysis = await mlAPI.analyzeUserHealth(measures);
const trends = await mlAPI.predictTrends(measures);
const report = await mlAPI.generateFullReport(measures, goals);
```

## 📞 Getting Help

If issues persist:

1. **Check Logs**:
   - Flask server console
   - Browser dev tools console
   - Next.js terminal output

2. **Verify Configuration**:
   - `.env.local` settings
   - Flask `app.py` settings
   - Database connection

3. **Test Endpoints Directly**:
   ```bash
   # Test Flask endpoint directly
   curl http://localhost:5000/api/ml/status
   
   # Test Next.js endpoint
   curl http://localhost:3000/api/ml/status
   ```

4. **Check Recent Changes**:
   - Review git diff for recent modifications
   - Verify no breaking changes introduced

5. **Reset and Retry**:
   - Clear browser cache
   - Restart both servers
   - Regenerate training data if needed

---

**Remember**: Most issues are resolved by ensuring Flask is running and models are trained!
