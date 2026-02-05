import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Calendar as CalendarIcon, Droplets } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import api from '@/services/api';

type PerfilResponse = {
  user: { nomeCompleto?: string };
  ciclo: any | null;
  faseAtual: { nomeFase?: string; diaCiclo?: number } | null;
};

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);

  const userFirstName = useMemo(() => {
    const full = (perfil?.user?.nomeCompleto || '').trim();
    const first = full.split(' ').filter(Boolean)[0];
    return first || 'Olá';
  }, [perfil]);

  const cycleDay = perfil?.faseAtual?.diaCiclo ?? 0;
  const cyclePhase = perfil?.faseAtual?.nomeFase ?? '—';

  const fetchPerfil = useCallback(async () => {
    try {
      const res = await api.get('/perfil');
      setPerfil(res.data);

      // Gate: se não há ciclo/perfil, manda pro onboarding
      if (!res.data?.ciclo) {
        router.replace('/(onboarding)/dados-corpo');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        'Erro ao carregar',
        error.response?.data?.message || error.response?.data?.error || 'Não foi possível carregar seu perfil.'
      );
    }
  }, [router]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchPerfil();
      setLoading(false);
    })();
  }, [fetchPerfil]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPerfil();
    setRefreshing(false);
  }, [fetchPerfil]);

  const PhaseCard = ({ title, active }: { title: string; active?: boolean }) => (
    <View style={[styles.phaseChip, active ? styles.phaseChipActive : null]}>
      <Text style={[styles.phaseChipText, active ? styles.phaseChipTextActive : null]}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Olá, {userFirstName}</Text>
          <Text style={styles.headline}>
            Hoje é o <Text style={styles.headlineAccent}>Dia {cycleDay || '—'}</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.bellButton}>
          <Bell size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Main Cycle Display */}
      <View style={styles.centerBlock}>
        <View style={styles.circle}>
          <View style={styles.circleArc} />
          <Text style={styles.circleDay}>{cycleDay || '—'}</Text>
          <Text style={styles.circleLabel}>Dia do Ciclo</Text>
          <Text style={styles.circlePhase}>Fase {cyclePhase}</Text>
        </View>
        <Text style={styles.centerText}>
          Sua fase atual é <Text style={styles.centerTextAccent}>{cyclePhase}</Text>.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.primaryAction} onPress={() => router.push('/(app)/registro')}>
          <Droplets color="#FFFFFF" size={20} style={styles.actionIcon} />
          <Text style={styles.primaryActionText}>Registrar Sintoma</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryAction} onPress={() => router.push('/(app)/calendario')}>
          <CalendarIcon color={Colors.text} size={20} />
        </TouchableOpacity>
      </View>

      {/* Cycle Phases Scroll */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seu Ciclo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <PhaseCard title="Menstruação" />
          <PhaseCard title="Folicular" />
          <PhaseCard title="Ovulatória" active />
          <PhaseCard title="Lútea" />
        </ScrollView>
      </View>

      {/* Daily Tip (mínimo viável) */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Dica do Dia</Text>
        <Text style={styles.tipText}>
          {cyclePhase === '—'
            ? 'Complete seu onboarding para ver recomendações personalizadas.'
            : `Hoje você está na fase ${cyclePhase}. Hidrate-se, priorize sono e ajuste sua rotina conforme sua energia.`}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F3F4F6',
    paddingBottom: 24,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  hello: {
    fontSize: 12,
    color: '#6B7280',
  },
  headline: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  headlineAccent: {
    color: '#0D9488',
  },
  bellButton: {
    padding: 10,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  centerBlock: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  circle: {
    width: 256,
    height: 256,
    borderRadius: 128,
    borderWidth: 6,
    borderColor: '#CCFBF1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circleArc: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 128,
    borderWidth: 6,
    borderColor: '#14B8A6',
    borderTopColor: 'transparent',
    transform: [{ rotate: '-45deg' }],
    opacity: 0.6,
  },
  circleDay: {
    fontSize: 52,
    fontWeight: '900',
    color: '#111827',
  },
  circleLabel: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
    color: '#0D9488',
  },
  circlePhase: {
    marginTop: 8,
    fontSize: 11,
    color: '#9CA3AF',
  },
  centerText: {
    marginTop: 20,
    paddingHorizontal: 40,
    textAlign: 'center',
    color: '#6B7280',
  },
  centerTextAccent: {
    fontWeight: '800',
    color: '#0D9488',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    paddingVertical: 12,
    borderRadius: 16,
  },
  actionIcon: {
    marginRight: 4,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  secondaryAction: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 12,
  },
  phaseChip: {
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  phaseChipActive: {
    backgroundColor: '#CCFBF1',
    borderColor: '#14B8A6',
  },
  phaseChipText: {
    color: '#6B7280',
    fontWeight: '700',
  },
  phaseChipTextActive: {
    color: '#115E59',
    fontWeight: '900',
  },
  tipCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: '#FCE7F3',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  tipTitle: {
    color: '#9D174D',
    fontWeight: '900',
    marginBottom: 8,
  },
  tipText: {
    color: '#831843',
    lineHeight: 20,
  },
});
