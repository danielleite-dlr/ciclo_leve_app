jest.mock('../src/config/database', () => ({
  prisma: { user: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) } },
}));

import { prisma } from '../src/config/database';
import { credenciaisValidas, marcarAcesso } from '../src/services/painel.service';

const basic = (s: string) => `Basic ${Buffer.from(s).toString('base64')}`;

describe('credenciaisValidas', () => {
  beforeEach(() => {
    process.env.ADMIN_USUARIO = 'dona';
    process.env.ADMIN_SENHA = 'senha-longa';
  });

  it('aceita so usuario e senha corretos', () => {
    expect(credenciaisValidas(basic('dona:senha-longa'))).toBe(true);
    expect(credenciaisValidas(basic('dona:errada'))).toBe(false);
    expect(credenciaisValidas('Bearer x')).toBe(false);
    expect(credenciaisValidas(undefined)).toBe(false);
  });

  it('painel desligado sem senha configurada', () => {
    delete process.env.ADMIN_SENHA;
    expect(credenciaisValidas(basic('dona:'))).toBe(false);
  });
});

describe('marcarAcesso', () => {
  it('grava no maximo uma vez a cada 2 minutos por usuaria', () => {
    marcarAcesso('u1');
    marcarAcesso('u1');
    marcarAcesso('u2');
    expect(prisma.user.updateMany).toHaveBeenCalledTimes(2);
  });
});
