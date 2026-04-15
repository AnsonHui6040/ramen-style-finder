import { RAMEN_PROTOTYPES } from "@/data/prototypes";
import { computeArchetypeResult } from "@/lib/archetype";
import { computeBorderlineTypeHint } from "@/lib/borderline-type";
import { computeIngredientTags } from "@/lib/ingredient-tags";
import type {
  ArchetypeResult,
  ClassifierState,
  IngredientTagScore,
  MainCategory,
  PrototypeMatchRow,
  RamenPrototype,
  ResultReasonItem,
  ResultSnapshot,
} from "@/types/ramen";

type CandidateMainCategory = Exclude<MainCategory, "not_sure">;
type NumericRecord = Record<string, number>;
type ScoreComponentKey = "coreAxes" | "flavorProfile" | "proteinPreference" | "noodle" | "topping" | "archetypeAlignment";

interface PrototypeScoreRow extends PrototypeMatchRow {
  componentScores: Record<ScoreComponentKey, number>;
}

const BASE_COMPONENT_WEIGHTS: Record<ScoreComponentKey, number> = {
  coreAxes: 0.43,
  flavorProfile: 0.18,
  proteinPreference: 0.12,
  noodle: 0.15,
  topping: 0.07,
  archetypeAlignment: 0.05,
};

const SOFTMAX_BETA = 8;

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : 50));
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function toPercentScore(value: number): number {
  return Number((value * 100).toFixed(1));
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values));
}

function weightedAverage(parts: Array<{ score: number; weight: number }>): number {
  const valid = parts.filter((item) => item.weight > 0);
  if (valid.length === 0) return 0;
  const weightSum = valid.reduce((sum, item) => sum + item.weight, 0);
  if (weightSum <= 0) return 0;
  const weightedSum = valid.reduce((sum, item) => sum + item.score * item.weight, 0);
  return clamp01(weightedSum / weightSum);
}

function softmaxShares(scores: number[]): number[] {
  if (scores.length === 0) return [];
  const maxScore = Math.max(...scores);
  const exps = scores.map((score) => Math.exp((score - maxScore) * SOFTMAX_BETA));
  const sum = exps.reduce((acc, value) => acc + value, 0) || 1;
  return exps.map((value) => value / sum);
}

function linearSimilarity(inputValue: number, targetValue: number): number {
  return clamp01(1 - Math.abs(clamp(inputValue) - clamp(targetValue)) / 100);
}

function vectorSimilarity(input: NumericRecord, target: NumericRecord, fallback = 0.5): number {
  const keys = Object.keys(input);
  if (keys.length === 0) return fallback;
  const total = keys.reduce((sum, key) => sum + linearSimilarity(input[key] ?? 50, target[key] ?? 50), 0);
  return clamp01(total / keys.length);
}

function buildCoreAxisVector(state: ClassifierState): NumericRecord {
  return {
    richnessAxis: clamp(state.coreAxisAnswers.axis_richness ?? 50),
    brothBodyAxis: clamp(state.coreAxisAnswers.axis_broth_body ?? 50),
    impactAxis: clamp(state.coreAxisAnswers.axis_impact ?? 50),
    noodleBodyAxis: clamp(state.coreAxisAnswers.axis_noodle_body ?? 50),
  };
}

function buildFlavorProfileVector(state: ClassifierState): NumericRecord {
  return {
    meatVsSea: clamp(state.flavorProfileAnswers.flavor_meat_vs_sea ?? 50),
    fermented: clamp(state.flavorProfileAnswers.flavor_fermented ?? 50),
    citrus: clamp(state.flavorProfileAnswers.flavor_citrus ?? 50),
    spice: clamp(state.flavorProfileAnswers.flavor_spice ?? 50),
    fattySweet: clamp(state.flavorProfileAnswers.flavor_fatty_sweet ?? 50),
  };
}

