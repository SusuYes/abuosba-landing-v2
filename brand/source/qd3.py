"""Glass divider, round 3: the panes spell the section names (Musnad is consonantal, so only consonants are written)."""
import gl2
from gl2 import gv, GOLD, RED, BLUE, GEM
from qd2 import panes

GLASS = [GOLD, RED, BLUE, GEM]
SECTIONS = [  # English, Arabic, Musnad (right to left in logical order), transliteration, glass order
    ('Work', 'عمل', '𐩲𐩣𐩡', 'ʿml', [GOLD, RED, BLUE]),
    ('Notes', 'خواطر', '𐩭𐩥𐩷𐩧', 'ḫwṭr', [BLUE, GEM, RED, GOLD]),
    ('About', 'عني', '𐩲𐩬𐩺', 'ʿny', [RED, GOLD, GEM]),
    ('Contact', 'تواصل', '𐩩𐩥𐩮𐩡', 'twṣl', [GEM, BLUE, GOLD, RED]),
]
ALT_NOTES = ('Notes', 'كتابات', '𐩫𐩩𐩨𐩩', 'ktbt', [GOLD, BLUE, RED, GEM])

def arabic_panes(word, cols):
    cells = ''.join(f'<span class="pane ar" style="--c:{gv(cols[i % len(cols)])}"><span lang="ar">{ch}</span></span>' for i, ch in enumerate(word))
    return f'<span class="panes" dir="rtl">{cells}</span>'

def div_caption(s):
    en, ar, ms, tr, cols = s
    return (f'<div class="qdv-d"><div class="qg"><div class="rl"></div><div class="bar"></div>{panes(ms, cols)}<div class="bar"></div><div class="rl"></div></div>'
            f'<span class="gloss">{tr} · {ar} · {en}</span></div>')
def div_heading(s):
    en, ar, ms, tr, cols = s
    return (f'<div class="qdv-d hd"><div class="qg"><div class="rl"></div><div class="bar"></div>{panes(ms, cols)}<div class="bar"></div><div class="rl"></div></div>'
            f'<div class="sh"><span class="ar" lang="ar">{ar}</span><span class="en">{en}</span></div></div>')
def div_arabic(s):
    en, ar, ms, tr, cols = s
    return (f'<div class="qdv-d"><div class="qg"><div class="rl"></div><div class="bar"></div>{arabic_panes(ar, cols)}<div class="bar"></div><div class="rl"></div></div>'
            f'<span class="gloss">{en}</span></div>')

OPTS = [
    dict(name='Musnad, with a caption', fn=div_caption,
         why="The section's Arabic name spelled in Musnad, one letter per pane, with a small caption underneath (transliteration · Arabic · English). The divider names the section without taking over."),
    dict(name='Musnad as the section heading', fn=div_heading,
         why="The divider becomes the heading itself: the Musnad panes, then the Arabic name in gold and the English in small capitals beneath. The section starts with its name in three scripts."),
    dict(name='Arabic letters in the glass', fn=div_arabic,
         why="The same idea with the Arabic letters themselves in the panes, unjoined like Musnad, so every Arabic reader can read it at a glance. Less ancient, more legible."),
]

CSS = '''
.qdv-d .sh{ display:flex; flex-direction:column; align-items:center; gap:0; }
.qdv-d .sh .ar{ font:22px/1.4 'Noto Naskh Arabic', serif; color:var(--a); }
.qdv-d .sh .en{ font:500 12px 'Alegreya Sans SC', sans-serif; letter-spacing:.16em; text-transform:uppercase; color:var(--m); }
.qv .pane.ar span{ font:24px/1 'Noto Naskh Arabic', serif; color:#1b1a17; transform:translateY(2px); }
.qdv-alt{ font-size:14px; color:var(--muted); margin:8px 0 0; }
'''

def block():
    out = []
    for i, o in enumerate(OPTS, 1):
        seq = lambda: '<div class="ln m"></div><div class="ln s"></div>'.join(o['fn'](s) for s in SECTIONS)
        out.append(f'''<div class="qdv-opt"><h3>{i} · {o["name"]}</h3><p>{o["why"]}</p>
      <div class="qdv-row"><div class="gl gl2"><div class="glm qv">{seq()}</div></div><div class="gl gl2 day"><div class="glm qv">{seq()}</div></div></div></div>''')
    alt = div_caption(ALT_NOTES)
    out.append(f'''<div class="qdv-opt"><h3>The word for Notes</h3><p>Two choices for Notes: خواطر (thoughts, shown above) or كتابات (writings), which reads more like a body of written work.</p>
      <div class="qdv-row"><div class="gl gl2"><div class="glm qv">{div_caption(SECTIONS[1])}{alt}</div></div><div class="gl gl2 day"><div class="glm qv">{div_caption(SECTIONS[1])}{alt}</div></div></div></div>''')
    return f'<div class="qdv">{"".join(out)}</div>'

def page_mock(fn=None, gid='gl4'):
    """the full page with a section divider before Notes"""
    fn = fn or div_heading
    qam = next(d for d in gl2.DIRS if d['key'] == 'qam')
    return f'''<div class="gl gl2" id="{gid}"><div class="gl-tabs"><button data-g="night" aria-pressed="true">Night</button><button data-g="day" aria-pressed="false">Day</button></div>
      {gl2.page(qam, extra_cls='qv qn', div_html=fn(SECTIONS[1]), band_html='<div class="qc"></div>', shown=True, dk='qn')}</div>'''

def chosen_strip():
    """the four section dividers, option 1, night and day"""
    seq = lambda: '<div class="ln m"></div><div class="ln s"></div>'.join(div_caption(s) for s in SECTIONS)
    return f'<div class="qdv"><div class="qdv-row"><div class="gl gl2"><div class="glm qv">{seq()}</div></div><div class="gl gl2 day"><div class="glm qv">{seq()}</div></div></div></div>'
