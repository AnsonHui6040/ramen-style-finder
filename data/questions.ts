import type {
  AllergenAnswers,
  AllergenOption,
  CoreAxisAnswers,
  FlavorProfileAnswers,
  FlowState,
  NoodleAnswers,
  ProteinPreferenceAnswers,
  QuestionSection,
  SliderQuestionConfig,
  ToppingAnswers,
} from "@/types/ramen";

function q(config: SliderQuestionConfig): SliderQuestionConfig {
  return {
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 50,
    ...config,
  };
}

export const CORE_AXES_QUESTIONS: SliderQuestionConfig[] = [
  q({ id: "axis_richness", section: "core_axes", title: "你想吃清爽還是濃厚？", helper: "這題決定你整體是偏輕盈還是偏厚重。", leftLabel: "清爽", rightLabel: "濃厚", required: true }),
  q({ id: "axis_broth_body", section: "core_axes", title: "你想要清湯還是白湯？", helper: "重點不是鹹淡，而是湯體感偏清亮還是偏乳化包覆。", leftLabel: "清湯", rightLabel: "白湯", required: true }),
  q({ id: "axis_impact", section: "core_axes", title: "你想要溫和還是重口？", helper: "這題綜合鹹度、油感、蒜感與整體衝擊感。", leftLabel: "溫和", rightLabel: "重口", required: true }),
  q({ id: "axis_noodle_body", section: "core_axes", title: "你想要細滑還是粗嚼？", helper: "這題是主型四軸之一，麵體存在感會直接影響你的型別。", leftLabel: "細滑", rightLabel: "粗嚼", required: true }),
];

export const FLAVOR_PROFILE_QUESTIONS: SliderQuestionConfig[] = [
  q({ id: "flavor_meat_vs_sea", section: "flavor_profile", title: "你比較偏肉香還是海味？", helper: "先區分肉感系與鮮味海味系的大方向。", leftLabel: "肉香", rightLabel: "海味", required: true }),
  q({ id: "flavor_fermented", section: "flavor_profile", title: "你想要味噌或發酵香嗎？", helper: "這題用來拉開味噌／發酵系與一般湯底。", leftLabel: "不太要", rightLabel: "很想要", required: true }),
  q({ id: "flavor_citrus", section: "flavor_profile", title: "你喜歡清香、柑橘、轉味感嗎？", helper: "這題對清亮系、鴨柑橘系與創作型很重要。", leftLabel: "不太要", rightLabel: "很想要", required: true }),
  q({ id: "flavor_spice", section: "flavor_profile", title: "你接受香料感嗎？", helper: "這裡是香料層次，不等於辣度。", leftLabel: "不太要", rightLabel: "很可以", required: true }),
  q({ id: "flavor_fatty_sweet", section: "flavor_profile", title: "你喜歡肉脂甜香感嗎？", helper: "白湯、牛系、鴨系、濃厚豚系都很吃這題。", leftLabel: "乾淨俐落", rightLabel: "越濃越香", required: false }),
];

export const PROTEIN_PREFERENCE_QUESTIONS: SliderQuestionConfig[] = [
  q({ id: "protein_pork", section: "protein_preferences", title: "你對豬系接受度如何？", helper: "不是要你先選豬，而是看你對豬系整體是否開放。", leftLabel: "不太想要", rightLabel: "非常喜歡", required: false }),
  q({ id: "protein_chicken", section: "protein_preferences", title: "你對雞系接受度如何？", leftLabel: "不太想要", rightLabel: "非常喜歡", required: false }),
  q({ id: "protein_beef", section: "protein_preferences", title: "你對牛香接受度如何？", leftLabel: "不太想要", rightLabel: "非常喜歡", required: false }),
  q({ id: "protein_duck", section: "protein_preferences", title: "你對鴨香接受度如何？", leftLabel: "不太想要", rightLabel: "非常喜歡", required: false }),
  q({ id: "protein_shrimp", section: "protein_preferences", title: "你對蝦鮮接受度如何？", leftLabel: "不太想要", rightLabel: "非常喜歡", required: false }),
  q({ id: "protein_shellfish", section: "protein_preferences", title: "你對貝鮮接受度如何？", leftLabel: "不太想要", rightLabel: "非常喜歡", required: false }),
  q({ id: "protein_fish", section: "protein_preferences", title: "你對魚介感接受度如何？", leftLabel: "不太想要", rightLabel: "非常喜歡", required: false }),
  q({ id: "protein_miso", section: "protein_preferences", title: "你對味噌／發酵系接受度如何？", leftLabel: "不太想要", rightLabel: "非常喜歡", required: false }),
];

