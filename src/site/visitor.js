/* The visitor: what the page can know without asking anything. Their time zone gives a rough place (no
   location prompt), and from that their sky, their sun and moon, and whether Suhail (Canopus) rises for them.
   Preview overrides, so a draft can be judged from anywhere: ?tz=Europe/London  ?back=3 (days since a last visit)
   ?first (a first visit)  ?wx=rain|clear|cloud|storm|snow|fog (weather). Angles in degrees, times in ms. */
const VIS = (() => {
  const Qs = new URLSearchParams(location.search);
  const R = Math.PI / 180, mod = (x, m) => ((x % m) + m) % m;
  const real = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  let tz = Qs.get("tz") || real;
  try { new Intl.DateTimeFormat("en", { timeZone: tz }); } catch { tz = real; }

  /* rough places for time zones: [lat, lon, label]. A label replaces the zone's own city name where the zone
     covers a whole country (India, China) or where a nicer name fits (Aden → Sana'a). */
  const PLACES = {
    "Europe/London": [51.5, -0.13], "Europe/Dublin": [53.35, -6.26], "Europe/Lisbon": [38.72, -9.14], "Europe/Madrid": [40.42, -3.7],
    "Europe/Paris": [48.86, 2.35], "Europe/Brussels": [50.85, 4.35], "Europe/Amsterdam": [52.37, 4.9], "Europe/Berlin": [52.52, 13.4],
    "Europe/Zurich": [47.37, 8.54], "Europe/Rome": [41.9, 12.5], "Europe/Vienna": [48.21, 16.37], "Europe/Prague": [50.08, 14.44],
    "Europe/Warsaw": [52.23, 21.01], "Europe/Stockholm": [59.33, 18.07], "Europe/Oslo": [59.91, 10.75], "Europe/Copenhagen": [55.68, 12.57],
    "Europe/Helsinki": [60.17, 24.94], "Europe/Athens": [37.98, 23.73], "Europe/Istanbul": [41.01, 28.98], "Europe/Moscow": [55.76, 37.62],
    "Europe/Kyiv": [50.45, 30.52], "Europe/Kiev": [50.45, 30.52, "Kyiv"], "Europe/Bucharest": [44.43, 26.1], "Europe/Budapest": [47.5, 19.04],
    "Europe/Belgrade": [44.79, 20.45], "Europe/Sofia": [42.7, 23.32], "Atlantic/Reykjavik": [64.15, -21.94],
    "Asia/Aden": [15.37, 44.19, "Sana'a"], "Asia/Riyadh": [24.71, 46.68], "Asia/Dubai": [25.2, 55.27], "Asia/Qatar": [25.29, 51.53, "Doha"],
    "Asia/Bahrain": [26.23, 50.59, "Manama"], "Asia/Kuwait": [29.38, 47.99], "Asia/Muscat": [23.59, 58.41], "Asia/Baghdad": [33.31, 44.36],
    "Asia/Tehran": [35.69, 51.39], "Asia/Amman": [31.95, 35.93], "Asia/Beirut": [33.89, 35.5], "Asia/Damascus": [33.51, 36.29],
    "Asia/Jerusalem": [31.77, 35.21], "Asia/Gaza": [31.5, 34.47], "Asia/Hebron": [31.53, 35.1], "Asia/Karachi": [24.86, 67.01],
    "Asia/Kolkata": [21, 78, "India"], "Asia/Calcutta": [21, 78, "India"], "Asia/Dhaka": [23.81, 90.41], "Asia/Kathmandu": [27.72, 85.32],
    "Asia/Colombo": [6.93, 79.86], "Asia/Bangkok": [13.76, 100.5], "Asia/Jakarta": [-6.21, 106.85], "Asia/Singapore": [1.35, 103.82],
    "Asia/Kuala_Lumpur": [3.14, 101.69], "Asia/Manila": [14.6, 120.98], "Asia/Ho_Chi_Minh": [10.82, 106.63], "Asia/Shanghai": [35, 113, "China"],
    "Asia/Hong_Kong": [22.32, 114.17], "Asia/Taipei": [25.03, 121.57], "Asia/Seoul": [37.57, 126.98], "Asia/Tokyo": [35.68, 139.69],
    "Asia/Tashkent": [41.3, 69.24], "Asia/Almaty": [43.24, 76.89], "Asia/Kabul": [34.56, 69.21], "Asia/Baku": [40.41, 49.87],
    "Asia/Tbilisi": [41.72, 44.79], "Asia/Yerevan": [40.18, 44.51],
    "Africa/Cairo": [30.04, 31.24], "Africa/Khartoum": [15.5, 32.56], "Africa/Addis_Ababa": [9.03, 38.74], "Africa/Nairobi": [-1.29, 36.82],
    "Africa/Lagos": [6.52, 3.38], "Africa/Accra": [5.6, -0.19], "Africa/Casablanca": [33.57, -7.59], "Africa/Algiers": [36.75, 3.06],
    "Africa/Tunis": [36.81, 10.18], "Africa/Tripoli": [32.89, 13.19], "Africa/Johannesburg": [-26.2, 28.05], "Africa/Djibouti": [11.59, 43.15],
    "Africa/Mogadishu": [2.05, 45.32], "Africa/Dar_es_Salaam": [-6.79, 39.21], "Africa/Kampala": [0.35, 32.58], "Africa/Kinshasa": [-4.44, 15.27],
    "Africa/Dakar": [14.72, -17.47],
    "America/New_York": [40.71, -74.01], "America/Toronto": [43.65, -79.38], "America/Chicago": [41.88, -87.63], "America/Denver": [39.74, -104.99],
    "America/Phoenix": [33.45, -112.07], "America/Los_Angeles": [34.05, -118.24], "America/Vancouver": [49.28, -123.12], "America/Anchorage": [61.22, -149.9],
    "America/Mexico_City": [19.43, -99.13], "America/Bogota": [4.71, -74.07], "America/Lima": [-12.05, -77.04], "America/Santiago": [-33.45, -70.67],
    "America/Argentina/Buenos_Aires": [-34.6, -58.38], "America/Buenos_Aires": [-34.6, -58.38], "America/Sao_Paulo": [-23.55, -46.63],
    "America/Caracas": [10.48, -66.9], "America/Halifax": [44.65, -63.57], "America/Detroit": [42.33, -83.05], "America/Edmonton": [53.55, -113.49],
    "America/Winnipeg": [49.9, -97.14], "America/Havana": [23.11, -82.37], "America/Montevideo": [-34.9, -56.16], "Pacific/Honolulu": [21.31, -157.86],
    "Australia/Sydney": [-33.87, 151.21], "Australia/Melbourne": [-37.81, 144.96], "Australia/Brisbane": [-27.47, 153.03], "Australia/Perth": [-31.95, 115.86],
    "Australia/Adelaide": [-34.93, 138.6], "Australia/Hobart": [-42.88, 147.33], "Australia/Darwin": [-12.46, 130.84], "Australia/Canberra": [-35.28, 149.13],
    "Pacific/Auckland": [-36.85, 174.76], "Pacific/Fiji": [-18.14, 178.44],
  };
  const parts = tz.split("/"), region = parts[0];
  const offsetMin = (t = Date.now()) => {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" }).formatToParts(new Date(t)).map((x) => [x.type, x.value]));
    return Math.round((Date.UTC(+p.year, p.month - 1, +p.day, +p.hour % 24, +p.minute) - Math.floor(t / 60000) * 60000) / 60000);
  };
  const known = PLACES[tz];
  const fallbackLat = { Europe: 50, America: 35, Africa: 5, Asia: 30, Australia: -30, Pacific: -15, Atlantic: 40, Indian: -10, Antarctica: -75 }[region] ?? 30;
  // South America shares "America/": Argentina, Chile, Uruguay and Brazil sit south of the equator
  const south = region === "America" && (tz.includes("Argentina") || ["Santiago", "Punta_Arenas"].includes(parts[1]) || (offsetMin() >= -200 && !tz.includes("Nuuk") && !tz.includes("Godthab") && !tz.includes("Miquelon")));

  const lat = known ? known[0] : south ? (tz.includes("Argentina") ? -33 : -15) : fallbackLat, lon = known ? known[1] : mod(offsetMin() / 4 + 180, 360) - 180;
  const city = known && known[2] ? known[2] : parts.length > 1 && region !== "Etc" ? parts[parts.length - 1].replace(/_/g, " ") : null;

  /* clocks in the visitor's zone */
  const fmt = (o) => new Intl.DateTimeFormat(undefined, { timeZone: tz, ...o });
  const clock = fmt({ hour: "numeric", minute: "2-digit" }), dayName = fmt({ weekday: "long" });
  const time = (t) => clock.format(new Date(t));
  const hm = (t) => { const p = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(t)).split(":").map(Number); return p[0] * 60 + p[1]; };
  const hour = (t = Date.now()) => Math.floor(hm(t) / 60);
  const greet = (h = hour()) => (h < 5 ? "Hello, night owl" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");

  /* the sky over the visitor */
  const days = (t) => t / 86400000 + 2440587.5 - 2451545;
  const lst = (t) => mod(280.46061837 + 360.98564736629 * days(t) + lon, 360);
  function altAz(ra, dec, t) {
    const H = mod(lst(t) - ra, 360) * R, la = lat * R, de = dec * R;
    const alt = Math.asin(Math.sin(la) * Math.sin(de) + Math.cos(la) * Math.cos(de) * Math.cos(H));
    const az = Math.atan2(-Math.sin(H), Math.tan(de) * Math.cos(la) - Math.sin(la) * Math.cos(H));
    return [alt / R, mod(az / R, 360)];
  }
  const eclToEq = (lam, beta, n) => {
    const e = (23.439 - 4e-7 * n) * R, l = lam * R, b = beta * R;
    const ra = Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l)), dec = Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
    return [mod(ra / R, 360), dec / R];
  };
  function sunRaDec(t) { const n = days(t), L = mod(280.46 + 0.9856474 * n, 360), g = mod(357.528 + 0.9856003 * n, 360) * R; return eclToEq(L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g), 0, n); }
  function moonRaDec(t) {
    const n = days(t), L = 218.316 + 13.176396 * n, M = (134.963 + 13.064993 * n) * R, F = (93.272 + 13.22935 * n) * R;
    return eclToEq(mod(L + 6.289 * Math.sin(M), 360), 5.128 * Math.sin(F), n);
  }
  const sun = (t) => altAz(...sunRaDec(t), t);
  const SUHAIL = [95.988, -52.696];
  const suhail = (t) => altAz(...SUHAIL, t);
  function moon(t) {
    const age = mod((t - Date.UTC(2000, 0, 6, 18, 14)) / 86400000, 29.530588), illum = (1 - Math.cos((2 * Math.PI * age) / 29.530588)) / 2;
    const names = ["new moon", "waxing crescent", "first quarter", "waxing gibbous", "full moon", "waning gibbous", "last quarter", "waning crescent"];
    const [ra, dec] = moonRaDec(t), [alt, az] = altAz(ra, dec, t);
    return { ra, dec, alt, az, age, illum, waxing: age < 14.765, name: names[Math.floor(((age + 1.845) / 29.530588) * 8) % 8] };
  }
  // next time f(t)[0] crosses h going up (rise) or down (set), within `hours`
  function next(f, t, want, h = 0, hours = 36) {
    const step = 4 * 60000; let a0 = f(t)[0] - h;
    for (let u = t + step; u < t + hours * 3600000; u += step) {
      const a = f(u)[0] - h;
      if ((want === "rise" && a0 <= 0 && a > 0) || (want === "set" && a0 > 0 && a <= 0)) return u - step + (step * a0) / (a0 - a);
      a0 = a;
    }
    return null;
  }
  const compass = (az) => ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"][Math.round(az / 45) % 8];
  const latText = `${Math.abs(Math.round(lat))}°${lat >= 0 ? "N" : "S"}`;

  /* Suhail for this visitor: up now, rising later, always up, or never seen this far north */
  function suhailNews(t = Date.now()) {
    const [alt, az] = suhail(t), maxAlt = 90 - Math.abs(lat - SUHAIL[1]), dark = sun(t)[0] < -6;
    if (maxAlt <= 0) return { kind: "never", maxAlt, need: Math.floor(90 + SUHAIL[1]) };
    if (lat < -(90 + SUHAIL[1])) return { kind: "always", alt, az, dir: compass(az), dark };
    if (alt > 0) return { kind: "up", alt, az, dir: compass(az), dark, set: next(suhail, t, "set") };
    const rise = next(suhail, t, "rise");
    return { kind: "later", rise, riseDark: rise ? sun(rise)[0] < -6 : false, maxAlt };
  }

  /* the brightest stars, and the lines of a few figures everyone knows. [name, ra, dec, mag] */
  const STARS = [
    ["Sirius", 101.287, -16.716, -1.46], ["Canopus", 95.988, -52.696, -0.74], ["Arcturus", 213.915, 19.182, -0.05], ["Vega", 279.234, 38.784, 0.03],
    ["Rigil Kentaurus", 219.902, -60.834, -0.27], ["Capella", 79.172, 45.998, 0.08], ["Rigel", 78.634, -8.202, 0.13], ["Procyon", 114.825, 5.225, 0.34],
    ["Achernar", 24.429, -57.237, 0.46], ["Betelgeuse", 88.793, 7.407, 0.5], ["Hadar", 210.956, -60.373, 0.61], ["Altair", 297.696, 8.868, 0.77],
    ["Acrux", 186.65, -63.099, 0.77], ["Aldebaran", 68.98, 16.509, 0.85], ["Antares", 247.352, -26.432, 0.96], ["Spica", 201.298, -11.161, 0.97],
    ["Pollux", 116.329, 28.026, 1.14], ["Fomalhaut", 344.413, -29.622, 1.16], ["Deneb", 310.358, 45.28, 1.25], ["Mimosa", 191.93, -59.689, 1.25],
    ["Regulus", 152.093, 11.967, 1.35], ["Adhara", 104.656, -28.972, 1.5], ["Castor", 113.65, 31.888, 1.58], ["Shaula", 263.402, -37.104, 1.62],
    ["Gacrux", 187.791, -57.113, 1.63], ["Bellatrix", 81.283, 6.35, 1.64], ["Elnath", 81.573, 28.608, 1.65], ["Miaplacidus", 138.3, -69.717, 1.67],
    ["Alnilam", 84.053, -1.202, 1.69], ["Alnitak", 85.19, -1.943, 1.77], ["Alioth", 193.507, 55.96, 1.77], ["Dubhe", 165.932, 61.751, 1.79],
    ["Wezen", 107.098, -26.393, 1.83], ["Alkaid", 206.885, 49.313, 1.86], ["Sargas", 264.33, -42.998, 1.86], ["Avior", 125.628, -59.509, 1.86],
    ["Menkalinan", 89.882, 44.947, 1.9], ["Peacock", 306.412, -56.735, 1.94], ["Polaris", 37.955, 89.264, 1.98], ["Mirzam", 95.675, -17.956, 1.98],
    ["Alphard", 141.897, -8.659, 1.98], ["Algieba", 154.993, 19.842, 2.0], ["Hamal", 31.793, 23.462, 2.0], ["Saiph", 86.939, -9.67, 2.06],
    ["Nunki", 283.816, -26.297, 2.05], ["Mizar", 200.981, 54.925, 2.04], ["Mirach", 17.433, 35.621, 2.07], ["Alpheratz", 2.097, 29.09, 2.07],
    ["Kochab", 222.676, 74.156, 2.08], ["Rasalhague", 263.734, 12.56, 2.08], ["Denebola", 177.265, 14.572, 2.11], ["Schedar", 10.127, 56.537, 2.24],
    ["Mintaka", 83.002, -0.299, 2.23], ["Caph", 2.295, 59.15, 2.28], ["Sadr", 305.557, 40.257, 2.23], ["Merak", 165.46, 56.383, 2.37],
    ["Gamma Cas", 14.177, 60.717, 2.15], ["Ruchbah", 21.454, 60.235, 2.68], ["Segin", 28.599, 63.67, 3.37], ["Phecda", 178.458, 53.695, 2.44],
    ["Megrez", 183.857, 57.033, 3.31], ["Dschubba", 240.083, -22.622, 2.29], ["Acrab", 241.359, -19.806, 2.62], ["Pi Sco", 239.713, -26.114, 2.89],
    ["Tau Sco", 248.971, -28.216, 2.82], ["Eps Sco", 252.541, -34.293, 2.29], ["Mu Sco", 252.968, -38.048, 3.0], ["Zeta Sco", 254.655, -42.362, 3.62],
    ["Eta Sco", 258.038, -43.239, 3.33], ["Iota Sco", 266.896, -40.127, 3.0], ["Kappa Sco", 265.622, -39.03, 2.41], ["Delta Cru", 183.786, -58.749, 2.79],
    ["Gienah Cyg", 311.553, 33.97, 2.48], ["Delta Cyg", 296.244, 45.131, 2.87], ["Albireo", 292.68, 27.96, 3.08], ["Eta Leo", 151.833, 16.763, 3.5],
    ["Adhafera", 154.173, 23.417, 3.43], ["Ras Elased", 146.463, 23.774, 2.98], ["Rasalas", 148.191, 26.007, 3.88], ["Zosma", 168.527, 20.524, 2.56],
    ["Chertan", 168.56, 15.43, 3.33], ["Meissa", 83.784, 9.934, 3.33], ["Aludra", 111.024, -29.303, 2.45], ["Aspidiske", 139.273, -59.275, 2.21],
    ["Al-Thurayya", 56.75, 24.12, 1.6], ["Sheliak", 282.52, 33.363, 3.52], ["Sulafat", 284.736, 32.69, 3.25],
  ];
  const FIGURES = {
    Orion: [["Betelgeuse", "Bellatrix"], ["Betelgeuse", "Meissa"], ["Meissa", "Bellatrix"], ["Betelgeuse", "Alnitak"], ["Bellatrix", "Mintaka"], ["Alnitak", "Alnilam"], ["Alnilam", "Mintaka"], ["Alnitak", "Saiph"], ["Mintaka", "Rigel"]],
    "The Plough": [["Alkaid", "Mizar"], ["Mizar", "Alioth"], ["Alioth", "Megrez"], ["Megrez", "Dubhe"], ["Dubhe", "Merak"], ["Merak", "Phecda"], ["Phecda", "Megrez"]],
    Cassiopeia: [["Caph", "Schedar"], ["Schedar", "Gamma Cas"], ["Gamma Cas", "Ruchbah"], ["Ruchbah", "Segin"]],
    "Southern Cross": [["Acrux", "Gacrux"], ["Mimosa", "Delta Cru"]],
    Scorpius: [["Acrab", "Dschubba"], ["Dschubba", "Pi Sco"], ["Dschubba", "Antares"], ["Antares", "Tau Sco"], ["Tau Sco", "Eps Sco"], ["Eps Sco", "Mu Sco"], ["Mu Sco", "Zeta Sco"], ["Zeta Sco", "Eta Sco"], ["Eta Sco", "Sargas"], ["Sargas", "Iota Sco"], ["Iota Sco", "Kappa Sco"], ["Kappa Sco", "Shaula"]],
    Cygnus: [["Deneb", "Sadr"], ["Sadr", "Albireo"], ["Gienah Cyg", "Sadr"], ["Sadr", "Delta Cyg"]],
    Leo: [["Regulus", "Eta Leo"], ["Eta Leo", "Algieba"], ["Algieba", "Adhafera"], ["Adhafera", "Rasalas"], ["Rasalas", "Ras Elased"], ["Algieba", "Zosma"], ["Zosma", "Denebola"], ["Denebola", "Chertan"], ["Chertan", "Regulus"]],
    "Great Dog": [["Mirzam", "Sirius"], ["Sirius", "Wezen"], ["Wezen", "Adhara"], ["Wezen", "Aludra"]],
    Lyra: [["Vega", "Sheliak"], ["Sheliak", "Sulafat"], ["Sulafat", "Vega"]],
    "Summer Triangle": [["Vega", "Deneb"], ["Deneb", "Altair"], ["Altair", "Vega"]],
  };
  const STAR = Object.fromEntries(STARS.map((s) => [s[0], s]));

  /* visits, remembered in this browser only */
  let visits = { n: 1, last: null, days: null, first: true };
  try {
    const was = JSON.parse(localStorage.getItem("ao-visit") || "null");
    if (was && was.last) visits = { n: (was.n || 1) + 1, last: was.last, days: (Date.now() - was.last) / 86400000, first: false };
    localStorage.setItem("ao-visit", JSON.stringify({ n: visits.n, last: Date.now() }));
  } catch {}
  if (Qs.has("first")) visits = { n: 1, last: null, days: null, first: true };
  if (Qs.has("back")) { const d = +Qs.get("back") || 3; visits = { n: 4, last: Date.now() - d * 86400000, days: d, first: false }; }

  /* weather where they are. Live: Open-Meteo, no key. The preview page blocks outside data, so this
     resolves null there and a take falls back to its own preview. ?wx= forces a kind. */
  const WX = { clear: [0, 1], cloud: [2, 3, 45, 48], fog: [45, 48], rain: [51, 53, 55, 61, 63, 65, 80, 81, 82, 56, 57, 66, 67], snow: [71, 73, 75, 77, 85, 86], storm: [95, 96, 99] };
  const kindOf = (code) => (code === 45 || code === 48 ? "fog" : Object.keys(WX).find((k) => WX[k].includes(code)) || "cloud");
  function weather() {
    if (Qs.get("wx")) return Promise.resolve({ kind: Qs.get("wx"), temp: null, forced: true });
    const ctl = new AbortController(); setTimeout(() => ctl.abort(), 2500);
    return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m,is_day,cloud_cover,wind_speed_10m`, { signal: ctl.signal })
      .then((r) => r.json()).then((j) => ({ kind: kindOf(j.current.weather_code), temp: Math.round(j.current.temperature_2m), wind: j.current.wind_speed_10m, clouds: j.current.cloud_cover }))
      .catch(() => null);
  }

  return { tz, realTz: real, city, lat, lon, latText, guessed: !known, time, hm, hour, greet, dayName: () => dayName.format(new Date()),
    lst, altAz, sun, moon, suhail, next, compass, suhailNews, STARS, STAR, FIGURES, SUHAIL, visits, weather, offsetMin };
})();
