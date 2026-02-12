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
    // Implementação virá nas próximas etapas
    return {
      mensagemFase: null,
      notaEspecialista: '',
      dicasExtras: [],
    };
  }
}

export const recommendationService = new RecommendationService();
