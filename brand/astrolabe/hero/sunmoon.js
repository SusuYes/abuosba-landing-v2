// Sun, Moon and Suhail: plain functions for the page (a line-for-line port of bg2/sunmoon_astro.py).
// Angles in degrees. Dates are JS Date objects. Rete frame: centre (0,0), y down, R = 100, OFF = 164.84;
// a body at (ra, dec) sits at angle (OFF - ra) clockwise from the top, radius 100*tan((90 - dec)/2).
// Moon: Astronomical Almanac low-precision series (geocentric, ~0.3 deg); topocentric parallax (up to ~1 deg) not applied.

const SM_R = 100, SM_OFF = 164.84, SM_EPS = 23.439;
const smRad = d => d * Math.PI / 180, smDeg = r => r * 180 / Math.PI, smMod = (x, m) => ((x % m) + m) % m;

function smJD(date) { return 2440587.5 + date.getTime() / 86400000; }

// the sun: same series the page already uses (sunRaDec), plus its ecliptic longitude
function sunEclLon(date) {
  const n = smJD(date) - 2451545, L = smMod(280.46 + 0.9856474 * n, 360), g = smRad(smMod(357.528 + 0.9856003 * n, 360));
  return smMod(L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g), 360);
}
function sunRaDecSM(date) {
  const n = smJD(date) - 2451545, lam = smRad(sunEclLon(date)), e = smRad(23.439 - 4e-7 * n);
  return [smMod(smDeg(Math.atan2(Math.cos(e) * Math.sin(lam), Math.cos(lam))), 360), smDeg(Math.asin(Math.sin(e) * Math.sin(lam)))];
}

function eclToEq(lam, beta) {
  const l = smRad(lam), b = smRad(beta), e = smRad(SM_EPS);
  const ra = smMod(smDeg(Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l))), 360);
  const dec = smDeg(Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l)));
  return [ra, dec];
}

function moonEcl(date) {
  const T = (smJD(date) - 2451545) / 36525, s = x => Math.sin(smRad(x));
  const lam = smMod(218.32 + 481267.881 * T
    + 6.29 * s(135.0 + 477198.87 * T) - 1.27 * s(259.3 - 413335.36 * T)
    + 0.66 * s(235.7 + 890534.22 * T) + 0.21 * s(269.9 + 954397.74 * T)
    - 0.19 * s(357.5 + 35999.05 * T) - 0.11 * s(186.5 + 966404.03 * T), 360);
  const beta = 5.13 * s(93.3 + 483202.02 * T) + 0.28 * s(228.2 + 960400.89 * T)
    - 0.28 * s(318.3 + 6003.15 * T) - 0.17 * s(217.6 - 407332.21 * T);
  return [lam, beta];
}

// moonRaDec(date) -> [ra, dec]
function moonRaDec(date) { return eclToEq(...moonEcl(date)); }

// reteXY(ra, dec) -> [x, y] in the rete frame (translate sun_body / moon_body here)
function reteXY(ra, dec) {
  const r = SM_R * Math.tan(smRad((90 - dec) / 2)), a = smRad(SM_OFF - ra);
  return [r * Math.sin(a), -r * Math.cos(a)];
}

// the bright limb's position angle chi (from celestial north through east) mapped into the rete frame:
// north points to the centre of the drawing, east is the direction of increasing RA; the projection is conformal.
function limbAngle(ra, dec, chi) {
  const [x, y] = reteXY(ra, dec), r = Math.hypot(x, y), nx = -x / r, ny = -y / r;
  const a = smRad(SM_OFF - ra), ex = -Math.cos(a), ey = -Math.sin(a);
  const vx = Math.cos(smRad(chi)) * nx + Math.sin(smRad(chi)) * ex, vy = Math.cos(smRad(chi)) * ny + Math.sin(smRad(chi)) * ey;
  return smMod(smDeg(Math.atan2(vx, -vy)), 360);
}

