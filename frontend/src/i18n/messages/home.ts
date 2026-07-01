// Public landing page copy.

const en = {
  hero: {
    badge: "Powered by LINE Login",
    titleLead: "Find Your Perfect",
    titleHighlight: "Coach",
    subtitle:
      "Connect with certified professional coaches, book sessions instantly, and achieve your goals — all through LINE.",
    browse: "Browse Coaches",
    startAsCoach: "Start as Coach",
    ratingStat: "4.9 avg rating",
    sessionsStat: "500+ sessions booked",
    verifiedStat: "Verified coaches",
  },
  specialties: {
    heading: "Popular coaching areas",
    // Keyed by the English value used in the /coaches?specialty= link, so the
    // filter value stays stable while the label is localized.
    labels: {
      "Life Coaching": "Life Coaching",
      Business: "Business",
      Career: "Career",
      "Health & Wellness": "Health & Wellness",
      Fitness: "Fitness",
      Mindfulness: "Mindfulness",
      Leadership: "Leadership",
      Financial: "Financial",
    },
  },
  features: {
    heading: "How {app} Works",
    subtitle: "From browsing to booking in minutes.",
    schedulingTitle: "Easy Scheduling",
    schedulingDesc: "Browse real-time availability and book sessions with a few taps.",
    paymentsTitle: "Secure Payments",
    paymentsDesc: "Pay with confidence via ECPay or LINE Pay — fully encrypted.",
    verifiedTitle: "Verified Coaches",
    verifiedDesc: "All coaches are reviewed and approved before going live.",
    lineTitle: "LINE Integration",
    lineDesc: "Login with LINE and receive booking reminders right in chat.",
  },
  cta: {
    heading: "Ready to start your journey?",
    subtitle: "Login with LINE and find a coach who gets you.",
    button: "Get Started Free",
  },
};

const zhTW: typeof en = {
  hero: {
    badge: "由 LINE 登入提供支援",
    titleLead: "找到最適合你的",
    titleHighlight: "教練",
    subtitle: "與通過認證的專業教練聯繫，即時預約課程，達成你的目標——全部透過 LINE 完成。",
    browse: "瀏覽教練",
    startAsCoach: "成為教練",
    ratingStat: "平均評分 4.9",
    sessionsStat: "超過 500 次預約",
    verifiedStat: "認證教練",
  },
  specialties: {
    heading: "熱門教練領域",
    labels: {
      "Life Coaching": "生活教練",
      Business: "商業",
      Career: "職涯",
      "Health & Wellness": "健康與保健",
      Fitness: "健身",
      Mindfulness: "正念",
      Leadership: "領導力",
      Financial: "財務",
    },
  },
  features: {
    heading: "{app} 如何運作",
    subtitle: "從瀏覽到預約，只需幾分鐘。",
    schedulingTitle: "輕鬆排程",
    schedulingDesc: "瀏覽即時可預約時段，只要點幾下即可完成預約。",
    paymentsTitle: "安全付款",
    paymentsDesc: "透過 ECPay 或 LINE Pay 安心付款——全程加密。",
    verifiedTitle: "認證教練",
    verifiedDesc: "所有教練都經過審核核准後才會上線。",
    lineTitle: "LINE 整合",
    lineDesc: "使用 LINE 登入，並直接在聊天中收到預約提醒。",
  },
  cta: {
    heading: "準備好展開你的旅程了嗎？",
    subtitle: "使用 LINE 登入，找到最懂你的教練。",
    button: "免費開始使用",
  },
};

export const home = { en, zhTW };
