# PRD - BACKEND: CicloLeve
**API RESTful para App de Controle Hormonal Feminino**

---

## 1. VISÃO GERAL

### 1.1 Objetivo do Backend
Construir uma API RESTful robusta, escalável e segura que processe dados sensíveis de saúde feminina, calcule fases do ciclo menstrual, personalize recomendações de bem-estar e gerencie assinaturas premium.

### 1.2 Stack Recomendada
- **Runtime**: Node.js 20+ com TypeScript
- **Framework**: Express.js ou Fastify (performance)
- **ORM**: Prisma ou TypeORM
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Queue**: BullMQ (jobs assíncronos)
- **Storage**: AWS S3 / Cloudflare R2
- **Auth**: JWT + Refresh Tokens
- **Payments**: Stripe / Mercado Pago
- **Monitoring**: Sentry + DataDog
- **Deploy**: Docker + AWS ECS / Fly.io

### 1.3 Arquitetura

```
┌─────────────────┐
│   Next.js Web   │
│  React Native   │ ──────► HTTPS (TLS 1.3)
│   Mobile Apps   │
└────────┬────────┘
         │
    ┌────▼─────────────────────┐
    │   API Gateway / CDN      │
    │   (Cloudflare / AWS)     │
    └────┬─────────────────────┘
         │
    ┌────▼──────────────────────┐
    │   Load Balancer (Nginx)   │
    └────┬──────────────────────┘
         │
    ┌────▼──────────────────────┐
    │   Backend API (Node.js)   │
    │   ├─ Auth Service         │
    │   ├─ Ciclo Service        │
    │   ├─ Registro Service     │
    │   ├─ Conteudo Service     │
    │   └─ Payment Service      │
    └────┬──────────────────────┘
         │
    ┌────▼──────────┬────────────────┬──────────────┐
    │  PostgreSQL   │     Redis      │   BullMQ     │
    │  (Dados)      │    (Cache)     │   (Jobs)     │
    └───────────────┴────────────────┴──────────────┘
```

---

## 2. ESTRUTURA DO PROJETO

```
cicloleve-api/
├── src/
│   ├── controllers/          # Handlers de rotas
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── ciclo.controller.ts
│   │   ├── registro.controller.ts
│   │   ├── conteudo.controller.ts
│   │   └── payment.controller.ts
│   ├── services/             # Lógica de negócio
│   │   ├── auth.service.ts
│   │   ├── ciclo.service.ts
│   │   ├── recommendation.service.ts
│   │   ├── notification.service.ts
│   │   └── payment.service.ts
│   ├── models/               # Schemas Prisma
│   │   └── schema.prisma
│   ├── middlewares/          # Middlewares
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── error.middleware.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── bcrypt.ts
│   │   ├── date.ts
│   │   └── logger.ts
│   ├── jobs/                 # Background jobs
│   │   ├── notificacoes-diarias.job.ts
│   │   ├── calcular-fase.job.ts
│   │   └── limpar-cache.job.ts
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── env.ts
│   ├── types/
│   │   └── index.d.ts
│   ├── routes/
│   │   └── index.ts
│   └── app.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── prisma/
│   ├── migrations/
│   └── seed.ts
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

## 3. ENDPOINTS DA API

### 3.1 AUTENTICAÇÃO (`/api/v1/auth`)

#### **POST /auth/register** - Cadastro de usuária
```typescript
// Request
POST /api/v1/auth/register
Content-Type: application/json

{
  "nome": "Maria Silva",
  "email": "maria@example.com",
  "senha": "senhaSegura123",
  "dataNascimento": "1995-03-15"
}

