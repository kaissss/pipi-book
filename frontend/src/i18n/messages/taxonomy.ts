// Shared option lists (specialties, spoken languages). Keyed by the English
// value stored in the database / constants.ts so the stored value stays stable
// while the label is localized. Used by coach forms, filters, and profiles via
// t(`taxonomy.specialty.${value}`) and t(`taxonomy.language.${value}`).

const en = {
  specialty: {
    "Life Coaching": "Life Coaching",
    "Business Coaching": "Business Coaching",
    "Career Coaching": "Career Coaching",
    "Executive Coaching": "Executive Coaching",
    "Health & Wellness": "Health & Wellness",
    Fitness: "Fitness",
    Nutrition: "Nutrition",
    Mindfulness: "Mindfulness",
    Relationship: "Relationship",
    Financial: "Financial",
    Leadership: "Leadership",
    Communication: "Communication",
  },
  language: {
    English: "English",
    "Chinese (Traditional)": "Chinese (Traditional)",
    "Chinese (Simplified)": "Chinese (Simplified)",
    Japanese: "Japanese",
    Korean: "Korean",
  },
};

const zhTW: typeof en = {
  specialty: {
    "Life Coaching": "生活教練",
    "Business Coaching": "商業教練",
    "Career Coaching": "職涯教練",
    "Executive Coaching": "高階主管教練",
    "Health & Wellness": "健康與保健",
    Fitness: "健身",
    Nutrition: "營養",
    Mindfulness: "正念",
    Relationship: "人際關係",
    Financial: "財務",
    Leadership: "領導力",
    Communication: "溝通",
  },
  language: {
    English: "英文",
    "Chinese (Traditional)": "繁體中文",
    "Chinese (Simplified)": "簡體中文",
    Japanese: "日文",
    Korean: "韓文",
  },
};

export const taxonomy = { en, zhTW };
