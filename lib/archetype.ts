import type { ArchetypeAxes, ArchetypeResult, ClassifierState } from "@/types/ramen";

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : 50));
}

function weightedAverage(parts: Array<{ value: number; weight: number }>): number {
  const totalWeight = parts.reduce((sum, p) => sum + p.weight, 0);
  if (totalWeight <= 0) return 50;
  const weighted = parts.reduce((sum, p) => sum + p.value * p.weight, 0);
  return clamp(weighted / totalWeight);
}

function n(value: number | undefined, fallback = 50): number {
  return typeof value === "number" ? clamp(value) : fallback;
}

export function computeArchetypeAxes(state: ClassifierState): ArchetypeAxes {
  const richnessAxis = weightedAverage([
    { value: n(state.coreAxisAnswers.axis_richness), weight: 0.75 },
    { value: n(state.flavorProfileAnswers.flavor_fatty_sweet), weight: 0.15 },
    { value: n(state.toppingAnswers.topping_backfat), weight: 0.10 },
  ]);

  const brothBodyAxis = weightedAverage([
    { value: n(state.coreAxisAnswers.axis_broth_body), weight: 0.75 },
    { value: n(state.flavorProfileAnswers.flavor_fatty_sweet), weight: 0.10 },
    { value: n(state.proteinPreferenceAnswers.protein_miso), weight: 0.15 },
  ]);

  const impactAxis = weightedAverage([
    { value: n(state.coreAxisAnswers.axis_impact), weight: 0.60 },
    { value: n(state.flavorProfileAnswers.flavor_spice), weight: 0.15 },
    { value: n(state.toppingAnswers.topping_garlic), weight: 0.15 },
    { value: n(state.toppingAnswers.topping_backfat), weight: 0.10 },
  ]);

  const noodleBodyAxis = weightedAverage([
    { value: n(state.coreAxisAnswers.axis_noodle_body), weight: 0.55 },
    { value: n(state.noodleAnswers.noodle_thickness), weight: 0.20 },
    { value: n(state.noodleAnswers.noodle_chewiness), weight: 0.15 },
    { value: n(state.noodleAnswers.noodle_firmness), weight: 0.10 },
  ]);

  return {
    richnessAxis,
    brothBodyAxis,
    impactAxis,
    noodleBodyAxis,
  };
}

function axisLetter(value: number, left: string, right: string): string {
  return value < 50 ? left : right;
}

export function buildArchetypeCode(axes: ArchetypeAxes): string {
  return [
    axisLetter(axes.richnessAxis, "C", "R"),
    axisLetter(axes.brothBodyAxis, "K", "W"),
    axisLetter(axes.impactAxis, "L", "H"),
    axisLetter(axes.noodleBodyAxis, "F", "T"),
  ].join("");
}

const CODE_NAME_MAP: Record<string, string> = {
  CKLF: "清亮細緻型",
  RWHT: "濃白重口型",
  RWHF: "濃白細膩型",
  CKHT: "清湯硬派型",
  CWLF: "輕白滑順型",
  RKHT: "厚湯硬派型",
  RWLT: "濃白厚麵型",
};

function axisWord(value: number, leftWord: string, rightWord: string): string {
  return value < 50 ? leftWord : rightWord;
}

function buildArchetypeName(axes: ArchetypeAxes, code: string): string {
  if (CODE_NAME_MAP[code]) return CODE_NAME_MAP[code];

  const richness = axisWord(axes.richnessAxis, "清爽", "濃厚");
  const broth = axisWord(axes.brothBodyAxis, "清湯", "白湯");
  const impact = axisWord(axes.impactAxis, "溫和", "重口");
  const noodle = axisWord(axes.noodleBodyAxis, "細滑", "粗嚼");

  return `${richness}${broth}${impact}${noodle}型`;
}

function buildArchetypeSummary(axes: ArchetypeAxes): string {
  const richness = axes.richnessAxis < 50 ? "清爽、乾淨、負擔較低" : "厚重、包覆感明顯、存在感高";
  const broth = axes.brothBodyAxis < 50 ? "清湯輪廓、層次清楚" : "白湯感、乳化感較明顯";
  const impact = axes.impactAxis < 50 ? "口味較溫和、不追求過強刺激" : "接受更高鹹度、油感與衝擊感";
  const noodle = axes.noodleBodyAxis < 50 ? "麵體偏細滑、入口較俐落" : "麵體存在感高、更偏有嚼勁";

  return `你偏好${richness}、${broth}、${impact}，而且${noodle}。`;
}

export function computeArchetypeResult(state: ClassifierState): ArchetypeResult {
  const axes = computeArchetypeAxes(state);
  const code = buildArchetypeCode(axes);
  const name = buildArchetypeName(axes, code);
  const summary = buildArchetypeSummary(axes);

  return {
    code,
    name,
    summary,
    axes,
  };
}
