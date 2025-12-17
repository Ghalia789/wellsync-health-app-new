/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ML API Client Service
 * Handles all communication with the Flask ML API
 */

const ML_API_BASE = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:5000';

// ===== TYPE DEFINITIONS =====

export interface Measure {
  idUser?: string;
  type: string;
  value: number;
  unit?: string;
  timestamp?: string | Date;
  notes?: string;
}

export interface Goal {
  _id?: string;
  userId?: string;
  type: 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTENANCE' | 'HEART_HEALTH' | 'SLEEP_IMPROVEMENT' | 'STRESS_REDUCTION' | 'DIABETES_CONTROL';
  description: string;
  startDate: string | Date;
  endDate: string | Date;
  targetValue: number;
  currentValue?: number;
  progress?: number;
}

export interface UserProfile {
  userId?: string;
  currentWeight?: number;
  currentHeight?: number;
  age?: number;
  gender?: string;
  medicalHistory?: string[];
}

export interface Anomaly {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  tip?: string;
}

export interface Trend {
  method: 'prophet' | 'linear_fallback';
  forecast: Array<{ ds: string; yhat: number }>;
  [key: string]: any;
}

export interface GoalAnalysis {
  goal_type: string;
  measure_type: string;
  current: number;
  target: number;
  direction: string;
  progress_pct: number;
  status: string;
  tips: string[];
  error?: string;
}

export interface HealthAnalysis {
  anomalies: Anomaly[];
  health_score: number;
  summary: string;
  trends: Record<string, Trend>;
  goals: GoalAnalysis[];
  profile?: UserProfile;
}

export interface FullReport {
  generated_at: string;
  summary: string;
  health_score: number;
  anomalies: Anomaly[];
  trends: Record<string, Trend>;
  goals: GoalAnalysis[];
  tips: string[];
  profile: UserProfile;
}

export interface MLStatus {
  system: string;
  version: string;
  models_trained: boolean;
  training_complete: boolean;
  last_training_date: string | null;
  synthetic_data_available: boolean;
  timestamp: string;
  total_users?: number;
  total_measures?: number;
}

// ===== ERROR HANDLING =====

export class MLAPIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'MLAPIError';
  }
}

// ===== UTILITY FUNCTIONS =====

async function fetchFromML<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const url = `${ML_API_BASE}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new MLAPIError(
        response.status,
        data.error || `ML API Error: ${response.statusText}`,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof MLAPIError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new MLAPIError(
        0,
        `Failed to connect to ML API at ${ML_API_BASE}. Is the server running?`,
        error
      );
    }

    throw new MLAPIError(500, 'Unknown error communicating with ML API', error);
  }
}

// ===== SYSTEM ENDPOINTS =====

export const mlAPI = {
  /**
   * Check ML system status
   */
  async getStatus(): Promise<MLStatus> {
    return fetchFromML<MLStatus>('/api/ml/status');
  },

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; service: string; timestamp: string }> {
    return fetchFromML('/api/health');
  },

  // ===== TRAINING & DATA GENERATION =====

  /**
   * Generate synthetic training data and train models
   * Call this once to initialize the system
   */
  async generateTrainingData(): Promise<{
    message: string;
    training_date: string;
    dataset_stats: {
      total_users: number;
      total_measures: number;
      train_users: number;
      val_users: number;
      test_users: number;
    };
    initial_evaluation: any;
  }> {
    return fetchFromML('/api/ml/generate-training-data', {
      method: 'POST',
    });
  },

  // ===== USER ANALYSIS ENDPOINTS =====

  /**
   * Comprehensive health analysis for a user
   * Includes anomalies, health score, trends, and goal insights
   */
  async analyzeUserHealth(
    measures: Measure[],
    goals?: Goal[],
    profile?: UserProfile
  ): Promise<HealthAnalysis> {
    return fetchFromML('/api/ml/analyze-user', {
      method: 'POST',
      body: JSON.stringify({
        measures,
        goals,
        profile,
      }),
    });
  },

  // ===== GOAL ANALYSIS ENDPOINTS =====

  /**
   * Analyze progress toward specific health goals
   */
  async analyzeGoalProgress(
    measures: Measure[],
    goals: Goal[]
  ): Promise<{
    user_id: string;
    goals_analyzed: number;
    insights: GoalAnalysis[];
    analysis_date: string;
  }> {
    return fetchFromML('/api/ml/goal-progress', {
      method: 'POST',
      body: JSON.stringify({
        measures,
        goals,
      }),
    });
  },

  /**
   * Get actionable tips for specific goals
   */
  async getGoalTips(measures: Measure[], goal: Goal): Promise<{
    insights: GoalAnalysis[];
    analysis_date: string;
  }> {
    return fetchFromML('/api/ml/goal-tips', {
      method: 'POST',
      body: JSON.stringify({
        measures,
        goal,
      }),
    });
  },

  /**
   * Get trend forecast for a specific goal type
   */
  async getGoalTrends(measures: Measure[], goalType: string): Promise<{
    measure_type: string;
    trend: Trend;
    analysis_date: string;
  }> {
    return fetchFromML('/api/ml/goal-trends', {
      method: 'POST',
      body: JSON.stringify({
        measures,
        goal_type: goalType,
      }),
    });
  },

  // ===== PREDICTION ENDPOINTS =====

  /**
   * Predict health trends based on historical measures
   */
  async predictTrends(measures: Measure[]): Promise<{
    user_id: string;
    trends: Record<string, Trend>;
    prediction_date: string;
  }> {
    return fetchFromML('/api/ml/predict-trends', {
      method: 'POST',
      body: JSON.stringify({
        measures,
      }),
    });
  },

  // ===== COMPREHENSIVE REPORT =====

  /**
   * Generate a full comprehensive report
   * Combines: summary, anomalies, trends, goals, tips
   */
  async generateFullReport(
    measures: Measure[],
    goals?: Goal[],
    profile?: UserProfile,
    forecastDays: number = 7
  ): Promise<FullReport> {
    return fetchFromML('/api/ml/full-report', {
      method: 'POST',
      body: JSON.stringify({
        measures,
        goals,
        profile,
        forecast_days: forecastDays,
      }),
    });
  },

  // ===== ADMIN ENDPOINTS =====

  /**
   * Get comprehensive admin model status
   */
  async getAdminModelStatus(): Promise<{
    models_trained: boolean;
    training_complete: boolean;
    last_training_date: string | null;
    synthetic_data_available: boolean;
    monitoring_active: boolean;
    system_status: string;
    timestamp: string;
    performance?: any;
  }> {
    return fetchFromML('/api/admin/model/status');
  },

  /**
   * Run comprehensive model evaluation
   */
  async evaluateModels(): Promise<{
    message: string;
    results: any;
  }> {
    return fetchFromML('/api/admin/model/evaluate', {
      method: 'POST',
    });
  },

  /**
   * Get performance dashboard data
   */
  async getPerformanceDashboard(): Promise<any> {
    return fetchFromML('/api/admin/model/performance-dashboard');
  },

  /**
   * Generate comprehensive performance report
   */
  async generatePerformanceReport(): Promise<any> {
    return fetchFromML('/api/admin/model/performance-report');
  },

  /**
   * Retrain models with current data
   */
  async retrainModels(): Promise<{
    message: string;
    retraining_date: string;
    evaluation_results: any;
  }> {
    return fetchFromML('/api/admin/model/retrain', {
      method: 'POST',
    });
  },
};

export default mlAPI;
