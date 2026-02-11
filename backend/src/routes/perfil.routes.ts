import { Router } from 'express';
import { PerfilController } from '../controllers/perfil.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const perfilController = new PerfilController();
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Perfil
 *   description: Gerenciamento do Perfil e Ciclo
 */

/**
 * @swagger
 * /perfil:
 *   get:
 *     summary: Retorna o perfil do usuário, dados do ciclo e fase atual
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do perfil recuperados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 ciclo:
 *                   type: object
 *                 faseAtual:
 *                   type: object
 *                   properties:
 *                     fase:
 *                       type: string
 *                     nomeFase:
 *                       type: string
 *                     insight:
 *                       type: object
 *                       properties:
 *                         titulo:
 *                           type: string
 *                         emoji:
 *                           type: string
 *                         descricao:
 *                           type: string
 *       401:
 *         description: Não autorizado
 */
router.get('/', authMiddleware, perfilController.getPerfil);

/**
 * @swagger
 * /perfil/ciclo:
 *   put:
 *     summary: Atualiza as configurações do ciclo menstrual
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modoCiclo
 *               - dataUltimaMenstruacao
 *             properties:
 *               modoCiclo:
 *                 type: string
 *                 enum: [TENTANTE, GESTANTE, MONITORAMENTO]
 *               duracaoCiclo:
 *                 type: integer
 *               duracaoSangramento:
 *                 type: integer
 *               dataUltimaMenstruacao:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Ciclo atualizado com sucesso
 */
router.put('/ciclo', authMiddleware, perfilController.atualizarCiclo.bind(perfilController));

export { router as perfilRoutes };
