import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { gerarDica } from '@/services/dicaDoDia';

const PRIMARY = Colors.primary.DEFAULT;
const BG = Colors.background;

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
  const insets = useSafeAreaInsets();

  const inchaco = n(params.inchaco);
  const fome = n(params.fomeCompulsao);
  const humor = n(params.humorIrritacao);
  const sono = n(params.qualidadeSono);

  const tip = useMemo(
    () => ({
      badge: 'Seu Feedback Diário',
      ...gerarDica({ inchaco, fomeCompulsao: fome, humorIrritacao: humor, qualidadeSono: sono }),
    }),
    [fome, humor, inchaco, sono]
  );

  return (
    <View style={styles.screen}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
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
              <MaterialIcons name={tip.icon} size={18} color={PRIMARY} />
            </View>
            <Text style={styles.cardTitle}>{tip.cardTitle}</Text>
          </View>
          <Text style={styles.cardText}>{tip.cardText}</Text>
        </View>

        <View style={styles.extraRow}>
          <MaterialIcons name="psychology" size={20} color={PRIMARY} style={{ marginTop: 2 }} />
          <Text style={styles.extraText}>
            <Text style={styles.extraBold}>Dica Extra{'\n'}</Text>
            {tip.extra}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer} pointerEvents="box-none">
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(app)/home')}>
          <MaterialIcons name="check" size={22} color={Colors.onPrimary} />
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
    paddingBottom: 14,
    backgroundColor: 'rgba(246,243,244,0.92)',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.text,
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
    color: Colors.text,
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
    backgroundColor: 'rgba(227,124,150,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.text,
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
    backgroundColor: 'rgba(227,124,150,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(227,124,150,0.14)',
  },
  extraText: {
    flex: 1,
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 18,
  },
  extraBold: {
    fontWeight: '900',
    color: Colors.text,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: 'rgba(246,243,244,0.98)',
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
    color: Colors.onPrimary,
  },
});
