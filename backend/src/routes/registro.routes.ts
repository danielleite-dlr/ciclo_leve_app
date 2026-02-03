import { Router } from 'express';
import { RegistroController } from '../controllers/registro.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const controller = new RegistroController();
const router = Router();

router.post('/', authMiddleware, controller.criar);
router.get('/', authMiddleware, controller.listar.bind(controller));

export { router as registroRoutes };
