// Static legal / support pages: terms, privacy, help.

const en = {
  terms: {
    title: "Terms of Service",
    lastUpdated: "Last updated: {date}",
    date: "June 2026",
    s1Title: "1. Acceptance of Terms",
    s1Body:
      "By accessing or using {app} (the “Platform”), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.",
    s2Title: "2. The Service",
    s2Body:
      "{app} connects students with independent coaches and lets them browse availability, book sessions, and pay online. {app} provides the booking and payment tools; coaches are independent providers responsible for the services they deliver. {app} is not a party to the agreement between a student and a coach.",
    s3Title: "3. Accounts",
    s3Body:
      "You sign in using LINE Login. You are responsible for activity under your account and for keeping your LINE credentials secure. You must provide accurate information and be legally able to enter into contracts.",
    s4Title: "4. Bookings & Payments",
    s4Body:
      "Payments are processed by our third-party provider (ECPay). A booking is confirmed only after payment is verified. Prices are set by individual coaches. Refunds and cancellations are subject to the coach’s policy and applicable law; contact the coach or our support team for assistance.",
    s5Title: "5. Coach Responsibilities",
    s5Body:
      "Coaches are responsible for the accuracy of their profile, the lawfulness of their services, honoring confirmed bookings, and complying with tax and professional obligations. {app} may review, suspend, or remove coach accounts that violate these Terms.",
    s6Title: "6. Acceptable Use",
    s6Body:
      "You agree not to misuse the Platform, including attempting to disrupt it, circumvent payments, harass other users, or use it for unlawful purposes.",
    s7Title: "7. Disclaimers & Liability",
    s7Body:
      "The Platform is provided “as is” without warranties of any kind. To the maximum extent permitted by law, {app} is not liable for the conduct of coaches or students, or for indirect or consequential damages arising from use of the Platform.",
    s8Title: "8. Changes",
    s8Body:
      "We may update these Terms from time to time. Continued use after changes take effect constitutes acceptance of the revised Terms.",
    s9Title: "9. Contact",
    s9Body:
      "Questions about these Terms? Reach us through the Help Center or your LINE Official Account.",
  },
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: {date}",
    date: "June 2026",
    s1Title: "1. Overview",
    s1Body:
      "This Privacy Policy explains how {app} collects, uses, and protects your personal information when you use our Platform.",
    s2Title: "2. Information We Collect",
    s2Item1Label: "LINE profile",
    s2Item1Body:
      "— your LINE user ID, display name, profile picture, and, if you grant permission, your email address.",
    s2Item2Label: "Account & profile data",
    s2Item2Body:
      "— for coaches, the profile details you provide (bio, specialties, services, availability).",
    s2Item3Label: "Booking & payment data",
    s2Item3Body:
      "— bookings you make and payment status. Card details are handled by our payment provider (ECPay) and are not stored by {app}.",
    s2Item4Label: "Usage data",
    s2Item4Body:
      "— basic technical and analytics information needed to operate and improve the service.",
    s3Title: "3. How We Use Your Information",
    s3Body:
      "We use your information to authenticate you, create and manage bookings, process payments, send booking-related notifications via LINE, provide support, and improve the Platform.",
    s4Title: "4. Sharing",
    s4Body:
      "We share information only as needed to run the service: with the coach or student involved in a booking, and with service providers such as LINE (login and messaging) and ECPay (payments). We do not sell your personal information.",
    s5Title: "5. Data Retention",
    s5Body:
      "We retain your information for as long as your account is active or as needed to provide the service and comply with legal obligations.",
    s6Title: "6. Your Rights",
    s6Body:
      "You may request access to, correction of, or deletion of your personal data, subject to applicable law. To make a request, contact us through the Help Center or your LINE Official Account.",
    s7Title: "7. Security",
    s7Body:
      "We use reasonable technical and organizational measures to protect your information. No method of transmission or storage is completely secure, however, and we cannot guarantee absolute security.",
    s8Title: "8. Changes",
    s8Body:
      "We may update this Privacy Policy from time to time. Material changes will be reflected by the “Last updated” date above.",
    s9Title: "9. Contact",
    s9Body:
      "For privacy questions or requests, reach us through the Help Center or your LINE Official Account.",
  },
  help: {
    title: "Help Center",
    subtitle: "Answers to common questions about using {app}.",
    cat1: "Getting started",
    q1: "How do I sign in?",
    a1: "Tap “Login with LINE”. We use LINE Login, so there’s no separate password to remember — just authorize once and you’re in.",
    q2: "Is it free to join?",
    a2: "Creating an account is free. You only pay when you book a session with a coach.",
    cat2: "Booking a session",
    q3: "How do I book a coach?",
    a3: "Open “Find Coaches”, choose a coach, pick a service and an available time slot, then pay to confirm. Your booking is confirmed once payment is verified.",
    q4: "How do I pay?",
    a4: "Payments are handled securely by ECPay. We never store your card details. A booking stays pending until payment succeeds.",
    q5: "Can I cancel or reschedule?",
    a5: "You can cancel pending or confirmed bookings from “My Bookings”. Refund eligibility depends on the coach’s cancellation policy and applicable law.",
    q6: "Will I get reminders?",
    a6: "Yes — booking confirmations and reminders are sent to you through LINE.",
    cat3: "Becoming a coach",
    q7: "How do I become a coach?",
    a7: "From the account menu choose “Become a Coach” and fill in your profile. You’ll get access to the Coach Portal right away to set up services and availability.",
    q8: "When can clients book me?",
    a8: "Your profile becomes publicly listable and bookable once an admin reviews and approves it. You can prepare your services and schedule while approval is pending.",
    cat4: "Account",
    q9: "How do I switch between coach and member views?",
    a9: "If you’re both a coach and a member, use the “Switch to…” option in the account menu to move between portals.",
    q10: "How do I update my profile?",
    a10: "Open “Profile” from the account menu to edit your details.",
    stillNeedHelpTitle: "Still need help?",
    stillNeedHelpLead: "Reach us through your LINE Official Account, or review our",
    termsLink: "Terms",
    and: "and",
    privacyLink: "Privacy Policy",
  },
};

