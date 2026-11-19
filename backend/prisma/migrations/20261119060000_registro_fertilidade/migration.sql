-- Consentimento especifico para dados de relacao sexual e testes
ALTER TABLE "users" ADD COLUMN "consentimento_saude_sexual" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "consentimento_saude_sexual_data" TIMESTAMP;

-- Relacao sexual e testes (ovulacao/gravidez) por dia
CREATE TABLE "registros_fertilidade" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "data" DATE NOT NULL,
    "relacao" VARCHAR(20),
    "teste_ovulacao" VARCHAR(10),
    "teste_gravidez" VARCHAR(10),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_fertilidade_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "registros_fertilidade_user_id_data_key" ON "registros_fertilidade"("user_id", "data");
CREATE INDEX "registros_fertilidade_user_id_data_idx" ON "registros_fertilidade"("user_id", "data" DESC);

ALTER TABLE "registros_fertilidade" ADD CONSTRAINT "registros_fertilidade_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
