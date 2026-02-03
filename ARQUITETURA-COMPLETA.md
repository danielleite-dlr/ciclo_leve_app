# ARQUITETURA TÉCNICA - CicloLeve
**Sistema Completo: Frontend, Backend, Infraestrutura e Integrações**

---

## 📐 VISÃO GERAL DA ARQUITETURA

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CAMADA DE CLIENTES                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Web App    │  │  iOS Native  │  │Android Native│              │
│  │  (Next.js)   │  │(React Native)│  │(React Native)│              │
│  │  PWA Ready   │  │    Expo      │  │    Expo      │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                  │                  │                       │
│         └──────────────────┴──────────────────┘                      │
│                            │                                          │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
                    HTTPS (TLS 1.3)
                             │
┌────────────────────────────▼──────────────────────────────────────────┐
│                     CAMADA DE EDGE/CDN                                │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │               Cloudflare / AWS CloudFront                     │   │
│  │  • SSL/TLS Termination                                        │   │
│  │  • DDoS Protection                                            │   │
│  │  • WAF (Web Application Firewall)                            │   │
│  │  • Cache de assets estáticos (imagens, CSS, JS)             │   │
│  │  • Rate Limiting (100 req/min por IP)                        │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                               │                                        │
└───────────────────────────────┼────────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────────┐
│                     CAMADA DE APLICAÇÃO                                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    Load Balancer (Nginx)                        │  │
│  │  • Round-robin distribution                                     │  │
│  │  • Health checks                                                │  │
│  │  • SSL passthrough                                              │  │
│  └────────────────┬─────────────────┬──────────────────────────────┘  │
│                   │                 │                                  │
│         ┌─────────▼────────┐  ┌────▼──────────────┐                  │
│         │   API Server 1   │  │   API Server 2    │                  │
│         │   (Node.js)      │  │   (Node.js)       │                  │
│         │   Express/Fastify│  │   Express/Fastify │  [Auto-scaling]  │
│         │   Port: 3000     │  │   Port: 3000      │                  │
│         └─────────┬────────┘  └────┬──────────────┘                  │
│                   │                 │                                  │
│         ┌─────────▼─────────────────▼──────────────┐                  │
│         │        Service Mesh (Opcional)           │                  │
│         │        • Inter-service communication     │                  │
│         │        • Circuit breakers                │                  │
│         └──────────────────────────────────────────┘                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
┌───────────────────▼───────┐   ┌───────────▼──────────────────┐
│   CAMADA DE SERVIÇOS      │   │   CAMADA DE WORKERS          │
├───────────────────────────┤   ├──────────────────────────────┤
│                           │   │                               │
│  ┌──────────────────┐    │   │  ┌────────────────────────┐  │
│  │  Auth Service    │    │   │  │  Notification Worker   │  │
│  │  • JWT           │    │   │  │  (BullMQ Consumer)     │  │
│  │  • OAuth2        │    │   │  │  • Push notifications  │  │
│  │  • Sessions      │    │   │  │  • Email sender        │  │
│  └──────────────────┘    │   │  └────────────────────────┘  │
│                           │   │                               │
│  ┌──────────────────┐    │   │  ┌────────────────────────┐  │
│  │  Ciclo Service   │    │   │  │  Analytics Worker      │  │
│  │  • Calc fase     │    │   │  │  (BullMQ Consumer)     │  │
│  │  • Predictions   │    │   │  │  • Event processing    │  │
│  └──────────────────┘    │   │  │  • Data aggregation    │  │
│                           │   │  └────────────────────────┘  │
│  ┌──────────────────┐    │   │                               │
│  │ Content Service  │    │   │  ┌────────────────────────┐  │
│  │  • Articles      │    │   │  │  Cache Cleanup Worker  │  │
│  │  • Recommendations│   │   │  │  (BullMQ Consumer)     │  │
│  └──────────────────┘    │   │  │  • TTL management      │  │
│                           │   │  └────────────────────────┘  │
│  ┌──────────────────┐    │   │                               │
│  │ Payment Service  │    │   └───────────────────────────────┘
│  │  • Stripe        │    │
│  │  • Webhooks      │    │
│  └──────────────────┘    │
│                           │
└───────────┬───────────────┘
            │
