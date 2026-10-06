"""Section 4 of the brand book: the page ground follows the real sun over Sana'a, morphing continuously
from night to day through one ramp (interpolated in OKLab so every in-between colour stays clean)."""
import json

# sun altitude (degrees) -> ground, text, accent. The ramp is one continuous path: indigo night, violet
# twilight, mauve and copper around sunrise, warm sand, then alabaster day. Text and accent ride along.
RAMP = [
    (-90, '#12163a', '#e9e0c9', '#d6a64e'),
    (-18, '#12163a', '#e9e0c9', '#d6a64e'),
    (-12, '#1c2050', '#e9e0c9', '#d9a752'),
    (-6,  '#33295e', '#ece1cb', '#e0ac56'),
    (-2,  '#6a4058', '#f1e6d2', '#efbd62'),
    (1,   '#a8644e', '#fbf1df', '#ffd27a'),
    (4,   '#d39a6a', '#24180f', '#6e4512'),
    (9,   '#e5c49c', '#22190f', '#7b5317'),
    (20,  '#ece2d1', '#1d1a16', '#865d1f'),
    (45,  '#eee9e0', '#1b1a17', '#8a6424'),
    (90,  '#eee9e0', '#1b1a17', '#8a6424'),
]

def section(mark_svg=''):
    return '''
  <section class="lk" id="sky">
    <header class="phead"><span class="pnum">4</span><h2>The mark and the page follow the sky · proposal</h2></header>
    <div class="skyrow">
    <div class="skymark" id="skymark">__MARK__</div>
    <div class="skyprev" id="skyprev">
      <div class="sp-head"><img id="sp-word" alt="Suhail"><span class="sp-read" id="sp-read"></span></div>
      <h3 class="sp-h">When Suhail rises, the night cools.</h3>
      <p class="sp-p">The ground of the whole site follows the real sun over Sana'a. It never switches between a light and a dark theme: it moves through one continuous sky, from indigo night through violet twilight and a copper sunrise to warm sand and alabaster day, and back.</p>
      <p class="sp-mono" id="sp-mono"></p>
    </div>
    </div>
    <input type="range" id="sp-slider" min="0" max="1439" step="1" aria-label="Time of day in Sana'a">
    <div class="sp-ctl"><button type="button" id="sp-play">Play a day</button><button type="button" id="sp-now">Now</button><span id="sp-time"></span></div>
    <div class="sp-strip" id="sp-strip" aria-label="Today's ground colour, hour by hour"></div>
    <div class="sp-strip mk" id="sp-mstrip" aria-label="The mark's face colour today"></div>
    <p class="idea">Top strip: the page ground today in Sana'a, midnight to midnight. Bottom strip: the face of the astrolabe over the same day. The mark no longer jumps between four sky colours: its face moves continuously from night indigo through twilight violet, a short copper sunrise and a rose-violet morning into day blue, the stars fade out as the sun climbs, and the plate turns with the real sky. Drag the slider to watch both together.</p>
    <p class="idea">The page itself never switches between a light and a dark theme either: its ground follows the same sun, through one blended sky (no greys), and its text flips from light to dark once at sunrise and back at sunset.</p>
  </section>'''.replace('__MARK__', mark_svg)

def css():
    return '''
.skyrow{ display:grid; grid-template-columns:minmax(0,220px) 1fr; gap:16px; align-items:center; }
@media (max-width:640px){ .skyrow{ grid-template-columns:1fr; } .skymark{ max-width:260px; margin:0 auto; } }
.skymark svg{ width:100%; height:auto; display:block; }
.sp-strip.mk{ height:22px; margin-top:-6px; width:100%; }
.sp-strip{ width:100%; }
.skyprev{ --g:#12163a; --t:#e9e0c9; --a:#d6a64e; background:var(--g); color:var(--t); border-radius:14px; padding:22px; display:flex; flex-direction:column; gap:10px; transition:background .6s, color .6s; }
.sp-head{ display:flex; align-items:center; justify-content:space-between; gap:12px; }
.sp-head img{ height:34px; width:auto; }
.sp-read, .sp-mono{ font:500 12.5px 'IBM Plex Mono', ui-monospace, monospace; letter-spacing:.06em; color:var(--a); font-variant-numeric:tabular-nums; }
.sp-h{ font:500 clamp(22px,4vw,30px)/1.2 'Newsreader', Georgia, serif; text-wrap:balance; }
.sp-p{ font:400 16.5px/1.55 'Newsreader', Georgia, serif; max-width:62ch; }
#sp-slider{ width:100%; accent-color:#b78a3c; }
.sp-ctl{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; font:13px 'IBM Plex Mono', ui-monospace, monospace; color:var(--muted); }
.sp-ctl button{ font:500 13px 'IBM Plex Mono', ui-monospace, monospace; border:1.5px solid var(--brass); background:transparent; color:var(--text); border-radius:999px; padding:4px 12px; cursor:pointer; }
.sp-strip{ height:38px; border-radius:8px; overflow:hidden; border:1px solid var(--rule); }
.sp-strip i{ display:block; }
'''

