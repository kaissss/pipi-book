import type { Locale } from "../config";
import { common } from "./common";
import { home } from "./home";
import { auth } from "./auth";
import { taxonomy } from "./taxonomy";
import { booking } from "./booking";
import { coachPortal } from "./coachPortal";
import { member } from "./member";
import { admin } from "./admin";
import { coachPublic } from "./coachPublic";
import { legal } from "./legal";

// Every namespace registers here. Each namespace file exports `{ en, zhTW }`
// where `zhTW` is typed against `en`, so a missing or misspelled key in either
// language is a compile error. Add new feature namespaces to both maps below.
export const messages: Record<Locale, Record<string, unknown>> = {
  en: {
    common: common.en,
    home: home.en,
    auth: auth.en,
    taxonomy: taxonomy.en,
    booking: booking.en,
    coachPortal: coachPortal.en,
    member: member.en,
    admin: admin.en,
    coachPublic: coachPublic.en,
    legal: legal.en,
  },
  "zh-TW": {
    common: common.zhTW,
    home: home.zhTW,
    auth: auth.zhTW,
    taxonomy: taxonomy.zhTW,
    booking: booking.zhTW,
    coachPortal: coachPortal.zhTW,
    member: member.zhTW,
    admin: admin.zhTW,
    coachPublic: coachPublic.zhTW,
    legal: legal.zhTW,
  },
};