function buildProteinPreferenceVector(state: ClassifierState): NumericRecord {
  return {
    pork: clamp(state.proteinPreferenceAnswers.protein_pork ?? 50),
    chicken: clamp(state.proteinPreferenceAnswers.protein_chicken ?? 50),
    beef: clamp(state.proteinPreferenceAnswers.protein_beef ?? 50),
    duck: clamp(state.proteinPreferenceAnswers.protein_duck ?? 50),
    shrimp: clamp(state.proteinPreferenceAnswers.protein_shrimp ?? 50),
    shellfish: clamp(state.proteinPreferenceAnswers.protein_shellfish ?? 50),
    fish: clamp(state.proteinPreferenceAnswers.protein_fish ?? 50),
    miso: clamp(state.proteinPreferenceAnswers.protein_miso ?? 50),
  };
}

function buildNoodleVector(state: ClassifierState): NumericRecord {
  return {
    thickness: clamp(state.noodleAnswers.noodle_thickness ?? 50),
    firmness: clamp(state.noodleAnswers.noodle_firmness ?? 50),
    chewiness: clamp(state.noodleAnswers.noodle_chewiness ?? 50),
    curl: clamp(state.noodleAnswers.noodle_curl ?? 50),
  };
}

function buildToppingVector(state: ClassifierState): NumericRecord {
  return {
    chashu: clamp(state.toppingAnswers.topping_chashu ?? 50),
    beef: clamp(state.toppingAnswers.topping_beef ?? 50),
    egg: clamp(state.toppingAnswers.topping_egg ?? 50),
    nori: clamp(state.toppingAnswers.topping_nori ?? 50),
    spinach: clamp(state.toppingAnswers.topping_spinach ?? 50),
    menma: clamp(state.toppingAnswers.topping_menma ?? 50),
    veg_pile: clamp(state.toppingAnswers.topping_veg_pile ?? 50),
    corn: clamp(state.toppingAnswers.topping_corn ?? 50),
    butter: clamp(state.toppingAnswers.topping_butter ?? 50),
    garlic: clamp(state.toppingAnswers.topping_garlic ?? 50),
    backfat: clamp(state.toppingAnswers.topping_backfat ?? 50),
    seafood: clamp(state.toppingAnswers.topping_seafood ?? 50),
  };
}

function getPrototypeCoreAxisVector(prototype: RamenPrototype): NumericRecord {
  const richnessAxis = clamp(
    prototype.intensity.richness * 0.45 + prototype.intensity.oiliness * 0.20 + prototype.flavorModifiers.fattySweet * 0.15 + prototype.brothTaste.rich * 0.20,
  );
  const brothBodyAxis = clamp(
    prototype.brothTaste.milky * 0.55 + prototype.brothType.chicken_paitan * 0.10 + prototype.brothType.tonkotsu * 0.20 + prototype.brothType.miso * 0.15,
  );
  const impactAxis = clamp(
    prototype.intensity.saltiness * 0.30 + prototype.intensity.spiciness * 0.15 + prototype.toppings.garlic * 0.20 + prototype.toppings.backfat * 0.20 + prototype.flavorModifiers.spiceWarmth * 0.15,
  );
  const noodleBodyAxis = clamp(
    prototype.noodles.thickness * 0.35 + prototype.noodles.chewiness * 0.30 + prototype.noodles.firmness * 0.20 + prototype.noodles.curl * 0.15,
  );
  return { richnessAxis, brothBodyAxis, impactAxis, noodleBodyAxis };
}

function getPrototypeFlavorProfileVector(prototype: RamenPrototype): NumericRecord {
  const meatSignal = (prototype.proteinTags.pork + prototype.proteinTags.chicken + prototype.proteinTags.beef + prototype.proteinTags.duck) / 4;
  const seaSignal = (prototype.proteinTags.shrimp + prototype.proteinTags.shellfish + prototype.proteinTags.fish) / 3;
  const meatVsSea = clamp(50 + (seaSignal - meatSignal) * 0.5);
  return {
    meatVsSea,
    fermented: clamp(prototype.proteinTags.miso * 0.8 + prototype.brothType.miso * 0.2),
    citrus: clamp(prototype.flavorModifiers.citrusFresh),
    spice: clamp(prototype.flavorModifiers.spiceWarmth),
    fattySweet: clamp(prototype.flavorModifiers.fattySweet),
  };
}

