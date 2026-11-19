import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isAfter,
  isSameDay,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Colors } from '@/constants/Colors';

const SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

/**
 * Ultimos meses ate hoje. Tocar num dia marca o inicio da menstruacao;
 * os dias de sangramento seguintes sao preenchidos pela duracao informada.
 */
export function CalendarioMenstruacao({
  inicio,
  diasSangramento,
  onEscolher,
  meses = 3,
}: {
  inicio: Date | null;
  diasSangramento: number;
  onEscolher: (d: Date) => void;
  meses?: number;
}) {
  const hoje = useMemo(() => new Date(), []);
  const lista = useMemo(
    () => Array.from({ length: meses }, (_, i) => startOfMonth(subMonths(hoje, meses - 1 - i))),
    [hoje, meses]
  );

  const marcado = (d: Date) => {
    if (!inicio) return false;
    const diff = differenceInCalendarDays(d, inicio);
    return diff >= 0 && diff < diasSangramento && !isAfter(d, hoje);
  };

  return (
    <View>
      <View style={styles.semana}>
        {SEMANA.map((s, i) => (
          <Text key={i} style={styles.semanaTexto}>
            {s}
          </Text>
        ))}
      </View>
      {lista.map((mes) => {
        const dias = eachDayOfInterval({ start: mes, end: endOfMonth(mes) });
        const vazios = getDay(mes);
        return (
          <View key={mes.toISOString()} style={styles.mes}>
            <Text style={styles.mesTitulo}>{format(mes, "MMMM 'de' yyyy", { locale: ptBR })}</Text>
            <View style={styles.grade}>
              {Array.from({ length: vazios }).map((_, i) => (
                <View key={`v${i}`} style={styles.celula} />
              ))}
              {dias.map((d) => {
                const futuro = isAfter(d, hoje);
                const ativo = marcado(d);
                const primeiro = inicio && isSameDay(d, inicio);
                const ehHoje = isSameDay(d, hoje);
                return (
                  <TouchableOpacity
                    key={d.toISOString()}
                    style={styles.celula}
                    disabled={futuro}
                    onPress={() => onEscolher(d)}
                    accessibilityLabel={format(d, "d 'de' MMMM", { locale: ptBR })}
                  >
                    <Text style={[styles.num, futuro && styles.numFuturo, ehHoje && styles.numHoje, ativo && styles.numAtivo]}>
                      {format(d, 'd')}
                    </Text>
                    <View
                      style={[
                        styles.bolinha,
                        futuro && { borderColor: 'transparent' },
                        ativo && styles.bolinhaAtiva,
                        primeiro && styles.bolinhaPrimeira,
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** Ultimo dia de sangramento para o texto de confirmacao. */
export const fimSangramento = (inicio: Date, dias: number) => addDays(inicio, Math.max(1, dias) - 1);

const styles = StyleSheet.create({
  semana: { flexDirection: 'row', marginBottom: 4 },
  semanaTexto: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', color: Colors.textLight },
  mes: { marginTop: 12 },
  mesTitulo: { fontSize: 16, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 6, textTransform: 'capitalize' },
  grade: { flexDirection: 'row', flexWrap: 'wrap' },
  celula: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 6 },
  num: { fontSize: 15, color: Colors.text, fontWeight: '600' },
  numFuturo: { color: '#C9C2C4' },
  numHoje: { fontWeight: '900', textDecorationLine: 'underline' },
  numAtivo: { color: Colors.primary.dark, fontWeight: '900' },
  bolinha: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D8CFD2', marginTop: 3 },
  bolinhaAtiva: { backgroundColor: Colors.primary.DEFAULT, borderColor: Colors.primary.DEFAULT },
  bolinhaPrimeira: { borderColor: Colors.primary.dark, borderWidth: 3 },
});
