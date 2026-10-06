"""Glass golds matched to the logo: three pairings, each on the page with the logo, night and day."""
import gl2
OPTS = [
    dict(k='g1', gg='#b78a3c', gp='#efcb94', name='Brass and light brass',
         why="The yellow glass becomes the logo's brass (#b78a3c, its rim and letters); the pale glass becomes a light tint of the same brass (#efcb94). One metal throughout, like brass-tinted glass."),
    dict(k='g2', gg='#b78a3c', gp='#f0b93a', name='Brass and star gold',
         why="The yellow glass becomes the logo's brass; the pale glass becomes the gold of the star Suhail (#f0b93a). Both colours are taken straight from the logo, no new tints."),
    dict(k='g3', gg='#f0b93a', gp='#efcb94', name='Star gold and light brass',
         why="The yellow glass stays the star's gold (already in the logo); only the pale glass changes, to the light brass tint, so the beige no longer reads as a separate cream."),
]
FRAMES = [
    dict(k='n1', st='--gtn:#f0b93a', name='Star gold',
         why="The frame is the bright gold of the star Suhail, the brightest metal in the logo. The brass glass sits inside a gold setting, like jewellery."),
    dict(k='n2', st='--gtn:#fff0b8;--gtf:drop-shadow(0 0 3px rgba(255,214,120,.9)) drop-shadow(0 0 8px rgba(240,185,58,.55))', name='Light through the gaps',
         why="The gaps are lit: warm light leaks between the panes, the way a qamariya glows from a lit room at night. The frame becomes the brightest part, a glowing outline."),
    dict(k='n3', st='--gtn:#77530c;--gtw:2.2px', name='Fine dark brass',
         why="The dark brass again but at less than half the thickness, a fine line. The glass dominates and the frame is barely there."),
    dict(k='n4', st='--gtn:#161b44;--gtw:1.6px', name='Mosaic',
         why="The panes almost touch: only a hairline of night between them, so the window reads as one mosaic of colour rather than glass in a frame."),
    dict(k='n5', st='--gtn:#ece8e0;--gtw:3px', name='Thin alabaster',
         why="The page's own warm light colour (the day ground), at a thinner weight than the original gypsum: the same frame as the day version, carried into the night but softer."),
    dict(k='n6', st='--gtn:#b78a3c;--gtw:3px;--gg:#f0b93a', name='Brass frame, star-gold glass',
         why="The frame becomes the logo's own brass, and the gold panes switch to the star's brighter gold so they stay distinct. Frame and logo are the same metal, the gold glass is the star."),
]
def frames():
    qam = next(d for d in gl2.DIRS if d['key'] == 'qam')
    rows = []
    for i, o in enumerate(FRAMES, 1):
        pg = lambda: gl2.page(qam, extra_cls='qv', div_html='', band_html='<div class="qc"></div>', shown=True, dk=o['k']).replace(
            '<div class="glm', f'<div style="{o["st"]}" class="glm', 1)
        rows.append(f'''<div class="qdv-opt"><h3>{i} · {o["name"]}</h3><p>{o["why"]}</p>
          <div class="gl gl2 gcrop gnight">{pg()}</div></div>''')
    return '<div class="gn-grid">' + "".join(rows) + '</div>'

def FINAL(s):
    qam = next(d for d in gl2.DIRS if d['key'] == 'qam')
    return gl2.page(qam, extra_cls='qv', div_html='', band_html='<div class="qc"></div>', shown=True, dk='fin' + s)

def section():
    qam = next(d for d in gl2.DIRS if d['key'] == 'qam')
    rows = []
    for i, o in enumerate(OPTS, 1):
        pg = lambda: gl2.page(qam, extra_cls='qv', div_html='', band_html='<div class="qc"></div>', shown=True, dk=o['k']).replace(
            '<div class="glm', f'<div style="--gg:{o["gg"]};--gp:{o["gp"]}" class="glm', 1)
        sw = f'<span class="gsw" style="background:{o["gg"]}"></span><code>{o["gg"]}</code><span class="gsw" style="background:{o["gp"]}"></span><code>{o["gp"]}</code>'
        rows.append(f'''<div class="qdv-opt"><h3>{i} · {o["name"]}{' <span class="rec">Chosen</span>' if i == 1 else ''}</h3><p>{o["why"]}</p><div class="gsws">{sw}</div>
          <div class="qdv-row"><div class="gl gl2 gcrop">{pg()}</div><div class="gl gl2 day gcrop">{pg()}</div></div></div>''')
    return f'''<section class="lk" id="glassgold">
    <header class="phead"><span class="pnum">New</span><h2>The qamariya, matched to the logo</h2><span class="rec">Chosen</span></header>
    <p class="idea">The qamariya's yellow and pale glass were the star's colours (#f0b93a, #fff0b8), while the logo reads as brass (#b78a3c), so the window looked like a different metal. Three ways to make them one. <b>Chosen: option 1, brass and light brass.</b> The blue already matches the logo.</p>
    <h3 class="tk">The frame between the panes</h3>
    <div class="qdv-row"><div class="gl gl2 gcrop gnight">{FINAL('n')}</div><div class="gl gl2 day gcrop gnight">{FINAL('d')}</div></div>
    <p class="read">The tracery was gypsum white at night and warm grey by day, neither from the logo. <b>Chosen: by day the gaps show the light ground; at night, the Mosaic: only a hairline of night between the panes.</b> The six night frames that were compared are below.</p>
    <details class="earlier"><summary>The six night frames compared</summary><div style="margin-top:14px">{frames()}</div></details>
    <h3 class="tk" style="margin-top:26px">The glass golds</h3>
    <div class="qdv">{"".join(rows)}</div>
  </section>'''
CSS = '''
.gsws{ display:flex; align-items:center; gap:8px; margin:0 0 10px; }
.gsw{ width:22px; height:22px; border-radius:5px; border:1px solid var(--rule); }
.gsws code{ font:12px 'IBM Plex Mono', ui-monospace, monospace; color:var(--muted); margin-right:10px; }
.gcrop .glm{ max-height:390px; overflow:hidden; }
.gl2.gcrop:not(.day) .glm[style*='--gtn']{ --gt:var(--gtn); }
.gn-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr)); gap:22px 14px; }
.gnight .glm{ max-height:none; } .gnight .gl-art > :not(.gl-blk:first-child), .gnight .gl-blk:first-child > :not(.gl-arch), .gnight .gl-ft, .gnight .gl-div{ display:none; } .gnight .gl-main{ padding-bottom:18px; }
.gcrop .gl-side{ display:none; } .gcrop .gl-main{ grid-template-columns:1fr; }
'''
