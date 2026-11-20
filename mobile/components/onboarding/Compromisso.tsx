import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Simbolo } from '@/components/Marca';

// Etapa de compromisso do onboarding: ela segura o simbolo ate o circulo cobrir a tela.
// Soltar antes da hora faz o circulo voltar. Leitor de tela: tocar duas vezes conclui direto.

const DURACAO = 1800; // ms segurando
const BOTAO = 150;
const { width, height } = Dimensions.get('window');
// Escala para o circulo passar das bordas da tela, partindo do centro do botao
const ESCALA_FINAL = (Math.hypot(width, height) * 1.15) / BOTAO;

const FRASE_OBJETIVO: Record<string, string> = {
  ENGRAVIDAR: 'acompanhar os meus dias férteis',
  EVITAR_GRAVIDEZ: 'saber quando estou no período fértil',
  EMAGRECER: 'cuidar do meu peso respeitando cada fase',
  INCHACO: 'entender e reduzir o inchaço',
  FOME: 'lidar melhor com a fome ao longo do mês',
  HUMOR: 'cuidar do meu humor e da TPM',
  SONO: 'dormir melhor',
  PELE: 'cuidar da pele e do cabelo',
};

/** "conhecer o meu ciclo, entender e reduzir o inchaço e cuidar do meu humor e da TPM." */
export function fraseCompromisso(objetivos: string[]) {
  const partes = ['conhecer o meu ciclo', ...objetivos.map((o) => FRASE_OBJETIVO[o]).filter(Boolean).slice(0, 2)];
  const texto = partes.length > 1 ? `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}` : partes[0];
  return `${texto}.`;
}

export function Compromisso({ onConcluir }: { onConcluir: () => void }) {
  const progresso = useRef(new Animated.Value(0)).current;
  const pulso = useRef(new Animated.Value(0)).current;
  const [segurando, setSegurando] = useState(false);
  const [feito, setFeito] = useState(false);
  const vibracao = useRef<ReturnType<typeof setInterval> | null>(null);

  // Halo pulsando enquanto ela ainda nao tocou
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulso, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulso]);

  useEffect(() => () => pararVibracao(), []);

  const pararVibracao = () => {
    if (vibracao.current) clearInterval(vibracao.current);
    vibracao.current = null;
  };

  const concluir = () => {
    pararVibracao();
    setFeito(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
    setTimeout(onConcluir, 900);
  };

  const comecar = () => {
    if (feito) return;
    setSegurando(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
    // Batidas leves enquanto segura, como um coracao acelerando
    vibracao.current = setInterval(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => null), 300);
    Animated.timing(progresso, {
      toValue: 1,
      duration: DURACAO,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) concluir();
    });
  };

  const soltar = () => {
    if (feito) return;
    setSegurando(false);
    pararVibracao();
    progresso.stopAnimation();
    Animated.spring(progresso, { toValue: 0, friction: 6, useNativeDriver: true }).start();
  };

  const escala = progresso.interpolate({ inputRange: [0, 1], outputRange: [1, ESCALA_FINAL] });
  const escalaHalo = Animated.add(escala, pulso.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.6] }));
  const opacidadeIcone = progresso.interpolate({ inputRange: [0, 0.15], outputRange: [1, 0], extrapolate: 'clamp' });

  return (
    <View style={styles.area}>
      <View style={styles.centro}>
        <Animated.View pointerEvents="none" style={[styles.halo, { transform: [{ scale: escalaHalo }] }]} />
        <Animated.View pointerEvents="none" style={[styles.circulo, { transform: [{ scale: escala }] }]} />
        <Pressable
          onPressIn={comecar}
          onPressOut={soltar}
          style={styles.toque}
          accessibilityRole="button"
          accessibilityLabel="Assumir compromisso"
          accessibilityHint="Toque duas vezes para confirmar"
          accessibilityActions={[{ name: 'activate' }]}
          onAccessibilityAction={() => !feito && concluir()}
        >
          <Text style={styles.dentro}>{feito ? 'Combinado!' : segurando ? 'Não solte!' : 'Segure'}</Text>
          <Simbolo tamanho={58} claro />
        </Pressable>
      </View>
      <Animated.Text style={[styles.instrucao, { opacity: opacidadeIcone }]}>
        Toque e segure o símbolo{'\n'}para firmar o seu compromisso.
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  area: { alignItems: 'center', marginTop: 36 },
  centro: { width: BOTAO, height: BOTAO, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: BOTAO,
    height: BOTAO,
    borderRadius: BOTAO / 2,
    backgroundColor: Colors.primary.DEFAULT,
    opacity: 0.18,
  },
  circulo: {
    position: 'absolute',
    width: BOTAO,
    height: BOTAO,
    borderRadius: BOTAO / 2,
    backgroundColor: Colors.primary.DEFAULT,
  },
  toque: { width: BOTAO, height: BOTAO, alignItems: 'center', justifyContent: 'center', gap: 6 },
  dentro: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
  instrucao: {
    marginTop: 48,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: Colors.primary.DEFAULT,
  },
});
