/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "@/components/navbar/Navbar";
import MeasureForm from "@/components/form/MeasureForm";
import MeasureList from "@/components/measure/MeasureList";
import MeasureChart from "@/components/measure/MeasureChart";
import MLReportComponent from "@/components/MLReportComponent";
import SleepQuestionnaire from "@/components/form/SleepQuestionnaire";
import StressQuestionnaire from "@/components/form/StressQuestionnaire";
import { AlertTriangle } from "lucide-react";

type TabType = "overview" | "add" | "history" | "report";

/**
 * local goal->measure mapping (kept here for robustness).
 * You can remove this and import your shared mapping if you already have it.
 */
const goalMeasureMap: Record<string, string[]> = {
  WEIGHT_LOSS: ["weight"],
  MUSCLE_GAIN: ["weight"],
  MAINTENANCE: ["weight", "height"],
  HEART_HEALTH: ["blood_pressure"],
  SLEEP_IMPROVEMENT: ["sleep_score", "sleep_duration", "sleep_quality", "sleep_efficiency"],
  STRESS_REDUCTION: ["stress_score", "stress_health", "stress_level"],
  DIABETES_CONTROL: ["glucose"],
};

const DashboardPage = () => {
  const [message, setMessage] = useState("");
  const [selectedMeasure, setSelectedMeasure] = useState<any | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [chartType, setChartType] = useState("weight");
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [totalRecords, setTotalRecords] = useState<number | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [thisWeekCount, setThisWeekCount] = useState<number | null>(null);
  const [goalStatus, setGoalStatus] = useState<string | null>(null);

  // ML Analysis states
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [mlSummary, setMlSummary] = useState<string | null>(null);
  const [trends, setTrends] = useState<any>({});
  const [mlLoading, setMlLoading] = useState(false);

  // Goals & measures for checkpoint logic
  const [goals, setGoals] = useState<any[]>([]);
  const [measures, setMeasures] = useState<any[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // Checkpoint modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"sleep" | "stress" | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Derived flags
  const [hasSleepGoal, setHasSleepGoal] = useState(false);
  const [hasStressGoal, setHasStressGoal] = useState(false);
  const [sleepDoneToday, setSleepDoneToday] = useState(false);
  const [stressDoneToday, setStressDoneToday] = useState(false);

  // ---------- Helpers ----------
  function isSameLocalDate(a: string | Date, b: Date = new Date()) {
    try {
      const d1 = new Date(a);
      const d2 = new Date(b);
      return d1.getFullYear() === d2.getFullYear()
        && d1.getMonth() === d2.getMonth()
        && d1.getDate() === d2.getDate();
    } catch {
      return false;
    }
  }

  function measureTypesForGoalType(type: string) {
    return goalMeasureMap[type] || [];
  }

  // ---------- Fetchers ----------
  async function fetchGoals() {
    try {
      const res = await fetch("/api/goals");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load goals");
      setGoals(data.goals || []);
      return data.goals || [];
    } catch (err: any) {
      console.error("Failed to fetch goals:", err);
      setGoals([]);
      return [];
    }
  }

  // fetch overview stats + measures
  async function fetchOverviewStats() {
    setLoadingOverview(true);
    try {
      const res = await fetch(`/api/measures`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load measures");

      const loadedMeasures = data.measures || [];
      setMeasures(loadedMeasures);
      setTotalRecords(loadedMeasures.length);

      // current weight: latest weight entry
      const weightRes = await fetch(`/api/measures?type=weight&limit=1`);
      const weightData = await weightRes.json();
      let latestWeight: number | null = null;
      if (weightRes.ok && weightData.measures && weightData.measures.length) {
        latestWeight = Number(weightData.measures[0].value);
        setCurrentWeight(latestWeight);
      } else {
        setCurrentWeight(null);
      }

      // this week count
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const weekCount = loadedMeasures.filter((m: any) => new Date(m.timestamp).getTime() >= oneWeekAgo).length;
      setThisWeekCount(weekCount);

      // simple goal status heuristic: if last weight exists show On track
      setGoalStatus(latestWeight ? "On track" : "—");

      // Fetch ML analysis if measures exist
      if (loadedMeasures.length > 0) {
        await fetchMLAnalysis(loadedMeasures);
      }
    } catch (err) {
      console.error("Failed to load overview stats:", err);
      setTotalRecords(null);
      setCurrentWeight(null);
      setThisWeekCount(null);
      setGoalStatus(null);
    } finally {
      setLoadingOverview(false);
    }
  }

  // Fetch ML analysis
  async function fetchMLAnalysis(measuresArg?: any[]) {
    setMlLoading(true);
    try {
      const res = await fetch("/api/ml/analyze-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ measures: measuresArg || measures }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.warn("ML analysis failed:", data);
        return;
      }

      setHealthScore(data.health_score || null);
      setAnomalies(data.anomalies || []);
      setMlSummary(data.summary || null);
      setTrends(data.trends || {});
    } catch (err) {
      console.error("Failed to fetch ML analysis:", err);
    } finally {
      setMlLoading(false);
    }
  }

  // Check and update derived flags (goals present and today's checkpoints)
  function evaluateCheckpoints(currentGoals: any[], currentMeasures: any[]) {
    // determine if user has sleep/stress goals
    const hasSleep = (currentGoals || []).some((g: any) => g.type === "SLEEP_IMPROVEMENT" || (g.goal_type === "SLEEP_IMPROVEMENT"));
    const hasStress = (currentGoals || []).some((g: any) => g.type === "STRESS_REDUCTION" || (g.goal_type === "STRESS_REDUCTION"));
    setHasSleepGoal(hasSleep);
    setHasStressGoal(hasStress);

    // find today's measures for sleep and stress
    const sleepTypes = [
  "sleep_score",
  "sleep_duration",
  "sleep_quality",
  "sleep_efficiency"
];

const stressTypes = [
  "stress_score",
  "stress_health",
  "stress_level"
];

    const sleepFoundToday = (currentMeasures || []).some((m: any) =>
      sleepTypes.includes(m.type) && isSameLocalDate(m.timestamp)
    );
    const stressFoundToday = (currentMeasures || []).some((m: any) =>
      stressTypes.includes(m.type) && isSameLocalDate(m.timestamp)
    );

    setSleepDoneToday(Boolean(sleepFoundToday));
    setStressDoneToday(Boolean(stressFoundToday));
  }

  // Called after a questionnaire completes to refresh state
  async function refreshAfterCheckpoint() {
    try {
      await fetchGoals();
      await fetchOverviewStats();
      // small toast handled by questionnaire components probably
    } catch (err) {
      console.warn("Failed to refresh after checkpoint:", err);
    }
  }

  // ---------- Effects ----------
  useEffect(() => {
    const init = async () => {
      try {
        const dashRes = await fetch("/api/dashboard");
        const dashData = await dashRes.json();
        if (!dashRes.ok) throw new Error(dashData.error || "Unauthorized");
        setMessage(dashData.message || "Dashboard");

        const [loadedGoals] = await Promise.all([fetchGoals(), fetchOverviewStats()]);
        // evaluate after both loaded
      } catch (err: any) {
        console.error("❌ Dashboard error:", err.message || err);
        toast.error("⚠️ Error. Please try again later.");
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  // Re-evaluate checkpoints whenever measures or goals update
  useEffect(() => {
    evaluateCheckpoints(goals, measures);
  }, [goals, measures]);

  // ---------- Modal handlers ----------
  function openModal(type: "sleep" | "stress") {
    setModalType(type);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setModalType(null);
  }

  async function onQuestionnaireSaved() {
    toast.success("Checkpoint saved ✅");
    closeModal();
    setRefresh((v) => v + 1);
    await refreshAfterCheckpoint();
  }

  // ---------- UI pieces ----------
  const CuteButton = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-full shadow-sm transform transition hover:-translate-y-0.5 focus:outline-none"
      style={{
        background: "linear-gradient(90deg, var(--mint-500), var(--air-500))",
        color: "white",
        fontWeight: 600,
      }}
    >
      <span className="text-lg">{children}</span>
    </button>
  );

  const BadgeDone = ({ text }: { text: string }) => (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100">
      <span className="text-green-700 font-semibold">✔</span>
      <span className="text-sm text-green-800">{text}</span>
    </div>
  );

  // ---------- Render ----------
  if (!message) {
    return (
      <>
        <Navbar />
        <div className="text-gray-500 text-center mt-10 animate-pulse">Chargement...</div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--tea-900)] via-white to-[var(--azure-900)]">
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--mint-600)] mb-2">{message}</h1>
          <p className="text-gray-600">Track and monitor your health metrics</p>
        </div>

        {/* Top Row: Health Score + Daily Checkpoints (side-by-side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Health Score Card */}
          <div className="rounded-lg shadow p-6 text-white"
               style={{ background: "linear-gradient(90deg, var(--mint-500), var(--air-500))" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Overall Health Score</p>
                <p className="text-5xl font-bold mt-2">{healthScore !== null ? healthScore.toFixed(0) : "—"}</p>
                <p className="text-sm mt-2 opacity-90">{mlSummary || "Loading analysis..."}</p>
              </div>
              <div className="text-6xl opacity-40">💪</div>
            </div>
          </div>

          {/* Daily Checkpoints Card */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Daily Checkpoints</h3>
                <p className="text-sm text-gray-500 mt-1">Quick daily questionnaires for sleep & stress</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* STRESS */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Stress</p>
                  <p className="text-xs text-gray-500">Quick check to record today&apos;s stress</p>
                </div>

                <div>
                  {hasStressGoal ? (
                    stressDoneToday ? (
                      <BadgeDone text="Stress checkpoint completed today" />
                    ) : (
                      <button
                        onClick={() => openModal("stress")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-sm transform transition hover:-translate-y-0.5 focus:outline-none"
                        style={{
                          background: "linear-gradient(90deg, var(--air-400), var(--air-500))",
                          color: "white",
                          fontWeight: 700,
                        }}
                      >
                        <span>🧠 Take Stress Checkpoint</span>
                      </button>
                    )
                  ) : (
                    <div className="text-xs text-gray-400 italic">No stress goal</div>
                  )}
                </div>
              </div>

              <hr className="my-2" />

              {/* SLEEP */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Sleep</p>
                  <p className="text-xs text-gray-500">Record today&apos;s sleep questionnaire</p>
                </div>

                <div>
                  {hasSleepGoal ? (
                    sleepDoneToday ? (
                      <BadgeDone text="Sleep checkpoint completed today" />
                    ) : (
                      <button
                        onClick={() => openModal("sleep")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-sm transform transition hover:-translate-y-0.5 focus:outline-none"
                        style={{
                          background: "linear-gradient(90deg, var(--mint-500), var(--mint-400))",
                          color: "white",
                          fontWeight: 700,
                        }}
                      >
                        <span>💤 Take Sleep Checkpoint</span>
                      </button>
                    )
                  ) : (
                    <div className="text-xs text-gray-400 italic">No sleep goal</div>
                  )}
                </div>
              </div>

              {/* small help text */}
              <p className="text-xs text-gray-500 mt-3">
                Checkpoints appear only if you have a related goal. Completing a checkpoint saves measures
                and updates your daily progress.
              </p>
            </div>
          </div>
        </div>

        {/* Anomalies Alert */}
        {anomalies.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-500 mt-1 flex-shrink-0" size={20} />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">Health Alerts</h3>
                <div className="mt-2 space-y-2">
                  {anomalies.map((anomaly, idx) => (
                    <div key={idx} className="text-sm text-red-700">
                      <p className="font-medium">{anomaly.message}</p>
                      {anomaly.tip && <p className="text-xs mt-1 italic">{anomaly.tip}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[var(--mint-500)]">
            <p className="text-gray-600 text-sm font-medium">Total Records</p>
            <p className="text-3xl font-bold text-[var(--mint-500)] mt-2">{totalRecords !== null ? totalRecords : '—'}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[var(--air-500)]">
            <p className="text-gray-600 text-sm font-medium">Current Weight</p>
            <p className="text-3xl font-bold text-[var(--air-500)] mt-2">{currentWeight !== null ? `${currentWeight.toFixed(1)} kg` : '—'}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[var(--asp-500)]">
            <p className="text-gray-600 text-sm font-medium">Goal Status</p>
            <p className="text-3xl font-bold text-[var(--asp-500)] mt-2">{goalStatus ?? '—'}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[var(--gold-500)]">
            <p className="text-gray-600 text-sm font-medium">This Week</p>
            <p className="text-3xl font-bold text-[var(--gold-500)] mt-2">{thisWeekCount !== null ? thisWeekCount : '—'}</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Trends</h2>
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mr-3">View:</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mint-500)]"
            >
              <option value="weight">Weight</option>
              <option value="height">Height</option>
              <option value="blood_pressure">Blood Pressure</option>
              <option value="glucose">Glucose</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <MeasureChart type={chartType} width={540} height={120} />
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setActiveTab("add");
              setSelectedMeasure(null);
            }}
            className="bg-[var(--mint-500)] hover:bg-[var(--mint-400)] text-white px-6 py-3 rounded-lg font-medium transition"
          >
            + Add Measurement
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition"
          >
            View History
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className="bg-[var(--air-500)] hover:bg-[var(--air-400)] text-white px-6 py-3 rounded-lg font-medium transition"
          >
            📊 Full Report
          </button>
        </div>

        {/* Add / History / Report Tabs */}
        {activeTab === "add" && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Add New Measurement</h2>
              <button onClick={() => setActiveTab("overview")} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            </div>
            <MeasureForm
              initial={selectedMeasure}
              onSaved={() => {
                setRefresh((v) => v + 1);
                setActiveTab("overview");
                setSelectedMeasure(null);
              }}
              onCancel={() => {
                setActiveTab("overview");
                setSelectedMeasure(null);
              }}
            />
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Measurement History</h2>
              <button onClick={() => setActiveTab("overview")} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            </div>
            <MeasureList
              onEdit={(m) => {
                setSelectedMeasure(m);
                setActiveTab("add");
              }}
              refreshToggle={refresh}
            />
          </div>
        )}

        {activeTab === "report" && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <MLReportComponent onClose={() => setActiveTab("overview")} />
          </div>
        )}
      </div>

      {/* ---------- Modal (custom Tailwind) ---------- */}
      {showModal && modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              // clicking outside closes modal
              closeModal();
            }}
          />
          <div className="relative z-50 w-full max-w-3xl mx-4">
            <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl overflow-auto max-h-[85vh]">
              {/* header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {modalType === "sleep" ? "Sleep Checkpoint" : "Stress Checkpoint"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Answer a few quick questions to log today&apos;s {modalType}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      closeModal();
                    }}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* body */}
              <div className="p-6">
                {modalType === "sleep" && (
                  <SleepQuestionnaire
                    onSaved={async () => {
                      await onQuestionnaireSaved();
                    }}
                    onCancel={() => {
                      closeModal();
                    }}
                  />
                )}

                {modalType === "stress" && (
                  <StressQuestionnaire
                    onSaved={async () => {
                      await onQuestionnaireSaved();
                    }}
                    onCancel={() => {
                      closeModal();
                    }}
                  />
                )}
              </div>

              {/* footer */}
              <div className="px-6 py-4 border-t text-right">
                <button
                  onClick={() => closeModal()}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
