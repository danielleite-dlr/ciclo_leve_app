import { NextFunction, Response } from 'express';
import { AuthRequest } from './auth.middleware';
import { ModuloId } from '../constants/assinatura';
import { assinaturaService } from '../services/assinatura.service';

/** Bloqueia a rota quando o modulo nao esta liberado no plano da usuaria (402). */
export const exigirModulo = (modulo: ModuloId) => async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'User not authenticated' });
    if (await assinaturaService.temModulo(req.user.id, modulo)) return next();
    return res.status(402).json({ error: 'Recurso disponível no plano Premium', modulo });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};
