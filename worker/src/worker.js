const PRODUCTS = {
  'price_1U6lsmROb6ldPSoY3itT2QtT': {
    name: 'Marketing',
    key: 'pdf/mkt-e99db5.zip',
    downloadName: '12-marketing-prompts-guide-plus-skill.zip'
  },
  'price_1U6rEUROb6ldPSoY4llb1scc': {
    name: 'Sales',
    key: 'pdf/sls-5e6254.zip',
    downloadName: '12-sales-prompts-guide-plus-skill.zip'
  },
  'price_1U6rEAROb6ldPSoYReZj5Dsb': {
    name: 'Finance',
    key: 'pdf/fin-59d3d0.zip',
    downloadName: '12-finance-prompts-guide-plus-skill.zip'
  },
  'price_1U6rEtROb6ldPSoYtATjJlJq': {
    name: 'Automation',
    key: 'pdf/aut-69abcc.zip',
    downloadName: '12-automation-prompts-guide-plus-skill.zip'
  },
  'price_1U6oLjROb6ldPSoYvhsE1gEC': {
    name: 'Bundle (all 4 guides + 4 skills)',
    key: 'pdf/bundle-34a5f4.zip',
    downloadName: 'prompt-guides-bundle-all-4-plus-skills.zip'
  }
};

const MAX_SESSION_AGE_DAYS = 30;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/download' && request.method === 'GET') return handleDownload(url, env);
    return new Response('Not found', { status: 404 });
  }
};

async function handleDownload(url, env) {
  const sessionId = url.searchParams.get('s');
  if (!sessionId || !sessionId.startsWith('cs_')) return jsonError(400, 'Missing or invalid session id.');

  const session = await stripeGet(`checkout/sessions/${sessionId}?expand[]=line_items`, env);
  if (!session) return jsonError(404, 'Session not found.');
  if (session.payment_status !== 'paid') return jsonError(402, 'Payment not complete.');

  const ageDays = (Date.now() / 1000 - session.created) / 86400;
  if (ageDays > MAX_SESSION_AGE_DAYS) return jsonError(410, 'Download link expired. Get in touch and we will send a fresh one.');

  const priceId = session.line_items?.data?.[0]?.price?.id;
  const product = PRODUCTS[priceId];
  if (!product) return jsonError(500, 'Product not recognised.');

  const object = await env.GUIDES.get(product.key);
  if (!object) return jsonError(500, 'File not found in storage.');

  return new Response(object.body, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${product.downloadName}"`,
      'Cache-Control': 'no-store'
    }
  });
}

async function stripeGet(path, env) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` }
  });
  return res.ok ? res.json() : null;
}

function jsonError(status, message) {
  return new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json' } });
}
