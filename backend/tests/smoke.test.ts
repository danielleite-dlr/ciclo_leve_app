import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { app } from '../src/app';

// Smoke mínimo do backend (MVP)
// Nota: testes que dependem de DB são "best-effort" e serão pulados se o Postgres não estiver acessível.

const prisma = new PrismaClient();

async function isDbAvailable(timeoutMs = 1500): Promise<boolean> {
  try {
    await Promise.race([
      prisma.$connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
    ]);
    return true;
  } catch {
    return false;
  }
}

describe('SMOKE (API)', () => {
  afterAll(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore
    }
  });

  it('GET /health deve responder 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('CT1/CT2: register (sem dataNascimento) + login devem retornar token (se DB estiver disponível)', async () => {
    const dbOk = await isDbAvailable();
    if (!dbOk) {
      // Em CI/dev com docker este teste roda; local sem DB não deve bloquear.
      console.warn('DB indisponível: pulando smoke de register/login');
      return;
    }

    const email = `smoke+${Date.now()}@exemplo.com`;
    const senha = 'teste123';

    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ nome: 'Teste Smoke', email, senha });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body).toHaveProperty('token');

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, senha });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
  });
});
