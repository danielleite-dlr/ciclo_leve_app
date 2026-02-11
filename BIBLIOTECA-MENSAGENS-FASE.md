# CicloLeve — Biblioteca de Mensagens por Fase (MVP)

**Documento complementar à documentação técnica do projeto**
**Versão**: 1.1
**Data**: 11 de fevereiro de 2026

---

## 1. VISÃO GERAL

Este documento contém **todo o conteúdo textual** que o app exibe diariamente para a usuária, organizado por fase do ciclo e por gatilho de sintoma. Ele complementa a documentação existente (DOCUMENTACAO-COMPLETA, PRD-BACKEND, PRD-FRONTEND) que já define a estrutura de "3 blocos" — mas não trazia o conteúdo em si.

### Estrutura do Output Diário

Cada dia, a usuária recebe **4 blocos** na tela principal:

| Bloco | Formato | Exemplo |
|-------|---------|---------|
| **Hoje seu corpo tende a…** | 1 linha descritiva | "baixa energia + mais fome emocional" |
| **Faça isso hoje** | 3 ações práticas | Proteína no café, caminhada 20 min, 2L água |
| **Evite isso hoje** | 2 itens | Treino pesado, muito açúcar à noite |
| **Nota da Especialista** 💬 | 1 mensagem curta (tom de amiga) | "Dia 3 é o mais cansativo. Se só der pra fazer uma coisa, beba água." |

**Princípios do conteúdo:**
- Sem textão. Sem papo médico.
- Linguagem direta, empática e não-julgadora.
- Ações específicas e acionáveis (não genéricas).
- Nota da Especialista: tom de amiga próxima, sincero, acolhedor — um empurrãozinho no dia.

---

## 2. MENSAGENS POR FASE (Camada 1)

> Aplica-se ao **Modo Com Ciclo** (usuárias que menstruam).
> Sempre exibidas com base no dia do ciclo calculado.

---

### 2.1 FASE MENSTRUAL (Dias 1–5)

**Contexto hormonal**: Estrogênio e progesterona em baixa. Corpo em modo de recuperação.

**Hoje seu corpo tende a:**
> Baixa energia + mais fome emocional.

**Faça isso hoje (3 ações):**

| # | Ação |
|---|------|
| 1 | Priorize proteína no café da manhã |
| 2 | Caminhada leve 20 min |
| 3 | 2L de água (meta do dia) |

**Evite isso hoje (2 itens):**

| # | Item |
|---|------|
| 1 | Treino pesado se estiver exausta |
| 2 | Muito açúcar à noite |

---

### 2.2 FASE FOLICULAR (Dias 6–12)

**Contexto hormonal**: Estrogênio subindo progressivamente. Energia e foco em alta.

**Hoje seu corpo tende a:**
> Mais energia + mais disciplina.

**Faça isso hoje (3 ações):**

| # | Ação |
|---|------|
| 1 | Treino de força ou HIIT curto (se já treina) |
| 2 | Planeje refeições da semana (10 min) |
| 3 | Vegetais + proteína no almoço |

**Evite isso hoje (2 itens):**

| # | Item |
|---|------|
| 1 | Pular refeição (gera compulsão depois) |
| 2 | "Dieta 8 ou 80" |

---

### 2.3 FASE OVULATÓRIA (Dias 13–16)

**Contexto hormonal**: Pico de estrogênio. Ponto alto do ciclo em energia e sociabilidade.

**Hoje seu corpo tende a:**
> Pico de energia/social, mas algumas incham.

**Faça isso hoje (3 ações):**

| # | Ação |
|---|------|
| 1 | Treino de força (melhor fase pra evoluir) |
| 2 | Água + sal controlado |
| 3 | Fibra (fruta + aveia/legumes) |

**Evite isso hoje (2 itens):**

| # | Item |
|---|------|
| 1 | Ultraprocessado (retém líquido) |
| 2 | Exagerar álcool (piora sono e fome) |

---

### 2.4 FASE LÚTEA / TPM (Dias 17–28)

**Contexto hormonal**: Progesterona alta, depois queda brusca. Fase mais desafiadora do ciclo.

