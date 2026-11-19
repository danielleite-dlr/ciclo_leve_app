import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { autenticar, bloqueioAtivo } from '@/services/bloqueio';

// Tela de bloqueio: cobre o app ao abrir e ao voltar do segundo plano, se o bloqueio estiver ativo.
export function AppLock({ children }: { children: ReactNode }) {
  const [travado, setTravadoState] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const autenticando = useRef(false);
  const travadoRef = useRef(false);
  const setTravado = (v: boolean) => {
    travadoRef.current = v;
    setTravadoState(v);
  };

  const desbloquear = useCallback(async () => {
    if (autenticando.current) return;
    autenticando.current = true;
    try {
      if (await autenticar()) setTravado(false);
    } finally {
      autenticando.current = false;
    }
  }, []);

  // Ao abrir
  useEffect(() => {
    bloqueioAtivo().then((ativo) => {
      setTravado(ativo);
      setVerificado(true);
      if (ativo) desbloquear();
    });
  }, [desbloquear]);

  // Ao ir para o segundo plano trava; ao voltar pede a biometria.
  // ('inactive' fica de fora: o proprio prompt do Face ID deixa o app inativo.)
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (estado) => {
      if (estado === 'background' && (await bloqueioAtivo())) setTravado(true);
      if (estado === 'active' && travadoRef.current) desbloquear();
    });
    return () => sub.remove();
  }, [desbloquear]);

  return (
    <View style={styles.flex1}>
      {children}
      {travado || !verificado ? (
        <View style={styles.overlay}>
          {verificado ? (
            <>
              <View style={styles.icon}>
                <MaterialIcons name="lock" size={36} color={Colors.primary.DEFAULT} />
              </View>
              <Text style={styles.title}>CicloLeve bloqueado</Text>
              <Text style={styles.text}>Seus dados estão protegidos.</Text>
              <TouchableOpacity style={styles.btn} onPress={desbloquear} activeOpacity={0.85}>
                <Text style={styles.btnText}>Desbloquear</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    zIndex: 100,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '900', color: Colors.text },
  text: { fontSize: 15, color: Colors.textLight, marginTop: 6 },
  btn: { marginTop: 28, backgroundColor: Colors.primary.DEFAULT, borderRadius: 999, paddingVertical: 14, paddingHorizontal: 40 },
  btnText: { color: Colors.onPrimary, fontSize: 16, fontWeight: '900' },
});