def js(word_dark_uri, word_light_uri):
    return '''<script>
(function () {
  const RAMP = ''' + json.dumps(RAMP) + ''';
  const LAT = 15.37, LON = 44.19, rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
  const jd = t => t.getTime() / 864e5 + 2440587.5;
  function sun(t) {
    const n = jd(t) - 2451545, L = (280.46 + .9856474 * n) % 360, g = rad((357.528 + .9856003 * n) % 360);
    const lam = rad(L + 1.915 * Math.sin(g) + .02 * Math.sin(2 * g)), e = rad(23.439 - 4e-7 * n);
    const ra = (deg(Math.atan2(Math.cos(e) * Math.sin(lam), Math.cos(lam))) + 360) % 360, dec = deg(Math.asin(Math.sin(e) * Math.sin(lam)));
    const gm = (280.46061837 + 360.98564736629 * n) % 360, H = rad(((gm + LON - ra) % 360 + 360) % 360);
    return deg(Math.asin(Math.sin(rad(LAT)) * Math.sin(rad(dec)) + Math.cos(rad(LAT)) * Math.cos(rad(dec)) * Math.cos(H)));
  }
  // sRGB <-> OKLab (Björn Ottosson)
  const s2l = c => c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4), l2s = c => c <= .0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - .055;
  function toLab(hex) {
    const [r, g, b] = [1, 3, 5].map(i => s2l(parseInt(hex.slice(i, i + 2), 16) / 255));
    const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b), m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b), s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
    return [.2104542553 * l + .793617785 * m - .0040720468 * s, 1.9779984951 * l - 2.428592205 * m + .4505937099 * s, .0259040371 * l + .7827717662 * m - .808675766 * s];
  }
  function toHex([L, A, B]) {
    const l = Math.pow(L + .3963377774 * A + .2158037573 * B, 3), m = Math.pow(L - .1055613458 * A - .0638541728 * B, 3), s = Math.pow(L - .0894841775 * A - 1.291485548 * B, 3);
    const rgb = [4.0767416621 * l - 3.3077115913 * m + .2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s, -.0041960863 * l - .7034186147 * m + 1.707614701 * s];
    return '#' + rgb.map(c => Math.round(Math.max(0, Math.min(1, l2s(c))) * 255).toString(16).padStart(2, '0')).join('');
  }
  function at(alt) {
    let i = 0; while (i < RAMP.length - 2 && alt > RAMP[i + 1][0]) i++;
    const [a0, ...c0] = RAMP[i], [a1, ...c1] = RAMP[i + 1], k = Math.max(0, Math.min(1, (alt - a0) / (a1 - a0 || 1)));
    const mix = (x, y) => { const p = toLab(x), q = toLab(y); return toHex(p.map((v, j) => v + (q[j] - v) * k)); };
    const g = mix(c0[0], c1[0]);
    const dark = toLab(g)[0] < .55;                    // text flips once, where the ground is light enough for ink
    return { g, t: dark ? '#efe6d1' : '#1d1a16', a: mix(c0[2], c1[2]), dark };
  }
  // ---- the mark's face: one continuous path in OKLCH (shortest hue arc), keyed to the sun's altitude ----
  const FACE = [[-90, '#161b44'], [-18, '#161b44'], [-12, '#1d2150'], [-6, '#33295e'], [-2.5, '#4c2650'], [0.5, '#5b2915'], [3, '#5b2915'], [7, '#4a2f5e'], [12, '#2f4a86'], [30, '#2d5a94'], [90, '#30609c']];
  const lch = hex => { const [L, a, b] = toLab(hex); return [L, Math.hypot(a, b), Math.atan2(b, a)]; };
  const fromLch = ([L, C, h]) => toHex([L, C * Math.cos(h), C * Math.sin(h)]);
  function faceAt(alt) {
    let i = 0; while (i < FACE.length - 2 && alt > FACE[i + 1][0]) i++;
    const [a0, c0] = FACE[i], [a1, c1] = FACE[i + 1], k = Math.max(0, Math.min(1, (alt - a0) / (a1 - a0 || 1)));
    const p = lch(c0), q = lch(c1); let dh = q[2] - p[2]; if (dh > Math.PI) dh -= 2 * Math.PI; if (dh < -Math.PI) dh += 2 * Math.PI;
    return fromLch([p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + dh * k]);
  }
  const lighten = (hex, d) => { const v = toLab(hex); v[0] = Math.min(1, v[0] + d); return toHex(v); };
  function sunRaDec(t) {
    const n = jd(t) - 2451545, L = (280.46 + .9856474 * n) % 360, g = rad((357.528 + .9856003 * n) % 360);
    const lam = rad(L + 1.915 * Math.sin(g) + .02 * Math.sin(2 * g)), e = rad(23.439 - 4e-7 * n);
    return [(deg(Math.atan2(Math.cos(e) * Math.sin(lam), Math.cos(lam))) + 360) % 360, deg(Math.asin(Math.sin(e) * Math.sin(lam)))];
  }
  const lst = t => ((280.46061837 + 360.98564736629 * (jd(t) - 2451545)) % 360 + LON + 360) % 360;
  function altOf(ra, dec, t) { const H = rad(((lst(t) - ra) % 360 + 360) % 360); return deg(Math.asin(Math.sin(rad(LAT)) * Math.sin(rad(dec)) + Math.cos(rad(LAT)) * Math.cos(rad(dec)) * Math.cos(H))); }
  const reteXY = (ra, dec) => { const r = 100 * Math.tan(rad((90 - dec) / 2)), a = rad(164.84 - ra); return [r * Math.sin(a), -r * Math.cos(a)]; };
  const M = id => document.getElementById('sk_' + id);
  function markAt(t, alt) {
    const f = faceAt(alt); if (M('face')) M('face').setAttribute('fill', f);
    if (M('plate')) M('plate').setAttribute('fill', lighten(f, .09));
    if (M('starfield')) M('starfield').style.opacity = Math.max(0, Math.min(1, (-alt - 2) / 14)).toFixed(3);
    if (M('rete')) M('rete').setAttribute('transform', `rotate(${(lst(t) - 164.84).toFixed(2)})`);
    const [sx, sy] = reteXY(...sunRaDec(t)); if (M('sun_body')) M('sun_body').setAttribute('transform', `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`);
    const up = altOf(95.988, -52.696, t) > -0.57;
    if (M('suhail')) M('suhail').setAttribute('fill', up ? '#f0b93a' : '#7d6936'); if (M('suhail_hi')) M('suhail_hi').setAttribute('fill', up ? '#fff0b8' : '#9c8850');
    return f;
  }
  const $ = id => document.getElementById(id), box = $('skyprev');
  const day0 = () => { const d = new Date(); d.setUTCHours(-3, 0, 0, 0); if (Date.now() - d.getTime() >= 864e5) d.setTime(d.getTime() + 864e5); return d; };   // Sana'a midnight
  let base = day0(), playing = false;
  function show(min) {
    const t = new Date(base.getTime() + min * 6e4), alt = sun(t), c = at(alt); markAt(t, alt);
    box.style.setProperty('--g', c.g); box.style.setProperty('--t', c.t); box.style.setProperty('--a', c.a);
    $('sp-word').src = c.dark ? ''' + json.dumps(word_dark_uri) + ''' : ''' + json.dumps(word_light_uri) + ''';
    const hh = String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
    $('sp-time').textContent = `Sana'a ${hh} · sun ${alt >= 0 ? '+' : ''}${alt.toFixed(1)}°`;
    $('sp-read').textContent = `SANA'A ${hh}`; $('sp-mono').textContent = `SUN ${alt >= 0 ? '+' : ''}${alt.toFixed(1)}° · GROUND ${c.g.toUpperCase()}`;
    $('sp-slider').value = min;
  }
  const nowMin = () => Math.floor((Date.now() - base.getTime()) / 6e4) % 1440;
  $('sp-strip').style.background = 'linear-gradient(90deg,' + Array.from({ length: 145 }, (_, i) => `${at(sun(new Date(base.getTime() + i * 10 * 6e4))).g} ${(i / 144 * 100).toFixed(2)}%`).join(',') + ')';
  $('sp-mstrip').style.background = 'linear-gradient(90deg,' + Array.from({ length: 145 }, (_, i) => `${faceAt(sun(new Date(base.getTime() + i * 10 * 6e4)))} ${(i / 144 * 100).toFixed(2)}%`).join(',') + ')';
  $('sp-slider').addEventListener('input', e => { playing = false; show(+e.target.value); });
  $('sp-now').addEventListener('click', () => { playing = false; show(nowMin()); });
  $('sp-play').addEventListener('click', () => {
    if (playing) { playing = false; return; } playing = true; let m = +$('sp-slider').value; const t0 = performance.now(), m0 = m;
    const step = now => { if (!playing) return; m = Math.floor(m0 + (now - t0) / 12000 * 1440) % 1440; show(m); requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
  box.style.transition = 'none'; show(nowMin()); setTimeout(() => box.style.transition = '', 50);
})();
</script>'''
