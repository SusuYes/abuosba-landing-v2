"""Graphic language round 1: seven directions from the astrolabe tradition, each applied to the same page
(the section-5 page: centred astrolabe header, Reed pen type, wordmark signing the footer)."""
import base64, math, re

def b64(svg): return 'data:image/svg+xml;base64,' + base64.b64encode(svg.encode()).decode()
def uri(p): return 'data:image/svg+xml;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
def mask(svg, extra=''):
    u = b64(svg); return f'-webkit-mask:url("{u}") {extra}; mask:url("{u}") {extra};'

# ---------- ornaments ----------
def limb_tile():   # one 10-degree span of the rim: 1-degree ticks, a longer 5, the longest at 10
    t = []
    for i in range(10):
        h = 14 if i == 0 else (9 if i == 5 else 5)
        t.append(f'<rect x="{i * 6}" y="0" width="1" height="{h}"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="60" height="14">{"".join(t)}</svg>'

def limb_ring():   # a large faint degree ring for the background
    o = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="-700 -700 1400 1400">',
         '<circle r="660" fill="none" stroke="#000" stroke-width="2"/><circle r="610" fill="none" stroke="#000" stroke-width="1"/>']
    for d in range(360):
        L = 50 if d % 10 == 0 else (32 if d % 5 == 0 else 18)
        a = math.radians(d); c, s = math.cos(a), math.sin(a)
        o.append(f'<line x1="{660 * c:.1f}" y1="{660 * s:.1f}" x2="{(660 - L) * c:.1f}" y2="{(660 - L) * s:.1f}" stroke="#000" stroke-width="{2 if d % 10 == 0 else 1}"/>')
    o.append('</svg>'); return ''.join(o)

def almucantars():  # stereographic altitude circles for Sana'a (lat 15.37), as on the plate
    phi = math.radians(15.37); R = 700; px, py = 600, -300
    o = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMin slice">']
    for h in (0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84):
        hr = math.radians(h); den = math.sin(phi) + math.sin(hr)
        yc, r = R * math.cos(phi) / den, R * math.cos(hr) / den
        w = 2 if h % 30 == 0 else 1
        o.append(f'<circle cx="{px}" cy="{py + yc:.1f}" r="{r:.1f}" fill="none" stroke="#000" stroke-width="{w}"/>')
    o.append('</svg>'); return ''.join(o)

def horizon_arc():
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 24" preserveAspectRatio="none">'
            '<path d="M0,22 Q300,-6 600,22" fill="none" stroke="#000" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>')

POINTER = 'M0,6 C9,1 25,2 36,6 C25,10 9,11 0,6Z'
def pointer_svg(): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 12"><path d="{POINTER}"/><circle cx="39.5" cy="6" r="2.2"/></svg>'
def fret_tile():   # rete openwork: two pointers meeting at a pierced ring
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="16">'
            '<path d="M3,8 C10,4 20,5 26,8 C20,11 10,12 3,8Z"/><path d="M61,8 C54,4 44,5 38,8 C44,11 54,12 61,8Z"/>'
            '<circle cx="32" cy="8" r="4.2" fill="none" stroke="#000" stroke-width="1.6"/></svg>')

ISBA = 24  # one isba (finger), about 1 deg 36 min of sky, as 24 px of page
def cord_tile():
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{ISBA}" height="12"><rect x="0" y="5.4" width="{ISBA}" height="1.2"/>'
            f'<ellipse cx="{ISBA / 2}" cy="6" rx="2.6" ry="2.2"/></svg>')

def rosette():  # an eight-point star from two squares, a common manuscript divider ornament
    s = 9
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-12 -12 24 24">'
            f'<rect x="-{s}" y="-{s}" width="{2 * s}" height="{2 * s}" transform="rotate(0)"/><rect x="-{s}" y="-{s}" width="{2 * s}" height="{2 * s}" transform="rotate(45)"/>'
            '</svg>')

