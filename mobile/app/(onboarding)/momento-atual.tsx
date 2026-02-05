import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/Button';

const MOMENTS = [
  {
    id: 'CICLO_REGULAR',
    title: 'Ciclo regular',
    subtitle: 'Variação menor que 7 dias',
    icon: 'water_drop',
  },
  {
    id: 'CICLO_IRREGULAR',
    title: 'Ciclo irregular',
    subtitle: 'Variação imprevisível',
    icon: 'waves',
  },
  {
    id: 'MENOPAUSA',
    title: 'Menopausa',
    subtitle: 'Ou perimenopausa',
    icon: 'spa',
  },
  {
    id: 'ANTICONCEPCIONAL',
    title: 'Anticoncepcional',
    subtitle: 'Uso contínuo',
    icon: 'medication',
  },
] as const;

export default function MomentoAtualScreen() {
  const router = useRouter();
  const store = useOnboardingStore();

  const handleNext = () => {
    if (!store.momentoAtual) return;
    router.push('/(onboarding)/objetivos');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#111813" />
        </TouchableOpacity>

        <View style={styles.dotsRow}>
          <View style={styles.dotMuted} />
          <View style={[styles.dot, styles.dotWide]} />
          <View style={styles.dotMuted} />
        </View>

        <Text style={styles.title}>Qual o seu momento atual?</Text>
        <Text style={styles.subtitle}>
          Selecione a opção que melhor descreve sua fase para personalizarmos suas previsões.
        </Text>
      </View>

      <View style={styles.content}>
        {MOMENTS.map((moment) => {
          const isSelected = store.momentoAtual === moment.id;
          return (
            <TouchableOpacity
              key={moment.id}
              onPress={() => store.setDado('momentoAtual', moment.id)}
              style={[styles.card, isSelected ? styles.cardSelected : null]}
            >
              <View style={[styles.iconWrap, isSelected ? styles.iconWrapSelected : null]}>
                <MaterialIcons name={moment.icon as any} size={24} color={isSelected ? '#000' : '#13ec5b'} />
              </View>

              <View style={styles.flex1}>
                <Text style={styles.cardTitle}>{moment.title}</Text>
                <Text style={styles.cardSubtitle}>{moment.subtitle}</Text>
              </View>

              <View style={[styles.checkWrap, isSelected ? styles.checkWrapSelected : null]}>
                {isSelected ? <MaterialIcons name="check" size={16} color="#000" /> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button title="Continuar" onPress={handleNext} disabled={!store.momentoAtual} style={styles.cta} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F6F8F6',
    paddingBottom: 120,
  },
  header: {
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
    marginBottom: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 999,
    backgroundColor: '#13ec5b',
  },
  dotWide: {
    width: 32,
  },
  dotMuted: {
    height: 10,
    width: 10,
    borderRadius: 999,
    backgroundColor: '#D1D5DB',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111813',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 14,
    color: '#61896f',
  },
  content: {
    paddingHorizontal: 24,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  cardSelected: {
    backgroundColor: 'rgba(13, 148, 136, 0.06)',
    borderColor: '#0D9488',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: '#F2FCF5',
  },
  iconWrapSelected: {
    backgroundColor: 'rgba(13, 148, 136, 0.20)',
  },
  flex1: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111813',
  },
  cardSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
  },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkWrapSelected: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cta: {
    backgroundColor: '#13ec5b',
  },
});
