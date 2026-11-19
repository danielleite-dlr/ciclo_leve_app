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
    mensagem: 'Beba mais água, faça uma caminhada e reduza ultraprocessados e refrigerante.',
  },
  {
    sintoma: 'fome_compulsao',
    nivelDisparo: 3,
    emoji: '🍎',
    mensagem: 'Inclua um lanche planejado, como iogurte, ovo ou fruta com castanhas.',
  },
  {
    sintoma: 'qualidade_sono',
    nivelDisparo: 3,
    emoji: '🌙',
    mensagem: 'Evite cafeína depois das 14h, tome um banho morno e desligue as telas 30 minutos antes de deitar.',
  },
  {
    sintoma: 'humor_irritacao',
    nivelDisparo: 3,
    emoji: '🧘‍♀️',
    mensagem: 'Faça 5 minutos de respiração e caminhe 10 minutos. Deixe decisões importantes para depois.',
  },
];
