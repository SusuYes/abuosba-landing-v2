/* v21 draft: sky colour leads; the constellation of visits sits quietly at the side, and gives the greeting "Welcome back." */
window.Welcome = (root, V) => {
  root.classList.add("duo");
  root.innerHTML = `<div class="duo-main"></div><aside class="duo-side" aria-label="Your visits, as a constellation"></aside>`;
  const main = root.querySelector(".duo-main"), side = root.querySelector(".duo-side");
  const c = WelcomeColour(main, V);
  const h1 = main.querySelector("h1");
  /* the colour changes by itself; what it is and the day line wait in a panel behind a link at the bottom */
  const pop = document.createElement("div"); pop.className = "cs-pop cs"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", "The colour of your sky");
  pop.innerHTML = `<div class="k"><span>The colour of your sky</span><button class="x" type="button" aria-label="Close">×</button></div>`;
  ["p", ".cs-day", ".meta"].forEach((q) => { const e = main.querySelector(q); if (e) pop.appendChild(e); });
  document.body.appendChild(pop);
  const more = document.querySelector("#page .more"), link = document.createElement("a");
  link.href = "#"; link.textContent = "Why this colour?"; link.setAttribute("aria-haspopup", "dialog");
  if (more) more.appendChild(link);
  const openPop = (on) => { pop.classList.toggle("on", on); link.setAttribute("aria-expanded", String(on)); if (on) setTimeout(() => pop.querySelector(".cs-day").focus({ preventScroll: true }), 350); };
  link.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); openPop(!pop.classList.contains("on")); });
  pop.querySelector(".x").addEventListener("click", () => openPop(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && pop.classList.contains("on")) openPop(false); });
  document.addEventListener("pointerdown", (e) => { if (pop.classList.contains("on") && !pop.contains(e.target) && e.target !== link) openPop(false); });
  /* v26: under the greeting, one thought-provoking saying at a time. Tap for the next. */
  const line = document.createElement("p"); line.className = "duo-line wh"; line.setAttribute("title", "Another"); h1.after(line);
  const Q = [
    ["The unexamined life is not worth living.", "Socrates", "", "الحياة التي لا تُفحَص لا تستحق أن تُعاش.", "سقراط"],
    ["No one steps in the same river twice.", "Heraclitus", "", "لا أحد يعبر النهر نفسه مرتين.", "هيراقليطس"],
    ["What stands in the way becomes the way.", "Marcus Aurelius", "", "ما يقف في الطريق يصير هو الطريق.", "ماركوس أوريليوس"],
    ["It is not that we have a short time to live, but that we waste a lot of it.", "Seneca", "", "ليست أعمارنا قصيرة، لكننا نهدر كثيراً منها.", "سينيكا"],
    ["The map is not the territory.", "Alfred Korzybski", "", "الخريطة ليست هي الأرض.", "ألفرد كورزيبسكي"],
    ["We are all in the gutter, but some of us are looking at the stars.", "Oscar Wilde", "", "كلنا في الحضيض، لكن بعضنا ينظر إلى النجوم.", "أوسكار وايلد"],
    ["He who has a why to live for can bear almost any how.", "Nietzsche", "", "من يملك سبباً يعيش من أجله يحتمل أيّ كيفٍ تقريباً.", "نيتشه"],
    ["We are a way for the cosmos to know itself.", "Carl Sagan", "", "نحن طريقة الكون ليعرف نفسه.", "كارل ساغان"],
    ["The winds blow as the ships would not wish.", "al-Mutanabbi", "تجري الرياح بما لا تشتهي السفن", "تجري الرياح بما لا تشتهي السفن", "المتنبي"],
    ["On this earth is what makes life worth living.", "Mahmoud Darwish", "على هذه الأرض ما يستحق الحياة", "على هذه الأرض ما يستحق الحياة", "محمود درويش"],
  ];
  const words = (h) => h.replace(/(<[^>]+>)|([^<\s]+)/g, (m, tag, w) => tag || `<b>${w}</b>`);
  /* Arabic fades in as one piece, so its letters keep joining; the English word by word */
  const html = ([q, by, ar, qa, ba]) => document.documentElement.lang === "ar"
    ? words(`<q>${qa}</q><cite>${ba}</cite>`)  // v40: in Arabic, the saying alone, in Arabic
    : (ar ? `<b class="ar-w"><span lang="ar" dir="rtl">${ar}</span></b>` : "") + words(`<q>${q}</q><cite>${by}</cite>`);
  /* keep room for the longest saying at this width, so the Thoughts never jump */
  const ghost = document.createElement("p"); ghost.className = "duo-line"; ghost.setAttribute("aria-hidden", "true"); ghost.style.cssText = "position:absolute;visibility:hidden;left:0;right:0;pointer-events:none";
  const fit = () => { main.style.position = "relative"; main.appendChild(ghost); ghost.style.width = line.clientWidth + "px"; let mh = 0; Q.forEach((x) => { ghost.innerHTML = html(x); mh = Math.max(mh, ghost.offsetHeight); }); ghost.remove(); line.style.minHeight = mh + "px"; };
  let k = (V.visits.n || 0) * 3 % Q.length, timer = 0, paused = false;
  const show = (fade) => {
    line.innerHTML = html(Q[k]);
    line.querySelectorAll("b").forEach((w, n) => (w.style.animationDelay = (REDUCE || !fade ? 0 : n * 70) + "ms"));
    line.classList.remove("in"); void line.offsetWidth; line.classList.add("in");
  };
  const next = () => { line.classList.add("out"); setTimeout(() => { line.classList.remove("out"); k = (k + 1) % Q.length; show(true); }, REDUCE ? 0 : 700); };
  const tick = () => { clearTimeout(timer); if (REDUCE) return; timer = setTimeout(() => { if (!paused && !document.hidden && !document.body.classList.contains("day")) next(); tick(); }, 8000); };
  line.addEventListener("click", () => { next(); tick(); });
  line.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") paused = true; });
  line.addEventListener("pointerleave", () => { paused = false; });
  show(false); fit(); addEventListener("resize", fit); if (document.fonts) document.fonts.ready.then(fit);
  addEventListener("aolang", () => { show(false); fit(); room(); });
  const b = WelcomeBack(side, V, { compact: true, onWords: (w, fade) => {
    if (h1.textContent === w.h) return; h1.textContent = w.h;
    if (fade) { h1.classList.remove("bk-fade"); void h1.offsetWidth; h1.classList.add("bk-fade"); }
  } });
  /* v38: on wider screens the constellation hangs beside the greeting and may use the space above it, but never past
     the top of the page (the new star's flare needs ~20px), so it is cut to fit there instead of making the welcome taller */
  const sky = side.querySelector(".bk-sky"), FLARE = 20;
  const room = () => {
    root.style.minHeight = ""; sky.style.height = "";
    if (innerWidth < 761) return;
    const pg = root.closest("#page"), top = pg ? root.getBoundingClientRect().top - pg.getBoundingClientRect().top + pg.scrollTop : 40;
    const meta = side.offsetHeight - sky.offsetHeight, h = Math.round(Math.max(80, Math.min(110, root.offsetHeight + top - FLARE - meta)));
    sky.style.height = h + "px";
    const need = h + meta + FLARE - top; if (need > root.offsetHeight) root.style.minHeight = need + "px";
  };
  room(); addEventListener("resize", room); if (document.fonts) document.fonts.ready.then(room);
  return { land() { c.land(); show(true); tick(); room(); setTimeout(() => { side.classList.add("on"); b.land(); }, REDUCE ? 0 : 1400); } };
};