// Response 201
{
  "user": {
    "id": "uuid",
    "nome": "Maria Silva",
    "email": "maria@example.com",
    "emailVerificado": false,
    "plano": "FREE"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here"
}

// Validações
- Email: formato válido, único
- Senha: mínimo 8 caracteres, 1 maiúscula, 1 número
- Nome: mínimo 2 caracteres
- Data nascimento: idade >= 13 anos
```

**Implementação (Controller)**
```typescript
// controllers/auth.controller.ts
export async function register(req: Request, res: Response) {
  const { nome, email, senha, dataNascimento } = req.body;

  // Validar idade
  const idade = calcularIdade(new Date(dataNascimento));
  if (idade < 13) {
    return res.status(400).json({ error: 'Idade mínima: 13 anos' });
  }

  // Verificar email único
  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    return res.status(409).json({ error: 'Email já cadastrado' });
  }

  // Hash da senha
  const passwordHash = await bcrypt.hash(senha, 10);

  // Criar usuária
  const user = await prisma.user.create({
    data: {
      nome,
      email: email.toLowerCase(),
      passwordHash,
      dataNascimento: new Date(dataNascimento)
    }
  });

  // Gerar tokens
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

  // Salvar refresh token
  await redis.set(`refresh:${user.id}`, refreshToken, 'EX', 30 * 24 * 60 * 60);

  // Enviar email de verificação (async)
  await queue.add('enviar-email-verificacao', { userId: user.id, email: user.email });

  res.status(201).json({
    user: sanitizeUser(user),
    token,
    refreshToken
  });
}
```

#### **POST /auth/login** - Login
```typescript
// Request
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "maria@example.com",
  "senha": "senhaSegura123"
}

// Response 200
{
  "user": { /* ... */ },
  "token": "jwt_token",
  "refreshToken": "refresh_token"
}

// Errors
- 401: Credenciais inválidas
- 429: Muitas tentativas (rate limit)
```

**Implementação (Service)**
```typescript
// services/auth.service.ts
export class AuthService {
  async login(email: string, senha: string) {
    // Buscar usuária
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.passwordHash);
    if (!senhaValida) {
      // Log de tentativa falha
      await this.logLoginFalha(user.id);
      throw new UnauthorizedError('Credenciais inválidas');
    }

    // Gerar tokens
    const token = this.generateToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { ultimoLogin: new Date() }
    });

    return { user: sanitizeUser(user), token, refreshToken };
  }

  private async logLoginFalha(userId: string) {
    const key = `login-falhas:${userId}`;
    const falhas = await redis.incr(key);
    await redis.expire(key, 15 * 60); // 15 minutos

    if (falhas >= 5) {
      // Bloquear temporariamente
      await redis.set(`bloqueio:${userId}`, '1', 'EX', 30 * 60); // 30 min
      throw new TooManyRequestsError('Conta temporariamente bloqueada');
    }
  }
}
```

#### **POST /auth/refresh** - Renovar token
```typescript
// Request
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}

// Response 200
{
  "token": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

#### **POST /auth/logout** - Logout
```typescript
// Request (Bearer token required)
POST /api/v1/auth/logout

// Response 204
// Invalidar refresh token no Redis
```

---

### 3.2 PERFIL & CICLO (`/api/v1/perfil`, `/api/v1/ciclo`)

#### **GET /perfil** - Buscar perfil completo
```typescript
// Request (Bearer token required)
GET /api/v1/perfil

// Response 200
{
  "user": {
    "id": "uuid",
    "nome": "Maria Silva",
    "email": "maria@example.com",
    "dataNascimento": "1995-03-15",
    "altura": 165,
    "peso": 60,
    "plano": "PREMIUM_ANUAL",
    "planoExpiraEm": "2026-01-21T00:00:00Z"
  },
  "ciclo": {
    "modoCiclo": "COM_CICLO",
    "cicloRegular": true,
    "duracaoCiclo": 28,
    "duracaoSangramento": 5,
    "dataUltimaMenstruacao": "2025-01-01",
    "objetivos": ["REDUZIR_INCHACO", "MELHORAR_HUMOR"]
  },
  "faseAtual": {
    "fase": "LUTEA",
    "diaCiclo": 21,
    "diasProximaMenstruacao": 7
  }
}
```

**Implementação**
```typescript
// controllers/perfil.controller.ts
export async function getPerfil(req: AuthRequest, res: Response) {
  const userId = req.user.id;

  // Buscar dados (com cache)
  const cacheKey = `perfil:${userId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  // Buscar do banco
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { perfilCiclo: true }
  });

  // Calcular fase atual
  const faseAtual = cicloService.calcularFaseAtual(user.perfilCiclo);

  const response = {
    user: sanitizeUser(user),
    ciclo: user.perfilCiclo,
    faseAtual
  };

  // Cache por 1 hora
  await redis.set(cacheKey, JSON.stringify(response), 'EX', 3600);

  res.json(response);
}
```

#### **PUT /perfil/ciclo** - Atualizar dados do ciclo
```typescript
// Request
PUT /api/v1/perfil/ciclo
Content-Type: application/json

