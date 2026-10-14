// The sky over Sana'a (15.37 N, 44.19 E). Times are ms since epoch; angles in degrees.
const SKY = (() => {
  const R = Math.PI / 180, mod = (x, m) => ((x % m) + m) % m;
  const days = (t) => t / 86400000 + 2440587.5 - 2451545;
  const lst = (t) => mod(280.46061837 + 360.98564736629 * days(t) + 44.19, 360);
  function altAz(ra, dec, t) {
    const H = mod(lst(t) - ra, 360) * R, la = 15.37 * R, de = dec * R;
    const alt = Math.asin(Math.sin(la) * Math.sin(de) + Math.cos(la) * Math.cos(de) * Math.cos(H));
    const az = Math.atan2(-Math.sin(H), Math.tan(de) * Math.cos(la) - Math.sin(la) * Math.cos(H));
    return [alt / R, mod(az / R, 360)];
  }
  function sunRaDec(t) {
    const n = days(t), L = mod(280.46 + 0.9856474 * n, 360), g = mod(357.528 + 0.9856003 * n, 360) * R;
    const lam = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * R, e = (23.439 - 4e-7 * n) * R;
    return [mod(Math.atan2(Math.cos(e) * Math.sin(lam), Math.cos(lam)) / R, 360), Math.asin(Math.sin(e) * Math.sin(lam)) / R];
  }
  const SUHAIL = [95.988, -52.696];
  const sun = (t) => altAz(...sunRaDec(t), t);
  const suhail = (t) => altAz(...SUHAIL, t);
  // next time f(t)[0] crosses h going up (rise) or down (set), within 36 h
  function next(f, t, want, h) {
    const step = 4 * 60000; let a0 = f(t)[0] - h;
    for (let u = t + step; u < t + 36 * 3600000; u += step) {
      const a = f(u)[0] - h;
      if ((want === "rise" && a0 <= 0 && a > 0) || (want === "set" && a0 > 0 && a <= 0)) return u - step + (step * a0) / (a0 - a);
      a0 = a;
    }
    return null;
  }
  function peak(f, t) { let best = -99, at = t; for (let u = t; u < t + 86400000; u += 5 * 60000) { const a = f(u)[0]; if (a > best) { best = a; at = u; } } return [best, at]; }
  const clock = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Aden", hour: "2-digit", minute: "2-digit" });
  const at = (t) => clock.format(new Date(t));
  const STARS = [
    ["Sirius", 101.287, -16.716, -1.46], ["Arcturus", 213.915, 19.182, -0.05], ["Vega", 279.234, 38.784, 0.03],
    ["Rigil Kentaurus", 219.902, -60.834, -0.27], ["Capella", 79.172, 45.998, 0.08], ["Rigel", 78.634, -8.202, 0.13],
    ["Procyon", 114.825, 5.225, 0.34], ["Achernar", 24.429, -57.237, 0.46], ["Betelgeuse", 88.793, 7.407, 0.5],
    ["Hadar", 210.956, -60.373, 0.61], ["Altair", 297.696, 8.868, 0.77], ["Acrux", 186.65, -63.099, 0.77],
    ["Aldebaran", 68.98, 16.509, 0.85], ["Antares", 247.352, -26.432, 0.96], ["Spica", 201.298, -11.161, 0.97],
    ["Pollux", 116.329, 28.026, 1.14], ["Fomalhaut", 344.413, -29.622, 1.16], ["Deneb", 310.358, 45.28, 1.25],
    ["Mimosa", 191.93, -59.689, 1.25], ["Regulus", 152.093, 11.967, 1.35], ["Castor", 113.65, 31.888, 1.58],
    ["Shaula", 263.402, -37.104, 1.62], ["Gacrux", 187.791, -57.113, 1.63], ["Bellatrix", 81.283, 6.35, 1.64],
    ["Alnilam", 84.053, -1.202, 1.69], ["Alnitak", 85.19, -1.943, 1.77], ["Mintaka", 83.002, -0.299, 2.23],
    ["Saiph", 86.939, -9.67, 2.06], ["Al-Thurayya", 56.75, 24.12, 1.6], ["Miaplacidus", 138.3, -69.717, 1.67],
    ["Avior", 125.628, -59.509, 1.86], ["Alphard", 141.897, -8.659, 1.98], ["Peacock", 306.412, -56.735, 1.94],
  ];
  return { R, mod, lst, altAz, sun, suhail, next, peak, at, STARS, SUHAIL };
})();
