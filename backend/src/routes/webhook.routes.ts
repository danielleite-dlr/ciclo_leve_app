import { Request, Response, Router } from 'express';
import { prisma } from '../config/database';
import { assinaturaService } from '../services/assinatura.service';
import { webhookAutorizado } from '../services/revenuecat.service';

const router = Router();

// POST /webhooks/revenuecat: o RevenueCat avisa compra, renovacao, cancelamento, expiracao e reembolso.
// Em vez de interpretar cada tipo de evento, consultamos o estado atual da usuaria (idempotente).
router.post('/revenuecat', async (req: Request, res: Response) => {
  if (!webhookAutorizado(req.headers.authorization)) return res.status(401).json({ error: 'Não autorizado' });

  const evento = req.body?.event ?? {};
  const ids = new Set<string>(
    [evento.app_user_id, evento.original_app_user_id, ...(evento.transferred_to ?? []), ...(evento.transferred_from ?? [])].filter(
      (id): id is string => typeof id === 'string'
    )
  );

  try {
    // Ids anonimos do RevenueCat ($RCAnonymousID:...) nao sao usuarias do banco
    const usuarias = await prisma.user.findMany({
      where: { id: { in: [...ids].filter((id) => /^[0-9a-f-]{36}$/i.test(id)) } },
      select: { id: true },
    });
    for (const u of usuarias) await assinaturaService.sincronizar(u.id);
    res.json({ ok: true });
  } catch (error: any) {
    console.error('[webhook revenuecat]', error?.message);
    // 500 faz o RevenueCat tentar de novo mais tarde
    res.status(500).json({ error: 'Falha ao processar' });
  }
});

export { router as webhookRoutes };
