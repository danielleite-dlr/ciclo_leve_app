import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

// Bottom nav (modelo): Home | Ciclo | Insights | Perfil
// O CTA "Registrar meu dia" fica como FAB dentro da Home (não como tab), para bater com a referência.
export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#13ec5b',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendario"
        options={{
          title: 'Ciclo',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="calendar-month" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="insights" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} />,
        }}
      />

      {/* Mantém rota existente fora do tab bar */}
      <Tabs.Screen name="registro" options={{ href: null }} />
      <Tabs.Screen name="conteudo" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
});
