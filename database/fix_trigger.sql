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
