import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { perfilRoutes } from './perfil.routes';
import { registroRoutes } from './registro.routes';
import { conteudoRoutes } from './conteudo.routes';
import { menstruacaoRoutes } from './menstruacao.routes';
import { fertilidadeRoutes } from './fertilidade.routes';
import { assinaturaRoutes } from './assinatura.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/perfil', perfilRoutes);
router.use('/ciclo', perfilRoutes);
router.use('/registros', registroRoutes);
router.use('/conteudo', conteudoRoutes);
router.use('/menstruacao', menstruacaoRoutes);
router.use('/fertilidade', fertilidadeRoutes);
router.use('/assinatura', assinaturaRoutes);


export { router as routes };