def stars_svg():  # the mark's own star field (stereographic, Sana'a), a band of it
    t = open('../musnad/r9/astrolabe/bg2/astrolabe-hero.svg').read()
    i = t.index('id="starfield"'); g = t[i:t.index('</g>', i)]
    pts = [(float(a), float(b), float(r)) for a, b, r in re.findall(r'cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)"', g)]
    o = ['<svg viewBox="-310 -170 620 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true">']
    for x, y, r in pts:
        if -170 <= y <= 170: o.append(f'<circle cx="{x}" cy="{y}" r="{r * .38:.2f}"/>')
    o.append('<g class="sx" transform="translate(40 -128)"><path d="M0,-9 Q1.6,-1.6 9,0 Q1.6,1.6 0,9 Q-1.6,1.6 -9,0 Q-1.6,-1.6 0,-9Z"/></g>')
    o.append('</svg>'); return ''.join(o)

def constellation():
    pts = [(10, 16), (90, 6), (170, 14), (260, 4), (330, 12)]
    lines = ''.join(f'<line x1="{a[0]}" y1="{a[1]}" x2="{b[0]}" y2="{b[1]}"/>' for a, b in zip(pts, pts[1:]))
    dots = ''.join(f'<circle cx="{x}" cy="{y}" r="{r}"/>' for (x, y), r in zip(pts, (2.2, 1.6, 3, 1.8, 2.4)))
    return f'<svg class="gl-cons" viewBox="0 0 340 20" aria-hidden="true"><g class="ln">{lines}</g><g class="dt">{dots}</g></svg>'

def hour_fan():  # unequal-hour lines fanning from the gnomon foot, as on a sundial / the astrolabe's back
    o = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMin slice">']
    for k in range(1, 12):
        a = math.radians(180 * k / 12)
        o.append(f'<line x1="600" y1="-40" x2="{600 - 1400 * math.cos(a):.1f}" y2="{-40 + 1400 * math.sin(a):.1f}" stroke="#000" stroke-width="{2 if k == 6 else 1}"/>')
    o.append('</svg>'); return ''.join(o)

# ---------- the seven directions ----------
DIRS = [
    dict(key='limb', name='Limb', src="The degree scale engraved on the astrolabe's rim",
         read="Rules and the reading-progress line are the rim's degree scale; the divider runs 0 to 90° with Suhail's height over Sana'a (21.9°) marked in gold; a faint ring of the rim sits behind the page."),
    dict(key='almu', name='Almucantars', src="The plate's altitude circles, computed for Sana'a",
         read="The background is the plate's own altitude circles for Sana'a's latitude, drawn faintly; the divider is the horizon arc; small rings mark lists. The quietest of the seven."),
    dict(key='stars', name='Star field', src="The mark's own sky",
         read="The same stars as the mark sit behind the page, with Suhail in gold; by day they fade, like the mark's. The divider is a small constellation line; list bullets are stars."),
    dict(key='shadow', name='Shadow', src="The astrolabe's back: hour lines and the gnomon's shadow",
         read="Faint hour lines fan from the top of the page. Cards cast a shadow away from the real sun over Sana'a, so it swings through the day and disappears at night. The divider is the horizon in degrees, with the sun's live bearing and Suhail's rising and setting points."),
    dict(key='pointer', name='Star-pointers', src="The rete's openwork: pointers that mark the stars",
         read="Bullets and markers are the rete's star-pointers; the divider is a pierced band of pointers meeting at rings, like the rete's fretwork. Ornamental and crafted, the most 'object-like'."),
    dict(key='isba', name='Iṣbaʿ', src="The kamal, the navigator's card and knotted cord; your name, ابواصبع",
         read="The page's unit is the iṣbaʿ (finger), the navigator's measure of the sky, about 1°36′; your surname is 'father of the finger'. The divider is the kamal's knotted cord, one knot per iṣbaʿ, with the knot for Sana'a's latitude (15°22′ = 9.6 iṣbaʿ) in gold. Cards are kamal cards, with the string hole at the top."),
    dict(key='jadwal', name='Jadwal', src="The gold ruling of illuminated manuscripts, like al-Ṣūfī's Book of Fixed Stars",
         read="Text blocks are framed by the double gold rules of a manuscript page; the divider is a rosette between ruled lines; labels and bullets are small gold roundels. The most bookish."),
]

