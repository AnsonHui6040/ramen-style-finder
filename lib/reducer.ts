import { computeArchetypeResult } from "@/lib/archetype";
import { generateResultSnapshot } from "@/lib/scoring";
import type {
  AllergenAnswers,
  ClassifierAction,
  ClassifierState,
  CoreAxisAnswers,
  FlavorProfileAnswers,
  FlowState,
  NoodleAnswers,
  ProteinPreferenceAnswers,
  ResultSnapshot,
  ToppingAnswers,
} from "@/types/ramen";

const CORE_AXIS_IDS = ["axis_richness", "axis_broth_body", "axis_impact", "axis_noodle_body"] as const;
const FLAVOR_PROFILE_IDS = ["flavor_meat_vs_sea", "flavor_fermented", "flavor_citrus", "flavor_spice", "flavor_fatty_sweet"] as const;
const PROTEIN_PREFERENCE_IDS = [
  "protein_pork",
  "protein_chicken",
  "protein_beef",
  "protein_duck",
  "protein_shrimp",
  "protein_shellfish",
  "protein_fish",
  "protein_miso",
] as const;
const NOODLE_IDS = ["noodle_thickness", "noodle_firmness", "noodle_chewiness", "noodle_curl"] as const;
const TOPPING_IDS = [
  "topping_chashu",
  "topping_beef",
  "topping_egg",
  "topping_nori",
  "topping_spinach",
  "topping_menma",
  "topping_veg_pile",
  "topping_corn",
  "topping_butter",
  "topping_garlic",
  "topping_backfat",
  "topping_seafood",
] as const;
const ALLERGEN_IDS = ["crustacean", "shellfish", "egg", "milk", "beef", "pork"] as const;
const FLOW_STATES: FlowState[] = [
  "INTRO",
  "CORE_AXES",
  "FLAVOR_PROFILE",
  "PROTEIN_PREFERENCES",
  "NOODLE_TOPPING",
  "ALLERGENS",
  "RESULT_READY",
  "RESULT_VIEW",
];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : 50));
}

function countAnsweredNumbers(record: Record<string, unknown>, allowedKeys: readonly string[]): number {
  return allowedKeys.filter((key) => typeof record[key] === "number" && Number.isFinite(record[key])).length;
}

function sanitizeNumberRecord<T extends Record<string, number | undefined>>(
  source: unknown,
  allowedKeys: readonly string[],
): T {
  if (!isPlainObject(source)) return {} as T;

  return allowedKeys.reduce<Record<string, number>>((acc, key) => {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      acc[key] = clamp(value);
    }
    return acc;
  }, {}) as T;
}

function sanitizeAllergenAnswers(source: unknown): AllergenAnswers {
  const defaults = createDefaultAllergenAnswers();
  if (!isPlainObject(source)) return defaults;

  return ALLERGEN_IDS.reduce<AllergenAnswers>((acc, key) => {
    acc[key] = source[key] === true;
    return acc;
  }, defaults);
}

function createDefaultAllergenAnswers(): AllergenAnswers {
  return {
    crustacean: false,
    shellfish: false,
    egg: false,
    milk: false,
    beef: false,
    pork: false,
  };
}

function sanitizeFlowState(source: unknown): FlowState {
  return typeof source === "string" && FLOW_STATES.includes(source as FlowState) ? (source as FlowState) : "INTRO";
}

function isFlowReachable(state: ClassifierState): boolean {
  switch (state.currentState) {
    case "INTRO":
    case "CORE_AXES":
      return true;
    case "FLAVOR_PROFILE":
      return state.validation.coreAxesValid;
    case "PROTEIN_PREFERENCES":
      return state.validation.coreAxesValid && state.validation.flavorProfileValid;
    case "NOODLE_TOPPING":
      return state.validation.coreAxesValid && state.validation.flavorProfileValid && state.validation.proteinPreferencesValid;
    case "ALLERGENS":
      return state.validation.coreAxesValid && state.validation.flavorProfileValid && state.validation.proteinPreferencesValid && state.validation.noodleToppingValid;
    case "RESULT_READY":
    case "RESULT_VIEW":
      return state.validation.resultEligible;
    default:
      return false;
  }
}

