// Banco de textos da Home, por fase do ciclo. O app sorteia um item de cada lista por dia
// (ver services/conteudo-diario.service.ts), entao a mesma fase aparece de um jeito diferente a cada dia.
//
// Regras de escrita:
// - tom acolhedor, "costuma", "muitas mulheres": a fase e tendencia, nao regra;
// - treino intenso sempre com "(se já treina)";
// - nada de promessa medica; dicas simples, que cabem num dia comum;
// - comida com "proteína", "fibra" ou "vegetais", movimento com "caminhada", "treino" ou "exercício"
//   e sono com "sono" ou "dormir" quando couber: o app escolhe o icone por essas palavras.

export type Fase = 'MENSTRUAL' | 'FOLICULAR' | 'OVULATORIA' | 'LUTEA';

export type Momento = {
  titulos: string[];
  descricoes: string[];
};

export type ConteudoFase = {
  emoji: string;
  /** momentos da fase, do inicio ao fim (o service decide qual vale hoje) */
  momentos: Record<string, Momento>;
  comida: string[];
  movimento: string[];
  descanso: string[];
  evite: string[];
};

export const CONTEUDO_POR_FASE: Record<Fase, ConteudoFase> = {
  MENSTRUAL: {
    emoji: '🔋',
    momentos: {
      // dias 1 e 2
      inicio: {
        titulos: ['Recarregue as Energias', 'Dia de Ir com Calma', 'Seu Corpo Pede Pausa'],
        descricoes: [
          'A energia costuma cair e a fome emocional pode aumentar.',
          'Estrogênio e progesterona estão no ponto mais baixo: cansaço e cólica são comuns.',
          'Hoje vale fazer menos e descansar mais, sem culpa.',
        ],
      },
      // do dia 3 ao fim do sangramento
      fim: {
        titulos: ['Energia Voltando aos Poucos', 'Um Passo de Cada Vez', 'Recomeço Tranquilo'],
        descricoes: [
          'O sangramento costuma diminuir e a disposição volta aos poucos.',
          'O estrogênio começa a subir de novo nos próximos dias.',
          'Se ainda estiver cansada, tudo bem: cada ciclo tem o seu ritmo.',
        ],
      },
    },
    comida: [
      'Proteína no café: ovos mexidos ou iogurte natural',
      'Feijão ou lentilha no almoço (repõem ferro)',
      'Vegetais verde-escuros, como couve e espinafre',
      'Fruta com vitamina C junto da refeição (ajuda a absorver ferro)',
      'Sopa de legumes com frango: proteína e conforto',
      'Castanhas ou sementes de abóbora no lanche',
      'Sardinha ou atum: proteína com ômega-3',
      'Carne vermelha magra, se você come carne (proteína e ferro)',
    ],
    movimento: [
      'Caminhada leve de 20 min',
      'Alongamento de 10 min para a lombar',
      'Exercício de respiração deitada, 5 min',
      'Caminhada curta depois do almoço',
      'Yoga suave: postura da criança por 5 min',
      'Exercício leve de mobilidade, se tiver disposição',
      'Dançar uma música que você goste, sem pressa',
    ],
    descanso: [
      'Bolsa de água morna na barriga para a cólica',
      'Sono: deitar 30 min mais cedo',
      'Banho morno antes de dormir',
      'Chá de camomila ou gengibre à noite',
      '2 L de água ao longo do dia',
      'Cochilo de até 20 min, se der',
      'Telas desligadas 30 min antes de dormir',
    ],
    evite: [
      'Treino pesado se estiver exausta',
      'Muito açúcar à noite',
      'Excesso de café (pode piorar a cólica)',
      'Pular refeições',
      'Se cobrar produtividade máxima',
      'Álcool (piora inchaço e sono)',
      'Muito sal e ultraprocessados',
    ],
  },

  FOLICULAR: {
    emoji: '⚡',
    momentos: {
      unico: {
        titulos: ['Energia em Alta', 'Hora de Começar', 'Disposição Voltando', 'Bom Momento para Planejar'],
        descricoes: [
          'Energia e disposição costumam subir.',
          'Com o estrogênio subindo, foco e humor tendem a melhorar.',
          'Uma boa fase para começar hábitos novos.',
          'O corpo costuma responder bem a treino e boa alimentação agora.',
        ],
      },
    },
    comida: [
      'Frango grelhado com salada colorida (proteína + vegetais)',
      'Ovos com legumes no café: proteína para a manhã toda',
      'Peixe assado com legumes no jantar',
      'Tofu ou grão-de-bico como proteína do dia',
      'Iogurte natural com aveia e fruta (proteína + fibra)',
      'Vegetais em metade do prato no almoço',
      'Arroz integral ou quinoa: mais fibra no prato',
      'Planeje as refeições da semana (10 min)',
    ],
    movimento: [
      'Treino de força (se já treina)',
      'HIIT curto de 15 min (se já treina)',
      'Caminhada rápida ou corrida leve de 30 min',
      'Bicicleta ou spinning por 30 min',
      'Experimente um exercício novo: dança, funcional ou natação',
      'Subir escadas em vez de elevador hoje',
      'Treino de pernas e glúteos (se já treina)',
    ],
    descanso: [
      'Sono: manter o mesmo horário de dormir',
      'Sol por 10 min de manhã (ajuda a dormir à noite)',
      '2 L de água ao longo do dia',
      'Anote 3 metas para a semana',
      'Café só até as 14h para dormir bem',
      'Quarto escuro e fresco na hora de dormir',
      'Pausa de 5 min a cada 1 h sentada',
    ],
    evite: [
      'Pular refeição (gera compulsão depois)',
      '"Dieta 8 ou 80"',
      'Começar tudo de uma vez',
      'Treinar em jejum sem estar acostumada',
      'Dormir tarde só porque está com energia',
      'Comparar seu ritmo com o de outras pessoas',
    ],
  },

  OVULATORIA: {
    emoji: '✨',
    momentos: {
      // do inicio da janela fertil ate 2 dias antes da ovulacao
      inicio: {
        titulos: ['Energia Subindo', 'Janela Fértil', 'Fase de Brilho'],
        descricoes: [
          'O estrogênio está subindo e a energia costuma acompanhar.',
          'Muitas mulheres sentem mais disposição e vontade de socializar.',
          'O corpo está se preparando para a ovulação.',
        ],
      },
      // vespera e dia provavel da ovulacao
      pico: {
        titulos: ['Auge da Confiança', 'Dia de Pico', 'Energia no Máximo'],
        descricoes: [
          'Muitas sentem pico de energia; algumas incham.',
          'Ovulação provável por agora: libido e confiança costumam subir.',
          'Pico de estrogênio. Se a energia estiver alta, aproveite.',
        ],
      },
      // dia seguinte a ovulacao
      fim: {
        titulos: ['Virada do Ciclo', 'Mudança de Ritmo'],
        descricoes: [
          'A ovulação passou e a progesterona começa a subir.',
          'O ritmo tende a mudar nos próximos dias. Isso faz parte do ciclo.',
        ],
      },
    },
    comida: [
      'Fibra no café: fruta com aveia',
      'Salmão, sardinha ou atum: proteína com ômega-3',
      'Ovos ou frango com bastante salada (proteína + vegetais)',
      'Feijão, lentilha ou grão-de-bico como proteína',
      'Vegetais como brócolis, couve-flor ou repolho',
      'Frutas vermelhas no lanche (fibra e antioxidantes)',
      'Iogurte natural ou kefir no lanche (proteína)',
      'Água + sal controlado (menos inchaço)',
    ],
    movimento: [
      'Treino de força (melhor fase pra evoluir, se já treina)',
      'Treino intervalado curto (se já treina)',
      'Caminhada rápida ou corrida de 30–40 min',
      'Aula em grupo: dança, funcional ou spinning',
      'Natação ou hidroginástica',
      'Treino de corpo inteiro (se já treina)',
      'Caminhada ao ar livre com alguém',
    ],
    descanso: [
      '2 L de água ao longo do dia',
      'Sono: 7–8 horas mesmo com energia sobrando',
      'Alongamento de 10 min depois do exercício',
      'Marque um encontro ou uma conversa importante',
      'Pausa ao ar livre (com protetor solar)',
      'Telas desligadas 30 min antes de dormir',
      'Chá de hibisco no fim da tarde (pode ajudar na retenção)',
    ],
    evite: [
      'Ultraprocessado (retém líquido)',
      'Exagerar no álcool (piora sono e fome)',
      'Excesso de sal',
      'Assumir compromissos demais',
      'Treinar sem beber água',
      'Pular o aquecimento antes do treino',
    ],
  },

  LUTEA: {
    emoji: '🌙',
    momentos: {
      // 10 a 13 dias para a menstruacao
      inicio: {
        titulos: ['Ritmo Mais Calmo', 'Fase de Cuidado', 'Hora de Desacelerar'],
        descricoes: [
          'A progesterona sobe e o corpo pede um ritmo mais tranquilo.',
          'Mais fome e mais sono são comuns nos próximos dias.',
          'Bom momento para manter a rotina, sem forçar.',
        ],
      },
      // 5 a 9 dias para a menstruacao
      meio: {
        titulos: ['Hora de Desacelerar', 'Constância, Não Intensidade', 'Cuide de Você'],
        descricoes: [
          'Podem aparecer retenção, irritação e mais fome.',
          'O metabolismo acelera um pouco e a fome costuma aumentar.',
          'Se a paciência estiver curta, é a progesterona agindo. Vá com calma.',
        ],
      },
      // ultimos 4 dias antes da menstruacao
      fim: {
        titulos: ['Reta Final do Ciclo', 'Modo Acolhimento', 'Quase Recomeçando'],
        descricoes: [
          'A menstruação está chegando e a TPM pode estar mais forte.',
          'Inchaço, irritação e vontade de doce são comuns agora.',
          'O corpo se prepara para um novo ciclo. Gentileza com você hoje.',
        ],
      },
    },
    comida: [
      'Aumente proteína e fibra',
      'Batata-doce com frango: proteína e saciedade',
      'Ovos cozidos ou queijo branco no lanche (proteína)',
      'Banana com pasta de amendoim no lanche',
      'Aveia com cacau no café (fibra e menos vontade de doce)',
      'Peixe ou carne magra com vegetais no jantar',
      'Um pedaço de chocolate 70%, sem culpa',
      'Feijão, lentilha ou grão-de-bico (proteína, fibra e magnésio)',
      'Castanhas ou sementes de abóbora (magnésio)',
    ],
    movimento: [
      'Caminhada 20–30 min (reduz ansiedade)',
      'Yoga ou alongamento de 15 min',
      'Exercício leve de mobilidade ou pilates',
      'Treino de força com carga moderada (se já treina)',
      'Caminhada ao ar livre, sem pressa',
      'Natação ou hidroginástica leve',
      'Bicicleta leve por 20 min',
    ],
    descanso: [
      'Sono: deitar 30 min mais cedo',
      'Banho morno à noite para relaxar',
      'Chá de camomila ou melissa antes de dormir',
      'Respiração 4-6 por 3 min quando bater irritação',
      'Escreva por 5 min o que está sentindo',
      'Dormir com o celular longe da cama',
      'Diminua a cafeína depois do almoço',
      'Reserve 15 min só para você hoje',
    ],
    evite: [
      'Se culpar por fome (planeje lanche)',
      '"Compensar" com jejum (piora a TPM)',
      'Excesso de sal (aumenta o inchaço)',
      'Café depois das 14h',
      'Decisões importantes no impulso',
      'Subir na balança todo dia (é retenção)',
      'Álcool à noite (piora sono e humor)',
      'Treino exaustivo se estiver sem energia',
    ],
  },
};

