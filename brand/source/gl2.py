"""Graphic language round 2: Sana'a architecture and writing, rich. The sky stays in the header (the astrolabe);
the page below is the city and its writing. Same page as section 5, built on gl.py's base page styles."""
import math
from gl import b64, mask

LINK = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Old+South+Arabian'
        '&family=Noto+Kufi+Arabic:wght@500;700&display=swap">')

GYP = '#f4efe6'          # gypsum white
RED = '#b8432c'          # qamariya red glass (proposed addition)
BLUE = '#2d5a94'         # the palette's day sky, as blue glass
GOLD, GEM, BRASS = '#f0b93a', '#fff0b8', '#b78a3c'
def gv(c):
    """glass colour as a themeable variable (blue and golds follow the logo)"""
    return {BLUE: 'var(--gb, #2d5a94)', GOLD: 'var(--gg, #b78a3c)', GEM: 'var(--gp, #efcb94)'}.get(c, c)

MUSNAD = '𐩪𐩠𐩺𐩡'          # سهيل in Musnad (s, h, y, l; written right to left)

# ---------- qamariya ----------
def qamariya(w=520, h=150, cls='qam-big'):
    """a semicircular fanlight: gypsum tracery (two rings, radial bars) holding yellow, red, blue and pale glass.
    The glass runs under the tracery's strokes so no ground shows between pane and frame. Each piece carries
    motion variables: glass --r (ring: 0 centre, 1 inner, 2 outer), --a (angle index, 0 = left end), --s (scatter
    order); tracery --t (draw delay, ms)."""
    R = 100.0; cx, cy = 100.0, 102.0
    cols = [GOLD, RED, BLUE, GEM, RED, GOLD, BLUE, GEM]
    o = [f'<svg class="{cls}" viewBox="-4 -4 208 110" preserveAspectRatio="xMidYMax meet" aria-hidden="true">']
    def arc_cell(r1, r2, a1, a2, col, ring, k):
        p1 = (cx + r1 * math.cos(a1), cy - r1 * math.sin(a1)); p2 = (cx + r2 * math.cos(a1), cy - r2 * math.sin(a1))
        p3 = (cx + r2 * math.cos(a2), cy - r2 * math.sin(a2)); p4 = (cx + r1 * math.cos(a2), cy - r1 * math.sin(a2))
        sc = (k * 5 + ring * 3) % 16
        fs = {BLUE: ';fill:var(--gb, #2d5a94)', GOLD: ';fill:var(--gg, #f0b93a)', GEM: ';fill:var(--gp, #fff0b8)'}.get(col, '')
        return (f'<path class="gl-glass" style="--r:{ring};--a:{k};--s:{sc}{fs}" d="M{p1[0]:.2f},{p1[1]:.2f} L{p2[0]:.2f},{p2[1]:.2f} A{r2},{r2} 0 0 0 {p3[0]:.2f},{p3[1]:.2f} '
                f'L{p4[0]:.2f},{p4[1]:.2f} A{r1},{r1} 0 0 1 {p1[0]:.2f},{p1[1]:.2f}Z" fill="{col}"/>')
    n = 8
    for i in range(n):
        a1, a2 = math.pi * i / n, math.pi * (i + 1) / n
        k = n - 1 - i                      # angle index counted from the left end
        o.append(arc_cell(62, 100, a1, a2, cols[i], 2, k))
        o.append(arc_cell(26, 62, a1, a2, cols[(i + 3) % 8], 1, k))
    o.append(f'<path class="gl-glass" style="--r:0;--a:3.5;--s:8;fill:var(--gg, #f0b93a)" d="M{cx - 26},{cy} A26,26 0 0 1 {cx + 26},{cy}Z" fill="{GOLD}"/>')
    def arc(r, t): return f'<path pathLength="1" style="--t:{t}" d="M{cx - r},{cy} A{r},{r} 0 0 1 {cx + r},{cy}"/>'
    tr = [arc(R, 0), f'<line pathLength="1" style="--t:0" x1="{cx - R}" y1="{cy}" x2="{cx + R}" y2="{cy}"/>', arc(62, 260), arc(26, 420)]
    for i in range(1, n):
        a = math.pi * i / n
        tr.append(f'<line pathLength="1" style="--t:{300 + 45 * i}" x1="{cx + 26 * math.cos(a):.2f}" y1="{cy - 26 * math.sin(a):.2f}" x2="{cx + R * math.cos(a):.2f}" y2="{cy - R * math.sin(a):.2f}"/>')
    o.append(f'<g class="gl-gyp" fill="none" stroke-width="5" stroke-linecap="round">{"".join(tr)}</g></svg>')
    return ''.join(o)

