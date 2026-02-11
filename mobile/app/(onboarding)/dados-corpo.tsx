import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function DadosCorpoScreen() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      store.setDado('dataUltimaMenstruacao', selectedDate);
    }
  };

  const handleNext = () => {
    if (!store.altura || !store.idade || !store.dataUltimaMenstruacao) {
      // TODO: Mostrar erro visual
      return; 
    }
    router.push('/(onboarding)/momento-atual');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotWide]} />
          <View style={styles.dotMuted} />
          <View style={styles.dotMuted} />
        </View>
        <Text style={styles.title}>Vamos personalizar{'\n'}sua experiência</Text>
        <Text style={styles.subtitle}>Esses dados nos ajudam a prever seus sintomas com precisão.</Text>
      </View>

      <View style={styles.content}>
        {/* Altura e Peso */}
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Input
              label="Altura *"
              placeholder="165"
              keyboardType="numeric"
              value={store.altura}
              onChangeText={(t) => store.setDado('altura', t)}
            />
          </View>
          <View style={styles.flex1}>
            <Input
              label="Peso"
              placeholder="60"
              keyboardType="numeric"
              value={store.peso}
              onChangeText={(t) => store.setDado('peso', t)}
            />
          </View>
        </View>

        {/* Idade */}
        <Input
          label="Idade *"
          placeholder="28"
          keyboardType="numeric"
          value={store.idade}
          onChangeText={(t) => store.setDado('idade', t)}
        />

        <View style={styles.divider} />

        {/* Regularidade */}
        <View style={styles.regularRow}>
          <View style={styles.flex1}>
            <Text style={styles.sectionTitle}>Seu ciclo é regular?</Text>
            <Text style={styles.sectionHint}>Você menstrua todo mês?</Text>
          </View>
          <Switch
            value={store.cicloRegular}
            onValueChange={(v) => store.setDado('cicloRegular', v)}
            trackColor={{ false: '#767577', true: '#13ec5b' }}
            thumbColor={store.cicloRegular ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* Data Última Menstruação */}
        <View style={styles.block}>
          <Text style={styles.label}>Data da última menstruação *</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
            <View style={styles.dateRow}>
              <Text style={styles.dateText}>
                {store.dataUltimaMenstruacao
                  ? store.dataUltimaMenstruacao.toLocaleDateString('pt-BR')
                  : 'Selecione a data'}
              </Text>
              <MaterialIcons name="calendar-today" size={22} color="#13ec5b" />
            </View>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={store.dataUltimaMenstruacao || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {store.cicloRegular ? (
          <>
            {/* Duração Ciclo */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>Duração do ciclo</Text>
                <View style={styles.cardValueRow}>
                  <Text style={styles.cardValue}>{Math.round(store.duracaoCiclo)}</Text>
                  <Text style={styles.cardValueUnit}>dias</Text>
                </View>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={21}
                maximumValue={45}
                step={1}
                value={store.duracaoCiclo}
                onValueChange={(v) => store.setDado('duracaoCiclo', v)}
                minimumTrackTintColor="#13ec5b"
                maximumTrackTintColor="#dbe6df"
                thumbTintColor="#13ec5b"
              />
              <View style={styles.sliderHints}>
                <Text style={styles.sliderHintText}>21 dias</Text>
                <Text style={styles.sliderHintText}>45 dias</Text>
              </View>
            </View>

            {/* Duração Sangramento */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>Duração do sangramento</Text>
                <View style={styles.cardValueRow}>
                  <Text style={styles.cardValue}>{Math.round(store.duracaoSangramento)}</Text>
                  <Text style={styles.cardValueUnit}>dias</Text>
                </View>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={store.duracaoSangramento}
                onValueChange={(v) => store.setDado('duracaoSangramento', v)}
                minimumTrackTintColor="#13ec5b"
                maximumTrackTintColor="#dbe6df"
                thumbTintColor="#13ec5b"
              />
              <View style={styles.sliderHints}>
                <Text style={styles.sliderHintText}>1 dia</Text>
                <Text style={styles.sliderHintText}>10 dias</Text>
              </View>
            </View>
          </>
        ) : null}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button title="Continuar" onPress={handleNext} style={styles.cta} />
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
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  flex1: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  regularRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111813',
  },
  sectionHint: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },
  block: {
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    color: '#111813',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  cardValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#13ec5b',
  },
  cardValueUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#13ec5b',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderHints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sliderHintText: {
    fontSize: 11,
    color: '#9CA3AF',
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
