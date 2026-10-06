"""Motion, round 1. Every animated piece starts from nothing and grows into place (draws, fades, rises, fills);
nothing is visible before its own animation starts, and animations sit paused at their first frame until the
stage scrolls into view, so nothing pops in. Reduced-motion viewers get the finished state."""
import re
import gl2, qd3
from gl2 import qamariya, GOLD

def tag_panes(html):
    """number the glass panes (0 = rightmost = first letter, since Musnad runs right to left)"""
    n = iter(range(100))
    return re.sub(r'class="pane"( style="[^"]*)"', lambda m: f'class="pane"{m.group(1)};--i:{next(n)}"', html)

DIV_NOTES = tag_panes(qd3.div_caption(qd3.SECTIONS[1]))

QOPTS = [
    dict(k='qA', name='Tracery, then light', why="The gypsum frame is drawn first (the outer arch and base, then the spokes and inner rings), and then light fills the glass from the centre outward, ring by ring. About 2.2 s."),
    dict(k='qB', name='Sunrise', why="The frame draws quickly, then the glass lights in a sweep from left to right, like the sun crossing the window; the centre lights last. About 2.4 s."),
    dict(k='qC', name='Lamplit', why="The frame draws, then the panes light one at a time in a scattered order, like windows coming on across the city at dusk. About 2.6 s."),
]
DOPTS = [
    dict(k='dA', name='Inscribed', why="The two rules grow outward from the centre, the word-divider bars rise, then the panes appear right to left, the way Musnad is read, each letter settling into its glass; the caption comes last. About 1.6 s."),
    dict(k='dB', name='Glazed', why="The rules and bars draw, then each pane fills with colour from the bottom up, like glass being set, right to left; the letters appear once their pane is full. About 1.7 s."),
    dict(k='dC', name='Quiet', why="The divider fades in as one piece, then the letters and caption follow. The least motion. About 1 s."),
]

