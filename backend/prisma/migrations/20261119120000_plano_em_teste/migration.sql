-- Marca se o plano atual esta no periodo de teste gratis
ALTER TABLE "users" ADD COLUMN "plano_em_teste" BOOLEAN NOT NULL DEFAULT false;
