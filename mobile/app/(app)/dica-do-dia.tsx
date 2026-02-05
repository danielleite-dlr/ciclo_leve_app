import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const PRIMARY = '#13ec5b';
const BG = '#F6F8F6';

type Params = {
  inchaco?: string;
  fomeCompulsao?: string;
  humorIrritacao?: string;
  qualidadeSono?: string;
};

function n(v?: string) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

export default function DicaDoDiaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();

  const inchaco = n(params.inchaco);
  const fome = n(params.fomeCompulsao);
  const humor = n(params.humorIrritacao);
  const sono = n(params.qualidadeSono);

  const tip = useMemo(() => {
    // MVP: regra simples baseada nos sintomas maiores.
    const scores = [
      { key: 'inchaco', label: 'inchaço', value: inchaco },
      { key: 'fome', label: 'fome/compulsão', value: fome },
      { key: 'humor', label: 'irritabilidade', value: humor },
      { key: 'sono', label: 'sono', value: sono },
    ].sort((a, b) => b.value - a.value);

    const top = scores[0];
    const second = scores[1];
    const basedOn = [top, second].filter((s) => s.value > 0).map((s) => s.label);

    const basedText = basedOn.length
      ? `Baseado no ${basedOn.map((x) => `"${x}"`).join(' e ')} que você relatou hoje.`
      : 'Baseado no seu registro de hoje.';

    // Conteúdo placeholder alinhado ao design.
    if (top.key === 'inchaco') {
      return {
        badge: 'Seu Feedback Diário',
        title: 'Priorize o seu conforto',
        basedText,
        cardIcon: 'water-drop' as const,
        cardTitle: 'Hidratação é a chave',
        cardText:
          'Para reduzir o inchaço, tente beber mais água ao longo do dia e evite alimentos ricos em sódio. Um chá de hibisco ou cavalinha também pode ajudar na retenção de líquidos.',
        extra:
          'Se sentir irritabilidade, reserve 10 minutos para respiração profunda antes de dormir.',
      };
    }

    if (top.key === 'sono') {
      return {
        badge: 'Seu Feedback Diário',
        title: 'Sono em primeiro lugar',
        basedText,
        cardIcon: 'bedtime' as const,
        cardTitle: 'Rotina de desaceleração',
        cardText:
          'Hoje, priorize uma rotina leve à noite: luz baixa, menos telas e um ritual curto (banho morno, leitura, respiração). Isso ajuda a melhorar a qualidade do sono.',
        extra:
          'Tente deitar 30 minutos mais cedo e evite cafeína após as 14h.',
      };
    }

    if (top.key === 'humor') {
      return {
        badge: 'Seu Feedback Diário',
        title: 'Seja gentil com você',
        basedText,
        cardIcon: 'self-improvement' as const,
        cardTitle: 'Pausas ajudam',
        cardText:
          'Quando perceber irritação, faça uma pausa curta: 3 minutos de respiração (4s inspira, 6s expira) e um copo de água. Pequenas pausas reduzem reatividade.',
        extra:
          'Se possível, planeje tarefas mais simples e deixe decisões complexas para amanhã.',
      };
    }

    // fome
    return {
      badge: 'Seu Feedback Diário',
      title: 'Foque em saciedade',
      basedText,
      cardIcon: 'restaurant' as const,
      cardTitle: 'Proteína + fibras',
      cardText:
        'Para reduzir picos de fome, combine proteína e fibras nas refeições (ex: iogurte + frutas + aveia, ou almoço com feijão e salada). Isso melhora saciedade ao longo do dia.',
      extra: 'Leve um lanche planejado para evitar beliscos por impulso.',
    };
  }, [fome, humor, inchaco, sono]);

  return (
    <View style={styles.screen}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={{ width: 40 }} />
        <Text style={styles.topTitle}>Dica do Dia</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconGlowWrap}>
          <View style={styles.iconGlow} />
          <View style={styles.iconCircle}>
            <MaterialIcons name="self-improvement" size={46} color={PRIMARY} />
          </View>
        </View>

        <View style={styles.centerText}>
          <Text style={styles.badge}>{tip.badge}</Text>
          <Text style={styles.h1}>{tip.title}</Text>
          <Text style={styles.sub}>
            {tip.basedText}{' '}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <MaterialIcons name={tip.cardIcon} size={18} color={PRIMARY} />
            </View>
            <Text style={styles.cardTitle}>{tip.cardTitle}</Text>
          </View>
          <Text style={styles.cardText}>{tip.cardText}</Text>
        </View>

        <View style={styles.extraRow}>
          <MaterialIcons name="psychology" size={20} color={PRIMARY} style={{ marginTop: 2 }} />
          <Text style={styles.extraText}>
            <Text style={styles.extraBold}>Dica Extra{String.fromCharCode(10)}</Text>
            {tip.extra}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer} pointerEvents="box-none">
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(app)/home')}>
          <MaterialIcons name="home" size={22} color="#102216" />
          <Text style={styles.btnText}>Entendi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 14,
    backgroundColor: 'rgba(246,248,246,0.92)',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111813',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlowWrap: {
    position: 'relative',
    marginBottom: 24,
  },
  iconGlow: {
    position: 'absolute',
    left: -30,
    right: -30,
    top: -30,
    bottom: -30,
    backgroundColor: PRIMARY,
    opacity: 0.15,
    borderRadius: 999,
    // blur not available; keep soft glow via opacity
  },
  iconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  centerText: {
    alignItems: 'center',
    marginBottom: 22,
  },
  badge: {
    fontSize: 12,
    fontWeight: '800',
    color: PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  h1: {
    fontSize: 30,
    fontWeight: '900',
    color: '#111813',
    textAlign: 'center',
    marginBottom: 10,
  },
  sub: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 300,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(19,236,91,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111813',
  },
  cardText: {
    color: '#4B5563',
    lineHeight: 22,
    fontSize: 15,
  },
  extraRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(19,236,91,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(19,236,91,0.14)',
  },
  extraText: {
    flex: 1,
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 18,
  },
  extraBold: {
    fontWeight: '900',
    color: '#111813',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: 'rgba(246,248,246,0.98)',
  },
  btn: {
    height: 56,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    shadowColor: PRIMARY,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  btnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#102216',
  },
});
