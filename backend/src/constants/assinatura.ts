// Planos e modulos pagos. Precos em centavos (BRL).
// A compra ainda e simulada; quando a loja (App Store/Google Play) for integrada,
// os ids dos planos viram os ids dos produtos.

export type PlanoId = 'MENSAL' | 'ANUAL';

export interface Plano {
  id: PlanoId;
  nome: string;
  precoCentavos: number;
  periodo: 'mes' | 'ano';
  testeDias: number; // 0 = sem teste gratis
}

export const PLANOS: Plano[] = [
  { id: 'ANUAL', nome: 'Anual', precoCentavos: 8990, periodo: 'ano', testeDias: 7 },
  { id: 'MENSAL', nome: 'Mensal', precoCentavos: 1490, periodo: 'mes', testeDias: 0 },
];

export type ModuloId = 'RELATORIO' | 'HISTORICO_COMPLETO' | 'DICAS_ADAPTADAS' | 'FERTILIDADE' | 'BIBLIOTECA';

export interface Modulo {
  id: ModuloId;
  nome: string;
  descricao: string;
}

export const MODULOS: Modulo[] = [
  { id: 'DICAS_ADAPTADAS', nome: 'Dicas do dia ajustadas', descricao: 'O que fazer e evitar muda conforme o que você registrou.' },
  { id: 'FERTILIDADE', nome: 'Fertilidade', descricao: 'Dias férteis em destaque, registro de relações e testes.' },
  { id: 'HISTORICO_COMPLETO', nome: 'Histórico completo', descricao: 'Todos os seus ciclos e as estatísticas de regularidade.' },
  { id: 'RELATORIO', nome: 'Relatório para o médico', descricao: 'PDF com ciclos e sintomas para levar à consulta.' },
  { id: 'BIBLIOTECA', nome: 'Todos os artigos', descricao: 'Leituras sobre cada fase, sintomas e fertilidade.' },
];

// Modulos liberados no plano gratuito. Por enquanto nenhum; depois vira configuracao editavel.
export const MODULOS_GRATUITOS: ModuloId[] = [];
