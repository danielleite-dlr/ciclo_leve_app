import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { RegistroService } from '../services/registro.service';
import { recommendationService, Sintomas } from '../services/recommendation.service';

const registroService = new RegistroService();

export class RegistroController {
  async criar(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Auth required' });
      
      const registro = await registroService.criarOuAtualizar(req.user.id, req.body);

      const sintomasHoje: Sintomas = {
        inchaco: registro.inchaco ?? 0,
        fomeCompulsao: registro.fomeCompulsao ?? 0,
        humorIrritacao: registro.humorIrritacao ?? 0,
        qualidadeSono: registro.qualidadeSono ?? 0,
      };

      const recomendacoes = recommendationService.gerarRecomendacoes({
        fase: (registro.faseCiclo as any) || null,
        diaCiclo: registro.diaCiclo ?? null,
        sintomasHoje,
        // MVP: por enquanto não usamos sintomas de ontem
        sintomasOntem: undefined,
      });

      res.status(201).json({ registro, recomendacoes });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listar(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Auth required' });

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 30;

      const result = await registroService.listar(req.user.id, limit, page);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