// moonPhase(date) -> {k: illuminated fraction 0..1, waxing: bool, pa: position angle of the bright limb (deg, N through E),
//                     limb: the bright limb's direction in the rete frame (deg clockwise from the top), for moonLitPath}
function moonPhase(date) {
  const [lm, bm] = moonEcl(date), ls = sunEclLon(date);
  const k = (1 - Math.cos(smRad(bm)) * Math.cos(smRad(lm - ls))) / 2;
  const waxing = smMod(lm - ls, 360) < 180;
  const [ra, dec] = moonRaDec(date), [ras, decs] = sunRaDecSM(date), da = smRad(ras - ra);
  const pa = smMod(smDeg(Math.atan2(Math.cos(smRad(decs)) * Math.sin(da),
    Math.sin(smRad(decs)) * Math.cos(smRad(dec)) - Math.cos(smRad(decs)) * Math.sin(smRad(dec)) * Math.cos(da))), 360);
  return { k, waxing, pa, limb: limbAngle(ra, dec, pa) };
}

// moonLitPath(r, k, limb) -> SVG d for #moon_lit, centred on (0,0) inside #moon_body (r = MOON_R[take]: 15, or 12.75 in sm_rails).
// limb: moonPhase(date).limb (a number). If a boolean `waxing` is passed instead, the lit side is put on the right when
// waxing and the left when waning: a fallback only, not the true orientation.
function moonLitPath(r, k, limb) {
  if (typeof limb === 'boolean') limb = limb ? 90 : 270;
  if (k < 0.005) return '';
  const rot = limb - 90, c = Math.cos(smRad(rot)), s = Math.sin(smRad(rot));
  const P = (x, y) => (x * c - y * s).toFixed(2) + ',' + (x * s + y * c).toFixed(2);
  const xt = r * (1 - 2 * k), top = P(0, -r), bot = P(0, r);
  let d = `M${top} A${r.toFixed(2)} ${r.toFixed(2)} ${rot.toFixed(1)} 0 1 ${bot}`;
  d += Math.abs(xt) < 0.01 ? ` L${top}` : ` A${Math.abs(xt).toFixed(2)} ${r.toFixed(2)} ${rot.toFixed(1)} 0 ${xt > 0 ? 0 : 1} ${top}`;
  return d + 'Z';
}

// skyStep(sunAlt) -> {name, face, lines, starOpacity}. v2 (sm_bold / sm_rails / sm_minimal): four steps anyone reads.
// Fill #face and #moon_dark with face, #plate with lines, and set #starfield opacity (sm_bold only).
// (The first `sunmoon` option's six steps are superseded; its colours are listed in options-sunmoon.json.)
const SKY_STEPS = [
  [6, 'day', '#2d5a94', '#4a76b0', 0.0],
  [-3, 'dawn / dusk', '#5b2915', '#7d4526', 0.12],
  [-18, 'twilight', '#33295e', '#4d4380', 0.5],
  [-91, 'night', '#161b44', '#2e3570', 1.0],
];
function skyStep(sunAlt) {
  for (const [lo, name, face, lines, starOpacity] of SKY_STEPS) if (sunAlt >= lo) return { name, face, lines, starOpacity };
}

// bodies v3 (brass family): moonLitPath's r = MOON_R[take]; the lit part is pale brass #e2c77f (static fill),
// the dark part is a piercing: #moon_dark takes the face colour. Suhail's glint and trail inherit the #suhail group fill.
const MOON_R = { sm_bold: 15, sm_minimal: 15, sm_rails: 12.75 };
const SUHAIL_FILL = { up: '#ffd766', down: '#7d6936' };   // up when Suhail's true altitude > -0.57 deg

