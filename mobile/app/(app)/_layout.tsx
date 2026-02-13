import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Bottom nav (referencia): Home | Ciclo | (espaco FAB) | Insights | Perfil
// O CTA "Registrar meu dia" fica como FAB dentro da Home (nao como tab).
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
        name="spacer"
        options={{
          title: '',
          tabBarLabel: () => null,
          tabBarButton: () => <View style={styles.spacer} />, // abre espaco pro FAB
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

      {/* rotas existentes fora do tab bar */}
      <Tabs.Screen name="registro" options={{ href: null }} />
      <Tabs.Screen name="conteudo" options={{ href: null }} />
      <Tabs.Screen name="dica-do-dia" options={{ href: null }} />
      <Tabs.Screen name="objetivos" options={{ href: null }} />
      <Tabs.Screen name="notificacoes" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
  spacer: {
    width: 48,
  },
});
