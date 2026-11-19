import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { MenstruacaoError, MenstruacaoService, parseData } from '../services/menstruacao.service';
import { CicloService } from '../services/ciclo.service';

const service = new MenstruacaoService();
const cicloService = new CicloService();

function responderErro(res: Response, error: any) {
  if (error instanceof MenstruacaoError) return res.status(error.status).json({ error: error.message });
  return res.status(500).json({ error: error?.message || 'Erro interno' });
}

export class MenstruacaoController {
  // GET /menstruacao?hoje=AAAA-MM-DD
  async status(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Auth required' });
      const hoje = typeof req.query.hoje === 'string' ? parseData(req.query.hoje, 'hoje') : undefined;
      res.json(await service.status(req.user.id, hoje));
    } catch (error) {
      responderErro(res, error);
    }
  }

  // POST /menstruacao/inicio { data: AAAA-MM-DD }
  async inicio(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Auth required' });
      const { registro, ciclo } = await service.registrarInicio(req.user.id, parseData(req.body?.data));
      res.status(201).json({ registro, ciclo, faseAtual: cicloService.calcularFaseAtual(ciclo) });
    } catch (error) {
      responderErro(res, error);
    }
  }

  // POST /menstruacao/fim { data: AAAA-MM-DD }
  async fim(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Auth required' });
      const { registro, ciclo } = await service.registrarFim(req.user.id, parseData(req.body?.data));
      res.json({ registro, ciclo, faseAtual: cicloService.calcularFaseAtual(ciclo) });
    } catch (error) {
      responderErro(res, error);
    }
  }

  // DELETE /menstruacao/:id
  async desfazer(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Auth required' });
      const { ciclo } = await service.desfazer(req.user.id, req.params.id);
      res.json({ ciclo, faseAtual: cicloService.calcularFaseAtual(ciclo) });
    } catch (error) {
      responderErro(res, error);
    }
  }
}
