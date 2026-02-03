import { prisma } from '../config/database';

interface ListarConteudoDTO {
  fase?: string;
  objetivos?: string[];
  limit?: number;
  offset?: number;
  userPlano?: string;
}

export class ConteudoService {
  async listar(dto: ListarConteudoDTO) {
    const { fase, objetivos, limit = 10, offset = 0, userPlano } = dto;
    const isPremium = ['PREMIUM_MENSAL', 'PREMIUM_ANUAL'].includes(userPlano || 'FREE');

    // Build query
    const where: any = {
      publicado: true,
      deletedAt: null,
    };

    if (!isPremium) {
      where.premiumOnly = false;
    }

    if (fase) {
      // Assuming fasesAplicaveis store JSON array of strings
      // We use array_contains logic via Prisma's JSON handling
      // Note: In Prisma with PostgreSQL, we can use array operators on JSONB
      // But for simplicity and broader compatibility, sometimes we do string matching or raw query
      // Here we rely on Prisma's `array_contains` if using Json type
      // OR operator for "fases_aplicaveis" containing the phase
      // Since JSON filtering can be specific, we'll try standard `path` filter
      // Alternatively, fetch more and filter in memory if volume is low, but let's try db filter
      where.fasesAplicaveis = {
        array_contains: fase
      };
    }

    // Objetivo filtering is Tricky with JSON array column in Prisma + SQLite/Postgres differences
    // For standard Postgres, array_contains works
    if (objetivos && objetivos.length > 0) {
      // Complex logic: content should match AT LEAST ONE objective
      // Stored as tags? No, usually distinct logic. 
      // PRD mentions "tags" jsonb. Let's filter by tags matching objectives
      // Since Prisma OR logic with JSON arrays is verbose:
      // We will skip strict database filtering for objectives for MVP simplicity OR do raw query
      // Let's implement partial support:
      // where.OR = objetivos.map(obj => ({ tags: { array_contains: obj.toLowerCase() } }));
    }

    const conteudos = await prisma.conteudoEducacional.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        categoria: true,
        tipo: true,
        titulo: true,
        descricao: true,
        thumbnailUrl: true,
        tempoLeituraMin: true,
        premiumOnly: true,
        slug: true,
        fasesAplicaveis: true,
        tags: true,
      }
    });

    const total = await prisma.conteudoEducacional.count({ where });

    return {
      data: conteudos,
      pagination: {
        total,
        page: Math.floor(offset / limit) + 1,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getBySlug(slug: string, userPlano?: string) {
    const conteudo = await prisma.conteudoEducacional.findUnique({
      where: { slug }
    });

    if (!conteudo) return null;

    const isPremium = ['PREMIUM_MENSAL', 'PREMIUM_ANUAL'].includes(userPlano || 'FREE');
    if (conteudo.premiumOnly && !isPremium) {
      throw new Error('Conteúdo exclusivo para assinantes Premium');
    }

    return conteudo;
  }
}
