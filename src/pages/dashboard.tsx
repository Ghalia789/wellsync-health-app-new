/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Navbar from "@/components/navbar/Navbar";
import MeasureForm from "@/components/form/MeasureForm";
import MeasureList from "@/components/measure/MeasureList";
import MeasureChart from "@/components/measure/MeasureChart";

type TabType = "overview" | "add" | "history";

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
  const router = useRouter();

  // fetch overview stats (moved above effect to satisfy hook deps)
  async function fetchOverviewStats() {
    try {
      // fetch a reasonable number of measures (dev assumption: user has <1000 records)
      const res = await fetch(`/api/measures?limit=1000`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load measures");

      const measures = data.measures || [];
      setTotalRecords(measures.length);

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
      const weekCount = measures.filter((m: any) => new Date(m.timestamp).getTime() >= oneWeekAgo).length;
      setThisWeekCount(weekCount);

      // simple goal status heuristic: if last weight exists show On track
      setGoalStatus(latestWeight ? "On track" : "—");
    } catch (err) {
      console.error("Failed to load overview stats:", err);
      setTotalRecords(null);
      setCurrentWeight(null);
      setThisWeekCount(null);
      setGoalStatus(null);
    }
  }

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Unauthorized");
        }

        setMessage(data.message);
      } catch (err: any) {
        const errorMsg = err.message || "Unknown error";
        console.error("❌ Dashboard error:", errorMsg);

        // 🚨 Si le token est expiré ou invalide
        if (errorMsg.includes("expired") || errorMsg.includes("Unauthorized")) {
          toast.error("⏰ Votre session a expiré. Veuillez vous reconnecter.", {
            icon: "🔒",
            style: {
              borderRadius: "8px",
              background: "#ff4d4f",
              color: "#fff",
              fontWeight: "500",
              fontFamily: "Poppins, sans-serif",
            },
          });

          // 🔥 Supprime le cookie manuellement
          document.cookie = "token=; Max-Age=0; path=/;";

          // ⏳ Redirige après 2 secondes
          setTimeout(() => router.push("/login"), 2000);
        } else {
          toast.error("⚠️ Une erreur est survenue. Réessayez plus tard.");
        }
      }
    };

    fetchDashboard();
    // also fetch overview stats
    fetchOverviewStats();
  }, [router]);



  if (!message) {
    return (
      <>
        <Navbar />
        <div className="text-gray-500 text-center mt-10 animate-pulse">
          Chargement...
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--tea-green-900)] via-white to-[var(--azure-web-900)]">
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--mint-600)] mb-2">{message}</h1>
          <p className="text-gray-600">Track and monitor your health metrics</p>
        </div>

        {/* Quick Stats Cards (Overview Tab) */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[var(--mint-500)]">
                <p className="text-gray-600 text-sm font-medium">Total Records</p>
                <p className="text-3xl font-bold text-[var(--mint-500)] mt-2">{totalRecords !== null ? totalRecords : '—'}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[var(--air-superiority-blue-500)]">
                <p className="text-gray-600 text-sm font-medium">Current Weight</p>
                <p className="text-3xl font-bold text-[var(--air-superiority-blue-500)] mt-2">{currentWeight !== null ? `${currentWeight.toFixed(1)} kg` : '—'}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[var(--asparagus-500)]">
                <p className="text-gray-600 text-sm font-medium">Goal Status</p>
                <p className="text-3xl font-bold text-[var(--asparagus-500)] mt-2">{goalStatus ?? '—'}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[var(--harvest-gold-500)]">
                <p className="text-gray-600 text-sm font-medium">This Week</p>
                <p className="text-3xl font-bold text-[var(--harvest-gold-500)] mt-2">{thisWeekCount !== null ? thisWeekCount : '—'}</p>
              </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-lg shadow p-6">
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
            <div className="flex gap-4">
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
            </div>
          </div>
        )}

        {/* Add Measurement Tab */}
        {activeTab === "add" && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Add New Measurement</h2>
              <button
                onClick={() => setActiveTab("overview")}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
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

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Measurement History</h2>
              <button
                onClick={() => setActiveTab("overview")}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
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
      </div>
    </div>
  );
};

export default DashboardPage;