CSS = '''
.gl{ display:flex; flex-direction:column; gap:18px; }
.gl-tabs{ display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.gl-tabs button{ font:500 13px 'IBM Plex Mono', ui-monospace, monospace; border:1px solid var(--rule); background:transparent; color:var(--text); border-radius:999px; padding:6px 13px; cursor:pointer; }
.gl-tabs button[aria-pressed="true"]{ background:var(--gold); color:#0f1229; border-color:var(--gold); }
.gl-tabs .sep{ width:1px; height:22px; background:var(--rule); margin:0 6px; }
.gl-read h3{ font:600 14px 'IBM Plex Mono', ui-monospace, monospace; letter-spacing:.1em; text-transform:uppercase; color:var(--text); margin:0; }
.gl-read .src{ font:12.5px 'IBM Plex Mono', ui-monospace, monospace; color:var(--gold); }
.gl-read p{ margin:4px 0 0; color:var(--muted); max-width:72ch; font-size:14.5px; }
.gl-sum{ display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr)); gap:10px 18px; margin:0; padding:0; list-style:none; }
.gl-sum li{ font-size:13.5px; color:var(--muted); border-top:1px solid var(--rule); padding-top:8px; }
.gl-sum b{ color:var(--text); font-weight:600; }
/* the page */
.glm{ --g:#161b44; --t:#ece8e0; --m:#a9a6b8; --a:#f0b93a; --b:#b78a3c; --r:rgba(236,232,224,.14); --o:.16;
  position:relative; isolation:isolate; background:var(--g); color:var(--t); border-radius:14px; overflow:hidden; border:1px solid var(--rule); }
.gl.day .glm{ --g:#ece8e0; --t:#1b1a17; --m:#5d5a52; --a:#8a6420; --b:#9a7430; --r:rgba(27,26,23,.14); --o:.12; }
.glm *{ font-family:'Alegreya', Georgia, serif; }
.glm .ar, .glm [lang="ar"]{ font-family:'Noto Naskh Arabic', serif; }
.glm .lb{ font:500 12px 'Alegreya Sans SC', sans-serif; letter-spacing:.14em; text-transform:uppercase; color:var(--a); }
.glm h1, .glm h2, .glm h4, .glm p, .glm li, .glm td, .glm span{ color:inherit; }
.gl-bg{ position:absolute; inset:0; z-index:-1; pointer-events:none; color:var(--b); }
.gl-hd{ display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:28px; padding:12px 24px; border-bottom:1px solid var(--r); position:relative; }
.gl-hd nav{ display:flex; gap:20px; } .gl-hd nav.l{ justify-content:flex-end; } .gl-hd nav span{ font-size:16px; }
.gl-mark{ display:block; width:47.5px; height:56px; background:center/contain no-repeat; transform:translateY(-4.2px); }
.gl-prog{ position:relative; height:0; }
.gl-main{ display:grid; grid-template-columns:minmax(0,1.35fr) minmax(0,1fr); gap:40px; padding:32px 24px 28px; }
@media (max-width:760px){ .gl-main{ grid-template-columns:1fr; } .gl-hd{ gap:14px; padding:10px 16px; } .gl-hd nav{ gap:12px; } }
.gl-art h1{ font:500 clamp(30px, 8vw, 46px)/1.05 'Alegreya', Georgia, serif; margin:8px 0 6px; text-wrap:balance; }
.gl-art .an{ font-size:22px; color:var(--m); margin:0 0 16px; text-align:left; }
.gl-art .le{ font-size:21px; line-height:1.45; max-width:34ch; margin:0; }
.gl-art h2{ font:500 27px/1.15 'Alegreya', Georgia, serif; margin:8px 0 4px; }
.gl-art .pv{ font-size:21px; color:var(--a); margin:2px 0 12px; text-align:left; }
.gl-art p.tx{ font-size:19px; line-height:1.55; max-width:62ch; margin:0 0 12px; }
.gl-art p.ar{ font-size:20px; line-height:1.9; text-align:right; margin:0; }
.gl-art p.an, .gl-art p.pv{ text-align:left; }
.gl-div{ position:relative; margin:30px 0 26px; min-height:14px; color:var(--b); }
.gl-blk{ position:relative; }
.gl-side h4{ font:500 12px 'Alegreya Sans SC', sans-serif; letter-spacing:.14em; text-transform:uppercase; color:var(--m); margin:0 0 10px; }
.gl-side ul{ list-style:none; margin:0 0 24px; padding:0; }
.gl-side li{ display:grid; grid-template-columns:auto 1fr auto; gap:2px 10px; align-items:baseline; padding:10px 0; border-top:1px solid var(--r); }
.gl-side li .t{ font:500 22px/1.25 'Alegreya', Georgia, serif; } .gl-side li .t.ar{ font-family:'Noto Naskh Arabic', serif; font-weight:400; }
.gl-side li .y{ font-size:13px; color:var(--m); font-variant-numeric:tabular-nums lining-nums; }
.gl-side li .d{ grid-column:2 / -1; font-size:17px; color:var(--m); }
.gl-mk{ display:inline-block; width:10px; color:var(--b); }
.gl-side table{ width:100%; border-collapse:collapse; }
.glm .gl-side td{ padding:6px 0; border-top:1px solid var(--r); font-size:17px; color:var(--t); background:transparent; }
.glm .gl-side td.n{ text-align:right; font-size:15px; font-variant-numeric:tabular-nums lining-nums; }
.gl-ft{ display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; padding:14px 24px; border-top:1px solid var(--r); font-size:13px; color:var(--m); font-variant-numeric:tabular-nums lining-nums; position:relative; }
.gl-sig{ display:flex; align-items:center; gap:16px; } .gl-sig i{ display:block; width:57px; height:36px; background:center/contain no-repeat; }
.gl-ft b{ color:var(--a); font-weight:400; }
'''