def round_window(cls='qam-dot'):
    cols = [GOLD, RED, BLUE, GEM]
    cells = ''.join(f'<path class="gl-glass"{chr(32) + "style=" + chr(34) + {BLUE: "fill:var(--gb, #2d5a94)", GOLD: "fill:var(--gg, #f0b93a)", GEM: "fill:var(--gp, #fff0b8)"}.get(c, "") + chr(34) if c in (BLUE, GOLD, GEM) else ""} d="M0,0 L{10 * math.cos(math.pi / 2 * i):.2f},{-10 * math.sin(math.pi / 2 * i):.2f} A10,10 0 0 0 {10 * math.cos(math.pi / 2 * (i + 1)):.2f},{-10 * math.sin(math.pi / 2 * (i + 1)):.2f}Z" fill="{c}"/>' for i, c in enumerate(cols))
    return (f'<svg class="{cls}" viewBox="-12 -12 24 24" aria-hidden="true">{cells}'
            '<g class="gl-gyp" fill="none" stroke-width="2.2"><circle r="10.5"/><line x1="-10" y1="0" x2="10" y2="0"/><line x1="0" y1="-10" x2="0" y2="10"/></g></svg>')

# ---------- juss / tower friezes (masks: one colour) ----------
def sawtooth(w=24, h=14):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}"><rect width="{w}" height="1.6"/><rect y="{h - 1.6}" width="{w}" height="1.6"/>'
            f'<path d="M0,{h - 3} L{w / 2},3 L{w},{h - 3}Z" fill-opacity="1"/><path d="M{w / 2 - 3},{h - 3} L{w / 2},{h - 8} L{w / 2 + 3},{h - 3}Z" fill="#fff" fill-opacity="0"/></svg>')
def frieze_wide():
    # interlaced roundels and diamonds between double rules, the gypsum band on a tower house
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="44" height="30">'
            '<rect width="44" height="1.6"/><rect y="4" width="44" height="1"/><rect y="25" width="44" height="1"/><rect y="28.4" width="44" height="1.6"/>'
            '<circle cx="11" cy="15" r="7" fill="none" stroke="#000" stroke-width="1.6"/><circle cx="11" cy="15" r="2.2"/>'
            '<path d="M33,8 L40,15 L33,22 L26,15Z" fill="none" stroke="#000" stroke-width="1.6"/><path d="M33,12 L36,15 L33,18 L30,15Z"/></svg>')
def chevron_band():
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="28" height="22">'
            '<rect width="28" height="2"/><rect y="20" width="28" height="2"/>'
            '<path d="M0,16 L7,6 L14,16 L21,6 L28,16" fill="none" stroke="#000" stroke-width="2.6" stroke-linejoin="miter"/></svg>')
def bricks():
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="16"><rect y="7.4" width="48" height="1.2"/><rect y="15.4" width="48" height="1.2"/>'
            '<rect x="0" y="0" width="1.2" height="8"/><rect x="24" y="0" width="1.2" height="8"/><rect x="12" y="8" width="1.2" height="8"/><rect x="36" y="8" width="1.2" height="8"/></svg>')
def diamond(): return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M5,0 L10,5 L5,10 L0,5Z"/></svg>'

