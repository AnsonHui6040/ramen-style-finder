export type TypeCode =
  | "CKLF"
  | "CKLT"
  | "CKHF"
  | "CKHT"
  | "CWLF"
  | "CWLT"
  | "CWHF"
  | "CWHT"
  | "RKLF"
  | "RKLT"
  | "RKHF"
  | "RKHT"
  | "RWLF"
  | "RWLT"
  | "RWHF"
  | "RWHT";

export type TypeFamily =
  | "清亮系"
  | "白湯系"
  | "厚湯系"
  | "濃白系";

export interface TypeProfile {
  code: TypeCode;
  name: string;
  short: string;
  summary: string;
  family: TypeFamily;
  axes: {
    richness: "C" | "R";
    broth: "K" | "W";
    impact: "L" | "H";
    noodle: "F" | "T";
  };
  axisLabels: {
    richness: string;
    broth: string;
    impact: string;
    noodle: string;
  };
  ingredientTags: string[];
  relatedPrototypeIds: string[];
  neighborCodes: TypeCode[];
  homepageFeatured?: boolean;
}

export const TYPE_PROFILES: TypeProfile[] = [
  {
    code: "CKLF",
    name: "清亮細緻型",
    short: "偏清爽、清湯、溫和、細滑，重視乾淨輪廓與俐落入口。",
    summary:
      "這型通常喜歡清楚、乾淨、層次分明的湯感，不追求厚重包覆，麵體也偏向細滑、俐落與容易入口。常見會被雞清湯、魚介清湯、鴨清湯這類方向吸引。",
    family: "清亮系",
    axes: { richness: "C", broth: "K", impact: "L", noodle: "F" },
    axisLabels: {
      richness: "清爽",
      broth: "清湯",
      impact: "溫和",
      noodle: "細滑",
    },
    ingredientTags: ["CHICKEN", "FISH", "DUCK"],
    relatedPrototypeIds: ["chicken_clear", "gyokai_clear", "duck_clear_negi"],
    neighborCodes: ["CKLT", "CWLF", "CKHF"],
    homepageFeatured: true,
  },
  {
    code: "CKLT",
    name: "清湯厚麵型",
    short: "整體仍偏清亮，但更在意麵體存在感與咬感。",
    summary:
      "這型雖然一樣偏好清湯與乾淨輪廓，但不想要太過細緻的麵感，會希望麵體更厚、更有咬感，整體吃起來更扎實。常見落在清湯系但麵存在感偏強的風格。",
    family: "清亮系",
    axes: { richness: "C", broth: "K", impact: "L", noodle: "T" },
    axisLabels: {
      richness: "清爽",
      broth: "清湯",
      impact: "溫和",
      noodle: "粗嚼",
    },
    ingredientTags: ["CHICKEN", "FISH", "PORK"],
    relatedPrototypeIds: ["chicken_clear", "pork_clear_shoyu", "gyokai_clear"],
    neighborCodes: ["CKLF", "CWLT", "CKHT"],
  },
  {
    code: "CKHF",
    name: "清湯銳感型",
    short: "偏清湯，但接受更高鹹感、油感或香氣衝擊。",
    summary:
      "這型仍屬清湯與俐落派，但口味上不一定保守，能接受較強的鹹感、香氣與刺激，屬於乾淨但不無聊的類型。常見會喜歡較有個性的清湯系、鴨清湯或創作型清湯。",
    family: "清亮系",
    axes: { richness: "C", broth: "K", impact: "H", noodle: "F" },
    axisLabels: {
      richness: "清爽",
      broth: "清湯",
      impact: "重口",
      noodle: "細滑",
    },
    ingredientTags: ["DUCK", "FISH", "CHICKEN"],
    relatedPrototypeIds: ["duck_clear_negi", "gyokai_clear", "chicken_clear"],
    neighborCodes: ["CKLF", "CKHT", "CWHT"],
    homepageFeatured: true,
  },
  {
    code: "CKHT",
    name: "清湯硬派型",
    short: "清湯、存在感強、刺激度高，整體更有個性。",
    summary:
      "這型會想保留清湯的輪廓，但又不喜歡太溫吞，接受較高衝擊感與更有存在感的麵體，整體個性明顯。常見接近高辨識度清湯、鴨系清湯、或偏硬派的創作型清湯。",
    family: "清亮系",
    axes: { richness: "C", broth: "K", impact: "H", noodle: "T" },
    axisLabels: {
      richness: "清爽",
      broth: "清湯",
      impact: "重口",
      noodle: "粗嚼",
    },
    ingredientTags: ["DUCK", "PORK", "FISH"],
    relatedPrototypeIds: ["duck_clear_negi", "pork_clear_shoyu", "gyokai_clear"],
    neighborCodes: ["CKHF", "CKLT", "RKHT"],
  },
  {
    code: "CWLF",
    name: "輕白滑順型",
    short: "偏白湯但不厚重，重視滑順與溫和感。",
    summary:
      "這型喜歡白湯或帶乳化感的湯體，但不想要太重、太黏、太油，會偏向輕白、順口、舒服耐吃的方向。常見會落在較清爽的雞白湯、輕白湯或柔和型創作白湯。",
    family: "白湯系",
    axes: { richness: "C", broth: "W", impact: "L", noodle: "F" },
    axisLabels: {
      richness: "清爽",
      broth: "白湯",
      impact: "溫和",
      noodle: "細滑",
    },
    ingredientTags: ["CHICKEN", "DUCK", "MISO"],
    relatedPrototypeIds: ["chicken_paitan", "mixed_poultry", "miso_light"],
    neighborCodes: ["CKLF", "CWLT", "CWHF"],
    homepageFeatured: true,
  },
  {
    code: "CWLT",
    name: "輕白厚麵型",
    short: "白湯感較明顯，但整體仍偏柔和，麵體更有存在感。",
    summary:
      "這型喜歡白湯的包覆感，但不追求最濃最厚，而是想搭配更有存在感的麵，形成穩定耐吃的組合。常見會接近較柔和的白湯配中粗麵或厚麵方向。",
    family: "白湯系",
    axes: { richness: "C", broth: "W", impact: "L", noodle: "T" },
    axisLabels: {
      richness: "清爽",
      broth: "白湯",
      impact: "溫和",
      noodle: "粗嚼",
    },
    ingredientTags: ["CHICKEN", "PORK", "MISO"],
    relatedPrototypeIds: ["chicken_paitan", "miso_light", "tonkotsu_light"],
    neighborCodes: ["CWLF", "CKLT", "CWHT"],
  },
  {
    code: "CWHF",
    name: "白湯細銳型",
    short: "白湯底但帶更高衝擊與更細緻的入口感。",
    summary:
      "這型不是單純的柔和白湯派，而是喜歡白湯基底之上再加一些香氣、鹹感或刺激層次，入口仍偏細滑。常見會接近較有個性的雞白湯、鴨白湯或帶轉味的白湯創作型。",
    family: "白湯系",
    axes: { richness: "C", broth: "W", impact: "H", noodle: "F" },
    axisLabels: {
      richness: "清爽",
      broth: "白湯",
      impact: "重口",
      noodle: "細滑",
    },
    ingredientTags: ["DUCK", "CHICKEN", "MISO"],
    relatedPrototypeIds: ["duck_paitan_rich", "chicken_paitan", "miso_light"],
    neighborCodes: ["CWLF", "CWHT", "RWHF"],
  },
  {
    code: "CWHT",
    name: "白湯衝擊型",
    short: "白湯、重口、麵感強，個性比一般白湯更鮮明。",
    summary:
      "這型喜歡白湯的底，但不走柔和派，而是會希望再往重口、強香、麵體存在感方向走，整體更加直接。常見會接近個性強的白湯系、創作濃白系或重口白湯。",
    family: "白湯系",
    axes: { richness: "C", broth: "W", impact: "H", noodle: "T" },
    axisLabels: {
      richness: "清爽",
      broth: "白湯",
      impact: "重口",
      noodle: "粗嚼",
    },
    ingredientTags: ["DUCK", "PORK", "MISO"],
    relatedPrototypeIds: ["duck_paitan_rich", "tonkotsu_light", "sapporo_miso"],
    neighborCodes: ["CWHF", "CWLT", "RWHT"],
  },
  {
    code: "RKLF",
    name: "厚湯細緻型",
    short: "整體偏厚，但仍保有清湯方向與細緻入口。",
    summary:
      "這型比清亮系更偏厚、更有存在感，但仍然不想完全走到白湯乳化那一側，會偏向厚實清湯、濃縮清湯、或高鮮味的厚湯系。常見會被濃縮魚介、厚味牛清湯等方向吸引。",
    family: "厚湯系",
    axes: { richness: "R", broth: "K", impact: "L", noodle: "F" },
    axisLabels: {
      richness: "濃厚",
      broth: "清湯",
      impact: "溫和",
      noodle: "細滑",
    },
    ingredientTags: ["BEEF", "FISH", "SHELLFISH"],
    relatedPrototypeIds: ["tw_beef_clear", "gyokai_clear", "tw_oyster_shellfish"],
    neighborCodes: ["CKLF", "RKLT", "RKHF"],
  },
  {
    code: "RKLT",
    name: "厚湯厚麵型",
    short: "偏厚實清湯系，搭配更有存在感的麵體。",
    summary:
      "這型會希望湯感更厚、更飽滿，但不一定是白湯，並且希望麵也一起有咬感與存在感，吃起來更扎實。常見會靠近厚味醬油系、厚實牛清湯、或更有份量感的清湯麵。",
    family: "厚湯系",
    axes: { richness: "R", broth: "K", impact: "L", noodle: "T" },
    axisLabels: {
      richness: "濃厚",
      broth: "清湯",
      impact: "溫和",
      noodle: "粗嚼",
    },
    ingredientTags: ["BEEF", "PORK", "FISH"],
    relatedPrototypeIds: ["tw_beef_clear", "pork_clear_shoyu", "gyokai_clear"],
    neighborCodes: ["RKLF", "RWLT", "RKHT"],
  },
  {
    code: "RKHF",
    name: "厚湯銳感型",
    short: "厚味、清湯輪廓、衝擊感明顯，細麵感較強。",
    summary:
      "這型會想保留清湯輪廓，但同時接受厚味、強鮮感與更高刺激，整體有厚實感卻不乳化。常見會接近濃縮魚介、強香鴨清湯、或厚味創作型清湯。",
    family: "厚湯系",
    axes: { richness: "R", broth: "K", impact: "H", noodle: "F" },
    axisLabels: {
      richness: "濃厚",
      broth: "清湯",
      impact: "重口",
      noodle: "細滑",
    },
    ingredientTags: ["BEEF", "DUCK", "FISH"],
    relatedPrototypeIds: ["tw_beef_clear", "duck_clear_negi", "gyokai_clear"],
    neighborCodes: ["RKLF", "RKHT", "RWHF"],
  },
  {
    code: "RKHT",
    name: "厚湯硬派型",
    short: "厚味清湯、重口、麵感強，整體非常有存在感。",
    summary:
      "這型會喜歡厚味與個性明顯的湯，但不一定想要走成典型白湯，同時也偏好更有存在感的麵體，整體風格偏硬派。常見會被厚味牛系、重口清湯系或部分豬系濃醬油方向吸引。",
    family: "厚湯系",
    axes: { richness: "R", broth: "K", impact: "H", noodle: "T" },
    axisLabels: {
      richness: "濃厚",
      broth: "清湯",
      impact: "重口",
      noodle: "粗嚼",
    },
    ingredientTags: ["BEEF", "PORK", "DUCK"],
    relatedPrototypeIds: ["tw_beef_clear", "pork_clear_shoyu", "duck_clear_negi"],
    neighborCodes: ["RKHF", "RKLT", "RWHT"],
    homepageFeatured: true,
  },
  {
    code: "RWLF",
    name: "濃白細滑型",
    short: "濃厚與白湯感明顯，但入口仍偏細膩滑順。",
    summary:
      "這型是典型濃白派，但不一定追求最重口、最粗暴的衝擊，而是更重視濃白包覆感與滑順細膩的整體感受。常見會被雞白湯、鴨白湯、牛白湯等細緻型濃白系吸引。",
    family: "濃白系",
    axes: { richness: "R", broth: "W", impact: "L", noodle: "F" },
    axisLabels: {
      richness: "濃厚",
      broth: "白湯",
      impact: "溫和",
      noodle: "細滑",
    },
    ingredientTags: ["CHICKEN", "DUCK", "BEEF"],
    relatedPrototypeIds: ["chicken_paitan", "duck_paitan_rich", "tw_beef_paitan"],
    neighborCodes: ["RWLT", "RWHF", "CWLF"],
    homepageFeatured: true,
  },
  {
    code: "RWLT",
    name: "濃白厚麵型",
    short: "濃厚白湯感與厚實麵體兼具，飽滿但不一定最重口。",
    summary:
      "這型喜歡濃白包覆感與飽滿度，同時也重視麵體存在感，是很有份量感的一型，但未必追求最刺激。常見會靠近濃厚豚骨、牛白湯、鴨白湯與部分家系近鄰。",
    family: "濃白系",
    axes: { richness: "R", broth: "W", impact: "L", noodle: "T" },
    axisLabels: {
      richness: "濃厚",
      broth: "白湯",
      impact: "溫和",
      noodle: "粗嚼",
    },
    ingredientTags: ["PORK", "BEEF", "DUCK"],
    relatedPrototypeIds: ["tonkotsu_rich", "tw_beef_paitan", "duck_paitan_rich"],
    neighborCodes: ["RWLF", "RWHT", "RKLT"],
    homepageFeatured: true,
  },
  {
    code: "RWHF",
    name: "濃白細膩型",
    short: "白湯濃厚、重口感提高，但仍保留細膩滑順的入口。",
    summary:
      "這型比一般濃白型更有刺激與香氣強度，但麵體不一定要粗重，反而更在意整體是否濃而細膩。常見會接近個性較強的雞白湯、鴨白湯、牛白湯與創作濃白系。",
    family: "濃白系",
    axes: { richness: "R", broth: "W", impact: "H", noodle: "F" },
    axisLabels: {
      richness: "濃厚",
      broth: "白湯",
      impact: "重口",
      noodle: "細滑",
    },
    ingredientTags: ["DUCK", "BEEF", "CHICKEN"],
    relatedPrototypeIds: ["duck_paitan_rich", "tw_beef_paitan", "chicken_paitan"],
    neighborCodes: ["RWLF", "RWHT", "RKHF"],
  },
  {
    code: "RWHT",
    name: "濃白重口型",
    short: "濃厚、白湯、重口、存在感強，是最有衝擊的一派。",
    summary:
      "這型偏好厚重、包覆感明顯、白湯感與香氣衝擊都高，麵體也常希望更有存在感，是整體最飽滿也最直接的一型。常見會被濃厚豚骨、家系、牛白湯濃厚型與重口白湯系吸引。",
    family: "濃白系",
    axes: { richness: "R", broth: "W", impact: "H", noodle: "T" },
    axisLabels: {
      richness: "濃厚",
      broth: "白湯",
      impact: "重口",
      noodle: "粗嚼",
    },
    ingredientTags: ["PORK", "BEEF", "DUCK"],
    relatedPrototypeIds: ["tonkotsu_rich", "iekei_branch", "tw_beef_paitan", "duck_paitan_rich"],
    neighborCodes: ["RWHF", "RWLT", "CWHT"],
    homepageFeatured: true,
  },
];

export const TYPE_PROFILE_MAP: Record<TypeCode, TypeProfile> = Object.fromEntries(
  TYPE_PROFILES.map((profile) => [profile.code, profile]),
) as Record<TypeCode, TypeProfile>;

export const FEATURED_TYPE_PROFILES: TypeProfile[] = TYPE_PROFILES.filter(
  (profile) => profile.homepageFeatured,
);

export const TYPE_FAMILY_OPTIONS: TypeFamily[] = [
  "清亮系",
  "白湯系",
  "厚湯系",
  "濃白系",
];

export function getTypeProfile(code: string): TypeProfile | null {
  return TYPE_PROFILE_MAP[code as TypeCode] ?? null;
}

export function getNeighborProfiles(code: TypeCode): TypeProfile[] {
  const profile = TYPE_PROFILE_MAP[code];
  if (!profile) return [];
  return profile.neighborCodes
    .map((neighborCode) => TYPE_PROFILE_MAP[neighborCode])
    .filter(Boolean);
}

export function getProfilesByFamily(family: TypeFamily): TypeProfile[] {
  return TYPE_PROFILES.filter((profile) => profile.family === family);
}

export function isTypeCode(value: string): value is TypeCode {
  return value in TYPE_PROFILE_MAP;
}
