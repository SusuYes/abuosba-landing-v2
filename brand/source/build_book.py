"""Brand book v3: the name drawn by the same pen (wordmarks + the unwind prototype); earlier lockups kept below."""
import json, base64, io, html, os, re
from PIL import Image
from morph_proto import proto
import skyramp
import typeset
import rules
import gl
import gl2
import qd
import qd2
import qd3
import motion
import intro
import goldopts
import apps_sec
import og_sec
import sig_sec
W = 'wordmarks/'
def img(p, w=1100):
    im = Image.open(p).convert('RGB')
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    q = im.quantize(colors=160, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    b = io.BytesIO(); q.save(b, 'PNG', optimize=True); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
def j(k): return json.load(open(f'{W}{k}/{k}.json'))
def txt(v): return ' '.join(v) if isinstance(v, list) else (v or '')
READ = {
 'unrolled': "The strongest link to the mark: it is the rete's own twelve strokes, straightened, so the word and the astrolabe are literally the same letters. The ي takes its correct middle-of-word form (a tooth with two dots), and the long bowl and tail move to the ل at the end of the word, which is where the mark's pointer already leaves from. It ends, like the mark, in the star-pointer and Suhail.",
 'meeting': "Clever and true: Suhail and سهيل both end in l, so the two scripts run toward each other and finish on one shared stem with Suhail above it. The Latin half is still the more font-like part, and the Arabic is small next to it.",
 'suhail': "",
 'monogram': "A س whose bowl runs on and becomes the mark's own pointer, ending in Suhail: one gesture with a flash at the end, which suits a sign-off and an avatar. Watch for: at a glance the silhouette can read as a key, and an Arabic reader will see a kufi س with a swash rather than the textbook form. The other two candidates are in the fold-out.",
}
ORDER = [k for k in ['suhail', 'unrolled', 'meeting', 'monogram'] if os.path.exists(f'{W}{k}/{k}.json')]
FINAL = '/private/tmp/claude-501/-Users-suhail-Documents-Projects-Claude-Projects/ccce290d-ec85-426a-a28e-66dc70955fba/scratchpad/musnad/r9/astrolabe/final/'
def svguri(p): return 'data:image/svg+xml;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
cards = []; others = []
for k in ORDER:
    d = j(k)
    figs = ''
    for x, cap in [('candidates', 'Three candidates: A, an S whose head is the pointer; B, the finished one; C, an S carrying the teeth of س'), ('light', 'On a light ground'), ('avatar', 'As an avatar'), ('header', 'Header size, 1x and 2x'), ('construction', 'How it is built')]:
        p = f'{W}{k}/{k}-{x}.png'
        if os.path.exists(p): figs += f'<figure><img src="{img(p, 1000)}" alt="{k} {x}"><figcaption>{cap}</figcaption></figure>'
    others.append(f'''<section class="lk" id="{k}">
  <header class="phead"><h2>{html.escape(d.get("title", k)) + (' · first version (robotic)' if k == 'suhail' else '')}</h2></header>
  <img class="hero" src="{img(f'{W}{k}/{k}.png')}" alt="{html.escape(d.get('title', k))}">
  <p class="idea">{html.escape(txt(d.get('idea')))}</p>
  {f'<p class="read"><b>My read.</b> {html.escape(READ.get(k, ""))}</p>' if READ.get(k) else ''}
  <details><summary>Light version, header size, construction</summary>{figs}</details>
</section>''')
svg, js = proto()
S2 = W + 'suhail2/'
TREAD = {
 'kashida': "My pick. 'Suhail' stands on one line, written last as a single stroke from under the S; past the l it runs on and sweeps up along the mark's horizon circle into the star, exactly as the ي's bowl becomes the pointer in the mark. Tall pointed stems like alifs, the a as the ه's eye on the line. It is the only one whose link to the mark is still visible at header size without explanation.",
 'engraved': "The most refined: every bowl is the ي's ecliptic circle at its true radius, the l is the lam's true length, thick downstrokes and hairline upstrokes come from the mark's two pens, and the word stands on a graduated horizon arc. Its story is invisible unless told, and at header size it becomes an elegant thick-thin script.",
 'calligraphic': "A hand with pressure: full-weight downstrokes, light joins, points on the tall stems. The S opens with the س's arc and its three teeth, the a is the ه's eye, the i is dotted with a small gem star. At header size the teeth can read as eyelashes or a crown.",
}
tcards = []
for k in ['kashida', 'engraved', 'calligraphic']:
    d = json.load(open(f'{S2}{k}/{k}.json'))
    figs = ''.join(f'<figure><img src="{img(f"{S2}{k}/{k}-{x}.png", 1000)}" alt="{k} {x}"><figcaption>{cap}</figcaption></figure>' for x, cap in [('light', 'On a light ground'), ('header', 'Header size, 1x and 2x'), ('construction', 'How it is built')] if os.path.exists(f'{S2}{k}/{k}-{x}.png'))
    tcards.append(f'''<div class="take"><h3 class="tk">{k.capitalize()}{' <span class="rec">My pick</span>' if k == 'kashida' else ''}</h3>
      <img class="hero" src="{img(f'{S2}{k}/{k}.png')}" alt="Suhail, {k}">
      <p class="read"><b>My read.</b> {html.escape(TREAD[k])}</p>
      <details><summary>Light version, header size, construction</summary>{figs}</details></div>''')
S3 = W + 'suhail3/'
H3 = {
 'harakat-naskh': "The stronger of the two. Every Latin letter is a letter or vowel mark of سُهَيْل, in order, written with a naskh reed's thick and thin so it looks written by an Arabic calligrapher: the S is س with its teeth, the u is the damma, the h is the dome and leg of ه, the a's roof is the fatha, the i is the ي's tooth with the sukun as its dot, and the l is ل running into the mark's star. Still rough: the S's teeth are heavy and crowd its head, and the ه is only hinted in the h (with both eyes the word read 'Sukail').",
 'harakat-pen': "The same derivations in the mark's own round pen. Cleaner and closer to the astrolabe's strokes, but plainer: it looks more constructed than written.",
}
h3cards = []
for k in ['harakat-naskh', 'harakat-pen']:
    figs = ''.join(f'<figure><img src="{img(f"{S3}{k}/{k}-{x}.png", 1000)}" alt="{k} {x}"><figcaption>{cap}</figcaption></figure>' for x, cap in [('light', 'On a light ground'), ('header', 'Header size, 1x and 2x'), ('construction', 'How it is built')] if os.path.exists(f'{S3}{k}/{k}-{x}.png'))
    h3cards.append(f'''<div class="take"><h3 class="tk">{'Naskh reed' if k == 'harakat-naskh' else 'The mark’s pen'}{' <span class="rec">Stronger</span>' if k == 'harakat-naskh' else ''}</h3>
      <img class="hero" src="{img(f'{S3}{k}/{k}.png')}" alt="Suhail, {k}">
      <figure><img src="{img(f'{S3}{k}/{k}-derivation.png', 1100)}" alt="How each letter comes from سُهَيْل"><figcaption>Each Latin letter beside the Arabic letter or vowel it is built from; gold traces the shared strokes</figcaption></figure>
      <p class="read"><b>My read.</b> {html.escape(H3[k])}</p>
      <details><summary>Light version, header size, construction</summary>{figs}</details></div>''')
S4 = W + 'suhail4/'
r4 = []
for k, name, note in [('ruqaa-bold', 'Bold', "My pick. Aref Ruqaa's professionally drawn Latin, untouched except for two meaningful edits: the dot of the i is the font's own Arabic sukun (the vowel mark over the ي of سُهَيْل), and the l becomes the font's own final ل, whose bowl sweeps on in one smooth curve into the mark's star-pointer and Suhail. Bold carries the tail's weight best and holds up at header size."),
                      ('ruqaa-regular', 'Regular', "The same edits on the regular weight: lighter and more elegant large, but the tail's belly becomes the heaviest stroke in the word.")]:
    figs = ''.join(f'<figure><img src="{img(f"{S4}{k}/{k}-{x}.png", 1000)}" alt="{k} {x}"><figcaption>{cap}</figcaption></figure>' for x, cap in [('derivation', 'Where the Arabic pieces come from'), ('light', 'On a light ground'), ('header', 'Header size, 1x and 2x'), ('joins', 'Close-ups of every edit, with the curvature shown')] if os.path.exists(f'{S4}{k}/{k}-{x}.png'))
    r4.append(f'''<div class="take"><h3 class="tk">{name}{' <span class="rec">My pick</span>' if k == 'ruqaa-bold' else ''}</h3>
      <img class="hero" src="{img(f'{S4}{k}/{k}.png')}" alt="Suhail, {name}">
      <p class="read"><b>My read.</b> {html.escape(note)}</p>
      <details><summary>Derivation, light version, header size, joins</summary>{figs}</details></div>''')
E = 'emblem/'
ecards = []
for k, name, note in [('quadrant', 'The Quadrant of Suhail', "My pick. A sine quadrant, the astrolabe's real companion instrument, with its thread set to 21.93°, the highest Suhail climbs over Sana'a. One straight line runs from the apex, through the bead, touches the bowl of ل and becomes its star-pointer, ending in Suhail on the 21.93° mark of the scale. سهيل stands on the horizontal through that same mark, so the baseline, the thread and the star all record the same angle. The name is large and plainly legible, and every line on the plate is the instrument working."),
                      ('plate', 'The Plate of the Name', "An astrolabe plate made for Sana'a, engraved with the name instead of a sky: سهيل stands on Sana'a's real horizon, and the ل's pointer rises to the exact point where Suhail culminates. True and close to the mark, but the looping ل is awkward and the lower half is empty; it also reads more like a variant of the astrolabe than a second object.")]:
    figs = ''.join(f'<figure><img src="{img(f"{E}{k}/{k}-{x}.png", 1100)}" alt="{k} {x}"><figcaption>{cap}</figcaption></figure>' for x, cap in [('construction', 'How it is built, and what every line means'), ('light', 'On a light ground'), ('small', 'Small sizes'), ('crops', 'Close-ups of every join')] if os.path.exists(f'{E}{k}/{k}-{x}.png'))
    ecards.append(f'''<div class="take"><h3 class="tk">{name}{' <span class="rec">My pick</span>' if k == 'quadrant' else ''}</h3>
      <img class="hero" src="{img(f'{E}{k}/{k}.png')}" alt="{name}">
      <p class="read"><b>My read.</b> {html.escape(note)}</p>
      <details{' open' if k == 'quadrant' else ''}><summary>Construction, light version, small sizes, close-ups</summary>{figs}</details></div>''')
E2 = 'emblem2/'
E2L = [
 ('quadrant-nastaliq', 'The Quadrant, in Nastaliq', 'Noto Nastaliq', "The sine quadrant held apex-up as it is used. The three joins of سهيل in nastaliq lie on one line, and the word is turned so that line lies exactly on the thread set to 21.93°: the name literally hangs on the measurement and runs out to Suhail on the scale. The lower half shows 21.93 + 52.70 + 15.37 = 90."),
 ('kamal', 'The Kamal of Suhail', 'Aref Ruqaa', "The Indian Ocean navigator's card and knotted string, seen as a sight is taken: the card's foot on the horizon, Suhail exactly on its top edge, so the card spans Suhail's altitude over Sana'a (13.7 finger-widths). The string threads through the eye of ه in the name, with knots at true spacing and a gold knot for Sana'a."),
 ('almanac', 'The Almanac Leaf', 'Scheherazade New', "A Rasulid-style almanac tablet headed by the star instead of a month. The heading cartouche with سهيل drops a column down the day of the rising (25 Tammūz in the old calendar, 7 August today), ending in the gem; the proverb is engraved below."),
 ('volvelle', 'The Wheel of Suhail', 'Lemonada', "A volvelle, the turning-disc calculator of medieval manuscripts: set the star on any day and the window shows the month and the ring the days since Suhail's rising. Everything lines up at rest on 7 August. Built to really turn on the website."),
 ('khann', 'The Navigator\'s Rose', 'Ruwudu', "The 32-point star compass of Red Sea and Indian Ocean sailors, with the two rhumbs where Suhail rises and sets in gold and the gem on the rising one; the name fills the medallion. The most familiar form of the eight."),
 ('globe', 'Al-Ṣūfī\'s Globe', 'Kufam', "A celestial globe set for Sana'a, with the ship Argo drawn around its real stars and Suhail at its steering oar, as Ptolemy and al-Ṣūfī placed it, sitting on the meridian ring at 21.93°. The name arches across the equator band."),
 ('sundial', 'The Dial of Sana\'a', 'square kufic', "A horizontal sundial computed for Sana'a (five of the six hours fall within 45°, true near the equator), with the name in square kufic as the plaque where every hour line meets. Suhail is the night counterpart, on the horizon scale at its rising bearing."),
 ('armillary', 'The Rings of Suhail', 'Amiri', "An armillary sphere (dhāt al-ḥalaq) tilted for Sana'a, with Suhail's own daily ring in gold above the horizon and the star where it rises. The truest instrument, but the name is small on the horizon ring and the whole leans toward a dish."),
]
e2cards = []
for i, (k, name, font, note) in enumerate(E2L, 1):
    figs = ''.join(f'<figure><img src="{img(f"{E2}{k}/{k}-{x}.png", 1100)}" alt="{k} {x}"><figcaption>{cap}</figcaption></figure>' for x, cap in [('construction', 'How it is built'), ('states', 'Turning'), ('light', 'On a light ground'), ('small', 'Small sizes')] if os.path.exists(f'{E2}{k}/{k}-{x}.png'))
    e2cards.append(f'''<div class="take"><h3 class="tk">{i} · {html.escape(name)} <span style="font:12px var(--mono, monospace);color:var(--muted);letter-spacing:.04em;text-transform:none">{html.escape(font)}</span></h3>
      <img class="hero" src="{img(f'{E2}{k}/{k}.png', 1000)}" alt="{html.escape(name)}">
      <p class="read">{html.escape(note)}</p>
      <details><summary>Construction, light version, small sizes</summary>{figs}</details></div>''')
EMB2 = f'''<section class="lk" id="emblem">
    <header class="phead"><span class="pnum">2</span><h2>The name as an instrument · eight objects</h2></header>
    <p class="idea">Eight real instruments and artefacts of the Arab sky tradition, each with سهيل large and legible in a different professionally drawn Arabic hand (no letters from the mark), and each where the name is part of how the object works. Ordered by my preference.</p>
    <img class="hero" src="{img(E2 + '_all8.png', 1100)}" alt="All eight">
    {''.join(e2cards)}
    <details class="earlier"><summary>Round 1: the first quadrant and plate</summary>'''
EMB = f'''<section class="lk" id="emblem-r1">
    <header class="phead"><span class="pnum">2</span><h2>The name as an instrument · second object</h2></header>
    <p class="idea">The name gets its own legendary object, built from the astrolabe's system: سهيل clearly legible in Arabic, with the construction visible, and Suhail in Latin small. It is a sibling instrument, never placed beside the mark.</p>
    {''.join(ecards)}
  </section>'''
SUP = f'''<section class="lk" id="supporting">
    <header class="phead"><h2>Suhail · quiet wordmark (for text-heavy places)</h2></header>
    <p class="idea">The hand-built versions looked rough because they were assembled in code, without the finishing a type designer does. This one starts from Aref Ruqaa, a Latin drawn by a type designer to sit with ruqʿa calligraphy, and changes only what carries meaning, using the same font's own Arabic glyphs. Every new joint was checked for smoothness against the font's own curves.</p>
    <img class="hero" src="{img(S4 + 'compare.png', 1100)}" alt="The plain font beside the edited wordmarks">
    {''.join(r4)}
    <details class="earlier"><summary>Earlier: Suhail spelled in Arabic (hand-built)</summary>
    <p class="idea">The Latin name is written with the Arabic name's own letters and vowel marks. Fully vowelled, سهيل is سُهَيْل: S from س, u from the damma over it, h from ه, a from the fatha over it, i from ي with the sukun as its dot, and l from ل, running into the star.</p>
    {''.join(h3cards)}</details>
    <details class="earlier"><summary>Earlier takes: calligraphic, engraved, kashida</summary>
    <img class="hero" src="{img(S2 + 'compare.png', 1100)}" alt="The three earlier takes beside the mark">
    {''.join(tcards)}</details>
  </section>'''
_unused = f'''<section class="lk" id="supporting-old">
    <header class="phead"><span class="pnum">2</span><h2>Suhail, by the same pen · supporting name</h2></header>
    <p class="idea">The first version looked machine-written, with only the l carrying any meaning. These three are written with intent, each in the mark's pen language, and each with more of the mark in it than the l.</p>
    <img class="hero" src="{img(S2 + 'compare.png', 1100)}" alt="The three takes beside the mark">
    {''.join(tcards)}
  </section>'''
def inner_svg(p, pre):
    t = open(p).read(); t = re.sub(r'<title>.*?</title>', '', t, flags=re.S)
    for i in set(re.findall(r'id="([^"]+)"', t)): t = t.replace(f'id="{i}"', f'id="{pre}{i}"').replace(f'url(#{i})', f'url(#{pre}{i})')
    return t
def word_uri(p):
    t = open(p).read(); t = re.sub(r'<rect[^>]*id="(ground|bg)"[^>]*/>', '', t); t = re.sub(r'<rect x="[^"]*" y="[^"]*" width="[^"]*" height="[^"]*" fill="#(0f1229|ece8e0|ECE8E0)"/>', '', t)
    return 'data:image/svg+xml;base64,' + base64.b64encode(t.encode()).decode()
MARKINLINE = inner_svg(FINAL + 'mark.svg', 'sk_')
SKYJS = skyramp.js(word_uri(W + 'suhail/suhail.svg'), word_uri(W + 'suhail/suhail-light.svg'))
PAL = [('Brass', '#b78a3c', 'the instrument, the letters'), ('Gold', '#f0b93a', 'Suhail, the sun, live highlights'), ('Gem light', '#fff0b8', 'the star\'s bright facet'),
       ('Night', '#161b44', 'sky, sun below −18°'), ('Twilight', '#33295e', 'sky, sun −18° to −3°'), ('Dawn copper', '#5b2915', 'sky, sun −3° to +6°'), ('Day', '#2d5a94', 'sky, sun above +6°'),
       ('Glass red', '#b8432c', 'qamariya glass (added for the graphic language)'), ('Ink', '#1b1a17', 'text on light'), ('Alabaster', '#ece8e0', 'reading ground')]
SWATCHES = ''.join(f'<div class="s"><i style="background:{h}"></i><b>{n}</b><code>{h}</code><span>{u}</span></div>' for n, h, u in PAL)
old = open('brand-book-v2-lockups.html').read()
style = old[old.index('<style>'):old.index('</style>') + 8].replace('</style>', '''
.fam{ font:600 15px 'IBM Plex Mono', ui-monospace, monospace; letter-spacing:.08em; color:var(--gold); margin-top:14px; border-top:1px solid var(--rule); padding-top:18px; }
.take{ display:flex; flex-direction:column; gap:10px; border-top:1px solid var(--rule); padding-top:16px; }
.take .tk{ font:600 14px 'IBM Plex Mono', ui-monospace, monospace; letter-spacing:.1em; text-transform:uppercase; color:var(--text); display:flex; gap:10px; align-items:center; }
.marks{ display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr)); gap:14px; }
.marks figure{ display:flex; flex-direction:column; gap:6px; } .marks img{ width:100%; height:auto; }
.marks .mono img{ background:#0f1229; border-radius:10px; padding:10px; } .marks .mono.lt img{ background:#ece8e0; }
.marks figcaption{ font:12.5px 'IBM Plex Mono', ui-monospace, monospace; color:var(--muted); }
.sw{ display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:12px; }
.sw .s{ display:flex; flex-direction:column; gap:3px; font-size:13px; } .sw i{ display:block; height:56px; border-radius:10px; border:1px solid var(--rule); }
.sw b{ font-weight:600; font-size:14px; } .sw code{ font:12px 'IBM Plex Mono', ui-monospace, monospace; color:var(--gold); } .sw span{ color:var(--muted); }
.unwind{ width:100%; height:auto; display:block; background:#0f1229; border-radius:12px; }
.uwbtn{ align-self:flex-start; font:500 14px 'IBM Plex Mono', ui-monospace, monospace; color:#0f1229; background:var(--gold); border:0; border-radius:999px; padding:8px 16px; cursor:pointer; }
.earlier summary{ cursor:pointer; font:500 13px 'IBM Plex Mono', ui-monospace, monospace; letter-spacing:.06em; color:var(--brass); }
.earlier .lk{ margin-top:16px; }
''' + skyramp.css() + '''</style>''')
links = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=IBM+Plex+Mono:wght@400;500&display=swap">'
earlier_cards = old[old.index('<section class="lk"'):old.index('<p class="earlier">')]
W5 = 'wordmark5/'
WMN = {
 'A': ('A · Latin "Suhail"', [('A2', "Bodoni Moda + Amiri", "My pick in A. Amiri's own seen (سـ) forms the top of the S, so its three teeth crown the Latin letter; the i is dotted with the astrolabe's gem star. The Arabic letter is unmistakable at a glance."),
                               ('A1', "Aref Ruqaa Bold", "Ruqaa's own looped final ه crowns the h, and the i is dotted with the sukun. Clean, but to a Latin reader the h is mostly a looped h."),
                               ('A3', "El Messiri", "The end of the name is written in Arabic: the i is a medial ي joined by a kashida to the a and l, with a fatha over the a and a sukun over the i. The most literally bilingual, but the fatha can read as an accent.")]),
 'B': ('B · Arabic "سهيل"', [('B1', "Aref Ruqaa Bold", "My pick in B, and my overall pick. The font's own swash ل keeps going: it sweeps up over the stem and becomes the astrolabe's star-pointer, ending in the gem star. The name finishes in its own star, the same gesture as the mark."),
                              ('B2', "Noto Nastaliq Urdu", "Fully vowelled سُهَيْل: the sukun over the ي is the gem star, the damma and fatha are gold like the vowels of an illuminated manuscript, and the ل's bowl is drawn out long under the name. Beautiful large, too fine in a small header."),
                              ('B3', "Kufam", "One confident kashida after س, and the two dots of ي are two gem stars. The most legible and the best header shape, but closest to the plain font.")]),
 'C': ('C · bilingual "Suhail" + "سهيل"', [('C3', "El Messiri", "My pick in C. The ل's bowl is drawn out into a cradle that holds the whole Latin name: Suhail rests inside the Arabic letter, and the i is dotted with the gem. Reads at every size."),
                                            ('C2', "Aref Ruqaa Bold", "The final ل is drawn out into one long stroke that both names share, ending in its upturned tip with the star. The most calligraphic and the most legendary gesture, but it is two tiers and tight in a small header."),
                                            ('C1', "Amiri Bold", "Both names end in l, so the Latin l is replaced by the Arabic ل: Suhai runs right into one stem and سهي runs left into the same stem, crowned by the star. The cleverest single move, but it reads more Arabic than Latin.")]),
}
wmsecs = []
for fam, (title, opts) in WMN.items():
    cards = []
    for key, font, note in opts:
        d = f'{W5}{fam}/{key}/'
        figs = ''.join(f'<figure><img src="{img(d + key + "-" + x + ".png", 1000)}" alt="{key} {x}"><figcaption>{cap}</figcaption></figure>' for x, cap in [('meaning', 'What the moves mean'), ('light', 'On a light ground'), ('header', 'Header size, 1x and 2x')] if os.path.exists(d + key + '-' + x + '.png'))
        cards.append(f'''<div class="take"><h3 class="tk">{key} <span style="font:12px 'IBM Plex Mono',monospace;color:var(--muted);text-transform:none;letter-spacing:.03em">{html.escape(font)}</span>{' <span class="rec">My pick</span>' if 'My pick' in note else ''}</h3>
          <img class="hero" src="{img(d + key + '.png', 1000)}" alt="{key}">
          <p class="read">{html.escape(note)}</p>
          <details><summary>Meaning, light version, header size</summary>{figs}</details></div>''')
    wmsecs.append(f'<h3 class="fam">{html.escape(title)}</h3>' + ''.join(cards))
W6 = 'wordmark6/'
W6L = [
 ('long-rise', 'ruqʿa', "The ل's bowl drawn out long and level, then lifting in one smooth curve into the star-pointer and gem, like Suhail rising off the horizon. Joins C2's length and B1's rise; the most header-friendly of the ruqʿa takes."),
 ('rise', 'ruqʿa', "B1 refined: the swash ل sweeps up over its stem and the star lands just above it. Clearer of the stem than before, so it no longer reads as ك at small size."),
 ('naskh', 'naskh · Amiri', "A classical naskh ل whose lengthened bowl turns up and holds the star on its tip. Calm and bookish; the clearest of the Arabic-only takes in a small header."),
 ('nastaliq', 'nastaliq', "The word keeps nastaliq's diagonal hang; the deep ل bowl sweeps long and flicks up into the star. The most beautiful large; loses detail in a small header."),
 ('long', 'ruqʿa', "C2's Arabic alone: the ل drawn out level, its own upturned tip crowned by the star. The most legible, but the least special."),
 ('cradle', 'El Messiri', "C3 in the long-stroke spirit: the ل's level stroke carries a small Latin Suhail and rises into the star. The best header shape; closest to C3."),
 ('diwani', 'diwani gesture', "The ل's tail swings up and back over the whole word into the star. Note: the font underneath is not true diwani (no free diwani font exists), and the loop can read as a bracket."),
 ('underline', 'ruqʿa', "The ل loops down and returns under the whole word like a signature underline, ending in the star past the س. At small size it can suggest a final ى."),
]
w6cards = []
for i, (k, hand, note) in enumerate(W6L, 1):
    d = f'{W6}{k}/'
    figs = ''.join(f'<figure><img src="{img(d + k + "-" + x + ".png", 1000)}" alt="{k} {x}"><figcaption>{cap}</figcaption></figure>' for x, cap in [('light', 'On a light ground'), ('header', 'Header size, 1x and 2x')] if os.path.exists(d + k + '-' + x + '.png'))
    w6cards.append(f'''<div class="take"><h3 class="tk">{i} · {k} <span style="font:12px 'IBM Plex Mono',monospace;color:var(--muted);text-transform:none;letter-spacing:.03em">{html.escape(hand)}</span></h3>
      <img class="hero" src="{img(d + k + '.png', 1000)}" alt="{k}">
      <p class="read">{html.escape(note)}</p>
      <details><summary>Light version, header size</summary>{figs}</details></div>''')
WM = f'''<section class="lk" id="wordmark">
    <header class="phead"><span class="pnum">2</span><h2>The wordmark · سُهَيْل, the star is a vowel</h2></header>
    <p class="idea">سُهَيْل, fully vowelled in nastaliq (Noto Nastaliq Urdu Bold). The sukun over the ي, the small sign that says “no vowel here”, is Suhail's star: the star sits in the name exactly where a vowel belongs. The damma and fatha are gold, like the vowels of an illuminated manuscript, and the ل's bowl is drawn out long under the name as a horizon. The vowels and the star are kept small and light, so the word leads.</p>
    <div class="take"><img class="hero" src="{img('wordmark-b2/final/B2.png', 1200)}" alt="سهيل wordmark, night">
      <img class="hero" src="{img('wordmark-b2/final/B2-light.png', 1200)}" alt="سهيل wordmark, light">
      <figure><img src="{img('wordmark-b2/final/B2-final-header.png', 1240)}" alt="header bars"><figcaption>Two cuts of one drawing. From 56 px up, the wordmark as drawn. From 32 to 55 px, the small cut: the same vowels and star, with the letters 20 units heavier so the thin joins hold. Below 32 px, use the astrolabe mark instead.</figcaption></figure>
      <p class="read"><b>The rules.</b> The star is the soft four-point star, flat gold (#f0b93a) on dark grounds and ink on light, never the faceted gem; the faceted gem belongs to the astrolabe. Vowels: the font's damma and fatha at 62%, gold. Files: <code>wordmark-b2/final/</code> (B2, B2-small, light and transparent versions).</p>
      <details class="earlier"><summary>How we got here: the small cut, seven stars, and the size ladders</summary>
      <img class="hero" src="{img(W5 + 'B/B2/B2.png', 1200)}" alt="B2 as first drawn">
      <img class="hero" src="{img(W5 + 'B/B2/B2-light.png', 1200)}" alt="سهيل wordmark, light">
      <figure><img src="{img(W5 + 'B/B2/B2-header.png', 1100)}" alt="header sizes"><figcaption>Header size. At 40 px the star is about 4 px and the gold vowels 2 to 3 px, so below 56 px the small cut takes over.</figcaption></figure>
      <h3 class="tk" style="margin-top:28px">The small cut · for 32 to 55 px</h3>
      <p class="read">The same drawing, re-cut to survive small sizes, the way type designers make an optical size. Strokes are 20 units heavier. The damma and fatha are 25% larger and heavier, and tucked down toward their letters. The gem keeps only its four long rays, each still split into the gem's two facet tones, at 1.5× size; the fatha moves 70 units right to give it room. That leaves about 1.7 px of clear space around the star at 40 px. Use B2 as drawn from 56 px up.</p>
      <img class="hero" src="{img('wordmark-b2/small/B2-small-compare.png', 1220)}" alt="B2 and its small cut side by side">
      <figure><img src="{img('wordmark-b2/small/B2-small-header.png', 1240)}" alt="header bars"><figcaption>Header bars at real pixel size, as drawn against the small cut.</figcaption></figure>
      <h3 class="tk" style="margin-top:28px">The soft star, sized down · pick a step</h3>
      <p class="read">You chose the soft star and found the shapes above the name too big. The vowels and the star step down together here, from L1 (vowels at the font's own size, small star) to L4 (what you saw before). The star is re-placed at each step for the most clear space.</p>
      <p class="read"><b>Smaller still.</b> L1 was still too big, so these go below the font's own vowel size, M1 to M4.</p>
      <img class="hero" src="{img('wordmark-b2/star/soft-ladder2.png', 1400)}" alt="smaller sizes">
      <details><summary>The first ladder, L1 to L4</summary>
      <img class="hero" src="{img('wordmark-b2/star/soft-ladder.png', 1400)}" alt="four sizes"></details>
      <h3 class="tk" style="margin-top:28px">The small cut's star · seven ways to draw it</h3>
      <p class="read">The first small-cut star had ruler-straight edges and pale facets, so it sat on the calligraphy like a sticker. These seven are all flat gold like the vowels (except 1, the baseline), and several are drawn from the font's own marks: its fatha stroke, its sukun, and its Arabic star sign. Each is sized and placed automatically for at least 70 units (about 1.4 px at 40 px) of clear space.</p>
      <img class="hero" src="{img('wordmark-b2/star/stars-detail.png', 1760)}" alt="seven stars, close up">
      <img class="hero" src="{img('wordmark-b2/star/stars-sheet.png', 1240)}" alt="seven stars in the word and in headers">
      </details>
      <details><summary>What each move means</summary><img src="{img(W5 + 'B/B2/B2-meaning.png', 1100)}" alt="meaning"></details></div>
    <details class="earlier"><summary>Round 6: eight takes on the long ل ending in the star</summary>{''.join(w6cards)}</details>
    <details class="earlier"><summary>The earlier nine options (A, B, C)</summary>
      <figure><img src="{img(W5 + 'A/_family.png', 1100)}" alt="A"><figcaption>A · Latin</figcaption></figure>
      <figure><img src="{img(W5 + 'B/_family.png', 1100)}" alt="B"><figcaption>B · Arabic</figcaption></figure>
      <figure><img src="{img(W5 + 'C/_family.png', 1100)}" alt="C"><figcaption>C · bilingual</figcaption></figure>
    </details>
  </section>'''
style = style.replace('</style>', typeset.CSS + rules.CSS + gl.CSS + gl.dir_css() + gl2.CSS + qd.CSS + qd2.CSS + qd3.CSS + motion.CSS + intro.CSS + intro.CSS2 + intro.CSS3 + goldopts.CSS + apps_sec.CSS + og_sec.CSS + '</style>')
GLA = (gl.uri('header/mark-small-crop.svg'), gl.uri('header/mark-day-crop.svg'), gl.uri('wordmark-b2/final/B2-small-brass-transparent.svg'), gl.uri('wordmark-b2/final/B2-small-ink-transparent.svg'))
R2 = gl2.section(*GLA, '')
page = f'''<title>Suhail Brand Book</title>
{links}
{typeset.LINK}
{gl2.LINK}
{style}
<div class="wrap">
  <div class="top">
    <div class="eyebrow">Core identity</div>
    <h1>The Astrolabe of Suhail</h1>
    <p>One primary sign, the astrolabe, and one wordmark for the name. They are never placed side by side.</p>
  </div>
  {sig_sec.section(img)}
  {og_sec.section(img)}
  {apps_sec.section(img)}
  {goldopts.section()}
  {motion.section(intro.section3(), intro.section2(), intro.section())}
  <section class="lk" id="graphic">
    <header class="phead"><span class="pnum">7</span><h2>Graphic language · Qamariya and Musnad</h2><span class="rec">Chosen</span></header>
    <p class="idea">The sky stays in the header, in the astrolabe; the page below is Sana'a and its writing. A qamariya, the coloured-glass window of the tower houses, opens the page; round glass windows mark lists; the raised-brick band of the façades runs under the header; and each section opens with its own name in Musnad, one letter to a pane of glass, with a small caption.</p>
    {R2[R2.index('<style>'):R2.index('<div class="gl gl2"')]}
    {qd3.page_mock(qd3.div_caption, 'gl7')}
    <h3 class="tk" style="margin-top:22px">The section dividers</h3>
    {qd3.chosen_strip()}
    <ul class="rlist">
      <li><b>Qamariya arch:</b> once per page, over the opening (the home page and the start of a long page). At night its glass glows like a lit window; by day the light shines through.</li>
      <li><b>Section divider:</b> the section's Arabic name in Musnad, one consonant per pane of glass, between word-divider bars and rules, with a caption (transliteration · Arabic · English). Work عمل, Notes خواطر, About عني, Contact تواصل.</li>
      <li><b>Raised-brick band:</b> under the header, in gypsum white (warm grey by day).</li>
      <li><b>Round windows:</b> list bullets, four panes of glass in a gypsum cross.</li>
      <li><b>Glass colours:</b> gold #f0b93a, red #b8432c (new), blue #2d5a94, pale #fff0b8, always held in gypsum white.</li>
    </ul>
    <details class="earlier"><summary>Round 5: three ways to set the section name</summary>{qd3.block()}</details>
    <details class="earlier"><summary>Round 4: what the panes hold (five ways)</summary>{qd2.block()}</details>
    <details class="earlier"><summary>Round 3: the Qamariya page with five dividers</summary>{qd.section()}</details>
    <details class="earlier"><summary>Round 2: Sana'a and its writing, six directions</summary>{R2[R2.index('<div class="gl gl2"'):R2.index('<details class="earlier">')]}</details>
    <details class="earlier"><summary>Round 1: seven directions from the astronomy (set aside: "stuck in the astronomy world")</summary>{gl.inner(*GLA)}</details>
  </section>
  <section class="lk" id="primary">
    <header class="phead"><span class="pnum">1</span><h2>The mark · primary</h2><span class="rec">Chosen</span></header>
    <div class="marks"><figure><img src="{svguri(FINAL + 'mark.svg')}" alt="The mark at night"><figcaption>Night</figcaption></figure><figure><img src="{svguri(FINAL + 'mark-day.svg')}" alt="The mark by day"><figcaption>Day</figcaption></figure><figure class="mono"><img src="{svguri(FINAL + 'mark-mono-brass.svg')}" alt="One colour, brass"><figcaption>One colour, brass</figcaption></figure><figure class="mono lt"><img src="{svguri(FINAL + 'mark-mono-dark.svg')}" alt="One colour, dark"><figcaption>One colour, dark</figcaption></figure></div>
    <p class="idea">An astrolabe built for Sana'a. Its star-plate is made of the letters of سهيل, Suhail is the cut-gem star at the tip of the ي, and on the site it draws itself and turns with the real sky. Used for the home page, the favicon, social images and anywhere the identity leads.</p>
  </section>
  {WM}
  <section class="lk" id="palette">
    <header class="phead"><span class="pnum">3</span><h2>Palette · proposal</h2></header>
    <div class="sw">{SWATCHES}</div>
    <p class="idea">Everything comes from the instrument and the real sky. Brass and gold are the metal; the four sky colours are the face of the astrolabe as the sun moves over Sana'a, so the site itself can shift from night to dawn to day. Ink and alabaster are for reading.</p>
  </section>
  {skyramp.section(MARKINLINE)}
  {typeset.section(5)}
  {rules.section(6)}
  <p class="earlier">Earlier rounds (lockups, pen wordmarks, instrument emblems, the unwind prototype) are archived and set aside.</p>
</div>
{SKYJS}
{typeset.JS}
{gl.JS}
{motion.JS}
{intro.JS}'''
open('brand-book.html', 'w').write(page)
print(len(page) // 1024, 'KB')
