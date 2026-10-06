"""Final B2 wordmark: M4 proportions (harakat x0.62 +8 weight, soft star R116, fatha +70).
large = font weight; small (32-55 px) = word +20 units. Same star and harakat in both."""
import sys, os, json
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../star')); sys.path.insert(0, os.path.join(HERE, '../small'))
os.chdir(os.path.join(HERE, '../star'))
import ladder, small, search
from ladder import tf, P, D, wm, SOFT
from PIL import Image, ImageDraw, ImageFont
STAR_OFF = (60, -120)
def build(ww):
    cfg = dict(small.CFGS['S']); cfg.update(hs=0.62, hw=8, ww=ww)
    b = small.cut(cfg); s = b['stars'][0]
    W = P(b['_union']); F = P(next(i['d'] for i in b['items'] if i['id'] == 'fatha'))
    dx, dy = STAR_OFF  # the position approved in M4 (2026-10-03)
    p = tf(SOFT, 116, 0, 0, -116, s['x'] + dx, s['y'] + dy)
    best = (min(search.gap(p, W), search.gap(p, F)), p, dx, dy)
    return b, best[1], best[0], best[2:]
os.chdir(HERE)
out = {}
for name, ww in (('B2', 0), ('B2-small', 20)):
    b, star, g, off = build(ww); v = ladder.view_of(b, star)
    out[name] = dict(gap=g, star_offset=off, aspect=round(v[2] / v[3], 3))
    for th, suf in (('dark', ''), ('light', '-light')):
        svg = ladder.svg(b, star, th, v).replace('<svg ', f'<svg width="1200" height="{1200 * v[3] / v[2]:.1f}" ', 1)
        open(f'{name}{suf}.svg', 'w').write(svg); wm.render(f'{name}{suf}.svg', f'{name}{suf}.png', width=1200)
        for h in (32, 40, 48, 56, 80):
            wm.render(f'{name}{suf}.svg', f'_{name}{suf}-{h}.png', height=h)
    # transparent versions for use on any ground
    for th, suf in (('dark', '-brass'), ('light', '-ink')):
        svg = ladder.svg(b, star, th, v); svg = svg.split('<rect', 1)[0] + svg.split('/>', 2)[2] if False else svg
        import re
        svg = re.sub(r'<rect [^>]*/>', '', svg, count=1)
        open(f'{name}{suf}-transparent.svg', 'w').write(svg)
json.dump(out, open('final.json', 'w'), indent=1); print(out)
# header sheet: large from 56 px, small below
F = lambda n: ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', n)
sheet = Image.new('RGB', (1240, 330), '#2c3036'); d = ImageDraw.Draw(sheet)
d.text((16, 10), 'Header bars at real pixel size: the small cut at 32, 40 and 48 px, the wordmark as drawn from 56 px', fill='#e8e8e8', font=F(15))
y = 40
for suf, bg, fg in (('', wm.NIGHT, '#d9d4c7'), ('-light', wm.PAPER, '#55524c')):
    x = 16
    for name, h in (('B2-small', 32), ('B2-small', 40), ('B2-small', 48), ('B2', 56)):
        im = Image.open(f'_{name}{suf}-{h}.png').convert('RGB'); bar = Image.new('RGB', (im.width + 140, max(64, h + 20)), bg)
        bar.paste(im, (12, (bar.height - im.height) // 2)); ImageDraw.Draw(bar).text((im.width + 26, bar.height // 2 - 8), 'Work  ·  Notes', fill=fg, font=F(13))
        sheet.paste(bar, (x, y)); d.text((x, y + bar.height + 2), f'{h} px', fill='#9aa0a8', font=F(11)); x += bar.width + 12
    y += 140
sheet.save('B2-final-header.png')
