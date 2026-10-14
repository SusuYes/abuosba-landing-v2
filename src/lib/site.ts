/* The site's addresses. Inside the page script a place is a key ("", "notes", "note/<slug>", "shelf",
   "shelf/music", "about", "work", "work/<id>"); here each key gets its path, title and description, in English
   and under /ar/ in Arabic. Keep in step with src/site/route.js. */
export type Lang = "en" | "ar";

export const NAME = { en: "Suhail AbuOsba", ar: "سهيل ابواصبع" };

// the builds on the Work page (their words live in src/site/common.js, CASES)
export const BUILDS: Record<string, { en: string; ar: string }> = {
  arrivals: { en: "Student arrivals", ar: "وصول الطلاب" },
  hub: { en: "Engagement hub", ar: "مركز المشاركة" },
  events: { en: "Events platform", ar: "منصة الفعاليات" },
};

const PAGE: Record<string, { en: string; ar: string }> = {
  notes: { en: "Thoughts", ar: "خواطر" },
  shelf: { en: "The shelf", ar: "الرف" },
  about: { en: "About", ar: "عنّي" },
  work: { en: "Work", ar: "العمل" },
  lost: { en: "Not found", ar: "غير موجودة" },
};

const WORK_LINE = { en: "Automations, APIs, data pipelines and dashboards for universities.", ar: "أتمتة وواجهات برمجية وخطوط بيانات ولوحات متابعة للجامعات." };
const DESC: Record<string, { en: string; ar: string }> = {
  "": { en: "Thoughts written after dark, a shelf of books and records, and by day: " + WORK_LINE.en.charAt(0).toLowerCase() + WORK_LINE.en.slice(1), ar: "خواطر تُكتب بعد حلول الظلام، ورفّ من الكتب والموسيقى، وفي النهار: " + WORK_LINE.ar },
  notes: { en: "Written after dark. A new one when there is one.", ar: "تُكتب بعد حلول الظلام. جديدةٌ متى وُجدت." },
  shelf: { en: "Everything read and played, newest first.", ar: "كل ما قرأته واستمعت إليه، الأحدث أولاً." },
  about: { en: "Named for a star.", ar: "يحمل اسم نجم." },
  work: WORK_LINE,
  lost: { en: "The link may be old, or the page has moved.", ar: "ربما الرابط قديم، أو انتقلت الصفحة." },
};

export function href(key: string, lang: Lang): string {
  const [p, arg] = key.split("/");
  const s = !p ? "" : p === "notes" ? "thoughts/" : p === "note" ? `thoughts/${arg}/` : p === "shelf" ? (arg === "music" ? "shelf/music/" : "shelf/")
    : p === "about" ? "about/" : p === "work" ? (arg ? `work/${arg}/` : "work/") : "";
  return (lang === "ar" ? "/ar/" : "/") + s;
}

/** The tab title: own name (a thought, a build) · page · name. */
export function title(key: string | null, lang: Lang, own?: string): string {
  const p = key == null ? "lost" : key.split("/")[0];
  if (!p) return NAME[lang];
  const pg = PAGE[p === "note" ? "notes" : p];
  return [own, pg?.[lang], NAME[lang]].filter(Boolean).join(" · ");
}

export function description(key: string | null, lang: Lang, own?: string): string {
  const p = key == null ? "lost" : key.split("/")[0];
  if (own) return own;
  return (DESC[p === "note" ? "notes" : p] || DESC[""])[lang];
}
