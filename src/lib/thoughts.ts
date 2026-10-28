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
  .replace(/\[\^?\d{1,2}\]/g, "")
  .replace(/[*_`~>#]/g, "")
  .replace(/\s+/g, " ")
  .trim();

function firstParagraph(md: string) {
  const p = md.split(/\n\s*\n/).map((x) => x.trim()).find((x) => x && !/^(#|!|>|```|---|- |\* |\d+\. )/.test(x)) || "";
  const t = plain(p);
  if (t.length <= 320) return t;
  return t.slice(0, 320).replace(/\s+\S*$/, "") + "…";
}

/** Every published thought, newest first. A file in ar/ is Arabic, and en/x and ar/x are each other's pair. */
export async function published(): Promise<Thought[]> {
  const all = await getCollection("thoughts", ({ data }) => Boolean((data.publish ?? data.Publish) && data.title && data.date));
  const ids = new Set(all.map((t) => t.id));
  for (const t of all) {
    const dir = (t.filePath || "").split("/").slice(-2)[0];
    if (dir !== "en" && dir !== "ar") continue;
    t.data.lang = dir;
    const other = dir === "ar" ? t.id.replace(/-ar$/, "") : t.id + "-ar";
    if (!t.data.pair && ids.has(other)) t.data.pair = other;
  }
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

/** A thought's words as HTML, with [1], [2] in the text turned into raised numbers linking to its listed sources
    (src/components/Sources.astro), like a Markdown footnote. A number with no source of its own stays as typed, and
    nothing changes inside links or code. */
export function bodyHTML(t: Thought): string {
  const html = t.rendered?.html || "", n = t.data.sources.length;
  if (!n) return html;
  let skip = 0;
  return html.split(/(<[^>]+>)/).map((part) => {
    const tag = /^<(\/?)(a|code|pre)\b/i.exec(part);
    if (tag) { skip += tag[1] ? -1 : 1; return part; }
    if (part.startsWith("<") || skip > 0) return part;
    // "1890 [1]" and "1890[1]" both put the number right against the word
    return part.replace(/[ \u00a0]*\[(\d{1,2})\]/g, (m, d) => {
      const i = Number(d);
      return i >= 1 && i <= n ? `<sup><a href="#source-${i}" class="src-ref">${i}</a></sup>` : m;
    });
  }).join("");
}

/** What the page script needs: { notes: { slug: summary }, order: [slug, newest first] }. */
export async function siteData() {
  const list = await published();
  return { notes: Object.fromEntries(list.map((t) => [t.id, summary(t)])), order: list.map((t) => t.id) };
}
