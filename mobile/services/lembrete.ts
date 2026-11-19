import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

// Lembrete diario local (fica no aparelho, sem servidor). A preferencia e salva no SecureStore.

const KEY = 'cicloleve_lembrete';
const NOTIF_ID = 'lembrete-diario';

export type LembretePref = { ativo: boolean; hora: number; minuto: number };
export const LEMBRETE_PADRAO: LembretePref = { ativo: false, hora: 20, minuto: 0 };

// Mostra a notificacao mesmo com o app aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function lerLembrete(): Promise<LembretePref> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? { ...LEMBRETE_PADRAO, ...JSON.parse(raw) } : LEMBRETE_PADRAO;
  } catch {
    return LEMBRETE_PADRAO;
  }
}

/** Salva a preferencia e (re)agenda. Retorna false se a permissao de notificacao foi negada. */
export async function salvarLembrete(pref: LembretePref): Promise<boolean> {
  await Notifications.cancelScheduledNotificationAsync(NOTIF_ID).catch(() => null);

  if (pref.ativo) {
    const atual = await Notifications.getPermissionsAsync();
    const status = atual.granted ? atual : await Notifications.requestPermissionsAsync();
    if (!status.granted) {
      await SecureStore.setItemAsync(KEY, JSON.stringify({ ...pref, ativo: false }));
      return false;
    }
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIF_ID,
      content: {
        title: 'Como você está hoje?',
        body: 'Leva menos de 1 minuto registrar seus sintomas.',
        data: { rota: '/(app)/registro' },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: pref.hora, minute: pref.minuto },
    });
  }

  await SecureStore.setItemAsync(KEY, JSON.stringify(pref));
  return true;
}

/** Desliga e remove o lembrete (ex.: ao sair da conta). */
export async function limparLembrete() {
  await Notifications.cancelScheduledNotificationAsync(NOTIF_ID).catch(() => null);
  await SecureStore.deleteItemAsync(KEY).catch(() => null);
}

export const formatarHora = (p: LembretePref) => `${String(p.hora).padStart(2, '0')}:${String(p.minuto).padStart(2, '0')}`;