function sanitizePersistedState(source: unknown): ClassifierState {
  if (!isPlainObject(source)) return createDefaultClassifierState();

  const defaultState = createDefaultClassifierState();
  const candidate = withValidation({
    ...defaultState,
    currentState: sanitizeFlowState(source.currentState),
    coreAxisAnswers: sanitizeNumberRecord<CoreAxisAnswers>(source.coreAxisAnswers, CORE_AXIS_IDS),
    flavorProfileAnswers: sanitizeNumberRecord<FlavorProfileAnswers>(source.flavorProfileAnswers, FLAVOR_PROFILE_IDS),
    proteinPreferenceAnswers: sanitizeNumberRecord<ProteinPreferenceAnswers>(source.proteinPreferenceAnswers, PROTEIN_PREFERENCE_IDS),
    noodleAnswers: sanitizeNumberRecord<NoodleAnswers>(source.noodleAnswers, NOODLE_IDS),
    toppingAnswers: sanitizeNumberRecord<ToppingAnswers>(source.toppingAnswers, TOPPING_IDS),
    allergenAnswers: sanitizeAllergenAnswers(source.allergenAnswers),
    allergenConfirmed: source.allergenConfirmed === true,
    skippedAdvancedAdjustments: source.skippedAdvancedAdjustments === true,
    inferredMainDirection: typeof source.inferredMainDirection === "string" ? source.inferredMainDirection : null,
    archetypePreview: null,
    resultSnapshot: null,
  });

  const reachableState = isFlowReachable(candidate) ? candidate : { ...candidate, currentState: "INTRO" as const, resultSnapshot: null };
  const withPreview = withDerivedPreview(reachableState);

  if (withPreview.currentState !== "RESULT_VIEW" && withPreview.currentState !== "RESULT_READY") {
    return withValidation(withPreview);
  }

  if (!withPreview.validation.resultEligible) {
    return withValidation({ ...withPreview, currentState: "ALLERGENS", resultSnapshot: null });
  }

  try {
    const snapshot: ResultSnapshot = generateResultSnapshot(withPreview);
    return withValidation({ ...withPreview, currentState: "RESULT_VIEW", resultSnapshot: snapshot });
  } catch {
    return withValidation({ ...withPreview, currentState: "ALLERGENS", resultSnapshot: null });
  }
}

export function createDefaultClassifierState(): ClassifierState {
  return {
    currentState: "INTRO",
    progressStage: 0,
    coreAxisAnswers: {},
    flavorProfileAnswers: {},
    proteinPreferenceAnswers: {},
    noodleAnswers: {},
    toppingAnswers: {},
    allergenAnswers: createDefaultAllergenAnswers(),
    allergenConfirmed: false,
    skippedAdvancedAdjustments: false,
    inferredMainDirection: null,
    archetypePreview: null,
    resultSnapshot: null,
    validation: {
      coreAxesValid: false,
      flavorProfileValid: false,
      proteinPreferencesValid: false,
      noodleToppingValid: false,
      allergenConfirmed: false,
      resultEligible: false,
    },
  };
}

function buildValidation(state: ClassifierState): ClassifierState["validation"] {
  const coreAxesValid = countAnsweredNumbers(state.coreAxisAnswers, CORE_AXIS_IDS) >= 4;
  const flavorProfileValid = countAnsweredNumbers(state.flavorProfileAnswers, FLAVOR_PROFILE_IDS) >= 4;
  const proteinPreferencesValid = countAnsweredNumbers(state.proteinPreferenceAnswers, PROTEIN_PREFERENCE_IDS) >= 5;
  const noodleCount = countAnsweredNumbers(state.noodleAnswers, NOODLE_IDS);
  const toppingCount = countAnsweredNumbers(state.toppingAnswers, TOPPING_IDS);
  const noodleToppingValid = noodleCount >= 3 && toppingCount >= 5;
  const allergenConfirmed = state.allergenConfirmed;

  return {
    coreAxesValid,
    flavorProfileValid,
    proteinPreferencesValid,
    noodleToppingValid,
    allergenConfirmed,
    resultEligible: coreAxesValid && flavorProfileValid && proteinPreferencesValid && noodleToppingValid && allergenConfirmed,
  };
}

function getProgressStage(flow: FlowState): number {
  switch (flow) {
    case "INTRO":
      return 0;
    case "CORE_AXES":
      return 1;
    case "FLAVOR_PROFILE":
      return 2;
    case "PROTEIN_PREFERENCES":
      return 3;
    case "NOODLE_TOPPING":
      return 4;
    case "ALLERGENS":
      return 5;
    case "RESULT_READY":
    case "RESULT_VIEW":
      return 6;
    default:
      return 0;
  }
}

function withValidation(state: ClassifierState): ClassifierState {
  return {
    ...state,
    progressStage: getProgressStage(state.currentState),
    validation: buildValidation(state),
  };
}

function maybeBuildArchetypePreview(state: ClassifierState) {
  if (countAnsweredNumbers(state.coreAxisAnswers, CORE_AXIS_IDS) < 4) return null;
  try {
    return computeArchetypeResult(state);
  } catch {
    return null;
  }
}

function withDerivedPreview(state: ClassifierState): ClassifierState {
  const archetypePreview = maybeBuildArchetypePreview(state);
  let inferredMainDirection: string | null = state.inferredMainDirection;

  if (archetypePreview) {
    const code = archetypePreview.code;
    if (code.startsWith("RW") || code.startsWith("RK")) inferredMainDirection = "rich_broth_family";
    else if (code.startsWith("CK")) inferredMainDirection = "clear_broth_family";
    else if (code.startsWith("CW")) inferredMainDirection = "light_white_broth_family";
    else inferredMainDirection = null;
  }

  return {
    ...state,
    archetypePreview,
    inferredMainDirection,
    resultSnapshot: null,
  };
}

function transition(state: ClassifierState, nextState: FlowState): ClassifierState {
  return withValidation({ ...state, currentState: nextState });
}

