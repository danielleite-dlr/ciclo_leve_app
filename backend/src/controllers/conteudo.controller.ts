import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ConteudoBloqueadoError, ConteudoService } from '../services/conteudo.service';

const conteudoService = new ConteudoService();

export class ConteudoController {
  async listar(req: AuthRequest, res: Response) {
    try {
      const fase = typeof req.query.fase === 'string' ? req.query.fase : undefined;
      res.json(await conteudoService.listar(req.user!.id, fase));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getBySlug(req: AuthRequest, res: Response) {
    try {
      const conteudo = await conteudoService.getBySlug(req.user!.id, req.params.slug);
      if (!conteudo) return res.status(404).json({ error: 'Conteúdo não encontrado' });
      res.json(conteudo);
    } catch (error: any) {
      if (error instanceof ConteudoBloqueadoError) {
        return res.status(402).json({ error: error.message, modulo: 'BIBLIOTECA' });
      }
      res.status(500).json({ error: 'Erro interno' });
    }
  }
}
