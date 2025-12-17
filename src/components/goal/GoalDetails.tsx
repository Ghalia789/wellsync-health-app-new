/* eslint-disable @typescript-eslint/no-explicit-any */
const GoalDetails = ({ goal }: { goal: any }) => {
  if (!goal) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-[var(--mint-600)] mb-2">
        {goal.type.replace(/_/g, " ")}
      </h2>

      <p className="text-gray-600 mb-2">{goal.description}</p>

      <div className="text-sm text-gray-500">
        {new Date(goal.startDate).toLocaleDateString()} —{" "}
        {new Date(goal.endDate).toLocaleDateString()}
      </div>

      <div className="mt-4">
        <div className="font-medium text-gray-700">
          Current Value: {goal.currentValue}
        </div>
        <div className="font-medium text-gray-700">
          Target Value: {goal.targetValue}
        </div>
      </div>

      <div className="mt-4 w-full bg-gray-200 rounded-full h-4">
        <div
          className="h-4 rounded-full bg-[var(--air-superiority-blue-500)]"
          style={{ width: `${goal.progress}%` }}
        />
      </div>

      <p className="text-sm text-gray-600 mt-1">
        Progress: {goal.progress.toFixed(1)}%
      </p>

      <h3 className="text-lg font-semibold mt-6 mb-2">Measurements Used</h3>
      {goal.measures?.length ? (
        <ul className="list-disc ml-5 text-sm text-gray-600">
          {goal.measures.map((m: any) => (
            <li key={m._id}>
              {m.type} — {m.value} {m.unit} (
              {new Date(m.timestamp).toLocaleString()})
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No measurements found.</p>
      )}
    </div>
  );
};

export default GoalDetails;
