(() => {
  const body = document.body;
  Sky($("#sky"), { hills: true, lights: true, suhail: [0.8, 0.8], density: 0.85, dustAlpha: 0.9 });

  /* ── the thoughts: published posts from the vault, in the language of the page (Arabic shows only Arabic posts) ── */
  let NO = [];
  const order = () => (NO = NORDER.filter((id) => NOTES[id].lang === ROUTE.lang()));
  const excerpt = (id) => NOTES[id].excerpt || NOTES[id].dek;
  const when = (n) => `${n.kind} · ${n.mins} min`;
  const car = $("#car");
  const card = (id, i, dup) => { const n = NOTES[id]; return `<button class="note" type="button" data-open="note/${id}"${dup ? ' aria-hidden="true" tabindex="-1"' : ""}><small>${i === 0 ? "<b>Latest</b> · " : ""}${when(n)}</small><h2>${n.title}</h2><p>${excerpt(id)}</p></button>`; };
  // nothing yet in this language: say so plainly (the Arabic is written here, not looked up)
  const none = () => `<p class="none" data-i18n-skip>${ROUTE.lang() === "ar" ? "لا خواطر بالعربية بعد." : "Nothing written yet."}</p>`;
  function renderCar() { order(); car.innerHTML = NO.length ? NO.map((id, i) => card(id, i)).join("") : none(); dots.innerHTML = ""; dotsSync(); }
  // when there are more than fit: swipe on a phone, drag or scroll with a mouse, and the dots say where you are
  const dots = $("#dots");
  function dotsSync() {
    const over = car.scrollWidth > car.clientWidth + 2; dots.classList.toggle("on", over); if (!over) return;
    if (dots.children.length !== NO.length) dots.innerHTML = NO.map(() => "<i></i>").join("");
    const step = car.children[1] ? car.children[1].offsetLeft - car.children[0].offsetLeft : 1, at = Math.round(car.scrollLeft / step);
    [...dots.children].forEach((d, i) => d.classList.toggle("on", i === Math.min(at, NO.length - 1)));
  }
  car.addEventListener("scroll", dotsSync, { passive: true }); addEventListener("resize", dotsSync); renderCar();
  let dragX = null, moved = 0;
  car.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse" || car.scrollWidth <= car.clientWidth + 2) return; dragX = e.clientX; moved = 0; car.style.scrollSnapType = "none"; });
  addEventListener("pointermove", (e) => { if (dragX === null) return; const d = e.clientX - dragX; dragX = e.clientX; moved += Math.abs(d); car.scrollLeft -= d; });
  addEventListener("pointerup", () => { if (dragX === null) return; dragX = null; car.style.scrollSnapType = ""; });
  car.addEventListener("click", (e) => { if (moved > 6) { e.stopPropagation(); e.preventDefault(); moved = 0; } }, true);
  /* the shelf: Suhail's books and records, face out, oldest first. img is the real cover (public/covers/);
     without one, the cover is drawn from cv: background, text, accent and a motif. when is the date a book was read. */
  const SH = [
    { t: "The Tipping Point", img: "/covers/tipping-point.jpg", by: "Malcolm Gladwell", y: 2000, when: "9 Feb 2025", sub: "How little things can make a big difference", cv: ["#f3efe6", "#1b1b1b", "#d2452b", "match"] },
    { t: "Tuesdays with Morrie", img: "/covers/tuesdays-with-morrie.jpg", by: "Mitch Albom", y: 1997, when: "23 May 2025", sub: "An old man, a young man, and life's greatest lesson", cv: ["linear-gradient(180deg,#bcd3e2,#f1eee6 70%)", "#24364a", "#7a9cb8", "sky"], r: 2 },
    { t: "The God Delusion", img: "/covers/god-delusion.jpg", by: "Richard Dawkins", y: 2006, when: "4 Nov 2025", cv: ["#13161f", "#f1ece2", "#c9a14a", "line"], r: -2 },
    { t: "Animal Farm", img: "/covers/animal-farm.jpg", by: "George Orwell", y: 1945, when: "17 Jul 2026", sub: "A fairy story", cv: ["#c4432b", "#f6ead2", "#f2b6a6", "dot"], r: 1 },
    { t: "1984", img: "/covers/1984.jpg", by: "George Orwell", y: 1949, now: 1, cv: ["#111216", "#e8e2d6", "#c4302b", "eye"], r: 5 },
    { rec: 1, t: "Moon Music", img: "/covers/moon-music.jpg", by: "Coldplay", y: 2024, cv: ["radial-gradient(circle at 30% 30%,#f7c6a0,transparent 45%),radial-gradient(circle at 75% 70%,#7a5cc8,transparent 50%),conic-gradient(from 200deg,#e86a8a,#f0b93a,#5bb3a8,#4a63c8,#a04ab0,#e86a8a)", "#fff", "#f0b93a", ""] },
    { rec: 1, t: "For Cryin' Out Loud!", img: "/covers/finneas-fcol.jpg", by: "FINNEAS", y: 2024, cv: ["linear-gradient(160deg,#d7a868,#8a5530 70%,#4a2a18)", "#fbf1e0", "#d7a868", ""] },
    { rec: 1, t: "Hit Me Hard and Soft", img: "/covers/hmhas.jpg", by: "Billie Eilish", y: 2024, now: 1, cv: ["radial-gradient(ellipse at 50% 0,#3d8cc0,transparent 60%),linear-gradient(180deg,#0d4c7a,#072a48 75%,#03162a)", "#eaf4fb", "#3d8cc0", ""] },
  ];
  /* A shelf of items (oldest first). Front page: a crate that only holds the latest few, with the rest in a pile that
     opens the whole shelf. Full shelf (wrap): rows of boards, newest first. Picking works the same in both. */
  const touchy = matchMedia("(hover: none)").matches, RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hex = (x) => (String(x.cv[0]).match(/#[0-9a-f]{6}/i) || ["#5b4a7a"])[0];
  function itemHTML(x, i, d) {
    const [bg, fg, ac, mo] = x.cv, st = `--cv:${x.img ? `url('${x.img}')` : bg};--fg:${fg};--ac:${ac};--lb:${ac};--r:${x.r || 0}deg;--d:${d.toFixed(2)}s`;
    const face = `<span class="fc">${x.img ? "" : `<i class="mo mo-${mo}"></i><b class="ct">${x.t}</b><b class="ca">${x.by}</b>`}</span>`;
    const lab = `${x.t}, ${x.rec ? "album by" : "by"} ${x.by}${x.now ? `, ${x.rec ? "listening" : "reading"} now` : ""}`, now = x.now ? " now" : "";
    return x.rec
      ? `<button class="sh-rec${now}" type="button" data-i="${i}" aria-pressed="false" aria-label="${lab}" style="${st}"><span class="vy"><span class="vd"></span></span><span class="sh-cv">${face}</span><span class="arm"></span></button>`
      : `<button class="sh-bk${now}" type="button" data-i="${i}" aria-pressed="false" aria-label="${lab}" style="${st}"><span class="pg" aria-hidden="true"><u>✦</u><i>${x.now ? "Reading" : "Read"}</i><b>${x.now ? "now" : x.when}</b></span><span class="sh-cv">${face}<span class="bc"></span></span></button>`;
  }
  function pileHTML(older, rec) {
    if (!older.length) return "";
    const top = older.slice(-5).reverse(), n = older.length;
    return `<button class="sh-pile${rec ? " crate" : ""}" type="button" data-open="shelf/${rec ? "music" : "books"}" style="--n:${top.length}" aria-label="${n} more ${rec ? (n > 1 ? "albums" : "album") : (n > 1 ? "books" : "book")}, see the whole shelf"><b>+${n}<small>more</small></b>${top.map((x, k) => `<i style="--c:${hex(x)};--k:${k}${rec && x.img ? `;--im:url('${x.img}')` : ""}"></i>`).join("")}</button>`;
  }
  function makeShelf(el, items, { wrap = false, piles = [[], []], first = -1 } = {}) {
    let d = 0;
    const html = wrap
      ? items.map((x, i) => itemHTML(x, i, Math.min(i * .045, 1.2))).join("")
      : items.map((x, i) => (i === 0 ? pileHTML(piles[0], false) : "") + (i && x.rec && !items[i - 1].rec ? '<span class="sh-gap"></span>' + pileHTML(piles[1], true) : "") + itemHTML(x, i, (d++) * .07)).join("");
    el.classList.toggle("wrap", wrap);
    el.innerHTML = `<div class="sh-scene" role="group" aria-label="${wrap ? "The whole shelf" : "The shelf"}">${html}</div><div class="sh-cap out" aria-live="polite"></div>`;
    const cap = $(".sh-cap", el), btns = $$(".sh-scene button[data-i]", el), scene = $(".sh-scene", el);
    let on = -1, touched = false, t = 0;
    const pick = (i, quiet) => {
      if (i === on) return; on = i;
      btns.forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.i === i)));
      const x = items[i], kind = x.rec ? `${x.now ? '<span class="nd"></span>Listening now · ' : ""}Released ${x.y}` : x.now ? '<span class="nd"></span>Reading now' : `Read · ${x.when}`;
      const fill = () => { cap.innerHTML = `<small>${kind}${touched || wrap ? "" : `<span class="hint">${touchy ? "Tap" : "Pick"} another</span>`}</small><p><em>${x.t}</em> ${x.rec ? "·" : "by"} ${x.by}</p>${x.sub ? `<span class="why">${x.sub}</span>` : ""}`; cap.classList.remove("out"); };
      if (wrap) {
        // rows of a fixed grid: carry a book in the first column right (its cover opens left), a record in the last column left (its disc slides right)
        const W = scene.clientWidth;
        btns.forEach((b) => { const j = +b.dataset.i, L = b.offsetLeft, mine = j === i; b.style.setProperty("--k", !mine ? 0 : items[j].rec ? (L + b.offsetWidth * 1.6 > W ? -Math.ceil((L + b.offsetWidth * 1.6 - W) / parseFloat(getComputedStyle(el).getPropertyValue("--s") || 1)) : 0) : (L < 40 ? 62 : 0)); });
      } else {
        // make room by sliding, not by changing margins (no layout work per frame); a book near the start is carried right
        // the pile and crate slide with their neighbours, so an opened cover or a pushed row never lands on them
        let push = 0;
        $$(".sh-scene > button", el).forEach((b) => {
          if (!b.dataset.i) return b.style.setProperty("--k", push);
          const j = +b.dataset.i, mine = j === i && !items[j].rec; b.style.setProperty("--k", mine ? Math.max(12, (piles[0].length ? 58 : 70) - 34 * j) : push); if (mine) push = 12; if (j === i) push += items[j].rec ? 48 : 18; });
      }
      clearTimeout(t); if (quiet) return fill(); cap.classList.add("out"); t = setTimeout(fill, 190);
    };
    el.onclick = (e) => { const b = e.target.closest(".sh-scene button[data-i]"); if (!b) return; touched = true; const i = +b.dataset.i; if (i === on) { on = -1; pick(i); } else pick(i); };
    const drop = (after) => { el.classList.add("pre"); requestAnimationFrame(() => setTimeout(() => { el.classList.replace("pre", "drop"); setTimeout(() => { el.classList.remove("drop"); after && after(); }, Math.min(items.length * (wrap ? 45 : 70), 1200) + 850); }, 60)); };
    if (RM) { if (first >= 0) pick(first, true); return; }
    if (wrap) return drop();
    // the front shelf drops in once it is on screen, then opens on the book being read now
    if (!("IntersectionObserver" in window)) return first >= 0 && pick(first, true);
    el.classList.add("pre");
    const io = new IntersectionObserver((es) => { if (!es.some((e) => e.isIntersecting)) return; io.disconnect(); setTimeout(() => drop(() => { if (on < 0 && first >= 0) pick(first); }), 350); }, { threshold: .35 });
    io.observe(el);
  }
  // the front shows the latest books and albums that fit; older ones sit in a pile that opens the whole shelf
  const shelfEl = $("#shelf"), narrow = matchMedia("(max-width: 760px)");
  function frontShelf() {
    // the front keeps the latest few (4 books and 2 albums, 3 and 2 on a phone); the rest wait in a pile and a crate,
    // so there is always a sign of more, and the heading counts everything on the shelf
    const bk = SH.filter((x) => !x.rec), rc = SH.filter((x) => x.rec);
    const keepB = Math.min(bk.length, narrow.matches ? 3 : 4), keepR = Math.min(rc.length, 2);
    $("#sh-all").innerHTML = `${bk.length} book${bk.length === 1 ? "" : "s"} · ${rc.length} album${rc.length === 1 ? "" : "s"} →`;
    const vis = [...bk.slice(bk.length - keepB), ...rc.slice(rc.length - keepR)];
    makeShelf(shelfEl, vis, { piles: [bk.slice(0, bk.length - keepB), rc.slice(0, rc.length - keepR)], first: vis.findIndex((x) => x.now && !x.rec) });
  }
  frontShelf(); narrow.addEventListener("change", frontShelf);

  /* ── the welcome: one of the drafts. Welcome(root, VIS) fills the section; land() runs once the intro has landed. ── */
  const W = window.Welcome ? window.Welcome($("#welcome"), VIS) : null;
  let landed; new Promise((r) => (landed = r)).then(() => W && W.land && W.land());

  /* ── the reader: a note, all notes, or the shelf, grown from what was tapped ── */
  const reader = $("#reader");
  function rect(el) { const r = el.getBoundingClientRect(); [["--ct", r.top], ["--cl", r.left], ["--cr", innerWidth - r.right], ["--cb", innerHeight - r.bottom]].forEach(([k, v]) => reader.style.setProperty(k, Math.max(0, v) + "px")); }
  let from = null;
  const esc = (x) => String(x).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const ticks = (n) => `<span class="th-ticks" aria-hidden="true">${"<u></u>".repeat(n)}</span>`;
  const isAr = () => document.documentElement.lang === "ar";
  const peekHTML = (id) => { const n = NOTES[id]; return `<div><small>${when(n)}</small><h2>${n.title}</h2><p>${excerpt(id)}</p><a href="${ROUTE.href("note/" + id)}" data-open="note/${id}">Read it →</a></div>`; };
  /* a thought's words: its own page carries them in <template id="note-body">; going from one thought to another
     reads them from that thought's page, once */
  const bodies = {};
  { const t = $("#note-body"); if (t) bodies[t.dataset.slug] = t.innerHTML; }
  const firstDrop = (h) => h.replace(/^\s*<p>/, '<p class="drop">');
  const noteBody = (id) => (id in bodies ? firstDrop(bodies[id]) : null);
  function fetchBody(id) {
    fetch(ROUTE.href("note/" + id, NOTES[id].lang)).then((r) => r.text()).then((h) => {
      const t = new DOMParser().parseFromString(h, "text/html").querySelector("#note-body");
      bodies[id] = t ? t.innerHTML : "";
      const nb = $(`.nb[data-nb="${id}"]`); if (nb) nb.innerHTML = noteBody(id);
    }).catch(() => {});
  }
  /* Suhail, the star, from where the visitor is: one line, in both languages (data-ar carries the Arabic) */
  function suhailLine() {
    const s = VIS.suhailNews ? VIS.suhailNews() : null; if (!s) return "";
    let tr = (x) => x; try { tr = (x) => AR.tr(x) || x; } catch (e) {}
    const CMP = { north: "الشمال", "north-east": "الشمال الشرقي", east: "الشرق", "south-east": "الجنوب الشرقي", south: "الجنوب", "south-west": "الجنوب الغربي", west: "الغرب", "north-west": "الشمال الغربي" };
    let en, ar;
    if (s.kind === "never") { en = `From where you are, Suhail never clears the horizon; you would need to be south of about ${s.need}° north to see it.`; ar = `من حيث أنت، لا يرتفع سهيل فوق الأفق؛ عليك أن تكون جنوب خط العرض ${tr(String(s.need))}° شمالاً تقريباً لتراه.`; }
    else if (s.kind === "always") { en = "From where you are, Suhail never sets."; ar = "من حيث أنت، لا يغيب سهيل أبداً."; }
    else if (s.kind === "up") { en = `Right now Suhail is above your horizon, in the ${s.dir}${s.dark ? "" : ", though the sky is too bright to see it"}.`; ar = `سهيل الآن فوق أفقك، في ${CMP[s.dir] || s.dir}${s.dark ? "" : "، لكن السماء أشدّ ضوءاً من أن تراه"}.`; }
    else if (s.rise) { const t = VIS.time(s.rise); en = `From where you are, Suhail next rises at ${t}${s.riseDark ? ", in the dark" : ", in daylight"}.`; ar = `من حيث أنت، يطلع سهيل التالي في ${tr(t)}${s.riseDark ? "، في العتمة" : "، في وضح النهار"}.`; }
    else return "";
    return `<span class="ab-live" data-ar="${esc(ar)}">${en}</span>`;
  }
  const PAGES = {
    note(id) {
      const i = NO.indexOf(id), n = NOTES[id], k = NO.length, nx = NO[(i + 1) % k], pv = NO[(i + k - 1) % k];
      const pn = k > 1 ? `<nav class="r-pn" aria-label="More thoughts"><a href="${ROUTE.href("note/" + pv)}" data-open="note/${pv}"><span>Before</span><b>← ${NOTES[pv].title}</b></a><a href="${ROUTE.href("note/" + nx)}" data-open="note/${nx}"><span>Next</span><b>${NOTES[nx].title} →</b></a></nav>` : "";
      return [`Thoughts<b>خواطر</b>`, `<p class="when">${n.kind} · ${n.mins} min read · ${n.date || "soon"}</p><h1>${n.title}</h1><p class="dek">${n.dek}</p><div class="nb" data-nb="${id}" data-i18n-skip>${noteBody(id) || ""}</div>
        <p class="fin" aria-hidden="true">✦</p>
        ${pn}
        <a class="r-all" href="${ROUTE.href("notes")}" data-open="notes">All thoughts →</a>`, () => noteBody(id) == null && fetchBody(id), "notes"];
    },
    notes() {
      const es = NO.filter((id) => NOTES[id].kind === "Essay").length;
      if (!NO.length) return [`Thoughts<b>خواطر</b>`, `<header class="r-hd"><h1>Thoughts</h1><p class="dek">Written after dark. A new one when there is one.</p></header>${none()}`, null, "notes"];
      const rows = NO.map((id, i) => `<a class="th-row${i ? "" : " on"}" href="${ROUTE.href("note/" + id)}" data-open="note/${id}" data-id="${id}"><small>${i ? "" : "Latest · "}${when(NOTES[id])}</small><b>${NOTES[id].title}</b><i>${NOTES[id].dek}</i>${ticks(NOTES[id].mins)}</a>`).join("");
      return [`Thoughts<b>خواطر</b>`, `<header class="r-hd"><h1>Thoughts</h1><p class="dek">Written after dark. A new one when there is one.</p><p class="r-meta">${NO.length} so far · ${es} essay${es === 1 ? "" : "s"} · ${NO.length - es} note${NO.length - es === 1 ? "" : "s"}</p></header>
        <div class="th"><div class="th-list">${rows}</div><aside class="th-peek" aria-hidden="true">${peekHTML(NO[0])}</aside></div>`, () => {
        const list = $(".th-list"), peek = $(".th-peek"); if (!list) return; let cur = NO[0], tm = 0;
        const show = (id) => { if (id === cur) return; cur = id; $$(".th-row", list).forEach((r) => r.classList.toggle("on", r.dataset.id === id));
          const d = peek.firstElementChild; d.classList.add("out"); clearTimeout(tm);
          tm = setTimeout(() => { peek.innerHTML = peekHTML(id); const n = peek.firstElementChild; n.classList.add("out"); requestAnimationFrame(() => n.classList.remove("out")); }, REDUCE ? 0 : 200); };
        list.addEventListener("pointerover", (e) => { const r = e.target.closest(".th-row"); if (r) show(r.dataset.id); });
        list.addEventListener("focusin", (e) => { const r = e.target.closest(".th-row"); if (r) show(r.dataset.id); });
      }, "notes", true];
    },
    shelf(tab) {
      const bk = SH.filter((x) => !x.rec).reverse(), rc = SH.filter((x) => x.rec).reverse(), m = tab === "music";
      const log = (xs, music) => xs.map((x) => `<li${x.now ? ' class="now"' : ""}><span>${x.now ? (music ? "Listening now" : "Reading now") : music ? `Released ${x.y}` : (x.when || T("[Month Year]"))}</span><b>${x.t}</b><i>${music ? x.by : "by " + x.by}</i></li>`).join("");
      const go = (t) => {
        const music = t === "music";
        $$(".sh-tabs button").forEach((b) => b.setAttribute("aria-selected", String((b.dataset.tab === "music") === music)));
        $(".sh-tabs").style.setProperty("--x", music ? 1 : 0);
        $("#sh-all-b").hidden = $("#log-b").hidden = music; $("#sh-all-r").hidden = $("#log-r").hidden = !music;
        makeShelf(music ? $("#sh-all-r") : $("#sh-all-b"), music ? rc : bk, { wrap: true });
        history.replaceState(null, "", ROUTE.href(music ? "shelf/music" : "shelf"));
      };
      return [`The shelf`, `<h1>The shelf</h1><p class="dek">Everything read and played, newest first.</p><div class="sh-tabs" role="tablist" style="--x:${m ? 1 : 0}"><button type="button" role="tab" data-tab="books" aria-selected="${!m}">Books<span>${bk.length}</span></button><button type="button" role="tab" data-tab="music" aria-selected="${m}">Music<span>${rc.length}</span></button><i aria-hidden="true"></i></div><div class="sh" id="sh-all-b"${m ? " hidden" : ""}></div><div class="sh" id="sh-all-r"${m ? "" : " hidden"}></div>
        <ol class="log" id="log-b"${m ? " hidden" : ""}>${log(bk)}</ol><ol class="log" id="log-r"${m ? "" : " hidden"}>${log(rc, true)}</ol>`, () => {
        $(".sh-tabs").onclick = (e) => { const b = e.target.closest("[data-tab]"); if (b && b.getAttribute("aria-selected") !== "true") go(b.dataset.tab); };
        makeShelf(m ? $("#sh-all-r") : $("#sh-all-b"), m ? rc : bk, { wrap: true });
      }, "shelf"];
    },
    about() {
      const rb = SH.find((x) => x.now && !x.rec), rm = SH.find((x) => x.now && x.rec), lt = NO[0];
      return [`About`, `<div class="ab"><div class="ab-mk"><span class="mk" aria-hidden="true">${$("#tpl-mark").innerHTML}</span><h1>Suhail AbuOsba<b lang="ar" data-i18n-skip>سهيل ابواصبع</b></h1><p>Named for a star.</p></div>
        <div class="ab-in">
          <section class="ab-s"><h2>The name</h2><div><p>Suhail is the Arabic name for Canopus, the second-brightest star in the night sky. In Yemen its first rising before dawn is read as the turn of the season.</p><p>${suhailLine()}</p></div></section>
          <section class="ab-s"><h2>The mark</h2><div><p>An astrolabe, the old instrument for reading the sky. The letters of سهيل form its rete, the turning star map on top.</p></div></section>
          <section class="ab-s"><h2>Me</h2><div><p>${T("[Two or three lines in your own words: where you are from, what you do by day, what keeps you up at night.]")}</p></div></section>
          <section class="ab-s"><h2>By day</h2><div><p>Automations, APIs, data pipelines and dashboards for universities.</p><button class="day" type="button" data-work><span class="sunico" aria-hidden="true"></span>See the work</button></div></section>
          <section class="ab-s"><h2>Now</h2><div><dl>${rb ? `<dt>Reading</dt><dd><a href="${ROUTE.href("shelf")}" data-open="shelf/books">${rb.t}</a>, ${rb.by}</dd>` : ""}${rm ? `<dt>Listening</dt><dd><a href="${ROUTE.href("shelf/music")}" data-open="shelf/music">${rm.t}</a>, ${rm.by}</dd>` : ""}${lt ? `<dt>Writing</dt><dd><a href="${ROUTE.href("note/" + lt)}" data-open="note/${lt}">${NOTES[lt].title}</a></dd>` : ""}</dl></div></section>
          <section class="ab-s"><h2>Elsewhere</h2><div><dl><dt>Email</dt><dd><a href="mailto:hello@abuosba.com">hello@abuosba.com</a></dd><dt>CV</dt><dd>${T("[link to your CV]")}</dd><dt>Online</dt><dd>${T("[GitHub, LinkedIn, or nothing]")}</dd></dl>
            <p class="ab-col">Set in Alegreya and Noto Naskh Arabic. The page takes the colour of your sky.</p></div></section>
        </div></div>`, null, "about", true];
    },
    lost(h) {
      return [`Not found`, `<div class="lost"><svg viewBox="0 0 340 170" aria-hidden="true">
          <path class="ln" d="M24 128 L92 96 L150 112 L214 58"/><path class="ln gone" d="M214 58 L292 34"/><path class="ln" d="M150 112 L176 150"/>
          <circle class="st" cx="24" cy="128" r="2.4"/><circle class="st" cx="92" cy="96" r="3.2" style="animation-delay:-1s"/><circle class="st" cx="150" cy="112" r="2.6" style="animation-delay:-2.2s"/>
          <circle class="st" cx="214" cy="58" r="3.6" style="animation-delay:-.6s"/><circle class="st" cx="176" cy="150" r="2" style="animation-delay:-3s"/><circle class="hole" cx="292" cy="34" r="9"/></svg>
        <h1>This page isn't on the map.</h1><p>The link may be old, or the page has moved.</p>${h ? `<p><span>You asked for</span> <code data-i18n-skip>${esc(h)}</code></p>` : ""}<p>These are all still here:</p>
        <nav aria-label="Pages"><a href="${ROUTE.href("")}" data-home>Tonight</a><a href="${ROUTE.href("notes")}" data-open="notes">Thoughts</a><a href="${ROUTE.href("shelf")}" data-open="shelf">The shelf</a><a href="${ROUTE.href("about")}" data-open="about">About</a><button type="button" data-work>The work</button></nav></div>`, null, ""];
    },
  };
  function open(key, el) {
    const [p, arg] = key.split("/"); if (!PAGES[p] || p === "lost" || (p === "note" && !NO.includes(arg))) return false;
    return show(PAGES[p](arg), el, p === "note");
  }
  function show([k, html, after, pg, wide], el, isNote) {
    $("#r-k").innerHTML = k; const inn = $("#r-in"); inn.innerHTML = html; inn.classList.toggle("wide", !!wide); reader.scrollTop = 0;
    reader.classList.toggle("is-note", !!isNote); reader.style.setProperty("--p", 0);
    $$(".r-nav [data-pg]").forEach((a) => (a.dataset.pg === pg ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
    if (after) setTimeout(after, reader.classList.contains("on") ? 0 : 450);
    if (!reader.classList.contains("on")) { from = el || car.children[0]; rect(from); reader.getBoundingClientRect(); }
    reader.classList.add("on"); body.classList.add("reading"); return true;
  }
  const lost = (h) => show(PAGES.lost(h), null, false);
  reader.addEventListener("scroll", () => { if (!reader.classList.contains("is-note")) return; const m = reader.scrollHeight - reader.clientHeight; $(".r-prog").style.setProperty("--p", m > 4 ? Math.min(1, reader.scrollTop / m) : 1); }, { passive: true });
  function close() { if (!reader.classList.contains("on")) return; if (from && from.isConnected) rect(from); reader.classList.remove("on"); body.classList.remove("reading"); }
  document.addEventListener("click", (ev) => {
    const o = ev.target.closest("[data-open]"); if (o) { ev.preventDefault(); history.pushState(null, "", ROUTE.href(o.dataset.open)); open(o.dataset.open, o.closest("#page") ? o : null); return; }
    if (ev.target.closest("[data-work]")) toDay();
  });
  $("#r-back").addEventListener("click", () => { history.pushState(null, "", ROUTE.href("") + location.search); close(); });
  $("#home").addEventListener("click", (e) => { e.preventDefault(); if (reader.classList.contains("on")) $("#r-back").click(); });
  reader.addEventListener("click", (e) => { if (e.target.closest("[data-home]")) { e.preventDefault(); $("#r-back").click(); } });

  /* ── by day: a sunrise into the work, and a sunset back, both on the one sky ── */
  const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)), mx = (a, b, f) => a.map((v, i) => v + (b[i] - v) * f);
  const css = (c, al = 1) => `rgba(${c.map(Math.round).join(",")},${al.toFixed(3)})`;
  // the day the Work sits on: a pale clear sky, warm at the horizon, light enough for ink
  const DAYSKY = { zen: hx("#bcd4eb"), mid: hx("#dfeaf2"), hor: hx("#f6ecdc"), lift: 1 };
  const nowSky = () => window.SKYNOW || { zen: hx("#060818"), mid: hx("#0a0d26"), hor: hx("#1c2150"), lift: 0, stars: 1 };
  const ease = (u) => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2, sm = (a, b, u) => Math.max(0, Math.min(1, (u - a) / (b - a)));
  const dawnL = $(".dawn"), sunEl = $(".dawn .sun");
  let sweepRaf = 0;
  // u: 0 = the visitor's sky, 1 = full day. Through morning colours on the way, more of them the darker it was.
  function paintDay(u, S) {
    const d = 1 - (S.lift || 0), m = Math.sin(Math.PI * Math.min(1, u * 1.15)) * (.35 + .65 * d);
    const zen = mx(mx(S.zen, DAYSKY.zen, ease(sm(.1, 1, u))), hx("#4a4f86"), m * .25);
    const mid = mx(mx(S.mid, DAYSKY.mid, ease(sm(.15, 1, u))), hx("#b98aa0"), m * .55);
    const hor = mx(mx(S.hor, DAYSKY.hor, ease(sm(.05, .95, u))), hx("#f4a47c"), m * .8);
    // the sun: from behind the hills, up into the top of the day
    // it climbs in an arc and settles at the top edge, half out of view, in the empty middle of the Work's bar
    const W = innerWidth, H = innerHeight, narrow = W < 761, k = ease(sm(.08, 1, u)), sx = narrow ? .72 - .17 * k : .74 - .12 * k;
    const x = W * sx, y = H * 1.08 * (1 - Math.sin(k * Math.PI / 2)), sc = 1.15 - .4 * k;
    sunEl.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${sc.toFixed(3)})`;
    sunEl.style.opacity = Math.min(1, sm(.04, .2, u) * 1.2).toFixed(3);
    const warm = 1 - sm(.35, 1, u); sunEl.style.setProperty("--sc", css(mx(hx("#fff6e4"), hx("#ffc996"), warm)));
    sunEl.style.setProperty("--sg", css(mx(hx("#ffe6b8"), hx("#ffad78"), warm), .42 + .18 * warm));
    const gx = (sx * 100).toFixed(1), gy = (y / H * 100).toFixed(1), ga = .18 + .5 * m;
    dawnL.style.background = `radial-gradient(ellipse 70% 55% at ${gx}% ${gy}%, ${css(mx(hx("#ffe9c4"), hx("#ffb27e"), warm), ga)}, ${css(hx("#ffd9a8"), 0)} 70%), linear-gradient(180deg, ${css(zen)} 0%, ${css(mid)} 58%, ${css(hor)} 100%)`;
    document.documentElement.style.setProperty("--cs-stars", ((S.stars ?? 1) * (1 - sm(0, .55, u))).toFixed(3));
  }
  function sweep(from, to, ms, done) {
    cancelAnimationFrame(sweepRaf); const S = nowSky(), t0 = performance.now();
    if (REDUCE) { paintDay(to, S); return done && done(); }
    const step = (t) => { const f = Math.min(1, (t - t0) / ms); paintDay(from + (to - from) * f, S); if (f < 1) sweepRaf = requestAnimationFrame(step); else done && done(); };
    sweepRaf = requestAnimationFrame(step);
  }
  addEventListener("resize", () => { if (isDay && !body.classList.contains("setting")) paintDay(1, nowSky()); });
  let isDay = false;
  function toDay(push = true, instant = false) {
    if (isDay) return; isDay = true; close();
    if (push) history.pushState(null, "", ROUTE.href("work"));
    if (instant) { body.classList.add("day"); paintDay(1, nowSky()); return window.WORK && WORK.open({ instant: true }); }
    body.classList.remove("setting", "dusk"); body.classList.add("rising");
    sweep(0, 1, 2600, () => { if (isDay) { body.classList.add("day"); body.classList.remove("rising"); } });
    setTimeout(() => isDay && window.WORK && WORK.open(), REDUCE ? 0 : 1500);
  }
  function toNight(push = true) {
    if (!isDay) return; isDay = false;
    if (window.WORK) WORK.close();
    if (push) history.pushState(null, "", ROUTE.href("") + location.search);
    body.classList.add("setting", "dusk"); body.classList.remove("day", "rising");
    setTimeout(() => body.classList.remove("dusk"), REDUCE ? 0 : 1300);
    sweep(1, 0, 2200, () => { if (isDay) return; body.classList.remove("setting"); dawnL.style.background = ""; if (window.SKYNOW) document.documentElement.style.setProperty("--cs-stars", SKYNOW.stars.toFixed(3)); });
  }
  if (window.WORK) WORK.onBack = () => toNight(true);

  // where the address says we are; a page that isn't on the map gets the lost page
  function route(instant) {
    const { key } = ROUTE.parse();
    if (key === "work" || (key && key.startsWith("work/"))) { toDay(false, instant); return; }
    if (isDay) toNight(false);
    if (instant && key) reader.classList.add("now");
    if (key === "") close(); else if (key == null || !open(key)) lost(location.pathname);
    if (instant) requestAnimationFrame(() => requestAnimationFrame(() => reader.classList.remove("now")));
  }
  /* a change of language: the thoughts are different ones (Arabic shows only Arabic posts), so what lists them is
     drawn again, a thought with no version in the new language gives way to the list, and the address follows */
  addEventListener("aolang", () => {
    renderCar();
    let { key } = ROUTE.parse();
    if (key != null) {
      const [p, arg] = key.split("/");
      if (p === "note") { const pr = NOTES[arg] && NOTES[arg].pair; key = pr && NOTES[pr] && NOTES[pr].lang === ROUTE.lang() ? "note/" + pr : "notes"; }
      if (reader.classList.contains("on") && ["note", "notes", "about"].includes(p)) open(key);
      history.replaceState(history.state, "", ROUTE.href(key) + location.search);
    } else {
      const ar = ROUTE.lang() === "ar", path = location.pathname.replace(/^\/ar(\/|$)/, "/");
      history.replaceState(history.state, "", (ar ? "/ar" + path : path) + location.search);
    }
    $$("a[data-open]").forEach((a) => (a.href = ROUTE.href(a.dataset.open)));
    $$("a[data-home], #home").forEach((a) => (a.href = ROUTE.href("")));
  });
  addEventListener("popstate", () => route());
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !body.classList.contains("intro") && reader.classList.contains("on")) $("#r-back").click(); });

  $$(".enter").forEach((e) => e.addEventListener("animationend", () => e.classList.remove("enter"), { once: true }));
  // the front page opens with the astrolabe drawing itself; any other address opens straight onto its page
  const front = ROUTE.parse().key === "";
  if (!front) window.BOOTROUTE = () => route(true); // once the Arabic layer is in place (src/lib/bundle.ts)
  Intro(() => $("#mark svg"), () => setTimeout(landed, REDUCE ? 0 : 600), !front);
})();
