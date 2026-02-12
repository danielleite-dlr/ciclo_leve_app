import { Router } from 'express';
import { RegistroController } from '../controllers/registro.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const controller = new RegistroController();
const router = Router();

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
 */
router.post('/', authMiddleware, controller.criar);

router.get('/', authMiddleware, controller.listar.bind(controller));

export { router as registroRoutes };
