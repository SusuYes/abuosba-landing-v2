"""Glass Musnad divider, round 2: what the panes hold, so it doesn't always spell سهيل.
Each option shows three dividers as they'd appear in sequence down a page, at night and by day."""
from gl2 import gv, GOLD, RED, BLUE, GEM, MUSNAD

GLASS = [GOLD, RED, BLUE, GEM]
IND = '𐩿'  # numeric indicator, written before and after a number

def panes(chars, colours=None, empty=0):
    colours = colours or GLASS
    if empty:
        cells = ''.join(f'<span class="pane" style="--c:{gv(colours[i % len(colours)])}"></span>' for i in range(empty))
    else:
        cells = ''.join(f'<span class="pane" style="--c:{gv(colours[i % len(colours)])}"><span lang="xsa">{c}</span></span>' for i, c in enumerate(chars))
    return f'<span class="panes" dir="rtl">{cells}</span>'

def divider(inner, gloss='', bars=('<div class="bar"></div>', '<div class="bar"></div>')):
    g = f'<span class="gloss">{gloss}</span>' if gloss else ''
    return f'<div class="qdv-d"><div class="qg"><div class="rl"></div>{bars[0]}{inner}{bars[1]}<div class="rl"></div></div>{g}</div>'

def num(n):
    """Musnad numeral, additive, right to left: 5 = 𐩭, 1 = 𐩽"""
    s = '𐩭' * (n // 5) + '𐩽' * (n % 5)
    return s
IND_BARS = (f'<span class="ind" lang="xsa">{IND}</span>', f'<span class="ind" lang="xsa">{IND}</span>')

OPTS = [
    dict(k='word', name='A word per divider',
         why="Each divider spells a word that fits what follows, so it changes through the page and carries meaning. The pane count follows the word. Shown: بيت (house), نجم (star), and ṣnʿw, Sana'a's ancient name exactly as Sabaean inscriptions spell it.",
         ds=[divider(panes('𐩨𐩺𐩩'), 'byt · بيت · house'), divider(panes('𐩬𐩴𐩣', [BLUE, GEM, GOLD]), 'njm · نجم · star'),
             divider(panes('𐩮𐩬𐩲𐩥', [RED, GOLD, BLUE, GEM]), 'ṣnʿw · صنعاء · Sana\'a, as the inscriptions spell it')]),
    dict(k='num', name='Section numbers',
         why="The dividers count the sections in Musnad numerals, bracketed by the numeral sign (𐩿) as the inscriptions did. 1 is a stroke, 5 is its own sign, so the dividers grow and change shape.",
         ds=[divider(panes(num(1)), 'section 1', IND_BARS), divider(panes(num(3), [RED, BLUE, GEM]), 'section 3', IND_BARS),
             divider(panes(num(5), [BLUE]), 'section 5', IND_BARS)]),
    dict(k='letter', name='One letter at a time',
         why="Each divider holds a single pane with one letter; reading down the page, the dividers spell سهيل one letter at a time, so the name only appears across the whole page, never in one place.",
         ds=[divider(panes(MUSNAD[0], [GOLD]), '1st divider: s'), divider(panes(MUSNAD[1], [RED]), '2nd: h'),
             divider(panes(MUSNAD[2], [BLUE]), '3rd: y (the 4th, l, closes the page)')]),
    dict(k='glass', name='Glass only',
         why="No letters at all: just the arched panes of glass between the bars, with the count and the colour order changing from divider to divider like the windows of a façade.",
         ds=[divider(panes('', empty=3)), divider(panes('', [BLUE, GEM, RED, GOLD, BLUE], empty=5)), divider(panes('', [RED, GOLD, BLUE, GEM], empty=4))]),
    dict(k='once', name='Glass, then the name once',
         why="Glass-only dividers through the page, and the full name in glass only once, as the last divider, like signing the end of a page.",
         ds=[divider(panes('', empty=3)), divider(panes('', [BLUE, GEM, RED, GOLD], empty=4)), divider(panes(MUSNAD), 'the last divider on the page')]),
]

CSS = '''
.qdv{ display:flex; flex-direction:column; gap:26px; }
.qdv-opt h3{ font:600 14px 'IBM Plex Mono', ui-monospace, monospace; letter-spacing:.1em; text-transform:uppercase; color:var(--text); margin:0; }
.qdv-opt > p{ margin:4px 0 10px; color:var(--muted); max-width:74ch; font-size:14.5px; }
.qdv-row{ display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr)); gap:12px; }
.qdv-row .glm{ padding:18px 22px 20px; display:flex; flex-direction:column; gap:16px; }
.qdv .ln{ height:9px; border-radius:5px; background:var(--r); }
.qdv .ln.s{ width:62%; } .qdv .ln.m{ width:84%; }
.qdv-d, .qv .qdv-d{ display:flex; flex-direction:column; align-items:center; gap:6px; }
.qdv-d .qg{ width:100%; }
.qdv .gloss, .qv .gloss{ font:12px 'Alegreya Sans SC', sans-serif; letter-spacing:.06em; color:var(--m); }
.qdv .ind{ font:24px 'Noto Sans Old South Arabian', serif; color:var(--a); }
.qdv .pane:empty{ min-width:34px; }
'''

def block():
    out = []
    for i, o in enumerate(OPTS, 1):
        seq = lambda: ('<div class="ln m"></div><div class="ln s"></div>' + o['ds'][0] + '<div class="ln m"></div><div class="ln"></div>'
                       + o['ds'][1] + '<div class="ln s"></div><div class="ln m"></div>' + o['ds'][2])
        out.append(f'''<div class="qdv-opt"><h3>{i} · {o["name"]}</h3><p>{o["why"]}</p>
      <div class="qdv-row"><div class="gl gl2"><div class="glm qv">{seq()}</div></div><div class="gl gl2 day"><div class="glm qv">{seq()}</div></div></div></div>''')
    return f'<div class="qdv">{"".join(out)}</div>'