{
  "modoCiclo": "COM_CICLO",
  "cicloRegular": true,
  "duracaoCiclo": 28,
  "duracaoSangramento": 5,
  "dataUltimaMenstruacao": "2025-01-01",
  "objetivos": ["REDUZIR_INCHACO", "MELHORAR_HUMOR"]
}

// Response 200
{
  "message": "Perfil atualizado com sucesso",
  "ciclo": { /* dados atualizados */ }
}

// Validações
- duracaoCiclo: 21-45 dias
- duracaoSangramento: 1-10 dias
- dataUltimaMenstruacao: não pode ser futura
- objetivos: array válido de enum
```

**Implementação (Service)**
```typescript
// services/ciclo.service.ts
export class CicloService {
  async atualizarPerfil(userId: string, dados: AtualizarCicloDTO) {
    // Validar dados
    if (dados.duracaoCiclo < 21 || dados.duracaoCiclo > 45) {
      throw new ValidationError('Duração do ciclo deve estar entre 21 e 45 dias');
    }

    // Upsert perfil
    const perfil = await prisma.perfilCiclo.upsert({
      where: { userId },
      update: dados,
      create: { userId, ...dados }
    });

    // Invalidar cache
    await redis.del(`perfil:${userId}`);

    // Recalcular fase e agendar notificações
    await this.recalcularFase(userId);

    return perfil;
  }

  calcularFaseAtual(perfil: PerfilCiclo) {
    const hoje = new Date();
    const ultimaMenstruacao = new Date(perfil.dataUltimaMenstruacao);
    const diffDias = Math.floor((hoje.getTime() - ultimaMenstruacao.getTime()) / (1000 * 60 * 60 * 24));
    const diaCiclo = (diffDias % perfil.duracaoCiclo) + 1;

    let fase: string;
    if (diaCiclo <= 5) fase = 'MENSTRUAL';
    else if (diaCiclo <= 12) fase = 'FOLICULAR';
    else if (diaCiclo <= 16) fase = 'OVULATORIA';
    else fase = 'LUTEA';

    const diasProximaMenstruacao = perfil.duracaoCiclo - diaCiclo + 1;

    return { fase, diaCiclo, diasProximaMenstruacao };
  }

  async recalcularFase(userId: string) {
    const perfil = await prisma.perfilCiclo.findUnique({ where: { userId } });
    const fase = this.calcularFaseAtual(perfil);

    // Cache da fase (6 horas)
    await redis.set(`fase:${userId}`, JSON.stringify(fase), 'EX', 6 * 3600);

    // Agendar notificação de mudança de fase
    const proximaMudanca = this.calcularProximaMudancaFase(fase.diaCiclo, perfil.duracaoCiclo);
    await queue.add('notificar-mudanca-fase', { userId }, { delay: proximaMudanca });

    return fase;
  }
}
```

---

### 3.3 REGISTROS DIÁRIOS (`/api/v1/registros`)

#### **POST /registros** - Criar/atualizar registro do dia
```typescript
// Request
POST /api/v1/registros
Content-Type: application/json

{
  "data": "2025-01-21", // opcional (default: hoje)
  "inchaco": 2,         // 0-3
  "fomeCompulsao": 1,   // 0-3
  "humorIrritacao": 2,  // 0-3
  "qualidadeSono": 1,   // 0-3
  "peso": 60.5,         // opcional
  "notas": "Me senti bem hoje"  // opcional
}