CSS = '''
@keyframes mo-draw{ 0%{ stroke-dashoffset:1.08 } 100%{ stroke-dashoffset:0 } }
@keyframes mo-fade{ from{ opacity:0 } to{ opacity:1 } }
@keyframes mo-rise{ from{ opacity:0; transform:translateY(7px) } to{ opacity:1; transform:none } }
@keyframes mo-grow{ from{ transform:scaleX(0) } to{ transform:scaleX(1) } }
@keyframes mo-barup{ from{ transform:scaleY(0) } to{ transform:scaleY(1) } }
@keyframes mo-glaze{ from{ clip-path:inset(100% 0 0 0) } to{ clip-path:inset(0 0 0 0) } }
@keyframes mo-band{ from{ clip-path:inset(0 50% 0 50%) } to{ clip-path:inset(0 0 0 0) } }
@keyframes mo-glow{ from{ filter:drop-shadow(0 0 0 rgba(240,185,58,0)) } to{ filter:drop-shadow(0 0 10px rgba(240,185,58,.35)) } }
[data-mo] *, [data-mo] *::before, [data-mo] *::after{ animation-play-state:paused; }
[data-mo].run *, [data-mo].run *::before, [data-mo].run *::after{ animation-play-state:running; }

/* ---- qamariya: the frame (all options) ---- */
.mo-qA .gl-gyp > *, .mo-qB .gl-gyp > *, .mo-qC .gl-gyp > *{ stroke-dasharray:1 3; animation:mo-draw .9s cubic-bezier(.45,0,.2,1) both; }
.mo-qA .gl-gyp > *{ animation-delay:calc(var(--t) * 1ms); }
.mo-qB .gl-gyp > *, .mo-qC .gl-gyp > *{ animation-duration:.7s; animation-delay:calc(var(--pg, 0ms) + var(--t) * .5ms); }
/* qamariya: the glass */
.mo-qA .gl-glass{ animation:mo-fade .3s cubic-bezier(.2,.8,.3,1) both; animation-delay:calc(1000ms + var(--r) * 260ms + var(--a) * 30ms); }
.mo-qB .gl-glass{ animation:mo-fade .3s cubic-bezier(.2,.8,.3,1) both; animation-delay:calc(var(--pg, 0ms) + 800ms + var(--a) * 150ms + var(--r) * 40ms); }
.mo-qB .gl-glass[style*="--r:0"]{ animation-delay:calc(var(--pg, 0ms) + 2000ms); }
.mo-qC .gl-glass{ animation:mo-fade .35s cubic-bezier(.2,.8,.3,1) both; animation-delay:calc(800ms + var(--s) * 105ms); }
.gl2:not(.day) .mo-qA .qam-big, .gl2:not(.day) .mo-qB .qam-big, .gl2:not(.day) .mo-qC .qam-big{ animation:mo-glow 1s ease-out both; animation-delay:calc(var(--pg, 0ms) + 1900ms); }
.gl2.day [data-mo] .qam-big{ filter:none; }

/* ---- section divider ---- */
.mo-dA .rl, .mo-dB .rl{ animation:mo-grow .6s cubic-bezier(.3,0,.2,1) both; animation-delay:var(--dd, 0ms); }
.mo-dA .qg > .rl:first-child, .mo-dB .qg > .rl:first-child{ transform-origin:right center; }
.mo-dA .qg > .rl:last-child, .mo-dB .qg > .rl:last-child{ transform-origin:left center; }
.mo-dA .bar, .mo-dB .bar{ transform-origin:bottom center; animation:mo-barup .35s ease-out both; animation-delay:calc(var(--dd, 0ms) + 400ms); }
.mo-dA .pane{ animation:mo-rise .45s cubic-bezier(.3,0,.2,1) both; animation-delay:calc(var(--dd, 0ms) + 650ms + var(--i) * 130ms); }
.mo-dA .pane span{ animation:mo-fade .35s ease-out both; animation-delay:calc(var(--dd, 0ms) + 900ms + var(--i) * 130ms); }
.mo-dB .pane{ position:relative; background:transparent; box-shadow:none !important; animation:mo-fade .25s ease-out both; animation-delay:calc(var(--dd, 0ms) + 600ms + var(--i) * 120ms); }
.mo-dB .pane::before{ content:""; position:absolute; inset:0; border-radius:14px 14px 0 0; background:var(--c); animation:mo-glaze .45s cubic-bezier(.4,0,.2,1) both; animation-delay:calc(var(--dd, 0ms) + 700ms + var(--i) * 120ms); }
.mo-dB .pane span{ position:relative; animation:mo-fade .3s ease-out both; animation-delay:calc(var(--dd, 0ms) + 1150ms + var(--i) * 120ms); }
.mo-dA .gloss, .mo-dB .gloss{ animation:mo-fade .5s ease-out both; animation-delay:calc(var(--dd, 0ms) + 1350ms); }
.mo-dC .qg{ animation:mo-fade .6s ease-out both; }
.mo-dC .pane span, .mo-dC .gloss{ animation:mo-fade .4s ease-out both; animation-delay:.55s; }

/* ---- page load: band from the centre, bullets after; the divider waits for the qamariya ---- */
.mo-page{ --dd:1700ms; }
.mo-page .gl-prog .qc{ animation:mo-band .9s cubic-bezier(.4,0,.2,1) both; animation-delay:calc(var(--pg, 0ms) + 100ms); }
.mo-page .gl-mk svg{ animation:mo-fade .4s ease-out both; animation-delay:calc(var(--pg, 0ms) + 1200ms + var(--li, 0) * 120ms); }
.mo-page li:nth-child(2){ --li:1; } .mo-page li:nth-child(3){ --li:2; }

@media (prefers-reduced-motion: reduce){ [data-mo] *, [data-mo] *::before, [data-mo] *::after{ animation:none !important; } }

/* stage chrome */
.mo{ display:flex; flex-direction:column; gap:26px; }
.mo-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr)); gap:14px; }
.mo-grid.wide{ grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr)); }
.mo-card{ display:flex; flex-direction:column; gap:8px; }
.mo-card h4{ font:600 13px 'IBM Plex Mono', ui-monospace, monospace; letter-spacing:.08em; text-transform:uppercase; color:var(--text); margin:0; }
.mo-card p{ margin:0; color:var(--muted); font-size:14px; }
.mo-stage{ border-radius:12px; padding:22px 18px; display:flex; align-items:center; justify-content:center; min-height:150px; }
.mo-stage .qam-big{ width:100%; max-width:300px; height:auto; display:block; }
.mo-stage .qdv-d{ width:100%; }
.mo-replay{ align-self:flex-start; font:500 12.5px 'IBM Plex Mono', ui-monospace, monospace; border:1px solid var(--rule); background:transparent; color:var(--text); border-radius:999px; padding:5px 12px; cursor:pointer; }
'''

