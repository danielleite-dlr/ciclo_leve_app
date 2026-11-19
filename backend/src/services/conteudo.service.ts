import { prisma } from '../config/database';
import { assinaturaService } from './assinatura.service';
import { CicloService } from './ciclo.service';

const cicloService = new CicloService();

export class ConteudoBloqueadoError extends Error {
  constructor() {
    super('Recurso disponível no plano Premium');
  }
}

const fasesDe = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

export class ConteudoService {
  /** Fase atual da usuaria, para ordenar os artigos. */
  private async faseAtual(userId: string) {
    const perfil = await cicloService.getPerfil(userId);
    return cicloService.calcularFaseAtual(perfil)?.fase ?? null;
  }

  /**
   * Lista os artigos publicados. Os da fase atual vem primeiro.
   * Artigos premium aparecem para todas, com `bloqueado: true` para quem nao tem o modulo.
   */
  async listar(userId: string, filtroFase?: string) {
    const [fase, liberado] = await Promise.all([
      this.faseAtual(userId),
      assinaturaService.temModulo(userId, 'BIBLIOTECA'),
    ]);

    const artigos = await prisma.conteudoEducacional.findMany({
      where: { publicado: true, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        categoria: true,
        titulo: true,
        descricao: true,
        tempoLeituraMin: true,
        premiumOnly: true,
        slug: true,
        fasesAplicaveis: true,
      },
    });

    const lista = artigos
      .map((a) => {
        const fases = fasesDe(a.fasesAplicaveis);
        return {
          ...a,
          fasesAplicaveis: fases,
          daFaseAtual: !!fase && fases.includes(fase),
          bloqueado: a.premiumOnly && !liberado,
        };
      })
      .filter((a) => !filtroFase || a.fasesAplicaveis.includes(filtroFase))
      .sort((a, b) => Number(b.daFaseAtual) - Number(a.daFaseAtual));

    return { faseAtual: fase, data: lista };
  }

  async getBySlug(userId: string, slug: string) {
    const conteudo = await prisma.conteudoEducacional.findFirst({
      where: { slug, publicado: true, deletedAt: null },
    });
    if (!conteudo) return null;

    if (conteudo.premiumOnly && !(await assinaturaService.temModulo(userId, 'BIBLIOTECA'))) {
      throw new ConteudoBloqueadoError();
    }

    await prisma.conteudoEducacional.update({
      where: { id: conteudo.id },
      data: { visualizacoes: { increment: 1 } },
    });

    return { ...conteudo, fasesAplicaveis: fasesDe(conteudo.fasesAplicaveis) };
  }
}
