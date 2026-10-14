"""Brand book section 6: sizes and clear space for the mark and the wordmark, drawn from the real files.
Units come from the objects themselves: the mark's kursi (throne) and the wordmark's own star."""
import sys, os, re, base64, math
import header
HERE = os.path.dirname(os.path.abspath(__file__))
FINAL_M = os.path.join(HERE, '../musnad/r9/astrolabe/final/')
FINAL_W = os.path.join(HERE, 'wordmark-b2/final/')
NIGHT, PAPER, BRASS, GOLD, INK = '#0f1229', '#ece8e0', '#b78a3c', '#f0b93a', '#1b1a17'
GUIDE = '#7fb4ff'

def uri(p): return 'data:image/svg+xml;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
def inner(path, prefix):
    t = open(path).read()
    t = re.sub(r'<title>.*?</title>', '', t, flags=re.S)
    t = t[t.index('>', t.index('<svg')) + 1:t.rindex('</svg>')]
    ids = set(re.findall(r'id="([^"]+)"', t))
    for i in sorted(ids, key=len, reverse=True):
        t = t.replace(f'id="{i}"', f'id="{prefix}{i}"').replace(f'url(#{i})', f'url(#{prefix}{i})').replace(f'href="#{i}"', f'href="#{prefix}{i}"')
    return t
def vb(path):
    return [float(v) for v in re.search(r'viewBox="([^"]+)"', open(path).read()).group(1).split()]

# ---- measurements (font units of the wordmark drawing; svg units of the mark) ----
W_BASELINE = 1523.0          # svg y of the font baseline in the B2 drawing (from b2.py shaping)
W_STAR = 232.0               # the soft star's span, long tip to long tip (R = 116)
W_CLEAR = 2 * W_STAR         # clear space: two stars
M_INK = (-340, -461, 680, 801)   # mark ink box: limb diameter 680, kursi ring top to limb bottom
M_KURSI = 121.0              # kursi: ring top (-461) to limb top (-340)
M_CLEAR = M_KURSI

def label(x, y, s, anchor='start', size=26, color=GUIDE):
    return f'<text x="{x:.1f}" y="{y:.1f}" fill="{color}" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="{size}" text-anchor="{anchor}">{s}</text>'

def wordmark_diagram():
    p = FINAL_W + 'B2-brass-transparent.svg'
    x, y, w, h = vb(p)
    m = w * 0.0  # transparent file already tight-ish; compute ink box from its 6% margin
    ih = h / 1.12; mm = ih * 0.06
    ix, iy, iw = x + mm, y + mm, w - 2 * mm
    pad = 140
    X0, Y0 = ix - W_CLEAR - pad, iy - W_CLEAR - pad
    VW, VH = iw + 2 * (W_CLEAR + pad), ih + 2 * (W_CLEAR + pad)
    star = 'M-0.4604094326496124 -0.6579274535179138Q-0.4941861927509308 -0.6919324994087219 -0.534156858921051 -0.6654833555221558Q-0.5829166173934937 -0.6332183480262756 -0.5506516098976135 -0.584458589553833Q-0.299442857503891 -0.20482537150382996 -0.2697121798992157 -0.03078155219554901Q-0.3679400682449341 0.16531158983707428 -0.7662259340286255 0.5481428503990173Q-0.8019211292266846 0.5824529528617859 -0.7739617228507996 0.6233137249946594Q-0.7409439086914062 0.671566903591156 -0.6926907896995544 0.6385491490364075Q-0.23678381741046906 0.32658958435058594 -0.02474955841898918 0.27033519744873047Q0.1395525187253952 0.33490100502967834 0.4604094326496124 0.6579274535179138Q0.4941861927509308 0.6919324994087219 0.534156858921051 0.6654833555221558Q0.5829166173934937 0.6332183480262756 0.5506516098976135 0.584458589553833Q0.299442857503891 0.20482537150382996 0.2697121798992157 0.03078155219554901Q0.3679400682449341 -0.16531158983707428 0.7662259340286255 -0.5481428503990173Q0.8019211292266846 -0.5824529528617859 0.7739617228507996 -0.6233137249946594Q0.7409439086914062 -0.671566903591156 0.6926907896995544 -0.6385491490364075Q0.23678381741046906 -0.32658958435058594 0.02474955841898918 -0.27033519744873047Q-0.1395525187253952 -0.33490100502967834 -0.4604094326496124 -0.6579274535179138Z'  # the wordmark's soft star, unit radius
    def unit_star(cx, cy):
        return f'<path d="{star}" transform="translate({cx:.1f} {cy:.1f}) scale({W_STAR / 2:.1f})" fill="{GUIDE}" fill-opacity=".35" stroke="{GUIDE}" stroke-width="3" vector-effect="non-scaling-stroke"/>'
    o = [f'<svg viewBox="{X0:.1f} {Y0:.1f} {VW:.1f} {VH:.1f}" role="img" aria-label="Wordmark clear space">',
         f'<rect x="{X0}" y="{Y0}" width="{VW}" height="{VH}" fill="{NIGHT}"/>',
         f'<rect x="{ix - W_CLEAR:.1f}" y="{iy - W_CLEAR:.1f}" width="{iw + 2 * W_CLEAR:.1f}" height="{ih + 2 * W_CLEAR:.1f}" fill="{GUIDE}" fill-opacity=".07" stroke="{GUIDE}" stroke-width="5" stroke-dasharray="22 14"/>',
         f'<rect x="{ix:.1f}" y="{iy:.1f}" width="{iw:.1f}" height="{ih:.1f}" fill="none" stroke="{GUIDE}" stroke-opacity=".5" stroke-width="3"/>',
         inner(p, 'cw_'),
         f'<line x1="{ix - W_CLEAR:.1f}" y1="{W_BASELINE}" x2="{ix + iw + W_CLEAR:.1f}" y2="{W_BASELINE}" stroke="{GOLD}" stroke-width="4" stroke-dasharray="10 10"/>',
         label(ix - W_CLEAR + 30, W_BASELINE - 30, 'baseline', 'start', 96, GOLD)]
    # two unit stars in the right-hand gap and in the top gap
    for k in range(2):
        o.append(unit_star(ix + iw + W_STAR * (k + 0.5), iy + ih * 0.5))
        o.append(unit_star(ix + iw * 0.5, iy - W_STAR * (k + 0.5)))
    o.append(label(ix + iw + W_CLEAR / 2, iy + ih * 0.5 + W_STAR + 130, '2 stars', 'middle', 96))
    o.append('</svg>')
    return '\n'.join(o)