// Response 201
{
  "registro": {
    "id": "uuid",
    "data": "2025-01-21",
    "inchaco": 2,
    "fomeCompulsao": 1,
    "humorIrritacao": 2,
    "qualidadeSono": 1,
    "peso": 60.5,
    "diaCiclo": 21,
    "faseCiclo": "LUTEA"
  },
  "recomendacoes": {
    "dicasExtras": [
      "💧 Hoje: água + caminhada + reduzir ultraprocessado."
    ]
  }
}
```

**Implementação**
```typescript
// controllers/registro.controller.ts
export async function criarRegistro(req: AuthRequest, res: Response) {
  const userId = req.user.id;
  const { data, inchaco, fomeCompulsao, humorIrritacao, qualidadeSono, peso, notas } = req.body;

  // Validar sintomas (0-3)
  if ([inchaco, fomeCompulsao, humorIrritacao, qualidadeSono].some(s => s < 0 || s > 3)) {
    return res.status(400).json({ error: 'Sintomas devem estar entre 0 e 3' });
  }

  // Buscar perfil para calcular fase
  const perfil = await prisma.perfilCiclo.findUnique({ where: { userId } });
  const faseAtual = cicloService.calcularFaseAtual(perfil);

  // Upsert registro (permite editar registro do mesmo dia)
  const registro = await prisma.registroDiario.upsert({
    where: {
      userId_dataRegistro: {
        userId,
        dataRegistro: data ? new Date(data) : new Date()
      }
    },
    update: {
      inchaco,
      fomeCompulsao,
      humorIrritacao,
      qualidadeSono,
      peso,
      notas,
      diaCiclo: faseAtual.diaCiclo,
      faseCiclo: faseAtual.fase
    },
    create: {
      userId,
      dataRegistro: data ? new Date(data) : new Date(),
      inchaco,
      fomeCompulsao,
      humorIrritacao,
      qualidadeSono,
      peso,
      notas,
      diaCiclo: faseAtual.diaCiclo,
      faseCiclo: faseAtual.fase
    }
  });

  // Gerar recomendações personalizadas
  const recomendacoes = recommendationService.gerarRecomendacoes(
    faseAtual.fase,
    { inchaco, fomeCompulsao, humorIrritacao, qualidadeSono },
    perfil.objetivos
  );

  // Invalidar cache de registros
  await redis.del(`registros:${userId}`);

  // Analytics
  analytics.track('registro_criado', {
    userId,
    fase: faseAtual.fase,
    sintomasCriticos: [inchaco, fomeCompulsao, humorIrritacao, qualidadeSono].filter(s => s === 3).length
  });

  res.status(201).json({ registro, recomendacoes });
}
```

#### **GET /registros** - Listar registros
```typescript
// Request
GET /api/v1/registros?limit=30&offset=0

// Response 200
{
  "registros": [
    {
      "id": "uuid",
      "data": "2025-01-21",
      "inchaco": 2,
      "fomeCompulsao": 1,
      "humorIrritacao": 2,
      "qualidadeSono": 1,
      "faseCiclo": "LUTEA",
      "diaCiclo": 21
    },
    // ... mais registros
  ],
  "total": 120,
  "limit": 30,
  "offset": 0
}
```

#### **GET /registros/estatisticas** - Estatísticas dos registros
```typescript
// Request
GET /api/v1/registros/estatisticas?periodo=30 // últimos 30 dias

// Response 200
{
  "periodo": {
    "inicio": "2024-12-22",
    "fim": "2025-01-21",
    "dias": 30
  },
  "estatisticas": {
    "diasRegistrados": 28,
    "taxaEngajamento": 93, // %
    "mediaSintomas": {
      "inchaco": 1.5,
      "fomeCompulsao": 1.2,
      "humorIrritacao": 1.8,
      "qualidadeSono": 1.1
    },
    "porFase": {
      "MENSTRUAL": { dias: 5, mediaIntensidade: 2.1 },
      "FOLICULAR": { dias: 7, mediaIntensidade: 0.8 },
      "OVULATORIA": { dias: 4, mediaIntensidade: 1.2 },
      "LUTEA": { dias: 12, mediaIntensidade: 2.3 }
    }
  }
}
```

**Implementação**
```typescript
// services/registro.service.ts
export class RegistroService {
  async getEstatisticas(userId: string, periodo: number = 30) {
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - periodo);

