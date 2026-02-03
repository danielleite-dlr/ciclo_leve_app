# CicloLeve - Documentação Completa
**App de Controle Hormonal Feminino + Emagrecimento**

---

## 📱 VISÃO GERAL DO PRODUTO

### O Problema
Mulheres entre 25-55 anos enfrentam um desafio frustrante: **"Faço tudo certo e meu corpo não responde"**. Elas tentam dietas, exercícios e mudanças de estilo de vida, mas não conseguem resultados consistentes porque ignoram um fator crucial: **as flutuações hormonais do ciclo menstrual**.

Cada fase do ciclo (menstrual, folicular, ovulatória, lútea) afeta:
- **Metabolismo** e queima de gordura
- **Apetite** e compulsão alimentar
- **Retenção de líquidos** (inchaço)
- **Energia** para exercícios
- **Humor** e motivação

Sem entender essas mudanças, mulheres:
- Abandonam dietas por frustração
- Culpam-se por "falta de força de vontade"
- Perdem dinheiro com soluções genéricas
- Sofrem com TPM severa

### A Solução: CicloLeve
**CicloLeve** é um app mobile que **adapta automaticamente** as recomendações de alimentação, exercício e bem-estar à fase atual do ciclo menstrual da usuária.

**Proposta de Valor**:
> "Pare de lutar contra seu corpo. Trabalhe COM ele. Seu corpo muda, sua estratégia também."

---

## 🎯 OBJETIVO DO APP

### Objetivo Principal
Ajudar mulheres a alcançarem seus objetivos de saúde (emagrecimento, redução de inchaço, controle de TPM, melhora do sono) através de **recomendações personalizadas** baseadas na fase do ciclo menstrual.

### Objetivos Secundários
1. **Educação hormonal**: Ensinar usuárias como hormônios afetam corpo e mente
2. **Engajamento diário**: Criar hábito de registro de sintomas (30 segundos/dia)
3. **Monetização sustentável**: Converter 10-15% dos usuários em premium
4. **Retenção alta**: 60%+ de usuárias ativas após 3 meses

---

## 👥 PÚBLICO-ALVO

### Persona Primária: "Maria da TPM"
- **Idade**: 28-42 anos
- **Situação**: Ciclo menstrual regular, TPM moderada/severa
- **Objetivos**: Reduzir inchaço, controlar compulsão alimentar, emagrecer 5-10kg
- **Dor principal**: "Por que eu tenho tanta fome na semana antes da menstruação?"
- **Comportamento**: Já tentou várias dietas, usa apps de fitness, gosta de conteúdo educacional

### Persona Secundária: "Ana da Perimenopausa"
- **Idade**: 45-55 anos
- **Situação**: Ciclo irregular, início da menopausa
- **Objetivos**: Entender mudanças hormonais, controlar ganho de peso
- **Dor principal**: "Meu corpo está mudando e não sei o que fazer"
- **Comportamento**: Busca informações confiáveis, valoriza conteúdo médico

### Persona Terciária: "Julia Fitness"
- **Idade**: 22-35 anos
- **Situação**: Ciclo regular, praticante de exercícios
- **Objetivos**: Otimizar treinos por fase do ciclo, performance esportiva
- **Dor principal**: "Por que alguns treinos são tão difíceis em certas semanas?"
- **Comportamento**: Ativa em redes sociais fitness, paga por apps premium

---

## ⚙️ COMO FUNCIONA

### 1. Onboarding Personalizado (3 minutos)

**Etapa 1: Dados Básicos**
- Nome, email, senha
- Altura, peso (opcional), idade
- Aceitação de termos LGPD

**Etapa 2: Configuração do Ciclo**
- Data da última menstruação
- Duração média do ciclo (21-45 dias, padrão 28)
- Duração do sangramento (1-10 dias, padrão 5)
- Ciclo regular? Sim/Não

**Etapa 3: Momento Atual**
Escolher uma opção:
- 💧 Ciclo regular (variação < 7 dias)
- 〰️ Ciclo irregular (variação imprevisível)
- 🌿 Menopausa/Perimenopausa
- 💊 Anticoncepcional de uso contínuo

