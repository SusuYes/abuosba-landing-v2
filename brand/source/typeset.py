"""Brand book section 5: text typefaces. Four pairings, each set as the same real page with the B2 small-cut
wordmark in the header, judged on night and day grounds. Every element inside a mock takes its font from that
mock's own variables, so the book's own type cannot leak in."""
import base64

FINAL = 'wordmark-b2/final/'
A = {}
def _uri(p): return 'data:image/svg+xml;base64,' + base64.b64encode(open(p, 'rb').read()).decode()

PAIRS = [
    dict(key='reed', name='Reed pen', fonts='Alegreya · Alegreya Sans SC · Noto Naskh Arabic',
         why="The Latin is drawn with a broad pen, like the nastaliq's reed, so both scripts look written by one hand. Warm and literary.",
         disp="'Alegreya', Georgia, serif", body="'Alegreya', Georgia, serif", label="'Alegreya Sans SC', 'Alegreya', sans-serif",
         ar="'Noto Naskh Arabic', 'Amiri', serif", mono="'Alegreya', Georgia, serif", nav="'Alegreya', Georgia, serif", dw=500, h1=46, bs=19, lh=1.55),
    dict(key='table', name="Navigator's table", fonts='Readex Pro · Martian Mono',
         why="One family designed for Arabic and Latin together, from kufi. Calm and rational like a star table, so the nastaliq is the only calligraphy on the page.",
         disp="'Readex Pro', system-ui, sans-serif", body="'Readex Pro', system-ui, sans-serif", label="'Readex Pro', system-ui, sans-serif",
         ar="'Readex Pro', system-ui, sans-serif", mono="'Martian Mono', ui-monospace, monospace", dw=500, h1=40, bs=17, lh=1.6),
    dict(key='plate', name='Engraved plate', fonts='Instrument Serif · Instrument Sans · Noto Kufi Arabic',
         why="Tall, sharp display letters like the lettering cut into an astrolabe's brass plate, over a plain sans for reading. The most contrast with the nastaliq.",
         disp="'Instrument Serif', Georgia, serif", body="'Instrument Sans', system-ui, sans-serif", label="'Instrument Sans', system-ui, sans-serif",
         ar="'Noto Kufi Arabic', system-ui, sans-serif", mono="'Instrument Sans', system-ui, sans-serif", dw=400, h1=56, bs=17, lh=1.6),
    dict(key='almanac', name='Almanac', fonts='Markazi Text · Fragment Mono',
         why="Carried over from the first pairing round, now judged as reading text rather than as the name. Markazi was drawn for Arabic first, with its Latin made to match, like a bilingual almanac.",
         disp="'Markazi Text', Georgia, serif", body="'Markazi Text', Georgia, serif", label="'Fragment Mono', ui-monospace, monospace",
         ar="'Markazi Text', 'Amiri', serif", mono="'Fragment Mono', ui-monospace, monospace", nav="'Markazi Text', Georgia, serif", dw=600, h1=48, bs=21, lh=1.45),
]

LINK = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
        'family=Alegreya:ital,wght@0,400;0,500;0,700;1,400&family=Alegreya+Sans+SC:wght@500&family=Noto+Naskh+Arabic:wght@400;600'
        '&family=Readex+Pro:wght@300;400;500;600&family=Martian+Mono:wght@400'
        '&family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;500;600&family=Noto+Kufi+Arabic:wght@400;500'
        '&family=Markazi+Text:wght@400;500;600&family=Fragment+Mono&display=swap">')

