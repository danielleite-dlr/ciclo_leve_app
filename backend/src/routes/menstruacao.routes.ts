import { Router } from 'express';
import { MenstruacaoController } from '../controllers/menstruacao.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const controller = new MenstruacaoController();
const router = Router();

router.get('/', authMiddleware, controller.status.bind(controller));
router.post('/inicio', authMiddleware, controller.inicio.bind(controller));
router.post('/fim', authMiddleware, controller.fim.bind(controller));
router.delete('/:id', authMiddleware, controller.desfazer.bind(controller));

export { router as menstruacaoRoutes };