    const registros = await prisma.registroDiario.findMany({
      where: {
        userId,
        dataRegistro: { gte: dataInicio }
      },
      orderBy: { dataRegistro: 'desc' }
    });

    // Calcular estatísticas
    const diasRegistrados = registros.length;
    const taxaEngajamento = Math.round((diasRegistrados / periodo) * 100);

    const mediaSintomas = {
      inchaco: this.calcularMedia(registros.map(r => r.inchaco)),
      fomeCompulsao: this.calcularMedia(registros.map(r => r.fomeCompulsao)),
      humorIrritacao: this.calcularMedia(registros.map(r => r.humorIrritacao)),
      qualidadeSono: this.calcularMedia(registros.map(r => r.qualidadeSono))
    };

    // Agrupar por fase
    const porFase = this.agruparPorFase(registros);

    return {
      periodo: { inicio: dataInicio.toISOString(), fim: new Date().toISOString(), dias: periodo },
      estatisticas: { diasRegistrados, taxaEngajamento, mediaSintomas, porFase }
    };
  }

  private calcularMedia(valores: number[]): number {
    if (valores.length === 0) return 0;
    return Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 10) / 10;
  }

  private agruparPorFase(registros: RegistroDiario[]) {
    const fases = ['MENSTRUAL', 'FOLICULAR', 'OVULATORIA', 'LUTEA'];
    const resultado = {};

    fases.forEach(fase => {
      const registrosFase = registros.filter(r => r.faseCiclo === fase);
      const intensidadeMedia = this.calcularMedia(
        registrosFase.map(r => (r.inchaco + r.fomeCompulsao + r.humorIrritacao + r.qualidadeSono) / 4)
      );

      resultado[fase] = {
        dias: registrosFase.length,
        mediaIntensidade: intensidadeMedia
      };
    });

    return resultado;
  }
}
```

---

### 3.4 CONTEÚDO EDUCACIONAL (`/api/v1/conteudo`)

#### **GET /conteudo** - Listar conteúdos personalizados
```typescript
// Request
GET /api/v1/conteudo?fase=LUTEA&objetivos=REDUZIR_INCHACO,MELHORAR_HUMOR&limit=10

