import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import api from '@/services/api';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/Button';

const OBJECTIVES = [
  { id: 'EMAGRECER', title: 'Emagrecer', icon: 'monitor_weight' },
  { id: 'INCHACO', title: 'Reduzir inchaço', icon: 'water_drop' },
  { id: 'FOME', title: 'Controlar fome/compulsão', icon: 'restaurant_menu' },
  { id: 'HUMOR', title: 'Melhorar humor/TPM', icon: 'sentiment_very_satisfied' },
  { id: 'SONO', title: 'Dormir melhor', icon: 'bedtime' },
  { id: 'PELE', title: 'Melhorar pele/cabelo', icon: 'face' },
] as const;

export default function ObjetivosScreen() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleObjective = (id: string) => {
    const current = store.objetivos;
    if (current.includes(id)) {
      store.setDado('objetivos', current.filter(item => item !== id));
    } else {
      store.setDado('objetivos', [...current, id]);
    }
  };

  const handleFinish = async () => {
    if (store.objetivos.length === 0) return;

    // Campos mínimos para o backend calcular fase
    if (!store.momentoAtual || !store.dataUltimaMenstruacao) {
      Alert.alert('Atenção', 'Complete as etapas anteriores do onboarding para continuar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        modoCiclo: store.momentoAtual,
        cicloRegular: store.cicloRegular,
        duracaoCiclo: store.duracaoCiclo,
        duracaoSangramento: store.duracaoSangramento,
        dataUltimaMenstruacao: store.dataUltimaMenstruacao.toISOString(),
        objetivos: store.objetivos,
      };

      await api.put('/perfil/ciclo', payload);

      // Redirecionar para Home
      router.replace('/(app)/home');
      store.reset();
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        'Erro ao finalizar onboarding',
        error.response?.data?.message || error.response?.data?.error || 'Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <View style={styles.dotMuted} />
          <View style={[styles.dot, styles.dotWide]} />
        </View>

        <Text style={styles.title}>Quais são seus principais objetivos?</Text>
        <Text style={styles.subtitle}>Selecione todos que se aplicam a você.</Text>
      </View>

      <View style={styles.content}>
        {OBJECTIVES.map((obj) => {
          const isSelected = store.objetivos.includes(obj.id);
          return (
            <TouchableOpacity
              key={obj.id}
              onPress={() => toggleObjective(obj.id)}
              style={[styles.pill, isSelected ? styles.pillSelected : null]}
            >
              <View style={[styles.pillIcon, isSelected ? styles.pillIconSelected : null]}>
                <MaterialIcons name={obj.icon as any} size={22} color={isSelected ? '#000' : '#13ec5b'} />
              </View>

              <Text style={[styles.pillText, isSelected ? styles.pillTextSelected : null]}>{obj.title}</Text>

              <View style={[styles.pillCheck, isSelected ? styles.pillCheckSelected : null]}>
                {isSelected ? <MaterialIcons name="check" size={14} color="#13ec5b" /> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button
          title="Finalizar"
          onPress={handleFinish}
          disabled={store.objetivos.length === 0}
          isLoading={isSubmitting}
          style={styles.cta}
        />
        <Text style={styles.footerHint}>Você poderá alterar isso depois no seu perfil.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F6F8F6',
    paddingBottom: 140,
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
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#FFFFFF',
  },
  pillSelected: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  pillIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: '#F6F8F6',
  },
  pillIconSelected: {
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  pillText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#111813',
  },
  pillTextSelected: {
    color: '#000000',
  },
  pillCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  pillCheckSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
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
  footerHint: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
  },
});
