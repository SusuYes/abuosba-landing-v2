"""The landing: it starts with the logo. The astrolabe draws itself from its own stroke data (rim and kursi, horizon
and sky, the letters in writing order, the pointer, the sun, then Suhail with a flash), the rete swings round to
tonight's sky over Sana'a, and only then does the page build (brick band from beneath the logo, qamariya Sunrise,
glazed dividers). Everything is a CSS animation, so it can be checked frame by frame."""
import json, re
import gl2, motion, qd3

FIN = '../musnad/r9/astrolabe/final/'
DRAW = json.load(open('../musnad/r9/astrolabe/bg2/astrolabe-hero-draw.json'))
CROP = '-340 -461 680 801'
WIPES = {'throne': 'l', 'heh': 'r', 'yeh_pointer': 'l'}     # pen-scans become wipes: l = left to right, r = right to left

def schedule(star_first=False):
    """ms timings: strokes {id: (start, dur)}, fades {target: (start, dur)}, wipes {target: (start, dur)}, flash, swing"""
    st, fd, wp = {}, {}, {}
    off = 700 if star_first else 0
    def S(i, t, d): st[i] = (t + off, d)
    def F(i, t, d=250): fd[i] = (t + off, d)
    F('face', 0, 300); S('rim', 0, 550); F('limb', 500)
    F('hours', 450, 300); F('noon_midnight', 480, 300); F('rise-set-marks', 520, 300)
    wp['throne'] = (520 + off, 300)
    S('throne_ring', 650, 250); F('throne_ring', 850); F('pivot', 800, 200)
    S('horizon', 700, 350); F('horizon', 1000)
    F('plate', 900, 400); F('track', 950, 400); F('starfield', 1050, 500)
    t = 1200
    for i in ['seen_body.1', 'seen_tooth_3', 'seen_body.2', 'seen_tooth_2', 'seen_body.3', 'seen_tooth_1', 'seen_body.4']:
        S(i, t, 150)
        if i.startswith('seen_tooth'): F(i, t + 150)
        t += 90
    F('seen_body', 1900)
    S('heh.outline', 1900, 400); wp['heh'] = (2150 + off, 300)
    S('yeh_bowl', 2350, 300); F('yeh_bowl', 2650)
    S('yeh_pointer', 2550, 200); wp['yeh_pointer'] = (2700 + off, 250)
    S('lam_stem', 2800, 150); F('lam_stem', 2950); S('lam_bowl', 2900, 250); F('lam_bowl', 3150)
    F('sun_body', 3050, 300)
    if star_first:
        fd['suhail_star'] = (0, 150); flash = (60, 700); F('trail', 3150, 300)
    else:
        F('trail', 3150, 300); fd['suhail_star'] = (3350, 150); flash = (3380, 700)
    end = max(a + b for a, b in list(st.values()) + list(fd.values()) + list(wp.values()))
    return dict(st=st, fd=fd, wp=wp, flash=flash, swing=(end + 250, 1200))

def fill_of(svg, tid):
    m = re.search(r'<[^>]*id="' + re.escape(tid) + r'"[^>]*>', svg)
    if not m: return '#b78a3c'
    f = re.search(r'fill="([^"]+)"', m.group(0))
    if f and f.group(1) != 'none': return f.group(1)
    rest = svg[m.end():m.end() + 3000]; f = re.search(r'fill="(#[0-9a-fA-F]{3,6})"', rest)
    return f.group(1) if f else '#b78a3c'

