# PRD - DATABASE: CicloLeve
**Banco de Dados para App de Controle Hormonal Feminino**

---

## 1. VISÃO GERAL

### 1.1 Objetivo do Banco de Dados
Estruturar e persistir dados de usuárias, perfis hormonais, registros diários de sintomas, histórico menstrual e conteúdo educacional do CicloLeve, garantindo integridade, escalabilidade e performance para até 1 milhão de usuárias.

### 1.2 Stack Recomendada
- **SGBD Principal**: PostgreSQL 15+ (relacional, ACID, jsonb, extensões)
- **Cache**: Redis (sessões, rankings, dados temporários)
- **Armazenamento de Arquivos**: AWS S3 / Cloudflare R2 (imagens, PDFs)
- **Backup**: Backup automático diário + snapshots incrementais
- **Observabilidade**: pganalyze ou Datadog para monitoramento

### 1.3 Princípios de Design
1. **Privacidade First**: Dados sensíveis de saúde exigem criptografia AES-256 em repouso
2. **Auditabilidade**: Todo registro tem created_at, updated_at e soft deletes
3. **Escalabilidade**: Particionamento de tabelas por data (histórico menstrual)
4. **Indexação Inteligente**: Índices compostos para queries frequentes
5. **LGPD/GDPR Compliant**: Campo de consentimento e anonimização

---

## 2. MODELO DE DADOS

### 2.1 ENTIDADES PRINCIPAIS

#### **USERS** (Usuárias)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- bcrypt
  nome_completo VARCHAR(255) NOT NULL,
  data_nascimento DATE NOT NULL,
  altura_cm SMALLINT, -- 100-250 cm
  peso_kg DECIMAL(5,2), -- opcional
  
  -- Auth & Security
  email_verificado BOOLEAN DEFAULT false,
  verificacao_token VARCHAR(100),
  reset_password_token VARCHAR(100),
  reset_password_expires TIMESTAMP,
  ultimo_login TIMESTAMP,
  
  -- Subscription
  plano VARCHAR(20) DEFAULT 'FREE', -- FREE, PREMIUM_MENSAL, PREMIUM_ANUAL
  plano_expira_em TIMESTAMP,
  trial_usado BOOLEAN DEFAULT false,
  
  -- LGPD
  consentimento_lgpd BOOLEAN DEFAULT false,
  consentimento_data TIMESTAMP,
  ip_consentimento INET,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP, -- soft delete
  
  -- Indexes
  INDEX idx_users_email (email),
  INDEX idx_users_plano (plano, plano_expira_em)
);
```

#### **PERFIL_CICLO** (Configuração do Ciclo Menstrual)
```sql
CREATE TABLE perfil_ciclo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Tipo de Ciclo
  modo_ciclo VARCHAR(30) NOT NULL, -- COM_CICLO, SEM_CICLO, MENOPAUSA, ANTICONCEPCIONAL
  ciclo_regular BOOLEAN DEFAULT true,
  
  -- Parâmetros do Ciclo
  duracao_ciclo_dias SMALLINT DEFAULT 28, -- 21-45 dias
  duracao_sangramento_dias SMALLINT DEFAULT 5, -- 1-10 dias
  data_ultima_menstruacao DATE NOT NULL,
  
  -- Objetivos (array JSON)
  objetivos JSONB DEFAULT '[]', -- ["EMAGRECER", "REDUZIR_INCHACO", "MELHORAR_HUMOR"]
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id),
  CHECK (duracao_ciclo_dias BETWEEN 21 AND 45),
  CHECK (duracao_sangramento_dias BETWEEN 1 AND 10)
);

CREATE INDEX idx_perfil_ciclo_user ON perfil_ciclo(user_id);
```

#### **REGISTROS_DIARIOS** (Sintomas e Acompanhamento)
```sql
CREATE TABLE registros_diarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data_registro DATE NOT NULL,
  
  -- Sintomas (escala 0-3)
  inchaco SMALLINT CHECK (inchaco BETWEEN 0 AND 3),
  fome_compulsao SMALLINT CHECK (fome_compulsao BETWEEN 0 AND 3),
  humor_irritacao SMALLINT CHECK (humor_irritacao BETWEEN 0 AND 3),
  qualidade_sono SMALLINT CHECK (qualidade_sono BETWEEN 0 AND 3), -- 0=ótimo, 3=péssimo
  
  -- Métricas opcionais
  peso_kg DECIMAL(5,2),
  temperatura_basal DECIMAL(4,2), -- 35.0-38.0°C (premium)
  
  -- Observações
  notas TEXT,
  humor_tags JSONB, -- ["ansiosa", "cansada", "produtiva"]
  
  -- Calculated
  dia_ciclo SMALLINT, -- calculado no backend
  fase_ciclo VARCHAR(20), -- MENSTRUAL, FOLICULAR, OVULATORIA, LUTEA
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, data_registro),
  INDEX idx_registros_user_data (user_id, data_registro DESC)
);

