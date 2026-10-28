// Translate proxy for the writing portal at abuosba.com/admin/.
// The Anthropic key lives here as a secret (ANTHROPIC_API_KEY), never in the
// public site. Callers must come from abuosba.com and send a GitHub token that
// can push to the site's repo, i.e. someone already signed in to the portal.

const REPO = 'SusuYes/abuosba-landing-v2';
const ORIGINS = ['https://abuosba.com', 'https://www.abuosba.com'];
const ANTHROPIC = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-5-5';
const FALLBACK_MODEL = 'claude-haiku-5-5';
const MAX_TOKENS = 16000;
const VERIFIED_FOR = 10 * 60 * 1000;

// Tokens already checked against GitHub, by hash, so each field's translation
// doesn't cost a GitHub call. Lives only as long as this Worker instance.
const verified = new Map();

const cors = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, anthropic-version',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
});

// Errors in Anthropic's shape, so the portal shows the message as is.
const fail = (status, message, origin) =>
  new Response(JSON.stringify({ type: 'error', error: { type: 'proxy_error', message } }), {
    status,
    headers: { 'Content-Type': 'application/json', ...(origin ? cors(origin) : {}) },
  });

const hash = async (text) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
};

const canPush = async (token) => {
  const key = await hash(token);
  if ((verified.get(key) ?? 0) > Date.now()) return true;
  const res = await fetch(`https://api.github.com/repos/${REPO}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'abuosba-translate',
    },
  });
  if (!res.ok) return false;
  const { permissions } = await res.json();
  if (!permissions?.push) return false;
  verified.set(key, Date.now() + VERIFIED_FOR);
  return true;
};

const ask = (env, body, model) =>
  fetch(ANTHROPIC, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ ...body, model }),
  });

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    if (!ORIGINS.includes(origin)) return fail(403, 'Translate only works from abuosba.com/admin/.');
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
    if (request.method !== 'POST') return fail(405, 'Use POST.', origin);
    if (!env.ANTHROPIC_API_KEY) return fail(500, 'The ANTHROPIC_API_KEY secret is not set on the abuosba-translate Worker.', origin);

    const token = (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    if (!token || !(await canPush(token))) return fail(401, 'Sign in to the portal again, then retry.', origin);

    let input;
    try {
      input = await request.json();
    } catch {
      return fail(400, 'The request was not JSON.', origin);
    }

    // Only what a translation needs passes through.
    const body = {
      max_tokens: Math.min(Number(input.max_tokens) || 4096, MAX_TOKENS),
      ...(input.system ? { system: input.system } : {}),
      messages: input.messages,
      ...(input.thinking ? { thinking: input.thinking } : {}),
    };

    let res = await ask(env, body, env.MODEL || MODEL);
    // A model the account can't use, or a setting it rejects: the portal's own default still works.
    if (res.status === 400 || res.status === 404) res = await ask(env, body, FALLBACK_MODEL);

    return new Response(res.body, {
      status: res.status,
      headers: { 'Content-Type': 'application/json', ...cors(origin) },
    });
  },
};
