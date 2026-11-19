// Artigos iniciais da biblioteca. RASCUNHO: precisam de revisao de uma profissional de saude antes da publicacao oficial.
// Carga no banco: src/scripts/seed-conteudo.ts (atualiza pelo slug, pode rodar varias vezes).
// Formato do texto: "## " para subtitulo, "- " para item de lista, **negrito**. Paragrafos separados por linha em branco.

export type Fase = 'MENSTRUAL' | 'FOLICULAR' | 'OVULATORIA' | 'LUTEA';

export interface Artigo {
  slug: string;
  categoria: string;
  titulo: string;
  descricao: string;
  tempoLeituraMin: number;
  fases: Fase[];
  premium: boolean;
  tags: string[];
  texto: string;
}

const TODAS: Fase[] = ['MENSTRUAL', 'FOLICULAR', 'OVULATORIA', 'LUTEA'];

export const ARTIGOS: Artigo[] = [
  {
    slug: 'as-fases-do-ciclo',
    categoria: 'Ciclo',
    titulo: 'As fases do ciclo menstrual',
    descricao: 'O que acontece no corpo do primeiro dia da menstruação até a próxima.',
    tempoLeituraMin: 4,
    fases: TODAS,
    premium: false,
    tags: ['ciclo', 'hormonios'],
    texto: `O ciclo começa no primeiro dia da menstruação e termina na véspera da menstruação seguinte. Em média dura 28 dias, mas qualquer duração entre 21 e 35 dias é considerada comum em adultas.

## Menstruação

O revestimento do útero, que se preparou para uma possível gravidez, descama e sai junto com o sangue. Estrogênio e progesterona estão nos níveis mais baixos do ciclo. Costuma durar de 3 a 7 dias.

## Fase folicular

Começa junto com a menstruação e vai até a ovulação. O estrogênio sobe aos poucos enquanto os ovários amadurecem um folículo. Muitas mulheres percebem mais disposição na segunda metade dessa fase.

## Ovulação

Um pico do hormônio LH faz o ovário liberar o óvulo. Isso acontece, em geral, cerca de 14 dias antes da próxima menstruação. O óvulo sobrevive de 12 a 24 horas, e os espermatozoides podem sobreviver até 5 dias no corpo. Por isso a janela fértil soma alguns dias antes da ovulação.

## Fase lútea

Depois da ovulação, a progesterona passa a ser o hormônio principal. Se não houver gravidez, os dois hormônios caem no fim da fase e a menstruação recomeça. É nesse período que aparecem os sintomas de TPM em quem tem.

## Por que o app fala em tendência

As datas que o CicloLeve mostra são estimativas feitas a partir da duração do seu ciclo. Estresse, viagens, doenças e mudanças de rotina podem adiantar ou atrasar a ovulação. Quanto mais ciclos você registra, mais perto da sua realidade ficam as previsões.`,
  },
  {
    slug: 'colica-menstrual',
    categoria: 'Sintomas',
    titulo: 'Cólica menstrual: o que ajuda',
    descricao: 'Medidas simples para aliviar a dor e os sinais de que vale procurar um médico.',
    tempoLeituraMin: 3,
    fases: ['MENSTRUAL'],
    premium: false,
    tags: ['colica', 'dor', 'menstruacao'],
    texto: `A cólica vem das contrações do útero para expulsar o revestimento. Substâncias chamadas prostaglandinas aumentam essas contrações, e quem produz mais delas costuma sentir mais dor.

## O que costuma aliviar

- Calor na parte de baixo da barriga, com bolsa térmica ou banho morno.
- Movimento leve, como caminhada ou alongamento. Ajuda a circulação na região.
- Beber água ao longo do dia.
- Analgésicos e anti-inflamatórios vendidos sem receita, quando você já usou antes sem problema. Siga a dose da bula e, se tiver dúvida, pergunte ao farmacêutico.

## Quando procurar um médico

- A dor impede você de trabalhar, estudar ou sair de casa.
- Os remédios comuns não fazem efeito.
- A cólica ficou muito mais forte do que era nos ciclos anteriores.
- Há dor na relação sexual, ao urinar ou ao evacuar durante a menstruação.

Esses sinais podem indicar condições como endometriose ou miomas, que têm tratamento. Dor forte todo mês não precisa ser aceita como normal.`,
  },
  {
    slug: 'inchaco-antes-da-menstruacao',
    categoria: 'Sintomas',
    titulo: 'Inchaço antes da menstruação',
    descricao: 'Por que o corpo retém mais líquido na fase lútea e o que fazer no dia a dia.',
    tempoLeituraMin: 3,
    fases: ['LUTEA', 'MENSTRUAL'],
    premium: false,
    tags: ['inchaco', 'retencao', 'tpm'],
    texto: `Na fase lútea, a variação de estrogênio e progesterona faz o corpo reter mais água e sódio. A sensação de barriga estufada e o peso um pouco mais alto na balança costumam aparecer nos dias antes da menstruação e passam nos primeiros dias de sangramento.

## No dia a dia

- Beba água normalmente. Cortar líquido não diminui a retenção.
- Diminua alimentos ultraprocessados e embutidos, que concentram muito sódio.
- Inclua alimentos com potássio, como banana, feijão, abacate e folhas verdes.
- Caminhar ou fazer outra atividade leve ajuda o retorno do líquido das pernas.

## Sobre a balança

Uma variação de 1 a 2 kg nessa fase é comum e vem de líquido. Se você acompanha o peso, compare sempre o mesmo momento do ciclo, mês a mês, para ter uma leitura mais fiel.

Se o inchaço vier com falta de ar, inchaço só em uma perna ou dor forte, procure atendimento. Esses sinais não fazem parte da TPM.`,
  },
  {
    slug: 'quando-procurar-o-ginecologista',
    categoria: 'Saúde',
    titulo: 'Quando procurar o ginecologista',
    descricao: 'Mudanças no ciclo que merecem uma consulta, mesmo sem dor.',
    tempoLeituraMin: 3,
    fases: TODAS,
    premium: false,
    tags: ['saude', 'consulta'],
    texto: `A consulta de rotina é recomendada uma vez por ano. Além dela, algumas mudanças no ciclo pedem uma avaliação antes.

## Sinais para marcar consulta

- Ciclos com menos de 21 ou mais de 35 dias de forma repetida.
- Três meses ou mais sem menstruar, sem gravidez e sem uso de anticoncepcional que explique.
- Sangramento que dura mais de 7 dias ou que encharca um absorvente em menos de 2 horas.
- Sangramento entre as menstruações ou depois da relação sexual.
- Cólica que piorou muito ou que não melhora com remédios comuns.
- Sintomas de TPM que atrapalham o trabalho ou as relações.

## Vá ao pronto atendimento se tiver

Dor abdominal muito forte e repentina, sangramento intenso com tontura ou desmaio, ou febre junto com dor na pelve.

## Leve seus registros

O relatório do CicloLeve reúne datas dos ciclos e sintomas registrados. Mostrar isso na consulta ajuda o médico a entender o seu padrão sem depender da memória.`,
  },
  {
    slug: 'alimentacao-na-fase-lutea',
    categoria: 'Alimentação',
    titulo: 'Alimentação na fase lútea',
    descricao: 'Fome maior antes da menstruação tem explicação. Veja como lidar com ela.',
    tempoLeituraMin: 4,
    fases: ['LUTEA'],
    premium: true,
    tags: ['alimentacao', 'fome', 'tpm'],
    texto: `Na fase lútea o corpo gasta um pouco mais de energia, e estudos mostram aumento de apetite em muitas mulheres nesse período. A vontade de doce também cresce em parte delas. Sentir mais fome nesses dias faz parte do ciclo.

## Refeições que seguram a fome

Combinar proteína, fibra e um pouco de gordura em cada refeição faz a saciedade durar mais. Alguns exemplos:

- Ovos com pão integral e fruta no café da manhã.
- Arroz, feijão, uma carne ou ovo e salada no almoço.
- Iogurte natural com aveia ou castanhas no lanche.

## Quando bater vontade de doce

Comer o doce depois de uma refeição, e não de estômago vazio, tende a diminuir a vontade de repetir. Ter uma porção definida, como um quadrado de chocolate, ajuda mais do que proibir.

## Magnésio e cálcio

Há estudos ligando boa ingestão de cálcio e magnésio a menos sintomas de TPM. Boas fontes são leite e derivados, folhas verde-escuras, feijão, castanhas e sementes. Suplementos só com orientação profissional.

## Cafeína e álcool

Os dois podem piorar a irritabilidade e o sono nessa fase. Se você sente diferença, vale reduzir nos dias antes da menstruação.`,
  },
  {
    slug: 'exercicios-em-cada-fase',
    categoria: 'Movimento',
    titulo: 'Exercício físico em cada fase',
    descricao: 'Como ajustar o treino à disposição que muda ao longo do mês.',
    tempoLeituraMin: 4,
    fases: TODAS,
    premium: true,
    tags: ['exercicio', 'treino'],
    texto: `Você pode treinar em qualquer fase do ciclo. As pesquisas sobre desempenho por fase ainda são poucas e com resultados variados, então a melhor referência é como você se sente em cada dia. As sugestões abaixo servem como ponto de partida.

## Menstruação

Se houver cólica ou cansaço, prefira caminhada, alongamento, yoga ou um treino de força mais leve. Muitas mulheres treinam normalmente e até sentem alívio da cólica com o movimento.

## Fase folicular

Com o estrogênio subindo, a disposição costuma aumentar. É uma boa fase para treinos mais intensos, aumentar carga ou testar uma atividade nova.

## Ovulação

A energia costuma continuar alta. Aqueça bem antes de treinos com salto e mudança de direção, já que alguns estudos sugerem mais frouxidão nos ligamentos perto da ovulação.

## Fase lútea

A temperatura do corpo fica um pouco mais alta e o cansaço pode chegar antes. Hidrate mais, ajuste a intensidade se precisar e mantenha a regularidade. Nos últimos dias, atividades mais calmas ajudam no humor e no sono.

## Registre

Anotar no app como foi o treino e como você se sentiu ajuda a descobrir o seu próprio padrão ao longo de alguns meses.`,
  },
  {
    slug: 'sono-e-ciclo',
    categoria: 'Sono',
    titulo: 'Sono e ciclo menstrual',
    descricao: 'Por que algumas noites antes da menstruação são piores e o que pode ajudar.',
    tempoLeituraMin: 3,
    fases: ['LUTEA', 'MENSTRUAL'],
    premium: true,
    tags: ['sono', 'insonia'],
    texto: `A progesterona aumenta um pouco a temperatura do corpo na fase lútea. No fim dessa fase, a queda dos hormônios coincide, em muitas mulheres, com sono mais leve, despertares durante a noite e mais sonolência de dia. Cólica e calor na menstruação também atrapalham.

## O que ajuda

- Manter horários parecidos para deitar e levantar, inclusive no fim de semana.
- Deixar o quarto fresco e escuro. Na fase lútea, um ambiente mais frio faz diferença.
- Evitar café e outros estimulantes depois do meio da tarde.
- Jantar mais cedo e mais leve.
- Diminuir a tela de celular na última hora antes de dormir.

## Se a insônia for frequente

Dormir mal só em alguns dias do ciclo é comum. Se a dificuldade aparece quase todas as noites ou afeta o seu dia, converse com um médico. Registrar o sono no app mostra se existe relação com a fase do ciclo.`,
  },
  {
    slug: 'tpm-e-humor',
    categoria: 'Sintomas',
    titulo: 'TPM, humor e irritação',
    descricao: 'Como diferenciar a TPM comum de um quadro que precisa de tratamento.',
    tempoLeituraMin: 4,
    fases: ['LUTEA'],
    premium: true,
    tags: ['tpm', 'humor', 'irritacao'],
    texto: `A TPM é o conjunto de sintomas físicos e emocionais que aparecem na fase lútea e melhoram nos primeiros dias da menstruação. Irritação, choro fácil, ansiedade, inchaço e sensibilidade nos seios estão entre os mais comuns.

A causa mais aceita é uma sensibilidade maior do cérebro às variações hormonais normais. Os níveis de hormônio costumam estar dentro do esperado.

## O que costuma ajudar

- Atividade física regular ao longo do mês, e não só nos dias de sintoma.
- Sono em horário regular.
- Menos álcool e cafeína na fase lútea.
- Planejar a semana sabendo quais dias tendem a ser mais difíceis. O calendário do app ajuda nisso.

## TPDM

Em uma parte das mulheres, os sintomas são intensos a ponto de prejudicar trabalho, estudos e relações. Esse quadro se chama transtorno disfórico pré-menstrual (TPDM) e tem tratamento com acompanhamento médico.

Procure ajuda se o humor muda muito nesses dias, se há pensamentos de se machucar ou se a TPM está afetando a sua vida. Em caso de crise, o CVV atende de graça pelo telefone 188, a qualquer hora.`,
  },
  {
    slug: 'janela-fertil',
    categoria: 'Fertilidade',
    titulo: 'Janela fértil e ovulação',
    descricao: 'Quais dias têm mais chance de gravidez e quais sinais o corpo dá.',
    tempoLeituraMin: 4,
    fases: ['FOLICULAR', 'OVULATORIA'],
    premium: true,
    tags: ['fertilidade', 'ovulacao', 'engravidar'],
    texto: `A janela fértil reúne os 5 dias antes da ovulação e o próprio dia da ovulação. A chance de gravidez é maior nos 2 dias anteriores à ovulação e no dia dela.

## Sinais do corpo

- **Muco cervical**: fica transparente, elástico e parecido com clara de ovo perto da ovulação.
- **Temperatura basal**: sobe cerca de 0,3 °C depois da ovulação. Medida todo dia ao acordar, confirma que a ovulação já aconteceu.
- **Testes de ovulação**: detectam o pico de LH na urina, que acontece de 24 a 36 horas antes da ovulação.
- Algumas mulheres sentem uma dor leve de um lado da barriga.

## Para quem quer engravidar

Relações a cada 1 ou 2 dias durante a janela fértil cobrem bem o período. Para casais abaixo de 35 anos, é comum levar até 12 meses. Acima de 35, procure avaliação depois de 6 meses tentando.

## Para quem quer evitar

Contar os dias do ciclo, sozinho, falha com frequência, porque a ovulação pode mudar de data de um mês para outro. O calendário do app não deve ser usado como método anticoncepcional. Converse com seu médico sobre um método adequado para você.`,
  },
  {
    slug: 'teste-de-gravidez',
    categoria: 'Fertilidade',
    titulo: 'Teste de gravidez: quando fazer',
    descricao: 'O momento certo para o teste de farmácia e como ler o resultado.',
    tempoLeituraMin: 3,
    fases: ['LUTEA', 'MENSTRUAL'],
    premium: true,
    tags: ['gravidez', 'teste'],
    texto: `Os testes de farmácia detectam o hormônio hCG na urina. Ele só começa a ser produzido depois que o embrião se implanta no útero, o que acontece de 6 a 12 dias após a ovulação.

## Quando fazer

O resultado é mais confiável a partir do primeiro dia de atraso da menstruação. Testes feitos antes podem dar negativo mesmo com gravidez, porque o hCG ainda está baixo.

## Como fazer

- Use a primeira urina da manhã, que é mais concentrada.
- Siga o tempo de leitura da embalagem. Linhas que aparecem muito depois desse tempo não contam.
- Confira a validade do teste.

## Lendo o resultado

Uma segunda linha, mesmo fraca, costuma indicar resultado positivo. Se der negativo e a menstruação não vier, repita em 3 a 5 dias. O exame de sangue (beta hCG) é mais sensível e confirma o resultado.

Marque uma consulta assim que tiver um positivo, para começar o pré-natal. Se o teste for positivo e houver dor forte de um lado da barriga ou sangramento, procure atendimento logo.`,
  },
];