// Response 200
{
  "conteudos": [
    {
      "id": "uuid",
      "titulo": "Alimentos que aliviam a TPM",
      "descricao": "Descubra como magnésio e fibras...",
      "categoria": "NUTRICAO",
      "tipo": "ARTIGO",
      "thumbnailUrl": "https://cdn.../thumb.jpg",
      "tempoLeitura": 5,
      "premiumOnly": false,
      "slug": "alimentos-que-aliviam-tpm"
    },
    // ...
  ],
  "total": 42
}
```

**Implementação (com cache)**
```typescript
// controllers/conteudo.controller.ts
export async function listarConteudo(req: AuthRequest, res: Response) {
  const { fase, objetivos, limit = 10, offset = 0 } = req.query;
  const userId = req.user.id;

  // Cache key personalizado
  const cacheKey = `conteudo:${userId}:${fase}:${objetivos}:${limit}:${offset}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  // Buscar conteúdos
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const isPremium = ['PREMIUM_MENSAL', 'PREMIUM_ANUAL'].includes(user.plano);

  const where = {
    publicado: true,
    deletedAt: null,
    ...(isPremium ? {} : { premiumOnly: false }),
    ...(fase ? { fasesAplicaveis: { has: fase } } : {}),
    ...(objetivos ? {
      OR: (objetivos as string).split(',').map(obj => ({
        tags: { has: obj.toLowerCase() }
      }))
    } : {})
  };

  const [conteudos, total] = await prisma.$transaction([
    prisma.conteudoEducacional.findMany({
      where,
      take: Number(limit),
      skip: Number(offset),
      orderBy: [
        { categoria: 'asc' }, // priorizar por categoria
        { createdAt: 'desc' }
      ]
    }),
    prisma.conteudoEducacional.count({ where })
  ]);

  const response = { conteudos, total };

  // Cache por 15 minutos
  await redis.set(cacheKey, JSON.stringify(response), 'EX', 15 * 60);

  res.json(response);
}
```

#### **GET /conteudo/:slug** - Detalhes do conteúdo
```typescript
// Request
GET /api/v1/conteudo/alimentos-que-aliviam-tpm

// Response 200
{
  "conteudo": {
    "id": "uuid",
    "titulo": "Alimentos que aliviam a TPM",
    "conteudoMarkdown": "# Alimentos...",
    "categoria": "NUTRICAO",
    "thumbnailUrl": "...",
    "tempoLeitura": 5,
    "autor": "Dra. Ana Silva",
    "tags": ["magnesio", "alimentacao", "tpm"]
  }
}

// Se premiumOnly e user FREE → 403
```

#### **POST /conteudo/:id/view** - Registrar visualização
```typescript
// Request
POST /api/v1/conteudo/:id/view

// Response 204
// Incrementar contador de visualizações
// Criar registro em interacoes_conteudo
```

---

### 3.5 PAGAMENTOS (`/api/v1/payments`)

#### **POST /payments/checkout** - Criar sessão de checkout
```typescript
// Request
POST /api/v1/payments/checkout
Content-Type: application/json

{
  "plano": "PREMIUM_ANUAL" // ou PREMIUM_MENSAL
}

// Response 200
{
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_..."
}
```

**Implementação (Stripe)**
```typescript
// services/payment.service.ts
import Stripe from 'stripe';

export class PaymentService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  async criarCheckout(userId: string, plano: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const precos = {
      PREMIUM_MENSAL: 'price_mensal_id',
      PREMIUM_ANUAL: 'price_anual_id'
    };

    const session = await this.stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [{
        price: precos[plano],
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/premium/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/premium`,
      metadata: {
        userId,
        plano
      }
    });

    return {
      checkoutUrl: session.url,
      sessionId: session.id
    };
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.ativarAssinatura(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.renovarAssinatura(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.cancelarAssinatura(event.data.object);
        break;
    }
  }

  private async ativarAssinatura(session: Stripe.Checkout.Session) {
    const { userId, plano } = session.metadata;

    const expiraEm = new Date();
    if (plano === 'PREMIUM_MENSAL') expiraEm.setMonth(expiraEm.getMonth() + 1);
    else expiraEm.setFullYear(expiraEm.getFullYear() + 1);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { plano, planoExpiraEm: expiraEm }
      }),
      prisma.pagamento.create({
        data: {
          userId,
          valorCentavos: session.amount_total,
          gateway: 'STRIPE',
          gatewayTransactionId: session.id,
          plano,
          status: 'APPROVED',
          pagoEm: new Date(),
          expiraEm
        }
      })
    ]);

    // Invalidar cache
    await redis.del(`perfil:${userId}`);

    // Notificar usuária
    await notificationService.enviarEmail(userId, 'premium-ativado');
  }
}
```

#### **POST /payments/webhook** - Webhook do Stripe
```typescript
// Request (Stripe signature verification)
POST /api/v1/payments/webhook
Stripe-Signature: t=123,v1=abc...

// Response 200
{ "received": true }
```

---

### 3.6 NOTIFICAÇÕES (`/api/v1/notifications`)

#### **PUT /notifications/preferences** - Atualizar preferências
```typescript
// Request
PUT /api/v1/notifications/preferences
Content-Type: application/json

{
  "registroDiario": {
    "habilitado": true,
    "horario": "09:00"
  },
  "mudancaFase": {
    "habilitado": true
  },
  "fcmToken": "firebase_token_here"
}

