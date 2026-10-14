import type { APIRoute } from "astro";
import { code, file } from "../../lib/bundle";

export function getStaticPaths() {
  return [{ params: { file } }];
}

export const GET: APIRoute = () => new Response(code, { headers: { "Content-Type": "text/javascript; charset=utf-8" } });
