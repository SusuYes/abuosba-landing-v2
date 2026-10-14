const WelcomeColour = (root, V) => {
  const MIN = 6e4, DAY = 864e5, H0 = -0.833, R = Math.PI / 180;
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), mix = (a, b, f) => a + (b - a) * f;
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  /* the sky by the sun's altitude: zenith, middle, horizon, glow colour, glow strength, how much of the stars show.
     Day stays a deep, soft blue so the cream text always reads. */
  const K = [
    [-90, "#03050e", "#050716", "#070a1d", "#141a40", 0, 1],
    [-18, "#04060f", "#060818", "#0a0d26", "#1c2150", .06, 1],
    [-12, "#050920", "#0a0f2c", "#131840", "#3a2f6a", .26, .9],
    [-8, "#081030", "#101a44", "#22285a", "#6a4a86", .36, .62],
    [-4, "#0c1538", "#18244f", "#352e5e", "#b0607a", .42, .36],
    [-1, "#0f1a40", "#1d2954", "#47345c", "#e07a5a", .45, .2],
    [2, "#112048", "#21315a", "#4a3c5c", "#f0955a", .44, .12],
    [6, "#13264e", "#203660", "#344266", "#e8a868", .32, .07],
    [12, "#142a54", "#1d3664", "#28446e", "#d8b890", .16, .05],
    [25, "#142c58", "#1b3767", "#224272", "#b8c8e0", .08, .04],
    [90, "#142e5c", "#1b396b", "#224474", "#b8c8e0", .06, .04],
  ].map((k) => [k[0], hex(k[1]), hex(k[2]), hex(k[3]), hex(k[4]), k[5], k[6]]);
  const MOONLIT = [hex("#0a1232"), hex("#0f1a42"), hex("#182458")];
  function pal(alt) {
    let i = 0; while (i < K.length - 2 && alt > K[i + 1][0]) i++;
    const a = K[i], b = K[i + 1], f = cl((alt - a[0]) / (b[0] - a[0]));
    return a.map((v, j) => (Array.isArray(v) ? v.map((c, n) => mix(c, b[j][n], f)) : mix(v, b[j], f)));
  }
  const rgb = (c, al) => `rgba(${c.map(Math.round).join(",")},${al === undefined ? 1 : +al.toFixed(3)})`;
  // facing the equator: in the north, east is on the left; in the south, on the right
  const face = V.lat >= 0 ? 180 : 0, sx = (az) => 50 + 46 * Math.sin((az - face) * R);

  function paint(t) {
    const [alt, az] = V.sun(t), p = pal(alt), m = V.moon(t);
    const night = cl((-alt - 4) / 10), k = m.alt > 0 ? m.illum * cl(m.alt / 15) * night * 0.6 : 0;
    const lift = cl((alt + 8) / 30), up = (c, j) => c * (1.55 + ((j === 3 ? 1.33 : 1.4) - 1.55) * lift) + 11 - lift; // v21: a brighter sky; v22/v23: night lifted too, so it has some depth
    const [zen, mid, hor] = [1, 2, 3].map((j) => p[j].map((c, n) => up(mix(c, MOONLIT[j - 1][n], k), j)));
    document.documentElement.style.setProperty("--cs-lift", lift.toFixed(3)); document.documentElement.style.setProperty("--sky-zen", rgb(zen)); // v42: inner pages' bar
    const g = p[4], ga = p[5], gx = sx(az).toFixed(1), belt = cl(1 - Math.abs(alt + 1) / 4) * 0.16;
    let bg = `radial-gradient(ellipse 80% 62% at ${gx}% 104%, ${rgb(g, ga)} 0%, ${rgb(g, ga * 0.4)} 38%, ${rgb(g, 0)} 100%), `;
    if (belt > 0.005) bg += `radial-gradient(ellipse 70% 38% at ${(100 - gx).toFixed(1)}% 102%, rgba(150,96,140,${belt.toFixed(3)}), rgba(150,96,140,0)), `;
    if (k > 0.02) { const mx = sx(m.az).toFixed(1), my = (96 - cl(m.alt, 0, 70) * 1.1).toFixed(1); bg += `radial-gradient(circle at ${mx}% ${my}%, rgba(205,215,245,${(k * 0.14).toFixed(3)}), rgba(205,215,245,0) 30vmax), `; }
    sky.style.background = bg + `linear-gradient(180deg, ${rgb(zen)} 0%, ${rgb(mid)} 58%, ${rgb(hor)} 100%)`;
    const stars = p[6] * (1 - k * 0.4); window.SKYNOW = { zen, mid, hor, lift, stars };
    if (!document.body.classList.contains("rising") && !document.body.classList.contains("day") && !document.body.classList.contains("setting")) document.documentElement.style.setProperty("--cs-stars", stars.toFixed(3));
    return { alt, m };
  }

  /* today, midnight to midnight on the visitor's clock, and the sunrises and sunsets around it */
  let t0, evs, rise, set, noonAlt;
  function day(now) {
    t0 = now - V.hm(now) * MIN - (now % MIN); evs = []; noonAlt = -90;
    let a0 = V.sun(t0 - 3 * 36e5)[0] - H0;
    for (let u = t0 - 3 * 36e5 + 2 * MIN; u <= t0 + DAY + 3 * 36e5; u += 2 * MIN) {
      const a = V.sun(u)[0] - H0; if (u >= t0 && u < t0 + DAY) noonAlt = Math.max(noonAlt, a + H0);
      if ((a0 <= 0) !== (a <= 0)) evs.push({ t: u - 2 * MIN + (2 * MIN * a0) / (a0 - a), kind: a > 0 ? "rise" : "set" });
      a0 = a;
    }
    const inDay = (e) => e.t >= t0 && e.t < t0 + DAY;
    rise = evs.find((e) => e.kind === "rise" && inDay(e));
    set = evs.find((e) => e.kind === "set" && inDay(e) && (!rise || e.t > rise.t)) || evs.find((e) => e.kind === "set" && inDay(e));
  }

  /* the words */
  const place = V.city ? (["India", "China"].includes(V.city) ? ` in ${V.city}` : ` near ${V.city}`) : "";
  function words(t) {
    const [alt, az] = V.sun(t), up = V.sun(t + 10 * MIN)[0] > alt;
    const phase = alt < -18 ? "deep night" : alt < -10 ? (up ? "first light" : "the last of the twilight") : alt < -4 ? "blue hour" : alt < 6 ? "golden hour" : alt < 20 ? (up ? "morning light" : "afternoon light") : "daylight";
    let e = null; for (const x of evs) if (Math.abs(x.t - t) <= 75 * MIN && (!e || Math.abs(x.t - t) < Math.abs(e.t - t))) e = x;
    if (e && alt > -12 && alt < 8) {
      const d = (t - e.t) / MIN, n = Math.abs(d), w = e.kind === "rise" ? "sunrise" : "sunset", ba = d < 0 ? "before" : "after";
      const how = n < 4 ? `just ${ba} ${w}` : n < 53 ? `about ${Math.round(n / 5) * 5} minutes ${ba} ${w}` : `about an hour ${ba} ${w}`;
      return `${phase}, ${how}${place}`;
    }
    let det;
    if (alt >= H0) det = `the sun ${alt >= 45 ? "high " : alt < 15 ? "low " : ""}in the ${V.compass(az)}`;
    else { const m = V.moon(t); det = m.alt > 3 && m.illum > 0.12 ? `a ${m.name.replace(/ moon$/, "")} moon in the ${V.compass(m.az)}` : alt < -30 ? "the sun far below the horizon" : alt < -12 ? "the sun well below the horizon" : "the sun just below the horizon"; }
    return `${phase}${place}, ${det}`;
  }
  /* v41: the same sentence, written in Arabic rather than translated after the fact */
  const isAr = () => document.documentElement.lang === "ar", adg = (s) => String(s).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
  const atime = (t) => V.time(t).replace(/^(\d{1,2}):(\d{2}) ?(AM|PM)$/i, (m, h, mi, ap) => `${adg(h)}:${adg(mi)} ${/AM/i.test(ap) ? "ص" : "م"}`).replace(/\d/g, (d) => adg(d));
  const CMP = { north: "الشمال", "north-east": "الشمال الشرقي", east: "الشرق", "south-east": "الجنوب الشرقي", south: "الجنوب", "south-west": "الجنوب الغربي", west: "الغرب", "north-west": "الشمال الغربي" };
  const MOONA = { new: "المحاق", "waxing crescent": "هلالٌ متزايد", "first quarter": "التربيع الأول", "waxing gibbous": "أحدبٌ متزايد", full: "البدر", "waning gibbous": "أحدبٌ متناقص", "last quarter": "التربيع الأخير", "waning crescent": "هلالٌ متناقص" };
  const CITYA = { "Sana'a": "صنعاء", Aden: "عدن", Riyadh: "الرياض", Dubai: "دبي", Qatar: "قطر", Doha: "الدوحة", Kuwait: "الكويت", Bahrain: "البحرين", Muscat: "مسقط", Amman: "عمّان", Beirut: "بيروت", Damascus: "دمشق", Baghdad: "بغداد", Cairo: "القاهرة", Khartoum: "الخرطوم", Tunis: "تونس", Algiers: "الجزائر", Casablanca: "الدار البيضاء", Tripoli: "طرابلس", Jerusalem: "القدس", Gaza: "غزة", Istanbul: "إسطنبول", Tehran: "طهران", Karachi: "كراتشي", Kolkata: "كولكاتا", India: "الهند", China: "الصين", Shanghai: "شانغهاي", Tokyo: "طوكيو", Singapore: "سنغافورة", "Kuala Lumpur": "كوالالمبور", Jakarta: "جاكرتا", Sydney: "سيدني", Melbourne: "ملبورن", Brisbane: "بريزبن", Perth: "بيرث", Adelaide: "أديلايد", Auckland: "أوكلاند", London: "لندن", Paris: "باريس", Berlin: "برلين", Madrid: "مدريد", Rome: "روما", Amsterdam: "أمستردام", Brussels: "بروكسل", Stockholm: "ستوكهولم", Moscow: "موسكو", Athens: "أثينا", Lisbon: "لشبونة", Dublin: "دبلن", "New York": "نيويورك", Chicago: "شيكاغو", Denver: "دنفر", "Los Angeles": "لوس أنجلوس", Toronto: "تورونتو", Vancouver: "فانكوفر", "Mexico City": "مكسيكو سيتي", "Sao Paulo": "ساو باولو", "Buenos Aires": "بوينس آيرس", Nairobi: "نيروبي", Lagos: "لاغوس", Johannesburg: "جوهانسبرغ", Addis_Ababa: "أديس أبابا", "Addis Ababa": "أديس أبابا", Djibouti: "جيبوتي", Mogadishu: "مقديشو" };
  const mins = (n) => (n <= 10 ? `${adg(n)} دقائق` : `${adg(n)} دقيقة`);
  function wordsAr(t) {
    const [alt, az] = V.sun(t), up = V.sun(t + 10 * MIN)[0] > alt;
    const phase = alt < -18 ? "عمق الليل" : alt < -10 ? (up ? "أول الضوء" : "آخر الشفق") : alt < -4 ? "الساعة الزرقاء" : alt < 6 ? "الساعة الذهبية" : alt < 20 ? (up ? "ضوء الصباح" : "ضوء العصر") : "وضح النهار";
    const pl = V.city ? `، قرب ${CITYA[V.city] || V.city}` : "";
    let e = null; for (const x of evs) if (Math.abs(x.t - t) <= 75 * MIN && (!e || Math.abs(x.t - t) < Math.abs(e.t - t))) e = x;
    if (e && alt > -12 && alt < 8) {
      const d = (t - e.t) / MIN, n = Math.abs(d), w = e.kind === "rise" ? "الشروق" : "الغروب", ba = d < 0 ? "قبل" : "بعد";
      const how = n < 4 ? (d < 0 ? `قُبيل ${w}` : `بُعيد ${w}`) : n < 53 ? `${ba} ${w} بنحو ${mins(Math.round(n / 5) * 5)}` : `${ba} ${w} بنحو ساعة`;
      return `${phase}، ${how}${pl}`;
    }
    let det;
    if (alt >= H0) det = `والشمس ${alt >= 45 ? "عالية " : alt < 15 ? "منخفضة " : ""}في ${CMP[V.compass(az)]}`;
    else { const m = V.moon(t); det = m.alt > 3 && m.illum > 0.12 ? `و${MOONA[m.name.replace(/ moon$/, "")] || "القمر"} في ${CMP[V.compass(m.az)]}` : alt < -30 ? "والشمس بعيدة تحت الأفق" : alt < -12 ? "والشمس تحت الأفق بكثير" : "والشمس تحت الأفق بقليل"; }
    return `${phase}${pl}، ${det}`;
  }
  const say = (t, now) => isAr()
    ? (Math.abs(t - now) < 3 * MIN ? `لون الصفحة هو لون سمائك الآن: ${wordsAr(now)}.` : `في ${atime(t)} ${t < now ? "كان" : "سيكون"} الوقت ${wordsAr(t)}.`)
    : (Math.abs(t - now) < 3 * MIN ? `The page is the colour of your sky right now: ${words(now)}.` : `At ${V.time(t)} it ${t < now ? "was" : "will be"} ${words(t)}.`);
  function metaText() {
    if (rise && set) return [rise, set].sort((x, y) => x.t - y.t).map((e) => `${e === rise ? "Sunrise" : "Sunset"} ${V.time(e.t)}`).join(" · ");
    if (rise) return `Sunrise ${V.time(rise.t)} · No sunset today`;
    if (set) return `No sunrise today · Sunset ${V.time(set.t)}`;
    return noonAlt > H0 ? "The sun stays up all day" : "No sunrise today";
  }

  /* the strip: faint by night, a little violet in twilight, warm while the sun is up */
  function stripBg() {
    const st = [];
    for (let i = 0; i <= 144; i++) {
      const a = V.sun(t0 + (i / 144) * DAY)[0]; let c;
      if (a >= H0) { const f = cl(a / 25); c = rgb([mix(236, 242, f), mix(150, 192, f), mix(104, 96, f)], mix(0.6, 0.78, f)); }
      else { const f = cl((a + 12) / 11.2); c = rgb([mix(241, 160, f), mix(236, 146, f), mix(226, 220, f)], mix(0.2, 0.42, f)); }
      st.push(`${c} ${(i / 1.44).toFixed(2)}%`);
    }
    return `linear-gradient(90deg, ${st.join(",")})`;
  }

  root.classList.add("cs");
  root.innerHTML = `<div class="greet"><h1>${V.greet()}.</h1><p></p>
    <div class="cs-day" role="slider" tabindex="0" aria-label="Your day, midnight to midnight" aria-valuemin="0" aria-valuemax="1439">
      <div class="cs-tr"><div class="cs-line"></div><i class="cs-tick"></i><i class="cs-tick"></i><i class="cs-now"></i><div class="cs-mk"><b class="cs-orb"></b><span class="cs-tm" aria-hidden="true"></span></div></div>
    </div>
    <span class="meta"><span class="cs-meta"></span><span class="hint">Drag along your day</span></span></div>`;
  const P = $("p", root), strip = $(".cs-day", root), tr = $(".cs-tr", root), mk = $(".cs-mk", root), orb = $(".cs-orb", root), tm = $(".cs-tm", root), nowT = $(".cs-now", root), ticks = $$(".cs-tick", root), lineEl = $(".cs-line", root), metaEl = $(".cs-meta", root);
  const sky = document.createElement("div"); sky.className = "cs-sky"; sky.setAttribute("aria-hidden", "true");
  document.body.insertBefore(sky, $("#sky") || document.body.firstChild);

  const pct = (t) => cl((t - t0) / DAY) * 100;
  function build(now) {
    day(now);
    lineEl.style.background = stripBg();
    [rise, set].forEach((e, i) => { ticks[i].style.display = e ? "" : "none"; if (e) ticks[i].style.left = pct(e.t) + "%"; });
    metaEl.textContent = metaText();
  }
  let cur = 0, lastMin = -1;
  function show(t) {
    cur = t; const x = pct(t), { alt, m } = paint(t);
    mk.style.left = x + "%"; tm.style.setProperty("--tx", x < 7 ? "-12%" : x > 93 ? "-88%" : "-50%");
    const sun = alt >= H0; orb.className = "cs-orb " + (sun ? "sun" : m.illum < 0.04 ? "moon dark" : "moon");
    if (!sun) { // the moon's phase, lit side by hemisphere
      const d = 10 * Math.pow(m.illum, 0.7), side = (m.waxing ? 1 : -1) * (V.lat >= 0 ? 1 : -1), cx = 5 - side * d;
      const mask = m.illum > 0.97 ? "none" : `radial-gradient(circle 5.2px at ${cx.toFixed(2)}px 50%, transparent 96%, #000 100%)`;
      orb.style.webkitMask = orb.style.mask = mask;
    } else orb.style.webkitMask = orb.style.mask = "none";
    const mn = Math.floor((t - t0) / MIN);
    if (mn !== lastMin) { lastMin = mn; tm.textContent = V.time(t); strip.setAttribute("aria-valuenow", cl(mn, 0, 1439)); strip.setAttribute("aria-valuetext", V.time(t)); }
    nowT.style.left = pct(Date.now()) + "%"; strip.classList.toggle("away", Math.abs(t - Date.now()) > 20 * MIN);
  }
  let said = "";
  function text(s, fade) {
    if (s === said) return; said = s;
    if (!fade || REDUCE) { P.classList.remove("out"); P.textContent = s; return; }
    P.classList.add("out"); setTimeout(() => { P.textContent = said; P.classList.remove("out"); }, 260);
  }

  /* motion: one small loop that runs only while sweeping or easing */
  let anim = null, raf = 0;
  function run(from, to, ms, done) {
    cancelAnimationFrame(raf); if (REDUCE || ms <= 0) { show(to()); anim = null; done && done(); return; }
    const s = performance.now();
    anim = (n) => { const k = Math.min(1, (n - s) / ms); show(from + (to() - from) * ease(k)); if (k < 1) raf = requestAnimationFrame(anim); else { anim = null; done && done(); } };
    raf = requestAnimationFrame(anim);
  }
  const stop = () => { cancelAnimationFrame(raf); anim = null; };
  let mode = "rest", back = 0;
  function settle() { mode = "rest"; strip.classList.remove("show"); text(say(Date.now(), Date.now()), true); }
  function home(delay = 0) {
    clearTimeout(back); mode = "ease";
    back = setTimeout(() => { text(say(Date.now(), Date.now()), true); const d = Math.abs(cur - Date.now()); run(cur, () => Date.now(), 700 + 900 * cl(d / (12 * 36e5)), settle); }, REDUCE ? 0 : delay);
  }
  function at(t) { clearTimeout(back); stop(); const now = Date.now(); t = cl(t, t0, t0 + DAY - MIN); show(t); text(say(t, now)); strip.classList.add("show"); }

  // drag (mouse at once; touch once it moves sideways, so a vertical scroll still scrolls)
  let drag = null;
  const tAt = (x) => { const r = tr.getBoundingClientRect(); return t0 + cl((x - r.left) / r.width) * DAY; };
  strip.addEventListener("pointerdown", (e) => {
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, on: e.pointerType === "mouse" };
    if (drag.on) { strip.setPointerCapture(e.pointerId); mode = "drag"; at(tAt(e.clientX)); e.preventDefault(); }
  });
  strip.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.on) { if (Math.abs(e.clientX - drag.x) < 6 || Math.abs(e.clientX - drag.x) < Math.abs(e.clientY - drag.y)) return; drag.on = true; try { strip.setPointerCapture(e.pointerId); } catch {} mode = "drag"; }
    at(tAt(e.clientX));
  });
  const up = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const was = drag; drag = null;
    if (!was.on && e.type === "pointerup") { mode = "drag"; at(tAt(e.clientX)); home(1300); return; } // a tap: a look, then back
    if (was.on) home(500);
  };
  strip.addEventListener("pointerup", up); strip.addEventListener("pointercancel", up);
  strip.addEventListener("keydown", (e) => {
    const step = { ArrowRight: 15, ArrowUp: 15, ArrowLeft: -15, ArrowDown: -15, PageUp: 120, PageDown: -120 }[e.key];
    if (step) { const q = 15 * MIN; at(t0 + Math.round((cur - t0) / q) * q + step * (e.shiftKey ? 4 : 1) * MIN); }
    else if (e.key === "Home") at(t0); else if (e.key === "End") at(t0 + DAY);
    else if (e.key === "Escape") return home(0); else return;
    e.preventDefault(); mode = "key"; home(2600);
  });
  strip.addEventListener("blur", () => { if (mode === "key") home(0); });

  // keep the colour true while the page stays open; pause while the tab is hidden
  let tick = 0;
  const live = () => { clearInterval(tick); tick = setInterval(() => { if (mode !== "rest") return; const n = Date.now(); if (n >= t0 + DAY) build(n); show(n); text(say(n, n)); }, 30000); };
  document.addEventListener("visibilitychange", () => { if (document.hidden) clearInterval(tick); else { if (mode === "rest") { const n = Date.now(); if (n >= t0 + DAY) build(n); show(n); } live(); } });

  const n0 = Date.now(); build(n0); text(say(n0, n0)); show(REDUCE ? n0 : t0);
  addEventListener("aolang", () => { said = ""; text(say(mode === "rest" ? Date.now() : cur, Date.now())); metaEl.textContent = metaText(); });
  return {
    land() {
      if (REDUCE) { show(Date.now()); live(); return; }
      const frac = (Date.now() - t0) / DAY; mode = "sweep"; strip.classList.add("show");
      run(t0, () => Date.now(), 1500 + 2100 * Math.sqrt(frac), () => { settle(); strip.classList.add("ping"); setTimeout(() => strip.classList.remove("ping"), 3400); });
      live();
    },
  };
};
