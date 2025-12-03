/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  onSaved?: () => void;
  onCancel?: () => void;
};

export default function SleepQuestionnaire({ onSaved, onCancel }: Props) {
  // Q1: sleep duration (select range -> mapped to approximate hours)
  const [q1, setQ1] = useState<string | null>(null);
  // Q2: perceived sleep quality (1-10) via radio choices
  const [q2, setQ2] = useState<number | null>(null);
  // Q3: did you nap? and nap duration choice
  const [q3Nap, setQ3Nap] = useState<string | null>(null); // 'yes'|'no'|null
  const [q3NapLength, setQ3NapLength] = useState<string | null>(null); // '<30','30-60','>60'

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const durationMap: Record<string, number> = {
    "<4": 3,
    "4-6": 5,
    "6-8": 7,
    ">8": 9,
  };

  const napMap: Record<string, number> = {
    "<30": 0.25,
    "30-60": 0.75,
    ">60": 1.5,
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q1 || q2 == null || q3Nap == null) {
      toast.error("Please answer all required questions");
      return;
    }

    if (q3Nap === "yes" && !q3NapLength) {
      toast.error("Please provide nap duration");
      return;
    }

    const durationHours = durationMap[q1] ?? 0;
    const qualityScore = Number(q2);
    const napHours = q3Nap === "yes" ? napMap[q3NapLength as string] ?? 0 : null;

    setLoading(true);
    try {
      // Post sleep_duration
      const res1 = await fetch("/api/measures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sleep_duration",
          value: durationHours,
          unit: "hours",
          timestamp: new Date().toISOString(),
          notes,
        }),
      });
      const data1 = await res1.json();
      if (!res1.ok) throw new Error(data1.error || data1.message || "Failed to save duration");

      // Post sleep_quality
      const res2 = await fetch("/api/measures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sleep_quality",
          value: qualityScore,
          unit: "score",
          timestamp: new Date().toISOString(),
          notes,
        }),
      });
      const data2 = await res2.json();
      if (!res2.ok) throw new Error(data2.error || data2.message || "Failed to save quality");

      // If nap provided, post nap_duration measure
      if (napHours != null) {
        const res3 = await fetch("/api/measures", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "nap_duration",
            value: napHours,
            unit: "hours",
            timestamp: new Date().toISOString(),
            notes: `nap:${q3NapLength}`,
          }),
        });
        const data3 = await res3.json();
        if (!res3.ok) throw new Error(data3.error || data3.message || "Failed to save nap duration");
      }

      toast.success("Sleep questionnaire saved", { icon: "✅" });
      if (onSaved) onSaved();
    } catch (err: any) {
      console.error("SleepQuestionnaire error:", err);
      toast.error(err?.message || "Error saving sleep questionnaire");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <p className="font-medium text-gray-700 mb-2">1\ How long did you sleep last night?</p>
        <div className="space-y-1">
          <label className="flex items-center gap-2"><input type="radio" name="q1" value="<4" checked={q1 === "<4"} onChange={() => setQ1("<4")} /> <span>&lt; 4 hours</span></label>
          <label className="flex items-center gap-2"><input type="radio" name="q1" value="4-6" checked={q1 === "4-6"} onChange={() => setQ1("4-6")} /> <span>4–6 hours</span></label>
          <label className="flex items-center gap-2"><input type="radio" name="q1" value="6-8" checked={q1 === "6-8"} onChange={() => setQ1("6-8")} /> <span>6–8 hours</span></label>
          <label className="flex items-center gap-2"><input type="radio" name="q1" value=">8" checked={q1 === ">8"} onChange={() => setQ1(">8")} /> <span>&gt; 8 hours</span></label>
        </div>
      </div>

      <div>
        <p className="font-medium text-gray-700 mb-2">2\ How would you rate the overall quality of your sleep?</p>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <label key={n} className="flex flex-col items-center">
              <input type="radio" name="q2" value={n} checked={q2 === n} onChange={() => setQ2(n)} />
              <span className="text-sm">{n}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="font-medium text-gray-700 mb-2">3\ Did you take a nap during the day?</p>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2"><input type="radio" name="q3Nap" value="no" checked={q3Nap === "no"} onChange={() => { setQ3Nap("no"); setQ3NapLength(null); }} /> <span>No</span></label>
          <label className="flex items-center gap-2"><input type="radio" name="q3Nap" value="yes" checked={q3Nap === "yes"} onChange={() => setQ3Nap("yes")} /> <span>Yes</span></label>
        </div>

        {q3Nap === "yes" && (
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">If yes, how long was the nap?</p>
            <label className="flex items-center gap-2"><input type="radio" name="q3NapLen" value="<30" checked={q3NapLength === "<30"} onChange={() => setQ3NapLength("<30")} /> <span>&lt; 30 minutes</span></label>
            <label className="flex items-center gap-2"><input type="radio" name="q3NapLen" value="30-60" checked={q3NapLength === "30-60"} onChange={() => setQ3NapLength("30-60")} /> <span>30–60 minutes</span></label>
            <label className="flex items-center gap-2"><input type="radio" name="q3NapLen" value=">60" checked={q3NapLength === ">60"} onChange={() => setQ3NapLength(">60")} /> <span>&gt; 60 minutes</span></label>
          </div>
        )}
      </div>

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
