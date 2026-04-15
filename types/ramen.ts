/**
 * 新版 types/ramen.ts 定稿版
 */

export type FlowState =
  | "INTRO"
  | "CORE_AXES"
  | "FLAVOR_PROFILE"
  | "PROTEIN_PREFERENCES"
  | "NOODLE_TOPPING"
  | "ALLERGENS"
  | "RESULT_READY"
  | "RESULT_VIEW";

export type MainCategory =
  | "pork"
  | "chicken"
  | "beef"
  | "duck"
  | "seafood"
  | "miso_fermented"
  | "not_sure";

export interface CoreAxisAnswers {
  [key: string]: number | undefined;
  axis_richness?: number;
  axis_broth_body?: number;
  axis_impact?: number;
  axis_noodle_body?: number;
}

export interface FlavorProfileAnswers {
  [key: string]: number | undefined;
  flavor_meat_vs_sea?: number;
  flavor_fermented?: number;
  flavor_citrus?: number;
  flavor_spice?: number;
  flavor_fatty_sweet?: number;
}

export interface ProteinPreferenceAnswers {
  [key: string]: number | undefined;
  protein_pork?: number;
  protein_chicken?: number;
  protein_beef?: number;
  protein_duck?: number;
  protein_shrimp?: number;
  protein_shellfish?: number;
  protein_fish?: number;
  protein_miso?: number;
}

export interface NoodleAnswers {
  [key: string]: number | undefined;
  noodle_thickness?: number;
  noodle_firmness?: number;
  noodle_chewiness?: number;
  noodle_curl?: number;
}

export interface ToppingAnswers {
  [key: string]: number | undefined;
  topping_chashu?: number;
  topping_beef?: number;
  topping_egg?: number;
  topping_nori?: number;
  topping_spinach?: number;
  topping_menma?: number;
  topping_veg_pile?: number;
  topping_corn?: number;
  topping_butter?: number;
  topping_garlic?: number;
  topping_backfat?: number;
  topping_seafood?: number;
}

export interface AllergenAnswers {
  crustacean: boolean;
  shellfish: boolean;
  egg: boolean;
  milk: boolean;
  beef: boolean;
  pork: boolean;
}

export type QuestionSection =
  | "core_axes"
  | "flavor_profile"
  | "protein_preferences"
  | "noodle"
  | "topping";

export interface SliderQuestionConfig {
  id: string;
  section: QuestionSection;
  title: string;
  helper?: string;
  min?: number;
  max?: number;
  step?: number;
  leftLabel: string;
  rightLabel: string;
  required: boolean;
  defaultValue?: number;
}

export interface AllergenOption {
  id: keyof AllergenAnswers;
  label: string;
  helper?: string;
}

export interface ProteinTagVector {
  pork: number;
  chicken: number;
  beef: number;
  duck: number;
  shrimp: number;
  shellfish: number;
  fish: number;
  miso: number;
}

export interface BrothTypeVector {
  tonkotsu: number;
  shoyu: number;
  shio: number;
  miso: number;
  chicken_paitan: number;
  gyokai: number;
  shellfish: number;
  beef: number;
}

export interface BrothTasteVector {
  rich: number;
  salty: number;
  milky: number;
  seafood: number;
  beef: number;
  miso: number;
}

export interface IntensityVector {
  richness: number;
  oiliness: number;
  saltiness: number;
  umami: number;
  spiciness: number;
}

export interface NoodleVector {
  thickness: number;
  firmness: number;
  chewiness: number;
  curl: number;
}

export interface ToppingVector {
  chashu: number;
  beef: number;
  egg: number;
  nori: number;
  spinach: number;
  menma: number;
  veg_pile: number;
  corn: number;
  butter: number;
  garlic: number;
  backfat: number;
  seafood: number;
}

export interface FlavorModifierVector {
  citrusFresh: number;
  fattySweet: number;
  spiceWarmth: number;
}

export interface AllergenVector {
  crustacean: number;
  shellfish: number;
  egg: number;
  milk: number;
  beef: number;
  pork: number;
}

export interface RamenPrototype {
  id: string;
  name: string;
  short: string;
  mainCategory: Exclude<MainCategory, "not_sure">;
  subCategory: string;
  brothType: BrothTypeVector;
  brothTaste: BrothTasteVector;
  intensity: IntensityVector;
  noodles: NoodleVector;
  toppings: ToppingVector;
  flavorModifiers: FlavorModifierVector;
  allergens: AllergenVector;
  proteinTags: ProteinTagVector;
}

