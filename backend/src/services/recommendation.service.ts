import { MENSAGENS_POR_FASE, MensagemFase } from '../constants/mensagens-fase';
import { NOTAS_POR_DIA, NOTAS_SEM_CICLO } from '../constants/notas-especialista';
import { GATILHOS_SINTOMA, SintomaChave } from '../constants/gatilhos-sintomas';

// Sintomas capturados no registro diário
export type Sintomas = {
  inchaco: number;
  fomeCompulsao: number;
  humorIrritacao: number;
  qualidadeSono: number;
};

// Resultado consolidado de recomendações do dia
export type Recomendacoes = {
  mensagemFase: MensagemFase | null;
  notaEspecialista: string;
  dicasExtras: string[];
};

/**
 * Consolida todas as recomendações diárias (fase + nota + gatilhos de sintomas).
 *
 * Este service NÃO acessa banco nem requisições externas — só consome as
 * bibliotecas de mensagens/notas/gatilhos. Ideal para ser usado em controllers
 * como /perfil e /registros.
 */
export class RecommendationService {
  gerarRecomendacoes(opts: {
    fase: 'MENSTRUAL' | 'FOLICULAR' | 'OVULATORIA' | 'LUTEA' | null;
    diaCiclo: number | null;
    sintomasHoje: Sintomas;
    sintomasOntem?: Sintomas | null;
  }): Recomendacoes {
    const { fase, diaCiclo, sintomasHoje, sintomasOntem } = opts;

    // 1) Mensagem da fase (Camada 1)
    const mensagemFase: MensagemFase | null = fase ? MENSAGENS_POR_FASE[fase] ?? null : null;

    // 2) Nota da especialista (Camada 3)
    const notaEspecialista = this.getNotaEspecialista(fase, diaCiclo, sintomasOntem);

    // 3) Dicas extras (Camada 2)
    const dicasExtras = this.getDicasExtras(sintomasHoje);

    return {
      mensagemFase,
      notaEspecialista,
      dicasExtras,
    };
  }

  private getDicasExtras(sintomasHoje: Sintomas): string[] {
    const mapeamento: Record<SintomaChave, number> = {
      inchaco: sintomasHoje.inchaco,
      fome_compulsao: sintomasHoje.fomeCompulsao,
      qualidade_sono: sintomasHoje.qualidadeSono,
      humor_irritacao: sintomasHoje.humorIrritacao,
    };

    return GATILHOS_SINTOMA
      .filter((gatilho) => mapeamento[gatilho.sintoma] >= gatilho.nivelDisparo)
      .map((gatilho) => `${gatilho.emoji} ${gatilho.mensagem}`);
  }

  private getNotaEspecialista(
    fase: 'MENSTRUAL' | 'FOLICULAR' | 'OVULATORIA' | 'LUTEA' | null,
    diaCiclo: number | null,
    sintomasOntem?: Sintomas | null,
  ): string {
    // Modo com ciclo: usa tabela de notas por dia de ciclo
    if (fase && diaCiclo) {
      const nota = NOTAS_POR_DIA.find((n) => n.diaCiclo === diaCiclo)?.mensagem;
      if (nota) return nota;

      // fallback genérico
      return NOTAS_SEM_CICLO.find((n) => n.contexto === 'generica')!.mensagem;
    }

    // Modo sem ciclo: nota baseada em sintomas do dia anterior
    if (!sintomasOntem) {
      return NOTAS_SEM_CICLO.find((n) => n.contexto === 'generica')!.mensagem;
    }

    const valores = [
      { contexto: 'inchaco' as const, valor: sintomasOntem.inchaco },
      { contexto: 'fome' as const, valor: sintomasOntem.fomeCompulsao },
      { contexto: 'sono' as const, valor: sintomasOntem.qualidadeSono },
      { contexto: 'humor' as const, valor: sintomasOntem.humorIrritacao },
    ];

    // Se todos os sintomas estão baixos, celebração
    if (valores.every((v) => v.valor <= 1)) {
      return NOTAS_SEM_CICLO.find((n) => n.contexto === 'dia_bom')!.mensagem;
    }

    // Sintoma predominante
    const predominante = valores.sort((a, b) => b.valor - a.valor)[0];

    return (
      NOTAS_SEM_CICLO.find((n) => n.contexto === predominante.contexto)?.mensagem ||
      NOTAS_SEM_CICLO.find((n) => n.contexto === 'generica')!.mensagem
    );
  }
}

export const recommendationService = new RecommendationService();