// Response 200
{
  "message": "Preferências atualizadas"
}
```

---

## 4. MIDDLEWARES

### 4.1 Autenticação (JWT)
```typescript
// middlewares/auth.middleware.ts
export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

    // Buscar usuária
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, nome: true, email: true, plano: true, deletedAt: true }
    });

    if (!user || user.deletedAt) {
      return res.status(401).json({ error: 'Usuária não encontrada' });
    }

    // Anexar usuária ao request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    res.status(401).json({ error: 'Token inválido' });
  }
}
```

### 4.2 Rate Limiting
```typescript
// middlewares/rate-limit.middleware.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições
  message: 'Muitas requisições, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentativas de login
  skipSuccessfulRequests: true
});
```

### 4.3 Validação (Zod)
```typescript
// middlewares/validation.middleware.ts
import { z } from 'zod';

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.errors
        });
      }
      next(error);
    }
  };
}

// Uso
const registroSchema = z.object({
  inchaco: z.number().min(0).max(3),
  fomeCompulsao: z.number().min(0).max(3),
  humorIrritacao: z.number().min(0).max(3),
  qualidadeSono: z.number().min(0).max(3),
  peso: z.number().optional(),
  notas: z.string().max(500).optional()
});

router.post('/registros', validate(registroSchema), criarRegistro);
```

### 4.4 Error Handler
```typescript
// middlewares/error.middleware.ts
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error(err);

  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(401).json({ error: err.message });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }

  // Erro genérico
  res.status(500).json({
    error: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
```

---

## 5. BACKGROUND JOBS (BullMQ)

### 5.1 Notificações Diárias
```typescript
// jobs/notificacoes-diarias.job.ts
import { Queue, Worker } from 'bullmq';

const notificacoesQueue = new Queue('notificacoes-diarias', {
  connection: redisConnection
});

export const notificacoesWorker = new Worker('notificacoes-diarias', async (job) => {
  const { userId } = job.data;

  // Buscar preferências
  const notif = await prisma.notificacaoPush.findUnique({
    where: { userId },
    include: { user: { include: { perfilCiclo: true } } }
  });

  if (!notif.habilitado) return;

  // Calcular fase atual
  const fase = cicloService.calcularFaseAtual(notif.user.perfilCiclo);

  // Enviar notificação push
  await fcm.send({
    token: notif.fcmToken,
    notification: {
      title: `Bom dia! Você está na fase ${fase.fase}`,
      body: 'Registre como você está se sentindo hoje 💚'
    },
    data: {
      screen: 'registro'
    }
  });

  logger.info(`Notificação enviada para ${userId}`);
}, { connection: redisConnection });

// Agendar para todas as usuárias (cron diário)
export async function agendarNotificacoesDiarias() {
  const usuarias = await prisma.user.findMany({
    where: { deletedAt: null },
    include: { notificacoes: true }
  });

  for (const user of usuarias) {
    const horario = user.notificacoes.horarioPreferido || '09:00';
    const [hora, minuto] = horario.split(':');
    
    const proximoEnvio = new Date();
    proximoEnvio.setHours(Number(hora), Number(minuto), 0, 0);
    
    if (proximoEnvio < new Date()) {
      proximoEnvio.setDate(proximoEnvio.getDate() + 1);
    }

    await notificacoesQueue.add(
      'enviar-notificacao',
      { userId: user.id },
      { delay: proximoEnvio.getTime() - Date.now() }
    );
  }
}
```

### 5.2 Limpeza de Cache
```typescript
// jobs/limpar-cache.job.ts
import { Queue, Worker } from 'bullmq';

const cacheLimpezaQueue = new Queue('cache-limpeza', {
  connection: redisConnection
});

// Worker para limpar cache expirado
export const cacheLimpezaWorker = new Worker('cache-limpeza', async () => {
  const keys = await redis.keys('*');
  let limpas = 0;

  for (const key of keys) {
    const ttl = await redis.ttl(key);
    if (ttl === -1) { // sem expiração
      // Decidir se deve remover baseado em padrões
      if (key.startsWith('temp:')) {
        await redis.del(key);
        limpas++;
      }
    }
  }

  logger.info(`Cache limpo: ${limpas} chaves removidas`);
}, { connection: redisConnection });

// Agendar limpeza diária (3:00 AM)
cacheLimpezaQueue.add('limpar', {}, { repeat: { cron: '0 3 * * *' } });
```

---

## 6. TESTES

### 6.1 Testes Unitários (Jest)
```typescript
// tests/unit/ciclo.service.test.ts
describe('CicloService', () => {
  let cicloService: CicloService;

  beforeEach(() => {
    cicloService = new CicloService();
  });

  describe('calcularFaseAtual', () => {
    it('deve calcular fase menstrual corretamente', () => {
      const perfil = {
        dataUltimaMenstruacao: new Date('2025-01-21'),
        duracaoCiclo: 28
      };

      const fase = cicloService.calcularFaseAtual(perfil);

      expect(fase.fase).toBe('MENSTRUAL');
      expect(fase.diaCiclo).toBe(1);
    });

    it('deve calcular fase lútea corretamente', () => {
      const perfil = {
        dataUltimaMenstruacao: new Date('2025-01-01'),
        duracaoCiclo: 28
      };

      const fase = cicloService.calcularFaseAtual(perfil);

      expect(fase.fase).toBe('LUTEA');
      expect(fase.diaCiclo).toBe(21);
    });
  });
});
```

### 6.2 Testes de Integração (Supertest)
```typescript
// tests/integration/auth.test.ts
describe('POST /api/v1/auth/register', () => {
  it('deve registrar nova usuária com sucesso', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        nome: 'Maria Teste',
        email: 'maria@test.com',
        senha: 'Senha123!',
        dataNascimento: '1995-03-15'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('maria@test.com');
  });

  it('deve rejeitar email duplicado', async () => {
    // Criar primeira usuária
    await request(app).post('/api/v1/auth/register').send({ /* ... */ });

    // Tentar criar segunda com mesmo email
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ /* mesmo email */ });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email já cadastrado');
  });
});
```

---

## 7. DEPLOYMENT

### 7.1 Docker
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/app.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/cicloleve
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: cicloleve
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 7.2 CI/CD (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy API

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: docker build -t cicloleve-api .
      - run: docker push ghcr.io/cicloleve/api:latest
      - run: kubectl apply -f k8s/
```

