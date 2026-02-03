import { View, Text, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

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
    <ScrollView className="flex-1 bg-[#f6f8f6] dark:bg-[#102216]">
      {/* Header */}
      <View className="pt-12 px-6 pb-4">
        <View className="flex-row justify-center gap-3 mb-6">
          <View className="h-2.5 w-8 rounded-full bg-[#13ec5b]" />
          <View className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
          <View className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
        </View>
        <Text className="text-3xl font-bold text-[#111813] dark:text-white">
          Vamos personalizar{'\n'}sua experiência
        </Text>
        <Text className="mt-3 text-base font-light text-[#61896f] dark:text-[#a1b8aa]">
          Esses dados nos ajudam a prever seus sintomas com precisão.
        </Text>
      </View>

      <View className="px-6 space-y-6 pb-24">
        {/* Altura e Peso */}
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Input 
              label="Altura *" 
              placeholder="165" 
              keyboardType="numeric"
              value={store.altura}
              onChangeText={(t) => store.setDado('altura', t)}
            />
          </View>
          <View className="flex-1">
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

        <View className="h-px bg-gray-200 dark:bg-white/10 my-2" />

        {/* Regularidade */}
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-lg font-medium text-[#111813] dark:text-white">Seu ciclo é regular?</Text>
            <Text className="text-sm text-gray-500">Você menstrua todo mês?</Text>
          </View>
          <Switch 
            value={store.cicloRegular}
            onValueChange={(v) => store.setDado('cicloRegular', v)}
            trackColor={{ false: '#767577', true: '#13ec5b' }}
            thumbColor={store.cicloRegular ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View className="space-y-6 mt-4">
          {/* Data Última Menstruação (obrigatória para cálculo de fase) */}
          <View>
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Data da última menstruação *</Text>
            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)}
              className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl h-14 px-5 justify-center"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-lg text-[#111813] dark:text-white">
                  {store.dataUltimaMenstruacao ? store.dataUltimaMenstruacao.toLocaleDateString('pt-BR') : 'Selecione a data'}
                </Text>
                <MaterialIcons name="calendar-today" size={24} color="#13ec5b" />
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={store.dataUltimaMenstruacao || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {store.cicloRegular && (
            <>
              {/* Duração Ciclo Slider */}
              <View className="p-5 rounded-lg bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm">
                <View className="flex-row justify-between items-end mb-4">
                  <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">Duração do ciclo</Text>
                  <View className="flex-row items-baseline gap-1">
                    <Text className="text-2xl font-bold text-[#13ec5b]">{Math.round(store.duracaoCiclo)}</Text>
                    <Text className="text-sm font-medium text-[#13ec5b]">dias</Text>
                  </View>
                </View>
                <Slider
                  style={{width: '100%', height: 40}}
                  minimumValue={21}
                  maximumValue={45}
                  step={1}
                  value={store.duracaoCiclo}
                  onValueChange={(v) => store.setDado('duracaoCiclo', v)}
                  minimumTrackTintColor="#13ec5b"
                  maximumTrackTintColor="#dbe6df"
                  thumbTintColor="#13ec5b"
                />
                <View className="flex-row justify-between mt-1">
                  <Text className="text-xs text-gray-400">21 dias</Text>
                  <Text className="text-xs text-gray-400">45 dias</Text>
                </View>
              </View>

              {/* Duração Sangramento Slider */}
              <View className="p-5 rounded-lg bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm">
                <View className="flex-row justify-between items-end mb-4">
                  <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">Duração do sangramento</Text>
                  <View className="flex-row items-baseline gap-1">
                    <Text className="text-2xl font-bold text-[#13ec5b]">{Math.round(store.duracaoSangramento)}</Text>
                    <Text className="text-sm font-medium text-[#13ec5b]">dias</Text>
                  </View>
                </View>
                <Slider
                  style={{width: '100%', height: 40}}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={store.duracaoSangramento}
                  onValueChange={(v) => store.setDado('duracaoSangramento', v)}
                  minimumTrackTintColor="#13ec5b"
                  maximumTrackTintColor="#dbe6df"
                  thumbTintColor="#13ec5b"
                />
                <View className="flex-row justify-between mt-1">
                  <Text className="text-xs text-gray-400">1 dia</Text>
                  <Text className="text-xs text-gray-400">10 dias</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>

      <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-[#102216]/90 border-t border-gray-100 dark:border-white/5">
        <Button 
          title="Continuar" 
          onPress={handleNext} 
          className="bg-[#13ec5b]"
        />
      </View>
    </ScrollView>
  );
}