┌───────────▼────────────────────────────────────────────────────────┐
│                      CAMADA DE DADOS                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────┐   ┌──────────────────┐   ┌──────────────┐ │
│  │   PostgreSQL 15    │   │   Redis 7        │   │   BullMQ     │ │
│  │   (Primary DB)     │   │   (Cache/Session)│   │   (Queue)    │ │
│  │                    │   │                  │   │              │ │
│  │  • Users           │   │  • Session store │   │  • Jobs      │ │
│  │  • Perfil Ciclo    │   │  • Cache layer   │   │  • Schedules │ │
│  │  • Registros       │   │  • Rate limiting │   │  • Retries   │ │
│  │  • Conteudo        │   │  • Pub/Sub       │   │              │ │
│  │  • Pagamentos      │   │                  │   │              │ │
│  │                    │   │  Port: 6379      │   │  Port: 6379  │ │
│  │  Port: 5432        │   │                  │   │              │ │
│  │                    │   │                  │   │              │ │
│  │  ┌──────────────┐ │   └──────────────────┘   └──────────────┘ │
│  │  │Read Replicas │ │                                             │
│  │  │(Opcional)    │ │                                             │
│  │  └──────────────┘ │                                             │
│  └────────────────────┘                                             │
│                                                                      │
│  ┌────────────────────┐   ┌──────────────────┐                     │
│  │   AWS S3 / R2      │   │   Elasticsearch  │                     │
│  │  (File Storage)    │   │  (Search/Logs)   │                     │
│  │                    │   │   [Opcional]     │                     │
│  │  • Images          │   │                  │                     │
│  │  • PDFs            │   │  • Full-text     │                     │
│  │  • Exports         │   │  • Log analytics │                     │
│  │  • Backups         │   │                  │                     │
│  └────────────────────┘   └──────────────────┘                     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│                   CAMADA DE INTEGRAÇÕES EXTERNAS                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │   Stripe    │  │   SendGrid  │  │   Firebase   │  │ PostHog  │ │
│  │  (Payments) │  │   (Email)   │  │   (FCM/Push) │  │(Analytics)│ │
│  └─────────────┘  └─────────────┘  └──────────────┘  └──────────┘ │
│                                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │   Sentry    │  │   DataDog   │  │    Twilio    │  │  Apple   │ │
│  │   (Errors)  │  │ (Monitoring)│  │    (SMS)     │  │  Health  │ │
│  └─────────────┘  └─────────────┘  └──────────────┘  └──────────┘ │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ ARQUITETURA DETALHADA POR CAMADA

### 1. CAMADA DE CLIENTES (Frontend)