**Hoje seu corpo tende a:**
> Retenção + irritação + fome/carbo.

**Faça isso hoje (3 ações):**

| # | Ação |
|---|------|
| 1 | Aumente proteína e fibra |
| 2 | Caminhada 20–30 min (reduz ansiedade) |
| 3 | Sono: deitar 30 min mais cedo |

**Evite isso hoje (2 itens):**

| # | Item |
|---|------|
| 1 | Se culpar por fome (planeje lanche) |
| 2 | "Compensar" com jejum (piora TPM) |

---

## 3. DICAS EXTRAS POR SINTOMA — GATILHOS (Camada 2)

> Aplica-se aos **2 modos** (Com Ciclo e Sem Ciclo).
> Exibidas **adicionalmente** quando o sintoma do dia = nível 3 (intenso).

Estas dicas são complementares às mensagens de fase. No **Modo Sem Ciclo** (menopausa, ciclo irregular, anticoncepcional contínuo), são a **fonte principal** de recomendações.

---

### 3.1 Regras de Disparo

```
SE registro_diario.inchaco = 3
  ENTÃO exibir → Dica Extra de Inchaço

SE registro_diario.fome_compulsao = 3
  ENTÃO exibir → Dica Extra de Fome

SE registro_diario.qualidade_sono = 3
  ENTÃO exibir → Dica Extra de Sono

SE registro_diario.humor_irritacao = 3
  ENTÃO exibir → Dica Extra de Humor
```

> Múltiplos gatilhos podem disparar simultaneamente no mesmo dia.

---

### 3.2 Conteúdo dos Gatilhos

| Sintoma | Nível | Dica Extra |
|---------|-------|------------|
| **Inchaço** | 3 (intenso) | 💧 Hoje: água + caminhada + reduzir ultraprocessado e refrigerante. |
| **Fome / Compulsão** | 3 (intensa) | 🍎 Inclua 1 lanche planejado: iogurte/ovo/fruta + castanhas. |
| **Sono** | 3 (péssimo) | 🌙 Corte cafeína após 14h + banho morno + tela off 30 min antes. |
| **Humor / Irritação** | 3 (irritada) | 🧘‍♀️ Faça 5 min de respiração + caminhe 10 min. Não decida nada importante irritada. |

---

## 4. NOTA DA ESPECIALISTA — MENSAGEM DO DIA (Camada 3)

> Uma mensagem por dia do ciclo. Tom de amiga próxima: sincero, acolhedor, direto.
> Sem julgamento, sem pressão. Um empurrãozinho com carinho.
> Aplica-se ao **Modo Com Ciclo**. Para Modo Sem Ciclo, ver seção 4.5.

### Princípios de tom

- Fala como amiga que entende, não como médica que prescreve.
- Valida o que a usuária sente ("é normal", "seu corpo está certo").
- Nunca culpa ("você exagerou"), sempre acolhe ("tá tudo bem").
- Curta: 1-2 frases no máximo.
- Pode usar humor leve quando cabe.

---

### 4.1 FASE MENSTRUAL (Dias 1–5)

| Dia | 💬 Nota da Especialista |
|-----|------------------------|
| 1 | Primeiro dia. Seu corpo está se renovando. Se só der pra fazer uma coisa hoje, descanse. O resto pode esperar. |
| 2 | Se você acordou sem energia, tá certo. Não é preguiça — seus hormônios estão no ponto mais baixo do mês. Vai com calma. |
| 3 | Dia 3 costuma ser o mais pesado. Se só der pra fazer uma coisa, beba água. Sério, já é uma vitória. |
| 4 | Você tá quase saindo da fase mais difícil. Se bateu uma fome emocional, não se julgue. Coma algo que nutra e conforte. |
| 5 | Último dia de menstruação pra maioria. Já consegue sentir a energia voltando aos poucos? Amanhã tende a ser melhor. |

---

### 4.2 FASE FOLICULAR (Dias 6–12)

