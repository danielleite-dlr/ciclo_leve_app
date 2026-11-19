import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { assinaturaService } from '../services/assinatura.service';

export class AssinaturaController {
  // GET /assinatura
  async status(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'User not authenticated' });
      res.json(await assinaturaService.status(req.user.id));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // POST /assinatura/assinar { plano: 'MENSAL' | 'ANUAL' }  (compra simulada)
  async assinar(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'User not authenticated' });
      res.json(await assinaturaService.assinar(req.user.id, req.body?.plano));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // POST /assinatura/cancelar
  async cancelar(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'User not authenticated' });
      res.json(await assinaturaService.cancelar(req.user.id));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