```
┌─────────────────────────────────────────────────────────────────┐
│                         WEB APPLICATION                          │
│                        (Next.js 14 + React 18)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  App Router Structure:                                           │
│  ├── app/                                                        │
│  │   ├── (auth)/                    ← Auth routes              │
│  │   │   ├── login/                                             │
│  │   │   ├── cadastro/                                          │
│  │   │   └── recuperar-senha/                                   │
│  │   │                                                           │
│  │   ├── (dashboard)/               ← Protected routes          │
│  │   │   ├── home/                                              │
│  │   │   ├── historico/                                         │
│  │   │   ├── conteudo/                                          │
│  │   │   └── perfil/                                            │
│  │   │                                                           │
│  │   ├── onboarding/                ← First-time setup          │
│  │   ├── api/                       ← API routes (BFF pattern) │
│  │   └── layout.tsx                 ← Root layout              │
│  │                                                               │
│  ├── components/                                                 │
│  │   ├── ui/                        ← shadcn/ui components     │
│  │   ├── features/                  ← Feature components       │
│  │   └── layouts/                   ← Layout components        │
│  │                                                               │
│  ├── lib/                                                        │
│  │   ├── api-client.ts              ← Fetch wrapper            │
│  │   ├── storage.ts                 ← Local/session storage    │
│  │   └── utils.ts                   ← Helper functions         │
│  │                                                               │
│  └── stores/                         ← Zustand global state     │
│      ├── user-store.ts                                          │
│      ├── ciclo-store.ts                                         │
│      └── registro-store.ts                                      │
│                                                                   │
│  State Management:                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Zustand Store                                            │  │
│  │  ├── User State (auth, profile)                          │  │
│  │  ├── Ciclo State (fase, diaCiclo, perfil)                │  │
│  │  ├── Registro State (cache de registros recentes)        │  │
│  │  └── UI State (modals, notifications)                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Data Flow:                                                      │
│  Component → Store Action → API Call → Backend → DB             │
│      ↑                                    ↓                       │
│      └────────── Update Store ←──────────┘                      │
│                                                                   │
│  Caching Strategy:                                               │
│  • React Query for server state                                 │
│  • SWR for data fetching (stale-while-revalidate)              │
│  • Service Worker for offline support                           │
│  • IndexedDB for large datasets (historical data)              │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       MOBILE APPLICATION                         │
│                   (React Native + Expo)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Navigation Structure:                                           │
│  ├── src/                                                        │
│  │   ├── navigation/                                            │
│  │   │   ├── AuthNavigator.tsx      ← Login/Cadastro          │
│  │   │   ├── AppNavigator.tsx       ← Tab navigation          │
│  │   │   └── OnboardingNavigator.tsx                           │
│  │   │                                                           │
│  │   ├── screens/                                               │
│  │   │   ├── auth/                                              │
│  │   │   ├── home/                                              │
│  │   │   ├── registro/                                          │
│  │   │   └── perfil/                                            │
│  │   │                                                           │
│  │   ├── components/                ← Shared components        │
│  │   ├── services/                  ← API, storage, etc        │
│  │   ├── hooks/                     ← Custom React hooks       │
│  │   └── stores/                    ← Zustand stores           │
│  │                                                               │
│  │  Native Features:                                            │
│  │  ├── Push Notifications (Expo Notifications)                │
│  │  ├── Local Storage (AsyncStorage)                           │
│  │  ├── Background Sync (Background Fetch)                     │
│  │  ├── Biometric Auth (Expo LocalAuthentication)             │
│  │  └── Health Integrations (HealthKit/Google Fit)            │
│  │                                                               │
│  └── Platform-Specific:                                         │
│      ├── iOS: Xcode project, App Store Connect                 │
│      └── Android: Android Studio, Google Play Console          │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

### 2. CAMADA DE BACKEND (API)

```
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                              │
│                  (Node.js 20 + TypeScript)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Project Structure:                                              │
│  ├── src/                                                        │
│  │   ├── app.ts                     ← Express app setup        │
│  │   ├── server.ts                  ← Server entry point       │
│  │   │                                                           │
│  │   ├── routes/                    ← Route definitions        │
│  │   │   ├── index.ts               ← Main router              │
│  │   │   ├── auth.routes.ts                                    │
│  │   │   ├── perfil.routes.ts                                  │
│  │   │   ├── ciclo.routes.ts                                   │
│  │   │   ├── registro.routes.ts                                │
│  │   │   ├── conteudo.routes.ts                                │
│  │   │   └── payment.routes.ts                                 │
│  │   │                                                           │
│  │   ├── controllers/               ← Request handlers         │
│  │   │   ├── auth.controller.ts                                │
│  │   │   ├── perfil.controller.ts                              │
│  │   │   ├── ciclo.controller.ts                               │
│  │   │   ├── registro.controller.ts                            │
│  │   │   ├── conteudo.controller.ts                            │
│  │   │   └── payment.controller.ts                             │
│  │   │                                                           │
│  │   ├── services/                  ← Business logic           │
│  │   │   ├── auth.service.ts                                   │
│  │   │   ├── ciclo.service.ts                                  │
│  │   │   ├── recommendation.service.ts                         │
│  │   │   ├── notification.service.ts                           │
│  │   │   └── payment.service.ts                                │
│  │   │                                                           │
│  │   ├── middlewares/               ← Express middlewares      │
│  │   │   ├── auth.middleware.ts                                │
│  │   │   ├── validation.middleware.ts                          │
│  │   │   ├── rate-limit.middleware.ts                          │
│  │   │   └── error.middleware.ts                               │
│  │   │                                                           │
│  │   ├── models/                    ← Prisma schema            │
│  │   │   └── schema.prisma                                     │
│  │   │                                                           │
│  │   ├── utils/                     ← Helper functions         │
│  │   │   ├── jwt.ts                                            │
│  │   │   ├── bcrypt.ts                                         │
│  │   │   ├── logger.ts                                         │
│  │   │   └── date.ts                                           │
│  │   │                                                           │
│  │   ├── jobs/                      ← Background workers       │
│  │   │   ├── notificacoes-diarias.job.ts                      │
│  │   │   ├── calcular-fase.job.ts                             │
│  │   │   └── limpar-cache.job.ts                              │
│  │   │                                                           │
│  │   ├── config/                    ← Configuration            │
│  │   │   ├── database.ts                                       │
│  │   │   ├── redis.ts                                          │
│  │   │   └── env.ts                                            │
│  │   │                                                           │
│  │   └── types/                     ← TypeScript types         │
│  │       └── index.d.ts                                         │
│  │                                                               │
│  └── tests/                         ← Test files               │
│      ├── unit/                                                   │
│      ├── integration/                                            │
│      └── e2e/                                                    │
│                                                                   │
│  Request Flow:                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  1. HTTP Request                                          │  │
│  │     ↓                                                      │  │
│  │  2. Middlewares (auth, validation, rate-limit)           │  │
│  │     ↓                                                      │  │
│  │  3. Router → Controller                                   │  │
│  │     ↓                                                      │  │
│  │  4. Service Layer (business logic)                       │  │
│  │     ↓                                                      │  │
│  │  5. Data Access (Prisma ORM)                             │  │
│  │     ↓                                                      │  │
│  │  6. Database Query                                        │  │
│  │     ↓                                                      │  │
│  │  7. Response (JSON)                                       │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

### 3. CAMADA DE DADOS

