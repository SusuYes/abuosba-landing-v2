/* the addresses: every page has a real one, and the Arabic site mirrors them all under /ar/.
   Inside the page, a place is a key: "" (tonight), "notes", "note/<slug>", "shelf", "shelf/music", "about", "work", "work/<id>". */
const ROUTE = (() => {
  const lang = () => (document.documentElement.lang === "ar" ? "ar" : "en");
  // a path to a key; null is a page that isn't on the map
  function parse(path = location.pathname) {
    let p = path.replace(/\/index\.html$/, "/").replace(/^\/+|\/+$/g, "");
    let l = "en";
    if (p === "ar" || p.startsWith("ar/")) { l = "ar"; p = p.slice(3); }
    const [a, b, c] = p.split("/");
    let key = null;
    if (!a) key = "";
    else if (c) key = null;
    else if (a === "thoughts") key = b ? "note/" + b : "notes";
    else if (a === "shelf") key = !b ? "shelf" : b === "music" ? "shelf/music" : null;
    else if (a === "about") key = b ? null : "about";
    else if (a === "work") key = b ? "work/" + b : "work";
    return { lang: l, key };
  }
  // a key to a path, in the page's language unless told otherwise
  function href(key, l = lang()) {
    const [p, arg] = key.split("/");
    const s = !p ? "" : p === "notes" ? "thoughts/" : p === "note" ? `thoughts/${arg}/` : p === "shelf" ? (arg === "music" ? "shelf/music/" : "shelf/")
      : p === "about" ? "about/" : p === "work" ? (arg ? `work/${arg}/` : "work/") : "";
    return (l === "ar" ? "/ar/" : "/") + s;
  }
  const NAME = "Suhail AbuOsba", NAME_AR = "سهيل ابواصبع";
  const PAGE = { notes: ["Thoughts", "خواطر"], shelf: ["The shelf", "الرف"], about: ["About", "عنّي"], work: ["Work", "العمل"], lost: ["Not found", "الصفحة غير موجودة"] };
  // the tab's title for a key (a thought or a build can pass its own name)
  function title(key, own, l = lang()) {
    const ar = l === "ar", nm = ar ? NAME_AR : NAME, p = key == null ? "lost" : key.split("/")[0];
    if (!p) return nm;
    const pg = PAGE[p === "note" ? "notes" : p];
    return [own, pg && pg[ar ? 1 : 0], nm].filter(Boolean).join(" · ");
  }
  // after every move: the tab's title, and the language link pointing at the same place in the other language
  // (a thought has its own pair or goes to the other list; a lost address keeps its path)
  function sync() {
    const { key } = parse(), l = lang(), to = l === "ar" ? "en" : "ar";
    let own = "", other, k = key;
    try {
      const [p, a] = (key || "").split("/");
      if (p === "note" && !NOTES[a]) k = null;
      if (p === "note" && NOTES[a]) { own = NOTES[a].title; const pr = NOTES[a].pair; other = href(pr && NOTES[pr] ? "note/" + pr : "notes", to); }
      if (p === "work" && a && CASES[a]) own = l === "ar" ? AR.tr(CASES[a].title) || CASES[a].title : CASES[a].title;
    } catch (e) {}
    if (!other) other = key != null ? href(key, to) : to === "ar" ? "/ar" + location.pathname : location.pathname.replace(/^\/ar(\/|$)/, "/");
    document.title = title(k, own);
    document.querySelectorAll('#top a[lang="ar"], #reader a[lang="ar"], #work a[lang="ar"]').forEach((a) => (a.href = other));
  }
  for (const m of ["pushState", "replaceState"]) { const f = history[m].bind(history); history[m] = (...a) => { f(...a); sync(); }; }
  addEventListener("popstate", sync);
  return { parse, href, title, lang, sync };
})();