**Etapa 4: Objetivos**
Selecionar múltiplos:
- ⚖️ Emagrecer
- 💧 Reduzir inchaço
- 🍴 Controlar fome/compulsão
- 😊 Melhorar humor/TPM
- 🌙 Dormir melhor

### 2. Lógica do Ciclo

**Cálculo Automático da Fase**
```
Dia do Ciclo = ((Hoje - Data Última Menstruação) % Duração Ciclo) + 1

Fase:
- Dia 1-5:   MENSTRUAL
- Dia 6-12:  FOLICULAR
- Dia 13-16: OVULATÓRIA
- Dia 17-28: LÚTEA (TPM)
```

**Características de Cada Fase**:

| Fase | Hormônios | Corpo Tende a... | Estratégia |
|------|-----------|------------------|------------|
| **Menstrual** (dias 1-5) | Baixa de tudo | Cansaço, fome emocional | Descanso, nutrição |
| **Folicular** (dias 6-12) | Estrogênio subindo | Mais energia, disciplina | Treino intenso, planejamento |
| **Ovulatória** (dias 13-16) | Pico de estrogênio | Energia máxima, sociabilidade | Desafios, força |
| **Lútea** (dias 17-28) | Progesterona alta | Inchaço, fome, irritação | Autocuidado, proteína |

### 3. Registro Diário (30 segundos)

**4 Sintomas em escala 0-3**:
1. **Inchaço** (0=sem, 3=intenso)
2. **Fome/Compulsão** (0=sem, 3=intensa)
3. **Humor/Irritação** (0=ótimo, 3=irritada)
4. **Sono** (0=ótimo, 3=péssimo)

**Opcional**:
- Peso do dia
- Notas livres

### 4. Recomendações Personalizadas

**Sistema de 2 Camadas**:

**Camada 1: Mensagens por Fase** (sempre mostradas)
- Título inspirador da fase
- Descrição do que esperar
- 3 ações "Faça hoje" (específicas, acionáveis)
- 2 ações "Evite hoje"

**Camada 2: Dicas por Sintomas Críticos** (quando nível = 3)
```
SE Inchaço = 3
  ENTÃO mostrar: "💧 Hoje: água + caminhada + reduzir ultraprocessado"

SE Fome = 3
  ENTÃO mostrar: "🍎 Inclua 1 lanche planejado: iogurte/ovo/fruta + castanhas"

SE Humor = 3
  ENTÃO mostrar: "🧘‍♀️ Faça 5 min de respiração + caminhe 10 min"

SE Sono = 3
  ENTÃO mostrar: "🌙 Corte cafeína após 14h + banho morno"
```

### 5. Biblioteca de Conteúdo Educacional

**Categorias**:
- 🥗 Nutrição (alimentos anti-TPM, receitas)
- 🏃‍♀️ Exercício (treinos por fase)
- 🔬 Hormônios (entender estrogênio, progesterona)
- 💊 Suplementos (magnésio, vitamina B6)

**Filtros**:
- Por fase do ciclo
- Por objetivo (emagrecer, TPM, etc)
- Premium vs Gratuito

**Formato**:
- Artigos (5-10 min leitura)
- Dicas rápidas (2 min)
- Receitas
- Vídeos (futuro)

---

## 📊 JORNADA DO USUÁRIO

### Dia 1: Descoberta e Cadastro
```
1. Usuária encontra app (App Store, anúncio, indicação)
2. Baixa e abre → Splash screen
3. Cria conta (email + senha)
4. Onboarding (3 min)
5. Primeira visualização da fase atual
6. CTA: "Registre como está se sentindo hoje"
```

### Dia 2-7: Engajamento Inicial
```
1. Notificação push 9h: "Registre seu dia 💚"
2. Abre app → vê mensagem do dia personalizada
3. Registra sintomas (30s)
4. Recebe recomendação extra se sintoma crítico
5. Navega na biblioteca de conteúdo
```

### Dia 8-30: Formação de Hábito
```
1. Registro diário vira rotina
2. Usuária vê padrões no histórico/gráfico
3. Nota melhora em sintomas (correlação fase x comportamento)
4. Compartilha conquista nas redes sociais
5. Convida amigas (referral futuro)
```