function getPrototypeProteinVector(prototype: RamenPrototype): NumericRecord {
  return { ...prototype.proteinTags };
}

function getPrototypeNoodleVector(prototype: RamenPrototype): NumericRecord {
  return { ...prototype.noodles };
}

function getPrototypeToppingVector(prototype: RamenPrototype): NumericRecord {
  return { ...prototype.toppings };
}

function getArchetypeAlignmentScore(archetype: ArchetypeResult, prototype: RamenPrototype): number {
  return vectorSimilarity({
    richnessAxis: archetype.axes.richnessAxis,
    brothBodyAxis: archetype.axes.brothBodyAxis,
    impactAxis: archetype.axes.impactAxis,
    noodleBodyAxis: archetype.axes.noodleBodyAxis,
  }, getPrototypeCoreAxisVector(prototype), 0.5);
}

function applyAllergenFilter(state: ClassifierState, prototype: RamenPrototype, score: number) {
  const selected = Object.keys(state.allergenAnswers).filter((key) => state.allergenAnswers[key as keyof typeof state.allergenAnswers]);
  const blocked = selected.filter((key) => (prototype.allergens[key as keyof typeof prototype.allergens] ?? 0) >= 70);
  const warnings = selected.filter((key) => {
    const risk = prototype.allergens[key as keyof typeof prototype.allergens] ?? 0;
    return risk >= 35 && risk < 70;
  });

  if (blocked.length > 0) {
    return {
      adjustedScore: -1,
      blocked: true,
      warning: false,
      blockedReasons: blocked,
      warningReasons: warnings,
    };
  }

  return {
    adjustedScore: warnings.length > 0 ? score * 0.7 : score,
    blocked: false,
    warning: warnings.length > 0,
    blockedReasons: blocked,
    warningReasons: warnings,
  };
}

function computePrototypeScores(state: ClassifierState, archetype: ArchetypeResult, prototype: RamenPrototype): PrototypeScoreRow {
  const coreAxesScore = vectorSimilarity(buildCoreAxisVector(state), getPrototypeCoreAxisVector(prototype), 0.5);
  const flavorProfileScore = vectorSimilarity(buildFlavorProfileVector(state), getPrototypeFlavorProfileVector(prototype), 0.5);
  const proteinPreferenceScore = vectorSimilarity(buildProteinPreferenceVector(state), getPrototypeProteinVector(prototype), 0.5);
  const noodleScore = vectorSimilarity(buildNoodleVector(state), getPrototypeNoodleVector(prototype), 0.5);
  const toppingScore = vectorSimilarity(buildToppingVector(state), getPrototypeToppingVector(prototype), 0.5);
  const archetypeAlignmentScore = getArchetypeAlignmentScore(archetype, prototype);

  const rawScore = weightedAverage([
    { score: coreAxesScore, weight: BASE_COMPONENT_WEIGHTS.coreAxes },
    { score: flavorProfileScore, weight: BASE_COMPONENT_WEIGHTS.flavorProfile },
    { score: proteinPreferenceScore, weight: BASE_COMPONENT_WEIGHTS.proteinPreference },
    { score: noodleScore, weight: BASE_COMPONENT_WEIGHTS.noodle },
    { score: toppingScore, weight: BASE_COMPONENT_WEIGHTS.topping },
    { score: archetypeAlignmentScore, weight: BASE_COMPONENT_WEIGHTS.archetypeAlignment },
  ]);

  const allergenResult = applyAllergenFilter(state, prototype, rawScore);

  return {
    prototype,
    rawScore,
    adjustedScore: allergenResult.adjustedScore,
    share: 0,
    blocked: allergenResult.blocked,
    warning: allergenResult.warning,
    blockedReasons: allergenResult.blockedReasons,
    warningReasons: allergenResult.warningReasons,
    breakdown: {
      coreAxisScore: coreAxesScore,
      flavorProfileScore,
      proteinPreferenceScore,
      noodleScore,
      toppingScore,
      archetypeAlignment: archetypeAlignmentScore,
      totalScore: allergenResult.adjustedScore,
    },
    componentScores: {
      coreAxes: coreAxesScore,
      flavorProfile: flavorProfileScore,
      proteinPreference: proteinPreferenceScore,
      noodle: noodleScore,
      topping: toppingScore,
      archetypeAlignment: archetypeAlignmentScore,
    },
  };
}

