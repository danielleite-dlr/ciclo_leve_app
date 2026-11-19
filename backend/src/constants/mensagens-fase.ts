export interface MensagemFase {
  fase: 'MENSTRUAL' | 'FOLICULAR' | 'OVULATORIA' | 'LUTEA';
  diasCiclo: string;
  contextoHormonal: string;
  tendeDia: string; // "Hoje seu corpo tende a..."
  emoji: string;    // Emoji principal da fase
  titulo: string;   // Título curto (ex: Energia em Alta)
  faca: string[];   // 3 ações
  evite: string[];  // 2 itens
}

export const MENSAGENS_POR_FASE: Record<string, MensagemFase> = {
  MENSTRUAL: {
    fase: 'MENSTRUAL',
    diasCiclo: '1-5',
    contextoHormonal: 'Estrogênio e progesterona em baixa',
    tendeDia: 'A energia costuma cair e a fome emocional pode aumentar.',
    emoji: '🔋',
    titulo: 'Recarregue as energias',
    faca: [
      'Priorize proteína no café da manhã',
      'Caminhada leve 20 min',
      '2L de água (meta do dia)'
    ],
    evite: [
      'Treino pesado se estiver exausta',
      'Muito açúcar à noite'
    ]
  },
  FOLICULAR: {
    fase: 'FOLICULAR',
    diasCiclo: '6-12',
    contextoHormonal: 'Estrogênio subindo',
    tendeDia: 'Energia e disposição costumam subir.',
    emoji: '⚡',
    titulo: 'Energia em Alta',
    faca: [
      'Treino de força ou HIIT curto (se já treina)',
      'Planeje refeições da semana (10 min)',
      'Vegetais + proteína no almoço'
    ],
    evite: [
      'Pular refeição (gera compulsão depois)',
      '"Dieta 8 ou 80"'
    ]
  },
  OVULATORIA: {
    fase: 'OVULATORIA',
    diasCiclo: '13-16',
    contextoHormonal: 'Pico de estrogênio',
    tendeDia: 'Muitas sentem pico de energia; algumas incham.',
    emoji: '✨',
    titulo: 'Auge da Confiança',
    faca: [
      'Treino de força (melhor fase pra evoluir)',
      'Água + sal controlado',
      'Fibra (fruta + aveia/legumes)'
    ],
    evite: [
      'Ultraprocessado (retém líquido)',
      'Exagerar álcool (piora sono e fome)'
    ]
  },
  LUTEA: {
    fase: 'LUTEA',
    diasCiclo: '17-28',
    contextoHormonal: 'Progesterona alta, depois queda',
    tendeDia: 'Podem aparecer retenção, irritação e mais fome.',
    emoji: '🌙',
    titulo: 'Hora de Desacelerar',
    faca: [
      'Aumente proteína e fibra',
      'Caminhada 20–30 min (reduz ansiedade)',
      'Sono: deitar 30 min mais cedo'
    ],
    evite: [
      'Se culpar por fome (planeje lanche)',
      '"Compensar" com jejum (piora TPM)'
    ]
  }
};
