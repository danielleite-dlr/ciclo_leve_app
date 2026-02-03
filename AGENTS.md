# Ciclo Leve App — AGENTS.md (Operações do Projeto)

Guia operacional para rodar, testar e evoluir o **Ciclo Leve App**.

## Estrutura

- `mobile/` → Expo (expo-router) + NativeWind
- `backend/` → Node.js + Express + Prisma (Postgres) + Redis
- `docker-compose.yml` → Postgres + Redis + API

## Subir tudo (Docker)

```bash
cd /root/ciclo_leve_app

docker compose up -d --build

docker ps
```

Portas (host):
- API: http://localhost:3000
- Postgres: localhost:5433
- Redis: localhost:6379

## Backend (fora do docker — opcional)

```bash
cd /root/ciclo_leve_app/backend

npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Smoke test (API)

```bash
curl -i -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"nome":"Teste Teste","email":"teste+1@exemplo.com","senha":"teste123"}'
```

## Mobile (Expo)

```bash
cd /root/ciclo_leve_app/mobile

npm install
npx expo start -c
```

### Observações de rede (mobile ↔ backend)

- IPs privados (`192.168.x.x`) não funcionam em 4G/5G.
- Se o celular não acessa `http://<ip>:3000`, é firewall/isolamento → usar hotspot ou túnel.

#### Túnel do backend (ngrok)

```bash
ngrok http 3000
```

Depois configurar no mobile (sem mexer em código):
- criar `mobile/.env` (baseado no `mobile/.env.example`)
- definir:
  - `EXPO_PUBLIC_API_URL=https://<subdominio>.ngrok-free.app/api/v1`

## Time (agents)

- Comunicação: PT-BR
- Formato: bullets + checklist
- Aliases: @arq, @tl, @po, @sm, @ba, @dev, @ux, @qa, @devops
