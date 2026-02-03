-- Enable crypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nome_completo VARCHAR(255) NOT NULL,
  data_nascimento DATE NOT NULL,
  altura_cm SMALLINT,
  peso_kg DECIMAL(5,2),
  
  -- Auth & Security
  email_verificado BOOLEAN DEFAULT false,
  verificacao_token VARCHAR(100),
  reset_password_token VARCHAR(100),
  reset_password_expires TIMESTAMP,
  ultimo_login TIMESTAMP,
  
  -- Subscription
  plano VARCHAR(20) DEFAULT 'FREE',
  plano_expira_em TIMESTAMP,
  trial_usado BOOLEAN DEFAULT false,
  
  -- LGPD
  consentimento_lgpd BOOLEAN DEFAULT false,
  consentimento_data TIMESTAMP,
  ip_consentimento INET,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_plano ON users(plano, plano_expira_em);

-- 2. PERFIL_CICLO
CREATE TABLE IF NOT EXISTS perfil_ciclo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Tipo de Ciclo
  modo_ciclo VARCHAR(30) NOT NULL,
  ciclo_regular BOOLEAN DEFAULT true,
  
  -- Parâmetros do Ciclo
  duracao_ciclo_dias SMALLINT DEFAULT 28,
  duracao_sangramento_dias SMALLINT DEFAULT 5,
  data_ultima_menstruacao DATE NOT NULL,
  
  -- Objetivos
  objetivos JSONB DEFAULT '[]',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id),
  CHECK (duracao_ciclo_dias BETWEEN 21 AND 45),
  CHECK (duracao_sangramento_dias BETWEEN 1 AND 10)
);

CREATE INDEX IF NOT EXISTS idx_perfil_ciclo_user ON perfil_ciclo(user_id);

-- 3. REGISTROS_DIARIOS
CREATE TABLE IF NOT EXISTS registros_diarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data_registro DATE NOT NULL,
  
  -- Sintomas (0-3)
  inchaco SMALLINT CHECK (inchaco BETWEEN 0 AND 3),
  fome_compulsao SMALLINT CHECK (fome_compulsao BETWEEN 0 AND 3),
  humor_irritacao SMALLINT CHECK (humor_irritacao BETWEEN 0 AND 3),
  qualidade_sono SMALLINT CHECK (qualidade_sono BETWEEN 0 AND 3),
  
  -- Métricas
  peso_kg DECIMAL(5,2),
  temperatura_basal DECIMAL(4,2),
  
  -- Observações
  notas TEXT,
  humor_tags JSONB,
  
  -- Calculated
  dia_ciclo SMALLINT,
  fase_ciclo VARCHAR(20),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, data_registro)
);

CREATE INDEX IF NOT EXISTS idx_registros_user_data ON registros_diarios(user_id, data_registro DESC);
CREATE INDEX IF NOT EXISTS idx_registros_user_fase ON registros_diarios(user_id, fase_ciclo, data_registro DESC);

-- 4. HISTORICO_MENSTRUAL
CREATE TABLE IF NOT EXISTS historico_menstrual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  data_inicio DATE NOT NULL,
  data_fim DATE,
  duracao_dias SMALLINT,
  intensidade_fluxo VARCHAR(20),
  duracao_sangramento_dias SMALLINT,
  sintomas_predominantes JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historico_user ON historico_menstrual(user_id, data_inicio DESC);

