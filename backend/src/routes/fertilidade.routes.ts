import { Router } from 'express';
import { FertilidadeController } from '../controllers/fertilidade.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { exigirModulo } from '../middlewares/modulo.middleware';

const controller = new FertilidadeController();
const router = Router();

router.get('/consentimento', authMiddleware, controller.consentimento.bind(controller));
router.post('/consentimento', authMiddleware, controller.definirConsentimento.bind(controller));
router.get('/', authMiddleware, exigirModulo('FERTILIDADE'), controller.listar.bind(controller));
router.put('/:data', authMiddleware, exigirModulo('FERTILIDADE'), controller.salvar.bind(controller));

export { router as fertilidadeRoutes };