-- Particionamento por mês (performance com milhões de registros)
-- CREATE TABLE registros_diarios_2025_01 PARTITION OF registros_diarios
-- FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

#### **HISTORICO_MENSTRUAL** (Ciclos Completos)
```sql
CREATE TABLE historico_menstrual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Datas do ciclo
  data_inicio DATE NOT NULL,
  data_fim DATE,
  duracao_dias SMALLINT,
  
  -- Características do sangramento
  intensidade_fluxo VARCHAR(20), -- LEVE, MODERADO, INTENSO
  duracao_sangramento_dias SMALLINT,
  
  -- Sintomas predominantes
  sintomas_predominantes JSONB, -- ["colica", "enxaqueca", "inchaco"]
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_historico_user (user_id, data_inicio DESC)
);
```

#### **CONTEUDO_EDUCACIONAL** (Artigos, Dicas, Receitas)
```sql
CREATE TABLE conteudo_educacional (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Classificação
  categoria VARCHAR(50) NOT NULL, -- NUTRICAO, EXERCICIO, HORMONIOS, RECEITAS, TPM
  tipo VARCHAR(30) NOT NULL, -- ARTIGO, VIDEO, DICA_RAPIDA, RECEITA
  
  -- Conteúdo
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  conteudo_markdown TEXT,
  thumbnail_url VARCHAR(500),
  tempo_leitura_min SMALLINT,
  
  -- Segmentação
  fases_aplicaveis JSONB, -- ["FOLICULAR", "OVULATORIA"]
  premium_only BOOLEAN DEFAULT false,
  
  -- SEO & Metadata
  slug VARCHAR(255) UNIQUE,
  tags JSONB, -- ["magnesio", "alimentacao", "tpm"]
  autor VARCHAR(100),
  publicado BOOLEAN DEFAULT false,
  
  -- Analytics
  visualizacoes INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  INDEX idx_conteudo_categoria (categoria, publicado),
  INDEX idx_conteudo_slug (slug)
);
```

#### **INTERACOES_CONTEUDO** (Views, Likes, Favoritos)
```sql
CREATE TABLE interacoes_conteudo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conteudo_id UUID NOT NULL REFERENCES conteudo_educacional(id) ON DELETE CASCADE,
  
  tipo_interacao VARCHAR(20) NOT NULL, -- VIEW, LIKE, FAVORITE, SHARE
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, conteudo_id, tipo_interacao),
  INDEX idx_interacoes_user (user_id, tipo_interacao),
  INDEX idx_interacoes_conteudo (conteudo_id, tipo_interacao)
);
```

#### **NOTIFICACOES_PUSH** (Lembretes e Alertas)
```sql
CREATE TABLE notificacoes_push (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Configuração
  tipo VARCHAR(50) NOT NULL, -- REGISTRO_DIARIO, FASE_MUDANCA, DICA_DIA, PREMIUM_EXPIRA
  habilitado BOOLEAN DEFAULT true,
  horario_preferido TIME DEFAULT '09:00:00',
  dias_semana JSONB DEFAULT '[1,2,3,4,5,6,7]', -- 1=seg, 7=dom
  
  -- Tokens de dispositivo
  fcm_token VARCHAR(255), -- Firebase Cloud Messaging
  apns_token VARCHAR(255), -- Apple Push Notification
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_notif_user (user_id)
);
```

