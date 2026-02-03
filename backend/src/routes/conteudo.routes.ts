import { Router } from 'express';
import { ConteudoController } from '../controllers/conteudo.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const controller = new ConteudoController();
const router = Router();

// List content (optional auth for public content, but usually we want to know the plan)
// We'll use authMiddleware as optional or strict depending on business rule.
// PRD implies personalized content, so Auth is good.
router.get('/', authMiddleware, controller.listar);
router.get('/:slug', authMiddleware, controller.getBySlug);

export { router as conteudoRoutes };
