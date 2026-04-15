import type { ArchetypeAxes, BorderlineTypeHint } from "@/types/ramen";

const AXIS_WEIGHTS = {
  richnessAxis: 0.28,
  brothBodyAxis: 0.23,
  impactAxis: 0.21,
  noodleBodyAxis: 0.28,
} as const;

const TYPE_CENTERS: Record<string, ArchetypeAxes> = {
  CKLF: { richnessAxis: 25, brothBodyAxis: 25, impactAxis: 25, noodleBodyAxis: 25 },
  CKLT: { richnessAxis: 25, brothBodyAxis: 25, impactAxis: 25, noodleBodyAxis: 75 },
  CKHF: { richnessAxis: 25, brothBodyAxis: 25, impactAxis: 75, noodleBodyAxis: 25 },
  CKHT: { richnessAxis: 25, brothBodyAxis: 25, impactAxis: 75, noodleBodyAxis: 75 },
  CWLF: { richnessAxis: 25, brothBodyAxis: 75, impactAxis: 25, noodleBodyAxis: 25 },
  CWLT: { richnessAxis: 25, brothBodyAxis: 75, impactAxis: 25, noodleBodyAxis: 75 },
  CWHF: { richnessAxis: 25, brothBodyAxis: 75, impactAxis: 75, noodleBodyAxis: 25 },
  CWHT: { richnessAxis: 25, brothBodyAxis: 75, impactAxis: 75, noodleBodyAxis: 75 },
  RKLF: { richnessAxis: 75, brothBodyAxis: 25, impactAxis: 25, noodleBodyAxis: 25 },
  RKLT: { richnessAxis: 75, brothBodyAxis: 25, impactAxis: 25, noodleBodyAxis: 75 },
  RKHF: { richnessAxis: 75, brothBodyAxis: 25, impactAxis: 75, noodleBodyAxis: 25 },
  RKHT: { richnessAxis: 75, brothBodyAxis: 25, impactAxis: 75, noodleBodyAxis: 75 },
  RWLF: { richnessAxis: 75, brothBodyAxis: 75, impactAxis: 25, noodleBodyAxis: 25 },
  RWLT: { richnessAxis: 75, brothBodyAxis: 75, impactAxis: 25, noodleBodyAxis: 75 },
  RWHF: { richnessAxis: 75, brothBodyAxis: 75, impactAxis: 75, noodleBodyAxis: 25 },
  RWHT: { richnessAxis: 75, brothBodyAxis: 75, impactAxis: 75, noodleBodyAxis: 75 },
};

const TYPE_NAME_MAP: Record<string, string> = {
  CKLF: "清亮細緻型",
  CKLT: "清亮厚麵型",
  CKHF: "清湯銳感型",
  CKHT: "清湯硬派型",
  CWLF: "輕白滑順型",
  CWLT: "輕白厚麵型",
  CWHF: "白湯細銳型",
  CWHT: "白湯衝擊型",
  RKLF: "厚湯細緻型",
  RKLT: "厚湯厚麵型",
  RKHF: "厚湯銳感型",
  RKHT: "厚湯硬派型",
  RWLF: "濃白細滑型",
  RWLT: "濃白厚麵型",
  RWHF: "濃白細膩型",
  RWHT: "濃白重口型",
};

function weightedDistance(a: ArchetypeAxes, b: ArchetypeAxes): number {
  return (
    Math.abs(a.richnessAxis - b.richnessAxis) * AXIS_WEIGHTS.richnessAxis +
    Math.abs(a.brothBodyAxis - b.brothBodyAxis) * AXIS_WEIGHTS.brothBodyAxis +
    Math.abs(a.impactAxis - b.impactAxis) * AXIS_WEIGHTS.impactAxis +
    Math.abs(a.noodleBodyAxis - b.noodleBodyAxis) * AXIS_WEIGHTS.noodleBodyAxis
  );
}

function getStrength(distance: number): BorderlineTypeHint["strength"] {
  if (distance <= 12) return "very_close";
  if (distance <= 20) return "close";
  if (distance <= 30) return "moderate";
  return "weak";
}

function getChangedAxes(userAxes: ArchetypeAxes, targetAxes: ArchetypeAxes): BorderlineTypeHint["changedAxis"] {
  return [
    { key: "richnessAxis" as const, diff: Math.abs(userAxes.richnessAxis - targetAxes.richnessAxis) },
    { key: "brothBodyAxis" as const, diff: Math.abs(userAxes.brothBodyAxis - targetAxes.brothBodyAxis) },
    { key: "impactAxis" as const, diff: Math.abs(userAxes.impactAxis - targetAxes.impactAxis) },
    { key: "noodleBodyAxis" as const, diff: Math.abs(userAxes.noodleBodyAxis - targetAxes.noodleBodyAxis) },
  ]
    .sort((a, b) => b.diff - a.diff)
    .slice(0, 2)
    .map((item) => item.key);
}

function buildSummary(code: string, name: string, changedAxis: BorderlineTypeHint["changedAxis"]): string {
  const axisMap: Record<BorderlineTypeHint["changedAxis"][number], string> = {
    richnessAxis: "濃厚軸",
    brothBodyAxis: "湯體軸",
    impactAxis: "口味軸",
    noodleBodyAxis: "麵體軸",
  };
  const changedText = changedAxis.map((key) => axisMap[key]).join("與");
  return `你目前也很接近 ${code}（${name}），邊界主要落在${changedText}。`;
}

export function computeBorderlineTypeHint(params: {
  currentCode: string;
  userAxes: ArchetypeAxes;
}): BorderlineTypeHint | null {
  const { currentCode, userAxes } = params;
  const candidates = Object.entries(TYPE_CENTERS)
    .filter(([code]) => code !== currentCode)
    .map(([code, axes]) => ({
      code,
      axes,
      distance: Number(weightedDistance(userAxes, axes).toFixed(2)),
    }))
    .sort((a, b) => a.distance - b.distance);

  const best = candidates[0];
  if (!best) return null;

  const name = TYPE_NAME_MAP[best.code] ?? best.code;
  const changedAxis = getChangedAxes(userAxes, best.axes);
  const strength = getStrength(best.distance);
  const summary = buildSummary(best.code, name, changedAxis);

  return {
    code: best.code,
    name,
    distance: best.distance,
    strength,
    changedAxis,
    summary,
  };
}