def dir_css():
    c = []
    # 1 limb
    lt = limb_tile()
    c.append(f'''
.d-limb .gl-prog::before{{ content:""; position:absolute; left:0; right:0; top:0; height:10px; background:var(--b); opacity:.7; {mask(lt.replace('height="14"','height="10"'), 'repeat-x left top / 60px 10px')} }}
.d-limb .gl-prog::after{{ content:""; position:absolute; left:38%; top:0; width:0; height:0; border:6px solid transparent; border-top:9px solid var(--a); transform:translateX(-6px); }}
.d-limb .gl-bg{{ background:var(--b); opacity:var(--o); {mask(limb_ring(), 'no-repeat right -420px top -180px / 1100px 1100px')} }}
.d-limb .gl-div .sc{{ height:14px; background:var(--b); {mask(lt, 'repeat-x left top / 60px 14px')} width:540px; max-width:100%; }}
.d-limb .gl-div .su{{ position:absolute; top:-4px; left:calc(min(540px, 100%) * 21.93 / 90); width:2px; height:22px; background:var(--a); }}
.d-limb .gl-div .su::after{{ content:"Suhail 21.9°"; position:absolute; left:6px; top:-17px; font:12px 'Alegreya Sans SC', sans-serif; letter-spacing:.08em; color:var(--a); white-space:nowrap; }}
.d-limb .gl-div .z{{ display:flex; justify-content:space-between; width:540px; max-width:100%; font-size:12px; color:var(--m); margin-top:3px; font-variant-numeric:tabular-nums lining-nums; }}
.d-limb .gl-mk{{ width:12px; height:12px; background:var(--b); {mask('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><rect x="5.4" y="0" width="1.2" height="12"/><rect x="0" y="11" width="12" height="1"/></svg>', 'no-repeat center / contain')} }}
.d-limb .lb[data-deg]::before{{ content:attr(data-deg) "  "; color:var(--m); letter-spacing:.06em; }}
''')
    # 2 almucantars
    c.append(f'''
.d-almu .gl-bg{{ background:var(--b); opacity:var(--o); {mask(almucantars(), 'no-repeat center top / cover')} }}
.d-almu .gl-div{{ height:24px; }}
.d-almu .gl-div .sc{{ position:absolute; inset:0; background:var(--b); {mask(horizon_arc(), 'no-repeat center / 100% 100%')} }}
.d-almu .gl-div .z{{ position:absolute; inset:auto 0 -16px 0; display:flex; justify-content:space-between; font:12px 'Alegreya Sans SC', sans-serif; letter-spacing:.1em; color:var(--m); }}
.d-almu .gl-mk{{ width:9px; height:9px; border:1.4px solid var(--b); border-radius:50%; transform:translateY(-1px); }}
.d-almu .gl-prog::before{{ content:""; position:absolute; left:0; right:0; top:3px; height:1px; background:var(--b); opacity:.5; }}
''')
    # 3 stars
    c.append('''
.d-stars .gl-bg svg{ width:100%; height:100%; display:block; fill:#e9dfc4; opacity:.5; transition:opacity .6s; }
.gl.day .d-stars .gl-bg svg{ fill:#1b1a17; opacity:.10; }
.d-stars .gl-bg .sx path{ fill:#f0b93a; } .gl.day .d-stars .gl-bg .sx path{ fill:#8a6420; }
.d-stars .gl-cons{ width:340px; max-width:100%; height:20px; display:block; }
.d-stars .gl-cons .ln line{ stroke:var(--b); stroke-width:.8; opacity:.7; } .d-stars .gl-cons .dt circle{ fill:var(--a); }
.d-stars .gl-mk{ width:7px; height:7px; border-radius:50%; background:var(--a); box-shadow:0 0 6px var(--a); transform:translateY(-2px); }
.d-stars li:nth-child(2) .gl-mk{ width:5px; height:5px; } .d-stars li:nth-child(3) .gl-mk{ width:4px; height:4px; }
.d-stars .gl-main{ background:linear-gradient(to bottom, transparent, color-mix(in oklab, var(--g) 55%, transparent) 30%); }
''')
    # 4 shadow
    c.append(f'''
.d-shadow .gl-bg{{ background:var(--b); opacity:calc(var(--o) * .9); {mask(hour_fan(), 'no-repeat center top / cover')} }}
.d-shadow .gl-blk{{ background:var(--g); border:1px solid var(--r); border-radius:10px; padding:14px 16px; box-shadow:var(--sh, none); transition:box-shadow .8s; }}
.d-shadow .gl-div{{ height:34px; }}
.d-shadow .gl-div .sc{{ position:absolute; left:0; right:0; top:14px; height:1px; background:var(--b); }}
.d-shadow .gl-div .tk{{ position:absolute; top:8px; width:1px; height:13px; background:var(--b); }}
.d-shadow .gl-div .tk.su{{ background:var(--a); height:18px; top:5px; }}
.d-shadow .gl-div .sun{{ position:absolute; top:8px; width:13px; height:13px; margin-left:-6.5px; border-radius:50%; background:var(--a); box-shadow:0 0 10px var(--a); }}
.d-shadow .gl-div .z{{ position:absolute; top:22px; left:0; right:0; font-size:12px; color:var(--m); }}
.d-shadow .gl-div .z span{{ position:absolute; transform:translateX(-50%); white-space:nowrap; }}
.d-shadow .gl-mk{{ width:10px; height:10px; background:var(--b); {mask('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect x="4.4" y="0" width="1.2" height="10"/><rect x="0" y="9" width="10" height="1"/></svg>', 'no-repeat center / contain')} }}
''')
    # 5 pointers
    c.append(f'''
.d-pointer .gl-mk{{ width:26px; height:8px; background:var(--b); {mask(pointer_svg(), 'no-repeat center / contain')} transform:translateY(-3px); }}
.d-pointer .gl-div{{ height:16px; background:var(--b); {mask(fret_tile(), 'repeat-x left center / 64px 16px')} }}
.d-pointer .lb::before{{ content:""; display:inline-block; width:22px; height:7px; margin-right:8px; background:currentColor; {mask(pointer_svg(), 'no-repeat center / contain')} }}
.d-pointer .gl-prog::before{{ content:""; position:absolute; left:0; right:0; top:2px; height:8px; background:var(--b); opacity:.55; {mask(fret_tile().replace('height="16"','height="8"'), 'repeat-x left center / 32px 8px')} }}
''')
    # 6 isba
    c.append(f'''
.d-isba .gl-div{{ height:34px; }}
.d-isba .gl-div .card{{ position:absolute; left:0; top:2px; width:16px; height:26px; border:1.4px solid var(--b); border-radius:2px; }}
.d-isba .gl-div .card::after{{ content:""; position:absolute; left:50%; top:50%; width:3px; height:3px; margin:-1.5px; border-radius:50%; background:var(--b); }}
.d-isba .gl-div .sc{{ position:absolute; left:16px; top:9px; width:calc({ISBA}px * 14); max-width:calc(100% - 16px); height:12px; background:var(--b); {mask(cord_tile(), f'repeat-x left center / {ISBA}px 12px')} }}
.d-isba .gl-div .su{{ position:absolute; left:calc(16px + {ISBA}px * 9.6 - 5px); top:10px; width:10px; height:10px; border-radius:50%; background:var(--a); }}
.d-isba .gl-div .su::after{{ content:"Sana'a 15°22′ · 9.6 iṣbaʿ"; position:absolute; left:-30px; top:-18px; font:12px 'Alegreya Sans SC', sans-serif; letter-spacing:.06em; color:var(--a); white-space:nowrap; }}
.d-isba .gl-mk{{ width:8px; height:7px; border-radius:50%; background:var(--b); transform:translateY(-1px); }}
.d-isba .gl-side .gl-blk{{ border:1.4px solid var(--b); border-radius:4px; padding:18px 16px 12px; margin-bottom:{ISBA}px; }}
.d-isba .gl-side .gl-blk::before{{ content:""; position:absolute; left:50%; top:7px; width:5px; height:5px; margin-left:-2.5px; border-radius:50%; border:1.4px solid var(--b); }}
.d-isba .gl-side ul{{ margin-bottom:0; }}
.d-isba .gl-prog::before{{ content:""; position:absolute; left:0; right:0; top:0; height:12px; background:var(--b); opacity:.55; {mask(cord_tile(), f'repeat-x left center / {ISBA}px 12px')} }}
''')
    # 7 jadwal
    c.append(f'''
.d-jadwal .gl-blk{{ padding:16px 18px; box-shadow:inset 0 0 0 1px var(--a), inset 0 0 0 4px var(--g), inset 0 0 0 5.5px var(--b); border-radius:2px; }}
.d-jadwal .gl-side .gl-blk{{ margin-bottom:22px; }} .d-jadwal .gl-side ul{{ margin-bottom:0; }}
.d-jadwal .gl-div{{ height:20px; display:flex; align-items:center; gap:10px; }}
.d-jadwal .gl-div .rl{{ flex:1; height:5px; border-top:1px solid var(--a); border-bottom:2px solid var(--b); }}
.d-jadwal .gl-div .ro{{ width:18px; height:18px; background:var(--a); {mask(rosette(), 'no-repeat center / contain')} }}
.d-jadwal .gl-mk{{ width:7px; height:7px; border-radius:50%; background:var(--a); box-shadow:0 0 0 2px var(--g), 0 0 0 3px var(--b); transform:translateY(-2px); margin-right:4px; }}
.d-jadwal .lb::before{{ content:""; display:inline-block; width:6px; height:6px; border-radius:50%; background:currentColor; margin-right:8px; transform:translateY(-1px); }}
.d-jadwal .gl-prog::before{{ content:""; position:absolute; left:24px; right:24px; top:4px; height:4px; border-top:1px solid var(--a); border-bottom:1.5px solid var(--b); }}
''')
    return ''.join(c)