def mark(src, prefix, sch, mode='draw'):
    """inline mark with animation hooks. mode 'draw' = the full draw; 'static' = finished, rete held at --swing."""
    svg = open(FIN + src).read()
    svg = re.sub(r'<title>.*?</title>', '', svg, flags=re.S)
    svg = re.sub(r'viewBox="[^"]+"', f'viewBox="{CROP}"', svg, count=1)
    svg = svg.replace('<svg ', f'<svg class="ia-{mode}" aria-hidden="true" ', 1)
    if mode == 'draw':
        def hook(tid, cls, t, d):
            nonlocal svg
            svg = re.sub(r'(<[a-z]+ id="' + re.escape(tid) + r'")', rf'\1 class="{cls}" style="--t0:{t}ms;--d:{d}ms"', svg, count=1)
        # shapes the pen draws are uncovered along the pen's own path (a moving mask), never swapped for an outline
        drawn = {}
        for s in DRAW['strokes']:
            if s['kind'] == 'stroke' and s['id'] in sch['st'] and f'id="{s["target"]}"' in svg:
                drawn.setdefault(s['target'], []).append(s)
        for tid, (t, d) in sch['fd'].items():
            if tid in drawn: continue
            if f'id="{tid}"' in svg: hook(tid, 'tg', t, d)
        for tid, (t, d) in sch['wp'].items():
            if tid in drawn: continue
            if f'id="{tid}"' in svg: hook(tid, 'tw tw-' + WIPES[tid], t, d)
        WIDE = {'heh': 84, 'yeh_pointer': 70}
        masks = []
        for tgt, ss in drawn.items():
            paths, last = [], 0
            for s in ss:
                t, d = sch['st'][s['id']]
                w = WIDE.get(tgt, 1.8 * (max(s['taper']) if s.get('taper') else s['width']))
                paths.append(f'<path class="mkp" pathLength="1" d="{s["d"]}" fill="none" stroke="#fff" stroke-width="{w:.1f}" '
                             f'stroke-linecap="round" stroke-linejoin="round" style="--t0:{t}ms;--d:{d}ms"/>')
                last = max(last, t + d)
            paths.append(f'<rect class="mkr" x="-2000" y="-2000" width="4000" height="4000" fill="#fff" style="--t0:{last}ms;--d:250ms"/>')
            masks.append(f'<mask id="mk-{tgt}" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="4000" height="4000">{"".join(paths)}</mask>')
            svg = re.sub(r'(<[a-z]+ id="' + re.escape(tgt) + r'")', rf'\1 mask="url(#mk-{tgt})"', svg, count=1)
        if '<defs>' in svg: svg = svg.replace('<defs>', '<defs>' + ''.join(masks), 1)
        else: svg = re.sub(r'(<svg[^>]*>)', r'\1<defs>' + ''.join(masks) + '</defs>', svg, count=1)
        plate, rete = [], []
        m = re.search(r'<g id="suhail_star"[^>]*?transform="translate\(([-\d.]+) ([-\d.]+)\)', svg)
        if m:
            ft, fdur = sch['flash']
            rete.append(f'<circle class="fl" cx="{m.group(1)}" cy="{m.group(2)}" r="6" fill="none" stroke="#fff0b8" style="--t0:{ft}ms;--d:{fdur}ms"/>')
        i = svg.index('<g id="rete"'); j = svg.index('>', i) + 1
        # find the rete group's closing tag by depth
        depth, k = 1, j
        while depth:
            a, b = svg.find('<g', k), svg.find('</g>', k)
            if a != -1 and a < b: depth += 1; k = a + 2
            else: depth -= 1; k = b + 4
        svg = svg[:k - 4] + ''.join(rete) + svg[k - 4:]
        svg = svg.replace('</svg>', ''.join(plate) + '</svg>')
        sw0, swd = sch['swing']
        svg = svg.replace('<g id="rete"', f'<g id="rete" class="sw" style="--t0:{sw0}ms;--d:{swd}ms"', 1)
    else:
        svg = svg.replace('<g id="rete"', '<g id="rete" class="sw-hold"', 1)
    # prefix ids so several copies can live on one page
    ids = set(re.findall(r'id="([^"]+)"', svg))
    for x in sorted(ids, key=len, reverse=True):
        svg = svg.replace(f'id="{x}"', f'id="{prefix}{x}"').replace(f'url(#{x})', f'url(#{prefix}{x})').replace(f'href="#{x}"', f'href="#{prefix}{x}"')
    return svg

