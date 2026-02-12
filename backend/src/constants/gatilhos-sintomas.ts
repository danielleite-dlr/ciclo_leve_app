export type SintomaChave = 'inchaco' | 'fome_compulsao' | 'qualidade_sono' | 'humor_irritacao';

export interface DicaGatilho {
  sintoma: SintomaChave;
  nivelDisparo: 3; // sempre 3 no MVP
  emoji: string;
  mensagem: string;
}

export const GATILHOS_SINTOMA: DicaGatilho[] = [
  {
    sintoma: 'inchaco',
    nivelDisparo: 3,
    emoji: '💧',
    mensagem: 'Hoje: água + caminhada + reduzir ultraprocessado e refrigerante.',
  },
  {
    sintoma: 'fome_compulsao',
    nivelDisparo: 3,
    emoji: '🍎',
    mensagem: 'Inclua 1 lanche planejado: iogurte/ovo/fruta + castanhas.',
  },
  {
    sintoma: 'qualidade_sono',
    nivelDisparo: 3,
    emoji: '🌙',
    mensagem: 'Corte cafeína após 14h + banho morno + tela off 30 min antes.',
  },
  {
    sintoma: 'humor_irritacao',
    nivelDisparo: 3,
    emoji: '🧘‍♀️',
    mensagem: 'Faça 5 min de respiração + caminhe 10 min. Não decida nada importante irritada.',
  },
];
