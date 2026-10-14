# abuosba.com

Suhail AbuOsba's site, built with [Astro](https://astro.build) and published to GitHub Pages from `main`.

```sh
npm ci
npm run dev      # http://localhost:4321
npm run check    # types
npm run build    # the static site, in dist/
```

## How it is put together

Every address is the same document opened at a different place. The front page is the night sky (the visitor's
own); Thoughts, a thought, The shelf and About open over it; Work is reached by a sunrise and sits on the day sky.

| Address | Page |
| --- | --- |
| `/` | Tonight: the welcome, latest thoughts, the shelf |
| `/thoughts/`, `/thoughts/<slug>/` | All thoughts, one thought |
| `/shelf/`, `/shelf/music/` | Books, records |
| `/about/` | About |
| `/work/`, `/work/<build>/` | Work, one build's case study |
| `/ar/...` | The same pages in Arabic, right to left |

- `src/pages/[...route].astro` makes every address; `src/layouts/Shell.astro` is the document (title, description,
  links between languages, a plain version for readers without scripts).
- `src/site/` is the page itself, as built in the concepts: markup in `src/components/Front.astro`, styles
  (`*.css`) and plain scripts (`*.js`). The scripts share globals, so `src/lib/bundle.ts` joins them, in order,
  into one file (`/js/site-<hash>.js`).
- `src/site/route.js` turns addresses into places and back; keep it in step with `src/lib/site.ts`.
- Arabic is a layer over the English (`src/site/ar.js`): every string has its Arabic there. It is Claude's draft
  for Suhail to correct. The switch animates in place and changes the address to the other language.
- The shelf's books and records are in `src/site/home.js` (`SH`); covers in `public/covers/`.
- The builds on Work are in `src/site/common.js` (`CASES`) and `src/lib/site.ts` (`BUILDS`, for titles).
- Anything in square brackets is a placeholder still to be written, and shows with a dotted gold underline.

## Thoughts come from the vault

Thoughts are Markdown notes in the Obsidian vault. A note is published when it has these properties:

```yaml
---
title: Reading the sky from Sana'a
Publish: true          # off, or missing, keeps it off the site
date: 2026-10-01       # newest first
dek: Why the star I'm named for rises late in summer.
kind: Essay            # or Note (the default)
lang: en               # ar for a thought written in Arabic; the Arabic site shows only these
excerpt: ...           # optional; otherwise the first paragraph
pair: other-slug       # optional: the same thought in the other language
---
```

The address is the file name, lower-cased with dashes (`Reading the sky.md` becomes `/thoughts/reading-the-sky/`).
Wiki links (`[[...]]`) and embeds are not turned into links yet; use ordinary Markdown links.

Without the vault, the build reads `src/content/thoughts/`, which is empty: the site then says nothing is written yet. To build from
the vault's private repo, set in this repo's settings:

- variable `THOUGHTS_REPO`: the vault repo, as `owner/name`
- variable `THOUGHTS_PATH`: the posts folder inside it
- secret `THOUGHTS_TOKEN`: a fine-grained token with read access to that repo's contents

To publish when a thought changes, the vault repo can send a `repository_dispatch` of type `thoughts` to this repo.
Locally, `THOUGHTS_DIR=/path/to/vault/posts npm run build` builds from a folder on disk.
