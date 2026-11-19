import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/services/api';
import { parseDateOnly } from '@/services/cycle';
import { Colors } from '@/constants/Colors';
import { nivelTexto } from '@/constants/sintomas';
import { gerarDica } from '@/services/dicaDoDia';

type Registro = {
  id: string;
  dataRegistro: string;
  inchaco?: number | null;
  fomeCompulsao?: number | null;
  humorIrritacao?: number | null;
  qualidadeSono?: number | null;
};

type SymptomKey = 'inchaco' | 'fomeCompulsao' | 'humorIrritacao' | 'qualidadeSono';

// Escala do registro diario: 0 = sem queixa ... 3 = intenso (para todos, inclusive sono).
const SYMPTOMS: { key: SymptomKey; label: string; tipLabel: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { key: 'inchaco', label: 'Inchaço', tipLabel: 'inchaço', icon: 'water-drop' },
  { key: 'fomeCompulsao', label: 'Fome', tipLabel: 'fome/compulsão', icon: 'restaurant' },
  { key: 'humorIrritacao', label: 'Humor', tipLabel: 'irritabilidade', icon: 'sentiment-dissatisfied' },
  { key: 'qualidadeSono', label: 'Sono', tipLabel: 'sono', icon: 'bedtime' },
];
// Texto do nivel por sintoma (mesmo do Registro).

const val = (r: Registro | null | undefined, k: SymptomKey) => Number(r?.[k] || 0);

type Tip = { title: string; icon: keyof typeof MaterialIcons.glyphMap; cardTitle: string; text: string; extra: string };

// Sem sintomas no ultimo registro. Com sintomas, a dica vem de gerarDica (a mesma da Home e da Dica do Dia).
const DIA_LEVE: Tip = {
  title: 'Dia leve',
  icon: 'spa',
  cardTitle: 'Continue registrando',
  text: 'Registrar todos os dias ajuda a perceber como o ciclo afeta você.',
  extra: 'Se quiser, reserve 5 minutos para meditar.',
};

