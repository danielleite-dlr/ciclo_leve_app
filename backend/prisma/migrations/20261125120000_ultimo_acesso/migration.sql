-- Ultima vez que a usuaria usou o app (qualquer chamada autenticada), para o painel de uso
ALTER TABLE "users" ADD COLUMN "ultimo_acesso" TIMESTAMP;
CREATE INDEX "users_ultimo_acesso_idx" ON "users"("ultimo_acesso");
