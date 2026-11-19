import { Ciclo, getDayType, getFertilityStatus } from '@/services/cycle';
import type { FertilityGoal } from '@/components/FertilityHero';
import type { Relacao, Resultado, TipoTeste } from '@/components/FertilidadeSheets';

// Mensagens mostradas depois de registrar relacao/teste, conforme objetivo e dia do ciclo.
// Conteudo informativo; nao substitui orientacao medica.

export type Feedback = { title: string; message: string };

const diasTxt = (n: number) => `${n} ${n === 1 ? 'dia' : 'dias'}`;

export function feedbackRelacao(goal: FertilityGoal | null, ciclo: Ciclo | null, data: Date, relacao: Relacao): Feedback {
  if (relacao === 'SEM_RELACAO') return { title: 'Registro salvo', message: 'Anotamos que não houve relação neste dia.' };

  const tipo = ciclo ? getDayType(data, ciclo) : null;
  const fertil = tipo === 'fertile' || tipo === 'ovulation';
  const status = ciclo ? getFertilityStatus(ciclo) : null;

  if (goal === 'EVITAR_GRAVIDEZ' && relacao === 'SEM_PROTECAO') {
    if (fertil) {
      return {
        title: 'Atenção: período fértil',
        message:
          'Houve relação sem proteção em um dia fértil, então há chance de gravidez. A pílula do dia seguinte é mais eficaz quanto antes for tomada (idealmente em até 72 horas). Em caso de dúvida, procure uma farmácia ou um serviço de saúde.',
      };
    }
    return {
      title: 'Relação registrada',
      message: 'Fora do período fértil a chance de gravidez é menor, mas não é zero. Se a menstruação atrasar, faça um teste.',
    };
  }

  if (goal === 'ENGRAVIDAR' && relacao === 'SEM_PROTECAO') {
    if (fertil) {
      return {
        title: 'Relação em dia fértil',
        message: tipo === 'ovulation' ? 'Hoje é o dia mais fértil do seu ciclo.' : 'Você está no período fértil, quando a chance de engravidar é maior.',
      };
    }
    const prox = status?.daysToFertile;
    return {
      title: 'Relação registrada',
      message: prox ? `Seu próximo período fértil começa em ${diasTxt(prox)}.` : 'Continue registrando para acompanhar seus dias férteis.',
    };
  }

  return { title: 'Relação registrada', message: 'Registro salvo com sucesso.' };
}

export function feedbackTeste(tipo: TipoTeste, resultado: Resultado): Feedback {
  if (tipo === 'OVULACAO') {
    return resultado === 'POSITIVO'
      ? {
          title: 'Teste de ovulação positivo',
          message: 'A ovulação costuma acontecer nas próximas 24 a 36 horas. Hoje e amanhã são os melhores dias para tentar.',
        }
      : { title: 'Teste de ovulação negativo', message: 'Continue testando uma vez por dia durante o período fértil.' };
  }
  return resultado === 'POSITIVO'
    ? { title: 'Teste de gravidez positivo', message: 'Procure seu médico para confirmar a gravidez e iniciar o pré-natal.' }
    : { title: 'Teste de gravidez negativo', message: 'Se a menstruação atrasar, repita o teste em alguns dias.' };
}