const zhTW: typeof en = {
  terms: {
    title: "服務條款",
    lastUpdated: "最後更新：{date}",
    date: "2026 年 6 月",
    s1Title: "1. 條款的接受",
    s1Body:
      "當您存取或使用 {app}（以下稱「本平台」），即表示您同意受本服務條款約束。若您不同意，請勿使用本平台。",
    s2Title: "2. 服務內容",
    s2Body:
      "{app} 為學員與獨立教練提供媒合，讓學員瀏覽可預約時段、預約課程並線上付款。{app} 提供預約與付款工具；教練為獨立的服務提供者，並自行對其所提供的服務負責。{app} 並非學員與教練之間協議的當事人。",
    s3Title: "3. 帳戶",
    s3Body:
      "您透過 LINE 登入使用本平台。您須對帳戶下的所有活動負責，並妥善保管您的 LINE 登入憑證。您須提供正確資訊，且具備依法簽訂契約的能力。",
    s4Title: "4. 預約與付款",
    s4Body:
      "款項由本平台的第三方金流服務商（綠界科技 ECPay）處理。預約須於付款完成並經確認後方為成立。價格由各教練自行訂定。退款與取消事宜依教練的政策及適用法律辦理；如需協助，請聯繫教練或本平台客服團隊。",
    s5Title: "5. 教練的責任",
    s5Body:
      "教練須對其個人檔案資訊的正確性、所提供服務的合法性、履行已確認的預約，以及遵守稅務與專業相關義務負責。{app} 得對違反本條款的教練帳戶進行審查、暫停或移除。",
    s6Title: "6. 使用規範",
    s6Body:
      "您同意不濫用本平台，包括但不限於試圖干擾平台運作、規避付款、騷擾其他使用者，或將平台用於任何違法用途。",
    s7Title: "7. 免責聲明與責任限制",
    s7Body:
      "本平台係以「現狀」提供，不附帶任何明示或默示的擔保。在法律允許的最大範圍內，{app} 對教練或學員的行為，以及因使用本平台而產生的任何間接或衍生性損害，均不負賠償責任。",
    s8Title: "8. 條款變更",
    s8Body:
      "本平台得不時更新本條款。變更生效後若您繼續使用本平台，即視為您接受修訂後的條款。",
    s9Title: "9. 聯絡我們",
    s9Body:
      "對本條款有任何疑問嗎？歡迎透過幫助中心或本平台的 LINE 官方帳號與我們聯繫。",
  },
  privacy: {
    title: "隱私權政策",
    lastUpdated: "最後更新：{date}",
    date: "2026 年 6 月",
    s1Title: "1. 總覽",
    s1Body:
      "本隱私權政策說明當您使用本平台時，{app} 如何蒐集、使用及保護您的個人資料。",
    s2Title: "2. 我們蒐集的資訊",
    s2Item1Label: "LINE 個人檔案",
    s2Item1Body:
      "— 您的 LINE 使用者 ID、顯示名稱、大頭貼，以及在您授權的情況下，您的電子郵件地址。",
    s2Item2Label: "帳戶與個人檔案資料",
    s2Item2Body:
      "— 若您為教練，則包含您所提供的檔案內容（簡介、專長、服務項目、可預約時段）。",
    s2Item3Label: "預約與付款資料",
    s2Item3Body:
      "— 您所建立的預約及付款狀態。信用卡資料由本平台的金流服務商（綠界科技 ECPay）處理，{app} 不會予以儲存。",
    s2Item4Label: "使用資料",
    s2Item4Body:
      "— 為營運及改善服務所需的基本技術與分析資訊。",
    s3Title: "3. 我們如何使用您的資訊",
    s3Body:
      "我們使用您的資訊以進行身分驗證、建立及管理預約、處理付款、透過 LINE 傳送與預約相關的通知、提供客戶支援，並持續改善本平台。",
    s4Title: "4. 資訊分享",
    s4Body:
      "我們僅在營運服務所必要的範圍內分享資訊：包括與預約相關的教練或學員，以及 LINE（登入與訊息服務）、綠界科技 ECPay（付款）等服務提供商。我們不會出售您的個人資料。",
    s5Title: "5. 資料保存",
    s5Body:
      "在您的帳戶仍有效期間，或為提供服務及遵守法律義務所需的範圍內，我們將保存您的資訊。",
    s6Title: "6. 您的權利",
    s6Body:
      "在適用法律允許的範圍內，您可要求查閱、更正或刪除您的個人資料。如需提出請求，請透過幫助中心或本平台的 LINE 官方帳號與我們聯繫。",
    s7Title: "7. 資訊安全",
    s7Body:
      "我們採取合理的技術與組織措施保護您的資訊。然而，任何傳輸或儲存方式皆無法達到絕對安全，因此我們無法保證資訊的絕對安全。",
    s8Title: "8. 政策變更",
    s8Body:
      "本平台得不時更新本隱私權政策。重大變更將反映於上方的「最後更新」日期。",
    s9Title: "9. 聯絡我們",
    s9Body:
      "如有隱私相關問題或請求，歡迎透過幫助中心或本平台的 LINE 官方帳號與我們聯繫。",
  },
  help: {
    title: "幫助中心",
    subtitle: "關於使用 {app} 的常見問題解答。",
    cat1: "開始使用",
    q1: "我要如何登入？",
    a1: "點選「使用 LINE 登入」。我們採用 LINE 登入，因此您無需另外記住密碼 — 只要授權一次即可登入。",
    q2: "註冊需要付費嗎？",
    a2: "建立帳戶完全免費。您只有在向教練預約課程時才需要付費。",
    cat2: "預約課程",
    q3: "我要如何預約教練？",
    a3: "開啟「尋找教練」，選擇一位教練，挑選服務項目與可預約時段，再完成付款即可確認。您的預約會在付款確認後成立。",
    q4: "我要如何付款？",
    a4: "款項由綠界科技 ECPay 安全處理，我們不會儲存您的信用卡資料。在付款成功前，預約將維持待處理狀態。",
    q5: "我可以取消或改期嗎？",
    a5: "您可以在「我的預約」中取消待處理或已確認的預約。是否符合退款資格，取決於教練的取消政策及適用法律。",
    q6: "我會收到提醒通知嗎？",
    a6: "會的 — 預約確認與提醒通知都會透過 LINE 傳送給您。",
    cat3: "成為教練",
    q7: "我要如何成為教練？",
    a7: "從帳戶選單選擇「成為教練」並填寫您的個人檔案。填寫後即可立即進入教練後台，設定服務項目與可預約時段。",
    q8: "學員何時可以預約我？",
    a8: "當管理員審核並通過您的申請後，您的個人檔案即可公開顯示並開放預約。在審核期間，您仍可預先準備服務項目與行程安排。",
    cat4: "帳戶",
    q9: "我要如何在教練與會員檢視之間切換？",
    a9: "若您同時是教練與會員，可使用帳戶選單中的「切換至…」選項，在不同後台之間切換。",
    q10: "我要如何更新個人檔案？",
    a10: "從帳戶選單開啟「個人檔案」即可編輯您的資料。",
    stillNeedHelpTitle: "還需要協助嗎？",
    stillNeedHelpLead: "歡迎透過本平台的 LINE 官方帳號與我們聯繫，或參閱我們的",
    termsLink: "服務條款",
    and: "與",
    privacyLink: "隱私權政策",
  },
};

export const legal = { en, zhTW };
