import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { QuickLogProvider, useQuickLog } from '@/contexts/QuickLogContext';
import { useAssinatura } from '@/contexts/AssinaturaContext';

// Botao central "+": abre o registro rapido (menstruacao, sintomas, relacao, teste) em qualquer aba.
function PlusTabButton() {
  const { openMenu } = useQuickLog();
  return (
    <View style={styles.plusSlot}>
      <TouchableOpacity
        onPress={openMenu}
        style={styles.plusButton}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Registrar"
      >
        <MaterialIcons name="add" size={32} color={Colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
}

// Tocar no lembrete diario abre a tela indicada na notificacao (ex.: Registro Diario).
function useAbrirPelaNotificacao() {
  const router = useRouter();
  const ultima = Notifications.useLastNotificationResponse();
  useEffect(() => {
    const rota = ultima?.notification.request.content.data?.rota;
    if (typeof rota === 'string') router.push(rota as any);
  }, [ultima, router]);
}

// Bottom nav: Home | Ciclo | (+) | Insights | Perfil
export default function AppLayout() {
  useAbrirPelaNotificacao();
  // Plano da usuaria (o que esta liberado) assim que entra no app.
  const { refresh: carregarPlano } = useAssinatura();
  // Android desenha o app ate a borda: somar a area dos botoes/gesto do sistema para a barra nao ficar embaixo deles
  const { bottom } = useSafeAreaInsets();
  const tabBarStyle =
    Platform.OS === 'android' ? [styles.tabBar, { height: 68 + bottom, paddingBottom: 10 + bottom }] : styles.tabBar;
  useEffect(() => {
    carregarPlano();
  }, [carregarPlano]);
  return (
    <QuickLogProvider>
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary.DEFAULT,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle,
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
          tabBarButton: () => <PlusTabButton />,
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
      <Tabs.Screen name="artigo" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="dica-do-dia" options={{ href: null }} />
      <Tabs.Screen name="objetivos" options={{ href: null }} />
      <Tabs.Screen name="notificacoes" options={{ href: null }} />
      <Tabs.Screen name="excluir-conta" options={{ href: null }} />
      <Tabs.Screen name="historico" options={{ href: null }} />
      <Tabs.Screen name="lembrete" options={{ href: null }} />
      <Tabs.Screen name="relatorio" options={{ href: null }} />
      <Tabs.Screen name="editar-dados" options={{ href: null }} />
      <Tabs.Screen name="alterar-senha" options={{ href: null }} />
      <Tabs.Screen name="planos" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
    </QuickLogProvider>
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
  plusSlot: {
    flex: 1,
    alignItems: 'center',
  },
  // Circulo rose elevado, saindo um pouco acima da barra
  plusButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginTop: -22,
    backgroundColor: Colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.surface,
    shadowColor: Colors.primary.dark,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
