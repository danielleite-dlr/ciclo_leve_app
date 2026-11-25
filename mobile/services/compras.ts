import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

// Compra das assinaturas pela loja, via RevenueCat. Por enquanto so Android (Google Play).
// A chave publica vem do backend (GET /assinatura), entao da para ligar a cobranca sem gerar outro build.
// No Expo Go e no iPhone o modulo fica desligado e o app usa a compra simulada do backend, se ela estiver liberada.

type Sdk = typeof import('react-native-purchases').default;

const ENTITLEMENT = 'premium';
let sdk: Sdk | null = null;
let usuarioAtual: string | null = null;
let aoMudarCliente: ((ativo: boolean) => void) | null = null;

function carregarSdk(): Sdk | null {
  if (Platform.OS !== 'android' || Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return null;
  try {
    // require tardio: importar no topo quebraria o app no Expo Go
    return require('react-native-purchases').default as Sdk;
  } catch {
    return null;
  }
}

/** Liga o RevenueCat para a usuaria logada. Retorna true se a compra pela loja esta disponivel. */
export async function prepararCompras(chave: string | null | undefined, userId: string): Promise<boolean> {
  if (!chave) return false;
  try {
    if (!sdk) {
      const s = carregarSdk();
      if (!s) return false;
      // Sem coleta automatica de identificadores do aparelho: so precisamos validar a compra
      s.configure({ apiKey: chave, appUserID: userId, automaticDeviceIdentifierCollectionEnabled: false });
      s.addCustomerInfoUpdateListener((info: CustomerInfo) => aoMudarCliente?.(!!info.entitlements.active[ENTITLEMENT]));
      sdk = s;
      usuarioAtual = userId;
    } else if (usuarioAtual !== userId) {
      await sdk.logIn(userId);
      usuarioAtual = userId;
    }
    return true;
  } catch {
    return false;
  }
}

/** Avisado quando a loja muda o estado da assinatura (ex.: compra concluida, renovacao). */
export function aoMudarAssinatura(cb: ((ativo: boolean) => void) | null) {
  aoMudarCliente = cb;
}

export type PacoteLoja = {
  plano: 'MENSAL' | 'ANUAL';
  /** preco formatado pela loja, ja na moeda da usuaria (ex.: "R$ 89,90") */
  preco: string;
  /** dias gratis que a loja oferece para esta usuaria (0 = sem teste ou ja usou) */
  testeDias: number;
  pacote: PurchasesPackage;
};

const DIAS: Record<string, number> = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 };

/** Planos a venda, com preco e teste gratis vindos do Google Play. */
export async function carregarPacotes(): Promise<PacoteLoja[]> {
  if (!sdk) return [];
  const ofertas = await sdk.getOfferings();
  return (ofertas.current?.availablePackages ?? [])
    .filter((p) => p.packageType === 'ANNUAL' || p.packageType === 'MONTHLY')
    .map((p) => {
      const gratis = p.product.defaultOption?.freePhase?.billingPeriod;
      return {
        plano: p.packageType === 'ANNUAL' ? 'ANUAL' : 'MENSAL',
        preco: p.product.priceString,
        testeDias: gratis ? gratis.value * (DIAS[gratis.unit] ?? 0) : 0,
        pacote: p,
      } as PacoteLoja;
    });
}

/** Abre a compra do Google Play. 'cancelado' quando a usuaria fecha a janela da loja. */
export async function comprar(pacote: PurchasesPackage): Promise<'ok' | 'cancelado'> {
  if (!sdk) throw new Error('Compras indisponíveis');
  try {
    await sdk.purchasePackage(pacote);
    return 'ok';
  } catch (e: any) {
    if (e?.userCancelled) return 'cancelado';
    throw e;
  }
}

/** Recupera uma assinatura feita antes (outro aparelho, reinstalacao). true se ha assinatura ativa. */
export async function restaurar(): Promise<boolean> {
  if (!sdk) return false;
  const info = await sdk.restorePurchases();
  return !!info.entitlements.active[ENTITLEMENT];
}

/** Ao sair da conta: a proxima usuaria neste aparelho nao herda a assinatura. */
export async function sairCompras() {
  if (!sdk || !usuarioAtual) return;
  usuarioAtual = null;
  try {
    await sdk.logOut();
  } catch {
    // logOut falha se ja estiver anonimo; nada a fazer
  }
}

/** Pagina de assinaturas do Google Play, onde se cancela ou troca de plano. */
export const URL_GERENCIAR_ASSINATURA = 'https://play.google.com/store/account/subscriptions?package=com.cicloleve.app';
