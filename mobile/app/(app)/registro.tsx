import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { X, Check } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import api from '@/services/api';

export default function Registro() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [fluxo, setFluxo] = useState('');
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [humor, setHumor] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    // Gate simples: se não houver ciclo/perfil, manda pro onboarding
    (async () => {
      try {
        const res = await api.get('/perfil');
        if (!res.data?.ciclo) {
          Alert.alert('Complete seu onboarding', 'Antes de registrar, finalize seu ciclo para calcular a fase corretamente.');
          router.replace('/(onboarding)/dados-corpo');
        }
      } catch (e) {
        // Se falhar, não bloqueia a tela (pode ser instabilidade); o save já trata erro.
      }
    })();
  }, [router]);

  const toggleSintoma = (sintoma: string) => {
    if (sintomas.includes(sintoma)) {
      setSintomas(sintomas.filter(s => s !== sintoma));
    } else {
      setSintomas([...sintomas, sintoma]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Mapeamento mínimo pro backend (DTO atual):
      // - humorTags: usamos humor + sintomas selecionados
      // - notas: texto livre
      await api.post('/registros', {
        humorTags: [humor, ...sintomas].filter(Boolean),
        notas: notas?.trim() || undefined,
      });

      Alert.alert('Salvo!', 'Seu registro de hoje foi salvo.');
      router.replace('/(app)/home');
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        'Erro ao salvar registro',
        error.response?.data?.message || error.response?.data?.error || 'Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const OptionChip = ({ label, selected, onPress }: { label: string, selected: boolean, onPress: () => void }) => (
    <TouchableOpacity 
      onPress={onPress}
      className={`px-4 py-2 rounded-full border mr-2 mb-2 ${selected ? 'bg-teal-100 border-teal-500' : 'bg-white border-gray-200'}`}
    >
      <Text className={`${selected ? 'text-teal-800 font-bold' : 'text-gray-600'}`}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <X color={Colors.text} size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Registrar</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading} className="p-2 -mr-2">
          <Check color={Colors.primary.DEFAULT} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        <Text className="text-gray-500 mb-6">Como você está se sentindo hoje?</Text>

        {/* Section: Fluxo */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 dark:text-white mb-3">Fluxo Menstrual</Text>
          <View className="flex-row flex-wrap">
            {['Inexistente', 'Leve', 'Médio', 'Intenso'].map(opt => (
              <OptionChip 
                key={opt} label={opt} 
                selected={fluxo === opt} 
                onPress={() => setFluxo(opt)} 
              />
            ))}
          </View>
        </View>

        {/* Section: Sintomas */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 dark:text-white mb-3">Sintomas Físicos</Text>
          <View className="flex-row flex-wrap">
            {['Cólica', 'Dor de Cabeça', 'Inchaço', 'Acne', 'Cansaço', 'Tontura'].map(opt => (
              <OptionChip 
                key={opt} label={opt} 
                selected={sintomas.includes(opt)} 
                onPress={() => toggleSintoma(opt)} 
              />
            ))}
          </View>
        </View>

        {/* Section: Humor */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 dark:text-white mb-3">Humor</Text>
          <View className="flex-row flex-wrap">
            {['Feliz', 'Triste', 'Ansiosa', 'Irritada', 'Sensível', 'Neutra'].map(opt => (
              <OptionChip 
                key={opt} label={opt} 
                selected={humor === opt} 
                onPress={() => setHumor(opt)} 
              />
            ))}
          </View>
        </View>

        {/* Section: Notas */}
        <View className="mb-12">
          <Text className="text-lg font-bold text-gray-800 dark:text-white mb-3">Notas</Text>
          <TextInput 
            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-gray-800 dark:text-white min-h-[100px]"
            placeholder="Alguma observação importante?"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            value={notas}
            onChangeText={setNotas}
          />
        </View>
      </ScrollView>
    </View>
  );
}
