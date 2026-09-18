const PRODUCTS = Object.freeze({
  'SC-DB-250-MOIDO': {
    title: 'Stack Coffee Daily Build 250 g',
    description: 'Café especial torrado e moído, 100% arábica, torra média',
    unitPrice: 39.90,
  },
  'SC-DB-1KG-GRAOS': {
    title: 'Stack Coffee Daily Build 1 kg',
    description: 'Café especial torrado em grãos, 100% arábica, torra média',
    unitPrice: 134.90,
  },
});

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  },
});

export async function onRequestPost({ request, env }) {
  if (!env.MERCADO_PAGO_ACCESS_TOKEN) {
    return json({ error: 'Pagamento temporariamente indisponível.' }, 503);
  }

  const requestUrl = new URL(request.url);
  const siteUrl = (env.SITE_URL || `${requestUrl.protocol}//${requestUrl.host}`).replace(/\/$/, '');
  const allowedOrigin = new URL(siteUrl).origin;
  const requestOrigin = request.headers.get('Origin');

  if (requestOrigin && requestOrigin !== allowedOrigin) {
    return json({ error: 'Origem não autorizada.' }, 403);
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return json({ error: 'Pedido inválido.' }, 400);
  }

  const product = PRODUCTS[input.sku];
  const quantity = Number(input.quantity);

  if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return json({ error: 'Produto ou quantidade inválida.' }, 400);
  }

  const externalReference = `SC-${Date.now()}-${crypto.randomUUID()}`;
  const preference = {
    items: [{
      id: input.sku,
      title: product.title,
      description: product.description,
      category_id: 'food',
      currency_id: 'BRL',
      quantity,
      unit_price: product.unitPrice,
    }],
    shipments: {
      mode: 'not_specified',
      cost: 0,
    },
    back_urls: {
      success: `${siteUrl}/pagamento/sucesso.html`,
      pending: `${siteUrl}/pagamento/pendente.html`,
      failure: `${siteUrl}/pagamento/erro.html`,
    },
    auto_return: 'approved',
    notification_url: `${siteUrl}/api/webhooks/mercadopago`,
    external_reference: externalReference,
    statement_descriptor: 'STACK COFFEE',
  };

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(preference),
  });
  const result = await response.json();

  if (!response.ok || !result.init_point) {
    console.error('Mercado Pago preference error', response.status, result.message || 'unknown');
    return json({ error: 'Não foi possível iniciar o pagamento. Tente novamente.' }, 502);
  }

  return json({ checkout_url: result.init_point, reference: externalReference });
}
