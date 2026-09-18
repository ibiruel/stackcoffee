# Stack Coffee — Checkout Pro

## Variáveis no Cloudflare

Configure no projeto, em **Settings → Variables and Secrets**:

- `MERCADO_PAGO_ACCESS_TOKEN` — secret de produção renovado; nunca adicionar ao GitHub.
- `MERCADO_PAGO_WEBHOOK_SECRET` — secret exibido em Webhooks na aplicação do Mercado Pago.
- `SITE_URL` — `https://stackcoffee.com.br`.

## Webhook

Na aplicação do Mercado Pago, configure notificações de pagamentos para:

`https://stackcoffee.com.br/api/webhooks/mercadopago`

O endpoint valida a assinatura `x-signature` antes de consultar o pagamento.

## Produtos definidos no servidor

- `SC-DB-250-MOIDO` — Daily Build 250 g torrado e moído — R$ 39,90.
- `SC-DB-1KG-GRAOS` — Daily Build 1 kg torrado em grãos — R$ 134,90.

Os preços enviados pelo navegador são ignorados. O servidor usa apenas o SKU e os valores cadastrados em `functions/api/checkout.js`.

## Antes de liberar vendas

1. Confirmar como o endereço de entrega será coletado e conferido antes do envio.
2. Configurar as credenciais renovadas como secrets.
3. Configurar e testar o webhook.
4. Fazer uma compra com uma conta de teste.
5. Confirmar o retorno para as páginas de aprovado, pendente e não concluído.