### Dia 31+: Usuária Engajada
```
1. Registra 25+ dias/mês
2. Lê 2-3 artigos/semana
3. Identifica gatilhos (ex: café piora TPM)
4. Considera upgrade para premium
```

### Conversão para Premium
```
Gatilhos de paywall:
- Após 7 registros (trial grátis acabou)
- Tentativa de acessar conteúdo premium
- Limite de registros históricos (free = 30 dias)
- Exportar relatório para médico

Oferta:
- 7 dias grátis (sem pedir cartão)
- R$ 14,99/mês ou R$ 179,90/ano (melhor valor)
```

---

## 💰 MODELO DE MONETIZAÇÃO

### Plano FREE (70% dos usuários)
**Incluído**:
✅ Cálculo de fase do ciclo
✅ Registro diário de 4 sintomas
✅ Mensagens diárias personalizadas
✅ Histórico de 30 dias
✅ 5 artigos educacionais/mês
✅ Gráfico básico de sintomas

**Limitações**:
❌ Histórico > 30 dias
❌ Conteúdo premium
❌ Exportar relatórios
❌ Suporte prioritário
❌ Insights avançados (IA)

### Plano PREMIUM (30% dos usuários)
**Preços**:
- **Mensal**: R$ 29,90/mês
- **Anual**: R$ 179,90/ano (R$ 14,99/mês - **50% off**)

**Benefícios exclusivos**:
✨ Histórico ilimitado (3+ anos)
✨ Todos os artigos educacionais desbloqueados
✨ Insights por IA (predição de sintomas)
✨ Exportar relatório PDF para médico
✨ Integração com Apple Health / Google Fit
✨ Receitas personalizadas por fase
✨ Suporte prioritário via chat
✨ Planos de treino adaptados

**Trial**: 7 dias grátis (sem cobrar cartão)

### Projeção de Receita

**Cenário Base (12 meses)**:
```
Usuárias ativas:        10.000
Taxa premium:           10%
Premium:                1.000 usuárias
Ticket médio:           R$ 14,99/mês (assumindo 70% anual)

MRR:                    R$ 14.990
ARR:                    R$ 179.880
```

**Cenário Otimista (24 meses)**:
```
Usuárias ativas:        50.000
Taxa premium:           15%
Premium:                7.500 usuárias

MRR:                    R$ 112.425
ARR:                    R$ 1.349.100
```

### Outras Fontes de Receita (Futuro)
1. **Marketplace de nutricionistas/coaches** (comissão 20%)
2. **Afiliação com marcas** (suplementos, produtos femininos)
3. **Venda de dados agregados** (anonimizados, para pesquisa médica)
4. **B2B para empresas** (programa de bem-estar feminino)

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### FASE 1: MVP (Meses 1-3) - **PRIORIDADE MÁXIMA**

**Objetivo**: Validar conceito com 1.000 usuárias ativas

**Entregas**:

**Mês 1: Fundação**
- [ ] Banco de dados PostgreSQL + Redis (Week 1)
- [ ] Backend API básico (auth, perfil, registro) (Week 1-2)
- [ ] Frontend web responsivo (React/Next.js) (Week 2-3)
- [ ] Cálculo de fase do ciclo (Week 3)
- [ ] Sistema de registro diário (Week 4)

**Mês 2: Personalização**
- [ ] Lógica de recomendações por fase (Week 1)
- [ ] Gatilhos de dicas por sintomas críticos (Week 1)
- [ ] Biblioteca de conteúdo (20 artigos) (Week 2-3)
- [ ] Histórico e gráfico de sintomas (Week 3)
- [ ] Notificações push básicas (Week 4)

**Mês 3: Monetização e Polish**
- [ ] Sistema de pagamentos (Stripe) (Week 1)
- [ ] Paywall e trial grátis (Week 1)
- [ ] Onboarding otimizado (Week 2)
- [ ] Analytics e tracking (PostHog) (Week 2)
- [ ] Testes beta com 100 usuárias (Week 3-4)
- [ ] Deploy em produção (Week 4)

**KPIs Mês 3**:
- 1.000 usuárias cadastradas
- 60% completam onboarding
- 40% registram 7+ dias
- 5% convertem para premium
- NPS > 40

---