DIRS = [
    dict(key='qam', name='Qamariya', src="The arched coloured-glass windows of Sana'a's tower houses",
         read="The hero sits under a qamariya: white gypsum tracery holding yellow, red and blue glass. At night the glass glows like a lit window seen from the street; by day it is lit through. Dividers are rows of small arches and list markers are round windows. Adds one colour, the red glass."),
    dict(key='juss', name='Juss', src="The white gypsum friezes that outline the tower houses",
         read="Blocks are outlined in gypsum white like windows on a façade, with a sawtooth band under the header and a wide frieze of roundels and diamonds as the divider. Geometric, crisp, very Sana'a."),
    dict(key='tower', name='Tower house', src="The whole façade: brick storeys, gypsum bands, framed windows",
         read="The page becomes the house: a brick ground, storeys separated by raised-brick chevron bands, and content set in white-framed windows with a small qamariya above. The boldest: it adds brick to the palette."),
    dict(key='musnad', name='Musnad', src="Ancient South Arabian inscriptions on stone and bronze",
         read="Panels are inscription plaques with raised borders. Your name runs in Musnad (𐩪𐩠𐩺𐩡) along the header, and the Musnad word-divider, a vertical bar, separates menu items and marks lists. Numbers sit in a hatched box, as Musnad inscriptions marked numbers."),
    dict(key='hawashi', name='Ḥawāshī', src="The margins of an Arabic manuscript",
         read="The page reads like a manuscript: ruled lines under the text, a note written slantwise in the margin (سهيل اليماني, Suhail 'the Yemeni', as the star is often called), a catchword at the foot of the text, rubricated headings, and an inverted-triangle colophon before the footer."),
    dict(key='kitaba', name='Kitāba', src="Inscription bands carved in gypsum on Yemeni buildings",
         read="A broad gypsum band under the header carries the proverb إذا طلع سهيل برد الليل in kufic, like the writing friezes on Yemeni buildings; the divider carries your name in both scripts. The page is literally written on its walls."),
]

