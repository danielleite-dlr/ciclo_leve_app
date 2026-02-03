import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { RegistroService } from '../services/registro.service';

const registroService = new RegistroService();

export class RegistroController {
  async criar(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Auth required' });
      
      const registro = await registroService.criarOuAtualizar(req.user.id, req.body);
      res.status(201).json(registro);
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