```
┌─────────────────────────────────────────────────────────────────┐
│                      POSTGRESQL DATABASE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Database Schema (10 tabelas principais):                        │
│                                                                   │
│  ┌───────────────┐         ┌──────────────────┐                 │
│  │     users     │◄────┬───│  perfil_ciclo    │                 │
│  │               │     │   │                  │                 │
│  │  id           │     │   │  user_id (FK)    │                 │
│  │  email        │     │   │  modo_ciclo      │                 │
│  │  password_hash│     │   │  duracao_ciclo   │                 │
│  │  plano        │     │   │  data_ultima_mens│                 │
│  │  plano_expira │     │   └──────────────────┘                 │
│  └───────┬───────┘     │                                         │
│          │             │   ┌──────────────────┐                 │
│          │             ├───│registros_diarios │                 │
│          │             │   │                  │                 │
│          │             │   │  user_id (FK)    │                 │
│          │             │   │  data_registro   │                 │
│          │             │   │  inchaco         │                 │
│          │             │   │  fome_compulsao  │                 │
│          │             │   │  humor_irritacao │                 │
│          │             │   │  qualidade_sono  │                 │
│          │             │   │  fase_ciclo      │                 │
│          │             │   └──────────────────┘                 │
│          │             │                                         │
│          │             │   ┌──────────────────┐                 │
│          │             ├───│   pagamentos     │                 │
│          │             │   │                  │                 │
│          │             │   │  user_id (FK)    │                 │
│          │             │   │  valor_centavos  │                 │
│          │             │   │  gateway         │                 │
│          │             │   │  status          │                 │
│          │             │   └──────────────────┘                 │
│          │             │                                         │
│          │             │   ┌──────────────────┐                 │
│          │             └───│notificacoes_push │                 │
│          │                 │                  │                 │
│          │                 │  user_id (FK)    │                 │
│          │                 │  fcm_token       │                 │
│          │                 │  habilitado      │                 │
│          │                 └──────────────────┘                 │
│          │                                                       │
│          │                 ┌──────────────────┐                 │
│          └─────────────────│eventos_analytics │                 │
│                            │                  │                 │
│                            │  user_id (FK)    │                 │
│                            │  evento          │                 │
│                            │  propriedades    │                 │
│                            └──────────────────┘                 │
│                                                                   │
│  ┌──────────────────┐     ┌──────────────────┐                 │
│  │conteudo_educacion│     │interacoes_conteud│                 │
│  │                  │◄────│                  │                 │
│  │  id              │     │  user_id (FK)    │                 │
│  │  titulo          │     │  conteudo_id (FK)│                 │
│  │  categoria       │     │  tipo_interacao  │                 │
│  │  premium_only    │     └──────────────────┘                 │
│  └──────────────────┘                                           │
│                                                                   │
│  Indexes (Performance):                                          │
│  • idx_users_email (UNIQUE)                                     │
│  • idx_perfil_ciclo_user (UNIQUE)                               │
│  • idx_registros_user_data (user_id, data_registro DESC)       │
│  • idx_conteudo_categoria_publicado (categoria, publicado)     │
│  • idx_eventos_user_created (user_id, created_at DESC)         │
│                                                                   │
│  Partitioning:                                                   │
│  • registros_diarios: Partitioned by month (2025_01, 2025_02)  │
│  • eventos_analytics: Partitioned by month                      │
│                                                                   │
│  Backup Strategy:                                                │
│  • Daily full backup (3:00 AM)                                  │
│  • WAL archiving (continuous)                                   │
│  • Retention: 7 daily, 4 weekly, 12 monthly                    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        REDIS CACHE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Cache Strategy:                                                 │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Key Pattern                  │ TTL     │ Usage          │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  user:session:{userId}        │ 1 hour  │ JWT sessions   │  │
│  │  perfil:{userId}              │ 1 hour  │ Profile cache  │  │
│  │  fase:{userId}                │ 6 hours │ Current phase  │  │
│  │  registros:{userId}           │ 30 min  │ Recent logs    │  │
│  │  conteudo:list:{filters}      │ 15 min  │ Content lists  │  │
│  │  rate-limit:{ip}:{endpoint}   │ 15 min  │ Rate limiting  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Data Structures:                                                │
│  • Strings: Simple key-value (session tokens)                   │
│  • Hashes: Complex objects (user profile)                       │
│  • Sets: Unique lists (active users)                            │
│  • Sorted Sets: Leaderboards, rankings                          │
│  • Lists: Queues (job processing)                               │
│                                                                   │
│  Pub/Sub:                                                        │
│  • Channel: fase-mudanca → Notify clients of phase change       │
│  • Channel: notificacao-push → Trigger push notifications       │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      BULLMQ JOB QUEUE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Queue: notificacoes-diarias                                     │
│  ├── Job: enviar-notificacao                                    │
│  │   ├── Data: { userId, hora }                                 │
│  │   ├── Cron: Individual per user                              │
│  │   └── Worker: NotificationWorker                             │
│  │                                                               │
│  Queue: analytics                                                │
│  ├── Job: processar-eventos                                     │
│  │   ├── Data: { evento, userId, timestamp }                    │
│  │   ├── Priority: Low                                          │
│  │   └── Worker: AnalyticsWorker                                │
│  │                                                               │
│  Queue: cache-management                                         │
│  ├── Job: limpar-cache-expirado                                 │
│  │   ├── Cron: 0 3 * * * (daily at 3 AM)                       │
│  │   └── Worker: CacheCleanupWorker                             │
│  │                                                               │
│  Queue: fase-calculation                                         │
│  ├── Job: recalcular-fase                                       │
│  │   ├── Data: { userId }                                       │
│  │   ├── Trigger: Midnight daily                                │
│  │   └── Worker: FaseCalculationWorker                          │
│  │                                                               │
│  Job Lifecycle:                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  1. Job Added to Queue                                    │  │
│  │     ↓                                                      │  │
│  │  2. Worker picks job (FIFO or Priority)                  │  │
│  │     ↓                                                      │  │
│  │  3. Process job (with retries if fail)                   │  │
│  │     ↓                                                      │  │
│  │  4. Complete or Failed                                    │  │
│  │     ↓                                                      │  │
│  │  5. Log result, emit event                               │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Retry Strategy:                                                 │
│  • Attempts: 3                                                   │
│  • Backoff: Exponential (1s, 10s, 60s)                         │
│  • Dead Letter Queue: For permanently failed jobs               │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

### 4. FLUXO DE DADOS COMPLETO

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     FLUXO: REGISTRO DIÁRIO                               │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Usuária    │  1. Abre app
│   (Mobile)   │  2. Navega para "Registro"
└──────┬───────┘  3. Preenche sintomas (sliders)
       │          4. Clica "Salvar"
       │
       │ POST /api/v1/registros
       │ {
       │   inchaco: 2,
       │   fomeCompulsao: 1,
       │   humorIrritacao: 2,
       │   qualidadeSono: 1
       │ }
       ↓
┌──────────────────────────────────────────────────────────────────────┐
│  API Gateway (Cloudflare)                                            │
│  • Verifica rate limit                                               │
│  • SSL/TLS termination                                               │
│  • WAF rules                                                         │
└──────┬───────────────────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────────────────────────┐
│  Load Balancer (Nginx)                                               │
│  • Seleciona API Server (round-robin)                                │
│  • Health check                                                      │
└──────┬───────────────────────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────────────────────────┐
│  API Server (Node.js + Express)                                      │
│                                                                       │
│  1. auth.middleware.ts                                               │
│     • Verifica JWT token                                             │
│     • Extrai userId                                                  │
│     • Anexa user ao request                                          │
│                                                                       │
│  2. validation.middleware.ts                                         │
│     • Valida schema com Zod                                          │
│     • Verifica tipos e ranges (0-3)                                  │
│                                                                       │
│  3. registro.controller.ts                                           │
│     • Recebe request validado                                        │
│     • Chama registro.service.ts                                      │
│                                                                       │
│  4. registro.service.ts                                              │
│     ├─► Busca perfil do ciclo (cache Redis ou DB)                  │
│     ├─► Calcula fase atual (ciclo.service.ts)                       │
│     ├─► Cria/atualiza registro no DB (Prisma)                       │
│     ├─► Gera recomendações (recommendation.service.ts)              │
│     └─► Invalida caches relevantes                                  │
│                                                                       │
└──────┬───────────────────────────────────────────────────────────────┘
       │
       ├─► 5. PostgreSQL
       │      • UPSERT em registros_diarios
       │      • INSERT em eventos_analytics
       │
       ├─► 6. Redis
       │      • DEL registros:{userId}
       │      • SET fase:{userId} (atualizar)
       │
       └─► 7. BullMQ
              • ADD job analytics (async)
              • ADD job notificacao (se sintoma crítico)
       
       ↓ RESPONSE
┌──────────────────────────────────────────────────────────────────────┐
│  201 Created                                                         │
│  {                                                                    │
│    "registro": { ... },                                              │
│    "recomendacoes": {                                                │
│      "dicasExtras": [                                                │
│        "💧 Hoje: água + caminhada + reduzir ultraprocessado."       │
│      ]                                                               │
│    }                                                                 │
│  }                                                                   │
└──────┬───────────────────────────────────────────────────────────────┘
       │
       ↓
┌──────────────┐
│   Usuária    │  • Vê confirmação
│   (Mobile)   │  • Recebe dicas personalizadas
└──────────────┘  • UI atualiza histórico


┌─────────────────────────────────────────────────────────────────────────┐
│                     FLUXO: CÁLCULO DE FASE                               │
└─────────────────────────────────────────────────────────────────────────┘

[Trigger: Midnight Daily Job ou Request de Perfil]

┌──────────────────────────────────────────────────────────────────────┐
│  BullMQ Worker: fase-calculation                                     │
│                                                                       │
│  1. Job: recalcular-fase { userId }                                 │
│     ↓                                                                │
│  2. Busca perfil_ciclo do DB                                         │
│     • data_ultima_menstruacao                                        │
│     • duracao_ciclo                                                  │
│     ↓                                                                │
│  3. Calcula dia do ciclo:                                            │
│     diaCiclo = ((hoje - ultimaMenst) % duracaoCiclo) + 1            │
│     ↓                                                                │
│  4. Identifica fase:                                                 │
│     if (diaCiclo <= 5) fase = MENSTRUAL                             │
│     else if (diaCiclo <= 12) fase = FOLICULAR                       │
│     else if (diaCiclo <= 16) fase = OVULATORIA                      │
│     else fase = LUTEA                                                │
│     ↓                                                                │
│  5. Cache no Redis:                                                  │
│     SET fase:{userId} JSON.stringify({ fase, diaCiclo })            │
│     EXPIRE fase:{userId} 21600 (6 horas)                            │
│     ↓                                                                │
│  6. Se mudança de fase detectada:                                    │
│     • ADD job notificar-mudanca-fase                                 │
│     • Log evento em analytics                                        │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                  FLUXO: NOTIFICAÇÃO PUSH DIÁRIA                          │
└─────────────────────────────────────────────────────────────────────────┘

[Trigger: 9:00 AM (horário configurado por usuária)]

┌──────────────────────────────────────────────────────────────────────┐
│  BullMQ Worker: notificacoes-diarias                                 │
│                                                                       │
│  1. Job: enviar-notificacao { userId, hora }                        │
│     ↓                                                                │
│  2. Busca notificacoes_push do DB                                    │
│     • Verifica se habilitado                                         │
│     • Obtém fcm_token                                                │
│     ↓                                                                │
│  3. Busca fase atual (Redis cache ou calcula)                        │
│     ↓                                                                │
│  4. Monta mensagem personalizada:                                    │
│     title: "Bom dia! Você está na fase LUTEA"                       │
│     body: "Registre como você está se sentindo hoje 💚"             │
│     data: { screen: "registro" }                                     │
│     ↓                                                                │
│  5. Envia via Firebase Cloud Messaging:                              │
│     fcm.send({ token, notification, data })                          │
│     ↓                                                                │
│  6. Log resultado:                                                   │
│     • Success: Log em analytics                                      │
│     • Failure: Retry (3 attempts) ou mark token invalid             │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

                            ↓
┌──────────────┐
│   Usuária    │  • Recebe notificação no celular
│   (Mobile)   │  • Toca notificação → abre app na tela registro
└──────────────┘
```

