import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';

// Cada etapa cuida da propria area segura (topo com voltar, progresso e "Pular").
export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen name="inicio" />
      <Stack.Screen name="passos" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