CSS = '''
@keyframes ia-draw{ 0%{ stroke-dashoffset:1.08 } 100%{ stroke-dashoffset:0 } }
@keyframes ia-out{ from{ opacity:1 } to{ opacity:0 } }
@keyframes ia-wipe-l{ from{ clip-path:inset(0 100% 0 0) } to{ clip-path:inset(0 0 0 0) } }
@keyframes ia-wipe-r{ from{ clip-path:inset(0 0 0 100%) } to{ clip-path:inset(0 0 0 0) } }
@keyframes ia-flash{ 0%{ r:6px; stroke-width:5px; opacity:0 } 6%{ opacity:1 } 100%{ r:52px; stroke-width:0px; opacity:0 } }
@keyframes ia-swing{ from{ transform:rotate(0deg) } to{ transform:rotate(var(--swing, 0deg)) } }
@keyframes ia-settle{ from{ transform:translate(-50%, 0) scale(1) } to{ transform:translate(calc(-50% + var(--tx, 0px)), var(--ty, 0px)) scale(var(--sc, .2)) } }
.ia-draw .tg{ animation:mo-fade var(--d) ease-out both; animation-delay:calc(var(--lg, 0ms) + var(--t0)); }
.ia-draw .tw-l{ animation:ia-wipe-l var(--d) ease-in-out both; animation-delay:calc(var(--lg, 0ms) + var(--t0)); }
.ia-draw .tw-r{ animation:ia-wipe-r var(--d) ease-in-out both; animation-delay:calc(var(--lg, 0ms) + var(--t0)); }
.ia-draw .mkp{ stroke-dasharray:1 3; animation:ia-draw var(--d) ease-in-out both; animation-delay:calc(var(--lg, 0ms) + var(--t0)); }
.ia-draw .mkr{ animation:mo-fade var(--d) ease-out both; animation-delay:calc(var(--lg, 0ms) + var(--t0)); }
.ia-draw .fl{ animation:ia-flash var(--d) ease-out both; animation-delay:calc(var(--lg, 0ms) + var(--t0)); }
.ia-draw .sw{ animation:ia-swing var(--d) cubic-bezier(.45,0,.25,1) both; animation-delay:calc(var(--lg, 0ms) + var(--t0)); }
.ia-static .sw-hold{ transform:rotate(var(--swing, 0deg)); }
/* the header slot holds inline marks instead of the background image */
.ia-page .gl-mark{ background:none !important; position:relative; }
.ia-page .gl-mark svg{ position:absolute; inset:0; width:100%; height:100%; display:block; }
.ia-page .m-day{ display:none; } .gl.day .ia-page .m-day{ display:block; } .gl.day .ia-page .m-night{ display:none; }
/* option 2: the large mark, then it settles into the header */
.ia-big{ position:absolute; left:50%; top:120px; width:300px; transform-origin:top left; z-index:3;
  animation:ia-settle .9s cubic-bezier(.5,0,.2,1) both, ia-out .2s linear forwards; animation-delay:var(--st0), calc(var(--st0) + 900ms); }
.ia-big svg{ width:100%; height:auto; display:block; }
.ia-big .m-day{ display:none; } .gl.day .ia-big .m-day{ display:block; } .gl.day .ia-big .m-night{ display:none; }
.ia-L2 .gl-mark{ animation:mo-fade .2s linear both; animation-delay:calc(var(--st0) + 900ms); }
.ia-L2 .gl-hd nav, .ia-L2 .gl-main, .ia-L2 .gl-ft{ animation:mo-fade .6s ease-out both; animation-delay:calc(var(--st0) + 500ms); }
.ia-tabs{ display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
'''

OPTS = [
    dict(k='L1', name='In place', why="The astrolabe draws itself right where it lives, in the header; its star-plate swings round to tonight's sky; then the brick band opens out from beneath it and the page builds: the qamariya's sunrise, then the glazed divider. About 9 s in all; the text is readable from the start."),
    dict(k='L2', name='Large, then settle', why="The page opens empty with the astrolabe drawing itself large in the middle. Once it has swung to tonight's sky, it glides up and shrinks into its place in the header, the page fades in around it, and then builds. The most ceremonial: about 11 s."),
    dict(k='L3', name='Suhail first', why="The page opens on a single point of light: Suhail, with its flash. Then the astrolabe draws itself around the star, swings to tonight's sky, and the page builds. The site begins with the star it is named for. About 9.5 s."),
]