CSS = f'''
.gl2 .glm{{ --gy:{GYP}; --rd:{RED}; --gb:#2e3570; }}
.gl2.day .glm{{ --gb:{BLUE}; }}
.gl2 .glm{{ --gg:#b78a3c; --gp:#efcb94; }}
.gl2.day .glm{{ --gy:#b9aa90; }}
.gl-gyp{{ stroke:var(--gt, var(--gy)); stroke-width:var(--gtw, 5px); filter:var(--gtf, none); }}
.gl2 .glm{{ --gt:#161b44; --gtw:1.6px; --gtwd:1px; --gtpb:1px; }}
.gl2.day .glm{{ --gt:var(--g); --gtw:5px; --gtwd:2.2px; --gtpb:3px; }}
.qam-dot .gl-gyp{{ stroke-width:var(--gtwd, 2.2px); }}
.gl-glass{{ opacity:1; }}
.gl2:not(.day) .qam-big, .gl2:not(.day) .qam-dot{{ filter:drop-shadow(0 0 10px rgba(240,185,58,.35)); }}

.gl-arch{{ display:none; }}
/* 1 qamariya */
.d-qam .gl-arch{{ display:block; margin:-6px 0 12px; }}
.d-qam .qam-big{{ width:min(100%, 420px); height:auto; display:block; }}
.d-qam .gl-div{{ display:flex; gap:10px; align-items:flex-end; height:38px; border-bottom:2px solid var(--gy); padding-bottom:2px; }}
.d-qam .gl-div .qam-big{{ width:58px; height:auto; filter:none; }}
.d-qam .gl-mk{{ width:16px; height:16px; }} .d-qam .gl-mk svg{{ width:16px; height:16px; display:block; transform:translateY(2px); }}
.d-qam .gl-prog::before{{ content:""; position:absolute; left:0; right:0; top:0; height:3px; background:linear-gradient(90deg, var(--gg, {GOLD}) 0 25%, {RED} 25% 50%, var(--gb, {BLUE}) 50% 75%, var(--gp, {GEM}) 75%); opacity:.85; }}
/* 2 juss */
.d-juss .gl-prog::before{{ content:""; position:absolute; left:0; right:0; top:0; height:14px; background:var(--gy); {mask(sawtooth(), 'repeat-x left top / 24px 14px')} }}
.d-juss .gl-main{{ padding-top:44px; }}
.d-juss .gl-blk{{ border:2.5px solid var(--gy); padding:18px 18px 14px; box-shadow:inset 0 0 0 4px var(--g), inset 0 0 0 5px var(--gy); }}
.d-juss .gl-side .gl-blk{{ margin-bottom:20px; }} .d-juss .gl-side ul{{ margin-bottom:0; }}
.d-juss .gl-blk::before{{ content:""; position:absolute; left:50%; top:-8px; width:14px; height:14px; margin-left:-7px; background:var(--gy); {mask(diamond(), 'no-repeat center / contain')} }}
.d-juss .gl-div{{ height:30px; background:var(--gy); {mask(frieze_wide(), 'repeat-x left center / 44px 30px')} }}
.d-juss .gl-mk{{ width:9px; height:9px; background:var(--gy); {mask(diamond(), 'no-repeat center / contain')} }}
/* 3 tower house */
.gl2 .d-tower{{ --g:#2a1810; --t:#f1e9dc; --m:#cdb9a3; --a:#f0b93a; --r:rgba(244,239,230,.18); --gy:{GYP}; }}
.gl2.day .d-tower{{ --g:#8a5636; --t:#fbf6ee; --m:#f0dcc6; --a:#ffd36b; --r:rgba(255,250,240,.25); --gy:{GYP}; }}
.d-tower .gl-bg{{ background:#000; opacity:.22; {mask(bricks(), 'repeat left top / 48px 16px')} }}
.gl2.day .d-tower .gl-bg{{ background:#3a1f10; opacity:.28; }}
.d-tower .gl-prog::before{{ content:""; position:absolute; left:0; right:0; top:-1px; height:22px; background:var(--gy); {mask(chevron_band(), 'repeat-x left top / 28px 22px')} }}
.d-tower .gl-main{{ padding-top:48px; }}
.d-tower .gl-blk{{ background:color-mix(in oklab, var(--g) 70%, black); border:7px solid var(--gy); border-radius:4px; padding:16px 16px 14px; }}
.gl2.day .d-tower .gl-blk{{ background:color-mix(in oklab, var(--g) 78%, black); }}
.d-tower .gl-side .gl-blk{{ margin-bottom:26px; }} .d-tower .gl-side ul{{ margin-bottom:0; }}
.d-tower .gl-art .gl-blk:first-child{{ margin-top:46px; }}
.d-tower .gl-arch{{ display:block; position:absolute; left:50%; top:-60px; transform:translateX(-50%); width:120px; }}
.d-tower .gl-arch .qam-big{{ width:120px; height:auto; display:block; }}
.d-tower .gl-div{{ height:22px; background:var(--gy); {mask(chevron_band(), 'repeat-x left center / 28px 22px')} margin:34px -24px 30px; }}
.d-tower .gl-mk{{ width:8px; height:11px; border:2px solid var(--gy); border-radius:5px 5px 0 0; }}
/* 4 musnad */
.d-musnad .gl-hd nav span + span::before{{ content:""; display:inline-block; width:1.5px; height:15px; background:var(--b); margin-right:20px; transform:translateY(2px); }}
.d-musnad .gl-prog{{ height:auto; }}
.d-musnad .gl-band{{ display:block; overflow:hidden; white-space:nowrap; direction:rtl; font:18px 'Noto Sans Old South Arabian', serif; color:var(--b); letter-spacing:.18em; padding:6px 0 5px; border-bottom:1px solid var(--r); text-align:center; }}
.d-musnad .gl-band *{{ font-family:'Noto Sans Old South Arabian', serif; }}
.d-musnad .gl-band i{{ display:inline-block; width:1.6px; height:17px; background:var(--b); margin:0 .7em; transform:translateY(3px); opacity:.7; }}
.d-musnad .gl-blk{{ padding:18px 18px 14px; border:1.5px solid var(--b); box-shadow:inset 0 0 0 4px var(--g), inset 0 0 0 5px var(--b);
  background-image:radial-gradient(circle, var(--b) 2.6px, transparent 3px), radial-gradient(circle, var(--b) 2.6px, transparent 3px), radial-gradient(circle, var(--b) 2.6px, transparent 3px), radial-gradient(circle, var(--b) 2.6px, transparent 3px);
  background-size:12px 12px; background-repeat:no-repeat; background-position:2px 2px, calc(100% - 2px) 2px, 2px calc(100% - 2px), calc(100% - 2px) calc(100% - 2px); }}
.d-musnad .gl-side .gl-blk{{ margin-bottom:20px; }} .d-musnad .gl-side ul{{ margin-bottom:0; }}
.d-musnad .gl-div{{ display:flex; align-items:center; gap:14px; }}
.d-musnad .gl-div .rl{{ flex:1; height:1px; background:var(--b); }}
.d-musnad .gl-div .ms{{ font:30px 'Noto Sans Old South Arabian', serif; color:var(--a); letter-spacing:.12em; direction:rtl; }}
.d-musnad .gl-div .bar{{ width:2px; height:28px; background:var(--a); }}
.d-musnad .gl-mk{{ width:2px; height:18px; background:var(--b); transform:translateY(3px); }}
.d-musnad td.n span{{ display:inline-block; padding:1px 7px; border:1px solid var(--b); background:repeating-linear-gradient(45deg, color-mix(in oklab, var(--b) 22%, transparent) 0 1px, transparent 1px 5px); }}
/* 5 hawashi */
.d-hawashi .gl-art p.tx{{ background-image:repeating-linear-gradient(to bottom, transparent 0 calc(1.55em - 1px), var(--r) calc(1.55em - 1px) 1.55em); }}
.d-hawashi .gl-art h2, .d-hawashi .gl-art h1{{ color:var(--rd); }}
.gl2:not(.day) .d-hawashi .gl-art h2, .gl2:not(.day) .d-hawashi .gl-art h1{{ color:#e6866f; }}
.d-hawashi .gl-side{{ position:relative; padding-top:64px; }}
.d-hawashi .gl-note{{ display:block; position:absolute; top:6px; left:12px; transform:rotate(-14deg); transform-origin:left top; font:20px/1.4 'Noto Naskh Arabic', serif; color:var(--a); border-bottom:1px solid var(--a); padding:0 6px 2px; }}
.d-hawashi .gl-note small{{ display:block; font:12px 'Alegreya', serif; color:var(--m); direction:ltr; text-align:left; }}
.d-hawashi .gl-catch{{ display:block; text-align:left; font:16px 'Noto Naskh Arabic', serif; color:var(--m); margin-top:6px; }}
.d-hawashi .gl-div{{ text-align:center; font-size:22px; color:var(--rd); letter-spacing:.3em; }}
.gl2:not(.day) .d-hawashi .gl-div{{ color:#e6866f; }}
.d-hawashi .gl-mk{{ width:7px; height:7px; border-radius:50%; background:var(--rd); transform:translateY(-2px); }}
.gl2:not(.day) .d-hawashi .gl-mk{{ background:#e6866f; }}
.d-hawashi .gl-colo{{ display:flex; flex-direction:column; align-items:center; gap:2px; padding:4px 24px 26px; text-align:center; }}
.d-hawashi .gl-colo span{{ font-size:16px; color:var(--m); }}
.d-hawashi .gl-colo span:nth-child(1){{ width:min(100%,460px); }} .d-hawashi .gl-colo span:nth-child(2){{ width:min(100%,330px); }}
.d-hawashi .gl-colo span:nth-child(3){{ width:min(100%,200px); }} .d-hawashi .gl-colo span:nth-child(4){{ width:60px; color:var(--a); }}
/* 6 kitaba */
.d-kitaba .gl-prog{{ height:auto; }}
.d-kitaba .gl-band{{ display:block; background:var(--gy); color:#3a2a1c; text-align:center; padding:10px 12px 8px; overflow:hidden; white-space:nowrap;
  box-shadow:inset 0 3px 0 -1px rgba(0,0,0,.18), inset 0 -3px 0 -1px rgba(0,0,0,.18); }}
.d-kitaba .gl-band span{{ font:700 26px/1.2 'Noto Kufi Arabic', sans-serif; letter-spacing:.02em; color:#3a2a1c; }}
.d-kitaba .gl-band i{{ display:inline-block; width:9px; height:9px; margin:0 22px; background:#b78a3c; transform:rotate(45deg) translateY(-4px); }}
.d-kitaba .gl-div{{ border-top:2px solid var(--gy); border-bottom:2px solid var(--gy); padding:8px 0 6px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; }}
.d-kitaba .gl-div .k{{ font:700 22px 'Noto Kufi Arabic', sans-serif; color:var(--gy); }}
.d-kitaba .gl-div .l{{ font:500 13px 'Alegreya Sans SC', sans-serif; letter-spacing:.2em; text-transform:uppercase; color:var(--gy); }}
.d-kitaba .gl-blk{{ border-left:3px solid var(--gy); padding-left:16px; }}
.gl2.day .d-kitaba .gl-band{{ background:#d8cab0; }}
.gl2.day .d-kitaba .gl-div{{ border-color:var(--b); }} .gl2.day .d-kitaba .gl-div .k, .gl2.day .d-kitaba .gl-div .l{{ color:var(--b); }}
.d-kitaba .gl-mk{{ width:8px; height:8px; background:var(--gy); }}
.gl-band, .gl-note, .gl-catch, .gl-colo{{ display:none; }}
.d-musnad .gl-band, .d-kitaba .gl-band, .d-hawashi .gl-note, .d-hawashi .gl-catch, .d-hawashi .gl-colo{{ display:block; }}
.d-hawashi .gl-colo{{ display:flex; }}
@media (max-width:760px){{ .d-hawashi .gl-side{{ padding-top:70px; }} .d-tower .gl-div{{ margin-left:-16px; margin-right:-16px; }} }}
'''

