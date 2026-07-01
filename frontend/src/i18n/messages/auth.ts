// Login / authentication screens.

const en = {
  tagline: "Professional coaching, simplified",
  signIn: "Sign in",
  signInDescription: "Use your LINE account to continue. One click — no password needed.",
  continueWithLine: "Continue with LINE",
  devLoginTitle: "Dev login (local only)",
  agreePrefix: "By continuing, you agree to our",
  and: "and",
  period: ".",
  callback: {
    failedTitle: "Login Failed",
    failedBody: "We could not complete your LINE login. Please try again.",
    tryAgain: "Try Again",
    signingIn: "Signing you in...",
    redirecting: "Redirecting...",
    verifying: "Verifying...",
  },
};

const zhTW: typeof en = {
  tagline: "專業教練服務，化繁為簡",
  signIn: "登入",
  signInDescription: "使用你的 LINE 帳號繼續，一鍵登入，免密碼。",
  continueWithLine: "使用 LINE 繼續",
  devLoginTitle: "開發登入（僅限本機）",
  agreePrefix: "繼續即表示你同意我們的",
  and: "與",
  period: "。",
  callback: {
    failedTitle: "登入失敗",
    failedBody: "我們無法完成你的 LINE 登入，請再試一次。",
    tryAgain: "再試一次",
    signingIn: "登入中...",
    redirecting: "轉跳中...",
    verifying: "驗證中...",
  },
};

export const auth = { en, zhTW };