def page(o):
    k = o['k']; star_first = (k == 'L3')
    sch = schedule(star_first)
    pg = sch['swing'][0] + sch['swing'][1] - 300            # the page starts as the swing settles
    qam = next(d for d in gl2.DIRS if d['key'] == 'qam')
    div = motion.DIV_NOTES
    extra = f'qv mo-page mo-qB mo-dB ia-page ia-{k}'
    html = gl2.page(qam, extra_cls=extra, div_html=div, band_html='<div class="qc"></div>', shown=(k == 'L1'), dk=k)
    if k == 'L2':
        st0 = pg                                                # settle when the big mark has swung
        pg2 = st0 + 1100
        slot = f'<span class="gl-mark ia-hold" role="img" aria-label="The Astrolabe of Suhail"><span class="m-night">{mark("mark.svg", k + "hn", sch, "static")}</span><span class="m-day">{mark("mark-day.svg", k + "hd", sch, "static")}</span></span>'
        big = f'<div class="ia-big"><span class="m-night">{mark("mark.svg", k + "bn", sch)}</span><span class="m-day">{mark("mark-day.svg", k + "bd", sch)}</span></div>'
        vars_ = f'--st0:{st0}ms;--pg:{pg2}ms;--dd:{pg2 + 2600}ms'
    else:
        slot = f'<span class="gl-mark" role="img" aria-label="The Astrolabe of Suhail"><span class="m-night">{mark("mark-small.svg", k + "hn", sch)}</span><span class="m-day">{mark("mark-day.svg", k + "hd", sch)}</span></span>'
        big = ''
        vars_ = f'--pg:{pg}ms;--dd:{pg + 2600}ms'
    html = html.replace('<i class="gl-mark" role="img" aria-label="The Astrolabe of Suhail"></i>', slot, 1)
    html = html.replace('<div class="glm', f'<div data-mo style="{vars_}" class="glm', 1)
    html = html.replace('<div class="gl-bg"></div>', '<div class="gl-bg"></div>' + big, 1)
    return html

def section():
    tabs = ''.join(f'<button data-k="{o["k"]}" aria-pressed="{"true" if i == 0 else "false"}">{i + 1} · {o["name"]}</button>' for i, o in enumerate(OPTS))
    reads = ''.join(f'<div class="gl-read" data-k="{o["k"]}"{"" if i == 0 else " hidden"}><h3>{i + 1} · {o["name"]}</h3><p>{o["why"]}</p></div>' for i, o in enumerate(OPTS))
    pages = ''.join(page(o) for o in OPTS)
    return f'''<div class="gl gl2 mo-g ia-root" id="ia">
      <div class="gl-tabs">{tabs}<span class="sep"></span><button class="mo-replay" data-replay="ia">Replay</button><span class="sep"></span><button data-g="night" aria-pressed="true">Night</button><button data-g="day" aria-pressed="false">Day</button></div>
      {reads}
      {pages}
    </div>'''

JS = '''<script>
document.querySelectorAll('.ia-root').forEach(function(root){
  function swing(){
    var n = Date.now()/86400000 + 2440587.5 - 2451545.0, lst = (280.46061837 + 360.98564736629*n + 44.19) % 360;
    var a = ((lst - 164.84) % 360 + 540) % 360 - 180;
    root.querySelectorAll('.glm').forEach(function(p){ p.style.setProperty('--swing', a.toFixed(2) + 'deg'); });
  }
  function geom(){
    root.querySelectorAll('.ia-L2').forEach(function(p){
      var big = p.querySelector('.ia-big'), slot = p.querySelector('.gl-mark');
      if (!big || !slot || p.hidden) return;
      var pr = p.getBoundingClientRect(), sr = slot.getBoundingClientRect(), bw = big.offsetWidth;
      var bx = pr.width / 2 - bw / 2, by = 120;
      var sc = sr.width / bw;
      big.style.setProperty('--sc', sc.toFixed(4));
      big.style.setProperty('--tx', (sr.left - pr.left - bx) + 'px');
      big.style.setProperty('--ty', (sr.top - pr.top - by) + 'px');
      big.style.setProperty('--txc', (sr.left + sr.width / 2 - pr.left - pr.width / 2) + 'px');
    });
  }
  swing(); geom(); addEventListener('resize', geom);
  root.querySelectorAll('.gl-tabs button[data-k]').forEach(function(b){ b.addEventListener('click', function(){
    setTimeout(function(){ geom(); var p = root.querySelector('.glm[data-k="' + b.dataset.k + '"]');
      if (p) { p.classList.add('run'); p.getAnimations({subtree:true}).forEach(function(a){ a.cancel(); a.play(); }); } }, 0);
  }); });
});
</script>'''