def divider(k):
    if k == 'qam': return ''.join(qamariya(cls='qam-big') for _ in range(7))
    if k == 'musnad': return f'<div class="rl"></div><div class="bar"></div><span class="ms" lang="xsa">{MUSNAD}</span><div class="bar"></div><div class="rl"></div>'
    if k == 'hawashi': return '⁂'
    if k == 'kitaba': return '<span class="k" lang="ar">سهيل</span><span class="l">Suhail</span>'
    return ''

def band(k):
    if k == 'musnad':
        return '<div class="gl-band" lang="xsa">' + '<i></i>'.join([MUSNAD] * 14) + '</div>'
    if k == 'kitaba':
        return '<div class="gl-band" lang="ar" dir="rtl"><span>إذا طلع سهيل برد الليل</span><i></i><span>إذا طلع سهيل برد الليل</span><i></i><span>إذا طلع سهيل برد الليل</span></div>'
    return ''

def page(d, extra_cls='', div_html=None, band_html=None, shown=None, dk=None):
    k = d['key']
    mk = round_window() if k == 'qam' else ''
    li = lambda t, y, dsc, ar=False: (f'<li><span class="gl-mk">{mk}</span><span class="t{" ar" if ar else ""}"{" lang=ar" if ar else ""}>{t}</span>'
                                      f'<span class="y">{y}</span><span class="d">{dsc}</span></li>')
    num = (lambda v: f'<span>{v}</span>') if k == 'musnad' else (lambda v: v)
    arch = qamariya() if k in ('qam', 'tower') else ''
    dk = dk or k
    vis = (k == 'qam') if shown is None else shown
    return f'''<div class="glm d-{k} {extra_cls}" data-k="{dk}"{'' if vis else ' hidden'}>
  <div class="gl-bg"></div>
  <div class="gl-hd"><nav class="l"><span>Work</span><span>Notes</span></nav><i class="gl-mark" role="img" aria-label="The Astrolabe of Suhail"></i><nav><span>About</span><span class="ar" lang="ar">العربية</span></nav></div>
  <div class="gl-prog">{band(k) if band_html is None else band_html}</div>
  <div class="gl-main">
    <div class="gl-art">
      <div class="gl-blk">
        <div class="gl-arch">{arch}</div>
        <div class="lb">Suhail</div>
        <h1>A sky that follows Sana'a</h1>
        <p class="an ar" lang="ar" dir="rtl">سهيل</p>
        <p class="le">It is day on this site when the sun is up over Sana'a, and night when it has set there.</p>
      </div>
      <div class="gl-div">{divider(k) if div_html is None else div_html}</div>
      <div class="gl-blk">
        <div class="lb">Note · 7 August</div>
        <h2>When Suhail rises, the night cools</h2>
        <p class="pv ar" lang="ar" dir="rtl">إذا طلع سهيل برد الليل</p>
        <p class="tx">Suhail is Canopus, the second-brightest star in the night sky after Sirius. Over Yemen it first appears in the dawn sky in early August, low in the south-east, and its rising has long marked the start of the late-summer rains.</p>
        <p class="ar" lang="ar" dir="rtl">سهيل ثاني ألمع نجوم السماء بعد الشِّعرى. يظهر فجرًا في سماء اليمن في أوائل أغسطس، ومعه تبدأ أمطار آخر الصيف.</p>
        <span class="gl-catch" lang="ar" dir="rtl">سهيل</span>
      </div>
    </div>
    <aside class="gl-side">
      <div class="gl-note" lang="ar" dir="rtl">سهيل اليماني<small>marginal note: “Suhail the Yemeni”</small></div>
      <div class="gl-blk"><h4>Work</h4>
      <ul>
        {li('The Astrolabe of Suhail', '2026', "The mark: an astrolabe computed for Sana'a.")}
        {li('سُهَيْل', '2026', 'The wordmark: the star is a vowel.', True)}
        {li('The sky ramp', '2026', "The site's colours follow the sun over Sana'a.")}
      </ul></div>
      <div class="gl-blk"><h4>Suhail over Sana'a</h4>
      <table><tbody>
        <tr><td>Rises, bearing</td><td class="n">{num('145.6°')}</td></tr>
        <tr><td>Highest altitude</td><td class="n">{num('21.9°')}</td></tr>
        <tr><td>Sets, bearing</td><td class="n">{num('214.4°')}</td></tr>
        <tr><td>Magnitude</td><td class="n">{num('−0.74')}</td></tr>
      </tbody></table></div>
    </aside>
  </div>
  <div class="gl-colo"><span>Set in Alegreya and Noto Naskh Arabic, under the sky of Sana'a,</span><span>for Suhail, in the year 2026.</span><span>Here the page ends.</span><span>⁂</span></div>
  <div class="gl-ft"><span class="gl-sig"><i class="wm" role="img" aria-label="سُهَيْل"></i><span>© 2026 Suhail AbuOsba</span></span>
    <span>Sana'a <b class="js-time">--:--</b> · Suhail <b class="js-alt">--°</b> · Sun <b class="js-sunalt">--°</b></span></div>
</div>'''

