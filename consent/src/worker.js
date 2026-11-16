// consent.alignd.care — records Friends & Family testing consent in D1.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/consent') {
      if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
      return handleConsent(request, env, url);
    }
    return env.ASSETS.fetch(request);
  },
};

async function handleConsent(request, env, url) {
  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
  const fail = (msg, status = 400) => wantsJson
    ? Response.json({ error: msg }, { status })
    : Response.redirect(`${url.origin}/?error=${encodeURIComponent(msg)}#sign`, 303);

  let form;
  try { form = await request.formData(); } catch { return fail('We could not read the form. Please try again.'); }

  const consent = form.get('consent') === 'yes';
  const name = String(form.get('name') || '').trim().replace(/\s+/g, ' ').slice(0, 200);
  const email = String(form.get('email') || '').trim().toLowerCase().slice(0, 254);

  const problems = [];
  if (!consent) problems.push('check the box to confirm you agree');
  if (!name) problems.push('enter your full legal name');
  if (!EMAIL_RE.test(email)) problems.push('enter a valid email address');
  if (problems.length) return fail(`Please ${problems.join(', ')}.`);

  const sha = await agreementHash(env, url).catch(() => null);
  try {
    await env.DB.prepare(
      `INSERT INTO consents (created_at, full_name, email, consented, agreement_version, agreement_sha256, ip, country, user_agent)
       VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?)`
    ).bind(
      new Date().toISOString(), name, email, env.AGREEMENT_VERSION || 'unknown', sha,
      request.headers.get('CF-Connecting-IP'), request.cf?.country ?? null,
      (request.headers.get('User-Agent') || '').slice(0, 500),
    ).run();
  } catch (err) {
    console.error('consent insert failed', err);
    return fail('Something went wrong saving your consent. Please try again, or email joe@alignd.care.', 500);
  }

  const first = name.split(' ')[0];
  const redirect = `/thanks?n=${encodeURIComponent(first)}`;
  return wantsJson ? Response.json({ ok: true, redirect }) : Response.redirect(url.origin + redirect, 303);
}

// SHA-256 of the agreement page as served, so each record ties to the exact text shown.
async function agreementHash(env, url) {
  const res = await env.ASSETS.fetch(new Request(`${url.origin}/`));
  const buf = await crypto.subtle.digest('SHA-256', await res.arrayBuffer());
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
