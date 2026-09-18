function hex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function safeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function validSignature(request, secret, dataId) {
  const signature = request.headers.get('x-signature') || '';
  const requestId = request.headers.get('x-request-id') || '';
  const parts = Object.fromEntries(signature.split(',').map((part) => part.trim().split('=')));

  if (!parts.ts || !parts.v1 || !requestId || !dataId) return false;

  const manifest = `id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(manifest));
  return safeEqual(hex(digest), parts.v1);
}

export async function onRequestPost({ request, env }) {
  if (!env.MERCADO_PAGO_ACCESS_TOKEN || !env.MERCADO_PAGO_WEBHOOK_SECRET) {
    return new Response('Webhook not configured', { status: 503 });
  }

  const url = new URL(request.url);
  let body = {};
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const dataId = url.searchParams.get('data.id') || body?.data?.id;
  if (!(await validSignature(request, env.MERCADO_PAGO_WEBHOOK_SECRET, dataId))) {
    return new Response('Invalid signature', { status: 401 });
  }

  if (body.type === 'payment' && dataId) {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`, {
      headers: {
        'Authorization': `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Payment lookup failed', response.status, dataId);
      return new Response('Payment lookup failed', { status: 502 });
    }

    const payment = await response.json();
    console.log('Payment notification', {
      id: payment.id,
      status: payment.status,
      reference: payment.external_reference,
    });
  }

  return new Response('OK', { status: 200 });
}
