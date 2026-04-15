import type { ArchetypeResult, ClassifierState, IngredientTagScore, RamenPrototype } from "@/types/ramen";

type ProteinKey = "pork" | "chicken" | "beef" | "duck" | "shrimp" | "shellfish" | "fish" | "miso";

const PROTEIN_KEYS: ProteinKey[] = ["pork", "chicken", "beef", "duck", "shrimp", "shellfish", "fish", "miso"];

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0));
}

function normalizeTagName(key: ProteinKey): string {
  const map: Record<ProteinKey, string> = {
    pork: "PORK",
    chicken: "CHICKEN",
    beef: "BEEF",
    duck: "DUCK",
    shrimp: "SHRIMP",
    shellfish: "SHELLFISH",
    fish: "FISH",
    miso: "MISO",
  };
  return map[key];
}

function getUserProteinPreference(state: ClassifierState, key: ProteinKey): number {
  const map: Record<ProteinKey, keyof typeof state.proteinPreferenceAnswers> = {
    pork: "protein_pork",
    chicken: "protein_chicken",
    beef: "protein_beef",
    duck: "protein_duck",
    shrimp: "protein_shrimp",
    shellfish: "protein_shellfish",
    fish: "protein_fish",
    miso: "protein_miso",
  };
  return clamp(state.proteinPreferenceAnswers[map[key]] ?? 50);
}

function getArchetypeBias(archetype: ArchetypeResult, key: ProteinKey): number {
  const { code } = archetype;
  if (code.startsWith("RW")) {
    if (key === "pork" || key === "beef" || key === "duck") return 70;
  }
  if (code.startsWith("CK")) {
    if (key === "fish" || key === "shellfish" || key === "chicken" || key === "duck") return 68;
  }
  if (code.includes("H")) {
    if (key === "pork" || key === "beef" || key === "miso") return 65;
  }
  return 50;
}

export function computeIngredientTags(params: {
  state: ClassifierState;
  archetype: ArchetypeResult;
  topRows: Array<{
    prototype: RamenPrototype;
    share: number; // 0..1
  }>;
}): IngredientTagScore[] {
  const { state, archetype, topRows } = params;

  const results = PROTEIN_KEYS.map((key) => {
    const userPreference = getUserProteinPreference(state, key);
    const prototypeSignal =
      topRows.reduce((sum, row) => {
        return sum + (row.prototype.proteinTags[key] ?? 0) * row.share;
      }, 0) || 0;
    const archetypeBias = getArchetypeBias(archetype, key);
    const finalScore = userPreference * 0.4 + prototypeSignal * 0.45 + archetypeBias * 0.15;

    return {
      tag: normalizeTagName(key),
      score: Math.round(clamp(finalScore)),
    };
  });

  return results.sort((a, b) => b.score - a.score).slice(0, 3);
}