def mark_diagram():
    p = FINAL_M + 'mark.svg'
    ix, iy, iw, ih = M_INK
    pad = 60
    X0, Y0 = ix - M_CLEAR - pad, iy - M_CLEAR - pad
    VW, VH = iw + 2 * (M_CLEAR + pad), ih + 2 * (M_CLEAR + pad)
    o = [f'<svg viewBox="{X0:.1f} {Y0:.1f} {VW:.1f} {VH:.1f}" role="img" aria-label="Mark clear space">',
         f'<rect x="{X0}" y="{Y0}" width="{VW}" height="{VH}" fill="{PAPER}"/>',
         f'<rect x="{ix - M_CLEAR}" y="{iy - M_CLEAR}" width="{iw + 2 * M_CLEAR}" height="{ih + 2 * M_CLEAR}" fill="#3b6fd0" fill-opacity=".06" stroke="#3b6fd0" stroke-width="2.4" stroke-dasharray="10 7"/>',
         f'<rect x="{ix}" y="{iy}" width="{iw}" height="{ih}" fill="none" stroke="#3b6fd0" stroke-opacity=".45" stroke-width="1.4"/>',
         inner(p, 'cm_')]
    # the kursi as the unit: bracket beside the throne, then the same length in each gap
    bx = 70
    def bracket(x1, y1, x2, y2):
        return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#3b6fd0" stroke-width="3"/>'
    o.append(bracket(bx, iy, bx, iy + M_KURSI)); o.append(bracket(bx - 10, iy, bx + 10, iy)); o.append(bracket(bx - 10, iy + M_KURSI, bx + 10, iy + M_KURSI))
    o.append(f'<text x="{bx + 18}" y="{iy + M_KURSI / 2 + 7}" fill="#3b6fd0" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="20">1 kursī</text>')
    for (x1, y1, x2, y2) in ((ix - M_CLEAR, 0, ix, 0), (ix + iw, 0, ix + iw + M_CLEAR, 0), (0, iy + ih, 0, iy + ih + M_CLEAR)):
        o.append(bracket(x1, y1, x2, y2))
    o.append('</svg>')
    return '\n'.join(o)

def size_ladder():
    def tile(src, h, bg, cap):
        return (f'<figure class="sz"><div class="szt" style="background:{bg}"><img src="{src}" style="height:{h}px;width:auto" alt=""></div>'
                f'<figcaption>{cap}</figcaption></figure>')
    wd, ws = uri(FINAL_W + 'B2-brass-transparent.svg'), uri(FINAL_W + 'B2-small-brass-transparent.svg')
    md, msm = uri(FINAL_M + 'mark.svg'), uri(FINAL_M + 'mark-small.svg')
    row1 = ''.join([tile(wd, 80, NIGHT, '80 px · as drawn'), tile(wd, 56, NIGHT, '56 px · as drawn, smallest'),
                    tile(ws, 48, NIGHT, '48 px · small cut'), tile(ws, 40, NIGHT, '40 px · small cut, header'), tile(ws, 32, NIGHT, '32 px · small cut, smallest')])
    row2 = ''.join([tile(md, 128, PAPER, '128 px · full mark'), tile(md, 96, PAPER, '96 px · full mark, smallest'),
                    tile(msm, 64, PAPER, '64 px · small mark'), tile(msm, 48, PAPER, '48 px · small mark, smallest'),
                    '<figure class="sz"><div class="szt szx">below 48 px</div><figcaption>favicon and avatar: a dedicated design (applications)</figcaption></figure>'])
    return f'<div class="szrow">{row1}</div><div class="szrow">{row2}</div>'

