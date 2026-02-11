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
 *     summary: Retorna o perfil completo e cálculo do ciclo
 *     tags: [Perfil]
 *     description: |
 *       Retorna dados cadastrais e o status atual do ciclo menstrual.
 *
 *       ### Fases do Ciclo (base 28 dias)
 *       - **Dias 1-5 (Menstruação):** 🔴 Fase Menstrual. Insight: "Recarregue as energias".
 *       - **Dias 6-12 (Folicular):** ⚡ Fase Folicular. Insight: "Energia em Alta".
 *       - **Dias 13-16 (Ovulatória):** ✨ Fase Ovulatória. Insight: "Auge da Confiança".
 *       - **Dias 17-28 (Lútea):** 🌙 Fase Lútea. Insight: "Hora de Desacelerar".
 *
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sucesso
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
 *             examples:
 *               CenarioMenstruacao:
 *                 summary: 🔴 Exemplo: Menstruação (Dia 3)
 *                 value:
 *                   user: { nomeCompleto: "Maria Silva" }
 *                   faseAtual:
 *                     fase: "MENSTRUAL"
 *                     nomeFase: "Menstruação"
 *                     diaCiclo: 3
 *                     insight:
 *                       titulo: "Recarregue as energias"
 *                       emoji: "🔋"
 *                       descricao: "Seu corpo pede descanso."
 *               CenarioOvulacao:
 *                 summary: ✨ Exemplo: Ovulação (Dia 14)
 *                 value:
 *                   user: { nomeCompleto: "Maria Silva" }
 *                   faseAtual:
 *                     fase: "OVULATORIA"
 *                     nomeFase: "Fase Ovulatória"
 *                     diaCiclo: 14
 *                     insight:
 *                       titulo: "Auge da Confiança"
 *                       emoji: "✨"
 *                       descricao: "Sua comunicação está no máximo."
 *       401:
 *         description: Não autorizado
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
