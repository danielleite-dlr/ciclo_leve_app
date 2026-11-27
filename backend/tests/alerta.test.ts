jest.mock('../src/config/database', () => ({
  prisma: { user: { count: jest.fn().mockResolvedValue(12), findUnique: jest.fn().mockResolvedValue({ nomeCompleto: 'Bia', email: 'bia@x.com' }) } },
}));

import { avisarAbertura, avisarAtividade, avisarCadastro } from '../src/services/alerta.service';

const enviado = () => JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true }) as any;
  process.env.TELEGRAM_BOT_TOKEN = '123:abc';
  process.env.TELEGRAM_CHAT_ID = '999';
});

it('cadastro com nome, e-mail e total, escapando HTML', async () => {
  await avisarCadastro({ id: 'c1', nomeCompleto: 'Ana <b>', email: 'ana@x.com' });
  const [url] = (global.fetch as jest.Mock).mock.calls[0];
  expect(url).toBe('https://api.telegram.org/bot123:abc/sendMessage');
  expect(enviado()).toMatchObject({ chat_id: '999', parse_mode: 'HTML' });
  expect(enviado().text).toContain('Ana &lt;b&gt; (ana@x.com)');
  expect(enviado().text).toContain('Total de contas: 12');
});

it('download e atualizacao', () => {
  avisarAbertura({ evento: 'instalacao', versao: '1.0.0', build: '25', plataforma: 'android', aparelho: 'samsung SM-A325M' });
  expect(enviado().text).toContain('Novo download');
  expect(enviado().text).toContain('samsung SM-A325M');
  (global.fetch as jest.Mock).mockClear();
  avisarAbertura({ evento: 'atualizacao', versao: '1.0.0', build: '25', buildAnterior: '24', plataforma: 'android' }, { nomeCompleto: 'Ana', email: 'a@x.com' });
  expect(enviado().text).toContain('24 → 25');
  expect(enviado().text).toContain('Ana (a@x.com)');
});

it('sem token configurado nao envia nada', () => {
  delete process.env.TELEGRAM_BOT_TOKEN;
  return avisarAtividade('login', 'u0', { nomeCompleto: 'Ana', email: 'a@x.com' }).then(() => {
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('atividade: no maximo 1 alerta a cada 2 h por usuaria', () => {
  afterEach(() => jest.useRealTimers());

  it('login, uso e registro dividem a mesma janela', async () => {
    jest.useFakeTimers({ now: new Date('2026-11-27T10:00:00Z'), doNotFake: ['nextTick', 'setImmediate'] });
    await avisarAtividade('login', 'u1', { nomeCompleto: 'Ana', email: 'a@x.com' });
    await avisarAtividade('uso', 'u1');
    await avisarAtividade('registro', 'u1');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(enviado().text).toContain('Login');

    // outra usuaria nao e afetada
    await avisarAtividade('uso', 'u2');
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(JSON.parse((global.fetch as jest.Mock).mock.calls[1][1].body).text).toContain('Bia (bia@x.com)');

    jest.setSystemTime(new Date('2026-11-27T11:59:00Z'));
    await avisarAtividade('registro', 'u1');
    expect(global.fetch).toHaveBeenCalledTimes(2);

    jest.setSystemTime(new Date('2026-11-27T12:00:01Z'));
    await avisarAtividade('registro', 'u1');
    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(JSON.parse((global.fetch as jest.Mock).mock.calls[2][1].body).text).toContain('Registrou como está hoje');
  });

  it('cadastro abre a janela: o uso logo depois nao avisa de novo', async () => {
    await avisarCadastro({ id: 'u3', nomeCompleto: 'Cris', email: 'c@x.com' });
    await avisarAtividade('uso', 'u3');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