function getPreviousState(current: FlowState): FlowState {
  switch (current) {
    case "CORE_AXES":
      return "INTRO";
    case "FLAVOR_PROFILE":
      return "CORE_AXES";
    case "PROTEIN_PREFERENCES":
      return "FLAVOR_PROFILE";
    case "NOODLE_TOPPING":
      return "PROTEIN_PREFERENCES";
    case "ALLERGENS":
      return "NOODLE_TOPPING";
    case "RESULT_READY":
    case "RESULT_VIEW":
      return "ALLERGENS";
    default:
      return current;
  }
}

function answerCoreAxis(state: ClassifierState, payload: { id: keyof CoreAxisAnswers; value: number }): ClassifierState {
  const next = {
    ...state,
    coreAxisAnswers: { ...state.coreAxisAnswers, [payload.id]: clamp(payload.value) },
  };
  return withValidation(withDerivedPreview(next));
}

function answerFlavorProfile(state: ClassifierState, payload: { id: keyof FlavorProfileAnswers; value: number }): ClassifierState {
  const next = {
    ...state,
    flavorProfileAnswers: { ...state.flavorProfileAnswers, [payload.id]: clamp(payload.value) },
  };
  return withValidation(withDerivedPreview(next));
}

function answerProteinPreference(state: ClassifierState, payload: { id: keyof ProteinPreferenceAnswers; value: number }): ClassifierState {
  const next = {
    ...state,
    proteinPreferenceAnswers: { ...state.proteinPreferenceAnswers, [payload.id]: clamp(payload.value) },
  };
  return withValidation(withDerivedPreview(next));
}

function answerNoodle(state: ClassifierState, payload: { id: keyof NoodleAnswers; value: number }): ClassifierState {
  const next = {
    ...state,
    noodleAnswers: { ...state.noodleAnswers, [payload.id]: clamp(payload.value) },
  };
  return withValidation(withDerivedPreview(next));
}

function answerTopping(state: ClassifierState, payload: { id: keyof ToppingAnswers; value: number }): ClassifierState {
  const next = {
    ...state,
    toppingAnswers: { ...state.toppingAnswers, [payload.id]: clamp(payload.value) },
  };
  return withValidation(withDerivedPreview(next));
}

function answerAllergen(state: ClassifierState, payload: { id: keyof AllergenAnswers; value: boolean }): ClassifierState {
  const next = {
    ...state,
    allergenAnswers: { ...state.allergenAnswers, [payload.id]: payload.value === true },
    allergenConfirmed: false,
  };
  return withValidation(next);
}

export function classifierReducer(state: ClassifierState, action: ClassifierAction): ClassifierState {
  switch (action.type) {
    case "START_FLOW":
      return transition(state, "CORE_AXES");
    case "ANSWER_CORE_AXIS":
      return answerCoreAxis(state, action.payload);
    case "ANSWER_FLAVOR_PROFILE":
      return answerFlavorProfile(state, action.payload);
    case "ANSWER_PROTEIN_PREFERENCE":
      return answerProteinPreference(state, action.payload);
    case "ANSWER_NOODLE":
      return answerNoodle(state, action.payload);
    case "ANSWER_TOPPING":
      return answerTopping(state, action.payload);
    case "ANSWER_ALLERGEN":
      return answerAllergen(state, action.payload);
    case "CONFIRM_ALLERGENS":
      return withValidation({ ...state, allergenConfirmed: true });
    case "NEXT_STEP": {
      switch (state.currentState) {
        case "INTRO":
          return transition(state, "CORE_AXES");
        case "CORE_AXES":
          return state.validation.coreAxesValid ? transition(state, "FLAVOR_PROFILE") : state;
        case "FLAVOR_PROFILE":
          return state.validation.flavorProfileValid ? transition(state, "PROTEIN_PREFERENCES") : state;
        case "PROTEIN_PREFERENCES":
          return state.validation.proteinPreferencesValid ? transition(state, "NOODLE_TOPPING") : state;
        case "NOODLE_TOPPING":
          return state.validation.noodleToppingValid ? transition(state, "ALLERGENS") : state;
        case "ALLERGENS":
          return state.validation.allergenConfirmed ? classifierReducer(state, { type: "GENERATE_RESULT" }) : state;
        default:
          return state;
      }
    }
    case "PREV_STEP":
      return transition(state, getPreviousState(state.currentState));
    case "GENERATE_RESULT": {
      if (!state.validation.resultEligible) return state;
      const snapshot: ResultSnapshot = generateResultSnapshot(state);
      return withValidation({ ...state, currentState: "RESULT_VIEW", resultSnapshot: snapshot });
    }
    case "RESTART_FROM_RESULT":
      return withValidation({ ...createDefaultClassifierState(), currentState: "CORE_AXES", progressStage: getProgressStage("CORE_AXES") });
    case "RESET_FLOW":
      return createDefaultClassifierState();
    case "LOAD_SAVED_STATE":
      return sanitizePersistedState(action.payload);
    default:
      return state;
  }
}