def divider(k):
    if k == 'limb':
        return '<div class="sc"></div><div class="su"></div><div class="z"><span>0°</span><span>30°</span><span>60°</span><span>90°</span></div>'
    if k == 'almu': return '<div class="sc"></div><div class="z"><span>East</span><span>Horizon of Sana\'a</span><span>West</span></div>'
    if k == 'stars': return constellation()
    if k == 'shadow':
        ticks = ''.join(f'<div class="tk" style="left:{a / 360 * 100:.2f}%"></div>' for a in (0, 90, 180, 270, 360))
        su = ''.join(f'<div class="tk su" style="left:{a / 360 * 100:.2f}%"></div>' for a in (145.6, 214.4))
        lab = ''.join(f'<span style="left:{a / 360 * 100:.2f}%">{t}</span>' for a, t in ((0, 'N'), (90, 'E'), (145.6, 'Suhail rises'), (214.4, 'sets'), (270, 'W'), (360, 'N')))
        return f'<div class="sc"></div>{ticks}{su}<div class="sun js-sun" style="left:50%"></div><div class="z">{lab}</div>'
    if k == 'isba': return '<div class="card"></div><div class="sc"></div><div class="su"></div>'
    if k == 'jadwal': return '<div class="rl"></div><div class="ro"></div><div class="rl"></div>'
    return ''

