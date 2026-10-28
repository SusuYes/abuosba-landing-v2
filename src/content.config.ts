import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { slug } from "github-slugger";

/* Thoughts are Markdown files in src/content/thoughts, written at /admin/ (public/admin/config.yml lists the fields
   it writes) or by hand: one thought is en/<slug>.md and, when it has one, its Arabic ar/<slug>.md. The build reads
   THOUGHTS_DIR instead when a vault repo is set up. A thought is live only when its Publish property is on. See the
   README. */

// The address: the file name, lower-cased with dashes. The Arabic of en/x.md is ar/x.md and gets the id "x-ar", so
// every thought keeps one id across both languages' lists and the Arabic addresses stay what they were.
const thoughtId = ({ entry }: { entry: string }) => {
  const parts = entry.replace(/\.md$/i, "").split("/").map((p) => slug(p));
  if (parts.length > 1 && parts[0] === "ar") return parts.slice(1).join("/") + "-ar";
  if (parts.length > 1 && parts[0] === "en") return parts.slice(1).join("/");
  return parts.join("/");
};

const thoughts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: process.env.THOUGHTS_DIR || "./src/content/thoughts", generateId: thoughtId }),
  // forgiving on purpose: a vault note with odd properties is skipped (not published), never a broken build
  schema: z.object({
    title: z.string().optional().catch(undefined),
    // Obsidian writes the property as typed: Publish or publish
    publish: z.boolean().optional().catch(undefined),
    Publish: z.boolean().optional().catch(undefined),
    date: z.coerce.date().optional().catch(undefined),
    dek: z.string().default("").catch(""),
    kind: z.enum(["Essay", "Note"]).default("Note").catch("Note"),
    lang: z.enum(["en", "ar"]).default("en").catch("en"),
    // a short opening for the cards; without it, the first paragraph
    excerpt: z.string().optional().catch(undefined),
    // the slug of the same thought in the other language; files in en/ and ar/ are paired by name without it
    pair: z.string().optional().catch(undefined),
    // listed under the thought; [1], [2] in the text point at them
    sources: z.array(z.object({
      title: z.string(),
      url: z.string().optional().catch(undefined),
      note: z.string().optional().catch(undefined),
    })).default([]).catch([]),
    // a stand-in written for the design, not by Suhail: shows "soon" instead of a date
    standin: z.boolean().default(false).catch(false),
  }),
});

export const collections = { thoughts };