export const NOODLE_QUESTIONS: SliderQuestionConfig[] = [
  q({ id: "noodle_thickness", section: "noodle", title: "你喜歡細麵還是粗麵？", helper: "粗細對流派辨識非常重要。", leftLabel: "細麵", rightLabel: "粗麵", required: true }),
  q({ id: "noodle_firmness", section: "noodle", title: "你喜歡偏軟還是偏硬？", helper: "這題反映口感偏好，不直接等於重口。", leftLabel: "偏軟", rightLabel: "偏硬", required: true }),
  q({ id: "noodle_chewiness", section: "noodle", title: "你喜歡滑順還是更有嚼勁？", helper: "會直接影響你的麵體軸與主型。", leftLabel: "滑順", rightLabel: "有嚼勁", required: true }),
  q({ id: "noodle_curl", section: "noodle", title: "你喜歡比較直還是比較捲？", helper: "這題辨識力較次要，但能補足流派輪廓。", leftLabel: "比較直", rightLabel: "比較捲", required: false }),
];

export const TOPPING_QUESTIONS: SliderQuestionConfig[] = [
  q({ id: "topping_chashu", section: "topping", title: "你想要叉燒多明顯？", leftLabel: "不太想要", rightLabel: "非常想要", required: false }),
  q({ id: "topping_beef", section: "topping", title: "你想要牛肉配料多明顯？", leftLabel: "不太想要", rightLabel: "非常想要", required: false }),
  q({ id: "topping_egg", section: "topping", title: "你想要蛋嗎？", leftLabel: "不太想要", rightLabel: "非常想要", required: false }),
  q({ id: "topping_nori", section: "topping", title: "你想要海苔嗎？", leftLabel: "不太想要", rightLabel: "非常想要", required: false }),
  q({ id: "topping_spinach", section: "topping", title: "你想要菠菜嗎？", leftLabel: "不太想要", rightLabel: "非常想要", required: false }),
  q({ id: "topping_menma", section: "topping", title: "你想要筍乾嗎？", leftLabel: "不太想要", rightLabel: "非常想要", required: false }),
  q({ id: "topping_veg_pile", section: "topping", title: "你想要很多菜嗎？", helper: "這題對厚麵重口類型特別有辨識力。", leftLabel: "不太想要", rightLabel: "非常想要", required: false }),
  q({ id: "topping_corn", section: "topping", title: "你想要玉米嗎？", leftLabel: "不太想要", rightLabel: "非常想要", required: false }),
  q({ id: "topping_butter", section: "topping", title: "你想要奶油嗎？", leftLabel: "不太想要", rightLabel: "非常想要", required: false }),
  q({ id: "topping_garlic", section: "topping", title: "你想要蒜嗎？", leftLabel: "不太想要", rightLabel: "非常想要", required: false }),
  q({ id: "topping_backfat", section: "topping", title: "你想要背脂／油脂感嗎？", leftLabel: "不太想要", rightLabel: "非常想要", required: false }),
  q({ id: "topping_seafood", section: "topping", title: "你想要海鮮料嗎？", leftLabel: "不太想要", rightLabel: "非常想要", required: false }),
];

export const ALLERGEN_OPTIONS: AllergenOption[] = [
  { id: "crustacean", label: "甲殼類（蝦、蟹）", helper: "高風險時應直接排除蝦湯相關結果。" },
  { id: "shellfish", label: "貝類", helper: "高風險時應排除牡蠣、貝鮮與部分混合型。" },
  { id: "egg", label: "蛋" },
  { id: "milk", label: "乳製品" },
  { id: "beef", label: "牛肉" },
  { id: "pork", label: "豬肉" },
];

export const SECTION_REQUIREMENTS = {
  coreAxes: 4,
  flavorProfile: 4,
  proteinPreferences: 5,
  noodle: 3,
  topping: 5,
} as const;

export const FLOW_TO_SECTIONS: Record<Exclude<FlowState, "INTRO" | "RESULT_READY" | "RESULT_VIEW" | "ALLERGENS">, QuestionSection[]> = {
  CORE_AXES: ["core_axes"],
  FLAVOR_PROFILE: ["flavor_profile"],
  PROTEIN_PREFERENCES: ["protein_preferences"],
  NOODLE_TOPPING: ["noodle", "topping"],
};

export const ALL_SLIDER_QUESTIONS: SliderQuestionConfig[] = [
  ...CORE_AXES_QUESTIONS,
  ...FLAVOR_PROFILE_QUESTIONS,
  ...PROTEIN_PREFERENCE_QUESTIONS,
  ...NOODLE_QUESTIONS,
  ...TOPPING_QUESTIONS,
];

export type CoreAxisQuestionId = keyof CoreAxisAnswers;
export type FlavorProfileQuestionId = keyof FlavorProfileAnswers;
export type ProteinPreferenceQuestionId = keyof ProteinPreferenceAnswers;
export type NoodleQuestionId = keyof NoodleAnswers;
export type ToppingQuestionId = keyof ToppingAnswers;
