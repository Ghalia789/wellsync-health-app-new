/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

type Props = {
  initial?: any;
  onSaved?: (m: any) => void;
  onCancel?: () => void;
};

const MeasureForm = ({ initial, onSaved, onCancel }: Props) => {
  const [type, setType] = useState(initial?.type || "weight");
  const [value, setValue] = useState(initial?.value ?? "");
  const unitOptionsMap: Record<string, string[]> = {
    weight: ["kg", "lb"],
    height: ["cm", "m", "in", "ft"],
    blood_pressure: ["mmHg", "kPa"],
    glucose: ["mg/dL", "mmol/L"],
  };

  const defaultUnitFor = (t: string) => {
    const opts = unitOptionsMap[t] || [];
    return opts.length ? opts[0] : "";
  };

  const [unit, setUnit] = useState(initial?.unit || defaultUnitFor(initial?.type || "weight"));
  const [timestamp, setTimestamp] = useState(
    initial?.timestamp
      ? new Date(initial.timestamp).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState(initial?.notes || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // when type changes, pick a sensible default unit unless the current unit is valid
    const opts = unitOptionsMap[type] || [];
    if (opts.length && !opts.includes(unit)) {
      setUnit(opts[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const submit = async (e: any) => {
    e?.preventDefault();
    setLoading(true);

    try {
      const payload = { type, value: Number(value), unit, timestamp, notes };

      const method = initial?. _id ? "PUT" : "POST";
      const url = "/api/measures";

      const body = method === "PUT" ? { ...payload, id: initial._id } : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || data.message || "Failed");

      toast.success("Mesure enregistrée", { icon: "✅" });
      if (onSaved) onSaved(data.measure || data);
    } catch (err: any) {
      console.error("MeasureForm error:", err);
      toast.error(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Type</label>
          <select
            className="w-full rounded border p-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="weight">Weight</option>
            <option value="height">Height</option>
            <option value="blood_pressure">Blood Pressure</option>
            <option value="glucose">Glucose</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Valeur</label>
          <input
            type="number"
            step="any"
            className="w-full rounded border p-2"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Unité</label>
          {unitOptionsMap[type] ? (
            <select
              className="w-full rounded border p-2"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              {(unitOptionsMap[type] || []).map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="w-full rounded border p-2"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          )}
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Date & heure</label>
          <input
            type="datetime-local"
            className="w-full rounded border p-2"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Notes</label>
        <textarea
          className="w-full rounded border p-2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

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

export default MeasureForm;