# ---------------- "Large, then settle": five ways ----------------
VARIANTS = [
    dict(v='A', name='Glide', settle=900,
         why="The version you saw: the astrolabe draws large in the middle of an empty page, swings to tonight's sky, glides up and shrinks into the header, and the page fades in around it."),
    dict(v='B', name='Hoisted', settle=1700,
         why="An astrolabe hangs from its ring. Here it is lifted up into the header by its ring, swaying as it rises and swinging gently once it arrives, then coming to rest; the page fades in beneath it."),
    dict(v='C', name='The page rises', settle=900,
         why="The logo shrinks into its place while the whole page rises up from below to meet it, as if the site slid into place under the instrument."),
    dict(v='D', name='Wakes to the sky', settle=900,
         why="The page always opens at night. As the logo settles, if it is day in Sana'a, the ground wakes through twilight and a copper dawn into day, and the astrolabe's face changes with it. Best seen with Day on; at night it stays night."),
    dict(v='E', name='Close on the letters', settle=900,
         why="A camera move: the rim and sky are drawn at full view, then the view closes in while the letters س ه ي ل are written large, pulls back for Suhail's flash and the swing, then glides into the header."),
]

CSS2 = '''
@keyframes ia-hoist{
  0%{ transform:translate(-50%, 0) scale(1) rotate(0deg) }
  30%{ transform:translate(calc(-50% + var(--txc) * .35), calc(var(--ty) * .35)) scale(calc(1 - (1 - var(--sc)) * .35)) rotate(-4deg) }
  62%{ transform:translate(calc(-50% + var(--txc)), var(--ty)) scale(var(--sc)) rotate(5deg) }
  74%{ transform:translate(calc(-50% + var(--txc)), var(--ty)) scale(var(--sc)) rotate(-3deg) }
  85%{ transform:translate(calc(-50% + var(--txc)), var(--ty)) scale(var(--sc)) rotate(1.5deg) }
  93%{ transform:translate(calc(-50% + var(--txc)), var(--ty)) scale(var(--sc)) rotate(-.6deg) }
  100%{ transform:translate(calc(-50% + var(--txc)), var(--ty)) scale(var(--sc)) rotate(0deg) } }
@keyframes ia-rise{ from{ transform:translateY(520px) } to{ transform:none } }
@keyframes ia-wake{ 0%{ background-color:#161b44 } 35%{ background-color:#33295e } 62%{ background-color:#5b2915 } 100%{ background-color:#ece8e0 } }
@keyframes ia-cam{ 0%, 27%{ transform:scale(1) } 38%, 83%{ transform:scale(3.6) } 96%, 100%{ transform:scale(1) } }
.ia-v .ia-big{ animation-delay:var(--st0), var(--sw); }
.ia-v .gl-mark{ animation-delay:var(--sw) !important; }
.ia-v-B .ia-big{ transform-origin:50% 0; animation:ia-hoist var(--sd) cubic-bezier(.4,0,.3,1) both, ia-out .2s linear forwards; animation-delay:var(--st0), var(--sw); }
.ia-v-C .gl-hd nav, .ia-v-C .gl-main, .ia-v-C .gl-ft{ animation:ia-rise .9s cubic-bezier(.2,.75,.2,1) both, mo-fade .5s ease-out both !important;
  animation-delay:var(--st0), var(--st0) !important; }
.gl.day .ia-v-D{ animation:ia-wake 1.4s ease-in-out both; animation-delay:calc(var(--st0) - 200ms); }
.gl.day .ia-v-D .gl-hd nav, .gl.day .ia-v-D .gl-main, .gl.day .ia-v-D .gl-ft{ animation-delay:calc(var(--st0) + 1100ms) !important; }
.gl.day .ia-v-D .ia-big .m-night{ display:block; }
.gl.day .ia-v-D .ia-big .m-day{ display:block; position:absolute; inset:0; animation:mo-fade .8s ease-in-out both; animation-delay:calc(var(--st0) + 300ms); }
.ia-v-D .ia-big{ position:absolute; }
.ia-cam{ transform-origin:52.5% 56.5%; animation:ia-cam var(--cd) cubic-bezier(.45,0,.25,1) both; animation-delay:var(--lg, 0ms); }
'''

