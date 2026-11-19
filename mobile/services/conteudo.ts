import type { MaterialIcons } from '@expo/vector-icons';

export type Fase = 'MENSTRUAL' | 'FOLICULAR' | 'OVULATORIA' | 'LUTEA';

export type ArtigoResumo = {
  id: string;
  slug: string;
  categoria: string;
  titulo: string;
  descricao: string | null;
  tempoLeituraMin: number | null;
  fasesAplicaveis: Fase[];
  premiumOnly: boolean;
  daFaseAtual: boolean;
  bloqueado: boolean;
};

export type ListaArtigos = { faseAtual: Fase | null; data: ArtigoResumo[] };

export type Artigo = ArtigoResumo & { conteudoMarkdown: string | null; autor: string | null };

export const NOME_FASE: Record<Fase, string> = {
  MENSTRUAL: 'Menstruação',
  FOLICULAR: 'Folicular',
  OVULATORIA: 'Ovulação',
  LUTEA: 'Lútea',
};

export const ICONE_CATEGORIA: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  Ciclo: 'autorenew',
  Sintomas: 'healing',
  Saúde: 'local-hospital',
  Alimentação: 'restaurant',
  Movimento: 'directions-walk',
  Sono: 'bedtime',
  Fertilidade: 'favorite',
};