// Nota da especialista, pela posicao dentro da fase real (vale para ciclos de qualquer tamanho).

/** Menstruacao: indice = dia do ciclo - 1. Depois do 5o dia, usa a ultima. */
export const NOTAS_MENSTRUAL = [
  'Primeiro dia da menstruação. Se der para fazer só uma coisa hoje, descanse. O resto pode esperar.',
  'Acordar sem energia hoje é comum: estrogênio e progesterona estão no ponto mais baixo do mês. Vá com calma.',
  'Para muitas mulheres, o terceiro dia é o mais pesado. Se der para fazer só uma coisa, beba água ao longo do dia.',
  'A fase mais difícil está terminando. Se bater fome emocional, coma algo que nutra e conforte, sem se julgar.',
  'O sangramento costuma estar no fim. A energia tende a voltar aos poucos nos próximos dias.',
  'Se a menstruação costuma passar de 7 dias ou vir muito intensa, vale conversar com sua ginecologista.',
];

/** Folicular: tamanho varia com o ciclo. A primeira abre a fase, a ultima fecha; o meio e distribuido. */
export const NOTAS_FOLICULAR = [
  'Começa a fase folicular. Com o estrogênio subindo, muitas mulheres sentem mais disposição. Se for seu caso, use para organizar a semana.',
  'Hoje pode ser um bom dia para começar algo novo, como um treino, uma receita ou um plano. Nessa fase o foco costuma estar melhor.',
  'Se bater vontade de comer bem e treinar, os hormônios dessa fase costumam ajudar. Aproveite enquanto durar.',
  'Se estiver se sentindo produtiva, use isso a seu favor sem se cobrar demais.',
  'Nessa fase o corpo costuma responder bem a treino e alimentação. Se a energia estiver boa, aproveite.',
  'Muitas mulheres se sentem bem agora. Se não for seu caso hoje, tudo bem: cada ciclo é diferente.',
  'A janela fértil começa em breve. Se quiser marcar algo social ou desafiador, os próximos dias costumam ser bons.',
];