def section(mark_n, mark_d, wm_n, wm_l, round1_html):
    tabs = ''.join(f'<button data-k="{d["key"]}" aria-pressed="{"true" if i == 0 else "false"}">{i + 1} · {d["name"]}</button>' for i, d in enumerate(DIRS))
    reads = ''.join(f'<div class="gl-read" data-k="{d["key"]}"{"" if i == 0 else " hidden"}><h3>{i + 1} · {d["name"]}</h3><span class="src">{d["src"]}</span><p>{d["read"]}</p></div>' for i, d in enumerate(DIRS))
    pages = ''.join(page(d) for d in DIRS)
    summ = ''.join(f'<li><b>{i + 1} · {d["name"]}</b>: {d["src"]}.</li>' for i, d in enumerate(DIRS))
    css = (f'.glm .gl-mark{{ background-image:url("{mark_n}"); }} .gl.day .glm .gl-mark{{ background-image:url("{mark_d}"); }}'
           f'.glm .gl-sig i{{ background-image:url("{wm_n}"); }} .gl.day .glm .gl-sig i{{ background-image:url("{wm_l}"); }}')
    return f'''<section class="lk" id="graphic">
    <header class="phead"><span class="pnum">New</span><h2>Graphic language · Sana'a and its writing</h2></header>
    <p class="idea">The sky stays in the header, in the astrolabe; the page below becomes the city and its writing. Six directions from Sana'a's tower houses and from Yemen's scripts, all richly decorated, each applied to the same page as section 5. Pick one, or the parts you like from several.</p>
    <style>{css}</style>
    <div class="gl gl2" id="gl2">
      <div class="gl-tabs">{tabs}<span class="sep"></span><button data-g="night" aria-pressed="true">Night</button><button data-g="day" aria-pressed="false">Day</button></div>
      {reads}
      {pages}
      <ul class="gl-sum">{summ}</ul>
    </div>
    <details class="earlier"><summary>Round 1: seven directions from the astronomy (set aside: "stuck in the astronomy world")</summary>{round1_html}</details>
  </section>'''
