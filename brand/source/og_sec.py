import og
def section(img):
    cards = ''.join(f'''<figure class="ogc"><img src="{img(f'apps/og/{c["k"]}.png', 900)}" alt="{c['name']}"><figcaption><b>{i} · {c['name']}</b> {c['why']}</figcaption></figure>'''
                    for i, c in enumerate(og.CARDS, 1))
    pages = ''.join(f'''<figure class="ogc"><img src="{img(f'apps/og/{k}.png', 900)}" alt="{n}"><figcaption><b>{n}</b></figcaption></figure>'''
                    for k, n in (('t-home', 'Home'), ('t-work', 'A work page'), ('t-note', 'A note'), ('t-about', 'About')))
    return f'''<section class="lk" id="share">
    <header class="phead"><span class="pnum">New</span><h2>Applications · share cards</h2><span class="rec">Chosen</span></header>
    <p class="idea"><b>Chosen: the note template.</b> Every page shares with its own card: the section's name in Musnad glass with its caption, the page's title in Alegreya, the astrolabe small top right, and along the foot the Arabic title in gold (bottom left) facing the wordmark سُهَيْل (bottom right). No name or text about you: the wordmark says whose site it is. The home page drops the glass row. Template: <code>apps/og/</code> (og.py builds a card from a section, a title and the Arabic).</p>
    <div class="og-grid">{pages}</div>
    <details class="earlier"><summary>Bottom left: the two readings compared (A chosen)</summary><div class="og-grid" style="margin-top:14px"><figure class="ogc"><img src="{img('apps/og/_varA.png', 1240)}" alt="A"><figcaption><b>A · The Arabic title bottom left</b> The Arabic leaves the title and sits bottom left, on one line with the wordmark bottom right: English up top, Arabic at the foot.</figcaption></figure>
      <figure class="ogc"><img src="{img('apps/og/_varB.png', 1240)}" alt="B"><figcaption><b>B · The wordmark bottom left</b> The wordmark moves to the bottom left, under the title's left edge; the Arabic stays on the title line.</figcaption></figure></div></details>
    <details class="earlier"><summary>The six designs compared</summary><div style="margin-top:14px">
    <p class="read">The picture that appears when someone posts a link to the site in a chat or on social media (1200 × 630). Six designs from approved parts; the mark and the wordmark never appear together. The strip shows them at the size a chat preview really is.</p>
    <img class="hero" src="{img('apps/og/_thumbs.png', 1300)}" alt="share cards at chat size">
    <div class="og-grid">{cards}</div></div></details>
  </section>'''
CSS = '''
.og-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr)); gap:20px; }
.ogc{ margin:0; display:flex; flex-direction:column; gap:8px; } .ogc img{ width:100%; height:auto; border-radius:10px; border:1px solid var(--rule); }
.ogc figcaption{ font-size:14px; color:var(--muted); } .ogc b{ display:block; color:var(--text); }
'''
