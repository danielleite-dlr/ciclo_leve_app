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
 *       <div style="font-family: sans-serif; color: #333;">
 *         <h3>🔄 Lógica do Ciclo Menstrual</h3>
 *         <p>O app calcula a fase atual automaticamente baseado na DUM (Data da Última Menstruação).</p>
 *
 *         <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
 *           <thead>
 *             <tr style="background-color: #f3f4f6; text-align: left;">
 *               <th style="padding: 8px; border: 1px solid #ddd;">Dia do Ciclo</th>
 *               <th style="padding: 8px; border: 1px solid #ddd;">Fase</th>
 *               <th style="padding: 8px; border: 1px solid #ddd;">Insight (Exemplo)</th>
 *             </tr>
 *           </thead>
 *           <tbody>
 *             <tr>
 *               <td style="padding: 8px; border: 1px solid #ddd;">1 - 5</td>
 *               <td style="padding: 8px; border: 1px solid #ddd; color: #ef4444; font-weight: bold;">MENSTRUAL</td>
 *               <td style="padding: 8px; border: 1px solid #ddd;">🔋 Recarregue as energias</td>
 *             </tr>
 *             <tr>
 *               <td style="padding: 8px; border: 1px solid #ddd;">6 - 12</td>
 *               <td style="padding: 8px; border: 1px solid #ddd; color: #10b981; font-weight: bold;">FOLICULAR</td>
 *               <td style="padding: 8px; border: 1px solid #ddd;">⚡ Energia em Alta</td>
 *             </tr>
 *             <tr>
 *               <td style="padding: 8px; border: 1px solid #ddd;">13 - 16</td>
 *               <td style="padding: 8px; border: 1px solid #ddd; color: #8b5cf6; font-weight: bold;">OVULATÓRIA</td>
 *               <td style="padding: 8px; border: 1px solid #ddd;">✨ Auge da Confiança</td>
 *             </tr>
 *             <tr>
 *               <td style="padding: 8px; border: 1px solid #ddd;">17 - 28</td>
 *               <td style="padding: 8px; border: 1px solid #ddd; color: #f59e0b; font-weight: bold;">LÚTEA</td>
 *               <td style="padding: 8px; border: 1px solid #ddd;">🌙 Hora de Desacelerar</td>
 *             </tr>
 *           </tbody>
 *         </table>
 *         <br>
 *         <p><i>*Baseado em um ciclo padrão de 28 dias configurável no perfil.</i></p>
 *       </div>
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
 *                   properties:
 *                     fase:
 *                       type: string
 *                       example: "OVULATORIA"
 *                     nomeFase:
 *                       type: string
 *                       example: "Fase Ovulatória"
 *                     diaCiclo:
 *                       type: integer
 *                       example: 14
 *                     insight:
 *                       type: object
 *                       properties:
 *                         titulo:
 *                           type: string
 *                           example: "Auge da Confiança"
 *                         emoji:
 *                           type: string
 *                           example: "✨"
 *                         descricao:
 *                           type: string
 *                           example: "Sua comunicação e magnetismo estão no máximo."
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