---

### 5. SEGURANÇA E AUTENTICAÇÃO

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FLUXO DE AUTENTICAÇÃO                             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Usuária    │  POST /api/v1/auth/login
└──────┬───────┘  { email, senha }
       ↓
┌──────────────────────────────────────────────────────────────────────┐
│  auth.controller.ts                                                  │
│                                                                       │
│  1. Busca user por email:                                            │
│     SELECT * FROM users WHERE email = ? AND deleted_at IS NULL       │
│     ↓                                                                │
│  2. Verifica senha (bcrypt):                                         │
│     bcrypt.compare(senhaInput, user.password_hash)                   │
│     ↓                                                                │
│  3. Gera JWT tokens:                                                 │
│     ┌─────────────────────────────────────────────────┐            │
│     │  Access Token (7 dias)                          │            │
│     │  {                                               │            │
│     │    userId: "uuid",                               │            │
│     │    email: "user@example.com",                    │            │
│     │    plano: "PREMIUM_ANUAL"                        │            │
│     │  }                                               │            │
│     │  Signed with: JWT_SECRET                         │            │
│     │  Algorithm: HS256                                │            │
│     └─────────────────────────────────────────────────┘            │
│                                                                       │
│     ┌─────────────────────────────────────────────────┐            │
│     │  Refresh Token (30 dias)                        │            │
│     │  {                                               │            │
│     │    userId: "uuid",                               │            │
│     │    tokenId: "random_uuid"                        │            │
│     │  }                                               │            │
│     │  Signed with: JWT_REFRESH_SECRET                │            │
│     └─────────────────────────────────────────────────┘            │
│     ↓                                                                │
│  4. Armazena refresh token no Redis:                                 │
│     SET refresh:{userId}:{tokenId} 1 EX 2592000 (30 dias)           │
│     ↓                                                                │
│  5. Atualiza ultimo_login:                                           │
│     UPDATE users SET ultimo_login = NOW() WHERE id = ?              │
│     ↓                                                                │
└──────┬───────────────────────────────────────────────────────────────┘
       │
       ↓ RESPONSE
