// The sky over Sana'a: where the sun, the moon, Suhail and the bright stars stand at a given moment.
// Low-precision series (sun ~0.01°, moon ~0.3°), ported from the brand's sunmoon.js. Angles in degrees.

export const SANAA = { lat: 15.37, lon: 44.19 };
export const SUHAIL = { ra: 95.988, dec: -52.696 };

const R = Math.PI / 180;
const mod = (x: number, m: number) => ((x % m) + m) % m;
const days = (d: Date) => d.getTime() / 86400000 + 2440587.5 - 2451545.0; // since J2000

/** Altitude and azimuth (from north, clockwise) of a body at (ra, dec), seen from Sana'a. */
export function altAz(ra: number, dec: number, d: Date): [number, number] {
  const H = mod(280.46061837 + 360.98564736629 * days(d) + SANAA.lon - ra, 360) * R;
  const la = SANAA.lat * R, de = dec * R;
  const alt = Math.asin(Math.sin(la) * Math.sin(de) + Math.cos(la) * Math.cos(de) * Math.cos(H));
  const az = Math.atan2(-Math.sin(H), Math.tan(de) * Math.cos(la) - Math.sin(la) * Math.cos(H));
  return [alt / R, mod(az / R, 360)];
}

function sunEclLon(d: Date) {
  const n = days(d), L = mod(280.46 + 0.9856474 * n, 360), g = mod(357.528 + 0.9856003 * n, 360) * R;
  return mod(L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g), 360);
}

function eclToEq(lam: number, beta: number, eps = 23.439): [number, number] {
  const l = lam * R, b = beta * R, e = eps * R;
  const ra = mod(Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l)) / R, 360);
  const dec = Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l)) / R;
  return [ra, dec];
}

export function sunRaDec(d: Date): [number, number] {
  return eclToEq(sunEclLon(d), 0, 23.439 - 4e-7 * days(d));
}

function moonEcl(d: Date): [number, number] {
  const T = days(d) / 36525, s = (x: number) => Math.sin(x * R);
  const lam = mod(218.32 + 481267.881 * T
    + 6.29 * s(135.0 + 477198.87 * T) - 1.27 * s(259.3 - 413335.36 * T)
    + 0.66 * s(235.7 + 890534.22 * T) + 0.21 * s(269.9 + 954397.74 * T)
    - 0.19 * s(357.5 + 35999.05 * T) - 0.11 * s(186.5 + 966404.03 * T), 360);
  const beta = 5.13 * s(93.3 + 483202.02 * T) + 0.28 * s(228.2 + 960400.89 * T)
    - 0.28 * s(318.3 + 6003.15 * T) - 0.17 * s(217.6 - 407332.21 * T);
  return [lam, beta];
}

export function moonRaDec(d: Date): [number, number] {
  return eclToEq(...moonEcl(d));
}

/** How much of the moon is lit (0 to 1), and whether it is waxing. */
export function moonPhase(d: Date) {
  const [lm, bm] = moonEcl(d), ls = sunEclLon(d);
  const k = (1 - Math.cos(bm * R) * Math.cos((lm - ls) * R)) / 2;
  return { k, waxing: mod(lm - ls, 360) < 180 };
}

export type Body = "sun" | "moon" | "suhail";
// Altitude at which each body's upper edge touches the horizon, refraction included.
const HORIZON: Record<Body, number> = { sun: -0.833, moon: 0.125, suhail: -0.57 };

export function bodyAltAz(b: Body, d: Date): [number, number] {
  if (b === "sun") return altAz(...sunRaDec(d), d);
  if (b === "moon") return altAz(...moonRaDec(d), d);
  return altAz(SUHAIL.ra, SUHAIL.dec, d);
}

export const isUp = (b: Body, d: Date) => bodyAltAz(b, d)[0] > HORIZON[b];

/** The next rise or set of a body within 36 hours of d (null if none). */
export function nextCrossing(b: Body, d: Date, want: "rise" | "set"): Date | null {
  const step = 4 * 60000, h = HORIZON[b];
  let t0 = d.getTime(), a0 = bodyAltAz(b, d)[0] - h;
  for (let t = t0 + step; t <= t0 + 36 * 3600000; t += step) {
    const a = bodyAltAz(b, new Date(t))[0] - h;
    if ((want === "rise" && a0 <= 0 && a > 0) || (want === "set" && a0 > 0 && a <= 0)) {
      return new Date(t - step + (step * a0) / (a0 - a));
    }
    a0 = a;
  }
  return null;
}

/** The highest point a body reaches in the next day, with its time. */
export function culmination(b: Body, d: Date): [number, Date] {
  let best = -90, at = d;
  for (let t = d.getTime(); t <= d.getTime() + 24 * 3600000; t += 5 * 60000) {
    const a = bodyAltAz(b, new Date(t))[0];
    if (a > best) { best = a; at = new Date(t); }
  }
  return [best, at];
}

// The bright stars, so the dome looks like a sky: [name, ra, dec, magnitude]
export const STARS: [string, number, number, number][] = [
  ["Sirius", 101.287, -16.716, -1.46], ["Arcturus", 213.915, 19.182, -0.05], ["Vega", 279.234, 38.784, 0.03],
  ["Rigil Kentaurus", 219.902, -60.834, -0.27], ["Capella", 79.172, 45.998, 0.08], ["Rigel", 78.634, -8.202, 0.13],
  ["Procyon", 114.825, 5.225, 0.34], ["Achernar", 24.429, -57.237, 0.46], ["Betelgeuse", 88.793, 7.407, 0.5],
  ["Hadar", 210.956, -60.373, 0.61], ["Altair", 297.696, 8.868, 0.77], ["Acrux", 186.65, -63.099, 0.77],
  ["Aldebaran", 68.98, 16.509, 0.85], ["Antares", 247.352, -26.432, 0.96], ["Spica", 201.298, -11.161, 0.97],
  ["Pollux", 116.329, 28.026, 1.14], ["Fomalhaut", 344.413, -29.622, 1.16], ["Deneb", 310.358, 45.28, 1.25],
  ["Mimosa", 191.93, -59.689, 1.25], ["Regulus", 152.093, 11.967, 1.35], ["Castor", 113.65, 31.888, 1.58],
  ["Shaula", 263.402, -37.104, 1.62], ["Gacrux", 187.791, -57.113, 1.63], ["Bellatrix", 81.283, 6.35, 1.64],
  ["Alnilam", 84.053, -1.202, 1.69], ["Alnitak", 85.19, -1.943, 1.77], ["Mintaka", 83.002, -0.299, 2.23],
  ["Saiph", 86.939, -9.67, 2.06], ["Polaris", 37.95, 89.264, 1.98], ["Al-Thurayya", 56.75, 24.12, 1.6],
];