// ---- rails (sm_rails): a body's day-circle about the pole, fixed on the plate for the current declination.
// Solid over the arc above the horizon, dotted below, and a tick where it crosses the horizon (its rise and set).
// Returns {up, down, ticks} path data for #<body>_rail_up, #<body>_rail_down, #<body>_rail_ticks.
const RAIL = { w: 1.5, dot: 1.2, tick: 11, tickW: 3.4, LAT: 15.37 };
const smF = v => { let s = v.toFixed(2); s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '-0' : s; };
const smPt = p => smF(p[0]) + ',' + smF(p[1]);
const smP = (r, a) => [r * Math.sin(smRad(a)), -r * Math.cos(smRad(a))];
const smArcTo = (r, p, large, sweep) => ` A${smF(r)} ${smF(r)} 0 ${large} ${sweep} ${smPt(p)}`;
function smDisc(p, r) { return 'M' + smPt([p[0] - r, p[1]]) + smArcTo(r, [p[0] + r, p[1]], 0, 1) + smArcTo(r, [p[0] - r, p[1]], 0, 1) + 'Z'; }
function smArcBand(r, a0, a1, w) {           // round caps, centred on the pole
  const ro = r + w / 2, ri = r - w / 2, large = Math.abs(a1 - a0) > 180 ? 1 : 0, sweep = a1 > a0 ? 1 : 0;
  return 'M' + smPt(smP(ro, a0)) + smArcTo(ro, smP(ro, a1), large, sweep) + smArcTo(w / 2, smP(ri, a1), 0, sweep)
    + smArcTo(ri, smP(ri, a0), large, 1 - sweep) + smArcTo(w / 2, smP(ro, a0), 0, sweep) + 'Z';
}
function smBar(p0, p1, w) {                  // round caps
  const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy), nx = -dy / L * w / 2, ny = dx / L * w / 2;
  const a = [p0[0] + nx, p0[1] + ny], b = [p1[0] + nx, p1[1] + ny], c = [p1[0] - nx, p1[1] - ny], e = [p0[0] - nx, p0[1] - ny];
  return 'M' + smPt(a) + ' L' + smPt(b) + smArcTo(w / 2, c, 0, 0) + ' L' + smPt(e) + smArcTo(w / 2, a, 0, 0) + 'Z';
}
function railPaths(dec) {
  const r = SM_R * Math.tan(smRad((90 - dec) / 2)), c = -Math.tan(smRad(RAIL.LAT)) * Math.tan(smRad(dec));
  if (c <= -1) return { up: smDisc([0, 0], r + RAIL.w / 2) + smDisc([0, 0], r - RAIL.w / 2), down: '', ticks: '' };   // never sets (evenodd)
  if (c >= 1) { let d = ''; for (let a = 0; a < 360; a += 5) d += smDisc(smP(r, a), RAIL.dot); return { up: '', down: d, ticks: '' }; }
  const H0 = smDeg(Math.acos(c)), n = Math.max(6, Math.floor((360 - 2 * H0) * r * Math.PI / 180 / 9));
  let down = ''; for (let i = 1; i < n; i++) down += smDisc(smP(r, H0 + (360 - 2 * H0) * i / n), RAIL.dot);
  const ticks = [-H0, H0].map(a => smBar(smP(r - RAIL.tick, a), smP(r + RAIL.tick, a), RAIL.tickW)).join('');
  return { up: smArcBand(r, -H0, H0, RAIL.w), down, ticks };
}
// regenerate sun_rail once a day and moon_rail every 15 minutes or so (the moon's declination moves up to ~0.3 deg an hour)
function sunRailPath(date) { return railPaths(sunRaDecSM(date)[1]); }
function moonRailPath(date) { return railPaths(moonRaDec(date)[1]); }

if (typeof module !== 'undefined') module.exports = { moonRaDec, moonPhase, moonLitPath, skyStep, reteXY, sunEclLon, sunRaDecSM, limbAngle, railPaths, sunRailPath, moonRailPath, MOON_R, SUHAIL_FILL };
