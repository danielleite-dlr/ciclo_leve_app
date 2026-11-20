# Deploy da API do CicloLeve na VPS

Instruções para quem for subir a API na VPS (pessoa ou Claude). O objetivo é deixar a API no ar com HTTPS
num endereço fixo, para o app Android/iOS de teste apontar para ele.

O que roda: API (Node/Express + Prisma), Postgres 15 e um backup diário do banco. Tudo em Docker,
definido em `deploy/docker-compose.yml`. Não há Redis: o backend não usa.

## Antes de começar: olhe a máquina

Não mude nada ainda. Confira e anote:

1. Docker e o plugin compose: `docker --version` e `docker compose version`. Se faltar, instale pelo
   repositório oficial do Docker para a distribuição (pergunte ao dono antes).
2. Quem usa as portas 80 e 443: `sudo ss -ltnp | grep -E ':(80|443) '`.
   - Livres: use o Caddy deste compose (perfil `caddy`), que faz o HTTPS sozinho.
   - Ocupadas por Nginx (ou outro proxy): não suba o Caddy. Configure um site novo nesse proxy
     apontando para `127.0.0.1:3000` (seção "Com Nginx" abaixo).
3. A porta 3000 no servidor: se já estiver em uso, escolha outra em `API_PORTA` no `.env`.
4. Memória livre (`free -h`). O build usa ~1 GB; com menos de 1 GB livre, crie swap antes.
5. Firewall (`sudo ufw status`). Se for mexer, libere SSH antes de qualquer outra regra.
   Só 22, 80 e 443 precisam estar abertas. Não abra 3000 nem 5432.

## Passo a passo

1. Clone o repositório (ou `git pull` se já existir) e entre em `deploy/`.
2. Peça ao dono o domínio da API (ex.: `api.dominio.com.br`) e confirme que o DNS aponta para esta VPS:
   `dig +short api.dominio.com.br` deve devolver o IP público da máquina.
3. Crie o `.env` a partir do modelo e gere os segredos aqui mesmo, na VPS:
   ```sh
   cp env.example .env
   sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$(openssl rand -hex 24)/" .env
   sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$(openssl rand -hex 32)/" .env
   sed -i "s/^JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$(openssl rand -hex 32)/" .env
   chmod 600 .env
   ```
   Preencha `API_DOMINIO`. Não mostre o conteúdo do `.env` em respostas nem o copie para fora da VPS.
4. Suba:
   - Com Caddy: `docker compose --profile caddy up -d --build`
   - Com Nginx da VPS: `docker compose up -d --build`
5. Carregue os artigos (uma vez, e de novo quando os textos mudarem):
   `docker compose run --rm migrate npx ts-node --transpile-only src/scripts/seed-conteudo.ts`
6. Confira:
   - `docker compose ps`: `api` (healthy), `postgres` (healthy), `backup` rodando, `migrate` saiu com 0.
   - `curl -s https://API_DOMINIO/health` devolve `{"status":"ok",...}`.
   - `curl -s -o /dev/null -w '%{http_code}' https://API_DOMINIO/api/v1/conteudo` devolve `401`.
   - `ls backups/` mostra o arquivo do dia.
7. Responda ao dono com a URL base para o app: `https://API_DOMINIO/api/v1`.

## Com Nginx (quando 80/443 já estão ocupadas)

Crie um site novo para o domínio da API, sem mexer nos sites que já existem:

```nginx
server {
    server_name api.dominio.com.br;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Teste com `sudo nginx -t`, recarregue e gere o certificado com `sudo certbot --nginx -d api.dominio.com.br`.

## Site (landing, privacidade, termos, suporte)

Páginas estáticas na pasta `site/` do repositório (HTML, CSS e imagens; sem build e sem Node).
Ficam em outro subdomínio, separado da API (ex.: `appcicloleve.atimoscrm.com.br`).

1. Confirme que o DNS do subdomínio aponta para esta VPS (`dig +short`).
2. Crie um site novo no Nginx, sem mexer nos existentes:
   ```nginx
   server {
       server_name appcicloleve.atimoscrm.com.br;
       root /CAMINHO/DO/REPOSITORIO/site;
       index index.html;
       location / { try_files $uri $uri.html $uri/ =404; }
       location ~* \.(css|svg|jpg|png)$ { expires 7d; }
   }
   ```
   O `try_files` com `$uri.html` faz `/privacidade` abrir `privacidade.html`.
3. `sudo nginx -t`, recarregue e gere o certificado: `sudo certbot --nginx -d appcicloleve.atimoscrm.com.br`.
4. Confira `https://appcicloleve.atimoscrm.com.br/`, `/privacidade`, `/termos` e `/suporte`.

Para atualizar o site depois, basta `git pull`: o Nginx serve os arquivos direto da pasta.

## Atualizar depois

```sh
git pull
cd deploy
docker compose up -d --build      # acrescente --profile caddy se usar o Caddy
```

As migrações novas rodam sozinhas antes de a API subir. Os dados ficam no volume `cicloleve_postgres_data`
e não são apagados pelo rebuild. Nunca rode `docker compose down -v`: o `-v` apaga o banco.

## Backup

Um arquivo por dia em `deploy/backups/`, guardado por 14 dias. Ele fica na própria VPS: se a máquina
se perder, o backup vai junto. Combine com o dono uma cópia para fora (outro servidor ou armazenamento).

Restaurar um backup (substitui os dados atuais, confirme com o dono antes):

```sh
gunzip -c backups/cicloleve-AAAA-MM-DD.sql.gz | docker compose exec -T postgres psql -U cicloleve -d cicloleve
```

## Se algo der errado

- `docker compose logs migrate`: erro de migração (geralmente senha ou URL do banco).
- `docker compose logs api`: a API não sobe sem `JWT_SECRET` e `JWT_REFRESH_SECRET`.
- `docker compose logs caddy`: certificado não sai quando o DNS ainda não aponta para a VPS
  ou a porta 80 está fechada.
