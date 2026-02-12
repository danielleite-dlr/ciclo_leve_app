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
 *     summary: Retorna o perfil completo e recomendações do dia
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil + fase atual + insight consolidado
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
 *                     diaCiclo:
 *                       type: integer
 *                     diasProximaMenstruacao:
 *                       type: integer
 *                     dataProximaMenstruacao:
 *                       type: string
 *                       format: date-time
 *                     insight:
 *                       type: object
 *                       properties:
 *                         titulo:
 *                           type: string
 *                         emoji:
 *                           type: string
 *                         descricao:
 *                           type: string
 *                         facaHoje:
 *                           type: array
 *                           items:
 *                             type: string
 *                         eviteHoje:
 *                           type: array
 *                           items:
 *                             type: string
 *                         notaEspecialista:
 *                           type: string
 *                         dicasExtras:
 *                           type: array
 *                           items:
 *                             type: string
 */
router.get('/', authMiddleware, perfilController.getPerfil);

/**
 * @swagger
 * /perfil/ciclo:
 *   put:
 *     summary: Configura ou Atualiza o Ciclo Menstrual
 *     description: |
 *       Use este endpoint no Onboarding ou na tela de Configurações.
 *       Ele define os parâmetros biológicos usados para calcular todas as previsões do app.
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
 *                 description: Objetivo principal da usuária.
 *                 example: "MONITORAMENTO"
 *               duracaoCiclo:
 *                 type: integer
 *                 description: Média de dias do ciclo (padrão 28).
 *                 default: 28
 *                 example: 28
 *               duracaoSangramento:
 *                 type: integer
 *                 description: Média de dias de sangramento (padrão 5).
 *                 default: 5
 *                 example: 5
 *               dataUltimaMenstruacao:
 *                 type: string
 *                 format: date-time
 *                 description: Data do início da última menstruação (ISO 8601).
 *                 example: "2026-02-01T00:00:00.000Z"
 *               cicloRegular:
 *                 type: boolean
 *                 description: Se o ciclo costuma variar pouco.
 *                 default: true
 *     responses:
 *       200:
 *         description: Ciclo atualizado e recalculo de fase executado.
 */
router.put('/ciclo', authMiddleware, perfilController.atualizarCiclo.bind(perfilController));

export { router as perfilRoutes };
