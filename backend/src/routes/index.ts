import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { perfilRoutes } from './perfil.routes';
import { registroRoutes } from './registro.routes';
import { conteudoRoutes } from './conteudo.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/perfil', perfilRoutes);
router.use('/ciclo', perfilRoutes);
router.use('/registros', registroRoutes);
router.use('/conteudo', conteudoRoutes);


export { router as routes };
