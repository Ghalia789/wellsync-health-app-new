/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  onEdit?: (g: any) => void;
  refreshToggle?: number;
};

const GoalList = ({ onEdit, refreshToggle }: Props) => {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/goals");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch goals");
      setGoals(data.goals || []);
    } catch (err: any) {
      console.error("GoalList error:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToggle]);

  const remove = async (id: string) => {
    if (!confirm("Delete this goal?")) return;

    try {
      const res = await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Goal deleted");
      fetchGoals();
    } catch (err: any) {
      console.error("Delete goal error:", err);
      toast.error(err.message);
    }
  };

  if (loading) return <div className="text-gray-500">Loading goals...</div>;
  if (!goals.length) return <div className="text-gray-500">No goals found.</div>;

  return (
    <div className="space-y-3">
      {goals.map((g) => (
        <div key={g._id} className="border rounded p-3 shadow-sm">
          <div className="font-semibold text-[var(--mint-600)]">
            {g.type.replace(/_/g, " ")}
          </div>

          <div className="text-gray-600 text-sm">{g.description}</div>

          <div className="text-xs text-gray-500 mt-1">
            {new Date(g.startDate).toLocaleDateString()} →{" "}
            {new Date(g.endDate).toLocaleDateString()}
          </div>

          {/* Progress Bar */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-[var(--air-superiority-blue-500)] transition-all"
              style={{ width: `${g.progress}%` }}
            ></div>
          </div>

          <div className="text-xs text-gray-600 mt-1">
            Progress: {g.progress.toFixed(1)}%
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onEdit && onEdit(g)}
              className="px-3 py-1 rounded bg-[var(--air-superiority-blue-500)] hover:bg-[var(--air-superiority-blue-400)] text-white"
            >
              Edit
            </button>

            <button
              onClick={() => remove(g._id)}
              className="px-3 py-1 rounded bg-[var(--indian-red-500)] hover:bg-[var(--indian-red-400)] text-white"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GoalList;