#### **PAGAMENTOS** (Assinaturas e Transações)
```sql
CREATE TABLE pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Dados da transação
  valor_centavos INTEGER NOT NULL, -- 1499 = R$ 14,99
  moeda VARCHAR(3) DEFAULT 'BRL',
  
  -- Gateway
  gateway VARCHAR(30) NOT NULL, -- STRIPE, MERCADOPAGO, PAGSEGURO
  gateway_transaction_id VARCHAR(255),
  gateway_customer_id VARCHAR(255),
  
  -- Tipo de pagamento
  tipo_pagamento VARCHAR(30), -- SUBSCRIPTION, ONE_TIME
  plano VARCHAR(30), -- PREMIUM_MENSAL, PREMIUM_ANUAL
  
  -- Status
  status VARCHAR(30) NOT NULL, -- PENDING, APPROVED, CANCELLED, REFUNDED
  
  -- Datas
  pago_em TIMESTAMP,
  expira_em TIMESTAMP,
  cancelado_em TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_pagamentos_user (user_id, status),
  INDEX idx_pagamentos_gateway (gateway_transaction_id)
);
```

#### **EVENTOS_ANALYTICS** (Rastreamento de Uso)
```sql
CREATE TABLE eventos_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Evento
  evento VARCHAR(100) NOT NULL, -- app_open, registro_criado, artigo_lido, upgrade_premium
  categoria VARCHAR(50), -- engagement, conversion, content
  
  -- Contexto
  propriedades JSONB, -- {"fase": "LUTEA", "sintoma_predominante": "inchaco"}
  sessao_id UUID,
  
  -- Metadata
  ip INET,
  user_agent TEXT,
  plataforma VARCHAR(30), -- web, ios, android
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_analytics_user (user_id, created_at DESC),
  INDEX idx_analytics_evento (evento, created_at DESC)
);

-- Particionamento por mês
```

---

## 3. QUERIES CRÍTICAS

### 3.1 Queries de Alta Frequência (otimizar)

#### **Q1: Buscar dados da home (perfil + registros recentes)**
```sql
-- Executada a cada abertura do app
SELECT 
  u.nome_completo,
  u.plano,
  pc.modo_ciclo,
  pc.duracao_ciclo_dias,
  pc.data_ultima_menstruacao,
  pc.objetivos,
  (SELECT json_agg(rd.* ORDER BY rd.data_registro DESC)
   FROM registros_diarios rd
   WHERE rd.user_id = u.id
   AND rd.data_registro >= CURRENT_DATE - INTERVAL '7 days'
  ) as registros_recentes
FROM users u
JOIN perfil_ciclo pc ON pc.user_id = u.id
WHERE u.id = $1 AND u.deleted_at IS NULL;

-- Otimização: índice composto + cache Redis (TTL 5min)
```

#### **Q2: Calcular fase atual do ciclo**
```sql
-- Lógica no backend, mas query de apoio
SELECT 
  data_ultima_menstruacao,
  duracao_ciclo_dias,
  EXTRACT(DAY FROM (CURRENT_DATE - data_ultima_menstruacao)) % duracao_ciclo_dias + 1 as dia_ciclo,
  CASE 
    WHEN dia_ciclo BETWEEN 1 AND 5 THEN 'MENSTRUAL'
    WHEN dia_ciclo BETWEEN 6 AND 12 THEN 'FOLICULAR'
    WHEN dia_ciclo BETWEEN 13 AND 16 THEN 'OVULATORIA'
    ELSE 'LUTEA'
  END as fase_atual
FROM perfil_ciclo
WHERE user_id = $1;
```

#### **Q3: Salvar registro diário (upsert)**
```sql
INSERT INTO registros_diarios (
  user_id, data_registro, inchaco, fome_compulsao, humor_irritacao, qualidade_sono, dia_ciclo, fase_ciclo
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8
)
ON CONFLICT (user_id, data_registro)
DO UPDATE SET
  inchaco = EXCLUDED.inchaco,
  fome_compulsao = EXCLUDED.fome_compulsao,
  humor_irritacao = EXCLUDED.humor_irritacao,
  qualidade_sono = EXCLUDED.qualidade_sono,
  updated_at = NOW();
```

#### **Q4: Buscar conteúdo educacional personalizado**
```sql
-- Filtrar por fase atual e objetivos da usuária
SELECT 
  ce.id,
  ce.titulo,
  ce.descricao,
  ce.thumbnail_url,
  ce.tempo_leitura_min,
  ce.categoria
FROM conteudo_educacional ce
WHERE ce.publicado = true
  AND ce.deleted_at IS NULL
  AND (ce.premium_only = false OR $2 = 'PREMIUM_MENSAL' OR $2 = 'PREMIUM_ANUAL')
  AND (ce.fases_aplicaveis IS NULL OR ce.fases_aplicaveis ? $3) -- fase atual
ORDER BY 
  CASE WHEN ce.categoria = ANY($4) THEN 0 ELSE 1 END, -- priorizar objetivos
  ce.created_at DESC
LIMIT 10;

-- $1 = user_id, $2 = plano, $3 = fase_atual, $4 = objetivos
```

