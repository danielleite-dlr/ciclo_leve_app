import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/Button';
import { MaterialIcons } from '@expo/vector-icons';
import { clsx } from 'clsx';

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
          <View className="h-2.5 w-8 rounded-full bg-[#13ec5b]" />
          <View className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
        </View>

        <Text className="text-3xl font-bold text-[#111813] dark:text-white">
          Qual o seu momento atual?
        </Text>
        <Text className="mt-3 text-base font-light text-[#61896f] dark:text-[#a1b8aa]">
          Selecione a opção que melhor descreve sua fase para personalizarmos suas previsões.
        </Text>
      </View>

      <View className="px-6 space-y-4 pb-24">
        {MOMENTS.map((moment) => {
          const isSelected = store.momentoAtual === moment.id;
          return (
            <TouchableOpacity
              key={moment.id}
              onPress={() => store.setDado('momentoAtual', moment.id)}
              className={clsx(
                "flex-row items-center p-4 rounded-2xl border transition-all",
                isSelected 
                  ? "bg-primary/5 border-primary shadow-sm" 
                  : "bg-white dark:bg-[#152a1e] border-gray-100 dark:border-white/5"
              )}
            >
              <View className={clsx(
                "size-12 rounded-full items-center justify-center mr-4",
                isSelected ? "bg-primary/20" : "bg-[#f2fcf5] dark:bg-[#0c1f13]"
              )}>
                <MaterialIcons 
                  name={moment.icon as any} 
                  size={24} 
                  color={isSelected ? "#000" : "#13ec5b"} 
                />
              </View>
              
              <View className="flex-1">
                <Text className="text-base font-semibold text-[#111813] dark:text-white">
                  {moment.title}
                </Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400">
                  {moment.subtitle}
                </Text>
              </View>

              <View className={clsx(
                "size-6 rounded-full border-2 items-center justify-center",
                isSelected ? "bg-primary border-primary" : "border-gray-200 dark:border-gray-600"
              )}>
                {isSelected && (
                  <MaterialIcons name="check" size={16} color="#000" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-[#102216]/90 border-t border-gray-100 dark:border-white/5">
        <Button 
          title="Continuar" 
          onPress={handleNext}
          disabled={!store.momentoAtual}
          className="bg-[#13ec5b]"
        />
      </View>
    </ScrollView>
  );
}
