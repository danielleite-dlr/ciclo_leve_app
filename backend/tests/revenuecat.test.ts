import { consultarPlano, webhookAutorizado } from '../src/services/revenuecat.service';

// Leitura da resposta do RevenueCat (GET /v1/subscribers/:id) e checagem do webhook. Sem rede: fetch simulado.

const futuro = new Date(Date.now() + 7 * 86400000).toISOString();
const passado = new Date(Date.now() - 86400000).toISOString();

function respostaRevenueCat(subscriber: unknown) {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ subscriber }) }) as any;
}

beforeEach(() => {
  process.env.REVENUECAT_SECRET_KEY = 'sk_teste';
  process.env.REVENUECAT_WEBHOOK_AUTH = 'Bearer segredo-do-webhook';
});

describe('consultarPlano', () => {
  it('anual em teste gratis', async () => {
    respostaRevenueCat({
      entitlements: { premium: { expires_date: futuro, product_identifier: 'premium:anual' } },
      subscriptions: { 'premium:anual': { period_type: 'trial', expires_date: futuro } },
    });
    const p = await consultarPlano('u1');
    expect(p).toMatchObject({ ativo: true, plano: 'ANUAL', emTeste: true, usouTeste: true });
    expect(p.expiraEm?.toISOString()).toBe(futuro);
  });

  it('mensal pago', async () => {
    respostaRevenueCat({
      entitlements: { premium: { expires_date: futuro, product_identifier: 'premium:mensal' } },
      subscriptions: { 'premium:mensal': { period_type: 'normal', expires_date: futuro } },
    });
    expect(await consultarPlano('u1')).toMatchObject({ ativo: true, plano: 'MENSAL', emTeste: false, usouTeste: false });
  });

  it('assinatura vencida nao e ativa, mas lembra que usou o teste', async () => {
    respostaRevenueCat({
      entitlements: { premium: { expires_date: passado, product_identifier: 'premium:anual' } },
      subscriptions: { 'premium:anual': { period_type: 'trial', expires_date: passado } },
    });
    expect(await consultarPlano('u1')).toMatchObject({ ativo: false, emTeste: false, usouTeste: true });
  });

  it('sem compra', async () => {
    respostaRevenueCat({ entitlements: {}, subscriptions: {} });
    expect(await consultarPlano('u1')).toMatchObject({ ativo: false, usouTeste: false });
  });

  it('usa a chave secreta e o id da usuaria', async () => {
    respostaRevenueCat({ entitlements: {}, subscriptions: {} });
    await consultarPlano('abc-123');
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('https://api.revenuecat.com/v1/subscribers/abc-123');
    expect(init.headers.Authorization).toBe('Bearer sk_teste');
  });
});

describe('webhookAutorizado', () => {
  it('aceita so o cabecalho configurado', () => {
    expect(webhookAutorizado('Bearer segredo-do-webhook')).toBe(true);
    expect(webhookAutorizado('Bearer outro')).toBe(false);
    expect(webhookAutorizado(undefined)).toBe(false);
  });

  it('recusa tudo se o segredo nao estiver configurado', () => {
    delete process.env.REVENUECAT_WEBHOOK_AUTH;
    expect(webhookAutorizado('')).toBe(false);
    expect(webhookAutorizado('qualquer')).toBe(false);
  });
});
