import { addDays, addMonths, addYears } from 'date-fns';
import { prisma } from '../config/database';
import { MODULOS, MODULOS_GRATUITOS, ModuloId, PLANOS, PlanoId } from '../constants/assinatura';

export class AssinaturaService {
  /** Plano vigente. Um plano pago vencido volta para FREE. */
  async status(userId: string) {
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plano: true, planoExpiraEm: true, planoEmTeste: true, trialUsado: true },
    });
    if (!user) throw new Error('Usuário não encontrado');

    if (user.plano !== 'FREE' && user.planoExpiraEm && user.planoExpiraEm < new Date()) {
      user = await prisma.user.update({
        where: { id: userId },
        data: { plano: 'FREE', planoExpiraEm: null, planoEmTeste: false },
        select: { plano: true, planoExpiraEm: true, planoEmTeste: true, trialUsado: true },
      });
    }

    const premium = user.plano !== 'FREE';
    const modulos = Object.fromEntries(
      MODULOS.map((m) => [m.id, premium || MODULOS_GRATUITOS.includes(m.id)])
    ) as Record<ModuloId, boolean>;

    return {
      plano: user.plano,
      premium,
      emTeste: user.planoEmTeste,
      expiraEm: user.planoExpiraEm,
      testeDisponivel: !user.trialUsado,
      modulos,
      planos: PLANOS,
      catalogoModulos: MODULOS,
    };
  }

  async temModulo(userId: string, modulo: ModuloId) {
    const s = await this.status(userId);
    return s.modulos[modulo];
  }

  /** Compra simulada (ate integrar a loja). O anual comeca com teste gratis se ainda nao foi usado. */
  async assinar(userId: string, planoId: PlanoId) {
    const plano = PLANOS.find((p) => p.id === planoId);
    if (!plano) throw new Error('Plano inválido');

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { trialUsado: true } });
    if (!user) throw new Error('Usuário não encontrado');

    const agora = new Date();
    const comTeste = plano.testeDias > 0 && !user.trialUsado;
    const expiraEm = comTeste
      ? addDays(agora, plano.testeDias)
      : plano.periodo === 'ano'
        ? addYears(agora, 1)
        : addMonths(agora, 1);

    await prisma.user.update({
      where: { id: userId },
      data: {
        plano: plano.id,
        planoExpiraEm: expiraEm,
        planoEmTeste: comTeste,
        trialUsado: user.trialUsado || comTeste,
      },
    });
    return this.status(userId);
  }

  async cancelar(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { plano: 'FREE', planoExpiraEm: null, planoEmTeste: false },
    });
    return this.status(userId);
  }
}

export const assinaturaService = new AssinaturaService();
