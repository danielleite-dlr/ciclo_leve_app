import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/services/api';
import { Colors } from '@/constants/Colors';
import {
  buildCalendarHistory,
  CalendarDay,
  DayType,
  Ciclo,
  getCalendarDay,
  getFertilityStatus,
  hasFertileWindow,
  HistoricoMenstrual,
} from '@/services/cycle';

// Paleta do calendario: menstruacao = rose (cor principal), fertil = verde-agua (cor de apoio).
const C = {
  bg: Colors.background,
  card: Colors.surface,
  text: Colors.text,
  muted: Colors.textLight,
  period: Colors.primary.DEFAULT,
  periodSoft: Colors.primary.light,
  fertile: Colors.accent.DEFAULT,
  fertileSoft: Colors.accent.light,
  fertileText: Colors.accent.dark,
};

function capFirst(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Calendario() {
  const insets = useSafeAreaInsets();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [ciclo, setCiclo] = useState<Ciclo | null>(null);
  const [historico, setHistorico] = useState<HistoricoMenstrual[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const [res, menstruacao] = await Promise.all([
            api.get('/perfil'),
            api.get('/menstruacao').catch(() => null),
          ]);
          if (active) {
            setCiclo(res.data?.ciclo ?? null);
            setHistorico(menstruacao?.data?.historico ?? []);
          }
        } catch {
          if (active) setCiclo(null);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  // Menopausa e anticoncepcional nao tem janela fertil previsivel.
  const showFertile = hasFertileWindow(ciclo);
  const isIrregular = ciclo?.modoCiclo === 'CICLO_IRREGULAR';

  // Menstruacoes registradas + projecao a partir da ultima
  const hist = useMemo(() => (ciclo ? buildCalendarHistory(ciclo, historico) : null), [ciclo, historico]);
  const dayOf = useCallback(
    (date: Date): CalendarDay =>
      ciclo && hist ? getCalendarDay(date, ciclo, hist, showFertile) : { type: null, registered: false },
    [ciclo, hist, showFertile]
  );
  const typeOf = useCallback((date: Date) => dayOf(date).type, [dayOf]);

  const monthStart = startOfMonth(currentDate);
  const days = useMemo(
    () => eachDayOfInterval({ start: monthStart, end: endOfMonth(currentDate) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [monthStart.getTime()]
  );
  const padStart = getDay(monthStart);

  // Resumo: proxima menstruacao e proxima (ou atual) janela fertil, a partir de hoje.
  const summary = useMemo(() => {
    if (!ciclo) return null;
    const st = getFertilityStatus(ciclo);
    return { ...st, inPeriod: st.today === 'period' };
  }, [ciclo]);

  const monthLabel = capFirst(format(currentDate, 'MMMM yyyy', { locale: ptBR }));
  const fmt = (d: Date) => format(d, "d 'de' MMM", { locale: ptBR });

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Calendário</Text>
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={() => setCurrentDate(subMonths(currentDate, 1))} style={styles.navBtn}>
            <ChevronLeft color={C.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.monthText}>{monthLabel}</Text>
          <TouchableOpacity onPress={() => setCurrentDate(addMonths(currentDate, 1))} style={styles.navBtn}>
            <ChevronRight color={C.text} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator color={C.period} style={{ marginTop: 32 }} />
        ) : !ciclo ? (
          <Text style={styles.emptyText}>Complete seus dados do ciclo para ver a previsão no calendário.</Text>
        ) : (
          <>
            {/* Resumo: o que a usuaria precisa saber sem ler o calendario */}
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: C.periodSoft }]}>
                <MaterialIcons name="water-drop" size={20} color={C.period} />
                <Text style={styles.summaryLabel}>Menstruação</Text>
                <Text style={[styles.summaryValue, { color: C.period }]}>
                  {summary?.inPeriod
                    ? 'Hoje'
                    : summary?.daysToPeriod != null
                      ? `em ${summary.daysToPeriod} ${summary.daysToPeriod === 1 ? 'dia' : 'dias'}`
                      : '—'}
                </Text>
                {summary?.nextPeriod && !summary.inPeriod ? (
                  <Text style={styles.summaryHint}>{fmt(summary.nextPeriod)}</Text>
                ) : null}
              </View>

              {showFertile ? (
                <View style={[styles.summaryCard, { backgroundColor: C.fertileSoft }]}>
                  <MaterialIcons name="favorite" size={20} color={C.fertile} />
                  <Text style={styles.summaryLabel}>Período fértil</Text>
                  <Text style={[styles.summaryValue, { color: C.fertileText }]}>
                    {summary?.inFertile ? 'Agora' : summary?.fertileStart ? fmt(summary.fertileStart) : '—'}
                  </Text>
                  {summary?.fertileStart && summary.fertileEnd ? (
                    <Text style={styles.summaryHint}>
                      {summary.inFertile ? `até ${fmt(summary.fertileEnd)}` : `a ${fmt(summary.fertileEnd)}`}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>

            <View style={styles.calendarCard}>
              <View style={styles.grid}>
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                  <View key={`wd-${i}`} style={styles.weekHeaderCell}>
                    <Text style={styles.weekHeaderText}>{d}</Text>
                  </View>
                ))}

                {Array.from({ length: padStart }).map((_, i) => (
                  <View key={`pad-${i}`} style={styles.dayCell} />
                ))}

                {days.map((date) => {
                  const { type, registered } = dayOf(date);
                  const predictedPeriod = type === 'period' && !registered;
                  const today = isToday(date);
                  const weekday = getDay(date);
                  const isRange = type === 'period' || type === 'fertile' || type === 'ovulation';
                  const group = type === 'period' ? 'period' : isRange ? 'fertile' : null;
                  const groupOf = (t: DayType) => (t === 'period' ? 'period' : t ? 'fertile' : null);
                  const prevSame = weekday !== 0 && date.getDate() !== 1 && groupOf(typeOf(addDays(date, -1))) === group;
                  const nextSame =
                    weekday !== 6 && date.getDate() !== days.length && groupOf(typeOf(addDays(date, 1))) === group;

                  return (
                    <View key={date.toISOString()} style={styles.dayCell}>
                      {/* Faixa continua ligando os dias da mesma fase */}
                      {group ? (
                        <View
                          style={[
                            styles.band,
                            { backgroundColor: group === 'period' ? C.periodSoft : C.fertileSoft },
                            !prevSame && styles.bandStart,
                            !nextSame && styles.bandEnd,
                          ]}
                        />
                      ) : null}

                      <View
                        style={[
                          styles.dayBubble,
                          type === 'period' && registered && { backgroundColor: C.period },
                          predictedPeriod && styles.predictedBubble,
                          type === 'ovulation' && { backgroundColor: C.fertile },
                          today && styles.todayRing,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            ((type === 'period' && registered) || type === 'ovulation') && styles.dayTextOnColor,
                            predictedPeriod && { color: Colors.primary.dark },
                            type === 'fertile' && { color: C.fertileText },
                          ]}
                        >
                          {format(date, 'd')}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.legend}>
              <LegendItem color={C.period} label="Menstruação registrada" />
              <LegendItem dashed label="Menstruação prevista" />
              {showFertile ? (
                <>
                  <LegendItem color={C.fertileSoft} textColor={C.fertileText} label="Período fértil" />
                  <LegendItem color={C.fertile} label="Dia mais fértil (ovulação)" />
                </>
              ) : null}
              <LegendItem ring label="Hoje" />
            </View>

            <Text style={styles.note}>
              {showFertile
                ? 'Previsões calculadas com as menstruações que você registrou. Quanto mais você registra, mais precisas elas ficam.'
                : 'Com anticoncepcional ou na menopausa não há período fértil previsível. Mostramos apenas a previsão de sangramento.'}
              {isIrregular ? ' Como seu ciclo é irregular, as datas podem variar.' : ''}
              {' Não use como método contraceptivo.'}
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function LegendItem({
  color,
  textColor,
  label,
  ring,
  dashed,
}: {
  color?: string;
  textColor?: string;
  label: string;
  ring?: boolean;
  dashed?: boolean;
}) {
  return (
    <View style={styles.legendRow}>
      <View
        style={[
          styles.legendDot,
          ring ? styles.legendRing : dashed ? styles.predictedBubble : { backgroundColor: color },
        ]}
      >
        {textColor ? <Text style={{ color: textColor, fontSize: 9, fontWeight: '900' }}>12</Text> : null}
      </View>
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 24, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: C.text, marginBottom: 12 },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 6,
  },
  navBtn: { padding: 8 },
  monthText: { fontSize: 16, fontWeight: '800', color: C.text },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 120 },
  emptyText: { color: C.muted, textAlign: 'center', marginTop: 32, paddingHorizontal: 24 },

  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, borderRadius: 18, padding: 14 },
  summaryLabel: { color: C.text, fontWeight: '700', marginTop: 6, fontSize: 13 },
  summaryValue: { fontSize: 20, fontWeight: '900', marginTop: 2 },
  summaryHint: { color: C.muted, fontSize: 12, marginTop: 2 },

  calendarCard: { backgroundColor: C.card, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekHeaderCell: { width: '14.2857%', alignItems: 'center', paddingVertical: 8 },
  weekHeaderText: { color: '#9CA3AF', fontWeight: '800' },
  dayCell: { width: '14.2857%', height: 48, alignItems: 'center', justifyContent: 'center' },
  band: { position: 'absolute', left: 0, right: 0, top: 6, bottom: 6 },
  bandStart: { left: 4, borderTopLeftRadius: 18, borderBottomLeftRadius: 18 },
  bandEnd: { right: 4, borderTopRightRadius: 18, borderBottomRightRadius: 18 },
  dayBubble: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  // Previsao: contorno tracejado rose sobre a faixa clara (registrada = preenchida)
  predictedBubble: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary.DEFAULT,
    backgroundColor: Colors.surface,
  },
  todayRing: { borderWidth: 2, borderColor: C.text },
  dayText: { color: C.text, fontWeight: '700' },
  dayTextOnColor: { color: '#FFFFFF', fontWeight: '900' },

  legend: { marginTop: 16, backgroundColor: C.card, borderRadius: 18, padding: 16, gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 22, height: 22, borderRadius: 11, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  legendRing: { borderWidth: 2, borderColor: C.text },
  legendText: { color: C.text, fontWeight: '600' },
  note: { color: C.muted, fontSize: 12, marginTop: 12, paddingHorizontal: 4, lineHeight: 17 },
});