| Dia | 💬 Nota da Especialista |
|-----|------------------------|
| 6 | Bem-vinda à sua melhor fase. O estrogênio tá subindo e você vai sentir. Aproveita esse gás pra organizar a semana. |
| 7 | Hoje é um ótimo dia pra começar algo novo — um treino, uma receita, um plano. Seu cérebro tá afiado. |
| 8 | Se você tem vontade de comer bem e treinar, não é força de vontade: é hormônio ajudando. Surfa essa onda. |
| 9 | Metade da fase folicular. Se tá se sentindo produtiva, é real. Use isso a seu favor sem se cobrar demais. |
| 10 | Seu corpo tá respondendo bem a treino e alimentação agora. Qualquer esforço nessa fase rende mais. |
| 11 | Amanhã ou depois começa a ovulação. Se quiser planejar algo social ou desafiador, agenda pra esses dias. |
| 12 | Último dia antes do pico. Você provavelmente tá se sentindo bem — e isso não é ilusão. É biologia a seu favor. |

---

### 4.3 FASE OVULATÓRIA (Dias 13–16)

| Dia | 💬 Nota da Especialista |
|-----|------------------------|
| 13 | Pico de estrogênio. Você tá no auge do mês. Se sentir vontade de socializar, treinar forte ou resolver pendências — vai. |
| 14 | Hoje seu corpo tá no modo "eu consigo". Aproveita pra fazer aquilo que você adia. Amanhã pode não ter o mesmo gás. |
| 15 | Algumas mulheres incham um pouco na ovulação. Se acontecer, não é gordura — é retenção. Água e fibra resolvem. |
| 16 | Último dia de pico. A partir de amanhã, a progesterona sobe e o ritmo muda. Tá tudo certo — é o ciclo fazendo o ciclo. |

---

### 4.4 FASE LÚTEA / TPM (Dias 17–28)

| Dia | 💬 Nota da Especialista |
|-----|------------------------|
| 17 | A progesterona começou a subir. Você pode sentir o ritmo desacelerar. Não force — adapte. |
| 18 | Se você tá com mais fome hoje, é seu corpo pedindo energia pro que vem. Não é fraqueza. Planeje um lanche gostoso. |
| 19 | Seu corpo tá retendo mais líquido agora. A balança pode subir, mas não é gordura. Confia no processo. |
| 20 | Metade da fase lútea. Se a irritação aparecer, respira fundo. Não é frescura — é progesterona. Você não precisa resolver tudo hoje. |
| 21 | Se o treino tá mais difícil, diminui a intensidade sem culpa. Caminhada conta. Alongamento conta. Descanso conta. |
| 22 | Fome de carbo? Normal. Seu metabolismo tá mais acelerado agora e pede mais energia. Escolha carbo com fibra e segue em frente. |
| 23 | Se você acordou se sentindo inchada e irritada, saiba: é a fase mais desafiadora do ciclo. Você não tá falhando. Seu corpo tá trabalhando. |
| 24 | Hoje é dia de ser gentil consigo. Se der, caminha 20 min. Se não der, tá tudo bem. Amanhã é outro dia. |
| 25 | Faltam poucos dias pra menstruação. O pior da TPM costuma ser agora. Se precisar de um chocolate, come. Sem drama. |
| 26 | Se tá difícil dormir, tenta deitar mais cedo e desligar tela 30 min antes. O sono melhora muito a TPM do dia seguinte. |
| 27 | Quase lá. Seu corpo tá se preparando pra recomeçar o ciclo. Tudo que você tá sentindo tem data pra passar. |
| 28 | Último dia do ciclo. Amanhã recomeça — e com ele, a energia volta. Você passou por mais um mês inteiro. Isso merece respeito. |

---

### 4.5 MODO SEM CICLO — Mensagens por Contexto de Sintoma

> Para usuárias sem ciclo (menopausa, irregular, anticoncepcional contínuo), a Nota da Especialista é selecionada com base no **sintoma predominante do dia anterior** ou exibe uma mensagem genérica acolhedora caso não haja registro prévio.

