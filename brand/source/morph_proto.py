"""Build the unwind prototype: the mark's rete strokes morph into the unrolled wordmark and back."""
import json, re
ROOT = '/private/tmp/claude-501/-Users-suhail-Documents-Projects-Claude-Projects/ccce290d-ec85-426a-a28e-66dc70955fba/scratchpad/'
MARK = open(ROOT + 'musnad/r9/astrolabe/final/mark.svg').read()
WORD = open(ROOT + 'brand/wordmarks/unrolled/unrolled.svg').read()
M = json.load(open(ROOT + 'brand/wordmarks/unrolled/unrolled-morph.json'))
DX, DY = 431, 48                      # where the word sits in the mark's frame

def inner(svg, prefix):
    body = re.sub(r'^.*?<svg[^>]*>', '', svg, flags=re.S).rsplit('</svg>', 1)[0]
    body = re.sub(r'<title>.*?</title>', '', body, flags=re.S)
    body = re.sub(r'<rect id="ground"[^>]*/>', '', body)
    for i in set(re.findall(r'id="([^"]+)"', body)):
        body = body.replace(f'id="{i}"', f'id="{prefix}{i}"').replace(f'url(#{i})', f'url(#{prefix}{i})')
    return body

def proto():
    star = re.search(r'<g id="suhail_star".*?</g>', MARK, re.S)
    star_markup = re.sub(r'id="[^"]+"', '', star.group(0)) if star else ''
    star_markup = re.sub(r'^<g\s+transform="[^"]*"', '<g', star_markup)       # positioned by the script
    data = {'rete': [s['points'] for s in M['rete']], 'word': [[[x + DX, y + DY] for x, y in s['points']] for s in M['strokes']],
            'width': [s.get('width', 24) if not s.get('taper') else sum(s['taper']) / 2 for s in M['strokes']],
            'star': [M['star']['rete'], [M['star']['word'][0] + DX, M['star']['word'][1] + DY]]}
    svg = f'''<svg class="unwind" viewBox="-520 -480 1040 860" role="img" aria-label="The astrolabe unwinding into the word سهيل">
  <g id="uw_mk">{inner(MARK, 'uwm_')}</g>
  <g id="uw_mo" style="display:none" fill="none" stroke="#b78a3c" stroke-linecap="round" stroke-linejoin="round">
    {''.join(f'<path id="uw_p{i}" stroke-width="{w}"/>' for i, w in enumerate(data['width']))}
    <g id="uw_star" stroke="none" fill="#f0b93a">{star_markup}</g>
  </g>
  <g id="uw_wd" style="display:none" transform="translate({DX} {DY})">{inner(WORD, 'uww_')}</g>
</svg>'''
    js = '''<script>
(function () {
  const D = ''' + json.dumps(data) + ''';
  const $ = id => document.getElementById(id);
  const LETTERS = ['lam_stem','lam_bowl','heh','yeh_bowl','yeh_pointer','seen_body','seen_tooth_1','seen_tooth_2','seen_tooth_3','suhail'];
  const INSTR = ['face','plate','track','horizon','limb','hours','noon_midnight','rise-set-marks','throne','throne_ring','starfield','sun_body','pivot','trail'];
  const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  const pathAt = (i, p) => 'M' + D.rete[i].map((a, k) => { const b = D.word[i][k]; return (a[0] + (b[0] - a[0]) * p).toFixed(1) + ' ' + (a[1] + (b[1] - a[1]) * p).toFixed(1); }).join('L');
  function frame(p) {                                  // p = 0 (the mark) … 1 (the word)
    const e = ease(p);
    D.rete.forEach((_, i) => $('uw_p' + i).setAttribute('d', pathAt(i, e)));
    const s = D.star, x = s[0][0] + (s[1][0] - s[0][0]) * e, y = s[0][1] + (s[1][1] - s[0][1]) * e;
    $('uw_star').setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    const fade = Math.max(0, 1 - p / .45);
    INSTR.forEach(id => { const el = $('uwm_' + id); if (el) el.style.opacity = fade; });
  }
  let busy = false, state = 0;
  function run(to) {
    if (busy || to === state) return; busy = true;
    $('uw_wd').style.display = 'none'; $('uw_mk').style.display = ''; $('uw_mo').style.display = '';
    LETTERS.forEach(id => { const el = $('uwm_' + id); if (el) el.style.opacity = 0; });
    const t0 = performance.now(), dur = 2600, from = state;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), p = from + (to - from) * k; frame(p);
      if (k < 1) return requestAnimationFrame(step);
      state = to; busy = false;
      if (to === 1) { $('uw_mo').style.display = 'none'; $('uw_mk').style.display = 'none'; $('uw_wd').style.display = ''; }
      else { $('uw_mo').style.display = 'none'; LETTERS.forEach(id => { const el = $('uwm_' + id); if (el) el.style.opacity = 1; }); }
      const b = document.getElementById('uw_btn'); if (b) b.textContent = state ? 'Wind it back into the astrolabe' : 'Unwind into the name';
    };
    requestAnimationFrame(step);
  }
  frame(0);
  document.addEventListener('click', e => { if (e.target.id === 'uw_btn') run(state ? 0 : 1); });
  setTimeout(() => run(1), 1500);                    // plays once on load
})();
</script>'''
    return svg, js

if __name__ == '__main__':
    s, j = proto(); open('morph_proto.html', 'w').write('<div style="background:#0f1229;padding:20px">' + s + '<button id="uw_btn">Unwind into the name</button></div>' + j)
    print(len(s) // 1024, 'KB svg')