def page(d):
    k = d['key']
    bg = stars_svg() if k == 'stars' else ''
    return f'''<div class="glm d-{k}" data-k="{k}"{'' if k == 'limb' else ' hidden'}>
  <div class="gl-bg">{bg}</div>
  <div class="gl-hd"><nav class="l"><span>Work</span><span>Notes</span></nav><i class="gl-mark" role="img" aria-label="The Astrolabe of Suhail"></i><nav><span>About</span><span class="ar" lang="ar">العربية</span></nav></div>
  <div class="gl-prog"></div>
  <div class="gl-main">
    <div class="gl-art">
      <div class="gl-blk">
        <div class="lb" data-deg="000°">Suhail</div>
        <h1>A sky that follows Sana'a</h1>
        <p class="an ar" lang="ar" dir="rtl">سهيل</p>
        <p class="le">It is day on this site when the sun is up over Sana'a, and night when it has set there.</p>
      </div>
      <div class="gl-div">{divider(k)}</div>
      <div class="gl-blk">
        <div class="lb" data-deg="021.9°">Note · 7 August</div>
        <h2>When Suhail rises, the night cools</h2>
        <p class="pv ar" lang="ar" dir="rtl">إذا طلع سهيل برد الليل</p>
        <p class="tx">Suhail is Canopus, the second-brightest star in the night sky after Sirius. Over Yemen it first appears in the dawn sky in early August, low in the south-east, and its rising has long marked the start of the late-summer rains.</p>
        <p class="ar" lang="ar" dir="rtl">سهيل ثاني ألمع نجوم السماء بعد الشِّعرى. يظهر فجرًا في سماء اليمن في أوائل أغسطس، ومعه تبدأ أمطار آخر الصيف.</p>
      </div>
    </div>
    <aside class="gl-side">
      <div class="gl-blk"><h4>Work</h4>
      <ul>
        <li><span class="gl-mk"></span><span class="t">The Astrolabe of Suhail</span><span class="y">2026</span><span class="d">The mark: an astrolabe computed for Sana'a.</span></li>
        <li><span class="gl-mk"></span><span class="t ar" lang="ar">سُهَيْل</span><span class="y">2026</span><span class="d">The wordmark: the star is a vowel.</span></li>
        <li><span class="gl-mk"></span><span class="t">The sky ramp</span><span class="y">2026</span><span class="d">The site's colours follow the sun over Sana'a.</span></li>
      </ul></div>
      <div class="gl-blk"><h4>Suhail over Sana'a</h4>
      <table><tbody>
        <tr><td>Rises, bearing</td><td class="n">145.6°</td></tr>
        <tr><td>Highest altitude</td><td class="n">21.9°</td></tr>
        <tr><td>Sets, bearing</td><td class="n">214.4°</td></tr>
        <tr><td>Magnitude</td><td class="n">−0.74</td></tr>
      </tbody></table></div>
    </aside>
  </div>
  <div class="gl-ft"><span class="gl-sig"><i class="wm" role="img" aria-label="سُهَيْل"></i><span>© 2026 Suhail AbuOsba</span></span>
    <span>Sana'a <b class="js-time">--:--</b> · Suhail <b class="js-alt">--°</b> · Sun <b class="js-sunalt">--°</b></span></div>
</div>'''

