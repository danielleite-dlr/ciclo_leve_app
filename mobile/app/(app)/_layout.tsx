import { Tabs } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Platform, View } from 'react-native';
import { Home, Calendar, PlusCircle, BookOpen, User } from 'lucide-react-native';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary.DEFAULT,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          backgroundColor: Colors.background,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }} 
      />
      <Tabs.Screen 
        name="calendario" 
        options={{
          title: 'Calendário',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }} 
      />
      <Tabs.Screen 
        name="registro" 
        options={{
          title: 'Registrar',
          tabBarIcon: ({ color, size }) => (
            <View className="mb-4 bg-teal-600 rounded-full p-2 shadow-lg shadow-teal-600/30">
              <PlusCircle color="white" size={32} />
            </View>
          ),
          tabBarLabel: () => null, // Hide label for the FAB-like button
        }} 
      />
      <Tabs.Screen 
        name="conteudo" 
        options={{
          title: 'Dicas',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }} 
      />
      <Tabs.Screen 
        name="perfil" 
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }} 
      />
    </Tabs>
  );
}
