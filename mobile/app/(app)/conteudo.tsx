import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Search } from 'lucide-react-native';

export default function Conteudo() {
  const articles = [
    {
      id: 1,
      title: 'Alimentação na Fase Lútea',
      category: 'Nutrição',
      color: 'bg-orange-100 text-orange-700',
      description: 'Descubra quais alimentos podem ajudar a reduzir os sintomas da TPM.'
    },
    {
      id: 2,
      title: 'Exercícios para Cada Fase',
      category: 'Fitness',
      color: 'bg-blue-100 text-blue-700',
      description: 'Como adaptar seu treino de acordo com sua energia e ciclo hormonal.'
    },
    {
      id: 3,
      title: 'Entendendo a Ovulação',
      category: 'Educação',
      color: 'bg-pink-100 text-pink-700',
      description: 'O que acontece no seu corpo durante o período mais fértil do mês.'
    },
    {
      id: 4,
      title: 'Sono e Hormônios',
      category: 'Bem-estar',
      color: 'bg-purple-100 text-purple-700',
      description: 'Por que você sente mais sono antes da menstruação?'
    }
  ];

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="px-6 pt-12 pb-6 border-b border-gray-100 dark:border-gray-800">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Conteúdo e Dicas</Text>
        
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-xl">
          <Search size={20} color={Colors.textLight} className="mr-2" />
          <Text className="text-gray-400">Buscar artigos...</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        <Text className="text-lg font-bold text-gray-800 dark:text-white mb-4">Recomendado para você</Text>
        
        {articles.map((article) => (
          <TouchableOpacity 
            key={article.id} 
            className="mb-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <View className="flex-row justify-between items-start mb-2">
              <View className={`px-2 py-1 rounded-md ${article.color.split(' ')[0]}`}>
                <Text className={`text-xs font-bold ${article.color.split(' ')[1]}`}>{article.category}</Text>
              </View>
            </View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">{article.title}</Text>
            <Text className="text-gray-500 dark:text-gray-400 leading-5">{article.description}</Text>
          </TouchableOpacity>
        ))}
        
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
