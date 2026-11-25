import { addDays, addMonths, addYears } from 'date-fns';
import { prisma } from '../config/database';
import { MODULOS, MODULOS_GRATUITOS, ModuloId, PLANOS, PlanoId } from '../constants/assinatura';
import { consultarPlano, revenuecatConfigurado } from './revenuecat.service';

// Compra sem loja (so marca o plano no banco). Liberada fora de producao ou com COMPRA_SIMULADA=true.
const compraSimulada = () => process.env.NODE_ENV !== 'production' || process.env.COMPRA_SIMULADA === 'true';

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
      userId,
      plano: user.plano,
      premium,
      emTeste: user.planoEmTeste,
      expiraEm: user.planoExpiraEm,
      testeDisponivel: !user.trialUsado,
      modulos,
      planos: PLANOS,
      catalogoModulos: MODULOS,
      // Como o app deve vender: pela loja (chave publica do RevenueCat) ou simulado
      compras: {
        revenuecatAndroid: process.env.REVENUECAT_ANDROID_KEY || null,
        simulada: compraSimulada(),
      },
    };
  }

  async temModulo(userId: string, modulo: ModuloId) {
    const s = await this.status(userId);
    return s.modulos[modulo];
  }

  /** Atualiza o plano com o que o RevenueCat diz (depois de uma compra, restauracao ou webhook). */
  async sincronizar(userId: string) {
    if (!revenuecatConfigurado()) return this.status(userId);
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, trialUsado: true } });
    if (!user) throw new Error('Usuário não encontrado');

    const loja = await consultarPlano(userId);
    await prisma.user.update({
      where: { id: userId },
      data: loja.ativo
        ? {
            plano: loja.plano,
            planoExpiraEm: loja.expiraEm,
            planoEmTeste: loja.emTeste,
            trialUsado: user.trialUsado || loja.usouTeste,
          }
        : { plano: 'FREE', planoExpiraEm: null, planoEmTeste: false, trialUsado: user.trialUsado || loja.usouTeste },
    });
    return this.status(userId);
  }

  /** Compra simulada (sem loja). O anual comeca com teste gratis se ainda nao foi usado. */
  async assinar(userId: string, planoId: PlanoId) {
    if (!compraSimulada()) throw new Error('Assine pela loja de aplicativos.');
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
    if (!compraSimulada()) throw new Error('Cancele a assinatura na loja de aplicativos.');
    await prisma.user.update({
      where: { id: userId },
      data: { plano: 'FREE', planoExpiraEm: null, planoEmTeste: false },
    });
    return this.status(userId);
  }
}

export const assinaturaService = new AssinaturaService();
