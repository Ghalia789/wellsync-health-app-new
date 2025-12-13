/* eslint-disable @typescript-eslint/no-explicit-any */
// components/Analysis/SleepStressAnalysis.tsx
"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface SleepStressAnalysisProps {
  userId: string;
  timeframe?: number; // days
}

export default function SleepStressAnalysis({ userId, timeframe = 30 }: SleepStressAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"overview" | "sleep" | "stress" | "correlation">("overview");

  useEffect(() => {
    fetchAnalysis();
  }, [timeframe]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/analysis/sleep-stress?timeframe=${timeframe}&analysis_type=all`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch analysis");
      }
      
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      toast.error("Failed to load analysis");
    } finally {
      setLoading(false);
    }
  };

  const formatScore = (score: number) => {
    return score.toFixed(1);
  };

  const getSleepQualityColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStressLevelColor = (score: number) => {
    if (score < 30) return "text-green-600";
    if (score < 50) return "text-yellow-600";
    if (score < 70) return "text-orange-600";
    return "text-red-600";
  };

  const renderOverview = () => {
    if (!analysis) return null;

    return (
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Sleep Score Avg</h3>
            <p className={`text-2xl font-bold ${getSleepQualityColor(analysis.sleep?.statistics?.mean || 0)}`}>
              {formatScore(analysis.sleep?.statistics?.mean || 0)}
            </p>
            <p className="text-xs text-gray-500">Last {timeframe} days</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Stress Score Avg</h3>
            <p className={`text-2xl font-bold ${getStressLevelColor(analysis.stress?.statistics?.mean || 0)}`}>
              {formatScore(analysis.stress?.statistics?.mean || 0)}
            </p>
            <p className="text-xs text-gray-500">Last {timeframe} days</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Optimal Sleep Days</h3>
            <p className="text-2xl font-bold text-blue-600">
              {analysis.sleep?.statistics?.optimal_days || 0}
            </p>
            <p className="text-xs text-gray-500">
              {analysis.sleep?.statistics?.total_days ? 
                `${Math.round((analysis.sleep.statistics.optimal_days / analysis.sleep.statistics.total_days) * 100)}% of days` : 
                'No data'}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Correlation</h3>
            <p className="text-2xl font-bold">
              {analysis.correlation?.correlation_coefficient ? 
                formatScore(analysis.correlation.correlation_coefficient) : 'N/A'}
            </p>
            <p className="text-xs text-gray-500">
              {analysis.correlation?.correlation_strength || 'Not available'}
            </p>
          </div>
        </div>

        {/* Quick Insights */}
        {analysis.quick_insights && analysis.quick_insights.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Quick Insights</h3>
            <ul className="space-y-1">
              {analysis.quick_insights.map((insight: string, idx: number) => (
                <li key={idx} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-sm text-blue-700">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sleep Recommendations */}
        {analysis.sleep?.recommendations && analysis.sleep.recommendations.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Sleep Recommendations</h3>
            <ul className="space-y-2">
              {analysis.sleep.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm text-green-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Stress Recommendations */}
        {analysis.stress?.recommendations && analysis.stress.recommendations.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-2">Stress Management Tips</h3>
            <ul className="space-y-2">
              {analysis.stress.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start">
                  <span className="text-orange-500 mr-2">💡</span>
                  <span className="text-sm text-orange-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderSleepAnalysis = () => {
    if (!analysis?.sleep || analysis.sleep.error) {
      return (
        <div className="text-center py-8 text-gray-500">
          {analysis?.sleep?.error || "No sleep analysis available"}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-gray-800 mb-4">Sleep Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className={`text-xl font-bold ${getSleepQualityColor(analysis.sleep.statistics.mean)}`}>
                {formatScore(analysis.sleep.statistics.mean)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Best Day</p>
              <p className="text-xl font-bold text-green-600">
                {formatScore(analysis.sleep.statistics.max)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Worst Day</p>
              <p className="text-xl font-bold text-red-600">
                {formatScore(analysis.sleep.statistics.min)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Consistency</p>
              <p className="text-xl font-bold">
                {formatScore(100 - analysis.sleep.statistics.std)}%
              </p>
            </div>
          </div>
        </div>

        {/* Trends */}
        {analysis.sleep.trends && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-gray-800 mb-4">Trends</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Daily Trend:</span>
                <span className={`font-medium ${
                  analysis.sleep.trends.daily_trend > 0.1 ? 'text-green-600' : 
                  analysis.sleep.trends.daily_trend < -0.1 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {analysis.sleep.trends.daily_trend > 0.1 ? 'Improving' : 
                   analysis.sleep.trends.daily_trend < -0.1 ? 'Declining' : 'Stable'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Weekly Trend:</span>
                <span className={`font-medium ${
                  analysis.sleep.trends.weekly_trend > 0.1 ? 'text-green-600' : 
                  analysis.sleep.trends.weekly_trend < -0.1 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {analysis.sleep.trends.weekly_trend > 0.1 ? 'Improving' : 
                   analysis.sleep.trends.weekly_trend < -0.1 ? 'Declining' : 'Stable'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Patterns */}
        {analysis.sleep.patterns && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-gray-800 mb-4">Patterns</h3>
            
            {analysis.sleep.patterns.weekend_vs_weekday && 
             !analysis.sleep.patterns.weekend_vs_weekday.message && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Weekend vs Weekday</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Weekend Average</p>
                    <p className="text-lg font-semibold">
                      {formatScore(analysis.sleep.patterns.weekend_vs_weekday.weekend_avg)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Weekday Average</p>
                    <p className="text-lg font-semibold">
                      {formatScore(analysis.sleep.patterns.weekend_vs_weekday.weekday_avg)}
                    </p>
                  </div>
                </div>
                {analysis.sleep.patterns.weekend_vs_weekday.difference > 5 && (
                  <p className="text-sm text-blue-600 mt-2">
                    You sleep better on weekends by {formatScore(analysis.sleep.patterns.weekend_vs_weekday.difference)} points
                  </p>
                )}
              </div>
            )}

            {analysis.sleep.patterns.best_sleep_conditions && 
             analysis.sleep.patterns.best_sleep_conditions.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Best Sleep Conditions</h4>
                <div className="space-y-3">
                  {analysis.sleep.patterns.best_sleep_conditions.map((day: any, idx: number) => (
                    <div key={idx} className="bg-green-50 p-3 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">Score: {day.score}</span>
                        <span className="text-sm text-gray-600">
                          Bedtime: {day.conditions.bedtime || 'N/A'}
                        </span>
                      </div>
                      {day.conditions.factors && (
                        <div className="text-sm text-gray-600">
                          Factors: {Object.entries(day.conditions.factors)
                            .filter(([_, value]) => value)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderStressAnalysis = () => {
    if (!analysis?.stress || analysis.stress.error) {
      return (
        <div className="text-center py-8 text-gray-500">
          {analysis?.stress?.error || "No stress analysis available"}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-gray-800 mb-4">Stress Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className={`text-xl font-bold ${getStressLevelColor(analysis.stress.statistics.mean)}`}>
                {formatScore(analysis.stress.statistics.mean)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">High Stress Days</p>
              <p className="text-xl font-bold text-orange-600">
                {analysis.stress.statistics.high_stress_days}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Low Stress Days</p>
              <p className="text-xl font-bold text-green-600">
                {analysis.stress.statistics.low_stress_days}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Volatility</p>
              <p className="text-xl font-bold">
                {formatScore(analysis.stress.statistics.std)}
              </p>
            </div>
          </div>
        </div>

        {/* Triggers */}
        {analysis.stress.triggers_analysis && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-gray-800 mb-4">Common Stress Triggers</h3>
            <div className="space-y-3">
              {analysis.stress.triggers_analysis.most_common_triggers.map((trigger: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{trigger.trigger}</p>
                    <p className="text-sm text-gray-600">
                      Average stress: {formatScore(trigger.average_stress)} ({trigger.severity})
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {trigger.count} times
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coping Strategies */}
        {analysis.stress.coping_effectiveness && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-gray-800 mb-4">Coping Strategy Effectiveness</h3>
            
            {analysis.stress.coping_effectiveness.most_effective_strategies && 
             analysis.stress.coping_effectiveness.most_effective_strategies.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-green-700 mb-2">Most Effective</h4>
                <div className="space-y-2">
                  {analysis.stress.coping_effectiveness.most_effective_strategies.map((strategy: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="font-medium">{strategy.strategy}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-700">
                          Avg stress: {formatScore(strategy.average_stress_score)}
                        </p>
                        <p className="text-xs text-gray-600">Used {strategy.frequency} times</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recovery Patterns */}
        {analysis.stress.trends?.recovery_pattern && 
         !analysis.stress.trends.recovery_pattern.message && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-gray-800 mb-4">Stress Recovery</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Stress Spikes Detected:</span>
                <span className="font-medium">
                  {analysis.stress.trends.recovery_pattern.total_spikes}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Average Recovery:</span>
                <span className={`font-medium ${
                  analysis.stress.trends.recovery_pattern.recovery_efficiency === 'Good' ? 'text-green-600' :
                  analysis.stress.trends.recovery_pattern.recovery_efficiency === 'Moderate' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {formatScore(analysis.stress.trends.recovery_pattern.average_recovery_percentage)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Recovery Efficiency:</span>
                <span className={`font-medium ${
                  analysis.stress.trends.recovery_pattern.recovery_efficiency === 'Good' ? 'text-green-600' :
                  analysis.stress.trends.recovery_pattern.recovery_efficiency === 'Moderate' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {analysis.stress.trends.recovery_pattern.recovery_efficiency}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCorrelation = () => {
    if (!analysis?.correlation || analysis.correlation.error) {
      return (
        <div className="text-center py-8 text-gray-500">
          {analysis?.correlation?.error || "No correlation analysis available"}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Correlation Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-gray-800 mb-4">Sleep-Stress Relationship</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Correlation Strength</h4>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full ${
                      Math.abs(analysis.correlation.correlation_coefficient) > 0.7 ? 'bg-red-500' :
                      Math.abs(analysis.correlation.correlation_coefficient) > 0.4 ? 'bg-yellow-500' :
                      Math.abs(analysis.correlation.correlation_coefficient) > 0.2 ? 'bg-blue-500' :
                      'bg-gray-300'
                    }`}
                    style={{ width: `${Math.min(100, Math.abs(analysis.correlation.correlation_coefficient) * 100)}%` }}
                  ></div>
                </div>
                <span className="ml-4 font-bold">
                  {formatScore(analysis.correlation.correlation_coefficient)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {analysis.correlation.correlation_strength} correlation
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Interpretation</h4>
              <p className="text-sm text-gray-700">
                {analysis.correlation.correlation_coefficient < -0.3 
                  ? "Better sleep is associated with lower stress levels"
                  : analysis.correlation.correlation_coefficient > 0.3
                  ? "Poorer sleep is associated with higher stress levels"
                  : "No clear relationship between sleep and stress"}
              </p>
            </div>
          </div>
        </div>

        {/* Lag Effects */}
        {analysis.correlation.lag_analysis && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-gray-800 mb-4">Time Lag Effects</h3>
            {analysis.correlation.lag_analysis.insights && 
             analysis.correlation.lag_analysis.insights.length > 0 ? (
              <div className="space-y-3">
                {analysis.correlation.lag_analysis.insights.map((insight: string, idx: number) => (
                  <div key={idx} className="flex items-start p-3 bg-blue-50 rounded">
                    <span className="text-blue-500 mr-2">↔</span>
                    <span className="text-sm text-blue-700">{insight}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No significant lag effects detected</p>
            )}
          </div>
        )}

        {/* Prediction */}
        {analysis.correlation.prediction && !analysis.correlation.prediction.error && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-gray-800 mb-4">Potential Impact</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Current Avg Stress</p>
                  <p className="text-xl font-bold">
                    {formatScore(analysis.correlation.prediction.current_avg_stress)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">With Better Sleep</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatScore(analysis.correlation.prediction.predicted_stress_with_improvement)}
                  </p>
                </div>
              </div>
              
              {analysis.correlation.prediction.estimated_stress_reduction > 0 && (
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-green-700 font-medium">
                    Improving sleep by 10 points could reduce stress by{' '}
                    {formatScore(analysis.correlation.prediction.estimated_stress_reduction)} points
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Insights */}
        {analysis.correlation.insights && analysis.correlation.insights.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-gray-800 mb-4">Key Insights</h3>
            <div className="space-y-2">
              {analysis.correlation.insights.map((insight: string, idx: number) => (
                <div key={idx} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-700">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--mint-500)]"></div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analysis data available</p>
        <button
          onClick={fetchAnalysis}
          className="mt-4 bg-[var(--mint-500)] text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Sleep & Stress Analysis</h2>
            <p className="text-sm text-gray-600">
              Last {timeframe} days • Updated {new Date(analysis.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => timeframe !== 7 && fetchAnalysisWithTimeframe(7)}
              className={`px-3 py-1 text-sm rounded ${
                timeframe === 7 
                  ? 'bg-[var(--mint-500)] text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              7 days
            </button>
            <button
              onClick={() => timeframe !== 30 && fetchAnalysisWithTimeframe(30)}
              className={`px-3 py-1 text-sm rounded ${
                timeframe === 30 
                  ? 'bg-[var(--mint-500)] text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              30 days
            </button>
            <button
              onClick={() => timeframe !== 90 && fetchAnalysisWithTimeframe(90)}
              className={`px-3 py-1 text-sm rounded ${
                timeframe === 90 
                  ? 'bg-[var(--mint-500)] text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              90 days
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex overflow-x-auto">
          <button
            onClick={() => setSelectedTab("overview")}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              selectedTab === "overview"
                ? "border-b-2 border-[var(--mint-500)] text-[var(--mint-600)]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab("sleep")}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              selectedTab === "sleep"
                ? "border-b-2 border-[var(--mint-500)] text-[var(--mint-600)]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sleep Analysis
          </button>
          <button
            onClick={() => setSelectedTab("stress")}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              selectedTab === "stress"
                ? "border-b-2 border-[var(--mint-500)] text-[var(--mint-600)]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Stress Analysis
          </button>
          <button
            onClick={() => setSelectedTab("correlation")}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              selectedTab === "correlation"
                ? "border-b-2 border-[var(--mint-500)] text-[var(--mint-600)]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Relationship
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedTab === "overview" && renderOverview()}
        {selectedTab === "sleep" && renderSleepAnalysis()}
        {selectedTab === "stress" && renderStressAnalysis()}
        {selectedTab === "correlation" && renderCorrelation()}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <div>
            <p>Analysis based on {analysis.data_summary.sleep_entries} sleep entries and {analysis.data_summary.stress_entries} stress entries</p>
          </div>
          <button
            onClick={fetchAnalysis}
            className="flex items-center gap-2 text-[var(--mint-600)] hover:text-[var(--mint-700)]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Analysis
          </button>
        </div>
      </div>
    </div>
  );

  function fetchAnalysisWithTimeframe(days: number) {
    window.history.pushState({}, '', `?timeframe=${days}`);
    fetchAnalysis();
  }
}