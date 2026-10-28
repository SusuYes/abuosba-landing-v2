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

Sign in with **Sign In with GitHub**, once per browser. That button goes through a small Cloudflare Worker,
`sveltia-cms-auth` on Suhail's Cloudflare account ([source](https://github.com/sveltia/sveltia-cms-auth)), at
`https://sveltia-cms-auth.suhail-f28.workers.dev`. It holds a GitHub OAuth app's keys as the secrets
`GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`, and `ALLOWED_DOMAINS` (`abuosba.com`) so no other site can use it. The
OAuth app's callback is the Worker's address plus `/callback`.

If the Worker is ever down, a GitHub token works as well:

1. GitHub, Settings, Developer settings, [Fine-grained tokens](https://github.com/settings/personal-access-tokens/new).
2. Repository access: only `SusuYes/abuosba-landing-v2`. Permissions: Contents, read and write.
3. Copy the token, open `/admin/`, choose "Sign In Using Access Token" and paste it. The browser remembers it.

Each thought is one entry with English and Arabic side by side. Write one side, then press the translate button on
the other. Read the translation over before saving. A thought written only in English can switch its Arabic side off from that
side's menu. Each language has its own "Live on the site" switch; saving with it on publishes that language.

Translate needs no key in the browser. The portal sends it to the `abuosba-translate` Cloudflare Worker
(`workers/translate/`), which holds the Anthropic key as the secret `ANTHROPIC_API_KEY`, only answers abuosba.com, and
only for someone signed in with push access to this repo. It translates with Claude Sonnet (falling back to Haiku).
To change the key, edit that secret in Cloudflare (Workers & Pages, abuosba-translate, Settings, Variables and
Secrets). Never put the key in this repo: it is public.

Sources go in the Sources list under the body, and the same list is used for both languages. In the text, `[1]`, `[2]`
point at them: on the site they become raised numbers linking to the list, which shows under the thought as
"Sources" / "المصادر". Markdown footnotes (`[^1]`) still work too.

Images added in the editor go to `public/media/thoughts/`. The fields are set in `public/admin/config.yml`, and the
Sveltia version is pinned in `public/admin/index.html`.

The files are `src/content/thoughts/en/<slug>.md` and `src/content/thoughts/ar/<slug>.md` (Obsidian can still open
them, and an edited file can still be committed by hand):

```yaml
---
title: Reading the sky from Sana'a
publish: true          # off, or missing, keeps it off the site (Publish works too)
date: 2026-10-01       # newest first
dek: Why the star I'm named for rises late in summer.
kind: Essay            # or Note (the default)
excerpt: ...           # optional; otherwise the first paragraph
sources:               # optional; [1] in the text points at the first
  - title: Warren and Brandeis, The Right to Privacy (1890)
    url: https://example.com
    note: optional
---
```

The address is the file name: `en/reading-the-sky.md` is `/thoughts/reading-the-sky/`, and `ar/reading-the-sky.md`
is `/ar/thoughts/reading-the-sky-ar/`; the two are linked as each other's language. The Arabic site shows only
Arabic thoughts. Wiki links (`[[...]]`) and embeds are not turned into links; use ordinary Markdown links. A file
directly in `src/content/thoughts/` (or from a vault) still works with `lang: ar` and `pair: other-slug`.

### Building from a vault repo instead

The workflow can still build Thoughts from a private vault repo, but then it reads only that repo and ignores
`src/content/thoughts/`, so anything written at `/admin/` would not show. Leave these unset while using `/admin/`:

- variable `THOUGHTS_REPO`: the vault repo, as `owner/name`
- variable `THOUGHTS_PATH`: the posts folder inside it
- secret `THOUGHTS_TOKEN`: a fine-grained token with read access to that repo's contents

The vault repo can send a `repository_dispatch` of type `thoughts` to rebuild. Locally,
`THOUGHTS_DIR=/path/to/posts npm run build` builds from a folder on disk.
