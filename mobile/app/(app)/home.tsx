import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Settings, Bell, Calendar as CalendarIcon, Droplets } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import api from '@/services/api';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userFirstName, setUserFirstName] = useState('Daniela'); // TODO: Pegar do perfil
  const [cycleDay, setCycleDay] = useState(12);
  const [cyclePhase, setCyclePhase] = useState('Ovulatória');
  
  useEffect(() => {
    // Simulating data fetch
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const PhaseCard = ({ title, active }: { title: string, active?: boolean }) => (
    <View className={`mr-4 px-4 py-2 rounded-full border ${active ? 'bg-teal-100 border-teal-500' : 'bg-white border-gray-200'}`}>
      <Text className={`${active ? 'text-teal-800 font-bold' : 'text-gray-500'}`}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-12 pb-6 bg-white dark:bg-gray-800 rounded-b-[30px] shadow-sm">
        <View>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">Olá, {userFirstName}</Text>
          <Text className="text-gray-900 dark:text-white text-2xl font-bold">Hoje é o <Text className="text-teal-600">Dia {cycleDay}</Text></Text>
        </View>
        <TouchableOpacity className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
          <Bell size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Main Cycle Display */}
      <View className="items-center py-10">
        <View className="w-64 h-64 rounded-full border-[6px] border-teal-100 justify-center items-center bg-white shadow-lg relative">
            <View className="absolute top-0 w-full h-full rounded-full border-[6px] border-teal-500 border-t-transparent -rotate-45 opacity-60" />
            <Text className="text-gray-900 dark:text-teal-900 text-5xl font-bold">{cycleDay}</Text>
            <Text className="text-teal-600 font-medium mt-1">Dia do Ciclo</Text>
            <Text className="text-gray-400 text-xs mt-2">Fase {cyclePhase}</Text>
        </View>
        <Text className="mt-6 text-gray-500 text-center px-10">
          Sua fase fértil deve começar <Text className="font-bold text-teal-600">amanhã</Text>.
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-center space-x-4 px-6 mb-8">
        <TouchableOpacity 
          className="flex-1 bg-teal-600 py-3 rounded-2xl flex-row justify-center items-center shadow-md"
          onPress={() => router.push('/(app)/registro')}
        >
          <Droplets color="white" size={20} className="mr-2" />
          <Text className="text-white font-bold">Registrar Sintoma</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-white border border-gray-200 py-3 px-6 rounded-2xl flex-row justify-center items-center shadow-sm"
          onPress={() => router.push('/(app)/calendario')}
        >
          <CalendarIcon color={Colors.text} size={20} />
        </TouchableOpacity>
      </View>

      {/* Cycle Phases Scroll */}
      <View className="px-6 mb-8">
        <Text className="text-gray-800 dark:text-white font-bold text-lg mb-4">Seu Ciclo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <PhaseCard title="Menstruação" />
          <PhaseCard title="Folicular" />
          <PhaseCard title="Ovulatória" active />
          <PhaseCard title="Lútea" />
        </ScrollView>
      </View>

      {/* Daily Tip */}
      <View className="mx-6 mb-10 bg-pink-50 p-6 rounded-2xl border border-pink-100">
        <Text className="text-pink-800 font-bold mb-2">Dica do Dia</Text>
        <Text className="text-pink-900 leading-6">
          Durante a ovulação, você pode se sentir mais energizada. Aproveite para realizar tarefas que exigem mais disposição!
        </Text>
      </View>
    </ScrollView>
  );
}
