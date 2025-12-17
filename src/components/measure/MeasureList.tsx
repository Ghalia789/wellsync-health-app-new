/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  onEdit?: (m: any) => void;
  refreshToggle?: number;
};

const MeasureList = ({ onEdit, refreshToggle }: Props) => {
  const [measures, setMeasures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMeasures = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/measures?limit=20`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setMeasures(data.measures || []);
    } catch (err: any) {
      console.error("MeasureList fetch error:", err);
      toast.error(err.message || "Erreur chargement mesures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToggle]);

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette mesure ?")) return;
    try {
      const res = await fetch(`/api/measures?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      toast.success("Mesure supprimée");
      fetchMeasures();
    } catch (err: any) {
      console.error("Delete measure error:", err);
      toast.error(err.message || "Erreur suppression");
    }
  };

  if (loading) return <div className="text-gray-500">Chargement mesures...</div>;

  if (!measures.length) return <div className="text-gray-500">Aucune mesure trouvée.</div>;

  return (
    <div className="space-y-2">
      {measures.map((m) => (
        <div
          key={m._id}
          className="flex items-center justify-between border rounded p-2"
        >
          <div>
            <div className="font-medium">{m.type} — {m.value} {m.unit}</div>
            <div className="text-sm text-gray-500">{new Date(m.timestamp).toLocaleString()}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit && onEdit(m)}
              className="px-3 py-1 rounded bg-[var(--air-superiority-blue-500)] hover:bg-[var(--air-superiority-blue-400)] text-white"
            >
              Edit
            </button>
            <button
              onClick={() => remove(m._id)}
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

export default MeasureList;
