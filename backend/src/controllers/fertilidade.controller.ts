import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { FertilidadeError, FertilidadeService } from '../services/fertilidade.service';
import { MenstruacaoError, parseData } from '../services/menstruacao.service';

const service = new FertilidadeService();

function responderErro(res: Response, error: any) {
  if (error instanceof FertilidadeError || error instanceof MenstruacaoError) {
    return res.status(error.status).json({ error: error.message });
  }
  return res.status(500).json({ error: error?.message || 'Erro interno' });
}

export class FertilidadeController {
  // GET /fertilidade/consentimento
  async consentimento(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Auth required' });
      res.json(await service.consentimento(req.user.id));
    } catch (error) {
      responderErro(res, error);
    }
  }

  // POST /fertilidade/consentimento { aceito: boolean } (false = revoga e apaga os dados)
  async definirConsentimento(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Auth required' });
      if (typeof req.body?.aceito !== 'boolean') return res.status(400).json({ error: 'Campo "aceito" é obrigatório' });
      res.json(await service.definirConsentimento(req.user.id, req.body.aceito));
    } catch (error) {
      responderErro(res, error);
    }
  }

  // GET /fertilidade?de=AAAA-MM-DD&ate=AAAA-MM-DD
  async listar(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Auth required' });
      const de = typeof req.query.de === 'string' ? parseData(req.query.de, 'de') : undefined;
      const ate = typeof req.query.ate === 'string' ? parseData(req.query.ate, 'ate') : undefined;
      res.json({ data: await service.listar(req.user.id, de, ate) });
    } catch (error) {
      responderErro(res, error);
    }
  }

  // PUT /fertilidade/:data { relacao?, testeOvulacao?, testeGravidez? }
  async salvar(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Auth required' });
      res.json(await service.salvar(req.user.id, req.params.data, req.body));
    } catch (error) {
      responderErro(res, error);
    }
  }
}
