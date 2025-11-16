/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

type Props = {
  type: string;
  width?: number;
  height?: number;
};

// Small SVG sparkline based on summary endpoint
const MeasureChart = ({ type, width = 360, height = 80 }: Props) => {
  const [points, setPoints] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/measures?summary=true&type=${encodeURIComponent(type)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");

        const summary = data.summary || [];
        const vals = summary.map((s: any) => Number(s.avgValue || 0));
        const labs = summary.map((s: any) => s._id);
        setPoints(vals);
        setLabels(labs);
      } catch (err) {
        console.error("MeasureChart load error:", err);
      }
    };
    load();
  }, [type]);

  if (!points.length) return <div className="text-gray-500">No summary</div>;

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  // compute svg polyline points
  const step = width / Math.max(1, points.length - 1);
  const pts = points
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polyline fill="none" stroke="var(--air-superiority-blue-500)" strokeWidth={2} points={pts} />
      </svg>
      <div className="text-xs text-gray-500 mt-1">{labels[0]} — {labels[labels.length - 1]}</div>
    </div>
  );
};

export default MeasureChart;