-- 5. CONTEUDO_EDUCACIONAL
CREATE TABLE IF NOT EXISTS conteudo_educacional (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  categoria VARCHAR(50) NOT NULL,
  tipo VARCHAR(30) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  conteudo_markdown TEXT,
  thumbnail_url VARCHAR(500),
  tempo_leitura_min SMALLINT,
  
  fases_aplicaveis JSONB,
  premium_only BOOLEAN DEFAULT false,
  
  slug VARCHAR(255) UNIQUE,
  tags JSONB,
  autor VARCHAR(100),
  publicado BOOLEAN DEFAULT false,
  
  visualizacoes INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_conteudo_categoria ON conteudo_educacional(categoria, publicado);
CREATE INDEX IF NOT EXISTS idx_conteudo_slug ON conteudo_educacional(slug);

-- 6. INTERACOES_CONTEUDO
CREATE TABLE IF NOT EXISTS interacoes_conteudo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conteudo_id UUID NOT NULL REFERENCES conteudo_educacional(id) ON DELETE CASCADE,
  
  tipo_interacao VARCHAR(20) NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, conteudo_id, tipo_interacao)
);

CREATE INDEX IF NOT EXISTS idx_interacoes_user ON interacoes_conteudo(user_id, tipo_interacao);

-- 7. NOTIFICACOES_PUSH
CREATE TABLE IF NOT EXISTS notificacoes_push (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  tipo VARCHAR(50) NOT NULL,
  habilitado BOOLEAN DEFAULT true,
  horario_preferido TIME DEFAULT '09:00:00',
  dias_semana JSONB DEFAULT '[1,2,3,4,5,6,7]',
  
  fcm_token VARCHAR(255),
  apns_token VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_user ON notificacoes_push(user_id);

-- 8. PAGAMENTOS
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  valor_centavos INTEGER NOT NULL,
  moeda VARCHAR(3) DEFAULT 'BRL',
  
  gateway VARCHAR(30) NOT NULL,
  gateway_transaction_id VARCHAR(255),
  gateway_customer_id VARCHAR(255),
  
  tipo_pagamento VARCHAR(30),
  plano VARCHAR(30),
  
  status VARCHAR(30) NOT NULL,
  
  pago_em TIMESTAMP,
  expira_em TIMESTAMP,
  cancelado_em TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_user ON pagamentos(user_id, status);

-- 9. EVENTOS_ANALYTICS
CREATE TABLE IF NOT EXISTS eventos_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  evento VARCHAR(100) NOT NULL,
  categoria VARCHAR(50),
  
  propriedades JSONB,
  sessao_id UUID,
  
  ip INET,
  user_agent TEXT,
  plataforma VARCHAR(30),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_user ON eventos_analytics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_evento ON eventos_analytics(evento, created_at DESC);

-- 10. AUDIT LOG & TRIGGER
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  tabela VARCHAR(50),
  operacao VARCHAR(10),
  user_id UUID,
  dados_antigos JSONB,
  dados_novos JSONB,
  ip INET,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Lógica para determinar o ID do usuário
  IF TG_TABLE_NAME = 'users' THEN
    IF TG_OP = 'DELETE' THEN
      target_user_id := OLD.id;
    ELSE
      target_user_id := NEW.id;
    END IF;
  ELSE
    -- Para outras tabelas que têm user_id
    IF TG_OP = 'DELETE' THEN
      target_user_id := OLD.user_id;
    ELSE
      target_user_id := NEW.user_id;
    END IF;
  END IF;

  INSERT INTO audit_log (tabela, operacao, user_id, dados_antigos, dados_novos)
  VALUES (
    TG_TABLE_NAME, 
    TG_OP, 
    target_user_id, 
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE row_to_json(OLD) END, 
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW) END
  );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to USERS table
DROP TRIGGER IF EXISTS audit_users ON users;
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- 11. LGPD ANONYMIZATION
CREATE OR REPLACE FUNCTION anonimizar_usuario(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET 
    email = 'anonimizado_' || id || '@cicloleve.com',
    nome_completo = 'Usuário Anonimizado',
    password_hash = '',
    data_nascimento = '1900-01-01',
    altura_cm = NULL,
    peso_kg = NULL,
    deleted_at = NOW()
  WHERE id = p_user_id;
  
  -- Clear sensitive data
  UPDATE registros_diarios SET notas = NULL WHERE user_id = p_user_id;
  UPDATE eventos_analytics SET user_id = NULL WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