**Lógica de seleção:**
```
SE nenhum registro anterior → mensagem genérica do dia
SE sintoma_predominante = inchaco → mensagem de acolhimento sobre retenção
SE sintoma_predominante = fome → mensagem de acolhimento sobre fome
SE sintoma_predominante = sono → mensagem de acolhimento sobre sono
SE sintoma_predominante = humor → mensagem de acolhimento sobre humor
SE todos os sintomas ≤ 1 → mensagem de celebração
```

| Contexto | 💬 Nota da Especialista |
|----------|------------------------|
| **Genérica (sem registro)** | Bom dia! Registra como você tá se sentindo hoje — leva 30 segundos e ajuda a entender seus padrões. |
| **Inchaço predominante** | Se você tá se sentindo inchada, não é culpa sua. Seu corpo retém líquido por vários motivos. Água e caminhada ajudam mais do que cortar comida. |
| **Fome predominante** | Fome intensa não é falta de controle. Seu corpo tá pedindo algo. Atende com proteína e um lanche planejado — sem culpa. |
| **Sono ruim predominante** | Noite ruim? Hoje vai com calma. Evita cafeína da tarde em diante e tenta compensar com uma caminhada leve. Não se cobre demais. |
| **Humor baixo predominante** | Se tá tudo pesado hoje, tá tudo bem sentir isso. Não precisa resolver nada agora. 5 minutos de respiração já muda o dia. |
| **Dia bom (tudo ≤ 1)** | Dia bom, hein? Aproveita essa energia. Seu corpo tá te dizendo que algo tá funcionando — continua assim. |

---

## 5. LÓGICA DE EXIBIÇÃO — COMO TUDO SE CONECTA

### 5.1 Modo Com Ciclo (usuária menstrua)

```
1. Backend calcula dia do ciclo → identifica fase (MENSTRUAL/FOLICULAR/OVULATÓRIA/LÚTEA)
2. Exibe mensagem da fase correspondente (Seção 2)
   → "Hoje seu corpo tende a…" + 3 Faça + 2 Evite
3. Exibe Nota da Especialista do dia (Seção 4) → mensagem baseada no dia exato do ciclo
4. Usuária registra sintomas do dia (4 campos, escala 0-3)
5. SE algum sintoma = 3 → exibe dica extra correspondente (Seção 3)
6. Resultado: Mensagem de Fase + Nota da Especialista + Dicas Extras condicionais
```

### 5.2 Modo Sem Ciclo (menopausa / irregular / anticoncepcional contínuo)

```
1. Sem cálculo de fase (não tem data de referência confiável)
2. NÃO exibe mensagem de fase
3. Exibe Nota da Especialista baseada no sintoma predominante do dia anterior (Seção 4.5)
4. Usuária registra sintomas do dia (mesmos 4 campos, escala 0-3)
5. App analisa os sintomas e aplica os gatilhos (Seção 3)
6. Resultado: Nota da Especialista contextual + Dicas Extras baseadas nos sintomas
```

> **Nota para implementação**: No Modo Sem Ciclo, o `recommendation.service.ts` deve retornar recomendações baseadas exclusivamente nos níveis dos sintomas, sem depender de `fase_ciclo`. A lógica de gatilho (Seção 3) e a Nota da Especialista contextual (Seção 4.5) funcionam independentemente do modo.

---

## 6. IMPLEMENTAÇÃO TÉCNICA

### 6.1 Estrutura de Dados Sugerida

```typescript
// types/mensagens.ts

interface MensagemFase {
  fase: 'MENSTRUAL' | 'FOLICULAR' | 'OVULATORIA' | 'LUTEA';
  diasCiclo: string;           // ex: "1-5"
  contextoHormonal: string;
  tendeDia: string;            // "Hoje seu corpo tende a..."
  faca: string[];              // 3 ações
  evite: string[];             // 2 itens
}

interface DicaGatilho {
  sintoma: 'inchaco' | 'fome_compulsao' | 'qualidade_sono' | 'humor_irritacao';
  nivelDisparo: 3;             // sempre 3
  emoji: string;
  mensagem: string;
}

interface NotaEspecialista {
  diaCiclo: number;            // 1-28
  fase: 'MENSTRUAL' | 'FOLICULAR' | 'OVULATORIA' | 'LUTEA';
  mensagem: string;
}

interface NotaSemCiclo {
  contexto: 'generica' | 'inchaco' | 'fome' | 'sono' | 'humor' | 'dia_bom';
  mensagem: string;
}
```