JS = '''<script>
document.querySelectorAll('.gl').forEach(function(root){
  var tabs = root.querySelectorAll('.gl-tabs button[data-k]'), pages = root.querySelectorAll('.glm'), reads = root.querySelectorAll('.gl-read');
  function show(k){ pages.forEach(function(p){ p.hidden = p.dataset.k !== k; }); reads.forEach(function(r){ r.hidden = r.dataset.k !== k; });
    tabs.forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.k === k ? 'true' : 'false'); }); }
  tabs.forEach(function(b){ b.addEventListener('click', function(){ show(b.dataset.k); }); });
  var gs = root.querySelectorAll('.gl-tabs button[data-g]');
  gs.forEach(function(b){ b.addEventListener('click', function(){ root.classList.toggle('day', b.dataset.g === 'day');
    gs.forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); }); });
  var R = Math.PI/180, LAT = 15.37, LON = 44.19;
  function altaz(ra, dec, d){ var n = d.getTime()/86400000 + 2440587.5 - 2451545.0;
    var H = ((280.46061837 + 360.98564736629*n + LON - ra) % 360) * R, la = LAT*R, de = dec*R;
    var alt = Math.asin(Math.sin(la)*Math.sin(de) + Math.cos(la)*Math.cos(de)*Math.cos(H));
    var az = Math.atan2(-Math.sin(H), Math.tan(de)*Math.cos(la) - Math.sin(la)*Math.cos(H));
    return [alt/R, ((az/R) + 360) % 360]; }
  function sun(d){ var n = d.getTime()/86400000 + 2440587.5 - 2451545.0;
    var L = (280.46 + 0.9856474*n) % 360, g = (357.528 + 0.9856003*n) * R;
    var lam = (L + 1.915*Math.sin(g) + 0.020*Math.sin(2*g)) * R, eps = (23.439 - 0.0000004*n) * R;
    var ra = Math.atan2(Math.cos(eps)*Math.sin(lam), Math.cos(lam)) / R, dec = Math.asin(Math.sin(eps)*Math.sin(lam)) / R;
    return altaz((ra + 360) % 360, dec, d); }
  function tick(){
    var d = new Date(), t;
    try { t = d.toLocaleTimeString('en-GB', {timeZone:'Asia/Aden', hour:'2-digit', minute:'2-digit'}); }
    catch(e){ var u = new Date(d.getTime() + 3*3600000); t = ('0'+u.getUTCHours()).slice(-2)+':'+('0'+u.getUTCMinutes()).slice(-2); }
    var s = altaz(95.988, -52.696, d)[0], so = sun(d);
    function f(a){ return (a < 0 ? '−' : '+') + Math.abs(a).toFixed(0) + '°'; }
    root.querySelectorAll('.js-time').forEach(function(e){ e.textContent = t; });
    root.querySelectorAll('.js-alt').forEach(function(e){ e.textContent = f(s); });
    root.querySelectorAll('.js-sunalt').forEach(function(e){ e.textContent = f(so[0]); });
    root.querySelectorAll('.js-sun').forEach(function(e){ e.style.left = (so[1]/360*100).toFixed(2) + '%'; e.style.opacity = so[0] > -0.833 ? 1 : .35; });
    var sh = 'none';
    if (so[0] > 0) { var L = Math.min(16, 3.2/Math.tan(Math.max(so[0], 8)*R)), a = so[1]*R;
      sh = (-Math.sin(a)*L).toFixed(1) + 'px ' + (Math.cos(a)*L).toFixed(1) + 'px 0 rgba(0,0,0,.22)'; }
    root.querySelectorAll('.d-shadow').forEach(function(e){ e.style.setProperty('--sh', sh); });
  }
  tick(); setInterval(tick, 30000);
});
</script>'''

