const WelcomeBack = (root, V, o = {}) => {
  const DAY = 864e5, NOW = Date.now(), KEY = "ao-back", SVG = "http://www.w3.org/2000/svg";
  const Qs = new URLSearchParams(location.search);

  /* ── memory: a random id (the constellation's seed) and the dates of the last 12 real visits ── */
  let id = null, kept = [], canKeep = false;
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null") || {};
    id = typeof s.id === "string" && s.id ? s.id : null;
    kept = Array.isArray(s.d) ? s.d.filter((x) => Array.isArray(x) && x.length === 2 && +x[0] > 0) : [];
    if (!id) { const a = new Uint32Array(2); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => (a[i] = Math.random() * 4294967296)); id = a[0].toString(36) + a[1].toString(36); }
    const real = JSON.parse(localStorage.getItem("ao-visit") || "null"), rn = real ? real.n | 0 : 0; // visitor.js has counted this load already
    if (rn) {
      if (kept.length && kept[kept.length - 1][0] > rn) kept = []; // the count was reset: start the dates again
      if (!kept.some((x) => x[0] === rn)) kept.push([rn, NOW]);
      kept = kept.slice(-12);
    }
    localStorage.setItem(KEY, JSON.stringify({ id, d: kept }));
    canKeep = !!localStorage.getItem(KEY);
  } catch {}
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
  const SEED = hash(id || V.tz + navigator.userAgent + screen.width + "x" + screen.height);

  /* ── the visits to show: the real ones, or a simulation for ?first, ?back=3 and the preview ── */
  const GAPS = [5, 9, 3, 7, 4, 12, 6, 2, 8, 10, 5, 3];
  function sim(n, last) {
    const d = { [n]: NOW };
    let t = NOW - last * DAY;
    for (let v = n - 1, i = 0; v >= 1; v--, i++) { d[v] = t; t -= GAPS[i % GAPS.length] * DAY; }
    return { n, date: (v) => d[v] ?? null, sim: true };
  }
  function real() {
    const n = Math.max(1, V.visits.n | 0), d = Object.fromEntries(kept);
    return { n, date: (v) => (v === n ? NOW : d[v] ?? (v === n - 1 ? V.visits.last : null)), sim: false };
  }
  const start = () => (Qs.has("first") ? sim(1, 0) : Qs.has("back") ? sim(4, +Qs.get("back") || 3) : real());

  /* ── words ── */
  const dayNo = (t) => Math.floor((t + V.offsetMin(t) * 60000) / DAY);
  const nights = (t) => Math.max(0, dayNo(NOW) - dayNo(t));
  const years = (k) => (k < 730 ? "over a year" : Math.floor(k / 365) + " years");
  function ago(t, current) {
    if (current) return "now";
    if (t == null) return "date not kept";
    const k = nights(t);
    return k === 0 ? "earlier today" : k === 1 ? "yesterday" : k < 14 ? k + " nights ago" : k < 60 ? Math.round(k / 7) + " weeks ago" : k < 365 ? Math.round(k / 30.44) + " months ago" : years(k) + " ago";
  }
  function gap(k) {
    return k === 0 ? "Back again today." : k === 1 ? "You were here yesterday." : k < 14 ? `It's been ${k} nights.` : k < 60 ? `It's been ${Math.round(k / 7)} weeks.` : k < 365 ? `It's been a while, ${Math.round(k / 30.44)} months.` : `It's been a while, ${years(k)}.`;
  }
  const ord = (n) => n + (n % 100 > 10 && n % 100 < 14 ? "th" : ["th", "st", "nd", "rd"][n % 10] || "th");
  const touch = !matchMedia("(hover: hover) and (pointer: fine)").matches;

  function words(S) {
    const n = S.n, lastT = n > 1 ? S.date(n - 1) : null;
    if (n === 1 && o.compact) return { h: V.greet() + ".", p: "", m: "Your first star here · it stays for next time" };
    if (n === 1) return { h: V.greet() + ".", p: "Make yourself at home. This star is yours" + (canKeep || S.sim ? "; it will still be here next time." : "."), m: "Visit 1 · new here" };
    const k = lastT == null ? null : nights(lastT);
    // thoughts posted since the last visit, in the page's language
    const fresh = lastT == null || S.sim ? (S.sim && k ? 1 : 0) : NORDER.filter((id) => NOTES[id].lang === ROUTE.lang() && NOTES[id].ts > lastT).length;
    const p = (k == null ? "" : gap(k) + " ") + `Your constellation has ${n} stars now.` + (k && fresh ? ` Since then: ${fresh} new thought${fresh === 1 ? "" : "s"}.` : "");
    if (o.compact) return { h: "Welcome back.", p, m: `Your constellation · visit ${n}` + (k == null ? "" : " · last here " + ago(lastT)) };
    return { h: "Welcome back.", p, m: `Visit ${n}` + (k == null ? "" : " · last " + ago(lastT)) };
  }

  /* ── the shape: a walk that never crosses itself, one star per visit, the same for this visitor every time ── */
  const cross = (a, b, c, d) => { const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])); return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b); };
  const walks = {};
  const spreadOf = (Q) => { // how long and thin a set of stars is: 1 round, 3 a thin line
    let mx = 0, my = 0; Q.forEach((p) => { mx += p[0]; my += p[1]; }); mx /= Q.length; my /= Q.length;
    let a = 0, b = 0, c = 0; Q.forEach((p) => { const x = p[0] - mx, y = p[1] - my; a += x * x; b += y * y; c += x * y; });
    const t = (a + b) / 2, d = Math.sqrt(Math.max(0, t * t - (a * b - c * c))); return Math.sqrt((t + d) / Math.max(1e-6, t - d));
  };
  function walk(count) {
    const W = walks[SEED] || (walks[SEED] = { P: [[0, 0]], r: rng(SEED), G: 0, h: 0, z: 1 });
    if (W.P.length === 1) W.G = W.h = W.r() * 6.283;
    const { P, r } = W;
    while (P.length < count) {
      const k = P.length, a = P[k - 1], lo = Math.max(0, k - 13), win = P.slice(Math.max(0, k - 11));
      let best = null, bs = -1e9, bh = 0, bz = W.z;
      for (let t = 0; t < 60 && (t < 10 || !best); t++) {
        // mostly a zigzag along a slowly turning course; now and then a hook
        const hook = k > 2 && r() < 0.16, z = r() < 0.72 ? -W.z : W.z;
        const hh = hook ? W.h + (r() < 0.5 ? -1 : 1) * (1.5 + r() * 0.7) : W.G + z * (0.25 + r() * 0.75) + (r() - 0.5) * 0.3;
        const L = 0.7 + r() * 0.85, c = [a[0] + Math.cos(hh) * L, a[1] + Math.sin(hh) * L];
        let md = 9, ok = Math.abs(Math.atan2(Math.sin(hh - W.h), Math.cos(hh - W.h))) < 2.35 || k === 1;
        for (let j = lo; j < k - 1 && ok; j++) { const d = Math.hypot(P[j][0] - c[0], P[j][1] - c[1]); md = Math.min(md, d); if (d < (t < 40 ? 0.8 : 0.5)) ok = false; }
        for (let j = lo; j < k - 2 && ok; j++) if (cross(a, c, P[j], P[j + 1])) ok = false;
        if (!ok) continue;
        const sp = win.length > 3 ? spreadOf([...win, c]) : 1.5, s = Math.min(md, 1.6) - Math.max(0, sp - 2.1) * 1.2 - Math.max(0, 1.25 - sp) * 1.2 + r() * 0.4;
        if (s > bs) { bs = s; best = c; bh = hh; bz = hook ? W.z : z; }
      }
      if (!best) { bh = W.h + Math.PI / 2; best = [a[0] + Math.cos(bh), a[1] + Math.sin(bh)]; }
      if (Math.abs(Math.atan2(Math.sin(bh - W.G), Math.cos(bh - W.G))) > 1.3) W.G = bh; // after a hook, the course follows it
      W.G += (r() - 0.5) * 0.45; W.h = bh; W.z = bz; P.push(best);
    }
    return P;
  }
  const mag = (v) => { const r = rng(SEED ^ Math.imul(v, 2654435761)); r(); const x = r(); return 1.05 + x * x * 1.25; };

  /* ── the page ── */
  root.innerHTML = `<div class="bk${o.compact ? " bk-c" : ""}"><div class="greet">${o.compact ? '<span class="bk-h" hidden></span><span class="bk-p" hidden></span>' : "<h1></h1><p></p>"}<span class="meta"><span class="bk-v"></span><span class="hint">${touch ? "Tap a star" : "Point at a star"}</span><span class="bk-pv">Preview: <button type="button" data-v="1">first visit</button> · <button type="button" data-v="4">4th visit</button> · <button type="button" data-v="12">12th visit</button><span class="bk-mine" hidden> · <button type="button" data-v="0">yours</button></span></span></span></div><div class="bk-sky" role="group" aria-label="Your constellation, one star for each visit"><svg aria-hidden="false"></svg><div class="bk-tip" aria-live="polite"></div></div></div>`;
  const greet = root.querySelector(".greet"), sky = root.querySelector(".bk-sky"), svg = sky.querySelector("svg"), tip = sky.querySelector(".bk-tip");
  let drawn = 0, S = start(), stars = [], lines = [], anims = [], twinkles = [], timers = [], size = [0, 0], shown = -1, pinned = 0, landed = false, running = true;

  function text(fade) {
    const w = words(S);
    greet.querySelector("h1, .bk-h").textContent = w.h; greet.querySelector("p, .bk-p").innerHTML = w.p; root.querySelector(".bk-v").textContent = w.m;
    if (o.onWords) o.onWords(w, fade);
    root.querySelectorAll(".bk-pv button").forEach((b) => b.setAttribute("aria-pressed", String(S.sim && !Qs.has("first") && !Qs.has("back") ? +b.dataset.v === S.n : false)));
    if (fade) { [greet.querySelector("h1, .bk-h"), greet.querySelector("p, .bk-p")].forEach((e) => { e.classList.remove("bk-fade"); void e.offsetWidth; e.classList.add("bk-fade"); }); }
  }
  const el = (tag, at, parent) => { const e = document.createElementNS(SVG, tag); for (const k in at) e.setAttribute(k, at[k]); parent && parent.appendChild(e); return e; };

  function draw() {
    drawn++;
    const W = sky.clientWidth, H = sky.clientHeight, phone = W > H * 1.6; size = [W, H];
    const n = S.n, lo = Math.max(1, n - 11), P = walk(Math.max(12, n));
    const ref = n <= 12 ? P.slice(0, 12) : P.slice(n - 12, n);
    // turn the shape so its long side lies along the box, newest to the right
    let mx = 0, my = 0; ref.forEach((p) => { mx += p[0]; my += p[1]; }); mx /= ref.length; my /= ref.length;
    let sxx = 0, syy = 0, sxy = 0; ref.forEach((p) => { const x = p[0] - mx, y = p[1] - my; sxx += x * x; syy += y * y; sxy += x * y; });
    let th = -0.5 * Math.atan2(2 * sxy, sxx - syy);
    const rot = (p) => [p[0] * Math.cos(th) - p[1] * Math.sin(th), p[0] * Math.sin(th) + p[1] * Math.cos(th)];
    if (rot(ref[ref.length - 1])[0] < rot(ref[0])[0]) th += Math.PI;
    const R = ref.map(rot), bx = (A) => [Math.min(...A.map((p) => p[0])), Math.max(...A.map((p) => p[0])), Math.min(...A.map((p) => p[1])), Math.max(...A.map((p) => p[1]))];
    const [x0, x1, y0, y1] = bx(R), pad = phone ? 18 : 22;
    const fit = (w, h) => Math.min((W - pad * 2) / Math.max(0.01, w), (H - pad * 2) / Math.max(0.01, h));
    const vis = []; for (let v = lo; v <= n; v++) vis.push(v);
    const VP = vis.map((v) => rot(P[v - 1])), [a0, a1, b0, b1] = bx(VP);
    // a young constellation is drawn a little larger, and settles to its full size as it fills in
    const s = Math.max(fit(x1 - x0, y1 - y0), Math.min(fit(a1 - a0, b1 - b0), phone ? 40 : 44)), ox = W / 2 - ((a0 + a1) / 2) * s, oy = H / 2 - ((b0 + b1) / 2) * s;
    const at = (p) => [ox + p[0] * s, oy + p[1] * s];

    anims.forEach((a) => a.cancel()); twinkles.forEach((a) => a.cancel()); timers.forEach(clearTimeout); anims = []; twinkles = []; timers = [];
    svg.innerHTML = ""; svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("width", W); svg.setAttribute("height", H);
    svg.innerHTML = `<defs><radialGradient id="bk-g"><stop offset="0" stop-color="#f6efe0" stop-opacity=".55"/><stop offset=".35" stop-color="#f6efe0" stop-opacity=".12"/><stop offset="1" stop-color="#f6efe0" stop-opacity="0"/></radialGradient><radialGradient id="bk-gg"><stop offset="0" stop-color="#ffe7b8" stop-opacity=".9"/><stop offset=".3" stop-color="#f0b93a" stop-opacity=".22"/><stop offset="1" stop-color="#f0b93a" stop-opacity="0"/></radialGradient><linearGradient id="bk-sp"><stop offset="0" stop-color="#ffeccc" stop-opacity="0"/><stop offset=".5" stop-color="#fff6e4"/><stop offset="1" stop-color="#ffeccc" stop-opacity="0"/></linearGradient></defs>`;
    // older visits, gone to dust
    const dust = el("g", { opacity: ".9" }, svg);
    for (let v = Math.max(1, lo - 30); v < lo; v++) { const [x, y] = at(rot(P[v - 1])); if (x > 3 && y > 3 && x < W - 3 && y < H - 3) el("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: ".7", fill: "#f1ece2", opacity: (0.12 + 0.18 * ((v - lo + 30) / 30)).toFixed(2) }, dust); }
    const lg = el("g", {}, svg), sg = el("g", {}, svg);
    stars = vis.map((v, i) => {
      const [x, y] = at(VP[i]), last = v === n, r = last ? 2.3 : mag(v);
      const g = el("g", { class: "bk-s", transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})`, tabindex: "0", role: "img", "aria-label": `Visit ${v}, ${ago(S.date(v), last)}` }, sg);
      const a = el("g", { class: "a", opacity: "0" }, g);
      let fl = null, sp = null;
      if (last) {
        fl = el("circle", { class: "fl", r: "26", fill: "url(#bk-gg)", opacity: "0" }, a);
        sp = el("g", { class: "fl", opacity: "0" }, a); el("rect", { x: "-15", y: "-.35", width: "30", height: ".7", fill: "url(#bk-sp)" }, sp); el("rect", { x: "-15", y: "-.35", width: "30", height: ".7", fill: "url(#bk-sp)", transform: "rotate(90)" }, sp);
      }
      const gl = el("circle", { r: (last ? 13 : 5 + r * 3.2).toFixed(1), fill: last ? "url(#bk-gg)" : "url(#bk-g)", opacity: last ? ".75" : ".8" }, a);
      const co = el("circle", { class: "co", r: r.toFixed(2), fill: last ? "#fff1d6" : "#f3eee4" }, a);
      el("circle", { class: "ring", r: "9" }, g);
      return { v, x, y, g, a, gl, co, fl, sp, last };
    });
    lines = [];
    for (let i = 1; i < stars.length; i++) {
      const A = stars[i - 1], B = stars[i], d = Math.hypot(B.x - A.x, B.y - A.y), ux = (B.x - A.x) / d, uy = (B.y - A.y) / d, ga = 4 + mag(A.v) * 1.2, gb = B.last ? 7 : 4 + mag(B.v) * 1.2, len = Math.max(0, d - ga - gb);
      const l = el("line", { class: "bk-l", x1: (A.x + ux * ga).toFixed(1), y1: (A.y + uy * ga).toFixed(1), x2: (B.x - ux * gb).toFixed(1), y2: (B.y - uy * gb).toFixed(1), "stroke-dasharray": len.toFixed(1), "stroke-dashoffset": len.toFixed(1) }, lg);
      lines.push({ l, len });
    }
    shown = -1; hide();
  }

  /* the resting state, with nothing left to move but a slow twinkle */
  function still() {
    stars.forEach((st) => { st.a.setAttribute("opacity", "1"); if (st.sp) st.sp.setAttribute("opacity", ".22"); });
    lines.forEach(({ l }) => l.setAttribute("stroke-dashoffset", "0"));
    twinkle();
  }
  function twinkle() {
    if (REDUCE) return;
    twinkles = stars.map((st, i) => { const r = rng(SEED + st.v * 7), a = st.co.animate([{ opacity: 1 }, { opacity: 0.55 + r() * 0.2 }, { opacity: 1 }], { duration: 2600 + r() * 3400, delay: -r() * 4000, iterations: Infinity, easing: "ease-in-out" }); if (!running) a.pause(); return a; });
  }
  const A = (e, k, o) => { const a = e.animate(k, { fill: "both", easing: "cubic-bezier(.2,.8,.2,1)", ...o }); anims.push(a); return a; };

  function entrance() {
    if (REDUCE) { still(); return; }
    const old = stars.slice(0, -1), born = stars[stars.length - 1];
    old.forEach((st, i) => { A(st.a, [{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "scale(1)" }], { duration: 1000, delay: 150 + i * 140 }); });
    lines.slice(0, -1).forEach(({ l, len }, i) => A(l, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 420, delay: 380 + i * 230, easing: "cubic-bezier(.45,0,.3,1)" }));
    const tb = old.length ? Math.max(1100, 380 + (old.length - 2) * 230 + 420 + 420) : 250;
    // the new star: a soft flare that settles into a point
    A(born.a, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: tb });
    A(born.fl, [{ opacity: 0, transform: "scale(.2)" }, { opacity: 0.95, transform: "scale(1.55)", offset: 0.28 }, { opacity: 0, transform: "scale(.9)" }], { duration: 2000, delay: tb, easing: "ease-out" });
    A(born.sp, [{ opacity: 0, transform: "scale(.1) rotate(-20deg)" }, { opacity: 0.95, transform: "scale(1.35) rotate(0deg)", offset: 0.3 }, { opacity: 0.22, transform: "scale(.62) rotate(8deg)" }], { duration: 2200, delay: tb, easing: "ease-out" });
    A(born.co, [{ transform: "scale(3.2)", opacity: 0.4 }, { transform: "scale(1)", opacity: 1 }], { duration: 1700, delay: tb, easing: "cubic-bezier(.3,.7,.2,1)" });
    A(born.gl, [{ opacity: 0, transform: "scale(.3)" }, { opacity: 0.75, transform: "scale(1)" }], { duration: 1800, delay: tb + 200 });
    const nl = lines[lines.length - 1];
    if (nl) A(nl.l, [{ strokeDashoffset: nl.len }, { strokeDashoffset: 0 }], { duration: 900, delay: tb + 900, easing: "cubic-bezier(.45,0,.3,1)" });
    const gen = ++drawn;
    Promise.all(anims.map((a) => a.finished)).then(() => {
      if (gen !== drawn) return;
      anims.forEach((a) => a.cancel()); anims = []; still();
      if (shown < 0) { show(stars.length - 1); pinned = 1; timers.push(setTimeout(() => { if (pinned === 1) { pinned = 0; hide(); } }, 3200)); }
    }, () => {});
  }

  /* ── when was that visit: hover, tap or focus a star ── */
  function show(i) {
    if (i === shown) return; hide(); shown = i; const st = stars[i]; if (!st) return;
    st.g.classList.add("on"); if (lines[i - 1]) lines[i - 1].l.classList.add("on"); if (lines[i]) lines[i].l.classList.add("on");
    tip.innerHTML = `<span>Visit ${st.v}</span>${ago(S.date(st.v), st.last)}`;
    // beside the star, on the side away from its lines
    const nb = [stars[i - 1], stars[i + 1]].filter(Boolean), lean = nb.reduce((a, o) => a + o.x - st.x, 0), w = tip.offsetWidth, room = size[0] + (size[0] < 300 ? 60 : 0);
    let x = lean > 0 ? st.x - 14 - w : st.x + 14;
    if (x + w > room || (x < 0 && st.x + 14 + w <= room)) x = x < 0 ? st.x + 14 : st.x - 14 - w;
    x = Math.max(0, Math.min(room - w, x));
    tip.style.transform = `translate(${x.toFixed(1)}px, ${(st.y - 10).toFixed(1)}px)`; tip.classList.add("on");
  }
  function hide() { if (shown >= 0 && stars[shown]) { stars[shown].g.classList.remove("on"); lines.forEach(({ l }) => l.classList.remove("on")); } shown = -1; tip.classList.remove("on"); }
  function near(e, max) {
    const b = svg.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top; let bi = -1, bd = max;
    stars.forEach((st, i) => { const d = Math.hypot(st.x - x, st.y - y); if (d < bd) { bd = d; bi = i; } }); return bi;
  }
  let tapT = 0;
  sky.addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse" || !landed) return; const i = near(e, 26); if (i >= 0) { pinned = 0; show(i); } else if (!pinned) hide(); sky.style.cursor = i >= 0 ? "pointer" : ""; });
  sky.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && !pinned) hide(); });
  sky.addEventListener("pointerdown", (e) => {
    if (!landed) return; const i = near(e, e.pointerType === "mouse" ? 26 : 34); clearTimeout(tapT);
    if (i < 0) { pinned = 0; hide(); return; }
    pinned = 2; show(i); if (e.pointerType !== "mouse") tapT = setTimeout(() => { if (pinned === 2) { pinned = 0; hide(); } }, 4000);
  });
  document.addEventListener("pointerdown", (e) => { if (pinned && !sky.contains(e.target)) { pinned = 0; hide(); } });
  svg.addEventListener("focusin", (e) => { const i = stars.findIndex((st) => st.g === e.target); if (i >= 0) show(i); });
  svg.addEventListener("focusout", () => { if (!pinned) hide(); });

  /* ── the preview, for judging: simulated visits, the real ones untouched ── */
  root.querySelector(".bk-pv").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const v = +b.dataset.v; S = v ? sim(v, v === 12 ? 2 : 3) : start();
    root.querySelector(".bk-mine").hidden = !v; text(true); draw(); landed = true; entrance();
  });

  /* ── keep still when nobody can see it ── */
  const setRun = (on) => { if (on === running) return; running = on; twinkles.forEach((a) => (on ? a.play() : a.pause())); };
  let vis = true;
  if ("IntersectionObserver" in window) new IntersectionObserver((es) => { vis = es[es.length - 1].isIntersecting; setRun(vis && !document.hidden); }).observe(sky);
  document.addEventListener("visibilitychange", () => setRun(vis && !document.hidden));
  if ("ResizeObserver" in window) new ResizeObserver(() => { if (sky.clientWidth !== size[0] || sky.clientHeight !== size[1]) { draw(); if (landed) still(); } }).observe(sky);

  text(false); draw();
  if (REDUCE) still();
  return { land() { if (landed) return; landed = true; entrance(); } };
};
