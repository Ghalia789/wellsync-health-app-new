"use client";

export default function GoalDetailsModal({
  goal,
  onClose,
}: {
  goal: any;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Goal details</h2>
          <button onClick={onClose} className="text-xl">✕</button>
        </div>

        <div className="space-y-2 text-sm">
          <p><b>Type:</b> {goal.type}</p>
          <p><b>Description:</b> {goal.description}</p>
          <p><b>Status:</b> {goal.status}</p>
          <p><b>Start:</b> {new Date(goal.startDate).toLocaleDateString()}</p>
          <p><b>End:</b> {new Date(goal.endDate).toLocaleDateString()}</p>
          <p><b>Target:</b> {goal.targetValue}</p>
          <p><b>Current:</b> {goal.currentValue ?? "—"}</p>
          <p><b>Progress:</b> {goal.progress.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}
