-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "nome_completo" VARCHAR(255) NOT NULL,
    "data_nascimento" DATE NOT NULL,
    "altura_cm" SMALLINT,
    "peso_kg" DECIMAL(5,2),
    "email_verificado" BOOLEAN NOT NULL DEFAULT false,
    "verificacao_token" VARCHAR(100),
    "reset_password_token" VARCHAR(100),
    "reset_password_expires" TIMESTAMP,
    "ultimo_login" TIMESTAMP,
    "plano" VARCHAR(20) NOT NULL DEFAULT 'FREE',
    "plano_expira_em" TIMESTAMP,
    "trial_usado" BOOLEAN NOT NULL DEFAULT false,
    "consentimento_lgpd" BOOLEAN NOT NULL DEFAULT false,
    "consentimento_data" TIMESTAMP,
    "ip_consentimento" INET,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfil_ciclo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "modo_ciclo" VARCHAR(30) NOT NULL,
    "ciclo_regular" BOOLEAN NOT NULL DEFAULT true,
    "duracao_ciclo_dias" SMALLINT NOT NULL DEFAULT 28,
    "duracao_sangramento_dias" SMALLINT NOT NULL DEFAULT 5,
    "data_ultima_menstruacao" DATE NOT NULL,
    "objetivos" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perfil_ciclo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_diarios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "data_registro" DATE NOT NULL,
    "inchaco" SMALLINT,
    "fome_compulsao" SMALLINT,
    "humor_irritacao" SMALLINT,
    "qualidade_sono" SMALLINT,
    "peso_kg" DECIMAL(5,2),
    "temperatura_basal" DECIMAL(4,2),
    "notas" TEXT,
    "humor_tags" JSONB,
    "dia_ciclo" SMALLINT,
    "fase_ciclo" VARCHAR(20),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_diarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_menstrual" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "data_inicio" DATE NOT NULL,
    "data_fim" DATE,
    "duracao_dias" SMALLINT,
    "intensidade_fluxo" VARCHAR(20),
    "duracao_sangramento_dias" SMALLINT,
    "sintomas_predominantes" JSONB,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_menstrual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conteudo_educacional" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "categoria" VARCHAR(50) NOT NULL,
    "tipo" VARCHAR(30) NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "conteudo_markdown" TEXT,
    "thumbnail_url" VARCHAR(500),
    "tempo_leitura_min" SMALLINT,
    "fases_aplicaveis" JSONB,
    "premium_only" BOOLEAN NOT NULL DEFAULT false,
    "slug" VARCHAR(255),
    "tags" JSONB,
    "autor" VARCHAR(100),
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "visualizacoes" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "conteudo_educacional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interacoes_conteudo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "conteudo_id" UUID NOT NULL,
    "tipo_interacao" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interacoes_conteudo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes_push" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "horario_preferido" TIME,
    "dias_semana" JSONB DEFAULT '[1,2,3,4,5,6,7]',
    "fcm_token" VARCHAR(255),
    "apns_token" VARCHAR(255),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_push_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "valor_centavos" INTEGER NOT NULL,
    "moeda" VARCHAR(3) DEFAULT 'BRL',
    "gateway" VARCHAR(30) NOT NULL,
    "gateway_transaction_id" VARCHAR(255),
    "gateway_customer_id" VARCHAR(255),
    "tipo_pagamento" VARCHAR(30),
    "plano" VARCHAR(30),
    "status" VARCHAR(30) NOT NULL,
    "pago_em" TIMESTAMP,
    "expira_em" TIMESTAMP,
    "cancelado_em" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_analytics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "evento" VARCHAR(100) NOT NULL,
    "categoria" VARCHAR(50),
    "propriedades" JSONB,
    "sessao_id" UUID,
    "ip" INET,
    "user_agent" TEXT,
    "plataforma" VARCHAR(30),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_plano_plano_expira_em_idx" ON "users"("plano", "plano_expira_em");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_ciclo_user_id_key" ON "perfil_ciclo"("user_id");

-- CreateIndex
CREATE INDEX "perfil_ciclo_user_id_idx" ON "perfil_ciclo"("user_id");

-- CreateIndex
CREATE INDEX "registros_diarios_user_id_data_registro_idx" ON "registros_diarios"("user_id", "data_registro" DESC);

-- CreateIndex
CREATE INDEX "registros_diarios_user_id_fase_ciclo_data_registro_idx" ON "registros_diarios"("user_id", "fase_ciclo", "data_registro" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "registros_diarios_user_id_data_registro_key" ON "registros_diarios"("user_id", "data_registro");

-- CreateIndex
CREATE INDEX "historico_menstrual_user_id_data_inicio_idx" ON "historico_menstrual"("user_id", "data_inicio" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "conteudo_educacional_slug_key" ON "conteudo_educacional"("slug");

-- CreateIndex
CREATE INDEX "conteudo_educacional_categoria_publicado_idx" ON "conteudo_educacional"("categoria", "publicado");

-- CreateIndex
CREATE INDEX "conteudo_educacional_slug_idx" ON "conteudo_educacional"("slug");

-- CreateIndex
CREATE INDEX "interacoes_conteudo_user_id_tipo_interacao_idx" ON "interacoes_conteudo"("user_id", "tipo_interacao");

-- CreateIndex
CREATE UNIQUE INDEX "interacoes_conteudo_user_id_conteudo_id_tipo_interacao_key" ON "interacoes_conteudo"("user_id", "conteudo_id", "tipo_interacao");

-- CreateIndex
CREATE INDEX "notificacoes_push_user_id_idx" ON "notificacoes_push"("user_id");

-- CreateIndex
CREATE INDEX "pagamentos_user_id_status_idx" ON "pagamentos"("user_id", "status");

-- CreateIndex
CREATE INDEX "eventos_analytics_user_id_created_at_idx" ON "eventos_analytics"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "eventos_analytics_evento_created_at_idx" ON "eventos_analytics"("evento", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "perfil_ciclo" ADD CONSTRAINT "perfil_ciclo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_diarios" ADD CONSTRAINT "registros_diarios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_menstrual" ADD CONSTRAINT "historico_menstrual_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interacoes_conteudo" ADD CONSTRAINT "interacoes_conteudo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interacoes_conteudo" ADD CONSTRAINT "interacoes_conteudo_conteudo_id_fkey" FOREIGN KEY ("conteudo_id") REFERENCES "conteudo_educacional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes_push" ADD CONSTRAINT "notificacoes_push_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_analytics" ADD CONSTRAINT "eventos_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
