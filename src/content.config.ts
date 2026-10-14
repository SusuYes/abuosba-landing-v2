import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/* Thoughts are Markdown notes from Suhail's Obsidian vault. The build reads them from THOUGHTS_DIR (the vault's
   posts folder, checked out by the deploy workflow) or, without it, from src/content/thoughts. A note is live
   only when its Publish property is on. See the README. */
const thoughts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: process.env.THOUGHTS_DIR || "./src/content/thoughts" }),
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
    // the slug of the same thought in the other language, when Suhail writes one
    pair: z.string().optional().catch(undefined),
    // a stand-in written for the design, not by Suhail: shows "soon" instead of a date
    standin: z.boolean().default(false).catch(false),
  }),
});

export const collections = { thoughts };
