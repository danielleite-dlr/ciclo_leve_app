import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { CicloService } from '../services/ciclo.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { recommendationService, Sintomas } from '../services/recommendation.service';

const cicloService = new CicloService();

export class PerfilController {
  async getPerfil(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'User not authenticated' });
      
      const userId = req.user.id;

      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) return res.status(404).json({ error: 'User not found' });

      // Get cycle profile
      const perfilCiclo = await cicloService.getPerfil(userId);

      // Calculate current phase
      const faseAtual = cicloService.calcularFaseAtual(perfilCiclo);

      // Buscar último registro diário para alimentar sintomasHoje
      const ultimoRegistro = await prisma.registroDiario.findFirst({
        where: { userId },
        orderBy: { dataRegistro: 'desc' },
      });

      const sintomasHoje: Sintomas = {
        inchaco: ultimoRegistro?.inchaco ?? 0,
        fomeCompulsao: ultimoRegistro?.fomeCompulsao ?? 0,
        humorIrritacao: ultimoRegistro?.humorIrritacao ?? 0,
        qualidadeSono: ultimoRegistro?.qualidadeSono ?? 0,
      };

      // Gera recomendações consolidadas (ainda não expostas no payload na etapa 3.1)
      const recomendacoes = recommendationService.gerarRecomendacoes({
        fase: faseAtual?.fase ?? null,
        diaCiclo: faseAtual?.diaCiclo ?? null,
        sintomasHoje,
        sintomasOntem: undefined,
      });

      // Parse JSON fields if necessary (Prisma handles JSON, but sometimes it needs manual check)
      if (perfilCiclo && perfilCiclo.objetivos && typeof perfilCiclo.objetivos === 'string') {
        perfilCiclo.objetivos = JSON.parse(perfilCiclo.objetivos);
      }

      const { passwordHash, ...userClean } = user;

      res.json({
        user: userClean,
        ciclo: perfilCiclo,
        faseAtual
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async atualizarCiclo(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'User not authenticated' });
      
      const userId = req.user.id;
      const dados = req.body;

      // Basic validation of required fields
      if (!dados.modoCiclo || !dados.dataUltimaMenstruacao) {
        return res.status(400).json({ error: 'Campos obrigatórios: modoCiclo, dataUltimaMenstruacao' });
      }

      const perfil = await cicloService.atualizarPerfil(userId, dados);
      
      // Recalculate phase with new data
      const faseAtual = cicloService.calcularFaseAtual(perfil);

      res.json({
        message: 'Perfil de ciclo atualizado com sucesso',
        ciclo: perfil,
        faseAtual
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
