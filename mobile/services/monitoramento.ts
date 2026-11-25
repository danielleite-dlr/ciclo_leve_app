import Constants, { ExecutionEnvironment } from 'expo-constants';

// Relatorio de falhas (Firebase Crashlytics) e estatisticas de uso (Google Analytics do Firebase).
// So existem nos builds nativos (APK/AAB): no Expo Go o modulo nativo nao esta presente, entao tudo aqui vira no-op.
// Nunca mandar dados de saude, nome ou e-mail para ca: so o erro e o nome da tela.
// O Analytics nao recebe o id da usuaria nem o ID de publicidade (ver firebase.json e app.json).

type Crashlytics = {
  log: (c: unknown, msg: string) => void;
  recordError: (c: unknown, e: Error) => void;
  getCrashlytics: () => unknown;
};

type Analytics = {
  getAnalytics: () => unknown;
  logScreenView: (a: unknown, p: { screen_name: string; screen_class: string }) => Promise<void>;
};

let mod: Crashlytics | null = null;
let instancia: unknown = null;
let analyticsMod: Analytics | null = null;
let analytics: unknown = null;

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
  try {
    analyticsMod = require('@react-native-firebase/analytics') as Analytics;
    analytics = analyticsMod.getAnalytics();
  } catch {
    analyticsMod = null;
    analytics = null;
  }
}

/** Registra a tela aberta (ex.: "(app)/conteudo/[id]"), para o painel de uso do Firebase. */
export function registrarTela(nome: string) {
  if (!analyticsMod || !analytics) return;
  analyticsMod.logScreenView(analytics, { screen_name: nome, screen_class: nome }).catch(() => {});
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
