-- Seed Data for Conteudo Educacional

INSERT INTO conteudo_educacional (categoria, tipo, titulo, descricao, conteudo_markdown, tempo_leitura_min, fases_aplicaveis, publicado, premium_only) VALUES
-- Nutrição
('NUTRICAO', 'ARTIGO', 'Alimentos que aliviam a TPM', 'Descubra como magnésio e fibras ajudam a reduzir os sintomas.', '# Magnésio e Fibras\n\nAlimentos ricos em...', 5, '["LUTEA", "MENSTRUAL"]', true, false),
('NUTRICAO', 'DICA_RAPIDA', 'Chá de Gengibre', 'Ótimo para enjoos e cólicas.', 'Receita rápida...', 2, '["MENSTRUAL"]', true, false),

-- Exercício
('EXERCICIO', 'DICA_RAPIDA', 'Yoga para cólicas', '3 Posturas suaves para alívio imediato.', '## Postura do gato...', 3, '["MENSTRUAL"]', true, false),
('EXERCICIO', 'VIDEO', 'Treino HIIT para fase folicular', 'Aproveite sua alta energia!', 'Link do video...', 15, '["FOLICULAR"]', true, true),

-- Hormônios
('HORMONIOS', 'ARTIGO', 'Entendendo o estrogênio', 'Como esse hormônio afeta seu humor e energia.', '# Estrogênio...', 7, '["FOLICULAR", "OVULATORIA"]', true, true);
