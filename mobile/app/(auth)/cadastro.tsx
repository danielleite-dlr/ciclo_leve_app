import { Redirect } from 'expo-router';

// O cadastro agora acontece no fim do onboarding (depois das perguntas).
export default function Cadastro() {
  return <Redirect href="/(onboarding)/inicio" />;
}
