"""Applications round 1: favicon and avatar."""
import base64
def uri(p): return 'data:image/svg+xml;base64,' + base64.b64encode(open(p,'rb').read()).decode()
OPTS = [('star','Suhail',"The cut-gem star alone in a brass ring: the one element of the mark that survives at 16 px. The clearest in a browser tab, and the star is the name."),
        ('arch','Star in the arch',"Suhail inside one arched pane of the qamariya, so the icon joins the mark (the star) and the site's graphic language (the window). Reads at 16 px as a little lit doorway."),
        ('qamariya','Qamariya',"The half-window in glass, exactly as on the site. Colourful and distinctive in a row of tabs, but it says 'window', not 'Suhail'."),
        ('glass','Glass sīn',"One arched pane holding the Musnad letter س, the first letter of سهيل. Bold and simple; meaning needs to be learnt."),
        ('letters','The letters',"The astrolabe's own سهيل, with the pointer and the star, without the instrument around it. Beautiful at 180 px and as an avatar, a blur at 16 px."),
        ('ring','Ring and star',"The rim, the kursī and the pointer to Suhail: the astrolabe reduced to its outline. Recognisable as the mark, but thin at 16 px.")]
OPTS2 = [('full','The mark as it is',"The astrolabe exactly as designed, for comparison: at 16 px the hour ticks, plate lines and stars turn to grey noise."),
        ('reduced','Reduced',"The rim, the kursī, the letters سهيل with the pointer, and Suhail; everything else removed. Letters a touch heavier, the star half again as large."),
        ('round','Reduced, round',"The same without the kursī, so the rim fills the icon: the astrolabe's face, edge to edge. The best fit for a round avatar and the strongest at 32 px."),
        ('bold','Bold',"A small-size cut for 16 px: rim and letters much heavier, star larger, the eyes of the ه kept open. The clearest in a browser tab."),
        ('horizon','With the horizon',"The round reduction, keeping Sana'a's horizon line and the pivot: more of the instrument, a little busier."),
        ('coin','Medallion',"A solid brass disc with the letters struck into it in night, like a coin: the boldest silhouette, but the face colour is lost.")]

def section(img):
    cards = ''.join(f'''<figure class="fv"><div class="fv-i"><img src="{uri(f'apps/fav/{k}.svg')}" alt="{n}"><img src="{uri(f'apps/fav/{k}-day.svg')}" alt="{n}, day"></div>
      <figcaption><b>{i} · {n}</b> {w}</figcaption></figure>''' for i, (k, n, w) in enumerate(OPTS, 1))
    cards2 = ''.join(f'''<figure class="fv"><div class="fv-i"><img src="{uri(f'apps/fav2/{k}.svg')}" alt="{n}"><img src="{uri(f'apps/fav2/{k}-day.svg')}" alt="{n}, day"></div>
      <figcaption><b>{i} · {n}</b> {w}</figcaption></figure>''' for i, (k, n, w) in enumerate(OPTS2, 1))
    return f'''<section class="lk" id="apps">
    <header class="phead"><span class="pnum">New</span><h2>Applications · favicon and avatar</h2><span class="rec">Chosen</span></header>
    <p class="idea"><b>Chosen: the mark as it is.</b> The same astrolabe everywhere, from the browser tab to the social avatar: the small version of the mark (its star enlarged, the half-hour ticks dropped) as the favicon, and the mark on its own face colour for the phone icon and avatars. Night and day versions; the site swaps them with the sky over Sana'a. Files: <code>apps/final/</code> (favicon.svg and -day, PNG at 16, 32, 48; apple-touch-icon 180; avatar 1024).</p>
    <div class="fv-i" style="gap:16px;align-items:end;flex-wrap:wrap">
      <img src="{uri('apps/final/avatar.svg')}" style="width:160px;height:160px;border-radius:50%" alt="avatar, night">
      <img src="{uri('apps/final/avatar-day.svg')}" style="width:160px;height:160px;border-radius:50%" alt="avatar, day">
      <img src="{uri('apps/final/apple-touch-icon.svg')}" style="width:90px;height:90px;border-radius:20px" alt="phone icon">
      <img src="{uri('apps/final/favicon.svg')}" style="width:32px;height:32px" alt="favicon 32"><img src="{uri('apps/final/favicon.svg')}" style="width:16px;height:16px" alt="favicon 16"></div>
    <details class="earlier"><summary>Round 2: six reductions of the logo</summary><div style="margin-top:14px">
    <p class="read">The icon is the logo itself, cut down for small sizes the way type gets a small-size cut: the hour ticks, plate lines and star field go, the rim and the letters get heavier, and the star grows. Six reductions, night and day, at real sizes.</p>
    <img class="hero" src="{img('apps/fav2/_sheet.png', 1300)}" alt="logo-based favicons at real sizes">
    <figure><img src="{img('apps/fav2/_16x6.png', 680)}" alt="16 px enlarged" style="image-rendering:pixelated"><figcaption>The 16 px versions enlarged pixel by pixel: Bold and Reduced, round keep the ring, the sweep of the letters and the star.</figcaption></figure>
    <div class="fv-grid">{cards2}</div></div></details>
    <details class="earlier"><summary>Round 1: six icons from other brand elements (set aside: not the logo)</summary><div style="margin-top:14px">
    <p class="read">Below 48 px the astrolabe turns to a blur, so the browser tab, the phone home screen and the social avatar need their own small sign. Six, each made from an existing brand element, each in a night and a day version. The sheet shows them at their real sizes: 16, 32 and 48 px on dark and light tab bars, as a 180 px phone icon, and cropped round as an avatar.</p>
    <img class="hero" src="{img('apps/fav/_sheet.png', 1300)}" alt="favicons at real sizes">
    <div class="fv-grid">{cards}</div></div></details>
  </section>'''
CSS = '''
.fv-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr)); gap:18px; }
.fv{ margin:0; display:flex; flex-direction:column; gap:8px; }
.fv-i{ display:flex; gap:10px; } .fv-i img{ width:96px; height:96px; }
.fv figcaption{ font-size:14px; color:var(--muted); } .fv figcaption b{ color:var(--text); display:block; }
'''