┌──────────────────────────────────────────────────────────────────────┐
│  200 OK                                                              │
│  {                                                                    │
│    "user": { id, nome, email, plano },                               │
│    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",              │
│    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."        │
│  }                                                                   │
└──────┬───────────────────────────────────────────────────────────────┘
       │
       ↓
┌──────────────┐
│   Cliente    │  • Armazena token em localStorage/SecureStore
└──────────────┘  • Usa em todas as requests: Authorization: Bearer {token}


┌─────────────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE DE AUTENTICAÇÃO                            │
└─────────────────────────────────────────────────────────────────────────┘

[Toda request para endpoints protegidos passa por:]

┌──────────────────────────────────────────────────────────────────────┐
│  auth.middleware.ts                                                  │
│                                                                       │
│  1. Extrai token do header:                                          │
│     const token = req.headers.authorization?.replace('Bearer ', '') │
│     ↓                                                                │
│  2. Verifica e decodifica JWT:                                       │
│     jwt.verify(token, JWT_SECRET)                                    │
│     ↓                                                                │
│  3. Valida claims:                                                   │
│     • Token expirado? → 401 Unauthorized                            │
│     • Assinatura inválida? → 401 Unauthorized                       │
│     ↓                                                                │
│  4. Busca usuária:                                                   │
│     const user = await db.user.findUnique({ id: decoded.userId })   │
│     ↓                                                                │
│  5. Validações adicionais:                                           │
│     • User deletada? → 401                                          │
│     • Email não verificado? → 403 (para endpoints críticos)         │
│     ↓                                                                │
│  6. Anexa user ao request:                                           │
│     req.user = user                                                  │
│     ↓                                                                │
│  7. next() → Passa para o controller                                │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                       RATE LIMITING                                      │
└─────────────────────────────────────────────────────────────────────────┘

[Implementado com Redis + express-rate-limit]

