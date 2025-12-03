/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  onSaved?: () => void;
  onCancel?: () => void;
};

// Stress questionnaire implemented as a short list of items (0-4 scale), summed into a single score
export default function StressQuestionnaire({ onSaved, onCancel }: Props) {
  const questions = [
    "In the last week, how often have you felt nervous or stressed?",
    "In the last week, how often have you felt unable to cope with important changes?",
    "In the last week, how often have you felt difficulties were piling up?",
    "In the last week, how often have you felt confident about your ability to handle personal problems?",
    "In the last week, how often have you felt that you were on top of things?",
  ];

  // answers: -1 = unanswered, otherwise 0..4 (Never..Very often)
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const setAnswer = (index: number, value: number) => {
    const copy = [...answers];
    copy[index] = value;
    setAnswers(copy);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answers.some((a) => a < 0)) {
      toast.error("Please answer all stress questions");
      return;
    }

    const score = answers.reduce((s, v) => s + v, 0); // 0..20

    setLoading(true);
    try {
      const res = await fetch("/api/measures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "stress",
          value: score,
          unit: "score",
          timestamp: new Date().toISOString(),
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to save stress measure");

      toast.success("Stress questionnaire saved", { icon: "✅" });
      if (onSaved) onSaved();
    } catch (err: any) {
      console.error("StressQuestionnaire error:", err);
      toast.error(err?.message || "Error saving stress questionnaire");
    } finally {
      setLoading(false);
    }
  };

  const optionLabels = ["Never", "Rarely", "Sometimes", "Often", "Very often"];

  return (
    <form onSubmit={submit} className="space-y-4">
      {questions.map((q, idx) => (
        <div key={idx}>
          <p className="font-medium text-gray-700 mb-2">{idx + 1}) {q}</p>
          <div className="flex gap-3">
            {optionLabels.map((label, optIdx) => (
              <label key={optIdx} className="flex items-center gap-2">
                <input type="radio" name={`q${idx}`} checked={answers[idx] === optIdx} onChange={() => setAnswer(idx, optIdx)} />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div>
        <label className="block text-gray-700 font-medium mb-2">Notes (optional)</label>
        <textarea className="w-full rounded border p-2" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="bg-[var(--mint-500)] hover:bg-[var(--mint-400)] text-white px-4 py-2 rounded">{loading ? "Saving..." : "Submit"}</button>
        {onCancel && <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">Cancel</button>}
      </div>
    </form>
  );
}
