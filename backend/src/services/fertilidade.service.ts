import { prisma } from '../config/database';
import { parseData } from './menstruacao.service';

// Registro de relacao sexual e testes (ovulacao/gravidez). Dado sensivel (LGPD art. 11):
// so e gravado com consentimento especifico; revogar apaga todos os registros.

export const RELACAO = ['SEM_RELACAO', 'PROTEGIDA', 'SEM_PROTECAO'] as const;
export const RESULTADO = ['POSITIVO', 'NEGATIVO'] as const;

export class FertilidadeError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

type Campo = 'relacao' | 'testeOvulacao' | 'testeGravidez';

// undefined = nao mexe; null = limpa; string = precisa estar na lista permitida
function validar(valor: unknown, permitidos: readonly string[], campo: Campo): string | null | undefined {
  if (valor === undefined) return undefined;
  if (valor === null) return null;
  if (typeof valor === 'string' && permitidos.includes(valor)) return valor;
  throw new FertilidadeError(`Valor inválido para "${campo}"`);
}

export class FertilidadeService {
  async consentimento(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { consentimentoSaudeSexual: true, consentimentoSaudeSexualData: true },
    });
    return { aceito: !!user?.consentimentoSaudeSexual, data: user?.consentimentoSaudeSexualData ?? null };
  }

  async definirConsentimento(userId: string, aceito: boolean) {
    if (aceito) {
      await prisma.user.update({
        where: { id: userId },
        data: { consentimentoSaudeSexual: true, consentimentoSaudeSexualData: new Date() },
      });
      return { aceito: true, apagados: 0 };
    }
    // Revogacao: apaga os dados e registra a data da revogacao
    const [apagados] = await prisma.$transaction([
      prisma.registroFertilidade.deleteMany({ where: { userId } }),
      prisma.user.update({
        where: { id: userId },
        data: { consentimentoSaudeSexual: false, consentimentoSaudeSexualData: new Date() },
      }),
    ]);
    return { aceito: false, apagados: apagados.count };
  }

  async listar(userId: string, de?: Date, ate?: Date) {
    return prisma.registroFertilidade.findMany({
      where: { userId, data: { ...(de ? { gte: de } : {}), ...(ate ? { lte: ate } : {}) } },
      orderBy: { data: 'desc' },
      take: 120,
    });
  }

  async salvar(userId: string, dataStr: unknown, body: any) {
    const { aceito } = await this.consentimento(userId);
    if (!aceito) throw new FertilidadeError('É preciso autorizar o uso desses dados antes de registrar.', 403);

    const data = parseData(dataStr);
    const campos = {
      relacao: validar(body?.relacao, RELACAO, 'relacao'),
      testeOvulacao: validar(body?.testeOvulacao, RESULTADO, 'testeOvulacao'),
      testeGravidez: validar(body?.testeGravidez, RESULTADO, 'testeGravidez'),
    };
    const update = Object.fromEntries(Object.entries(campos).filter(([, v]) => v !== undefined));
    if (Object.keys(update).length === 0) throw new FertilidadeError('Nada para registrar');

    return prisma.registroFertilidade.upsert({
      where: { userId_data: { userId, data } },
      update,
      create: { userId, data, ...update },
    });
  }
}
