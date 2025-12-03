/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Clock,
} from "lucide-react";

interface MLReport {
  generated_at: string;
  summary: string;
  health_score: number;
  anomalies: any[];
  trends: Record<string, any>;
  goals: any[];
  tips: string[];
  profile: any;
}

interface MLReportProps {
  onClose?: () => void;
}

const MLReportComponent: React.FC<MLReportProps> = ({ onClose }) => {
  const [report, setReport] = useState<MLReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ml/full-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate report");
      }

      setReport(data.report || data);
      toast.success("📊 Report generated successfully!");
    } catch (err: any) {
      const errorMsg = err.message || "Failed to generate report";
      setError(errorMsg);
      console.error("Report error:", err);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--mint-500)] mx-auto mb-4"></div>
          <p className="text-gray-600">Generating comprehensive report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-red-500" size={24} />
          <h3 className="text-lg font-semibold text-red-800">Error</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchReport}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12 text-gray-500">
        No report data available
      </div>
    );
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-50";
    if (score >= 60) return "bg-yellow-50";
    if (score >= 40) return "bg-orange-50";
    return "bg-red-50";
  };

  return (
    <div className="space-y-6">
      {/* Header with Close Button */}
      {onClose && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Health Report</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>
      )}

      {/* Generated At */}
      <div className="text-xs text-gray-500">
        Generated: {new Date(report.generated_at).toLocaleString()}
      </div>

      {/* Health Score Card */}
      <div
        className={`rounded-lg p-8 ${getHealthScoreBg(report.health_score)}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Overall Health Score</p>
            <p className={`text-6xl font-bold mt-2 ${getHealthScoreColor(report.health_score)}`}>
              {Math.round(report.health_score)}
            </p>
            <p className="text-base mt-3 text-gray-700 font-semibold">
              {report.summary}
            </p>
          </div>
          <div className="text-7xl opacity-30">💚</div>
        </div>
      </div>

      {/* Critical Alerts */}
      {report.anomalies && report.anomalies.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" />
            Health Alerts
          </h3>
          <div className="space-y-2">
            {report.anomalies.map((anomaly: any, idx: number) => (
              <div
                key={idx}
                className={`border-l-4 p-4 rounded ${
                  anomaly.severity === "high"
                    ? "bg-red-50 border-red-500"
                    : anomaly.severity === "medium"
                    ? "bg-orange-50 border-orange-500"
                    : "bg-yellow-50 border-yellow-500"
                }`}
              >
                <p
                  className={`font-medium ${
                    anomaly.severity === "high"
                      ? "text-red-800"
                      : anomaly.severity === "medium"
                      ? "text-orange-800"
                      : "text-yellow-800"
                  }`}
                >
                  {anomaly.message}
                </p>
                {anomaly.tip && (
                  <p
                    className={`text-sm mt-1 ${
                      anomaly.severity === "high"
                        ? "text-red-700"
                        : anomaly.severity === "medium"
                        ? "text-orange-700"
                        : "text-yellow-700"
                    }`}
                  >
                    💡 {anomaly.tip}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends Analysis */}
      {report.trends && Object.keys(report.trends).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            Measurement Trends
          </h3>
          <div className="space-y-3">
            {Object.entries(report.trends).map(([measureType, trendData]: [string, any]) => (
              <div key={measureType} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="font-semibold text-blue-900 capitalize">
                  {measureType.replace(/_/g, " ")}
                </p>
                {trendData.method && (
                  <p className="text-xs text-blue-700 mt-1">
                    Method: {trendData.method}
                  </p>
                )}
                {trendData.slope_per_sec !== undefined && (
                  <p className="text-sm text-blue-800 mt-2 flex items-center gap-2">
                    {trendData.slope_per_sec > 0 ? (
                      <>
                        <TrendingUp size={16} className="text-orange-500" />
                        Increasing trend
                      </>
                    ) : (
                      <>
                        <TrendingDown size={16} className="text-green-500" />
                        Decreasing trend
                      </>
                    )}
                  </p>
                )}
                {trendData.forecast && trendData.forecast.length > 0 && (
                  <p className="text-xs text-blue-700 mt-2">
                    📈 Forecast available for next 7 days
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Progress */}
      {report.goals && report.goals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Activity size={20} className="text-purple-500" />
            Goal Analysis
          </h3>
          <div className="space-y-3">
            {report.goals.map((goal: any, idx: number) => (
              <div key={idx} className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-purple-900 capitalize">
                    {goal.goal_type?.replace(/_/g, " ")}
                  </p>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      goal.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {goal.status}
                  </span>
                </div>

                <p className="text-sm text-purple-800 mb-2">
                  Current: <span className="font-semibold">{goal.current?.toFixed(2)}</span> / Target:{" "}
                  <span className="font-semibold">{goal.target?.toFixed(2)}</span>
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-gray-300 rounded-full h-2 mb-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all"
                    style={{
                      width: `${Math.min(100, goal.progress_pct)}%`,
                    }}
                  />
                </div>

                <p className="text-xs text-purple-700 mb-3">
                  {goal.progress_pct?.toFixed(1)}% complete
                </p>

                {/* Tips */}
                {goal.tips && goal.tips.length > 0 && (
                  <div className="bg-white rounded p-2 border border-purple-200">
                    <p className="text-xs font-medium text-purple-800 mb-1">💡 Tips:</p>
                    <ul className="text-xs text-purple-700 space-y-1">
                      {goal.tips.slice(0, 2).map((tip: string, tipIdx: number) => (
                        <li key={tipIdx} className="list-disc list-inside">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report.tips && report.tips.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" />
            Personalized Recommendations
          </h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
            {report.tips.map((tip: string, idx: number) => (
              <div key={idx} className="flex gap-3">
                <CheckCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-900">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="flex gap-2 justify-end pt-4 border-t">
        <button
          onClick={fetchReport}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
        >
          🔄 Refresh Report
        </button>
        <button
          onClick={() => window.print()}
          className="bg-[var(--mint-500)] hover:bg-[var(--mint-400)] text-white px-4 py-2 rounded-lg transition"
        >
          🖨️ Print Report
        </button>
      </div>
    </div>
  );
};

export default MLReportComponent;