### 3.2 Queries de Relatórios (Analytics)

#### **R1: Média de sintomas por fase (últimos 3 ciclos)**
```sql
SELECT 
  fase_ciclo,
  ROUND(AVG(inchaco), 2) as media_inchaco,
  ROUND(AVG(fome_compulsao), 2) as media_fome,
  ROUND(AVG(humor_irritacao), 2) as media_humor,
  ROUND(AVG(qualidade_sono), 2) as media_sono,
  COUNT(*) as dias_registrados
FROM registros_diarios
WHERE user_id = $1
  AND data_registro >= (SELECT data_ultima_menstruacao FROM perfil_ciclo WHERE user_id = $1) - INTERVAL '84 days'
GROUP BY fase_ciclo;
```

#### **R2: Taxa de engajamento (registro diário)**
```sql
SELECT 
  DATE_TRUNC('week', data_registro) as semana,
  COUNT(DISTINCT user_id) as usuarios_ativos,
  COUNT(*) as total_registros,
  ROUND(AVG(inchaco + fome_compulsao + humor_irritacao + qualidade_sono), 2) as intensidade_media
FROM registros_diarios
WHERE data_registro >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY semana
ORDER BY semana DESC;
```

---

## 4. SEGURANÇA E COMPLIANCE

### 4.1 Criptografia de Dados Sensíveis
```sql
-- Extensão pgcrypto para criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Exemplo: criptografar campo de notas médicas
UPDATE registros_diarios 
SET notas_encrypted = pgp_sym_encrypt(notas, 'chave-secreta-env-var')
WHERE notas IS NOT NULL;
```

