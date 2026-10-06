import sig
def section(img):
    rows = ''.join(f'''<figure class="ogc"><img src="{img(f'apps/sig/sig-{s["k"]}.png', 1300)}" alt="{s['name']}"><figcaption><b>{i} · {s['name']}</b> {s['why']}</figcaption></figure>'''
                   for i, s in enumerate(sig.SIGS, 1))
    return f'''<section class="lk" id="signature">
    <header class="phead"><span class="pnum">New</span><h2>Applications · email signature</h2><span class="rec">Chosen</span></header>
    <p class="idea"><b>Chosen: one line.</b> The wordmark سُهَيْل, a brass dot, then ABUOSBA.COM in brass small capitals, all on one line and linking to the site. One brass wordmark image serves light and dark mail apps. Files: <code>apps/sig/final/</code> (signature.html to paste, signature-wordmark-brass.png and an ink version, 80 px tall for sharp 40 px display).</p>
    <img class="hero" src="{img('apps/sig/sig-s4.png', 1300)}" alt="chosen signature">
    <details class="earlier"><summary>The five signatures compared</summary><div style="margin-top:14px">
    <p class="read">Five signatures, each shown under a real email in a light and a dark mail app. Email apps don't load the site's fonts, so the wordmark and the mark travel as images and the text falls back to Georgia; the name is just Suhail, per the name rule.</p>
    <div style="display:flex;flex-direction:column;gap:18px">{rows}</div></div></details>
  </section>'''
