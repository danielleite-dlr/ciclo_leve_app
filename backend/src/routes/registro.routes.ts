import { Router } from 'express';
import { RegistroController } from '../controllers/registro.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const controller = new RegistroController();
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Registros
 *   description: Registro diário de sintomas e métricas
 */

/**
 * @swagger
 * /registros:
 *   post:
 *     summary: Cria ou atualiza o registro diário da usuária
 *     tags: [Registros]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inchaco:
 *                 type: integer
 *               fomeCompulsao:
 *                 type: integer
 *               humorIrritacao:
 *                 type: integer
 *               qualidadeSono:
 *                 type: integer
 *               pesoKg:
 *                 type: number
 *               notas:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registro salvo com sucesso + recomendações calculadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 registro:
 *                   type: object
 *                 recomendacoes:
 *                   $ref: '#/components/schemas/Recomendacoes'
 *   get:
 *     summary: Lista registros diários da usuária (mais recente primeiro)
 *     tags: [Registros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página (paginaçao)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Quantidade de registros por página
 *     responses:
 *       200:
 *         description: Lista paginada de registros da usuária
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       dataRegistro:
 *                         type: string
 *                         format: date-time
 *                       inchaco:
 *                         type: integer
 *                       fomeCompulsao:
 *                         type: integer
 *                       humorIrritacao:
 *                         type: integer
 *                       qualidadeSono:
 *                         type: integer
 *                       pesoKg:
 *                         type: number
 *                       diaCiclo:
 *                         type: integer
 *                       faseCiclo:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.post('/', authMiddleware, controller.criar);

router.get('/', authMiddleware, controller.listar.bind(controller));

export { router as registroRoutes };