export default function InsightsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registros, setRegistros] = useState<Registro[]>([]);

  const fetchInsights = useCallback(async () => {
    try {
      const res = await api.get('/registros');
      // Backend: { data: RegistroDiario[], pagination } (aceita array puro por compatibilidade)
      const lista: Registro[] = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setRegistros([...lista].sort((a, b) => b.dataRegistro.localeCompare(a.dataRegistro)));
    } catch {
      setRegistros([]);
    }

  }, []);

  // Recarrega sempre que a aba ganha foco (ex.: depois de salvar um registro)
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        await fetchInsights();
        if (active) setLoading(false);
      })();
      return () => {
        active = false;
      };
    }, [fetchInsights])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInsights();
    setRefreshing(false);
  }, [fetchInsights]);

  const last = registros[0] ?? null;
  const previous = registros[1] ?? null;
  // A API devolve "2026-11-19T00:00:00.000Z": usar so a data evita mostrar o dia anterior no fuso -03:00.
  const lastDate = last ? parseDateOnly(last.dataRegistro) : null;
  const registeredToday = !!lastDate && isToday(lastDate);

  const { tip, basedText } = useMemo(() => {
    if (!last) return { tip: null, basedText: '' };
    const ranked = SYMPTOMS.map((s) => ({ ...s, v: val(last, s.key) })).sort((a, b) => b.v - a.v);
    if (ranked[0].v === 0) return { tip: DIA_LEVE, basedText: 'Você não relatou sintomas no último registro.' };
    const top = ranked.slice(0, 2).filter((s) => s.v > 0);
    const d = gerarDica({
      inchaco: val(last, 'inchaco'),
      fomeCompulsao: val(last, 'fomeCompulsao'),
      humorIrritacao: val(last, 'humorIrritacao'),
      qualidadeSono: val(last, 'qualidadeSono'),
    });
    return {
      tip: { title: d.title, icon: d.icon, cardTitle: d.cardTitle, text: d.cardText, extra: d.extra } as Tip,
      basedText: `Baseado em ${top.map((s) => `"${s.tipLabel}"`).join(' e ')} do seu último registro.`,
    };
  }, [last]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Insights</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {!last ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <MaterialIcons name="insights" size={44} color={Colors.primary.DEFAULT} />
            </View>
            <Text style={styles.emptyTitle}>Sem dados ainda</Text>
            <Text style={styles.emptyText}>
              Faça seu primeiro registro diário para receber dicas personalizadas e entender seus padrões.
            </Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/(app)/registro')}>
              <Text style={styles.btnPrimaryText}>Registrar agora</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {!registeredToday ? (
              <TouchableOpacity
                style={styles.reminder}
                onPress={() => router.push('/(app)/registro')}
                activeOpacity={0.8}
              >
                <MaterialIcons name="edit" size={18} color={Colors.primary.dark} />
                <Text style={styles.reminderText}>Você ainda não registrou hoje. Registrar meu dia</Text>
                <MaterialIcons name="chevron-right" size={20} color={Colors.primary.dark} />
              </TouchableOpacity>
            ) : null}

            {/* Dica principal */}
            {tip ? (
              <View style={styles.tipCard}>
                <Text style={styles.eyebrow}>Seu feedback</Text>
                <Text style={styles.h1}>{tip.title}</Text>
                <Text style={styles.based}>{basedText}</Text>

                <View style={styles.tipRow}>
                  <View style={styles.tipIcon}>
                    <MaterialIcons name={tip.icon} size={20} color={Colors.primary.DEFAULT} />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.tipTitle}>{tip.cardTitle}</Text>
                    <Text style={styles.tipText}>{tip.text}</Text>
                  </View>
                </View>

                <View style={styles.extraRow}>
                  <MaterialIcons name="lightbulb-outline" size={18} color={Colors.primary.dark} />
                  <Text style={styles.extraText}>
                    <Text style={styles.extraBold}>Dica extra: </Text>
                    {tip.extra}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Sintomas do ultimo registro */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Seu último registro</Text>
                <Text style={styles.cardDate}>
                  {registeredToday ? 'Hoje' : lastDate ? format(lastDate, "d 'de' MMM", { locale: ptBR }) : ''}
                </Text>
              </View>

              {SYMPTOMS.map((s) => {
                const v = val(last, s.key);
                const prev = previous ? val(previous, s.key) : null;
                const trend = prev == null || prev === v ? null : v < prev ? 'better' : 'worse';
                return (
                  <View key={s.key} style={styles.symptomRow}>
                    <MaterialIcons name={s.icon} size={18} color={Colors.primary.DEFAULT} style={styles.symptomIcon} />
                    <View style={styles.flex1}>
                      <View style={styles.symptomTop}>
                        <Text style={styles.symptomLabel}>{s.label}</Text>
                        <Text style={styles.symptomLevel}>{nivelTexto(s.key, v)}</Text>
                      </View>
                      <View style={styles.levelBar}>
                        {[1, 2, 3].map((n) => (
                          <View key={n} style={[styles.levelSeg, n <= v && styles.levelSegOn]} />
                        ))}
                      </View>
                      {trend ? (
                        <Text style={[styles.trend, trend === 'better' ? styles.trendBetter : styles.trendWorse]}>
                          {trend === 'better' ? '↓ Melhorou' : '↑ Piorou'} desde o registro anterior
                        </Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: { paddingHorizontal: 24, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: Colors.text },
  content: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 120 },
  flex1: { flex: 1 },

  emptyState: { marginTop: 60, alignItems: 'center', paddingHorizontal: 16 },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: Colors.text, marginBottom: 12 },
  emptyText: { fontSize: 16, color: Colors.textLight, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  btnPrimary: { backgroundColor: Colors.primary.DEFAULT, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 999 },
  btnPrimaryText: { color: Colors.onPrimary, fontWeight: '900', fontSize: 16 },

  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.primary.light,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  reminderText: { flex: 1, color: Colors.primary.dark, fontWeight: '800', fontSize: 14 },

  tipCard: { backgroundColor: Colors.surface, borderRadius: 24, padding: 20, marginBottom: 16 },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary.DEFAULT,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  h1: { fontSize: 26, fontWeight: '900', color: Colors.text, marginTop: 6 },
  based: { fontSize: 13, color: Colors.textLight, marginTop: 4, lineHeight: 18 },
  tipRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: { fontSize: 16, fontWeight: '900', color: Colors.text, marginBottom: 4 },
  tipText: { fontSize: 15, color: Colors.text, opacity: 0.8, lineHeight: 22 },
  extraRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.primary.light,
  },
  extraText: { flex: 1, fontSize: 14, color: Colors.text, lineHeight: 20 },
  extraBold: { fontWeight: '800', color: Colors.primary.dark },

  card: { backgroundColor: Colors.surface, borderRadius: 24, padding: 20 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  cardTitle: { fontSize: 17, fontWeight: '900', color: Colors.text },
  cardDate: { fontSize: 13, fontWeight: '700', color: Colors.textLight },
  symptomRow: { flexDirection: 'row', paddingVertical: 10 },
  symptomIcon: { marginTop: 1, marginRight: 12 },
  symptomTop: { flexDirection: 'row', justifyContent: 'space-between' },
  symptomLabel: { fontSize: 15, fontWeight: '700', color: Colors.text },
  symptomLevel: { fontSize: 14, fontWeight: '700', color: Colors.textLight },
  levelBar: { flexDirection: 'row', gap: 4, marginTop: 8 },
  levelSeg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  levelSegOn: { backgroundColor: Colors.primary.DEFAULT },
  trend: { fontSize: 12, fontWeight: '700', marginTop: 6 },
  trendBetter: { color: Colors.accent.dark },
  trendWorse: { color: Colors.primary.dark },
});