def stage(cls, inner, ground='glm qv'):
    return f'<div class="gl gl2 mo-g"><div class="{ground} mo-stage {cls}" data-mo>{inner}</div></div>'

def section(intro_html='', intro_old='', intro_older=''):
    qcards = ''.join(f'''<div class="mo-card"><h4>{i} · {o["name"]}</h4>{stage("mo-" + o["k"], qamariya())}<button class="mo-replay">Replay</button><p>{o["why"]}</p></div>'''
                     for i, o in enumerate(QOPTS, 1))
    dcards = ''.join(f'''<div class="mo-card"><h4>{i} · {o["name"]}</h4>{stage("mo-" + o["k"], DIV_NOTES)}<button class="mo-replay">Replay</button><p>{o["why"]}</p></div>'''
                     for i, o in enumerate(DOPTS, 1))
    qB, dB = QOPTS[1], DOPTS[1]
    chosen = f'''<div class="mo-grid wide">
        <div class="mo-card"><h4>Qamariya · Sunrise <span class="rec">Chosen</span></h4>{stage("mo-qB", qamariya())}<button class="mo-replay">Replay</button><p>{qB["why"]}</p></div>
        <div class="mo-card"><h4>Section divider · Glazed <span class="rec">Chosen</span></h4>{stage("mo-dB", DIV_NOTES)}<button class="mo-replay">Replay</button><p>{dB["why"]}</p></div></div>'''
    return f'''<section class="lk" id="motion">
    <header class="phead"><span class="pnum">New</span><h2>Motion · the landing</h2><span class="rec">Chosen</span></header>
    <p class="idea"><b>Chosen.</b> On a visitor's first landing the astrolabe draws itself large in the middle of the page: the pen uncovers its true shapes (rim and kursī, horizon and sky, the letters س ه ي ل in writing order, the pointer, the sun, then Suhail with a flash). Its star-plate swings round to tonight's real sky over Sana'a, then it is hoisted by its ring along a gentle arc into the header, swinging and settling as a real pendulum would (simulated, not keyed), while the finished page fades in behind it. Later sections animate as they scroll into view: the qamariya's Sunrise and the Glazed dividers. Later visits open straight to the finished page; visitors who switch off motion always do.</p>
    <div class="mo">
      <div><h3 class="tk">The landing · Hoisted on an arc, the page appears behind it</h3>{intro_html}</div>
      <details class="earlier"><summary>Large, then settle: the five ways (glide, hoisted, page rises, wakes, close on the letters)</summary><div style="margin-top:14px">{intro_old}</div></details>
      <details class="earlier"><summary>The three ways to begin with the logo (in place, large then settle, Suhail first)</summary><div style="margin-top:14px">{intro_older}</div></details>
      <div><h3 class="tk">Your choices</h3>{chosen}</div>
      <details class="earlier"><summary>Round 1: all six options and the first page sequence</summary>
        <div class="mo" style="margin-top:14px">
        <div><h3 class="tk">The qamariya · three ways to come alive</h3><div class="mo-grid">{qcards}</div></div>
        <div><h3 class="tk">The section divider · three ways to appear</h3><div class="mo-grid wide">{dcards}</div></div></div></details>
    </div>
  </section>'''

JS = '''<script>
(function(){
  var stages = document.querySelectorAll('[data-mo]');
  function play(el){ el.classList.add('run'); }
  function replay(el){
    el.classList.add('run');
    el.getAnimations({subtree:true}).forEach(function(a){ a.cancel(); a.play(); });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { play(e.target); io.unobserve(e.target); } }); }, {threshold:.35});
    stages.forEach(function(s){ io.observe(s); });
  } else { stages.forEach(play); }
  setTimeout(function(){ stages.forEach(function(s){ var r = s.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) play(s); }); }, 1500);
  document.querySelectorAll('.mo-replay').forEach(function(b){ b.addEventListener('click', function(){
    var t = b.dataset.replay ? document.querySelector('#' + b.dataset.replay + ' [data-mo]:not([hidden])') : b.parentNode.querySelector('[data-mo]');
    if (t) replay(t);
  }); });
})();
</script>'''
