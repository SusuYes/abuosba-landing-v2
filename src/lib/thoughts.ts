import { getCollection, type CollectionEntry } from "astro:content";

export type Thought = CollectionEntry<"thoughts">;
export interface ThoughtData {
  title: string; dek: string; kind: string; mins: number; lang: "en" | "ar";
  date: string; ts: number; excerpt: string; pair?: string;
}

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = (d: Date) => `${d.getUTCDate()} ${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

// Markdown to plain words, roughly: enough for an excerpt and a word count
const plain = (md: string) => md
  .replace(/<mark class="tbd">[^<]*<\/mark>/g, "")
  .replace(/<[^>]+>/g, "")
  .replace(/!?\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, a, b) => b || a)
  .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
  .replace(/[*_`~>#]/g, "")
  .replace(/\s+/g, " ")
  .trim();

function firstParagraph(md: string) {
  const p = md.split(/\n\s*\n/).map((x) => x.trim()).find((x) => x && !/^(#|!|>|```|---|- |\* |\d+\. )/.test(x)) || "";
  const t = plain(p);
  if (t.length <= 320) return t;
  return t.slice(0, 320).replace(/\s+\S*$/, "") + "…";
}

/** Every published thought, newest first. */
export async function published(): Promise<Thought[]> {
  const all = await getCollection("thoughts", ({ data }) => Boolean((data.publish ?? data.Publish) && data.title && data.date));
  return all.sort((a, b) => b.data.date!.getTime() - a.data.date!.getTime());
}

export function summary(t: Thought): ThoughtData {
  const d = t.data, body = t.body || "";
  const words = plain(body).split(" ").filter(Boolean).length;
  return {
    title: d.title!, dek: d.dek, kind: d.kind, lang: d.lang, mins: Math.max(1, Math.round(words / 200)),
    date: d.standin ? "" : day(d.date!), ts: d.date!.getTime(), excerpt: d.excerpt || firstParagraph(body), ...(d.pair ? { pair: d.pair } : {}),
  };
}

/** What the page script needs: { notes: { slug: summary }, order: [slug, newest first] }. */
export async function siteData() {
  const list = await published();
  return { notes: Object.fromEntries(list.map((t) => [t.id, summary(t)])), order: list.map((t) => t.id) };
}
