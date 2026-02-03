import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { User, Settings, LogOut, ChevronRight, Moon, Bell } from 'lucide-react-native';
import { removeToken } from '@/services/storage';

export default function Perfil() {
  const router = useRouter();

  const handleLogout = async () => {
    await removeToken();
    router.replace('/(auth)/login');
  };

  const SettingItem = ({ icon: Icon, label, value, onPress, isSwitch }: any) => (
    <TouchableOpacity 
      onPress={onPress} 
      className="flex-row items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700"
      disabled={isSwitch}
    >
      <View className="flex-row items-center">
        <View className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full mr-3">
          <Icon size={20} color={Colors.text} />
        </View>
        <Text className="text-gray-900 dark:text-white font-medium">{label}</Text>
      </View>
      <View className="flex-row items-center">
        {value && <Text className="text-gray-500 mr-2">{value}</Text>}
        {isSwitch ? (
          <Switch trackColor={{ false: "#767577", true: Colors.primary.light }} thumbColor={Colors.primary.DEFAULT} value={true} />
        ) : (
          <ChevronRight size={20} color={Colors.textLight} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="bg-white dark:bg-gray-800 pt-16 pb-8 px-6 items-center border-b border-gray-200 dark:border-gray-700">
        <View className="w-24 h-24 bg-teal-100 rounded-full items-center justify-center mb-4 border-4 border-white dark:border-gray-700 shadow-sm">
          <User size={48} color={Colors.primary.DEFAULT} />
        </View>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Daniela Silva</Text>
        <Text className="text-gray-500 dark:text-gray-400">daniela@email.com</Text>
      </View>

      <ScrollView className="flex-1 pt-6">
        <Text className="px-6 mb-2 text-sm font-bold text-gray-500 uppercase tracking-wider">Configurações do Ciclo</Text>
        <View className="bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 mb-8">
          <SettingItem icon={Settings} label="Duração do Ciclo" value="28 dias" />
          <SettingItem icon={Settings} label="Duração da Menstruação" value="5 dias" />
          <SettingItem icon={Bell} label="Notificações" isSwitch />
        </View>

        <Text className="px-6 mb-2 text-sm font-bold text-gray-500 uppercase tracking-wider">App</Text>
        <View className="bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 mb-8">
            <SettingItem icon={Moon} label="Tema Escuro" isSwitch />
        </View>

        <TouchableOpacity 
          onPress={handleLogout}
          className="mx-6 p-4 bg-red-50 rounded-xl flex-row justify-center items-center border border-red-100"
        >
          <LogOut size={20} color="#EF4444" className="mr-2" />
          <Text className="text-red-500 font-bold">Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
