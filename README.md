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

## Writing thoughts at /admin/

Thoughts are written in the browser at [abuosba.com/admin/](https://abuosba.com/admin/), on a phone or a computer. It is
[Sveltia CMS](https://github.com/sveltia/sveltia-cms) (`public/admin/`), a single page that reads and writes the
Markdown files in `src/content/thoughts/` through GitHub: each save is a commit to `main`, and the deploy workflow
publishes it a minute or two later. There is no server or database.

Signing in takes a GitHub token, once per browser:

1. GitHub, Settings, Developer settings, [Fine-grained tokens](https://github.com/settings/personal-access-tokens/new).
2. Repository access: only `SusuYes/abuosba-landing-v2`. Permissions: Contents, read and write.
3. Copy the token, open `/admin/`, choose "Sign In Using Access Token" and paste it. The browser remembers it.

A thought is a draft until "Live on the site" is on; saving with it on publishes it. Images added in the editor go
to `public/media/thoughts/`. The fields are set in `public/admin/config.yml`, and the Sveltia version is pinned in
`public/admin/index.html`.

The files look like this (Obsidian can still open them, and an edited file can still be committed by hand):

```yaml
---
title: Reading the sky from Sana'a
publish: true          # off, or missing, keeps it off the site (Publish works too)
date: 2026-10-01       # newest first
dek: Why the star I'm named for rises late in summer.
kind: Essay            # or Note (the default)
lang: en               # ar for a thought written in Arabic; the Arabic site shows only these
excerpt: ...           # optional; otherwise the first paragraph
pair: other-slug       # optional: the same thought in the other language
---
```

The address is the file name (`reading-the-sky.md` becomes `/thoughts/reading-the-sky/`). Wiki links (`[[...]]`)
and embeds are not turned into links; use ordinary Markdown links. Footnotes (`[^1]`) work.

### Building from a vault repo instead

The workflow can still build Thoughts from a private vault repo, but then it reads only that repo and ignores
`src/content/thoughts/`, so anything written at `/admin/` would not show. Leave these unset while using `/admin/`:

- variable `THOUGHTS_REPO`: the vault repo, as `owner/name`
- variable `THOUGHTS_PATH`: the posts folder inside it
- secret `THOUGHTS_TOKEN`: a fine-grained token with read access to that repo's contents

The vault repo can send a `repository_dispatch` of type `thoughts` to rebuild. Locally,
`THOUGHTS_DIR=/path/to/posts npm run build` builds from a folder on disk.
