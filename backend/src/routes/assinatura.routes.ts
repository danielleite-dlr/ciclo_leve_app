import { Router } from 'express';
import { AssinaturaController } from '../controllers/assinatura.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const controller = new AssinaturaController();
const router = Router();

router.get('/', authMiddleware, controller.status.bind(controller));
router.post('/assinar', authMiddleware, controller.assinar.bind(controller));
router.post('/sincronizar', authMiddleware, controller.sincronizar.bind(controller));
router.post('/cancelar', authMiddleware, controller.cancelar.bind(controller));

export { router as assinaturaRoutes };