### FASE 2: Crescimento (Meses 4-6)

**Objetivo**: Escalar para 10.000 usuárias e otimizar conversão

**Entregas**:

**Mês 4: Mobile Nativo**
- [ ] App iOS (React Native + Expo)
- [ ] App Android (React Native + Expo)
- [ ] Notificações locais otimizadas
- [ ] Offline-first sync

**Mês 5: Conteúdo e Engajamento**
- [ ] 100+ artigos educacionais
- [ ] Sistema de favoritos
- [ ] Compartilhamento social
- [ ] Programa de referral (ganhe 1 mês grátis)

**Mês 6: Otimização de Conversão**
- [ ] A/B tests do paywall
- [ ] Email marketing automatizado
- [ ] Recuperação de trial expirado
- [ ] Upsell anual para mensalistas

**Marketing**:
- Instagram/TikTok (conteúdo educacional viral)
- Parcerias com influenciadoras de saúde
- SEO (blog sobre ciclo menstrual)
- Anúncios pagos (Meta Ads: R$ 10k/mês)

**KPIs Mês 6**:
- 10.000 usuárias ativas
- 50% de retenção D30
- 10% taxa de conversão premium
- R$ 15k MRR
- NPS > 50

---

### FASE 3: Escala (Meses 7-12)

**Objetivo**: Tornar-se referência em saúde hormonal feminina

**Entregas**:

**Mês 7-8: Inteligência Artificial**
- [ ] Predição de sintomas por IA
- [ ] Recomendações hiper-personalizadas
- [ ] Chatbot de suporte

**Mês 9-10: Integrações**
- [ ] Apple Health / Google Fit
- [ ] Exportar PDF para médico
- [ ] API para desenvolvedores

**Mês 11-12: Expansão**
- [ ] Suporte a múltiplos idiomas (ES, EN)
- [ ] Conteúdo em vídeo
- [ ] Comunidade in-app

**KPIs Mês 12**:
- 50.000 usuárias ativas
- 15% taxa de conversão premium
- R$ 100k+ MRR
- Churn < 5%/mês
- NPS > 60

---

### FASE 4: Consolidação (Ano 2)

**Novas Features**:
- Marketplace de profissionais
- Planos corporativos (B2B)
- Integração com wearables (smartwatch)
- Programa de fertilidade/gravidez

**Objetivo Final**:
- 200.000+ usuárias ativas
- R$ 500k+ MRR
- Série A funding ou break-even

---

## 📈 MÉTRICAS DE SUCESSO

### Aquisição
- **DAU** (Daily Active Users): 40% dos MAU
- **Custo por Aquisição (CAC)**: < R$ 20
- **LTV/CAC Ratio**: > 3:1

### Engajamento
- **Taxa de ativação**: 60%+ completam onboarding
- **D7 Retention**: 50%+
- **D30 Retention**: 40%+
- **Registros/semana**: 4+ (média)

### Monetização
- **Taxa de conversão**: 10-15% (free → premium)
- **Churn mensal**: < 5%
- **LTV**: R$ 300+ (premium)
- **Payback period**: < 3 meses

### Qualidade
- **NPS**: > 50
- **App Store Rating**: > 4.5 ⭐
- **Support CSAT**: > 90%

---

## 🛡️ DESAFIOS E MITIGAÇÕES

### Desafio 1: Adesão ao Registro Diário
**Risco**: Usuárias param de registrar após 1 semana

**Mitigações**:
- Notificações inteligentes (horário otimizado)
- Gamificação (streak de dias consecutivos)
- Recompensas (desbloquear conteúdo)
- Registro super rápido (30s)

### Desafio 2: Complexidade do Ciclo
**Risco**: Mulheres com ciclo irregular ou menopausa não veem valor

**Mitigações**:
- Modo "Sem Ciclo" (baseado apenas em sintomas)
- IA aprende padrões individuais
- Conteúdo específico para menopausa

### Desafio 3: Privacidade de Dados
**Risco**: Dados de saúde são sensíveis (LGPD/GDPR)

**Mitigações**:
- Criptografia end-to-end
- Anonimização de dados agregados
- Transparência total (política de privacidade clara)
- Certificações de segurança

