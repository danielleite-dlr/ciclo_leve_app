import type { MaterialIcons } from '@expo/vector-icons';

// Lista unica de objetivos (onboarding + "Editar objetivos").
// `id` e o que fica salvo no backend (perfil_ciclo.objetivos) - nao renomear sem migrar os dados.
// `onboarding: true` = aparece tambem no onboarding; os demais so dentro do app.
export type Objetivo = {
  id: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onboarding: boolean;
};

export const OBJETIVOS: Objetivo[] = [
  { id: 'ENGRAVIDAR', title: 'Engravidar', icon: 'pregnant-woman', onboarding: true },
  { id: 'EVITAR_GRAVIDEZ', title: 'Evitar engravidar', icon: 'health-and-safety', onboarding: true },
  { id: 'EMAGRECER', title: 'Emagrecer', icon: 'monitor-weight', onboarding: true },
  { id: 'INCHACO', title: 'Reduzir inchaço', icon: 'water-drop', onboarding: true },
  { id: 'FOME', title: 'Controlar fome/compulsão', icon: 'restaurant-menu', onboarding: true },
  { id: 'HUMOR', title: 'Melhorar humor/TPM', icon: 'sentiment-very-satisfied', onboarding: true },
  { id: 'SONO', title: 'Dormir melhor', icon: 'bedtime', onboarding: false },
  { id: 'PELE', title: 'Melhorar pele/cabelo', icon: 'face', onboarding: false },
];

export const OBJETIVOS_ONBOARDING = OBJETIVOS.filter((o) => o.onboarding);

// Objetivos que nao podem ser escolhidos juntos (marcar um desmarca o outro).
export const OBJETIVOS_EXCLUSIVOS: [string, string][] = [['ENGRAVIDAR', 'EVITAR_GRAVIDEZ']];

/** Liga/desliga um objetivo respeitando os pares exclusivos. */
export function alternarObjetivo(selecionados: string[], id: string): string[] {
  if (selecionados.includes(id)) return selecionados.filter((x) => x !== id);
  const conflitos = OBJETIVOS_EXCLUSIVOS.filter((par) => par.includes(id)).flat().filter((x) => x !== id);
  return [...selecionados.filter((x) => !conflitos.includes(x)), id];
}