export interface ArchetypeAxes {
  richnessAxis: number;
  brothBodyAxis: number;
  impactAxis: number;
  noodleBodyAxis: number;
}

export interface ArchetypeResult {
  code: string;
  name: string;
  summary: string;
  axes: ArchetypeAxes;
}

export interface BorderlineTypeHint {
  code: string;
  name: string;
  distance: number;
  strength: "very_close" | "close" | "moderate" | "weak";
  changedAxis: Array<"richnessAxis" | "brothBodyAxis" | "impactAxis" | "noodleBodyAxis">;
  summary: string;
}

export interface IngredientTagScore {
  tag: string;
  score: number;
}

export interface ResultItem {
  typeId: string;
  displayName: string;
  score: number;
  share: number;
  summary?: string;
}

export interface ResultReasonItem {
  label: string;
  score: number;
}

export interface ResultSnapshot {
  archetype: ArchetypeResult;
  borderlineHint: BorderlineTypeHint | null;
  ingredientTags: IngredientTagScore[];
  mainCategory: Exclude<MainCategory, "not_sure">;
  subCategory: string;
  topResult: ResultItem;
  secondaryResults: ResultItem[];
  reasons: ResultReasonItem[];
  blockedByAllergen: string[];
  warningByAllergen: string[];
  generatedAt: string;
}

export interface InferredCategory {
  suggestedMainCategory: Exclude<MainCategory, "not_sure">;
  confidence: number;
  evidence: string[];
  candidates: Array<{
    category: Exclude<MainCategory, "not_sure">;
    score: number;
  }>;
}

export interface ValidationState {
  coreAxesValid: boolean;
  flavorProfileValid: boolean;
  proteinPreferencesValid: boolean;
  noodleToppingValid: boolean;
  allergenConfirmed: boolean;
  resultEligible: boolean;
}

export interface ClassifierState {
  currentState: FlowState;
  progressStage: number;
  coreAxisAnswers: CoreAxisAnswers;
  flavorProfileAnswers: FlavorProfileAnswers;
  proteinPreferenceAnswers: ProteinPreferenceAnswers;
  noodleAnswers: NoodleAnswers;
  toppingAnswers: ToppingAnswers;
  allergenAnswers: AllergenAnswers;
  allergenConfirmed: boolean;
  skippedAdvancedAdjustments: boolean;
  inferredMainDirection: string | null;
  archetypePreview: ArchetypeResult | null;
  resultSnapshot: ResultSnapshot | null;
  validation: ValidationState;
}

export type ClassifierAction =
  | { type: "START_FLOW" }
  | { type: "ANSWER_CORE_AXIS"; payload: { id: keyof CoreAxisAnswers; value: number } }
  | { type: "ANSWER_FLAVOR_PROFILE"; payload: { id: keyof FlavorProfileAnswers; value: number } }
  | { type: "ANSWER_PROTEIN_PREFERENCE"; payload: { id: keyof ProteinPreferenceAnswers; value: number } }
  | { type: "ANSWER_NOODLE"; payload: { id: keyof NoodleAnswers; value: number } }
  | { type: "ANSWER_TOPPING"; payload: { id: keyof ToppingAnswers; value: number } }
  | { type: "ANSWER_ALLERGEN"; payload: { id: keyof AllergenAnswers; value: boolean } }
  | { type: "CONFIRM_ALLERGENS" }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "GENERATE_RESULT" }
  | { type: "RESET_FLOW" }
  | { type: "RESTART_FROM_RESULT" }
  | { type: "LOAD_SAVED_STATE"; payload: ClassifierState };

export interface PrototypeScoreBreakdown {
  coreAxisScore?: number;
  flavorProfileScore?: number;
  proteinPreferenceScore?: number;
  noodleScore?: number;
  toppingScore?: number;
  archetypeAlignment?: number;
  allergenPenalty?: number;
  totalScore?: number;
}

export interface PrototypeMatchRow {
  prototype: RamenPrototype;
  rawScore: number;
  adjustedScore: number;
  share: number;
  blocked: boolean;
  warning: boolean;
  blockedReasons: string[];
  warningReasons: string[];
  breakdown?: PrototypeScoreBreakdown;
}

export type CoreAxisQuestionId = keyof CoreAxisAnswers;
export type FlavorProfileQuestionId = keyof FlavorProfileAnswers;
export type ProteinPreferenceQuestionId = keyof ProteinPreferenceAnswers;
export type NoodleQuestionId = keyof NoodleAnswers;
export type ToppingQuestionId = keyof ToppingAnswers;
export type AllergenQuestionId = keyof AllergenAnswers;