### Desafio 4: Concorrência
**Risco**: Flo, Clue, MyFitnessPal já existem

**Mitigações**:
- **Diferencial**: Foco em recomendações acionáveis (não apenas tracking)
- Linguagem empática e inclusiva
- Integração alimentação + ciclo (único no mercado BR)

### Desafio 5: Conversão para Premium
**Risco**: Usuárias não veem valor suficiente no premium

**Mitigações**:
- Trial de 7 dias (experimentar antes de pagar)
- Demonstração clara de benefícios
- Testimonials de usuárias premium
- Desconto anual irresistível (50% off)

---

## 🎨 PRINCÍPIOS DE DESIGN

### 1. Empatia Radical
- Linguagem **não-julgadora** ("seu corpo está pedindo descanso" vs "você exagerou")
- Validação de sentimentos ("É normal se sentir assim na fase lútea")
- Celebração de pequenas vitórias

### 2. Simplicidade Extrema
- Registro diário em **30 segundos**
- Onboarding em **3 minutos**
- Visual limpo (muito branco, verde vibrante como accent)

### 3. Educação Sutil
- Ensinar conceitos hormonais **dentro do contexto**
- Tooltips explicativos (opcional)
- Conteúdo progressivo (básico → avançado)

### 4. Mobile-First
- 90% do uso é mobile
- Gráficos otimizados para tela pequena
- Gestures intuitivos (swipe, tap)

### 5. Acessibilidade
- WCAG 2.1 AA compliant
- Contraste adequado
- Textos alternativos
- Suporte a screen readers

---

## 🔐 SEGURANÇA E COMPLIANCE

### LGPD (Brasil)
- ✅ Consentimento explícito no cadastro
- ✅ Direito ao esquecimento (deletar conta)
- ✅ Portabilidade de dados (exportar JSON)
- ✅ Criptografia de dados sensíveis
- ✅ DPO (Data Protection Officer) designado

### GDPR (Europa - futuro)
- ✅ Privacy by design
- ✅ Cookie consent
- ✅ Dados armazenados na EU (se expandir)

### Segurança Técnica
- HTTPS obrigatório (TLS 1.3)
- Senhas com bcrypt (10 rounds)
- Tokens JWT com refresh
- Rate limiting (anti-DDoS)
- Logs de auditoria

---

## 📚 STACK TECNOLÓGICA (Resumo)

### Frontend
- **Web**: Next.js 14 + React 18 + TypeScript
- **Mobile**: React Native + Expo
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Queue**: BullMQ
- **Storage**: AWS S3

### Infra
- **Hosting**: Vercel (frontend) + AWS ECS (backend)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry + DataDog
- **Analytics**: PostHog
- **Payments**: Stripe

---

## 🎯 CONCLUSÃO

**CicloLeve** resolve um problema real e doloroso para milhões de mulheres: a frustração de não conseguir resultados de saúde porque ignoram as flutuações hormonais.

**Diferenciais competitivos**:
1. **Recomendações acionáveis** (não apenas tracking)
2. **Personalização em 2 camadas** (fase + sintomas)
3. **Educação integrada** (biblioteca de conteúdo)
4. **UX empática** (linguagem não-julgadora)
5. **Foco no mercado BR** (linguagem e cultura locais)

**Por que vai dar certo**:
- Problema validado (mulheres gastam R$ 500M+/ano em apps de saúde no BR)
- Solução simples (30s/dia de registro)
- Monetização clara (premium com trial)
- Equipe capacitada (tech + saúde feminina)
- Mercado em crescimento (femtech cresce 15%/ano)

**Próximos passos**:
1. ✅ Protótipo funcional criado (index.html)
2. ✅ PRDs técnicos escritos (Database, Frontend, Backend)
3. ⏭️ Formar equipe (1 designer + 2 devs + 1 conteúdo)
4. ⏭️ Desenvolver MVP (3 meses)
5. ⏭️ Beta com 100 usuárias (mês 3)
6. ⏭️ Lançamento público (mês 4)
7. ⏭️ Funding Seed (mês 6-9, R$ 500k-1M)

---

**Vamos juntas transformar a saúde feminina! 💚**

*Documento criado em: 21 de janeiro de 2026*
*Versão: 1.0*