def page_v(o, shown):
    v = o['v']; sch = schedule(False)
    st0 = sch['swing'][0] + sch['swing'][1] - 300
    sw = st0 + o['settle']; pg2 = sw + 200
    qam = next(d for d in gl2.DIRS if d['key'] == 'qam')
    extra = f'qv mo-page mo-qB mo-dB ia-page ia-L2 ia-v ia-v-{v}'
    html = gl2.page(qam, extra_cls=extra, div_html=motion.DIV_NOTES, band_html='<div class="qc"></div>', shown=shown, dk='S' + v)
    p = 'S' + v
    slot = (f'<span class="gl-mark ia-hold" role="img" aria-label="The Astrolabe of Suhail"><span class="m-night">{mark("mark.svg", p + "hn", sch, "static")}</span>'
            f'<span class="m-day">{mark("mark-day.svg", p + "hd", sch, "static")}</span></span>')
    inner = f'<span class="m-night">{mark("mark.svg", p + "bn", sch)}</span><span class="m-day">{mark("mark-day.svg", p + "bd", sch)}</span>'
    if v == 'E': inner = f'<div class="ia-cam">{inner}</div>'
    big = f'<div class="ia-big">{inner}</div>'
    cd = sch['swing'][0] - 100
    vars_ = f'--st0:{st0}ms;--sw:{sw}ms;--sd:{o["settle"]}ms;--pg:{pg2}ms;--dd:{pg2 + 2600}ms;--cd:{cd}ms'
    html = html.replace('<i class="gl-mark" role="img" aria-label="The Astrolabe of Suhail"></i>', slot, 1)
    html = html.replace('<div class="glm', f'<div data-mo style="{vars_}" class="glm', 1)
    html = html.replace('<div class="gl-bg"></div>', '<div class="gl-bg"></div>' + big, 1)
    return html

def section2():
    tabs = ''.join(f'<button data-k="S{o["v"]}" aria-pressed="{"true" if i == 0 else "false"}">{o["v"]} · {o["name"]}</button>' for i, o in enumerate(VARIANTS))
    reads = ''.join(f'<div class="gl-read" data-k="S{o["v"]}"{"" if i == 0 else " hidden"}><h3>{o["v"]} · {o["name"]}</h3><p>{o["why"]}</p></div>' for i, o in enumerate(VARIANTS))
    pages = ''.join(page_v(o, i == 0) for i, o in enumerate(VARIANTS))
    return f'''<div class="gl gl2 mo-g ia-root" id="ia2">
      <div class="gl-tabs">{tabs}<span class="sep"></span><button class="mo-replay" data-replay="ia2">Replay</button><span class="sep"></span><button data-g="night" aria-pressed="true">Night</button><button data-g="day" aria-pressed="false">Day</button></div>
      {reads}
      {pages}
    </div>'''

