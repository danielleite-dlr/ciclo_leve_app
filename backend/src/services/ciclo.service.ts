import { prisma } from '../config/database';
import { PerfilCiclo } from '@prisma/client';

interface AtualizarCicloDTO {
  modoCiclo: string;
  cicloRegular?: boolean;
  duracaoCiclo: number;
  duracaoSangramento: number;
  dataUltimaMenstruacao: Date | string;
  objetivos?: string[];
}

export class CicloService {
  async getPerfil(userId: string) {
    const perfil = await prisma.perfilCiclo.findUnique({
      where: { userId },
    });
    
    // If no profile exists, return null or default structure
    // Handling this in controller usually, but here we just return the raw data
    return perfil;
  }

  async atualizarPerfil(userId: string, dados: AtualizarCicloDTO) {
    // Basic validation
    if (dados.duracaoCiclo < 21 || dados.duracaoCiclo > 45) {
      throw new Error('Duração do ciclo deve estar entre 21 e 45 dias');
    }

    // Upsert perfil
    const perfil = await prisma.perfilCiclo.upsert({
      where: { userId },
      update: {
        modoCiclo: dados.modoCiclo,
        cicloRegular: dados.cicloRegular,
        duracaoCiclo: dados.duracaoCiclo,
        duracaoSangramento: dados.duracaoSangramento,
        dataUltimaMenstruacao: new Date(dados.dataUltimaMenstruacao),
        objetivos: dados.objetivos ? JSON.stringify(dados.objetivos) : undefined,
      },
      create: {
        userId,
        modoCiclo: dados.modoCiclo,
        cicloRegular: dados.cicloRegular,
        duracaoCiclo: dados.duracaoCiclo,
        duracaoSangramento: dados.duracaoSangramento,
        dataUltimaMenstruacao: new Date(dados.dataUltimaMenstruacao),
        objetivos: dados.objetivos ? JSON.stringify(dados.objetivos) : undefined,
      }
    });

    return perfil;
  }

  calcularFaseAtual(perfil: PerfilCiclo | null) {
    if (!perfil) return null;

    const hoje = new Date();
    // Normalize dates to ignore time component for accurate day diff
    const hojeStart = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const ultimaMenstruacao = new Date(perfil.dataUltimaMenstruacao);
    const umStart = new Date(ultimaMenstruacao.getFullYear(), ultimaMenstruacao.getMonth(), ultimaMenstruacao.getDate());
    
    // Calculate difference in days
    const diffTime = Math.abs(hojeStart.getTime() - umStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate current day in cycle (1-based)
    const diaCiclo = (diffDays % perfil.duracaoCiclo) + 1;

    let fase: string;
    let nomeFase: string; // Friendly name
    
    if (diaCiclo <= perfil.duracaoSangramento) {
      fase = 'MENSTRUAL';
      nomeFase = 'Menstruação';
    }
    else if (diaCiclo <= 12) {
      fase = 'FOLICULAR';
      nomeFase = 'Fase Folicular';
    }
    else if (diaCiclo <= 16) {
      fase = 'OVULATORIA';
      nomeFase = 'Ovulação';
    }
    else {
      fase = 'LUTEA';
      nomeFase = 'Fase Lútea';
    }

    const diasProximaMenstruacao = perfil.duracaoCiclo - diaCiclo + 1;

    return { 
      fase, 
      nomeFase,
      diaCiclo, 
      diasProximaMenstruacao,
      dataProximaMenstruacao: new Date(hojeStart.setDate(hojeStart.getDate() + diasProximaMenstruacao))
    };
  }
}
