/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import GoalForm from "@/components/form/GoalForm";
import { goalMotivationHint } from "../../utils/goalMessages";
import { pickRandomMessage } from "../../utils/randomMessage";
import { TrendingUp, Target, Calendar, Heart, Lightbulb, AlertCircle } from "lucide-react";

const GoalsPage = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any | null>(null);
  const [motivation, setMotivation] = useState("");
  
  // ML Analysis states
  const [goalAnalysis, setGoalAnalysis] = useState<any[]>([]);
  const [mlLoading, setMlLoading] = useState(false);

  // Load goals
  async function fetchGoals() {
    setLoading(true);
    try {
      const res = await fetch("/api/goals");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setGoals(data.goals || []);

      // Fetch ML analysis for goals
      if (data.goals && data.goals.length > 0) {
        await fetchGoalAnalysis(data.goals);
      }
    } catch (e) {
      console.error("Failed to load goals", e);
    }
    setLoading(false);
  }

  // Fetch ML analysis for goals
  async function fetchGoalAnalysis(goalsData: any[]) {
    setMlLoading(true);
    try {
      const res = await fetch("/api/ml/goal-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals: goalsData }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.warn("Goal analysis failed:", data);
        return;
      }

      setGoalAnalysis(data.insights || []);
    } catch (err) {
      console.error("Failed to fetch goal analysis:", err);
      // Non-critical error
    } finally {
      setMlLoading(false);
    }
  }

  // Generate a friendly hint message
  useEffect(() => {
    if (!goals.length) return;

    const g = goals[Math.floor(Math.random() * goals.length)];
    const msgList = goalMotivationHint[g.type] || [];
    setMotivation(pickRandomMessage(msgList));
  }, [goals]);

  useEffect(() => {
    fetchGoals();
  }, []);

  // Delete a goal
  async function removeGoal(id: string) {
    if (!confirm("Delete this goal?")) return;

    const res = await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return alert(data.error);

    fetchGoals();
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--mint-600)]">Your Goals</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set goals, track your progress and stay motivated.
          </p>

          {motivation && (
            <div className="mt-4 p-3 rounded-lg border bg-[var(--tea-900)] text-[var(--tea-300)] dark:bg-[var(--tea-200)] dark:text-[var(--tea-900)] shadow-sm">
              💡 {motivation}
            </div>
          )}
        </div>

        {/* Add Goal Button */}
        <button
          onClick={() => { setShowForm(true); setEditingGoal(null); }}
          className="mb-6 bg-[var(--mint-500)] hover:bg-[var(--mint-400)] text-white px-5 py-3 rounded-lg transition font-medium"
        >
          + Add New Goal
        </button>

        {/* Goal Form Modal */}
        {showForm && (
          <div className="bg-white dark:bg-[var(--gray-100)] p-5 rounded-xl shadow-lg mb-8">
            <GoalForm
              initial={editingGoal}
              onCancel={() => { setShowForm(false); setEditingGoal(null); }}
              onSaved={() => {
                setShowForm(false);
                setEditingGoal(null);
                fetchGoals();
              }}
            />
          </div>
        )}

        {/* Loading */}
        {loading && <div className="text-gray-500">Loading goals...</div>}

        {/* Goal Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const progressColor =
              goal.progress >= 80
                ? "var(--asp-500)"
                : goal.progress >= 40
                ? "var(--gold-500)"
                : "var(--red-500)";

            // Find ML analysis for this goal
            const mlAnalysis = goalAnalysis.find(
              (analysis: any) => analysis.goal_type === goal.type
            );

            return (
              <div
                key={goal._id}
                className="bg-white dark:bg-[var(--card-bg)] p-5 rounded-xl shadow border-l-4"
                style={{ borderColor: progressColor }}
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-bold text-xl flex items-center gap-2">
                    <TrendingUp size={18} /> {goal.description}
                  </h2>

                  <button
                    onClick={() => removeGoal(goal._id)}
                    className="text-[var(--indian-red-500)] hover:text-[var(--indian-red-300)]"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                  <Calendar size={14} /> {new Date(goal.startDate).toLocaleDateString()} —{" "}
                  {new Date(goal.endDate).toLocaleDateString()}
                </p>

                {/* Current Value */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-2">
                  <Heart size={14} />
                  Current:{" "}
                  <span className="font-semibold text-[var(--mint-500)]">
                    {goal.currentValue ?? "—"}
                  </span>
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${goal.progress}%`,
                      backgroundColor: progressColor,
                    }}
                  ></div>
                </div>

                <p className="text-sm mb-4" style={{ color: progressColor }}>
                  {goal.progress.toFixed(1)}% complete
                </p>

                {/* ML Analysis Section */}
                {mlAnalysis && (
                  <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 p-3 rounded mb-4">
                    {mlAnalysis.tips && mlAnalysis.tips.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1">
                          <Lightbulb size={14} /> AI Tips
                        </p>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                          {mlAnalysis.tips.slice(0, 2).map((tip: string, idx: number) => (
                            <li key={idx} className="list-disc list-inside">
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Edit */}
                <button
                  onClick={() => {
                    setEditingGoal(goal);
                    setShowForm(true);
                  }}
                  className="bg-[var(--air-500)] hover:bg-[var(--air-400)] text-white px-4 py-2 rounded-lg transition"
                >
                  Edit Goal
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;