function attachShares(rows: PrototypeScoreRow[], useRaw = false): PrototypeScoreRow[] {
  const scores = rows.map((row) => (useRaw ? row.rawScore : row.adjustedScore));
  const shares = softmaxShares(scores);
  return rows.map((row, index) => ({ ...row, share: shares[index] ?? 0 }));
}

function pickTopRows(rows: PrototypeScoreRow[]): PrototypeScoreRow[] {
  const allowed = rows.filter((row) => !row.blocked).sort((a, b) => b.adjustedScore - a.adjustedScore);
  if (allowed.length > 0) return attachShares(allowed);
  const fallback = [...rows].sort((a, b) => b.rawScore - a.rawScore);
  return attachShares(fallback, true);
}

function buildReasons(row: PrototypeScoreRow): ResultReasonItem[] {
  const labels: Record<ScoreComponentKey, string> = {
    coreAxes: "主型四軸一致度",
    flavorProfile: "風味傾向一致度",
    proteinPreference: "素材接受度一致度",
    noodle: "麵條偏好一致度",
    topping: "配料偏好一致度",
    archetypeAlignment: "主型對齊度",
  };
  return Object.entries(row.componentScores)
    .map(([key, score]) => ({ label: labels[key as ScoreComponentKey], score: toPercentScore(score) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

function resolveMainCategory(topPrototype: RamenPrototype): CandidateMainCategory {
  return topPrototype.mainCategory;
}

export function generateResultSnapshot(state: ClassifierState): ResultSnapshot {
  const archetype = computeArchetypeResult(state);
  const borderlineHint = computeBorderlineTypeHint({ currentCode: archetype.code, userAxes: archetype.axes });
  const rows = RAMEN_PROTOTYPES.map((prototype) => computePrototypeScores(state, archetype, prototype));
  const rankedRows = pickTopRows(rows);
  const topRow = rankedRows[0];
  if (!topRow) throw new Error("No prototype candidates available to generate result snapshot.");
  const secondaryRows = rankedRows.slice(1, 3);
  const ingredientTags: IngredientTagScore[] = computeIngredientTags({
    state,
    archetype,
    topRows: [topRow, ...secondaryRows].map((row) => ({ prototype: row.prototype, share: row.share })),
  });

  return {
    archetype,
    borderlineHint,
    ingredientTags,
    mainCategory: resolveMainCategory(topRow.prototype),
    subCategory: topRow.prototype.subCategory,
    topResult: {
      typeId: topRow.prototype.id,
      displayName: topRow.prototype.name,
      score: toPercentScore(topRow.adjustedScore < 0 ? topRow.rawScore : topRow.adjustedScore),
      share: toPercentScore(topRow.share),
      summary: topRow.prototype.short,
    },
    secondaryResults: secondaryRows.map((row) => ({
      typeId: row.prototype.id,
      displayName: row.prototype.name,
      score: toPercentScore(row.adjustedScore < 0 ? row.rawScore : row.adjustedScore),
      share: toPercentScore(row.share),
      summary: row.prototype.short,
    })),
    reasons: buildReasons(topRow),
    blockedByAllergen: dedupe(rows.flatMap((row) => row.blockedReasons)),
    warningByAllergen: dedupe(rows.flatMap((row) => row.warningReasons)),
    generatedAt: new Date().toISOString(),
  };
}