---

## 8. MONITORAMENTO

### 8.1 Logs (Winston)
```typescript
// utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 8.2 Métricas (Prometheus)
```typescript
// middlewares/metrics.middleware.ts
import promClient from 'prom-client';

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode.toString()).observe(duration);
  });

  next();
}
```

---

## 9. CHECKLIST DE ENTREGA

**Infraestrutura:**
- [ ] Node.js 20+ com TypeScript configurado
- [ ] Express/Fastify com rotas organizadas
- [ ] Prisma ORM com migrations
- [ ] PostgreSQL configurado
- [ ] Redis para cache e sessions
- [ ] BullMQ para jobs
- [ ] Sentry para error tracking

**Endpoints:**
- [ ] Auth (register, login, refresh, logout)
- [ ] Perfil (GET, PUT)
- [ ] Ciclo (calcular fase, atualizar)
- [ ] Registros (CRUD, estatísticas)
- [ ] Conteúdo (listar, visualizar)
- [ ] Pagamentos (checkout, webhook)
- [ ] Notificações (preferências)

**Segurança:**
- [ ] JWT authentication
- [ ] Rate limiting
- [ ] Input validation (Zod)
- [ ] CORS configurado
- [ ] Helmet.js
- [ ] HTTPS obrigatório

**Performance:**
- [ ] Cache com Redis
- [ ] Índices no PostgreSQL
- [ ] Queries otimizadas
- [ ] Pagination em listas

**Testes:**
- [ ] Unit tests (cobertura > 80%)
- [ ] Integration tests
- [ ] Load tests (k6)

**Deploy:**
- [ ] Docker configurado
- [ ] CI/CD pipeline
- [ ] Logs estruturados
- [ ] Monitoring (Prometheus/Grafana)
- [ ] Backups automáticos

**Pronto para produção! 🚀**