CSS = '''
.tset{ display:flex; flex-direction:column; gap:28px; } .tset-rest{ display:flex; flex-direction:column; gap:28px; margin-top:18px; }
.tbar{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.tbar button{ font:500 13px 'IBM Plex Mono', ui-monospace, monospace; border:1px solid var(--rule); background:transparent; color:var(--text); border-radius:999px; padding:6px 14px; cursor:pointer; }
.tbar button[aria-pressed="true"]{ background:var(--gold); color:#0f1229; border-color:var(--gold); }
.tbar span{ font:12.5px 'IBM Plex Mono', ui-monospace, monospace; color:var(--muted); }
.tp-head{ display:flex; flex-direction:column; gap:4px; }
.tp-head h3{ font:600 14px 'IBM Plex Mono', ui-monospace, monospace; letter-spacing:.1em; text-transform:uppercase; color:var(--text); margin:0; }
.tp-head .f{ font:12.5px 'IBM Plex Mono', ui-monospace, monospace; color:var(--gold); }
.tp-head p{ margin:0; color:var(--muted); max-width:70ch; font-size:14.5px; }
/* the mock page: its own world, night by default */
.mock{ --g:#161b44; --t:#ece8e0; --m:#a9a6b8; --a:#f0b93a; --b:#b78a3c; --r:rgba(236,232,224,.14);
  background:var(--g); color:var(--t); border-radius:14px; overflow:hidden; border:1px solid var(--rule); transition:background .5s, color .5s; }
.tset.day .mock{ --g:#ece8e0; --t:#1b1a17; --m:#5d5a52; --a:#8a6420; --b:#8a6420; --r:rgba(27,26,23,.14); }
.mock *{ font-family:var(--fbody); }
.mock .wm-d{ display:block; } .mock .wm-l{ display:none; }
.tset.day .mock .wm-d{ display:none; } .tset.day .mock .wm-l{ display:block; }
.mk-hd{ display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:28px; padding:12px 24px; border-bottom:1px solid var(--r); }
.mk-hd .mk-nav.l{ justify-content:flex-end; }
.mk-mk img{ height:56px; width:auto; transform:translateY(-4.2px); }
.mk-sig{ display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
.mk-sig img{ height:36px; width:auto; }
@media (max-width:640px){ .mk-hd{ gap:14px; padding:10px 16px; } .mk-nav{ gap:12px; } .mk-mk img{ height:48px; transform:translateY(-3.6px); } }
.mk-nav{ display:flex; gap:18px; font-family:var(--fnav); font-size:16px; color:var(--t); flex-wrap:wrap; }
.mk-nav span{ font-family:var(--fnav); } .mk-nav .ar{ font-family:var(--far); }
.mk-live{ font-family:var(--fmono); font-size:12px; color:var(--m); font-variant-numeric:tabular-nums; }
.mk-live b{ color:var(--a); font-weight:400; font-family:var(--fmono); }
.mk-main{ display:grid; grid-template-columns:minmax(0,1.35fr) minmax(0,1fr); gap:36px; padding:34px 24px 28px; }
@media (max-width:760px){ .mk-main{ grid-template-columns:1fr; } }
.mk-kick{ font-family:var(--flabel); font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--a); }
.mk-h1{ font-family:var(--fdisp); font-weight:var(--dw); font-size:clamp(30px, 9vw, var(--h1)); line-height:1.05; margin:10px 0 6px; text-wrap:balance; letter-spacing:-.005em; }
.mk-arname{ font-family:var(--far); font-size:22px; color:var(--m); margin:0 0 18px; text-align:left; }
.mk-lede{ font-family:var(--fbody); font-size:calc(var(--bs) + 2px); line-height:1.45; color:var(--t); max-width:34ch; margin:0 0 26px; }
.mk-art h2{ font-family:var(--fdisp); font-weight:var(--dw); font-size:calc(var(--h1) * .58); line-height:1.15; margin:8px 0 4px; }
.mk-art .prov{ font-family:var(--far); font-size:21px; color:var(--a); margin:2px 0 12px; text-align:left; }
.mk-art p{ font-family:var(--fbody); font-size:var(--bs); line-height:var(--lh); max-width:62ch; margin:0 0 12px; }
.mk-art p.ar{ text-align:right; font-family:var(--far); font-size:calc(var(--bs) + 1px); line-height:1.9; }
.mk-side h4{ font-family:var(--flabel); font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--m); margin:0 0 10px; font-weight:500; }
.mk-work{ list-style:none; margin:0 0 26px; padding:0; display:flex; flex-direction:column; }
.mk-work li{ display:grid; grid-template-columns:1fr auto; gap:2px 12px; padding:10px 0; border-top:1px solid var(--r); }
.mk-work .t{ font-family:var(--fdisp); font-weight:var(--dw); font-size:calc(var(--bs) + 3px); }
.mk-work .t.ar{ font-family:var(--far); }
.mk-work .y{ font-family:var(--fmono); font-size:12px; color:var(--m); font-variant-numeric:tabular-nums; }
.mk-work .d{ grid-column:1 / -1; font-family:var(--fbody); font-size:calc(var(--bs) - 2px); color:var(--m); }
.mk-tab{ width:100%; border-collapse:collapse; }
.mock .mk-tab td{ padding:6px 0; border-top:1px solid var(--r); font-family:var(--fbody); font-size:calc(var(--bs) - 2px); color:var(--t); background:transparent; }
.mock h1, .mock h2, .mock p, .mock li, .mock span{ color:inherit; }
.mk-tab td.n{ text-align:right; font-family:var(--fmono); font-size:13px; font-variant-numeric:tabular-nums lining-nums; color:var(--t); }
.mk-ft{ display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; padding:14px 24px; border-top:1px solid var(--r); font-family:var(--fmono); font-size:12px; color:var(--m); font-variant-numeric:tabular-nums; }
.mk-ft span{ font-family:var(--fmono); }
'''

