import { Request, Response, Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../config/database';
import { verifyToken } from '../utils/jwt';
import { avisarAbertura } from '../services/alerta.service';

// POST /app/abertura: o app avisa na primeira abertura depois de instalar e na primeira depois de atualizar.
// Nao exige login (a primeira abertura acontece antes dele); se vier token, o alerta diz quem e.

const router = Router();

const limite = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

const curto = (max: number) => z.string().trim().min(1).max(max);
const schema = z.object({
  evento: z.enum(['instalacao', 'atualizacao']),
  versao: curto(20),
  build: curto(20),
  buildAnterior: curto(20).nullish(),
  plataforma: z.enum(['android', 'ios']),
  aparelho: curto(60).nullish(),
});

router.post('/abertura', limite, async (req: Request, res: Response) => {
  const dados = schema.safeParse(req.body);
  if (!dados.success) return res.status(400).json({ error: 'Dados inválidos' });

  let usuaria: { nomeCompleto: string; email: string } | null = null;
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const { userId } = verifyToken(token);
      usuaria = await prisma.user.findUnique({ where: { id: userId }, select: { nomeCompleto: true, email: true } });
    } catch {
      // token vencido ou invalido: avisa sem identificar
    }
  }

  avisarAbertura(dados.data, usuaria);
  res.json({ ok: true });
});

export { router as appRoutes };
