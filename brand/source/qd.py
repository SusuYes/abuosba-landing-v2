"""Graphic language round 3: the Qamariya page with five dividers built from the two he liked
(the Musnad divider and the tower house's raised-brick chevron band)."""
import gl2
from gl import mask
from gl2 import gv, MUSNAD, GOLD, RED, BLUE, GEM, chevron_band

QAM = next(d for d in gl2.DIRS if d['key'] == 'qam')
GLASS = [GOLD, RED, BLUE, GEM]

def musnad_div():
    return f'<div class="qm"><div class="rl"></div><div class="bar"></div><span class="ms" lang="xsa">{MUSNAD}</span><div class="bar"></div><div class="rl"></div></div>'
def chevron_div(): return '<div class="qc"></div>'
def both_div(): return f'<div class="qb"><div class="qc"></div><span class="pl"><i></i><span class="ms" lang="xsa">{MUSNAD}</span><i></i></span></div>'
def glass_div():
    # Musnad letters, each in an arched pane of qamariya glass (right to left: s, h, y, l)
    panes = ''.join(f'<span class="pane" style="--c:{gv(c)}"><span lang="xsa">{ch}</span></span>' for ch, c in zip(MUSNAD, GLASS))
    return f'<div class="qg"><div class="rl"></div><div class="bar"></div><span class="panes" dir="rtl">{panes}</span><div class="bar"></div><div class="rl"></div></div>'

STRIPE = '<div class="qs"></div>'
VARS = [
    dict(v='m', name='Musnad', why="The Musnad divider as you saw it: two rules, the word-divider bars, and your name in Musnad in gold. Header keeps the thin line of glass colours.",
         div=musnad_div(), band=STRIPE),
    dict(v='c', name='Raised brick', why="The tower house's raised-brick zigzag, in gypsum white, as the divider and as the line under the header.",
         div=chevron_div(), band='<div class="qc"></div>'),
    dict(v='b', name='Both joined', why="The zigzag band with your Musnad name set in a plaque at its centre, between word-divider bars: the house and its writing in one line.",
         div=both_div(), band='<div class="qc"></div>'),
    dict(v='g', name='Glass Musnad', why="The Musnad divider again, but each letter sits in its own arched pane of qamariya glass (yellow, red, blue, pale), so the name and the window become one thing.",
         div=glass_div(), band=STRIPE),
    dict(v='r', name='Split by role', why="The zigzag runs under the header like a storey line on a façade; between sections the Musnad divider marks a pause in the text.",
         div=musnad_div(), band='<div class="qc"></div>'),
]

CSS = f'''
.qv .gl-div{{ display:block; height:auto; border:0; padding:0; margin:30px 0 26px; }}
.qv .gl-prog{{ height:auto; }} .qv .gl-prog::before{{ display:none; }}
.qv .qs{{ height:3px; background:linear-gradient(90deg, var(--gg, {GOLD}) 0 25%, {RED} 25% 50%, var(--gb, #2d5a94) 50% 75%, var(--gp, {GEM}) 75%); opacity:.85; }}
.qv .qc{{ height:22px; background:var(--gy); {mask(chevron_band(), 'repeat-x left center / 28px 22px')} }}
.qv .gl-prog .qc{{ height:18px; {mask(chevron_band(), 'repeat-x left top / 23px 18px')} }}
.qv .qm, .qv .qg{{ display:flex; align-items:center; gap:14px; }}
.qv .rl{{ flex:1; height:1px; background:var(--b); }}
.qv .bar{{ width:2px; height:28px; background:var(--a); }}
.qv .ms{{ font:30px 'Noto Sans Old South Arabian', serif; color:var(--a); letter-spacing:.12em; direction:rtl; }}
.qv .qb{{ position:relative; display:flex; align-items:center; justify-content:center; height:44px; }}
.qv .qb .qc{{ position:absolute; left:0; right:0; top:11px; }}
.qv .qb .pl{{ position:relative; display:flex; align-items:center; gap:12px; background:var(--g); padding:4px 16px; border:2px solid var(--gy); border-radius:3px; }}
.qv .qb .pl i{{ width:2px; height:26px; background:var(--a); }}
.qv .qb .ms{{ font-size:26px; }}
.qv .panes{{ display:flex; gap:5px; }}
.qv .pane{{ display:flex; align-items:flex-end; justify-content:center; width:34px; height:44px; padding-bottom:5px; border-radius:17px 17px 2px 2px;
  background:var(--c); border:var(--gtpb, 3px) solid var(--gt, var(--gy)); }}
.qv .pane span{{ font:24px/1 'Noto Sans Old South Arabian', serif; color:#1b1a17; }}
.gl2:not(.day) .qv .pane{{ box-shadow:0 0 12px color-mix(in oklab, var(--c) 55%, transparent); }}
'''

def section():
    tabs = ''.join(f'<button data-k="q{x["v"]}" aria-pressed="{"true" if i == 0 else "false"}">{i + 1} · {x["name"]}</button>' for i, x in enumerate(VARS))
    reads = ''.join(f'<div class="gl-read" data-k="q{x["v"]}"{"" if i == 0 else " hidden"}><h3>{i + 1} · {x["name"]}</h3><p>{x["why"]}</p></div>' for i, x in enumerate(VARS))
    pages = ''.join(gl2.page(QAM, extra_cls='qv', div_html=x['div'], band_html=x['band'], shown=(i == 0), dk='q' + x['v']) for i, x in enumerate(VARS))
    return f'''<div class="gl gl2" id="gl3">
      <div class="gl-tabs">{tabs}<span class="sep"></span><button data-g="night" aria-pressed="true">Night</button><button data-g="day" aria-pressed="false">Day</button></div>
      {reads}
      {pages}
    </div>'''
