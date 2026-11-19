import type { MaterialIcons } from '@expo/vector-icons';

// Sintomas do registro diario. A escala e sempre 0 a 3: 0 = sem queixa, 3 = queixa mais forte.
// Cada sintoma tem o proprio texto por nivel, para a usuaria entender o que esta marcando.
// Usado no Registro e nos Insights.

export type SintomaKey = 'inchaco' | 'fomeCompulsao' | 'humorIrritacao' | 'qualidadeSono';

export type Sintoma = {
  key: SintomaKey;
  titulo: string;
  pergunta: string;
  icone: keyof typeof MaterialIcons.glyphMap;
  niveis: [string, string, string, string];
};

export const SINTOMAS: Sintoma[] = [
  {
    key: 'inchaco',
    titulo: 'Inchaço',
    pergunta: 'Como está o inchaço?',
    icone: 'water-drop',
    niveis: ['Sem inchaço', 'Pouco inchada', 'Inchada', 'Muito inchada'],
  },
  {
    key: 'fomeCompulsao',
    titulo: 'Fome',
    pergunta: 'Como está a fome?',
    icone: 'restaurant',
    niveis: ['Fome normal', 'Um pouco mais de fome', 'Muita fome', 'Vontade de comer sem parar'],
  },
  {
    key: 'humorIrritacao',
    titulo: 'Humor',
    pergunta: 'Como está o humor?',
    icone: 'sentiment-satisfied',
    niveis: ['Tranquila', 'Um pouco irritada', 'Irritada', 'Muito irritada'],
  },
  {
    key: 'qualidadeSono',
    titulo: 'Sono',
    pergunta: 'Como você dormiu?',
    icone: 'bedtime',
    niveis: ['Dormi bem', 'Dormi razoável', 'Dormi mal', 'Quase não dormi'],
  },
];

export const nivelTexto = (key: SintomaKey, v: number) =>
  SINTOMAS.find((s) => s.key === key)?.niveis[Math.max(0, Math.min(3, Math.round(v)))] ?? String(v);
