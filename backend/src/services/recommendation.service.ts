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

    // 2) Nota da especialista (Camada 3) – implementação completa virá em próxima etapa
    const notaEspecialista = '';

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
}

export const recommendationService = new RecommendationService();
