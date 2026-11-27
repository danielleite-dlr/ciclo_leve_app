import { timingSafeEqual } from 'crypto';
import { prisma } from '../config/database';
import { avisarAtividade } from './alerta.service';

// Painel de uso para a dona do app: quantas usuarias, quantas usaram agora e nas ultimas horas.
// "Acesso" = qualquer chamada autenticada do app. Gravamos no maximo a cada 2 min por usuaria
// para nao escrever no banco a cada requisicao.

const INTERVALO_MS = 2 * 60 * 1000;
const ultimaGravacao = new Map<string, number>();

/** Marca que a usuaria usou o app agora. Nunca falha nem atrasa a requisicao. */
export function marcarAcesso(userId: string) {
  const agora = Date.now();
  if (agora - (ultimaGravacao.get(userId) ?? 0) < INTERVALO_MS) return;
  ultimaGravacao.set(userId, agora);
  avisarAtividade('uso', userId).catch(() => {});
  prisma.user
    .updateMany({ where: { id: userId }, data: { ultimoAcesso: new Date(agora) } })
    .catch(() => ultimaGravacao.delete(userId));
}

/** Confere usuario e senha do painel (HTTP Basic). Sem ADMIN_USUARIO/ADMIN_SENHA o painel fica desligado. */
export function painelLigado() {
  return !!process.env.ADMIN_USUARIO && !!process.env.ADMIN_SENHA;
}

export function credenciaisValidas(cabecalho: string | undefined) {
  if (!painelLigado() || !cabecalho?.startsWith('Basic ')) return false;
  const recebido = Buffer.from(Buffer.from(cabecalho.slice(6), 'base64').toString('utf8'));
  const esperado = Buffer.from(`${process.env.ADMIN_USUARIO}:${process.env.ADMIN_SENHA}`);
  return recebido.length === esperado.length && timingSafeEqual(recebido, esperado);
}

const MIN = 60 * 1000;
const HORA = 60 * MIN;
const DIA = 24 * HORA;
const FUSO = 'America/Sao_Paulo';

function diaLocal(d: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

export type Metricas = Awaited<ReturnType<typeof calcularMetricas>>;

export async function calcularMetricas(agora = new Date()) {
  const desde = (ms: number) => new Date(agora.getTime() - ms);
  const ativas = { deletedAt: null };
  const acessoDesde = (ms: number) => prisma.user.count({ where: { ...ativas, ultimoAcesso: { gte: desde(ms) } } });
  const novasDesde = (ms: number) => prisma.user.count({ where: { ...ativas, createdAt: { gte: desde(ms) } } });

  const [
    total, agoraOnline, ultimaHora, ultimas24h, ultimos7d, ultimos30d,
    novas24h, novas7d, novas30d, premium, emTeste, registros24h, cadastros,
  ] = await Promise.all([
    prisma.user.count({ where: ativas }),
    acessoDesde(5 * MIN),
    acessoDesde(HORA),
    acessoDesde(DIA),
    acessoDesde(7 * DIA),
    acessoDesde(30 * DIA),
    novasDesde(DIA),
    novasDesde(7 * DIA),
    novasDesde(30 * DIA),
    prisma.user.count({ where: { ...ativas, plano: { not: 'FREE' }, OR: [{ planoExpiraEm: null }, { planoExpiraEm: { gt: agora } }] } }),
    prisma.user.count({ where: { ...ativas, plano: { not: 'FREE' }, planoEmTeste: true, planoExpiraEm: { gt: agora } } }),
    prisma.registroDiario.count({ where: { createdAt: { gte: desde(DIA) } } }),
    prisma.user.findMany({ where: { ...ativas, createdAt: { gte: desde(14 * DIA) } }, select: { createdAt: true } }),
  ]);

  // Cadastros por dia, ultimos 14 dias (fuso de Brasilia), incluindo dias sem cadastro
  const porDia = new Map<string, number>();
  for (let i = 13; i >= 0; i--) porDia.set(diaLocal(desde(i * DIA)), 0);
  for (const c of cadastros) {
    const d = diaLocal(c.createdAt);
    if (porDia.has(d)) porDia.set(d, porDia.get(d)! + 1);
  }

  return {
    total,
    acessos: { agoraOnline, ultimaHora, ultimas24h, ultimos7d, ultimos30d },
    novas: { ultimas24h: novas24h, ultimos7d: novas7d, ultimos30d: novas30d },
    premium,
    emTeste,
    registros24h,
    cadastrosPorDia: [...porDia].map(([dia, qtd]) => ({ dia, qtd })),
    geradoEm: agora,
  };
}
