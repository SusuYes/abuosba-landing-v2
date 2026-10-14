/* shared helpers: the sky, the arrival of the mark, the Work figures and the words of the builds */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const Q = new URLSearchParams(location.search);
const EMBED = Q.has("embed");
const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (EMBED) document.documentElement.classList.add("embed");
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const NS = "http://www.w3.org/2000/svg";
const T = (s) => s.replace(/\[([^\]]+)\]/g, '<mark class="tbd">[$1]</mark>');

/* tonight, in Sana'a */
function Live(t = Date.now()) {
  const rise = SKY.next(SKY.suhail, t, "rise", 0), set = SKY.next(SKY.suhail, t, "set", 0);
  const sunset = SKY.next(SKY.sun, t, "set", -0.833), sunrise = SKY.next(SKY.sun, t, "rise", -0.833);
  const age = SKY.mod((t - Date.UTC(2000, 0, 6, 18, 14)) / 86400000, 29.530588);
  const illum = (1 - Math.cos((2 * Math.PI * age) / 29.530588)) / 2;
  const names = ["New moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full moon", "Waning gibbous", "Last quarter", "Waning crescent"];
  const moon = names[Math.floor(((age + 1.845) / 29.530588) * 8) % 8];
  const dark = SKY.sun(t)[0] < -6;
  const date = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Aden", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(t));
  return { t, now: SKY.at(t), up: SKY.suhail(t)[0] > 0, alt: SKY.suhail(t)[0], rise: rise && SKY.at(rise), set: set && SKY.at(set), sunset: sunset && SKY.at(sunset), sunrise: sunrise && SKY.at(sunrise), age, illum, moon, dark, date };
}

/* the sky: a canvas of stars, the Milky Way, a slow shooting star, and the hills around Sana'a.
   cam lets a take fly the sky towards any point. */