# ---------------- Hoisted, simulated: a pendulum on its ring, driven by the hand that lifts it ----------------
import hoist_sim
HOIST = [
    dict(v='HA', path='arc', page='builds', name='Arc · page builds',
         why="The astrolabe is lifted along a gentle curve. Because it hangs from its ring, it lags behind the hand as it is carried, swings through as the hand slows, and settles; the swing is simulated as a real pendulum, so it always follows the direction it came from. Then the page builds (Sunrise, Glazed)."),
    dict(v='HS', path='straight', page='builds', name='Straight · page builds',
         why="Lifted straight up. A load lifted straight up doesn't swing sideways, so it doesn't: instead it bobs once on its cord as the hand stops, and settles. Then the page builds."),
    dict(v='HA2', path='arc', page='appears', name='Arc · page appears',
         why="The same arc and swing, but nothing else animates: while the astrolabe is being hoisted, the whole page, qamariya and dividers already complete, fades in behind it."),
    dict(v='HS2', path='straight', page='appears', name='Straight · page appears',
         why="Lifted straight up with the bob on its cord, and the finished page fades in behind it. The quietest: only the logo moves."),
]
HOIST_MS = int(hoist_sim.T_TOTAL * 1000)
CSS3 = (hoist_sim.keyframes('ia-hoist-arc', 'arc') + '\n' + hoist_sim.keyframes('ia-hoist-straight', 'straight') + '''
.ia-h .ia-big{ transform-origin:50% 0; animation-timing-function:linear, linear !important; }
.ia-h-arc .ia-big{ animation:ia-hoist-arc var(--sd) linear both, ia-out .2s linear forwards; animation-delay:var(--st0), var(--sw); }
.ia-h-straight .ia-big{ animation:ia-hoist-straight var(--sd) linear both, ia-out .2s linear forwards; animation-delay:var(--st0), var(--sw); }
.ia-h-appears .gl-hd nav, .ia-h-appears .gl-prog, .ia-h-appears .gl-main, .ia-h-appears .gl-ft{ animation:mo-fade .9s ease-out both !important; animation-delay:calc(var(--st0) + 250ms) !important; }
''')

def page_h(o, shown):
    v = o['v']; sch = schedule(False)
    st0 = sch['swing'][0] + sch['swing'][1] - 300
    sw = st0 + HOIST_MS; pg2 = sw + 200
    qam = next(d for d in gl2.DIRS if d['key'] == 'qam')
    builds = o['page'] == 'builds'
    extra = f'qv ia-page ia-L2 ia-v ia-h ia-h-{o["path"]} ia-h-{o["page"]}' + (' mo-page mo-qB mo-dB' if builds else '')
    html = gl2.page(qam, extra_cls=extra, div_html=motion.DIV_NOTES, band_html='<div class="qc"></div>', shown=shown, dk=v)
    p = v
    slot = (f'<span class="gl-mark ia-hold" role="img" aria-label="The Astrolabe of Suhail"><span class="m-night">{mark("mark.svg", p + "hn", sch, "static")}</span>'
            f'<span class="m-day">{mark("mark-day.svg", p + "hd", sch, "static")}</span></span>')
    big = f'<div class="ia-big"><span class="m-night">{mark("mark.svg", p + "bn", sch)}</span><span class="m-day">{mark("mark-day.svg", p + "bd", sch)}</span></div>'
    vars_ = f'--st0:{st0}ms;--sw:{sw}ms;--sd:{HOIST_MS}ms;--pg:{pg2}ms;--dd:{pg2 + 2600}ms'
    html = html.replace('<i class="gl-mark" role="img" aria-label="The Astrolabe of Suhail"></i>', slot, 1)
    html = html.replace('<div class="glm', f'<div data-mo style="{vars_}" class="glm', 1)
    html = html.replace('<div class="gl-bg"></div>', '<div class="gl-bg"></div>' + big, 1)
    return html

def section3():
    order = [HOIST[2]] + [h for h in HOIST if h is not HOIST[2]]
    tabs = ''.join(f'<button data-k="{o["v"]}" aria-pressed="{"true" if i == 0 else "false"}">{"Chosen · " if i == 0 else ""}{o["name"]}</button>' for i, o in enumerate(order))
    reads = ''.join(f'<div class="gl-read" data-k="{o["v"]}"{"" if i == 0 else " hidden"}><h3>{o["name"]}</h3><p>{o["why"]}</p></div>' for i, o in enumerate(order))
    pages = ''.join(page_h(o, i == 0) for i, o in enumerate(order))
    return f'''<div class="gl gl2 mo-g ia-root" id="ia3">
      <div class="gl-tabs">{tabs}<span class="sep"></span><button class="mo-replay" data-replay="ia3">Replay</button><span class="sep"></span><button data-g="night" aria-pressed="true">Night</button><button data-g="day" aria-pressed="false">Day</button></div>
      {reads}
      {pages}
    </div>'''
