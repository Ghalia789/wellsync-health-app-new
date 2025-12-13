/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { goalMotivationMessages} from "../../../utils/goalMessages"
import SleepQuestionnaire from "./SleepQuestionnaire";
import StressQuestionnaire from "./StressQuestionnaire";

type Props = {
  initial?: any;
  onSaved?: (g: any) => void;
  onCancel?: () => void;
};

const GOAL_TYPES = [
  { value: "WEIGHT_LOSS", label: "Weight Loss" },
  { value: "MUSCLE_GAIN", label: "Muscle Gain" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "HEART_HEALTH", label: "Heart Health" },
  { value: "SLEEP_IMPROVEMENT", label: "Sleep Improvement" },
  { value: "STRESS_REDUCTION", label: "Stress Reduction" },
  { value: "DIABETES_CONTROL", label: "Diabetes Control" },
];

function getRandomMessage(type: string) {
  const list = goalMotivationMessages[type] || [];
  return list[Math.floor(Math.random() * list.length)] || "";
}

const GoalForm = ({ initial, onSaved, onCancel }: Props) => {
  const [type, setType] = useState(initial?.type || "WEIGHT_LOSS");
  const [description, setDescription] = useState(initial?.description || "");
  const [targetValue, setTargetValue] = useState(initial?.targetValue || "");
  const [startDate, setStartDate] = useState(
    initial?.startDate
      ? new Date(initial.startDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    initial?.endDate
      ? new Date(initial.endDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );

  const [loading, setLoading] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [goalCreated, setGoalCreated] = useState(false);

  // motivational message shown in the form
  const [message, setMessage] = useState(getRandomMessage(type));

  // refresh message when goal type changes
  useEffect(() => {
    setMessage(getRandomMessage(type));
  }, [type]);

  // optional: also change message when values change
  useEffect(() => {
    setMessage(getRandomMessage(type));
  }, [targetValue, startDate, endDate]);

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        type,
        description,
        targetValue: Number(targetValue),
        startDate,
        endDate,
      };

      const method = initial?._id ? "PUT" : "POST";
      const body =
        method === "PUT" ? { ...payload, id: initial._id } : payload;

      const res = await fetch("/api/goals", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      toast.success(getRandomMessage(type), {
        icon: "💙",
        style: {
          background: "white",
          border: "1px solid var(--mint-500)",
          color: "var(--mint-600)",
          fontFamily: "Poppins, sans-serif",
          borderRadius: "8px",
        }
      });

      // If this is a new goal with questionnaire support, prompt user to fill questionnaire
      if (!initial?._id && (type === "SLEEP_IMPROVEMENT" || type === "STRESS_REDUCTION")) {
        setGoalCreated(true);
        setShowQuestionnaire(true);
        return;
      }

      onSaved && onSaved(data.goal || data);
    } catch (err: any) {
      console.error("GoalForm error:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showQuestionnaire && goalCreated) {
    const qProps = {
      onSaved: () => {
        setShowQuestionnaire(false);
        setGoalCreated(false);
        
      },
      onCancel: () => {
        setShowQuestionnaire(false);
        setGoalCreated(false);
      },
    };

    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-[var(--azure-web-900)] border-l-4 border-[var(--mint-500)] text-gray-700">
          <p className="font-medium mb-2">Fill your {type === "SLEEP_IMPROVEMENT" ? "Sleep" : "Stress"} Questionnaire</p>
          <p className="text-sm text-gray-600">Answer a few quick questions to start tracking your progress:</p>
        </div>
        {type === "SLEEP_IMPROVEMENT" && <SleepQuestionnaire {...qProps} />}
        {type === "STRESS_REDUCTION" && <StressQuestionnaire {...qProps} />}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">

      {/* MOTIVATION MESSAGE */}
      <div className="p-3 rounded-lg bg-[var(--azure-web-900)] border-l-4 border-[var(--mint-500)] text-gray-700 text-sm shadow-sm">
        {message}
      </div>

      {/* Goal Type */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Type</label>
        <select
          className="w-full rounded border p-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {GOAL_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Description</label>
        <textarea
          className="w-full rounded border p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      {/* Target Value */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Target Value</label>
        <input
          type="number"
          className="w-full rounded border p-2"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          required
        />
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Start Date</label>
          <input
            type="date"
            className="w-full rounded border p-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">End Date</label>
          <input
            type="date"
            className="w-full rounded border p-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--mint-500)] hover:bg-[var(--mint-400)] text-white px-4 py-2 rounded"
        >
          {initial?._id ? (loading ? "Saving..." : "Update") : loading ? "Saving..." : "Save"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default GoalForm;