def header_example():
    ws = uri(FINAL_W + 'B2-small-brass-transparent.svg')
    x, y, w, h = vb(FINAL_W + 'B2-small-brass-transparent.svg')
    frac = (W_BASELINE - y) / h          # baseline position down the image
    H = 40; drop = H * (1 - frac)
    return (f'<div class="hdx"><span class="hdx-wm"><img src="{ws}" style="height:{H}px;width:auto;vertical-align:-{drop:.1f}px" alt="سُهَيْل"></span>'
            f'<nav><span>Work</span><span>Notes</span><span>About</span><span lang="ar" class="ar">العربية</span></nav></div>'), frac

CSS = header.CSS + '''
.rules{ display:flex; flex-direction:column; gap:22px; }
.rgrid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr)); gap:18px; align-items:start; }
.rgrid figure{ margin:0; display:flex; flex-direction:column; gap:8px; }
.rgrid svg{ width:100%; height:auto; display:block; border-radius:12px; }
.rgrid figcaption, .sz figcaption{ font:12.5px 'IBM Plex Mono', ui-monospace, monospace; color:var(--muted); }
.szrow{ display:flex; flex-wrap:wrap; gap:14px; align-items:flex-end; }
.sz{ margin:0; display:flex; flex-direction:column; gap:6px; }
.szt{ border-radius:10px; padding:14px 16px; display:flex; align-items:center; justify-content:center; border:1px solid var(--rule); }
.szx{ min-height:48px; min-width:120px; font:12px 'IBM Plex Mono', ui-monospace, monospace; color:var(--muted); border-style:dashed; }
.hdx{ display:flex; align-items:baseline; gap:22px; background:#161b44; padding:18px 24px; border-radius:12px; flex-wrap:wrap; border:1px solid var(--rule); }
.hdx nav{ display:flex; gap:20px; }
.hdx nav span{ font:400 16px 'Alegreya', Georgia, serif; color:#ece8e0; }
.hdx nav .ar{ font-family:'Noto Naskh Arabic', serif; }
.rlist{ margin:0; padding-left:20px; display:flex; flex-direction:column; gap:6px; max-width:75ch; }
.tscale{ width:100%; border-collapse:collapse; }
.tscale td{ border-top:1px solid var(--rule); padding:10px 8px 10px 0; vertical-align:baseline; color:var(--text); }
.tscale td.k{ font:12px 'IBM Plex Mono', ui-monospace, monospace; color:var(--muted); white-space:nowrap; }
.tscale td.s{ font:12px 'IBM Plex Mono', ui-monospace, monospace; color:var(--gold); white-space:nowrap; }
.tsc-wrap{ overflow-x:auto; }
'''

def section(num=6):
    hdr, frac = header_example()
    return f'''<section class="lk" id="rules">
    <header class="phead"><span class="pnum">{num}</span><h2>Sizes and clear space</h2></header>
    <p class="idea">Both measures come from the objects themselves. The mark's clear space is one kursī, the throne at the top of the astrolabe. The wordmark's clear space is two of its own stars. Nothing else (text, images, edges) comes inside the dashed line.</p>
    <div class="rules">
      <div class="rgrid">
        <figure>{mark_diagram()}<figcaption>The mark: one kursī of clear space on every side.</figcaption></figure>
        <figure>{wordmark_diagram()}<figcaption>The wordmark: two star-widths of clear space; the gold line is the font baseline.</figcaption></figure>
      </div>
      <h3 class="tk">Smallest sizes, at real pixels</h3>
      {size_ladder()}
      <h3 class="tk">In the header: the astrolabe, centred <span class="rec">Chosen</span></h3>
      <p class="read">The astrolabe sits in the middle of the header with the menu split on either side, symmetrical like the face of the instrument. It is 56 px tall (48 px on phones), and the menu lines up with the centre of the plate, not the middle of the image, because the kursī adds height on top.</p>
      {header.block(only='centre')}
      <details class="earlier"><summary>The other three layouts (seal, hanging, right-hand)</summary>{header.block(skip='centre')}</details>
      <ul class="rlist">
        <li>Header: the astrolabe centred, 56 px (48 px on phones), small version; menu Alegreya 16 px, Work · Notes on the left, About · العربية on the right.</li>
        <li>The wordmark moves to the footer as the site's signature (small cut, 32 to 40 px), far from the mark. The two are never placed side by side.</li>
        <li>Brass on night grounds, ink on light. Never outlined, stretched, rotated, or set on a photograph without a solid ground behind it.</li>
        <li>The wordmark's star is always the soft flat star; the faceted gem belongs to the astrolabe.</li>
      </ul>
    </div>
  </section>'''
