export interface NotaEspecialista {
  diaCiclo: number;
  fase: 'MENSTRUAL' | 'FOLICULAR' | 'OVULATORIA' | 'LUTEA';
  mensagem: string;
}

export interface NotaSemCiclo {
  contexto: 'generica' | 'inchaco' | 'fome' | 'sono' | 'humor' | 'dia_bom';
  mensagem: string;
}

export const NOTAS_POR_DIA: NotaEspecialista[] = [
  // MENSTRUAL (Dias 1-5)
  { diaCiclo: 1, fase: 'MENSTRUAL', mensagem: 'Primeiro dia. Seu corpo está se renovando. Se só der pra fazer uma coisa hoje, descanse. O resto pode esperar.' },
  { diaCiclo: 2, fase: 'MENSTRUAL', mensagem: 'Se você acordou sem energia, tá certo. Não é preguiça — seus hormônios estão no ponto mais baixo do mês. Vai com calma.' },
  { diaCiclo: 3, fase: 'MENSTRUAL', mensagem: 'Dia 3 costuma ser o mais pesado. Se só der pra fazer uma coisa, beba água. Sério, já é uma vitória.' },
  { diaCiclo: 4, fase: 'MENSTRUAL', mensagem: 'Você tá quase saindo da fase mais difícil. Se bateu uma fome emocional, não se julgue. Coma algo que nutra e conforte.' },
  { diaCiclo: 5, fase: 'MENSTRUAL', mensagem: 'Último dia de menstruação pra maioria. Já consegue sentir a energia voltando aos poucos? Amanhã tende a ser melhor.' },

  // FOLICULAR (Dias 6-12)
  { diaCiclo: 6, fase: 'FOLICULAR', mensagem: 'Bem-vinda à sua melhor fase. O estrogênio tá subindo e você vai sentir. Aproveita esse gás pra organizar a semana.' },
  { diaCiclo: 7, fase: 'FOLICULAR', mensagem: 'Hoje é um ótimo dia pra começar algo novo — um treino, uma receita, um plano. Seu cérebro tá afiado.' },
  { diaCiclo: 8, fase: 'FOLICULAR', mensagem: 'Se você tem vontade de comer bem e treinar, não é força de vontade: é hormônio ajudando. Surfa essa onda.' },
  { diaCiclo: 9, fase: 'FOLICULAR', mensagem: 'Metade da fase folicular. Se tá se sentindo produtiva, é real. Use isso a seu favor sem se cobrar demais.' },
  { diaCiclo: 10, fase: 'FOLICULAR', mensagem: 'Seu corpo tá respondendo bem a treino e alimentação agora. Qualquer esforço nessa fase rende mais.' },
  { diaCiclo: 11, fase: 'FOLICULAR', mensagem: 'Amanhã ou depois começa a ovulação. Se quiser planejar algo social ou desafiador, agenda pra esses dias.' },
  { diaCiclo: 12, fase: 'FOLICULAR', mensagem: 'Último dia antes do pico. Você provavelmente tá se sentindo bem — e isso não é ilusão. É biologia a seu favor.' },

  // OVULATÓRIA (Dias 13-16)
  { diaCiclo: 13, fase: 'OVULATORIA', mensagem: 'Pico de estrogênio. Você tá no auge do mês. Se sentir vontade de socializar, treinar forte ou resolver pendências — vai.' },
  { diaCiclo: 14, fase: 'OVULATORIA', mensagem: 'Hoje seu corpo tá no modo "eu consigo". Aproveita pra fazer aquilo que você adia. Amanhã pode não ter o mesmo gás.' },
  { diaCiclo: 15, fase: 'OVULATORIA', mensagem: 'Algumas mulheres incham um pouco na ovulação. Se acontecer, não é gordura — é retenção. Água e fibra resolvem.' },
  { diaCiclo: 16, fase: 'OVULATORIA', mensagem: 'Último dia de pico. A partir de amanhã, a progesterona sobe e o ritmo muda. Tá tudo certo — é o ciclo fazendo o ciclo.' },

  // LÚTEA / TPM (Dias 17-28)
  { diaCiclo: 17, fase: 'LUTEA', mensagem: 'A progesterona começou a subir. Você pode sentir o ritmo desacelerar. Não force — adapte.' },
  { diaCiclo: 18, fase: 'LUTEA', mensagem: 'Se você tá com mais fome hoje, é seu corpo pedindo energia pro que vem. Não é fraqueza. Planeje um lanche gostoso.' },
  { diaCiclo: 19, fase: 'LUTEA', mensagem: 'Seu corpo tá retendo mais líquido agora. A balança pode subir, mas não é gordura. Confia no processo.' },
  { diaCiclo: 20, fase: 'LUTEA', mensagem: 'Metade da fase lútea. Se a irritação aparecer, respira fundo. Não é frescura — é progesterona. Você não precisa resolver tudo hoje.' },
  { diaCiclo: 21, fase: 'LUTEA', mensagem: 'Se o treino tá mais difícil, diminui a intensidade sem culpa. Caminhada conta. Alongamento conta. Descanso conta.' },
  { diaCiclo: 22, fase: 'LUTEA', mensagem: 'Fome de carbo? Normal. Seu metabolismo tá mais acelerado agora e pede mais energia. Escolha carbo com fibra e segue em frente.' },
  { diaCiclo: 23, fase: 'LUTEA', mensagem: 'Se você acordou se sentindo inchada e irritada, saiba: é a fase mais desafiadora do ciclo. Você não tá falhando. Seu corpo tá trabalhando.' },
  { diaCiclo: 24, fase: 'LUTEA', mensagem: 'Hoje é dia de ser gentil consigo. Se der, caminha 20 min. Se não der, tá tudo bem. Amanhã é outro dia.' },
  { diaCiclo: 25, fase: 'LUTEA', mensagem: 'Faltam poucos dias pra menstruação. O pior da TPM costuma ser agora. Se precisar de um chocolate, come. Sem drama.' },
  { diaCiclo: 26, fase: 'LUTEA', mensagem: 'Se tá difícil dormir, tenta deitar mais cedo e desligar tela 30 min antes. O sono melhora muito a TPM do dia seguinte.' },
  { diaCiclo: 27, fase: 'LUTEA', mensagem: 'Quase lá. Seu corpo tá se preparando pra recomeçar o ciclo. Tudo que você tá sentindo tem data pra passar.' },
  { diaCiclo: 28, fase: 'LUTEA', mensagem: 'Último dia do ciclo. Amanhã recomeça — e com ele, a energia volta. Você passou por mais um mês inteiro. Isso merece respeito.' }
];

export const NOTAS_SEM_CICLO: NotaSemCiclo[] = [
  { contexto: 'generica', mensagem: 'Bom dia! Registra como você tá se sentindo hoje — leva 30 segundos e ajuda a entender seus padrões.' },
  { contexto: 'inchaco', mensagem: 'Se você tá se sentindo inchada, não é culpa sua. Seu corpo retém líquido por vários motivos. Água e caminhada ajudam mais do que cortar comida.' },
  { contexto: 'fome', mensagem: 'Fome intensa não é falta de controle. Seu corpo tá pedindo algo. Atende com proteína e um lanche planejado — sem culpa.' },
  { contexto: 'sono', mensagem: 'Noite ruim? Hoje vai com calma. Evita cafeína da tarde em diante e tenta compensar com uma caminhada leve. Não se cobre demais.' },
  { contexto: 'humor', mensagem: 'Se tá tudo pesado hoje, tá tudo bem sentir isso. Não precisa resolver nada agora. 5 minutos de respiração já muda o dia.' },
  { contexto: 'dia_bom', mensagem: 'Dia bom, hein? Aproveita essa energia. Seu corpo tá te dizendo que algo tá funcionando — continua assim.' }
];