function Sky(canvas, o = {}) {
  const ctx = canvas.getContext("2d");
  const R = rng(o.seed || 7);
  let W = 0, H = 0, D = 1, stars = [], dust = null, hills = null;
  const cam = { x: 0.5, y: 0.5, s: 1 }, camFrom = { ...cam }, camTo = { ...cam };
  let camT0 = 0, camDur = 0, shoot = null, nextShoot = performance.now() + 6000;
  const density = o.density ?? 1;
  const band = (x) => 0.92 - x * 0.78; // the Milky Way, low left to high right

  function build() {
    const r = rng(o.seed || 7), n = Math.round(Math.max(260, (W * H) / 2600) * density);
    stars = [];
    for (let i = 0; i < n; i++) {
      const m = Math.pow(r(), 3.2);
      const c = r(); const col = c < 0.12 ? [255, 214, 170] : c < 0.24 ? [190, 210, 255] : [246, 242, 232];
      stars.push({ x: r(), y: r() * (o.hills ? 0.9 : 1), r: 0.35 + m * 1.55, a: 0.35 + m * 0.6, tw: r() * 6.28, sp: 0.6 + r() * 1.6, col });
    }
    // faint dust and glow, drawn once
    dust = document.createElement("canvas"); dust.width = W * D; dust.height = H * D;
    const g = dust.getContext("2d"); g.scale(D, D);
    if (o.milky !== false) {
      for (let k = 0; k < 9; k++) {
        const x = 0.05 + (k / 8) * 0.9, y = band(x) + (r() - 0.5) * 0.08, rad = (0.12 + r() * 0.1) * Math.max(W, H);
        const gr = g.createRadialGradient(x * W, y * H, 0, x * W, y * H, rad);
        gr.addColorStop(0, `rgba(150,150,210,${0.05 + r() * 0.035})`); gr.addColorStop(1, "rgba(150,150,210,0)");
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
      }
      const nd = Math.round((W * H) / 900 * density);
      for (let i = 0; i < nd; i++) {
        const x = r(), off = (r() + r() + r() - 1.5) * 0.12, y = band(x) + off;
        g.fillStyle = `rgba(230,228,255,${(0.1 + r() * 0.35) * (1 - Math.abs(off) * 5)})`;
        g.fillRect(x * W, y * H, r() < 0.9 ? 0.7 : 1.1, r() < 0.9 ? 0.7 : 1.1);
      }
    }
    if (o.hills) {
      hills = [];
      const ridge = (u) => 1 - Math.abs(Math.sin(u));
      for (const [base, amp, seed, col] of [[0.88, 0.11, 3, "#0c1030"], [0.92, 0.075, 11, "#070a1f"], [0.955, 0.035, 5, "#03040d"]]) {
        const hr = rng(seed), pts = [], N = 0, ph = [hr() * 6, hr() * 6, hr() * 6];
        for (let i = 0; i <= 240; i++) { const x = i / 240; pts.push([x, base - amp * (0.55 * ridge(x * 2.6 + ph[0]) + 0.3 * ridge(x * 6.5 + ph[1]) + 0.15 * ridge(x * 17 + ph[2]))]); }
        hills.push({ pts, col, N });
      }
    }
  }
  function resize() {
    D = Math.min(2, devicePixelRatio || 1); W = canvas.clientWidth || innerWidth; H = canvas.clientHeight || innerHeight;
    canvas.width = Math.round(W * D); canvas.height = Math.round(H * D); build(); if (REDUCE) frame(performance.now());
  }
  const P = (x, y) => [(x - cam.x) * cam.s * W + W / 2, (y - cam.y) * cam.s * H + H / 2];
  function frame(now) {
    if (camDur) { const k = Math.min(1, (now - camT0) / camDur), e = ease(k); for (const key of ["x", "y", "s"]) cam[key] = camFrom[key] + (camTo[key] - camFrom[key]) * e; if (k >= 1) camDur = 0; }
    ctx.setTransform(D, 0, 0, D, 0, 0); ctx.clearRect(0, 0, W, H);
    const t = now / 1000;
    // dust zooms with the sky
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.x * W, -cam.y * H); ctx.globalAlpha = o.dustAlpha ?? 1; ctx.drawImage(dust, 0, 0, W, H); ctx.restore();
    const grow = Math.min(2.2, Math.sqrt(cam.s));
    for (const s of stars) {
      const [x, y] = P(s.x, s.y); if (x < -4 || y < -4 || x > W + 4 || y > H + 4) continue;
      const a = s.a * (0.72 + 0.28 * Math.sin(t * s.sp + s.tw)) * (o.dim ?? 1);
      ctx.fillStyle = `rgba(${s.col[0]},${s.col[1]},${s.col[2]},${a})`;
      const rr = s.r * grow; if (rr < 0.9) ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2); else { ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.283); ctx.fill(); }
    }
    if (o.suhail) {
      const [x, y] = P(...o.suhail), p = 0.85 + 0.15 * Math.sin(t * 1.3);
      const g = ctx.createRadialGradient(x, y, 0, x, y, 16 * grow); g.addColorStop(0, `rgba(255,214,150,${0.55 * p})`); g.addColorStop(1, "rgba(255,214,150,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 16 * grow, 0, 6.283); ctx.fill();
      ctx.fillStyle = "#fff4dc"; ctx.beginPath(); ctx.arc(x, y, 1.9 * grow, 0, 6.283); ctx.fill();
    }
    // now and then, a shooting star
    if (!REDUCE && o.shooting !== false) {
      if (!shoot && now > nextShoot) { const x = 0.15 + R() * 0.7; shoot = { x: x * W, y: (0.05 + R() * 0.3) * H, vx: (R() < 0.5 ? -1 : 1) * (260 + R() * 160), vy: 120 + R() * 80, t0: now }; }
      if (shoot) {
        const k = (now - shoot.t0) / 900; if (k >= 1) { shoot = null; nextShoot = now + 9000 + R() * 9000; }
        else { const x = shoot.x + shoot.vx * k, y = shoot.y + shoot.vy * k, a = Math.sin(k * Math.PI);
          const g = ctx.createLinearGradient(x, y, x - shoot.vx * 0.22, y - shoot.vy * 0.22); g.addColorStop(0, `rgba(255,240,210,${0.8 * a})`); g.addColorStop(1, "rgba(255,240,210,0)");
          ctx.strokeStyle = g; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - shoot.vx * 0.22, y - shoot.vy * 0.22); ctx.stroke(); }
      }
    }
    if (o.draw) o.draw(ctx, t, api);
    if (hills) {
      const lift = (cam.s - 1) * H * 0.6;
      for (const h of hills) { ctx.fillStyle = h.col; ctx.beginPath(); ctx.moveTo(0, H); for (const [x, y] of h.pts) ctx.lineTo(x * W, y * H + lift); ctx.lineTo(W, H); ctx.fill(); }
      if (o.lights) { // a few windows lit in the old city
        const lr = rng(21); ctx.fillStyle = "rgba(255,196,110,.75)";
        for (let i = 0; i < 26; i++) { const x = lr(), j = Math.round(x * 240), y = hills[2].pts[j][1]; const on = Math.sin(t * 0.25 + i * 1.7) > -0.7; if (on) ctx.fillRect(x * W, y * H + lift + 4 + lr() * 10, 1.6, 1.6); }
      }
    }
  }
  function loop(now) { frame(now); if (!REDUCE) requestAnimationFrame(loop); }
  const api = {
    get W() { return W; }, get H() { return H; }, cam, P,
    fly(to, ms = 1100) { Object.assign(camFrom, cam); Object.assign(camTo, cam, to); camT0 = performance.now(); camDur = REDUCE ? 1 : ms; if (REDUCE) requestAnimationFrame(frame); },
    redraw() { frame(performance.now()); },
    resize,
  };
  addEventListener("resize", resize); resize(); requestAnimationFrame(loop);
  return api;
}

