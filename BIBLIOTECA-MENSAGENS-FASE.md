# CicloLeve — Biblioteca de Mensagens por Fase (MVP)

**Documento complementar à documentação técnica do projeto**
**Versão**: 1.0
**Data**: 11 de fevereiro de 2026

---

## 1. VISÃO GERAL

Este documento contém **todo o conteúdo textual** que o app exibe diariamente para a usuária, organizado por fase do ciclo e por gatilho de sintoma. Ele complementa a documentação existente (DOCUMENTACAO-COMPLETA, PRD-BACKEND, PRD-FRONTEND) que já define a estrutura de "3 blocos" — mas não trazia o conteúdo em si.

### Estrutura do Output Diário

Cada dia, a usuária recebe **3 blocos curtos** na tela principal:

| Bloco | Formato | Exemplo |
|-------|---------|---------|
| **Hoje seu corpo tende a…** | 1 linha descritiva | "baixa energia + mais fome emocional" |
| **Faça isso hoje** | 3 ações práticas | Proteína no café, caminhada 20 min, 2L água |
| **Evite isso hoje** | 2 itens | Treino pesado, muito açúcar à noite |

**Princípios do conteúdo:**
- Sem textão. Sem papo médico.
- Linguagem direta, empática e não-julgadora.
- Ações específicas e acionáveis (não genéricas).

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

## 4. LÓGICA DE EXIBIÇÃO — COMO TUDO SE CONECTA

### 4.1 Modo Com Ciclo (usuária menstrua)

```
1. Backend calcula dia do ciclo → identifica fase (MENSTRUAL/FOLICULAR/OVULATÓRIA/LÚTEA)
2. Exibe mensagem da fase correspondente (Seção 2)
   → "Hoje seu corpo tende a…" + 3 Faça + 2 Evite
3. Usuária registra sintomas do dia (4 campos, escala 0-3)
4. SE algum sintoma = 3 → exibe dica extra correspondente (Seção 3)
5. Resultado: Mensagem de Fase + Dicas Extras condicionais
```

### 4.2 Modo Sem Ciclo (menopausa / irregular / anticoncepcional contínuo)

```
1. Sem cálculo de fase (não tem data de referência confiável)
2. NÃO exibe mensagem de fase
3. Usuária registra sintomas do dia (mesmos 4 campos, escala 0-3)
4. App analisa os sintomas e aplica os gatilhos (Seção 3)
5. Resultado: apenas Dicas Extras baseadas nos sintomas reportados
```

> **Nota para implementação**: No Modo Sem Ciclo, o `recommendation.service.ts` deve retornar recomendações baseadas exclusivamente nos níveis dos sintomas, sem depender de `fase_ciclo`. A lógica de gatilho (Seção 3) funciona independentemente do modo.

---

## 5. IMPLEMENTAÇÃO TÉCNICA

### 5.1 Estrutura de Dados Sugerida

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
```

### 5.2 Constante da Biblioteca (Backend)

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

### 5.3 Constante dos Gatilhos (Backend)

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

### 5.4 Lógica do Recommendation Service

```typescript
// services/recommendation.service.ts

import { MENSAGENS_POR_FASE } from '../constants/mensagens-fase';
import { GATILHOS_SINTOMA } from '../constants/gatilhos-sintomas';

interface Sintomas {
  inchaco: number;
  fomeCompulsao: number;
  humorIrritacao: number;
  qualidadeSono: number;
}

interface Recomendacoes {
  mensagemFase: MensagemFase | null;
  dicasExtras: string[];
}

export class RecommendationService {

  gerarRecomendacoes(
    fase: string | null,      // null no Modo Sem Ciclo
    sintomas: Sintomas,
    objetivos: string[]
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

    return { mensagemFase, dicasExtras };
  }
}
```

---

## 6. INTEGRAÇÃO COM DOCUMENTAÇÃO EXISTENTE

### Onde este documento se encaixa

| Documento Existente | O que já tem | O que este doc adiciona |
|---------------------|-------------|------------------------|
| **DOCUMENTACAO-COMPLETA** | Estrutura "3 Faça + 2 Evite", tabela de características por fase, regras SE/ENTÃO dos gatilhos | Conteúdo textual completo das mensagens, versão expandida dos gatilhos |
| **PRD-BACKEND** | `recommendation.service.ts` (chamada), endpoint POST /registros retornando `recomendacoes` | Implementação completa do service com constantes e lógica |
| **PRD-FRONTEND** | Componentes `mensagens.faca.map()`, `mensagens.evite.map()`, `NotaEspecialista` | Os dados que alimentam esses componentes |
| **PRD-DATABASE** | Campo `modo_ciclo` (COM_CICLO, SEM_CICLO, MENOPAUSA, ANTICONCEPCIONAL) | Lógica de como cada modo consome as mensagens |

### Pendência Relacionada

Este documento resolve o gap da **biblioteca de mensagens**. Permanece como pendência separada a documentação detalhada do **fluxo do Modo Sem Ciclo** no `calcularFaseAtual` do PRD-BACKEND (que hoje assume sempre haver dados de menstruação).

---

*Documento criado em: 11 de fevereiro de 2026*
*Complemento à documentação CicloLeve v1.0*