/** Ovulatoria: indice 0 = 5 dias antes da ovulacao ... 5 = dia provavel da ovulacao, 6 = dia seguinte. */
export const NOTAS_OVULATORIA = [
  'A janela fértil começa hoje. Muitas mulheres sentem a energia subir nesses dias.',
  'O estrogênio continua subindo. Se estiver com disposição, é um bom dia para um treino mais forte.',
  'Se quiser marcar algo social ou resolver uma conversa difícil, esses dias costumam ser bons.',
  'Pico de estrogênio. Se sentir vontade de socializar, treinar mais forte ou resolver pendências, vá em frente. Se não, respeite seu ritmo.',
  'Algumas mulheres incham um pouco perto da ovulação. É retenção de líquido e costuma melhorar com água e fibra.',
  'Dia provável da ovulação. Algumas mulheres sentem uma dorzinha de um lado da barriga; é comum e passa rápido.',
  'Último dia da janela fértil. A partir de agora a progesterona sobe e o ritmo tende a mudar. Isso faz parte do ciclo.',
];

/** Lutea: indice = dias que faltam para a menstruacao - 1 (0 = vespera, 12 = primeiro dia da fase). */
export const NOTAS_LUTEA = [
  'A menstruação deve começar amanhã. Os sintomas dessa fase costumam aliviar quando ela chega.',
  'O corpo está se preparando para um novo ciclo. Deixe por perto o que te deixa confortável: absorvente, bolsa morna, um chá.',
  'Se estiver difícil dormir, deite mais cedo e desligue as telas 30 minutos antes. Dormir bem alivia a TPM do dia seguinte.',
  'Faltam poucos dias para a menstruação, e a TPM costuma ser mais forte agora. Se quiser um pedaço de chocolate, aproveite sem culpa.',
  'Se der, caminhe 20 minutos hoje. Se não der, tudo bem.',
  'Inchaço e irritação são comuns nessa parte do ciclo, que costuma ser a mais desafiadora. Você não está fazendo nada de errado.',
  'Vontade de carboidrato é comum agora, porque o metabolismo está mais acelerado. Prefira carboidratos com fibra, como frutas e aveia.',
  'Se o treino estiver mais difícil, diminua a intensidade sem culpa. Caminhada, alongamento e descanso também contam.',
  'A progesterona alta pode deixar você mais irritada. Respire fundo e deixe o que puder para outro dia.',
  'O corpo retém mais líquido nessa fase. Se a balança subir um pouco, é retenção e costuma passar com a menstruação.',
  'Mais fome hoje é comum nessa fase, porque o corpo gasta mais energia. Planeje um lanche que você goste.',
  'Mais sono do que o normal? A progesterona tem efeito calmante. Se puder, durma um pouco mais esta noite.',
  'Começa a fase lútea. A progesterona sobe e o ritmo pode desacelerar. Ajuste a rotina em vez de forçar.',
];