/* the welcome: the astrolabe draws itself, then flies into the mark it becomes on the page */
function Intro(target, onLand, skip) {
  const intro = $("#intro"), ib = $("#ib"), body = document.body;
  if (!intro || skip) { if (intro) intro.remove(); if (onLand) onLand(); return; }
  let landed = false;
  function land() {
    if (landed) return; landed = true;
    const el = typeof target === "function" ? target() : target;
    const r = ib.getBoundingClientRect(), tr = el.getBoundingClientRect(), s = tr.width / r.width;
    intro.classList.add("fly");
    ib.style.transform = `translate(${(tr.left - r.left).toFixed(1)}px, ${(tr.top - r.top).toFixed(1)}px) scale(${s.toFixed(4)})`;
    body.classList.remove("intro"); body.classList.add("landing");
    if (onLand) onLand();
    setTimeout(() => { body.classList.remove("landing"); intro.remove(); }, REDUCE ? 0 : 1080);
  }
  body.classList.add("intro");
  if (REDUCE || Q.has("nointro")) land(); else setTimeout(land, 3900);
  intro.addEventListener("click", land);
  addEventListener("keydown", (e) => { if (!landed && ["Escape", "Enter", " "].includes(e.key)) land(); });
  return land;
}

function figure(kind, opts = "") {
  if (kind === "dots") { let c = ""; for (let i = 0; i < 120; i++) c += `<circle class="v-dot" cx="${10 + (i % 30) * 23.3}" cy="${16 + Math.floor(i / 30) * 22}" r="6" style="animation-delay:${(i * 0.04).toFixed(2)}s"/>`; return `<svg viewBox="0 0 700 100" ${opts}>${c}</svg>`; }
  if (kind === "sheets") { let c = ""; [[-260, -10], [-170, 18], [-90, -16], [90, 14], [170, -12], [260, 10]].forEach(([dx, dy]) => (c += `<rect class="v-sheet" x="320" y="18" width="60" height="64" rx="4" style="--dx:${dx}px;--dy:${dy}px"/>`)); return `<svg viewBox="0 0 700 100" ${opts}>${c}<rect class="v-hub" x="320" y="18" width="60" height="64" rx="4"/></svg>`; }
  let c = ""; [30, 52, 40, 70, 58, 82, 64, 50, 74, 88, 60, 46].forEach((h, i) => (c += `<rect class="v-bar" x="${14 + i * 57}" y="${96 - h}" width="34" height="${h}" rx="2" style="animation-delay:${(i * 0.07).toFixed(2)}s"/>`)); return `<svg viewBox="0 0 700 100" ${opts}>${c}</svg>`;
}

/* the same words in every take */
const CASES = {
  arrivals: { no: "01", title: "Student arrivals", short: "Check-in for [N] arriving students, reused for quarantine.", lead: "A check-in system that got [N] students through arrival during COVID, and was reused by [body] for quarantine.", meta: [["Role", "[Lead developer]"], ["When", "[Year]"], ["Built with", "[Stack]"], ["Status", "Still running"]], fig: "dots", cap: "Every dot is a student checked in. [Real numbers to come.]" },
  hub: { no: "02", title: "Engagement hub", short: "[N] team spreadsheets folded into one place.", lead: "[N] separate team spreadsheets, folded into one place anyone can ask a question of.", meta: [["Role", "[Lead developer]"], ["When", "[Year]"], ["Built with", "[Stack]"], ["Status", "Still running"]], fig: "sheets", cap: "Many sheets in, one answer out." },
  events: { no: "03", title: "Events platform", short: "Every campus event in one app, reporting built in.", lead: "Every campus event in one app, with the reporting built in rather than bolted on.", meta: [["Role", "[Lead developer]"], ["When", "[Year]"], ["Built with", "[Stack]"], ["Status", "Still running"]], fig: "bars", cap: "Events a month. [Real numbers to come.]" },
};
const ORDER = ["arrivals", "hub", "events"];
/* the thoughts, from the vault (src/content/thoughts, see the README): every published post in either language,
   newest first. The page writes them into #site-data at build time. */
const SITE = JSON.parse(document.getElementById("site-data").textContent);
const NOTES = SITE.notes, NORDER = SITE.order;
function caseBody(id, cls = "") {
  const c = CASES[id];
  return `<p class="lead">${T(c.lead)}</p>
    <dl class="meta">${c.meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${T(v)}</dd></div>`).join("")}</dl>
    <figure class="figure">${figure(c.fig)}<figcaption>${T(c.cap)}</figcaption></figure>
    <h3>The problem</h3><p class="dim">${T("[Two or three sentences on what was broken or missing, and who it hurt.]")}</p>
    <h3>What I built</h3><p class="dim">${T("[What it does, in plain words. One sentence on the part you're proudest of.]")}</p>
    <h3>What changed</h3><p class="dim">${T("[The result in numbers, and who still uses it.]")}</p>`;
}
