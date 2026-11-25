import Constants, { ExecutionEnvironment } from 'expo-constants';

// Relatorio de falhas (Firebase Crashlytics). So existe nos builds nativos (APK/AAB):
// no Expo Go o modulo nativo nao esta presente, entao tudo aqui vira no-op.
// Nunca mandar dados de saude, nome ou e-mail para ca: so o erro e o nome da tela.

type Crashlytics = {
  log: (c: unknown, msg: string) => void;
  recordError: (c: unknown, e: Error) => void;
  getCrashlytics: () => unknown;
};

let mod: Crashlytics | null = null;
let instancia: unknown = null;

export function iniciarMonitoramento() {
  if (instancia || Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return;
  try {
    // require tardio: importar no topo quebraria o app no Expo Go
    mod = require('@react-native-firebase/crashlytics') as Crashlytics;
    // Criar a instancia ja liga o envio de erros JS fatais e de promessas rejeitadas sem tratamento
    instancia = mod.getCrashlytics();
  } catch {
    mod = null;
    instancia = null;
  }
}

/** Registra um erro tratado (ex.: tela de erro). */
export function registrarErro(e: unknown, contexto?: string) {
  if (!mod || !instancia) return;
  try {
    if (contexto) mod.log(instancia, contexto);
    mod.recordError(instancia, e instanceof Error ? e : new Error(String(e)));
  } catch {
    // monitoramento nunca pode derrubar o app
  }
}