def mock(p, wm_d, wm_l):
    v = (f"--fdisp:{p['disp']}; --fbody:{p['body']}; --flabel:{p['label']}; --far:{p['ar']}; --fmono:{p['mono']}; --fnav:{p.get('nav', p['label'])};"
         f" --dw:{p['dw']}; --h1:{p['h1']}px; --bs:{p['bs']}px; --lh:{p['lh']};")
    return f'''<div class="tp-head"><h3>{p['name']}</h3><span class="f">{p['fonts']}</span><p>{p['why']}</p></div>
<div class="mock" style="{v}">
  <div class="mk-hd"><nav class="mk-nav l"><span>Work</span><span>Notes</span></nav>
    <span class="mk-mk"><img class="wm-d" src="{A['mark_n']}" alt="The Astrolabe of Suhail"><img class="wm-l" src="{A['mark_d']}" alt="The Astrolabe of Suhail"></span>
    <nav class="mk-nav r"><span>About</span><span class="ar" lang="ar">العربية</span></nav></div>
  <div class="mk-main">
    <div class="mk-art">
      <div class="mk-kick">Suhail</div>
      <h1 class="mk-h1">A sky that follows Sana'a</h1>
      <p class="mk-arname" lang="ar" dir="rtl">سهيل</p>
      <p class="mk-lede">It is day on this site when the sun is up over Sana'a, and night when it has set there.</p>
      <div class="mk-kick">Note · 7 August</div>
      <h2>When Suhail rises, the night cools</h2>
      <p class="prov" lang="ar" dir="rtl">إذا طلع سهيل برد الليل</p>
      <p>Suhail is Canopus, the second-brightest star in the night sky after Sirius. Over Yemen it first appears in the dawn sky in early August, low in the south-east, and its rising has long marked the start of the late-summer rains.</p>
      <p class="ar" lang="ar" dir="rtl">سهيل ثاني ألمع نجوم السماء بعد الشِّعرى. يظهر فجرًا في سماء اليمن في أوائل أغسطس، ومعه تبدأ أمطار آخر الصيف.</p>
    </div>
    <aside class="mk-side">
      <h4>Work</h4>
      <ul class="mk-work">
        <li><span class="t">The Astrolabe of Suhail</span><span class="y">2026</span><span class="d">The mark: an astrolabe computed for Sana'a, its star-plate made of سهيل.</span></li>
        <li><span class="t ar" lang="ar">سُهَيْل</span><span class="y">2026</span><span class="d">The wordmark: the star is a vowel.</span></li>
        <li><span class="t">The sky ramp</span><span class="y">2026</span><span class="d">The site's colours follow the sun over Sana'a.</span></li>
      </ul>
      <h4>Suhail over Sana'a</h4>
      <table class="mk-tab"><tbody>
        <tr><td>Rises, bearing</td><td class="n">145.6°</td></tr>
        <tr><td>Highest altitude</td><td class="n">21.9°</td></tr>
        <tr><td>Sets, bearing</td><td class="n">214.4°</td></tr>
        <tr><td>Right ascension</td><td class="n">06h 23m 57s</td></tr>
        <tr><td>Declination</td><td class="n">−52° 41′ 44″</td></tr>
        <tr><td>Magnitude</td><td class="n">−0.74</td></tr>
      </tbody></table>
    </aside>
  </div>
  <div class="mk-ft"><span class="mk-sig"><img class="wm-d" src="{wm_d}" alt="سُهَيْل"><img class="wm-l" src="{wm_l}" alt="سُهَيْل"><span>© 2026 Suhail AbuOsba</span></span>
    <span class="mk-live">Sana'a <b class="js-time">--:--</b> · Suhail <b class="js-alt">--°</b> · 15°22′N 44°11′E</span></div>
</div>'''

