import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'white' } }}>
      <Stack.Screen name="dados-corpo" />
      <Stack.Screen name="momento-atual" />
      <Stack.Screen name="objetivos" />
    </Stack>
  );
}
