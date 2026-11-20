import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { loginRateLimiter, registerRateLimiter } from '../middlewares/rateLimit.middleware';

const authController = new AuthController();
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação e Registro de Usuários
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nomeCompleto
 *               - email
 *               - password
 *             properties:
 *               nomeCompleto:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Email já existe ou dados inválidos
 */
router.post('/register', registerRateLimiter, authController.register.bind(authController));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login de usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso (retorna Token JWT)
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', loginRateLimiter, authController.login.bind(authController));

export { router as authRoutes };