JS = '''<script>
(function(){
  var set = document.getElementById('tset'); if(!set) return;
  var bs = set.querySelectorAll('.tbar button');
  bs.forEach(function(b){ b.addEventListener('click', function(){
    set.classList.toggle('day', b.dataset.g === 'day');
    bs.forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
  }); });
  function suhailAlt(d){
    var R = Math.PI/180, jd = d.getTime()/86400000 + 2440587.5, T = jd - 2451545.0;
    var gmst = 280.46061837 + 360.98564736629*T, H = (gmst + 44.19 - 95.988) * R;
    var lat = 15.37*R, dec = -52.696*R;
    return Math.asin(Math.sin(lat)*Math.sin(dec) + Math.cos(lat)*Math.cos(dec)*Math.cos(H)) / R;
  }
  function tick(){
    var d = new Date(), t;
    try { t = d.toLocaleTimeString('en-GB', {timeZone:'Asia/Aden', hour:'2-digit', minute:'2-digit'}); }
    catch(e){ var u = new Date(d.getTime() + 3*3600000); t = ('0'+u.getUTCHours()).slice(-2)+':'+('0'+u.getUTCMinutes()).slice(-2); }
    var a = suhailAlt(d), s = (a < 0 ? '−' : '+') + Math.abs(a).toFixed(0) + '°' + (a > -0.57 ? ' up' : '');
    set.querySelectorAll('.js-time').forEach(function(e){ e.textContent = t; });
    set.querySelectorAll('.js-alt').forEach(function(e){ e.textContent = s; });
  }
  tick(); setInterval(tick, 30000);
})();
</script>'''

SCALE = [  # role, family, size / line-height, weight, use
    ('Display', 'Alegreya', '46 px / 1.05 (32 px on phones)', '500', 'page titles'),
    ('Heading', 'Alegreya', '27 px / 1.15', '500', 'section and note titles'),
    ('Title', 'Alegreya', '22 px / 1.25', '500', 'items in lists, work titles'),
    ('Lede', 'Alegreya', '21 px / 1.45', '400', 'the opening paragraph'),
    ('Body', 'Alegreya', '19 px / 1.55, 62 characters wide', '400', 'reading text; italic for titles of works'),
    ('Small', 'Alegreya', '17 px / 1.5', '400', 'captions, descriptions'),
    ('Label', 'Alegreya Sans SC', '12 px, tracked 0.14 em, capitals', '500', 'kickers, section labels'),
    ('Figures', 'Alegreya', '13 to 17 px, tabular lining figures', '400', 'tables, times, coordinates'),
    ('Arabic body', 'Noto Naskh Arabic', '20 px / 1.9', '400', 'Arabic passages, a size up and more leading than the Latin'),
    ('Arabic display', 'Noto Naskh Arabic', '22 px', '400 to 600', 'the Arabic name, proverbs, Arabic titles'),
]

def section(num=5, chosen='reed'):
    wm_d = _uri(FINAL + 'B2-small-brass-transparent.svg'); wm_l = _uri(FINAL + 'B2-small-ink-transparent.svg')
    A['mark_n'] = _uri('header/mark-small-crop.svg'); A['mark_d'] = _uri('header/mark-day-crop.svg')
    first = next(p for p in PAIRS if p['key'] == chosen)
    rest = ''.join(mock(p, wm_d, wm_l) for p in PAIRS if p['key'] != chosen)
    rows = ''.join(f'<tr><td class="k">{r}</td><td>{f}</td><td class="s">{z}</td><td class="k">{w}</td><td>{u}</td></tr>' for r, f, z, w, u in SCALE)
    return f'''<section class="lk" id="type">
    <header class="phead"><span class="pnum">{num}</span><h2>Text type · Reed pen</h2><span class="rec">Chosen</span></header>
    <p class="idea">Alegreya for Latin, Noto Naskh Arabic for Arabic. Alegreya was designed from broad-pen writing, so its strokes thicken and thin with the pen's angle like the nastaliq's reed, and the page looks written by the same hand as the wordmark. The nastaliq stays the only calligraphy; the Arabic text face is a reading face.</p>
    <div class="tsc-wrap"><table class="tscale"><tbody>{rows}</tbody></table></div>
    <div class="tset" id="tset">
      <div class="tbar"><button data-g="night" aria-pressed="true">Night</button><button data-g="day" aria-pressed="false">Day</button><span>The live time and Suhail's altitude are computed for Sana'a.</span></div>
      {mock(first, wm_d, wm_l)}
      <details class="earlier"><summary>The other three pairings</summary><div class="tset-rest">{rest}</div></details>
    </div>
  </section>'''