def inner(mark_n, mark_d, wm_n, wm_l):
    s = section(mark_n, mark_d, wm_n, wm_l)
    return s[s.index('<style>'):s.rindex('</div>') + 6]

def section(mark_n, mark_d, wm_n, wm_l):
    tabs = ''.join(f'<button data-k="{d["key"]}" aria-pressed="{"true" if i == 0 else "false"}">{i + 1} · {d["name"]}</button>' for i, d in enumerate(DIRS))
    reads = ''.join(f'<div class="gl-read" data-k="{d["key"]}"{"" if i == 0 else " hidden"}><h3>{i + 1} · {d["name"]}</h3><span class="src">{d["src"]}</span><p>{d["read"]}</p></div>' for i, d in enumerate(DIRS))
    pages = ''.join(page(d) for d in DIRS)
    summ = ''.join(f'<li><b>{i + 1} · {d["name"]}</b>: {d["src"]}.</li>' for i, d in enumerate(DIRS))
    css = (f'.glm .gl-mark{{ background-image:url("{mark_n}"); }} .gl.day .glm .gl-mark{{ background-image:url("{mark_d}"); }}'
           f'.glm .gl-sig i{{ background-image:url("{wm_n}"); }} .gl.day .glm .gl-sig i{{ background-image:url("{wm_l}"); }}')
    return f'''<section class="lk" id="graphic">
    <header class="phead"><span class="pnum">New</span><h2>Graphic language · seven directions</h2></header>
    <p class="idea">What the site uses beyond the logos: dividers, rules, list markers, backgrounds and the reading-progress line under the header. Each direction takes them from a different part of the astrolabe tradition and is applied to the same page as section 5; nothing else changes. Pick one, or the parts you like from several.</p>
    <style>{css}</style>
    <div class="gl" id="gl">
      <div class="gl-tabs">{tabs}<span class="sep"></span><button data-g="night" aria-pressed="true">Night</button><button data-g="day" aria-pressed="false">Day</button></div>
      {reads}
      {pages}
      <ul class="gl-sum">{summ}</ul>
    </div>
  </section>'''
