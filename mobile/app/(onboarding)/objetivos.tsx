import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/Button';
import { MaterialIcons } from '@expo/vector-icons';
import { clsx } from 'clsx';
import api from '@/services/api';
import { useState } from 'react';
import { Alert } from 'react-native';

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
    <ScrollView className="flex-1 bg-[#f6f8f6] dark:bg-[#102216]">
      {/* Header */}
      <View className="pt-12 px-6 pb-4">
         <TouchableOpacity 
          onPress={() => router.back()}
          className="size-10 -ml-2 items-center justify-center rounded-full mb-4"
        >
          <MaterialIcons name="arrow-back" size={24} color="#111813" />
        </TouchableOpacity>

        <View className="flex-row justify-center gap-3 mb-6">
          <View className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
          <View className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
          <View className="h-2.5 w-8 rounded-full bg-[#13ec5b]" />
        </View>

        <Text className="text-3xl font-bold text-[#111813] dark:text-white">
          Quais são seus principais objetivos?
        </Text>
        <Text className="mt-3 text-base font-light text-[#61896f] dark:text-[#a1b8aa]">
          Selecione todos que se aplicam a você.
        </Text>
      </View>

      <View className="px-6 space-y-3 pb-32">
        {OBJECTIVES.map((obj) => {
          const isSelected = store.objetivos.includes(obj.id);
          return (
            <TouchableOpacity
              key={obj.id}
              onPress={() => toggleObjective(obj.id)}
              className={clsx(
                "flex-row items-center p-4 rounded-full border transition-all",
                isSelected 
                  ? "bg-primary border-primary shadow-lg shadow-primary/20" 
                  : "bg-white dark:bg-[#152a1e] border-transparent"
              )}
            >
              <View className={clsx(
                "size-10 rounded-full items-center justify-center mr-4",
                isSelected ? "bg-white/20" : "bg-[#f6f8f6] dark:bg-black/40"
              )}>
                <MaterialIcons 
                  name={obj.icon as any} 
                  size={22} 
                  color={isSelected ? "#000" : "#13ec5b"} 
                />
              </View>
              
              <Text className={clsx(
                "flex-1 text-base",
                isSelected ? "font-bold text-black" : "font-medium text-[#111813] dark:text-white"
              )}>
                {obj.title}
              </Text>

              <View className={clsx(
                "size-6 rounded-full items-center justify-center mr-2",
                isSelected ? "bg-black" : "border-2 border-gray-300 dark:border-gray-600"
              )}>
                 {isSelected && (
                  <MaterialIcons name="check" size={14} color="#13ec5b" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-[#102216]/90 border-t border-gray-100 dark:border-white/5">
        <Button 
          title="Finalizar" 
          onPress={handleFinish}
          disabled={store.objetivos.length === 0}
          isLoading={isSubmitting}
          className="bg-[#13ec5b]"
        />
        <Text className="text-center text-xs text-gray-500 mt-3">
          Você poderá alterar isso depois no seu perfil.
        </Text>
      </View>
    </ScrollView>
  );
}