### 4.2 Auditoria de Acessos (Trigger)
```sql
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  tabela VARCHAR(50),
  operacao VARCHAR(10), -- INSERT, UPDATE, DELETE
  user_id UUID,
  dados_antigos JSONB,
  dados_novos JSONB,
  ip INET,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (tabela, operacao, user_id, dados_antigos, dados_novos)
  VALUES (TG_TABLE_NAME, TG_OP, NEW.user_id, row_to_json(OLD), row_to_json(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em tabelas sensíveis
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

### 4.3 LGPD: Direito ao Esquecimento
```sql
-- Procedimento de anonimização
CREATE OR REPLACE FUNCTION anonimizar_usuario(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET 
    email = 'anonimizado_' || id || '@cicloleve.com',
    nome_completo = 'Usuário Anonimizado',
    password_hash = '',
    data_nascimento = NULL,
    altura_cm = NULL,
    peso_kg = NULL,
    deleted_at = NOW()
  WHERE id = p_user_id;
  
  -- Manter registros estatísticos (anonimizados)
  UPDATE registros_diarios SET notas = NULL WHERE user_id = p_user_id;
  UPDATE eventos_analytics SET user_id = NULL WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 5. PERFORMANCE E ESCALABILIDADE

### 5.1 Índices Recomendados
```sql
-- Composite indexes para queries frequentes
CREATE INDEX idx_registros_user_fase ON registros_diarios(user_id, fase_ciclo, data_registro DESC);
CREATE INDEX idx_conteudo_busca ON conteudo_educacional USING GIN(to_tsvector('portuguese', titulo || ' ' || descricao));
CREATE INDEX idx_eventos_categoria ON eventos_analytics(categoria, created_at) WHERE created_at >= CURRENT_DATE - INTERVAL '90 days';
```

### 5.2 Particionamento de Tabelas
```sql
-- Particionar registros_diarios por mês (reduz scan)
CREATE TABLE registros_diarios_2025_01 PARTITION OF registros_diarios
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Script para criar partições automaticamente
CREATE OR REPLACE FUNCTION criar_particao_mes(p_data DATE)
RETURNS VOID AS $$
DECLARE
  v_inicio DATE := DATE_TRUNC('month', p_data);
  v_fim DATE := v_inicio + INTERVAL '1 month';
  v_nome TEXT := 'registros_diarios_' || TO_CHAR(v_inicio, 'YYYY_MM');
BEGIN
  EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF registros_diarios FOR VALUES FROM (%L) TO (%L)', 
                 v_nome, v_inicio, v_fim);
END;
$$ LANGUAGE plpgsql;
```

### 5.3 Caching Strategy (Redis)
```
# Cache de sessão usuária (TTL 1h)
SET user:session:{user_id} "{...json...}" EX 3600

# Cache de fase atual (TTL 6h)
SET user:fase:{user_id} "LUTEA" EX 21600

# Cache de ranking de conteúdo (TTL 1h)
ZADD conteudo:ranking {score} {conteudo_id}
```

---

## 6. MIGRATIONS & SEED DATA

### 6.1 Migration Inicial (Sequelize/TypeORM)
```javascript
// migrations/001_create_core_tables.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(SQL_CREATE_USERS);
    await queryInterface.sequelize.query(SQL_CREATE_PERFIL_CICLO);
    await queryInterface.sequelize.query(SQL_CREATE_REGISTROS_DIARIOS);
    // ... outras tabelas
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('registros_diarios');
    await queryInterface.dropTable('perfil_ciclo');
    await queryInterface.dropTable('users');
  }
};
```

### 6.2 Seed de Conteúdo Educacional
```sql
INSERT INTO conteudo_educacional (categoria, tipo, titulo, descricao, conteudo_markdown, tempo_leitura_min, fases_aplicaveis, publicado) VALUES
('NUTRICAO', 'ARTIGO', 'Alimentos que aliviam a TPM', 'Descubra como magnésio e fibras ajudam', '# Magnésio...', 5, '["LUTEA"]', true),
('EXERCICIO', 'DICA_RAPIDA', 'Yoga para cólicas', 'Posturas suaves para alívio', '## Postura do gato...', 3, '["MENSTRUAL"]', true),
('HORMONIOS', 'ARTIGO', 'Entendendo o estrogênio', 'Como afeta humor e peso', '# Estrogênio...', 7, '["FOLICULAR", "OVULATORIA"]', true);
```

---

## 7. BACKUP E DISASTER RECOVERY

### 7.1 Estratégia de Backup
```bash
# Backup diário completo (3:00 AM)
0 3 * * * pg_dump -Fc cicloleve_prod > /backups/cicloleve_$(date +\%Y\%m\%d).dump

# Backup incremental (WAL archiving)
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backups/wal/%f'
```

### 7.2 Retenção
- **Daily backups**: 7 dias
- **Weekly backups**: 4 semanas
- **Monthly backups**: 12 meses
- **Yearly backups**: 3 anos (compliance)

---

## 8. MONITORAMENTO

### 8.1 Métricas Críticas
- Queries lentas (> 500ms) → alert
- Connection pool saturation (> 80%) → alert
- Disk usage (> 85%) → alert
- Replication lag (> 10s) → alert

### 8.2 Queries de Diagnóstico
```sql
-- Top 10 queries mais lentas
SELECT 
  calls,
  mean_exec_time,
  max_exec_time,
  query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Locks ativos
SELECT * FROM pg_locks WHERE NOT granted;

-- Tamanho das tabelas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 9. ROADMAP DE DADOS

### Fase 1 (MVP - 3 meses)
- ✅ Tabelas core (users, perfil_ciclo, registros_diarios)
- ✅ Autenticação e LGPD compliance
- ✅ Conteúdo educacional básico

### Fase 2 (6 meses)
- 📊 Analytics avançados (insights por IA)
- 🔔 Sistema de notificações inteligentes
- 💳 Integração com gateways de pagamento

### Fase 3 (12 meses)
- 🤝 Compartilhamento de dados com médicos
- 📈 Machine Learning para predição de sintomas
- 🌍 Multi-idioma e multi-região

---

## 10. CHECKLIST DE ENTREGA

**Para o backend team:**
- [ ] Scripts SQL de criação de tabelas
- [ ] Migrations versionadas (Sequelize/TypeORM)
- [ ] Seeds de dados de teste
- [ ] Documentação de queries principais
- [ ] Testes de carga (1M registros)
- [ ] Backup/restore procedure
- [ ] Monitoring dashboards (Grafana)
- [ ] Runbook de incidents

**Pronto para implementação! 🚀**
