import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Colors } from '@/constants/Colors';

type CycleDayType = 'period' | 'fertile';

export default function Calendario() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [monthStart, monthEnd]);

  // Padding correto: alinhar o 1º dia do mês ao dia da semana.
  // getDay: 0=domingo, 6=sabado
  const padStart = getDay(monthStart);

  // Placeholder (MVP). Depois isso deve vir do backend.
  const cycleData: Array<{ date: Date; type: CycleDayType }> = [
    { date: new Date(2025, 0, 10), type: 'period' },
    { date: new Date(2025, 0, 11), type: 'period' },
    { date: new Date(2025, 0, 12), type: 'period' },
    { date: new Date(2025, 0, 24), type: 'fertile' },
    { date: new Date(2025, 0, 25), type: 'fertile' },
  ];

  const getType = (date: Date) => cycleData.find((d) => isSameDay(d.date, date))?.type;

  const monthLabel = format(currentDate, 'MMMM yyyy', { locale: ptBR });

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendário</Text>

        <View style={styles.monthRow}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <ChevronLeft color={Colors.text} size={24} />
          </TouchableOpacity>

          <Text style={styles.monthText}>{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</Text>

          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <ChevronRight color={Colors.text} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d) => (
            <View key={d} style={styles.weekHeaderCell}>
              <Text style={styles.weekHeaderText}>{d}</Text>
            </View>
          ))}

          {Array.from({ length: padStart }).map((_, i) => (
            <View key={`pad-${i}`} style={styles.dayCell} />
          ))}

          {daysInMonth.map((date) => {
            const type = getType(date);
            const sameMonth = isSameMonth(date, currentDate);
            const today = isToday(date);

            const dayContainerStyle = [
              styles.dayBubble,
              type === 'period' ? styles.periodBubble : null,
              type === 'fertile' ? styles.fertileBubble : null,
              today && !type ? styles.todayBubble : null,
            ];

            const dayTextStyle = [
              styles.dayText,
              !sameMonth ? styles.dayTextMuted : null,
              today && !type ? styles.dayTextToday : null,
              type ? styles.dayTextOnColor : null,
            ];

            return (
              <TouchableOpacity key={date.toISOString()} style={styles.dayCell}>
                <View style={dayContainerStyle}>
                  <Text style={dayTextStyle}>{format(date, 'd')}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legenda</Text>

          <View style={styles.legendRow}>
            <View style={[styles.legendDot, styles.legendDotPeriod]} />
            <Text style={styles.legendText}>Menstruação</Text>
          </View>

          <View style={styles.legendRow}>
            <View style={[styles.legendDot, styles.legendDotFertile]} />
            <Text style={styles.legendText}>Período Fértil</Text>
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendToday}>
              <View style={styles.legendTodayInner} />
            </View>
            <Text style={styles.legendText}>Hoje</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 8,
  },
  navBtn: {
    padding: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    textTransform: 'capitalize',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  weekHeaderCell: {
    width: '14.2857%',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  weekHeaderText: {
    color: '#9CA3AF',
    fontWeight: '800',
  },
  dayCell: {
    width: '14.2857%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dayBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodBubble: {
    backgroundColor: '#EC4899',
  },
  fertileBubble: {
    backgroundColor: '#14B8A6',
  },
  todayBubble: {
    borderWidth: 2,
    borderColor: '#0D9488',
  },
  dayText: {
    color: '#111827',
    fontWeight: '700',
  },
  dayTextMuted: {
    color: '#D1D5DB',
    fontWeight: '600',
  },
  dayTextOnColor: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  dayTextToday: {
    color: '#0D9488',
    fontWeight: '900',
  },
  legend: {
    marginTop: 24,
    paddingHorizontal: 8,
  },
  legendTitle: {
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  legendDotPeriod: {
    backgroundColor: '#EC4899',
  },
  legendDotFertile: {
    backgroundColor: '#14B8A6',
  },
  legendToday: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#0D9488',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendTodayInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0D9488',
  },
  legendText: {
    color: '#4B5563',
  },
});
