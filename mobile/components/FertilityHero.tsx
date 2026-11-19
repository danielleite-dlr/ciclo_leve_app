import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Colors } from '@/constants/Colors';
import { Ciclo, getFertilityStatus, hasFertileWindow } from '@/services/cycle';

export type FertilityGoal = 'ENGRAVIDAR' | 'EVITAR_GRAVIDEZ';

const fmt = (d: Date) => format(d, "d 'de' MMM", { locale: ptBR });
const dias = (n: number) => `${n} ${n === 1 ? 'dia' : 'dias'}`;

type Copy = {
  eyebrow: string;
  big: string;
  bigSecond?: string;
  sub: string;
  tone: 'fertile' | 'neutral';
  icon: keyof typeof MaterialIcons.glyphMap;
};

function buildCopy(goal: FertilityGoal, ciclo: Ciclo): Copy | null {
  const st = getFertilityStatus(ciclo);
  if (!st.fertileStart || !st.fertileEnd) return null;
  const range = `${fmt(st.fertileStart)} a ${fmt(st.fertileEnd)}`;

  const ovulationLine =
    st.daysToOvulation == null
      ? ''
      : st.daysToOvulation === 0
        ? 'Ovulação prevista para hoje'
        : st.daysToOvulation > 0
          ? `Ovulação em ${dias(st.daysToOvulation)}`
          : 'Ovulação já aconteceu neste ciclo';

  if (goal === 'ENGRAVIDAR') {
    if (st.inFertile) {
      const left = st.daysLeftInFertile ?? 0;
      return {
        tone: 'fertile',
        icon: 'favorite',
        eyebrow: st.today === 'ovulation' ? 'Sua melhor chance de engravidar é' : 'Sua chance de engravidar está alta',
        big: 'hoje',
        bigSecond: left > 0 ? `e por mais ${dias(left)}` : 'último dia fértil',
        sub: ovulationLine,
      };
    }
    // Fora da janela: se a menstruacao deste ciclo ainda nao veio, a proxima janela e no proximo ciclo.
    const afterWindow = st.today !== 'period' && st.daysToPeriod != null && st.daysToPeriod < (st.daysToFertile ?? 0);
    return {
      tone: 'neutral',
      icon: 'event',
      eyebrow: 'Seu período fértil começa em',
      big: dias(st.daysToFertile ?? 0),
      sub: afterWindow && st.nextPeriod
        ? `${range}. Menstruação prevista para ${fmt(st.nextPeriod)}. Se atrasar, faça um teste de gravidez.`
        : `${range} · ${ovulationLine.toLowerCase()}`,
    };
  }

  // EVITAR_GRAVIDEZ
  if (st.inFertile) {
    return {
      tone: 'fertile',
      icon: 'warning-amber',
      eyebrow: 'Atenção: você está no período fértil',
      big: 'Alta chance',
      bigSecond: 'de gravidez hoje',
      sub: `Até ${fmt(st.fertileEnd)}. Use proteção em todas as relações.`,
    };
  }
  return {
    tone: 'neutral',
    icon: 'shield',
    eyebrow: 'Seu próximo período fértil começa em',
    big: dias(st.daysToFertile ?? 0),
    sub: `${range}. Fora do período fértil a chance é menor, mas não é zero.`,
  };
}

export function FertilityHero({
  goal,
  ciclo,
  onPressCalendar,
}: {
  goal: FertilityGoal;
  ciclo: Ciclo;
  onPressCalendar?: () => void;
}) {
  const copy = buildCopy(goal, ciclo);
  if (!copy) return null;

  const fertile = copy.tone === 'fertile';
  const bg = fertile ? Colors.accent.light : Colors.primary.light;
  const strong = fertile ? Colors.accent.dark : Colors.primary.dark;
  const iconColor = fertile ? Colors.accent.DEFAULT : Colors.primary.DEFAULT;

  return (
    <View style={[styles.card, { backgroundColor: bg }]}>
      <View style={[styles.iconWrap, { backgroundColor: Colors.surface }]}>
        <MaterialIcons name={copy.icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
      <Text style={[styles.big, { color: strong }]}>{copy.big}</Text>
      {copy.bigSecond ? <Text style={[styles.bigSecond, { color: strong }]}>{copy.bigSecond}</Text> : null}
      {copy.sub ? <Text style={styles.sub}>{copy.sub}</Text> : null}

      {onPressCalendar ? (
        <TouchableOpacity onPress={onPressCalendar} style={styles.link} activeOpacity={0.7}>
          <Text style={[styles.linkText, { color: strong }]}>Ver no calendário</Text>
          <MaterialIcons name="chevron-right" size={18} color={strong} />
        </TouchableOpacity>
      ) : null}

      <Text style={styles.disclaimer}>
        {goal === 'EVITAR_GRAVIDEZ'
          ? 'Previsão estimada. Não substitui um método contraceptivo.'
          : 'Previsão estimada com base no seu ciclo.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  eyebrow: { fontSize: 16, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  big: { fontSize: 48, fontWeight: '900', textAlign: 'center', marginTop: 4, lineHeight: 54 },
  bigSecond: { fontSize: 26, fontWeight: '900', textAlign: 'center', lineHeight: 32 },
  sub: { fontSize: 14, color: Colors.text, textAlign: 'center', marginTop: 12, lineHeight: 20, opacity: 0.8 },
  link: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  linkText: { fontWeight: '800', fontSize: 14 },
  disclaimer: { fontSize: 11, color: Colors.textLight, textAlign: 'center', marginTop: 12 },
});

/** Objetivo de fertilidade da usuaria (null se nao escolheu ou se nao ha janela fertil previsivel). */
export function getFertilityGoal(ciclo: any): FertilityGoal | null {
  if (!hasFertileWindow(ciclo)) return null;
  const objetivos: string[] = Array.isArray(ciclo?.objetivos) ? ciclo.objetivos : [];
  if (objetivos.includes('ENGRAVIDAR')) return 'ENGRAVIDAR';
  if (objetivos.includes('EVITAR_GRAVIDEZ')) return 'EVITAR_GRAVIDEZ';
  return null;
}
