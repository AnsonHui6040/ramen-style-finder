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

function countAnsweredNumbers(record: Record<string, unknown>): number {
  return Object.values(record).filter((value) => typeof value === "number" && Number.isFinite(value)).length;
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
    allergenAnswers: {
      crustacean: false,
      shellfish: false,
      egg: false,
      milk: false,
      beef: false,
      pork: false,
    },
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
  const coreAxesValid = countAnsweredNumbers(state.coreAxisAnswers) >= 4;
  const flavorProfileValid = countAnsweredNumbers(state.flavorProfileAnswers) >= 4;
  const proteinPreferencesValid = countAnsweredNumbers(state.proteinPreferenceAnswers) >= 5;
  const noodleCount = countAnsweredNumbers(state.noodleAnswers);
  const toppingCount = countAnsweredNumbers(state.toppingAnswers);
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
  if (countAnsweredNumbers(state.coreAxisAnswers) < 4) return null;
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
    case "RESULT_VIEW":
      return "ALLERGENS";
    default:
      return current;
  }
}

function answerCoreAxis(state: ClassifierState, payload: { id: keyof CoreAxisAnswers; value: number }): ClassifierState {
  const next = {
    ...state,
    coreAxisAnswers: { ...state.coreAxisAnswers, [payload.id]: payload.value },
  };
  return withValidation(withDerivedPreview(next));
}

function answerFlavorProfile(state: ClassifierState, payload: { id: keyof FlavorProfileAnswers; value: number }): ClassifierState {
  const next = {
    ...state,
    flavorProfileAnswers: { ...state.flavorProfileAnswers, [payload.id]: payload.value },
  };
  return withValidation(withDerivedPreview(next));
}

function answerProteinPreference(state: ClassifierState, payload: { id: keyof ProteinPreferenceAnswers; value: number }): ClassifierState {
  const next = {
    ...state,
    proteinPreferenceAnswers: { ...state.proteinPreferenceAnswers, [payload.id]: payload.value },
  };
  return withValidation(withDerivedPreview(next));
}

function answerNoodle(state: ClassifierState, payload: { id: keyof NoodleAnswers; value: number }): ClassifierState {
  const next = {
    ...state,
    noodleAnswers: { ...state.noodleAnswers, [payload.id]: payload.value },
  };
  return withValidation(withDerivedPreview(next));
}

function answerTopping(state: ClassifierState, payload: { id: keyof ToppingAnswers; value: number }): ClassifierState {
  const next = {
    ...state,
    toppingAnswers: { ...state.toppingAnswers, [payload.id]: payload.value },
  };
  return withValidation(withDerivedPreview(next));
}

function answerAllergen(state: ClassifierState, payload: { id: keyof AllergenAnswers; value: boolean }): ClassifierState {
  const next = {
    ...state,
    allergenAnswers: { ...state.allergenAnswers, [payload.id]: payload.value },
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
      return action.payload;
    default:
      return state;
  }
}
