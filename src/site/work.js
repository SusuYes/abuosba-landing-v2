/* WORK: the work page as a module. window.WORK = { open(opts), close(), onBack, go(i), openCase(id), closeCase() } */
(() => {
  const W = document.getElementById("work");
  if (!W) return;
  const q = (s, r = W) => r.querySelector(s), qq = (s, r = W) => [...r.querySelectorAll(s)];
  const ids = ORDER.filter((k) => CASES[k]), N = ids.length, pad = (n) => String(n).padStart(2, "0");
  const AUTO_MS = 9000;
  const RTL = () => document.documentElement.dir === "rtl", fwd = (k) => (RTL() ? -k : k);
  const COL = { brass: "#a8792c", gold: "#f0b93a", ink: "#1c1b2e", rose: "#c07a66", sage: "#7c8d6a", slate: "#5f6d88" };
  const TICK = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.3l2.3 2.3 4.7-5"/></svg>';
  const MONTH = (() => {
    const now = new Date(), parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Aden", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(now);
    const g = (t) => +parts.find((p) => p.type === t).value, y = g("year"), m = g("month"), d = g("day");
    const name = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 1)));
    const off = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7, days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return { name, y, off, days, today: d, weeks: Math.ceil((off + days) / 7) };
  })();
  const APP = { arrivals: ["Arrivals", "contact log"], hub: ["Engagement data", "one model"], events: ["Events", MONTH.name + " " + MONTH.y] };

  function Timers() {
    const s = new Set();
    return {
      at(ms, fn) { const id = setTimeout(() => { s.delete(id); fn(); }, ms); s.add(id); return id; },
      every(ms, fn) { const id = setInterval(fn, ms); s.add(id); return id; },
      clear() { s.forEach((id) => { clearTimeout(id); clearInterval(id); }); s.clear(); },
    };
  }

  /* ---------- 01 · arrival outreach: staff reach every new student and log when each one lands ---------- */
  function Arrivals(root) {
    const R = rng(11), PR = ["Medicine", "Engineering", "Pharmacy", "Business", "Law", "Sciences", "Dentistry", "Computing", "Architecture", "Nursing"];
    const FL = [["Week 1", "dates in", "Confirmed"], ["Week 2", "dates in", "Confirmed"], ["Week 3", "dates in", "Confirmed"], ["Week 4", "filling", "Filling"], ["Week 5", "open", "Open"]];
    const L = "ABDEFHJKLMNRSTWY";
    const tm = Timers();
    let n, qn, fill, rooms, ul, serial;
    function row(state) {
      const fl = R() < 0.85 ? Math.floor(R() * 3) : 3, qf = R() < 0.16, id = "24-" + String(1000 + Math.floor(R() * 8999));
      const li = document.createElement("li");
      li.dataset.s = state; li.dataset.fl = fl; if (qf) li.dataset.q = 1;
      const LL = document.documentElement.lang === "ar" ? "أبجدهوزحطيكلمنسعفصقرشت" : L; // initials in the page's own script
      li.innerHTML = `<span class="wm-av">${LL[Math.floor(R() * LL.length)]}${LL[Math.floor(R() * LL.length)]}</span>
        <span class="wm-who"><b>${id}</b>${qf ? '<span class="wm-qf">Q · 14 d</span>' : ""}<small>${PR[Math.floor(R() * PR.length)]} · ${FL[fl][0]}</small></span>
        <span class="wm-chip"><i></i>${TICK}<em style="font-style:normal">${state === "desk" ? "Calling" : "To call"}</em></span>`;
      return li;
    }
    function build() {
      n = 146; qn = 7; serial = 0; fill = [0.94, 0.78, 0.52, 0.12, 0]; rooms = 31;
      root.className = "wm wm-arr";
      root.innerHTML = `
        <div class="wm-top">
          <div class="wm-st"><span class="wm-k">Students reached</span><b class="wm-big" data-n>${n}</b><span class="wm-meter"><i style="--p:41%"></i></span><span class="wm-sub">every new student, by phone or email</span></div>
          <div class="wm-st"><span class="wm-k">Calls under way</span><b data-desk>1</b><span class="wm-sub">40+ staff logging contacts</span></div>
          <div class="wm-st"><span class="wm-k">Quarantine places</span><b data-q>${qn}</b><span class="wm-sub">planned from confirmed dates</span></div>
        </div>
        <div class="wm-body">
          <section class="wm-pan wm-queue"><h4 class="wm-h"><span>Contact log</span><span>call · confirm · log</span></h4><ul></ul></section>
          <section class="wm-pan wm-fl"><h4 class="wm-h"><span>Arrivals by week</span><span>dates confirmed</span></h4><ul>${FL.map((f, i) => `<li><span><b>${f[0]}</b><small>${f[1]}</small></span><span class="wm-bar"><i style="--p:${fill[i] * 100}%"></i></span><em class="${f[2] === "Confirmed" ? "l" : ""}">${f[2]}</em></li>`).join("")}</ul></section>
          <section class="wm-pan wm-rooms"><h4 class="wm-h"><span>Quarantine places</span><span>booked</span></h4><div class="wm-dots">${Array.from({ length: 48 }, (_, i) => `<i class="${i < rooms ? "on" : ""}"></i>`).join("")}</div></section>
        </div>`;
      ul = q(".wm-queue ul", root);
      ul.append(row("desk")); for (let i = 0; i < 8; i++) ul.append(row("landed"));
    }
    function setChip(li, s) { li.dataset.s = s; q("em", li).textContent = s === "in" ? "Date confirmed" : s === "desk" ? "Calling" : "To call"; }
    function tick() {
      const live = qq("li:not(.gone)", ul), first = live[0]; if (!first) return;
      setChip(first, "in");
      n++; const nb = q("[data-n]", root); nb.textContent = n.toLocaleString("en"); nb.classList.add("bump"); tm.at(500, () => nb.classList.remove("bump"));
      q(".wm-meter i", root).style.setProperty("--p", Math.min(96, 41 + (n - 146) * 0.9) + "%");
      const fi = +first.dataset.fl, bar = qq(".wm-fl .wm-bar", root)[fi];
      fill[fi] = Math.min(1, fill[fi] + 0.035); bar.firstElementChild.style.setProperty("--p", fill[fi] * 100 + "%"); bar.classList.add("hit"); tm.at(700, () => bar.classList.remove("hit"));
      const dots = qq(".wm-dots i", root);
      if (rooms >= dots.length) { dots.forEach((d) => d.classList.remove("on")); rooms = 0; }
      const d = dots[rooms++]; d.classList.add("on", "pop"); tm.at(450, () => d.classList.remove("pop"));
      if (first.dataset.q) { qn++; q("[data-q]", root).textContent = qn; }
      tm.at(750, () => {
        first.classList.add("gone");
        if (live[1]) setChip(live[1], "desk");
        const nr = row("landed"); nr.classList.add("new"); ul.append(nr);
      });
      tm.at(1300, () => first.remove());
    }
    return {
      reset() { tm.clear(); build(); },
      play() { tm.clear(); if (REDUCE) return; tm.at(900, tick); tm.every(1700, tick); },
      stop() { tm.clear(); },
    };
  }

  /* ---------- 02 · engagement data: every source folds into one model; a question gets one answer ---------- */
  function Hub(root) {
    const tm = Timers();
    const TEAMS = [["Outreach", COL.brass, "School visit"], ["Clubs", COL.rose, "Society fair"], ["Volunteers", COL.sage, "Beach clean"], ["Mentoring", COL.slate, "1:1 session"], ["Sport", COL.ink, "5-a-side"], ["Library", COL.gold, "Study skills"], ["Careers", "#8a6d9b", "CV clinic"]];
    const FILES = ["registrations.csv", "attendance (final) v3.xlsx", "check-ins.csv", "student records", "Careers Q3.xlsx", "finance export.xlsx", "orientation.xlsx"];
    const POS = [[3, 14, -6], [27, 4, 4], [55, 13, -3], [79, 6, 5], [83, 52, -4], [52, 66, 3], [18, 62, -5]];
    const ANS = [["Outreach", 92], ["Clubs", 76], ["Mentoring", 61], ["Volunteers", 47], ["Sport", 36], ["Library", 24]];
    const QTEXT = "Which teams reached the most first-years?";
    const qtext = () => { try { return (document.documentElement.lang === "ar" && AR.tr(QTEXT)) || QTEXT; } catch (e) { return QTEXT; } };
    const R = rng(5); let rows = 0;
    function build() {
      rows = 0;
      root.className = "wm wm-hub";
      root.innerHTML = `
        <div class="wm-q"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5l1.3 4.2 4.2 1.3-4.2 1.3L8 12.5 6.7 8.3 2.5 7l4.2-1.3z" fill="#a8792c"/></svg>
          <span class="wm-qt"><span data-typed></span><i class="wm-caret"></i><span class="wm-ph">Ask across every source…</span></span><span class="wm-kbd">Ask ↵</span></div>
        <div class="wm-hbody">
          <section class="wm-pan wm-tbl"><h4 class="wm-h"><span>All sources · one table</span><span data-rows>waiting for sources</span></h4>
            <div class="wm-tr wm-thead"><span>Student</span><span>Team</span><span>Activity</span><span>Date</span></div><div class="wm-tb"></div></section>
          <section class="wm-pan wm-ans"><h4 class="wm-h"><span>Answer</span><span data-src></span></h4>
            <p class="wm-empty">One question, asked of every source at once.</p>
            <div class="wm-think"><i></i><i></i><i></i></div>
            <div class="wm-chart"><h5>First-years reached, by team</h5><div class="wm-hbs">${ANS.map(([t]) => `<div class="wm-hb"><span>${t}</span><span class="wm-bar"><i></i></span></div>`).join("")}</div><p class="wm-said">Outreach reached the most, then Clubs. From 7 sources, one model.</p></div></section>
        </div>
        ${TEAMS.map((t, i) => `<div class="wm-sh" style="--c:${t[1]};--r:${POS[i][2]}deg;left:${POS[i][0]}%;top:${POS[i][1]}%"><span>${FILES[i]}</span></div>`).join("")}`;
    }
    function addRow(t) {
      const tb = q(".wm-tb", root), r = document.createElement("div");
      const day = 1 + Math.floor(R() * 27);
      r.className = "wm-tr fresh";
      r.innerHTML = `<span>S-${1000 + Math.floor(R() * 8999)}</span><span class="wm-tm"><i style="--c:${t[1]}"></i>${t[0]}</span><span>${t[2]}</span><span>${day} ${MONTH.name.slice(0, 3)}</span>`;
      tb.prepend(r); rows++;
      tm.at(900, () => r.classList.remove("fresh"));
      while (tb.children.length > 12) tb.lastElementChild.remove();
      q("[data-rows]", root).textContent = rows + " rows · " + Math.min(7, Math.ceil(rows / 2)) + " sources";
    }
    function run() {
      const sheets = qq(".wm-sh", root), tbl = q(".wm-tbl", root);
      sheets.forEach((s, i) => tm.at(350 + i * 210, () => {
        const tx = tbl.offsetLeft + tbl.offsetWidth / 2 - s.offsetLeft - 46, ty = tbl.offsetTop + 60 - s.offsetTop - 31;
        s.style.transform = `translate(${tx}px, ${ty}px) scale(.3) rotate(0deg)`; s.classList.add("go");
        tm.at(650, () => { addRow(TEAMS[i]); addRow(TEAMS[i]); });
      }));
      const typed = () => q("[data-typed]", root);
      tm.at(2700, () => { q(".wm-ph", root).style.display = "none"; });
      const QT = qtext();
      for (let c = 1; c <= QT.length; c++) tm.at(2700 + c * 36, () => { typed().textContent = QT.slice(0, c); });
      const t1 = 2700 + QT.length * 36 + 250;
      tm.at(t1, () => { q(".wm-kbd", root).classList.add("hit"); q(".wm-ans", root).classList.add("thinking"); q("[data-src]", root).textContent = "7 sources"; });
      tm.at(t1 + 220, () => q(".wm-kbd", root).classList.remove("hit"));
      tm.at(t1 + 750, () => {
        const a = q(".wm-ans", root); a.classList.remove("thinking"); a.classList.add("answered");
        qq(".wm-hb .wm-bar i", root).forEach((b, i) => tm.at(120 + i * 110, () => (b.style.width = ANS[i][1] + "%")));
      });
      tm.at(t1 + 5600, () => root.classList.add("wm-fade"));
      tm.at(t1 + 6200, () => { build(); run(); });
    }
    function still() { // the finished picture, for reduced motion
      build();
      qq(".wm-sh", root).forEach((sh) => sh.remove());
      TEAMS.forEach((t) => { addRow(t); addRow(t); }); qq(".wm-tb .fresh", root).forEach((r) => r.classList.remove("fresh"));
      q(".wm-ph", root).style.display = "none"; q("[data-typed]", root).textContent = qtext(); q("[data-src]", root).textContent = "7 sources";
      q(".wm-ans", root).classList.add("answered"); qq(".wm-hb .wm-bar i", root).forEach((b, i) => (b.style.width = ANS[i][1] + "%"));
    }
    return { reset() { tm.clear(); build(); }, play() { tm.clear(); if (REDUCE) still(); else { build(); run(); } }, stop() { tm.clear(); } };
  }

  /* ---------- 03 · event registry: every event gets an ID, the month fills up, the report writes itself ---------- */
  function Events(root) {
    const tm = Timers();
    const CAT = [["Talks", COL.ink], ["Clubs & arts", COL.rose], ["Sport", COL.sage], ["Careers", COL.brass]];
    const NAMES = [["Research talk", 0], ["Poetry evening", 1], ["Football final", 2], ["Careers fair", 3], ["Alumni panel", 3], ["Film night", 1], ["Chess league", 2], ["Open lecture", 0], ["Robotics club", 1], ["Hackathon", 3], ["Basketball", 2], ["Debate society", 1], ["Guest seminar", 0], ["CV clinic", 3], ["Book club", 1], ["Run club", 2]];
    let counts, wk, ev;
    function plan() {
      const R = rng(MONTH.y * 13 + MONTH.days), out = [], load = {};
      for (let k = 0; k < 32; k++) {
        let d, tries = 0;
        do { d = 1 + Math.floor(R() * MONTH.days); tries++; } while (((load[d] || 0) >= 3 || ((MONTH.off + d - 1) % 7 > 4 && R() < 0.6)) && tries < 30);
        load[d] = (load[d] || 0) + 1;
        const nm = NAMES[Math.floor(R() * NAMES.length)];
        out.push({ d, name: nm[0], c: nm[1], w: 55 + Math.floor(R() * 45) });
      }
      return out;
    }
    function build() {
      counts = [0, 0, 0, 0]; wk = Array(MONTH.weeks).fill(0); ev = 0;
      root.className = "wm wm-ev";
      const cells = [];
      for (let i = 0; i < MONTH.weeks * 7; i++) {
        const d = i - MONTH.off + 1, inm = d >= 1 && d <= MONTH.days;
        cells.push(`<div class="wm-c${inm ? "" : " x"}${d === MONTH.today ? " today" : ""}" ${inm ? `data-d="${d}"` : ""}><small>${inm ? d : ""}</small></div>`);
      }
      root.innerHTML = `
        <section class="wm-pan wm-cal">
          <div class="wm-calh"><b>${MONTH.name} ${MONTH.y}</b><span class="wm-nv">‹ ›</span><span class="wm-added" data-added>Every event starts with an ID</span><span class="wm-new">+ New event</span></div>
          <div class="wm-wd">${["M", "T", "W", "T", "F", "S", "S"].map((x, i) => `<span data-ar="${"نثرخجسح"[i]}">${x}</span>`).join("")}</div>
          <div class="wm-grid">${cells.join("")}</div>
        </section>
        <section class="wm-pan wm-rep">
          <h4 class="wm-h"><span>Report · ${MONTH.name}</span><span>builds itself</span></h4>
          <div class="wm-kpis"><div><span class="wm-k">Events</span><b data-ev>0</b></div><div><span class="wm-k">Latest ID</span><b data-id>S0140</b></div></div>
          <div class="wm-wkb"><span class="wm-k">By week</span><div class="wm-cols" style="--wn:${MONTH.weeks}">${wk.map((_, i) => `<div class="wm-col"><i></i><small>W${i + 1}</small></div>`).join("")}</div></div>
          <div class="wm-type"><span class="wm-k">By type</span><div class="wm-stack">${CAT.map((c) => `<i style="--c:${c[1]}"></i>`).join("")}</div>
            <ul class="wm-leg">${CAT.map((c) => `<li><i style="--c:${c[1]}"></i>${c[0]}</li>`).join("")}</ul></div>
          <button class="wm-exp" type="button" tabindex="-1"><span>Export report</span></button>
        </section>`;
    }
    function add(e) {
      const cell = q(`.wm-c[data-d="${e.d}"]`, root); if (!cell) return;
      const b = document.createElement("i"); b.className = "wm-e"; b.style.cssText = `--c:${CAT[e.c][1]};--w:${e.w}%`; cell.append(b);
      cell.classList.add("flash"); tm.at(260, () => cell.classList.remove("flash"));
      counts[e.c]++; ev++; wk[Math.floor((MONTH.off + e.d - 1) / 7)]++;
      q("[data-ev]", root).textContent = ev; const id = "S" + String(140 + ev).padStart(4, "0"); q("[data-id]", root).textContent = id;
      const mx = Math.max(8, ...wk), top = wk.indexOf(Math.max(...wk));
      qq(".wm-col", root).forEach((c, i) => { c.firstElementChild.style.setProperty("--h", (wk[i] / mx) * 100 + "%"); c.classList.toggle("top", i === top && wk[i] > 0); });
      qq(".wm-stack i", root).forEach((s, i) => s.style.setProperty("--w", (counts[i] / ev) * 100 + "%"));
      const dn = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][(MONTH.off + e.d - 1) % 7];
      q("[data-added]", root).innerHTML = `${id} <em>${e.name}</em> · ${dn} ${e.d}`;
    }
    function run() {
      const list = plan();
      list.forEach((e, i) => tm.at(350 + i * 125, () => add(e)));
      const t1 = 350 + list.length * 125 + 500;
      tm.at(t1, () => q(".wm-exp", root).classList.add("press"));
      tm.at(t1 + 220, () => { const b = q(".wm-exp", root); b.classList.remove("press"); b.classList.add("done"); b.innerHTML = `${TICK}<span>Exported</span><small>${MONTH.name.toLowerCase()}-report.pdf</small>`; });
      tm.at(t1 + 4600, () => root.classList.add("wm-fade"));
      tm.at(t1 + 5200, () => { build(); run(); });
    }
    function still() {
      build(); plan().forEach(add);
      const b = q(".wm-exp", root); b.classList.add("done"); b.innerHTML = `${TICK}<span>Exported</span><small>${MONTH.name.toLowerCase()}-report.pdf</small>`;
    }
    return { reset() { tm.clear(); build(); }, play() { tm.clear(); if (REDUCE) still(); else { build(); run(); } }, stop() { tm.clear(); } };
  }
  const MOCKS = { arrivals: Arrivals, hub: Hub, events: Events };
  function makeMock(id, host) {
    const root = document.createElement("div"); host.append(root);
    const m = (MOCKS[id] || Events)(root), play = m.play, stop = m.stop;
    m.play = () => { m.running = true; play(); }; m.stop = () => { m.running = false; stop(); };
    m.id = id; m.root = root; m.reset(); return m;
  }

  /* fit a 640x400 (wide) or 380x430 (narrow) sketch into any frame, filling it */
  const ro = new ResizeObserver((ents) => ents.forEach((en) => fit(en.target)));
  function fit(view) {
    const w = view.clientWidth, h = view.clientHeight; if (!w || !h) return;
    const kw = Math.min(w / 640, h / 400), kn = Math.min(w / 380, h / 430); let nar = kn > kw * (w < 520 ? 1.08 : 1.3);
    let k = nar ? kn : kw; k = Math.min(k, 1.32);
    if (view.closest(".wk-flying")) nar = view.classList.contains("wk-nar"), k = nar ? Math.min(kn, 1.32) : Math.min(kw, 1.32); // keep the layout steady mid-flight
    view.classList.toggle("wk-nar", nar);
    view.style.setProperty("--k", k.toFixed(4));
    view.style.setProperty("--cw", (w / k).toFixed(1) + "px");
    view.style.setProperty("--ch", (h / k).toFixed(1) + "px");
    if (!view.closest(".wk-flying")) view.classList.toggle("wk-short", !nar && h / k < 440);
  }

  /* ---------- the showcase ---------- */
  const tabs = q(".wk-tabs"), info = q(".wk-info"), view = q(".wk-stage .wk-view"), apps = q(".wk-apps"), factss = q(".wk-factss"), frame = q(".wk-stage .wk-frame");
  const facts = (c, cls) => c.meta.map(([k, v]) => `<div><dt>${k}</dt><dd${/running|in use/i.test(v) ? ' class="ok"' : ""}>${T(v)}</dd></div>`).join("");
  ids.forEach((id, i) => {
    const c = CASES[id];
    tabs.insertAdjacentHTML("beforeend", `<li role="presentation"><button class="wk-tab" type="button" role="tab" id="wk-tab-${id}" aria-controls="wk-stage" aria-selected="false" data-i="${i}" tabindex="-1"><span class="wk-tn">${c.no}</span><span class="wk-tt">${c.title}</span><span class="wk-tg" aria-hidden="true">→</span><span class="wk-prog"><i></i></span></button></li>`);
    info.insertAdjacentHTML("beforeend", `<div class="wk-inf" data-i="${i}"><p class="wk-kick">Build ${c.no} <span>of ${pad(N)}</span></p><h2>${c.title}</h2><p class="wk-lead">${T(c.lead)}</p>
      <div class="wk-ctarow"><a class="wk-cta" href="${ROUTE.href("work/" + id)}" data-case="${id}">Read the case study <span aria-hidden="true">→</span></a><span class="wk-contact"><a href="mailto:hello@abuosba.com">Email</a><a href="https://www.linkedin.com/in/abuosba" rel="me">LinkedIn</a></span></div></div>`);
    apps.insertAdjacentHTML("beforeend", `<span class="wk-app" data-i="${i}"><i></i><b>${APP[id][0]}</b><span>· ${APP[id][1]}</span></span>`);
    factss.insertAdjacentHTML("beforeend", `<dl class="wk-facts" data-i="${i}">${facts(c)}</dl>`);
    const sl = document.createElement("div"); sl.className = "wk-slide"; sl.dataset.id = id; sl.hidden = true; view.append(sl);
  });
  ro.observe(view);
  const slides = qq(".wk-slide", view), mocks = {};
  const mockFor = (i) => (mocks[ids[i]] ||= makeMock(ids[i], slides[i]));

  let cur = 0, isOpen = false, caseId = null, pushed = false, anims = [], auto = true, cmock = null;
  function paint(i) {
    qq(".wk-tab", tabs).forEach((t, j) => { t.setAttribute("aria-selected", j === i); t.tabIndex = j === i ? 0 : -1; });
    qq(".wk-inf", info).forEach((e, j) => { e.classList.toggle("on", j === i); e.inert = j !== i; e.setAttribute("aria-hidden", j !== i); });
    qq(".wk-app", apps).forEach((e, j) => e.classList.toggle("on", j === i));
    qq(".wk-facts", factss).forEach((e, j) => { e.classList.toggle("on", j === i); e.setAttribute("aria-hidden", j !== i); });
    q("[data-count]").textContent = `${pad(i + 1)} / ${pad(N)}`;
    frame.setAttribute("aria-labelledby", "wk-tab-" + ids[i]);
  }
  function settle() { // end any slide still moving, so nothing is left half-faded
    anims.forEach((an) => { an.onfinish = null; an.cancel(); }); anims = [];
    slides.forEach((s, j) => { s.style.zIndex = ""; s.hidden = j !== cur; });
    ids.forEach((id, j) => { if (j !== cur && mocks[id] && mocks[id] !== cmock) mocks[id].stop(); });
  }
  function show(i) { // no motion
    settle();
    slides.forEach((s, j) => { s.hidden = j !== i; if (j !== i && mocks[ids[j]]) mocks[ids[j]].stop(); });
    cur = i; paint(i);
    const m = mockFor(i); fit(view); m.reset(); if (isOpen && !caseId) m.play();
  }
  function go(i, dir, manual) {
    i = ((i % N) + N) % N; if (i === cur && slides[i] && !slides[i].hidden) return;
    if (manual) stopAuto();
    if (caseId) return;
    settle();
    const from = cur, a = slides[from], b = slides[i];
    dir = dir || (i > from ? 1 : -1);
    cur = i; paint(i);
    const mb = mockFor(i); b.hidden = false; fit(view); mb.reset(); mb.play();
    if (REDUCE) { a.hidden = true; mocks[ids[from]] && mocks[ids[from]].stop(); return; }
    const E = "cubic-bezier(.65,0,.25,1)";
    if (RTL()) dir = -dir; // in Arabic the next build comes in from the left
    a.style.zIndex = 1; b.style.zIndex = 2;
    const sh = `${-dir * 24}px 0 40px -24px rgba(60,40,10,.28)`;
    const x = a.animate([{ transform: "none", opacity: 1 }, { transform: `translateX(${-dir * 22}%)`, opacity: 0.25 }], { duration: 760, easing: E, fill: "forwards" });
    const y = b.animate([{ transform: `translateX(${dir * 100}%)`, boxShadow: sh }, { transform: "none", boxShadow: sh, offset: 0.85 }, { transform: "none", boxShadow: "none" }], { duration: 760, easing: E, fill: "backwards" });
    anims = [x, y];
    x.onfinish = () => { anims = []; x.cancel(); y.cancel(); if (cur !== from) { a.hidden = true; mocks[ids[from]] && mocks[ids[from]].stop(); } a.style.zIndex = b.style.zIndex = ""; };
  }
  const next = (manual) => go(cur + 1, 1, manual), prev = (manual) => go(cur - 1, -1, manual);

  /* auto-advance: the brass line under the active build is the timer; any interaction stops it */
  function startAuto() { if (REDUCE || N < 2) return; auto = true; W.classList.remove("wk-auto"); void W.offsetWidth; W.classList.add("wk-auto"); }
  function stopAuto() { auto = false; W.classList.remove("wk-auto"); }
  tabs.addEventListener("animationend", (e) => { if (e.animationName === "wk-prog" && auto && isOpen && !caseId) next(false); });
  q(".wk-stage").addEventListener("pointerenter", () => W.classList.add("wk-hold"));
  q(".wk-stage").addEventListener("pointerleave", () => W.classList.remove("wk-hold"));
  document.addEventListener("visibilitychange", () => W.classList.toggle("wk-hold", document.hidden));

  tabs.addEventListener("click", (e) => { const t = e.target.closest(".wk-tab"); if (t) go(+t.dataset.i, 0, true); });
  tabs.addEventListener("keydown", (e) => {
    let k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (!k) return;
    if (/Left|Right/.test(e.key)) k = fwd(k);
    e.preventDefault(); e.stopPropagation(); go(cur + k, k, true); qq(".wk-tab", tabs)[cur].focus();
  });
  q("[data-prev]").addEventListener("click", () => prev(true));
  q("[data-next]").addEventListener("click", () => next(true));
  info.addEventListener("click", (e) => { const a = e.target.closest("[data-case]"); if (a) { e.preventDefault(); openCase(a.dataset.case); } });
  // click the live frame to open its case study; swipe it on touch screens
  let sx = null, sy = 0, swiped = false;
  frame.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; swiped = false; });
  frame.addEventListener("pointermove", (e) => {
    if (sx === null || swiped || e.pointerType === "mouse") return;
    const dx = e.clientX - sx; if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(e.clientY - sy) * 1.4) { swiped = true; fwd(dx) < 0 ? next(true) : prev(true); }
  });
  frame.addEventListener("pointerup", () => { sx = null; });
  frame.addEventListener("click", () => { if (!swiped) openCase(ids[cur]); swiped = false; });
  // the wordmark returns to the showcase; placeholder links (CV, href="#") go nowhere yet
  W.addEventListener("click", (e) => {
    const a = e.target.closest("a"); if (!a) return;
    if (a.classList.contains("wk-brand")) { e.preventDefault(); if (caseId) closeCase(); }
    else if (a.getAttribute("href") === "#") e.preventDefault();
  });
  q(".wk-back").addEventListener("click", () => { if (typeof WORK.onBack === "function") WORK.onBack(); else WORK.close(); });

  addEventListener("keydown", (e) => {
    if (!isOpen || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Escape" && caseId) { e.preventDefault(); closeCase(); return; }
    if (caseId) return;
    const tag = (document.activeElement && document.activeElement.tagName) || "";
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    if (e.key === "ArrowRight") { e.preventDefault(); RTL() ? prev(true) : next(true); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); RTL() ? next(true) : prev(true); }
  });

  /* ---------- the case page ---------- */
  const C = q(".wk-case");
  function caseHTML(id) {
    const i = ids.indexOf(id), c = CASES[id], nx = CASES[ids[(i + 1) % N]];
    const secs = ["The problem", "What I built", "What changed"].map((h, k) => [h, c.secs[k]]);
    return `<div class="wk-cbar"><button type="button" data-close><span aria-hidden="true">←</span> All builds</button><span class="wk-cnum">Build ${c.no} / ${pad(N)}</span><button type="button" data-cnext>Next build <span aria-hidden="true">→</span></button></div>
      <div class="wk-cin">
        <div class="wk-chero"><div class="wk-frame wk-cframe"><div class="wk-chrome"><span class="wk-apps"><span class="wk-app on"><i></i><b>${APP[id][0]}</b><span>· ${APP[id][1]}</span></span></span><span class="wk-livet"><span class="wk-dot"></span><span>Live mock<span class="wk-sd"> · sample data</span></span></span></div><div class="wk-view"></div></div></div>
        <header class="wk-chead">
          <div class="wk-cf" style="--d:0"><p class="wk-kick">Build ${c.no} <span>· case study</span></p><h1 tabindex="-1">${c.title}</h1><p class="wk-lead">${T(c.lead)}</p></div>
          <dl class="wk-cfacts wk-cf" style="--d:1">${facts(c)}</dl>
        </header>
        <div class="wk-csecs">
          ${secs.map(([h, p], k) => `<section class="wk-csec wk-cf" style="--d:${k + 2}"><h3><b>${pad(k + 1)}</b>${h}</h3><p>${T(p)}</p></section>`).join("")}
          <figure class="wk-cfig wk-cf" style="--d:5"><figcaption>${T(c.cap)}</figcaption>${figure(c.fig, 'aria-hidden="true"')}</figure>
        </div>
        <button type="button" class="wk-cnext wk-cf" style="--d:6" data-cnext><span style="font:inherit;color:inherit"><small>Next build · ${nx.no}</small><b>${nx.title}</b></span><span aria-hidden="true">→</span></button>
      </div>`;
  }
  function home(m) { // put a mock back into its own slide in the showcase
    if (!m) return; const v = q(".wk-view", C); if (v) ro.unobserve(v);
    slides[ids.indexOf(m.id)].append(m.root);
  }
  function mountCase(id) {
    if (cmock) { cmock.stop(); home(cmock); cmock = null; }
    C.innerHTML = caseHTML(id);
    const v = q(".wk-view", C), m = mockFor(ids.indexOf(id));
    v.append(m.root); ro.observe(v); fit(v); cmock = m;
    return q(".wk-cframe", C);
  }
  C.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeCase();
    else if (e.target.closest("[data-cnext]")) swapCase(ids[(ids.indexOf(caseId) + 1) % N]);
  });
  const rectOf = (el) => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; };
  const place = (el, r) => Object.assign(el.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px", right: "auto", bottom: "auto" });
  function fly(el, from, to, done) {
    el.classList.remove("wk-flying"); el.style.transition = "none"; place(el, from); el.classList.add("wk-flying");
    void el.offsetWidth; el.style.transition = "";
    requestAnimationFrame(() => { place(el, to); });
    let fin = false; const end = () => { if (fin) return; fin = true; el.classList.remove("wk-flying"); el.removeAttribute("style"); done && done(); };
    el.addEventListener("transitionend", function te(ev) { if (ev.propertyName === "width" || ev.propertyName === "top") { el.removeEventListener("transitionend", te); end(); } });
    setTimeout(end, 950);
  }

  function openCase(id, o = {}) {
    if (!CASES[id] || !isOpen) return;
    if (caseId === id) return;
    if (caseId) { swapCase(id, o.push === false); return; }
    stopAuto();
    const i = ids.indexOf(id);
    if (i !== cur || slides[i].hidden) show(i);
    if (o.push !== false) { history.pushState({ wk: id }, "", ROUTE.href("work/" + id)); pushed = true; }
    caseId = id;
    const from = rectOf(frame), cf = mountCase(id); // the same live mock moves into the case page, mid-flow
    if (!cmock.running) cmock.play();
    C.scrollTop = 0; C.hidden = false; C.classList.remove("in");
    W.classList.add("wk-casing");
    frame.style.visibility = "hidden";
    const flip = o.flip !== false && !REDUCE;
    if (flip) fly(cf, from, rectOf(q(".wk-chero", C)));
    requestAnimationFrame(() => C.classList.add("in"));
    setTimeout(() => { const h = q("h1", C); h && h.focus({ preventScroll: true }); }, flip ? 800 : 50);
  }
  function swapCase(id, fromPop) {
    if (!fromPop) history.replaceState(history.state && history.state.wk ? { wk: id } : null, "", ROUTE.href("work/" + id));
    caseId = id;
    C.classList.add("swap");
    setTimeout(() => {
      if (caseId !== id) return;
      show(ids.indexOf(id)); frame.style.visibility = "hidden";
      mountCase(id); C.scrollTop = 0; C.classList.remove("swap");
      cmock.reset(); cmock.play();
      const h = q("h1", C); h && h.focus({ preventScroll: true });
    }, REDUCE ? 0 : 240);
  }
  function closeCase(fromPop, quiet) {
    if (!caseId) return;
    if (!fromPop && !quiet) {
      if (pushed && history.state && history.state.wk) { pushed = false; history.back(); return; } // popstate brings us back here
      history.replaceState(null, "", ROUTE.href("work"));
    }
    pushed = false;
    const id = caseId; caseId = null;
    const i = ids.indexOf(id), cf = q(".wk-cframe", C);
    if (i !== cur || slides[i].hidden) show(i);
    const from = cf && rectOf(cf), to = rectOf(frame);
    const visible = from && from.top + from.height > 40 && from.top < innerHeight - 40;
    C.classList.remove("in", "swap"); W.classList.remove("wk-casing");
    const done = () => {
      if (caseId) return;
      if (cmock) { home(cmock); fit(view); if (!isOpen) cmock.stop(); cmock = null; }
      frame.style.visibility = ""; C.hidden = true; C.innerHTML = "";
    };
    if (quiet || REDUCE || !visible) setTimeout(done, quiet || REDUCE ? 0 : 420);
    else fly(cf, from, to, done);
    const t = qq(".wk-tab", tabs)[i]; if (t && !quiet) setTimeout(() => t.focus({ preventScroll: true }), 60);
  }
  const hashCase = () => { const k = ROUTE.parse().key, m = k && /^work\/([\w-]+)$/.exec(k); return m && CASES[m[1]] ? m[1] : null; };
  addEventListener("popstate", () => {
    if (!isOpen) return;
    const id = hashCase();
    if (id) { if (id !== caseId) openCase(id, { push: false }); }
    else if (caseId) closeCase(true);
  });

  /* ---------- open / close ---------- */
  let leaveT = 0;
  function open(opts = {}) {
    const id = (opts.id && CASES[opts.id] ? opts.id : null) || hashCase();
    if (isOpen) { if (id) openCase(id, { push: false }); return Promise.resolve(); }
    clearTimeout(leaveT);
    isOpen = true;
    W.hidden = false; W.classList.remove("wk-leaving", "wk-shown");
    void W.offsetWidth;
    W.classList.add(opts.instant || REDUCE ? "wk-shown" : "wk-on");
    show(id ? ids.indexOf(id) : (opts.index ?? cur));
    if (id) openCase(id, { push: false, flip: false }); else startAuto();
    if (!W.contains(document.activeElement)) W.focus({ preventScroll: true });
    return new Promise((res) => setTimeout(res, opts.instant || REDUCE ? 0 : 1100));
  }
  function close() {
    if (!isOpen) return Promise.resolve();
    isOpen = false; stopAuto();
    if (caseId) closeCase(true, true);
    W.classList.remove("wk-on", "wk-shown"); W.classList.add("wk-leaving");
    return new Promise((res) => {
      leaveT = setTimeout(() => {
        W.hidden = true; W.classList.remove("wk-leaving");
        Object.values(mocks).forEach((m) => m.stop()); if (cmock) cmock.stop();
        res();
      }, REDUCE ? 0 : 560);
    });
  }

  window.WORK = {
    open, close, onBack: null,
    go: (i) => go(typeof i === "string" ? ids.indexOf(i) : i, 0, true),
    openCase: (id) => openCase(id), closeCase: () => closeCase(),
    get isOpen() { return isOpen; }, get current() { return ids[cur]; }, get caseId() { return caseId; },
  };
  paint(0);
})();
