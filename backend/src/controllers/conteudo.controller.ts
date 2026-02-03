import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ConteudoService } from '../services/conteudo.service';
import { prisma } from '../config/database';

const conteudoService = new ConteudoService();

export class ConteudoController {
  async listar(req: AuthRequest, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const fase = req.query.fase as string;
      
      // Get User Plan if authenticated
      let userPlano = 'FREE';
      if (req.user) {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        userPlano = user?.plano || 'FREE';
      }

      const result = await conteudoService.listar({
        fase,
        limit,
        offset,
        userPlano
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getBySlug(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      
      let userPlano = 'FREE';
      if (req.user) {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        userPlano = user?.plano || 'FREE';
      }

      const conteudo = await conteudoService.getBySlug(slug, userPlano);
      
      if (!conteudo) {
        return res.status(404).json({ error: 'Conteúdo não encontrado' });
      }

      res.json(conteudo);
    } catch (error: any) {
      if (error.message.includes('Premium')) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno' });
    }
  }
}
