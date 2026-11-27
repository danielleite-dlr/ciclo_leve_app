import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Application from 'expo-application';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import api from './api';
import { getToken } from './storage';

// Avisa o servidor na primeira abertura depois de instalar e na primeira depois de atualizar,
// para a dona do app receber o alerta. Guarda o ultimo build visto; desinstalar apaga esse registro.
// Envia so versao, plataforma e modelo do aparelho.

const CHAVE = 'cicloleve_build_visto';

export async function avisarAbertura() {
  if (Platform.OS === 'web' || Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return;
  try {
    const build = Application.nativeBuildVersion;
    const versao = Application.nativeApplicationVersion;
    if (!build || !versao) return;

    const anterior = await SecureStore.getItemAsync(CHAVE);
    if (anterior === build) return;

    // Sem registro mas com login salvo: e alguem que ja tinha o app (antes deste aviso existir) e atualizou
    const evento = anterior || (await getToken()) ? 'atualizacao' : 'instalacao';
    const c = Platform.constants as { Brand?: string; Model?: string };
    const aparelho = [c.Brand, c.Model].filter(Boolean).join(' ').slice(0, 60) || null;

    await api.post('/app/abertura', {
      evento,
      versao,
      build,
      buildAnterior: anterior,
      plataforma: Platform.OS,
      aparelho,
    });
    // So marca depois de avisar: sem internet, tenta de novo na proxima abertura
    await SecureStore.setItemAsync(CHAVE, build);
  } catch {
    // aviso nunca pode atrapalhar o app
  }
}