### 6.2 Constante da Biblioteca (Backend)

```typescript
// constants/mensagens-fase.ts

export const MENSAGENS_POR_FASE: MensagemFase[] = [
  {
    fase: 'MENSTRUAL',
    diasCiclo: '1-5',
    contextoHormonal: 'Estrogênio e progesterona em baixa',
    tendeDia: 'Baixa energia + mais fome emocional.',
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
  {
    fase: 'FOLICULAR',
    diasCiclo: '6-12',
    contextoHormonal: 'Estrogênio subindo',
    tendeDia: 'Mais energia + mais disciplina.',
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
  {
    fase: 'OVULATORIA',
    diasCiclo: '13-16',
    contextoHormonal: 'Pico de estrogênio',
    tendeDia: 'Pico de energia/social, mas algumas incham.',
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
  {
    fase: 'LUTEA',
    diasCiclo: '17-28',
    contextoHormonal: 'Progesterona alta, depois queda',
    tendeDia: 'Retenção + irritação + fome/carbo.',
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
];
```

### 6.3 Constante dos Gatilhos (Backend)

```typescript
// constants/gatilhos-sintomas.ts

export const GATILHOS_SINTOMA: DicaGatilho[] = [
  {
    sintoma: 'inchaco',
    nivelDisparo: 3,
    emoji: '💧',
    mensagem: 'Hoje: água + caminhada + reduzir ultraprocessado e refrigerante.'
  },
  {
    sintoma: 'fome_compulsao',
    nivelDisparo: 3,
    emoji: '🍎',
    mensagem: 'Inclua 1 lanche planejado: iogurte/ovo/fruta + castanhas.'
  },
  {
    sintoma: 'qualidade_sono',
    nivelDisparo: 3,
    emoji: '🌙',
    mensagem: 'Corte cafeína após 14h + banho morno + tela off 30 min antes.'
  },
  {
    sintoma: 'humor_irritacao',
    nivelDisparo: 3,
    emoji: '🧘‍♀️',
    mensagem: 'Faça 5 min de respiração + caminhe 10 min. Não decida nada importante irritada.'
  }
];
```

### 6.4 Constante da Nota da Especialista (Backend)

```typescript
// constants/notas-especialista.ts

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
```

### 6.5 Lógica do Recommendation Service (atualizado)

