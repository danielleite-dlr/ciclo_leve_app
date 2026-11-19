import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

// Bloqueio do app com biometria (Face ID/Touch ID/digital) ou o codigo do aparelho.
// A preferencia fica so no aparelho.

const KEY = 'cicloleve_bloqueio';

export async function bloqueioAtivo(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(KEY)) === '1';
  } catch {
    return false;
  }
}

/** Nome amigavel do metodo disponivel (para os textos da tela). */
export async function nomeDoMetodo(): Promise<string> {
  const tipos: LocalAuthentication.AuthenticationType[] = await LocalAuthentication.supportedAuthenticationTypesAsync().catch(() => []);
  if (tipos.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'Face ID';
  if (tipos.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'digital';
  return 'código do aparelho';
}

export async function autenticar(motivo = 'Desbloquear o CicloLeve'): Promise<boolean> {
  const res = await LocalAuthentication.authenticateAsync({
    promptMessage: motivo,
    cancelLabel: 'Cancelar',
    disableDeviceFallback: false, // permite usar o codigo do aparelho se a biometria falhar
  });
  return res.success;
}

/** Liga/desliga. Para ligar, exige que o aparelho tenha bloqueio configurado e confirma a identidade. */
export async function definirBloqueio(ativo: boolean): Promise<{ ok: boolean; motivo?: string }> {
  if (ativo) {
    const temSeguranca = await LocalAuthentication.getEnrolledLevelAsync().catch(() => LocalAuthentication.SecurityLevel.NONE);
    if (temSeguranca === LocalAuthentication.SecurityLevel.NONE) {
      return { ok: false, motivo: 'Configure um código ou biometria nos Ajustes do aparelho para usar o bloqueio.' };
    }
    if (!(await autenticar('Confirme para ativar o bloqueio'))) {
      return { ok: false, motivo: 'Não foi possível confirmar sua identidade. Tente novamente.' };
    }
    await SecureStore.setItemAsync(KEY, '1');
  } else {
    // O app ja esta desbloqueado nesse momento; nao precisa pedir a biometria de novo.
    await SecureStore.deleteItemAsync(KEY);
  }
  return { ok: true };
}

export async function limparBloqueio() {
  await SecureStore.deleteItemAsync(KEY).catch(() => null);
}
