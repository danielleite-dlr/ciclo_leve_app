import { prisma } from '../config/database';

// Registro real de menstruacao (inicio/fim). Cada novo inicio atualiza a data da ultima
// menstruacao do perfil e recalcula as medias de ciclo/sangramento a partir do historico,
// deixando as previsoes (fase, periodo fertil, calendario) cada vez mais precisas.

const DIA_MS = 24 * 60 * 60 * 1000;
const MAX_HISTORICO_MEDIA = 6;

export class MenstruacaoError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

// O app envia a data local da usuaria (yyyy-MM-dd); gravamos como meia-noite UTC (coluna @db.Date).
export function parseData(valor: unknown, campo = 'data'): Date {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw new MenstruacaoError(`Campo "${campo}" deve estar no formato AAAA-MM-DD`);
  }
  const d = new Date(`${valor}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw new MenstruacaoError(`Campo "${campo}" inválido`);
  // Tolerancia de 1 dia por causa do fuso (a data local pode estar "a frente" do UTC do servidor)
  if (d.getTime() > Date.now() + DIA_MS) throw new MenstruacaoError('A data não pode ser no futuro');
  return d;
}

const diasEntre = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DIA_MS);
const media = (valores: number[]) => Math.round(valores.reduce((s, v) => s + v, 0) / valores.length);

export class MenstruacaoService {
  async status(userId: string, hoje?: Date) {
    const historico = await prisma.historicoMenstrual.findMany({
      where: { userId },
      orderBy: { dataInicio: 'desc' },
      take: 12,
    });
    const atual = historico[0] ?? null;
    const ref = hoje ?? new Date();
    // "Em andamento": ultimo registro sem fim, iniciado ha menos de 10 dias
    const emAndamento = !!atual && !atual.dataFim && diasEntre(atual.dataInicio, ref) < 10;
    return { emAndamento, atual, historico };
  }

  async registrarInicio(userId: string, data: Date) {
    const perfil = await prisma.perfilCiclo.findUnique({ where: { userId } });
    if (!perfil) throw new MenstruacaoError('Complete os dados do seu ciclo antes de registrar a menstruação');

    let historico = await prisma.historicoMenstrual.findMany({ where: { userId }, orderBy: { dataInicio: 'desc' } });

    if (historico.some((h) => h.dataInicio.getTime() === data.getTime())) {
      throw new MenstruacaoError('Essa menstruação já foi registrada', 409);
    }

    // A data informada no onboarding/perfil tambem e uma menstruacao real: entra no historico
    // (assim registrar uma data antiga nao faz a "ultima menstruacao" voltar no tempo).
    const lmp = perfil.dataUltimaMenstruacao;
    if (lmp.getTime() !== data.getTime() && !historico.some((h) => h.dataInicio.getTime() === lmp.getTime())) {
      await prisma.historicoMenstrual.create({
        data: { userId, dataInicio: lmp, duracaoSangramento: perfil.duracaoSangramento },
      });
      historico = await prisma.historicoMenstrual.findMany({ where: { userId }, orderBy: { dataInicio: 'desc' } });
    }

    // Se ja existe um inicio depois desta data (registro retroativo), ela tambem precisa de distancia minima.
    const proximo = [...historico].reverse().find((h) => h.dataInicio.getTime() > data.getTime());
    if (proximo && diasEntre(data, proximo.dataInicio) < 10) {
      throw new MenstruacaoError('Já existe uma menstruação registrada poucos dias depois dessa data.');
    }

    // Fecha o ciclo anterior (o mais recente antes desta data): duracaoDias = tamanho do ciclo.
    const anterior = historico.find((h) => h.dataInicio.getTime() < data.getTime());
    if (anterior) {
      const tamanhoCiclo = diasEntre(anterior.dataInicio, data);
      if (tamanhoCiclo < 10) {
        throw new MenstruacaoError(
          'Já existe uma menstruação registrada há poucos dias. Se ela continua, registre o fim quando acabar.'
        );
      }
      await prisma.historicoMenstrual.update({
        where: { id: anterior.id },
        data: {
          duracaoDias: tamanhoCiclo,
          // Se o fim nao foi informado, assume a duracao media do sangramento
          ...(anterior.dataFim
            ? {}
            : {
                dataFim: new Date(anterior.dataInicio.getTime() + (perfil.duracaoSangramento - 1) * DIA_MS),
                duracaoSangramento: anterior.duracaoSangramento ?? perfil.duracaoSangramento,
              }),
        },
      });
    }

    const registro = await prisma.historicoMenstrual.create({
      data: {
        userId,
        dataInicio: data,
        // Registro retroativo: o tamanho deste ciclo ja e conhecido
        ...(proximo ? { duracaoDias: diasEntre(data, proximo.dataInicio) } : {}),
      },
    });
    const ciclo = await this.recalcularPerfil(userId);
    return { registro, ciclo };
  }

  async registrarFim(userId: string, data: Date) {
    const atual = await prisma.historicoMenstrual.findFirst({ where: { userId }, orderBy: { dataInicio: 'desc' } });
    if (!atual) throw new MenstruacaoError('Nenhuma menstruação registrada para encerrar');

    const dias = diasEntre(atual.dataInicio, data) + 1;
    if (dias < 1) throw new MenstruacaoError('O fim não pode ser antes do início');
    if (dias > 15) throw new MenstruacaoError('Sangramento acima de 15 dias: confira as datas ou procure orientação médica');

    const registro = await prisma.historicoMenstrual.update({
      where: { id: atual.id },
      data: { dataFim: data, duracaoSangramento: dias },
    });
    const ciclo = await this.recalcularPerfil(userId);
    return { registro, ciclo };
  }

  async desfazer(userId: string, id: string) {
    const item = await prisma.historicoMenstrual.findFirst({ where: { id, userId } });
    if (!item) throw new MenstruacaoError('Registro não encontrado', 404);
    await prisma.historicoMenstrual.delete({ where: { id } });

    // O ciclo anterior passa a ir ate o proximo inicio (ou fica em aberto se era o ultimo)
    const anterior = await prisma.historicoMenstrual.findFirst({
      where: { userId, dataInicio: { lt: item.dataInicio } },
      orderBy: { dataInicio: 'desc' },
    });
    const proximo = await prisma.historicoMenstrual.findFirst({
      where: { userId, dataInicio: { gt: item.dataInicio } },
      orderBy: { dataInicio: 'asc' },
    });
    if (anterior) {
      await prisma.historicoMenstrual.update({
        where: { id: anterior.id },
        data: { duracaoDias: proximo ? diasEntre(anterior.dataInicio, proximo.dataInicio) : null },
      });
    }

    const ciclo = await this.recalcularPerfil(userId);
    return { ciclo };
  }

  // Ultima menstruacao = inicio mais recente; medias com os ultimos ciclos validos.
  private async recalcularPerfil(userId: string) {
    const historico = await prisma.historicoMenstrual.findMany({ where: { userId }, orderBy: { dataInicio: 'desc' } });
    if (historico.length === 0) return prisma.perfilCiclo.findUnique({ where: { userId } });

    const ciclos = historico
      .map((h) => h.duracaoDias)
      .filter((v): v is number => v != null && v >= 21 && v <= 45)
      .slice(0, MAX_HISTORICO_MEDIA);
    const sangramentos = historico
      .map((h) => h.duracaoSangramento)
      .filter((v): v is number => v != null && v >= 1 && v <= 10)
      .slice(0, MAX_HISTORICO_MEDIA);

    return prisma.perfilCiclo.update({
      where: { userId },
      data: {
        dataUltimaMenstruacao: historico[0].dataInicio,
        ...(ciclos.length > 0 ? { duracaoCiclo: media(ciclos) } : {}),
        ...(sangramentos.length > 0 ? { duracaoSangramento: media(sangramentos) } : {}),
      },
    });
  }
}
