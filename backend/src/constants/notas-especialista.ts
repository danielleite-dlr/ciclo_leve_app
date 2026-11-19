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
  { diaCiclo: 1, fase: 'MENSTRUAL', mensagem: 'Primeiro dia da menstruação. Se der para fazer só uma coisa hoje, descanse. O resto pode esperar.' },
  { diaCiclo: 2, fase: 'MENSTRUAL', mensagem: 'Acordar sem energia hoje é comum: estrogênio e progesterona estão no ponto mais baixo do mês. Vá com calma.' },
  { diaCiclo: 3, fase: 'MENSTRUAL', mensagem: 'Para muitas mulheres, o terceiro dia é o mais pesado. Se der para fazer só uma coisa, beba água ao longo do dia.' },
  { diaCiclo: 4, fase: 'MENSTRUAL', mensagem: 'A fase mais difícil está terminando. Se bater fome emocional, coma algo que nutra e conforte, sem se julgar.' },
  { diaCiclo: 5, fase: 'MENSTRUAL', mensagem: 'Para a maioria, é o último dia de menstruação. A energia costuma voltar aos poucos a partir de amanhã.' },

  // FOLICULAR (Dias 6-12)
  { diaCiclo: 6, fase: 'FOLICULAR', mensagem: 'Começa a fase folicular. Com o estrogênio subindo, muitas mulheres sentem mais disposição. Se for seu caso, use para organizar a semana.' },
  { diaCiclo: 7, fase: 'FOLICULAR', mensagem: 'Hoje pode ser um bom dia para começar algo novo, como um treino, uma receita ou um plano. Nessa fase o foco costuma estar melhor.' },
  { diaCiclo: 8, fase: 'FOLICULAR', mensagem: 'Se bater vontade de comer bem e treinar, os hormônios dessa fase costumam ajudar. Aproveite enquanto durar.' },
  { diaCiclo: 9, fase: 'FOLICULAR', mensagem: 'Metade da fase folicular. Se estiver se sentindo produtiva, use isso a seu favor sem se cobrar demais.' },
  { diaCiclo: 10, fase: 'FOLICULAR', mensagem: 'Nessa fase o corpo costuma responder bem a treino e alimentação. Se a energia estiver boa, aproveite.' },
  { diaCiclo: 11, fase: 'FOLICULAR', mensagem: 'A ovulação começa em um ou dois dias. Se quiser marcar algo social ou desafiador, esses dias costumam ser bons.' },
  { diaCiclo: 12, fase: 'FOLICULAR', mensagem: 'Último dia antes do pico de estrogênio. Muitas mulheres se sentem bem agora. Se não for seu caso hoje, tudo bem, cada ciclo é diferente.' },

  // OVULATÓRIA (Dias 13-16)
  { diaCiclo: 13, fase: 'OVULATORIA', mensagem: 'Pico de estrogênio. Se sentir vontade de socializar, treinar mais forte ou resolver pendências, vá em frente. Se não, respeite seu ritmo.' },
  { diaCiclo: 14, fase: 'OVULATORIA', mensagem: 'Para muitas mulheres, hoje é um dia de mais disposição. Se for seu caso, aproveite para fazer algo que você vem adiando.' },
  { diaCiclo: 15, fase: 'OVULATORIA', mensagem: 'Algumas mulheres incham um pouco na ovulação. Esse inchaço vem da retenção de líquido e costuma melhorar com água e fibras.' },
  { diaCiclo: 16, fase: 'OVULATORIA', mensagem: 'Último dia de pico. A partir de amanhã a progesterona sobe e o ritmo tende a mudar. Isso faz parte do ciclo.' },

  // LÚTEA / TPM (Dias 17-28)
  { diaCiclo: 17, fase: 'LUTEA', mensagem: 'A progesterona começou a subir e o ritmo pode desacelerar. Ajuste a rotina em vez de forçar.' },
  { diaCiclo: 18, fase: 'LUTEA', mensagem: 'Mais fome hoje é comum nessa fase, porque o corpo gasta mais energia. Planeje um lanche que você goste.' },
  { diaCiclo: 19, fase: 'LUTEA', mensagem: 'O corpo retém mais líquido nessa fase. Se a balança subir um pouco, é retenção e costuma passar com a menstruação.' },
  { diaCiclo: 20, fase: 'LUTEA', mensagem: 'Metade da fase lútea. A progesterona alta pode deixar você mais irritada. Respire fundo e deixe o que puder para outro dia.' },
  { diaCiclo: 21, fase: 'LUTEA', mensagem: 'Se o treino estiver mais difícil, diminua a intensidade sem culpa. Caminhada, alongamento e descanso também contam.' },
  { diaCiclo: 22, fase: 'LUTEA', mensagem: 'Vontade de carboidrato é comum agora, porque o metabolismo está mais acelerado. Prefira carboidratos com fibra, como frutas, aveia e pães integrais.' },
  { diaCiclo: 23, fase: 'LUTEA', mensagem: 'Inchaço e irritação são comuns nessa parte do ciclo, que costuma ser a mais desafiadora. Você não está fazendo nada de errado.' },
  { diaCiclo: 24, fase: 'LUTEA', mensagem: 'Se der, caminhe 20 minutos hoje. Se não der, tudo bem.' },
  { diaCiclo: 25, fase: 'LUTEA', mensagem: 'Faltam poucos dias para a menstruação, e os sintomas de TPM costumam ser mais fortes agora. Se quiser um pedaço de chocolate, coma sem culpa.' },
  { diaCiclo: 26, fase: 'LUTEA', mensagem: 'Se estiver difícil dormir, deite mais cedo e desligue as telas 30 minutos antes. Dormir bem alivia a TPM do dia seguinte.' },
  { diaCiclo: 27, fase: 'LUTEA', mensagem: 'O corpo está se preparando para um novo ciclo. Os sintomas dessa fase costumam passar quando a menstruação começa.' },
  { diaCiclo: 28, fase: 'LUTEA', mensagem: 'Último dia do ciclo. Com a menstruação, um novo ciclo começa e a energia tende a voltar nos dias seguintes.' }
];

export const NOTAS_SEM_CICLO: NotaSemCiclo[] = [
  { contexto: 'generica', mensagem: 'Registre como você está se sentindo hoje. Leva 30 segundos e ajuda a entender seus padrões.' },
  { contexto: 'inchaco', mensagem: 'O corpo retém líquido por vários motivos e isso não é culpa sua. Água e caminhada ajudam mais do que cortar comida.' },
  { contexto: 'fome', mensagem: 'Fome intensa costuma ser sinal de que o corpo precisa de energia. Inclua proteína e um lanche planejado, sem culpa.' },
  { contexto: 'sono', mensagem: 'Depois de uma noite ruim, vá com calma. Evite cafeína à tarde e, se puder, faça uma caminhada leve.' },
  { contexto: 'humor', mensagem: 'Se o dia está pesado, você não precisa resolver tudo agora. Cinco minutos de respiração já ajudam.' },
  { contexto: 'dia_bom', mensagem: 'Seus registros mostram um dia tranquilo. Aproveite a energia de hoje.' }
];
