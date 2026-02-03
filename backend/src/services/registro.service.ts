import { prisma } from '../config/database';
import { CicloService } from './ciclo.service';

interface CriarRegistroDTO {
  dataRegistro?: string | Date;
  inchaco?: number;
  fomeCompulsao?: number;
  humorIrritacao?: number;
  qualidadeSono?: number;
  pesoKg?: number;
  temperaturaBasal?: number;
  notas?: string;
  humorTags?: string[];
}

const cicloService = new CicloService();

export class RegistroService {
  async criarOuAtualizar(userId: string, dados: CriarRegistroDTO) {
    const dataRegistro = dados.dataRegistro ? new Date(dados.dataRegistro) : new Date();
    
    // Normalize date to start of day to avoid time issues
    dataRegistro.setHours(0, 0, 0, 0);

    // Get current cycle profile to calculate phase
    const perfil = await prisma.perfilCiclo.findUnique({ where: { userId } });
    const faseAtual = cicloService.calcularFaseAtual(perfil);

    // Upsert logic
    const registro = await prisma.registroDiario.upsert({
      where: {
        userId_dataRegistro: {
          userId,
          dataRegistro
        }
      },
      update: {
        inchaco: dados.inchaco,
        fomeCompulsao: dados.fomeCompulsao,
        humorIrritacao: dados.humorIrritacao,
        qualidadeSono: dados.qualidadeSono,
        pesoKg: dados.pesoKg,
        temperaturaBasal: dados.temperaturaBasal,
        notas: dados.notas,
        humorTags: dados.humorTags ? JSON.stringify(dados.humorTags) : undefined,
        diaCiclo: faseAtual?.diaCiclo,
        faseCiclo: faseAtual?.fase
      },
      create: {
        userId,
        dataRegistro,
        inchaco: dados.inchaco,
        fomeCompulsao: dados.fomeCompulsao,
        humorIrritacao: dados.humorIrritacao,
        qualidadeSono: dados.qualidadeSono,
        pesoKg: dados.pesoKg,
        temperaturaBasal: dados.temperaturaBasal,
        notas: dados.notas,
        humorTags: dados.humorTags ? JSON.stringify(dados.humorTags) : undefined,
        diaCiclo: faseAtual?.diaCiclo,
        faseCiclo: faseAtual?.fase
      }
    });

    return registro;
  }

  async listar(userId: string, limit = 30, page = 1) {
    const offset = (page - 1) * limit;
    
    const registros = await prisma.registroDiario.findMany({
      where: { userId },
      orderBy: { dataRegistro: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.registroDiario.count({ where: { userId } });

    return {
      data: registros,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