```typescript
// services/recommendation.service.ts

import { MENSAGENS_POR_FASE } from '../constants/mensagens-fase';
import { GATILHOS_SINTOMA } from '../constants/gatilhos-sintomas';
import { NOTAS_POR_DIA, NOTAS_SEM_CICLO } from '../constants/notas-especialista';

interface Sintomas {
  inchaco: number;
  fomeCompulsao: number;
  humorIrritacao: number;
  qualidadeSono: number;
}

interface Recomendacoes {
  mensagemFase: MensagemFase | null;
  notaEspecialista: string;
  dicasExtras: string[];
}

export class RecommendationService {

  gerarRecomendacoes(
    fase: string | null,      // null no Modo Sem Ciclo
    diaCiclo: number | null,  // null no Modo Sem Ciclo
    sintomas: Sintomas,
    objetivos: string[],
    sintomasPredominantesOntem?: Sintomas | null  // para Modo Sem Ciclo
  ): Recomendacoes {

    // Camada 1: Mensagem por Fase (apenas Modo Com Ciclo)
    const mensagemFase = fase
      ? MENSAGENS_POR_FASE.find(m => m.fase === fase) || null
      : null;

    // Camada 2: Dicas por Gatilho (ambos os modos)
    const dicasExtras: string[] = [];

    const mapeamento = {
      inchaco: sintomas.inchaco,
      fome_compulsao: sintomas.fomeCompulsao,
      qualidade_sono: sintomas.qualidadeSono,
      humor_irritacao: sintomas.humorIrritacao
    };

    GATILHOS_SINTOMA.forEach(gatilho => {
      if (mapeamento[gatilho.sintoma] >= gatilho.nivelDisparo) {
        dicasExtras.push(`${gatilho.emoji} ${gatilho.mensagem}`);
      }
    });

    // Camada 3: Nota da Especialista
    const notaEspecialista = diaCiclo
      ? this.getNotaComCiclo(diaCiclo)
      : this.getNotaSemCiclo(sintomasPredominantesOntem);

    return { mensagemFase, notaEspecialista, dicasExtras };
  }

  private getNotaComCiclo(diaCiclo: number): string {
    const nota = NOTAS_POR_DIA.find(n => n.diaCiclo === diaCiclo);
    return nota?.mensagem || NOTAS_SEM_CICLO.find(n => n.contexto === 'generica')!.mensagem;
  }

  private getNotaSemCiclo(sintomasOntem?: Sintomas | null): string {
    if (!sintomasOntem) {
      return NOTAS_SEM_CICLO.find(n => n.contexto === 'generica')!.mensagem;
    }

    // Se todos os sintomas ≤ 1, é dia bom
    const todos = [sintomasOntem.inchaco, sintomasOntem.fomeCompulsao,
                   sintomasOntem.humorIrritacao, sintomasOntem.qualidadeSono];
    if (todos.every(s => s <= 1)) {
      return NOTAS_SEM_CICLO.find(n => n.contexto === 'dia_bom')!.mensagem;
    }

    // Encontra o sintoma predominante (maior valor)
    const sintomaMapa = [
      { contexto: 'inchaco', valor: sintomasOntem.inchaco },
      { contexto: 'fome', valor: sintomasOntem.fomeCompulsao },
      { contexto: 'sono', valor: sintomasOntem.qualidadeSono },
      { contexto: 'humor', valor: sintomasOntem.humorIrritacao }
    ];
    const predominante = sintomaMapa.sort((a, b) => b.valor - a.valor)[0];

    return NOTAS_SEM_CICLO.find(n => n.contexto === predominante.contexto)?.mensagem
      || NOTAS_SEM_CICLO.find(n => n.contexto === 'generica')!.mensagem;
  }
}
```

---

## 7. INTEGRAÇÃO COM DOCUMENTAÇÃO EXISTENTE

### Onde este documento se encaixa

| Documento Existente | O que já tem | O que este doc adiciona |
|---------------------|-------------|------------------------|
| **DOCUMENTACAO-COMPLETA** | Estrutura "3 Faça + 2 Evite", tabela de características por fase, regras SE/ENTÃO dos gatilhos | Conteúdo textual completo das mensagens, versão expandida dos gatilhos, 28 Notas da Especialista |
| **PRD-BACKEND** | `recommendation.service.ts` (chamada), endpoint POST /registros retornando `recomendacoes` | Implementação completa do service com constantes, lógica e Nota da Especialista |
| **PRD-FRONTEND** | Componentes `mensagens.faca.map()`, `mensagens.evite.map()`, `NotaEspecialista` | Os dados que alimentam esses componentes — incluindo o conteúdo da NotaEspecialista |
| **PRD-DATABASE** | Campo `modo_ciclo` (COM_CICLO, SEM_CICLO, MENOPAUSA, ANTICONCEPCIONAL) | Lógica de como cada modo consome as mensagens e notas |

### Pendências Resolvidas por este documento

- ✅ Biblioteca de mensagens por fase (conteúdo textual completo)
- ✅ Nota da Especialista — 28 mensagens diárias (1 por dia do ciclo)
- ✅ Nota da Especialista — Modo Sem Ciclo (6 mensagens por contexto de sintoma)
- ✅ Implementação técnica do `recommendation.service.ts` com 3 camadas

### Pendência Remanescente

Permanece como pendência separada a documentação detalhada do **fluxo do Modo Sem Ciclo** no `calcularFaseAtual` do PRD-BACKEND (que hoje assume sempre haver dados de menstruação).

---

*Documento criado em: 11 de fevereiro de 2026*
*Atualizado: 11 de fevereiro de 2026 (v1.1 — adicionada Nota da Especialista)*
*Complemento à documentação CicloLeve v1.0*