┌──────────────────────────────────────────────────────────────────────┐
│  Rate Limit Strategy:                                                │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Endpoint                │ Window  │ Max Requests         │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │  /api/v1/*               │ 15 min  │ 100 req/IP           │    │
│  │  /api/v1/auth/login      │ 15 min  │ 5 req/IP (failed)    │    │
│  │  /api/v1/auth/register   │ 1 hour  │ 3 req/IP             │    │
│  │  /api/v1/registros       │ 1 min   │ 10 req/user          │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  Implementation:                                                     │
│  Redis Keys:                                                         │
│    rate-limit:{ip}:{endpoint} → Counter                             │
│    INCR rate-limit:192.168.1.1:/auth/login                          │
│    EXPIRE rate-limit:192.168.1.1:/auth/login 900                    │
│                                                                       │
│  Response when exceeded:                                             │
│    429 Too Many Requests                                             │
│    { "error": "Muitas requisições, tente em 5 minutos" }           │
│    Headers:                                                          │
│      X-RateLimit-Limit: 100                                          │
│      X-RateLimit-Remaining: 0                                        │
│      X-RateLimit-Reset: 1642867200                                   │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 6. DEPLOY E INFRAESTRUTURA

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  PRODUCTION ENVIRONMENT                                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Frontend (Vercel):                                                  │
│  ├── Next.js App (SSR/SSG)                                           │
│  ├── Automatic deployments from git main                             │
│  ├── Edge functions (API routes)                                     │
│  ├── CDN caching (static assets)                                     │
│  └── Custom domain: cicloleve.com                                    │
│                                                                       │
│  Backend (AWS ECS / Fly.io):                                         │
│  ├── Docker containers                                               │
│  │   ├── API Server (Node.js) x3 instances                          │
│  │   ├── Worker Server (BullMQ) x2 instances                        │
│  │   └── Auto-scaling (CPU > 70%)                                   │
│  ├── Load Balancer (ALB)                                             │
│  └── Health checks (/health endpoint)                                │
│                                                                       │
│  Database (AWS RDS / Supabase):                                      │
│  ├── PostgreSQL 15                                                   │
│  ├── Instance: db.t3.medium (2 vCPU, 4GB RAM)                       │
│  ├── Storage: 100GB SSD (auto-scaling)                              │
│  ├── Backups: Daily automated                                        │
│  └── Read replicas: 1 (for analytics queries)                       │
│                                                                       │
│  Cache (AWS ElastiCache / Upstash):                                  │
│  ├── Redis 7.x                                                       │
│  ├── Instance: cache.t3.micro (0.5GB memory)                        │
│  └── Replication: Multi-AZ                                           │
│                                                                       │
│  Storage (AWS S3 / Cloudflare R2):                                   │
│  ├── Bucket: cicloleve-uploads                                       │
│  ├── CDN: CloudFront distribution                                    │
│  └── Lifecycle: Archive after 90 days                                │
│                                                                       │
│  Monitoring:                                                         │
│  ├── Sentry (error tracking)                                         │
│  ├── DataDog (APM, logs, metrics)                                   │
│  ├── Grafana + Prometheus (dashboards)                              │
│  └── PagerDuty (on-call alerts)                                      │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  CI/CD PIPELINE (GitHub Actions)                                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  On Push to main branch:                                             │
│                                                                       │
│  1. Lint & Type Check                                                │
│     └─► ESLint + TypeScript                                         │
│                                                                       │
│  2. Unit Tests                                                       │
│     └─► Jest (coverage > 80%)                                       │
│                                                                       │
│  3. Integration Tests                                                │
│     └─► Supertest (API endpoints)                                   │
│                                                                       │
│  4. Build                                                            │
│     ├─► Frontend: next build                                        │
│     └─► Backend: docker build                                       │
│                                                                       │
│  5. Security Scan                                                    │
│     └─► Snyk (dependency vulnerabilities)                           │
│                                                                       │
│  6. Deploy                                                           │
│     ├─► Frontend → Vercel (automatic)                               │
│     ├─► Backend → AWS ECS (via docker push)                         │
│     └─► Run migrations (Prisma)                                     │
│                                                                       │
│  7. Smoke Tests                                                      │
│     └─► Ping production endpoints                                   │
│                                                                       │
│  8. Notify                                                           │
│     └─► Slack channel #deployments                                  │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  DOCKER COMPOSE (Local Development)                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  version: '3.8'                                                      │
│                                                                       │
│  services:                                                           │
│    api:                                                              │
│      build: ./backend                                                │
│      ports: ["3000:3000"]                                            │
│      environment:                                                    │
│        DATABASE_URL: postgresql://user:pass@postgres:5432/cicloleve │
│        REDIS_URL: redis://redis:6379                                 │
│      depends_on: [postgres, redis]                                  │
│                                                                       │
│    worker:                                                           │
│      build: ./backend                                                │
│      command: npm run worker                                         │
│      depends_on: [postgres, redis]                                  │
│                                                                       │
│    postgres:                                                         │
│      image: postgres:15-alpine                                       │
│      ports: ["5432:5432"]                                            │
│      volumes: [postgres_data:/var/lib/postgresql/data]              │
│                                                                       │
│    redis:                                                            │
│      image: redis:7-alpine                                           │
│      ports: ["6379:6379"]                                            │
│                                                                       │
│  volumes:                                                            │
│    postgres_data:                                                    │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📊 DIAGRAMAS DE SEQUÊNCIA

### Sequência: Primeiro Acesso

```
Usuária    Frontend     API Gateway    Backend     Database    Redis
   │           │             │            │           │          │
   │  Abre app │             │            │           │          │
   ├──────────>│             │            │           │          │
   │           │             │            │           │          │
   │           │ GET /health │            │           │          │
   │           ├────────────>│            │           │          │
   │           │             │ Check      │           │          │
   │           │             ├───────────>│           │          │
   │           │             │            │ SELECT 1  │          │
   │           │             │            ├──────────>│          │
   │           │             │            │<──────────┤          │
   │           │             │<───────────┤           │          │
   │           │<────────────┤            │           │          │
   │           │  200 OK     │            │           │          │
   │<──────────┤             │            │           │          │
   │           │             │            │           │          │
   │  Cadastro │             │            │           │          │
   ├──────────>│             │            │           │          │
   │           │ POST /auth/register      │           │          │
   │           ├────────────>│            │           │          │
   │           │             │ Validate   │           │          │
   │           │             ├───────────>│           │          │
   │           │             │            │ Hash pwd  │          │
   │           │             │            │ INSERT    │          │
   │           │             │            ├──────────>│          │
   │           │             │            │<──────────┤          │
   │           │             │            │ Gen JWT   │          │
   │           │             │            │ Store     │          │
   │           │             │            ├─────────────────────>│
   │           │             │            │<─────────────────────┤
   │           │             │<───────────┤           │          │
   │           │<────────────┤            │           │          │
   │<──────────┤  201 + JWT  │            │           │          │
   │           │             │            │           │          │
   │ Onboard.  │             │            │           │          │
   ├──────────>│             │            │           │          │
   │           │ PUT /perfil/ciclo        │           │          │
   │           ├────────────>│            │           │          │
   │           │             │ Auth check │           │          │
   │           │             ├───────────>│           │          │
   │           │             │            │ UPSERT    │          │
   │           │             │            ├──────────>│          │
   │           │             │            │ Cache     │          │
   │           │             │            ├─────────────────────>│
   │           │             │<───────────┤           │          │
   │           │<────────────┤            │           │          │
   │<──────────┤  200 OK     │            │           │          │
   │           │             │            │           │          │
```

---

## 🔧 TECNOLOGIAS E FERRAMENTAS

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TECH STACK COMPLETO                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Frontend:                                                           │
│  ├── React 18.x                    (UI library)                     │
│  ├── Next.js 14.x                  (Framework SSR/SSG)              │
│  ├── TypeScript 5.x                (Type safety)                    │
│  ├── Tailwind CSS 3.x              (Styling)                        │
│  ├── shadcn/ui                     (Component library)              │
│  ├── Zustand                       (State management)               │
│  ├── React Hook Form               (Forms)                          │
│  ├── Zod                           (Validation)                     │
│  ├── Recharts                      (Charts)                         │
│  ├── React Native + Expo           (Mobile apps)                    │
│  └── PWA (Workbox)                 (Offline support)                │
│                                                                      │
│  Backend:                                                            │
│  ├── Node.js 20.x                  (Runtime)                        │
│  ├── Express.js / Fastify          (Web framework)                  │
│  ├── TypeScript 5.x                (Type safety)                    │
│  ├── Prisma                        (ORM)                            │
│  ├── PostgreSQL 15                 (Database)                       │
│  ├── Redis 7                       (Cache/Queue)                    │
│  ├── BullMQ                        (Job queue)                      │
│  ├── JWT (jsonwebtoken)            (Auth)                           │
│  ├── bcrypt                        (Password hashing)               │
│  ├── Zod                           (Validation)                     │
│  └── Winston                       (Logging)                        │
│                                                                      │
│  Infraestrutura:                                                     │
│  ├── Docker                        (Containerization)               │
│  ├── GitHub Actions                (CI/CD)                          │
│  ├── Vercel                        (Frontend hosting)               │
│  ├── AWS ECS / Fly.io              (Backend hosting)                │
│  ├── AWS RDS / Supabase            (Managed PostgreSQL)             │
│  ├── AWS ElastiCache / Upstash     (Managed Redis)                  │
│  ├── Cloudflare / AWS CloudFront   (CDN)                            │
│  └── AWS S3 / R2                   (Object storage)                 │
│                                                                      │
│  Integrações:                                                        │
│  ├── Stripe                        (Payments)                       │
│  ├── SendGrid / Resend             (Email)                          │
│  ├── Firebase FCM                  (Push notifications)             │
│  ├── PostHog                       (Product analytics)              │
│  ├── Sentry                        (Error tracking)                 │
│  ├── DataDog                       (APM/Logs)                       │
│  └── Twilio                        (SMS - opcional)                 │
│                                                                      │
│  Desenvolvimento:                                                    │
│  ├── VS Code                       (IDE)                            │
│  ├── ESLint + Prettier             (Code quality)                   │
│  ├── Husky + lint-staged           (Git hooks)                      │
│  ├── Jest                          (Unit tests)                     │
│  ├── Supertest                     (Integration tests)              │
│  ├── Playwright                    (E2E tests)                      │
│  └── Postman / Insomnia            (API testing)                    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📝 CONCLUSÃO

Esta arquitetura foi projetada para:

✅ **Escalabilidade**: Suporta de 1k a 1M+ usuárias
✅ **Performance**: < 200ms response time (P95)
✅ **Disponibilidade**: 99.9% uptime (3 nines)
✅ **Segurança**: LGPD/GDPR compliant, criptografia end-to-end
✅ **Observabilidade**: Logs, metrics, traces completos
✅ **Manutenibilidade**: Código limpo, documentado, testado

**Próximos passos**: Implementar seguindo os PRDs técnicos (Database, Frontend, Backend) 🚀
