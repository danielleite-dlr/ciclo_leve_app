import { ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

// Pecas visuais do onboarding: uma pergunta por tela, barra de progresso, voltar e "Pular".

export function Etapa({
  progresso,
  titulo,
  subtitulo,
  onVoltar,
  onPular,
  children,
  rodape,
  rolar = true,
}: {
  progresso: number; // 0..1
  titulo: string;
  subtitulo?: string;
  onVoltar?: () => void;
  onPular?: () => void;
  children?: ReactNode;
  rodape?: ReactNode;
  rolar?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const corpo = (
    <>
      <Text style={styles.titulo}>{titulo}</Text>
      {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
      <View style={styles.conteudo}>{children}</View>
    </>
  );
  return (
    <View style={[styles.tela, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topo}>
        <TouchableOpacity
          onPress={onVoltar}
          disabled={!onVoltar}
          style={[styles.icone, !onVoltar && { opacity: 0 }]}
          accessibilityLabel="Voltar"
        >
          <MaterialIcons name="arrow-back-ios-new" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.trilho}>
          <View style={[styles.barra, { width: `${Math.max(4, Math.min(1, progresso) * 100)}%` }]} />
        </View>
        <TouchableOpacity onPress={onPular} disabled={!onPular} style={[styles.pular, !onPular && { opacity: 0 }]}>
          <Text style={styles.pularTexto}>Pular</Text>
        </TouchableOpacity>
      </View>

      {rolar ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {corpo}
        </ScrollView>
      ) : (
        <View style={[styles.scroll, { flex: 1 }]}>{corpo}</View>
      )}

      {rodape ? <View style={[styles.rodape, { paddingBottom: insets.bottom + 12 }]}>{rodape}</View> : null}
    </View>
  );
}

export function BotaoAvancar({
  titulo = 'Avançar',
  onPress,
  desabilitado,
  carregando,
}: {
  titulo?: string;
  onPress: () => void;
  desabilitado?: boolean;
  carregando?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.botao, (desabilitado || carregando) && { opacity: 0.45 }]}
      onPress={onPress}
      disabled={desabilitado || carregando}
      activeOpacity={0.85}
    >
      {carregando ? <ActivityIndicator color={Colors.onPrimary} /> : <Text style={styles.botaoTexto}>{titulo}</Text>}
    </TouchableOpacity>
  );
}

/** Opcao de resposta. Quando escolhida, mostra o texto explicando o que o app faz com ela. */
export function Opcao({
  titulo,
  explicacao,
  selecionada,
  onPress,
  multipla,
  icone,
}: {
  titulo: string;
  explicacao?: string;
  selecionada: boolean;
  onPress: () => void;
  multipla?: boolean;
  icone?: keyof typeof MaterialIcons.glyphMap;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.opcao, selecionada && styles.opcaoAtiva]}
      accessibilityRole={multipla ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selecionada }}
    >
      <View style={styles.opcaoLinha}>
        {icone ? (
          <MaterialIcons name={icone} size={22} color={selecionada ? Colors.onPrimary : Colors.primary.DEFAULT} />
        ) : null}
        <Text style={[styles.opcaoTitulo, selecionada && styles.opcaoTituloAtivo]}>{titulo}</Text>
        {multipla ? (
          <MaterialIcons
            name={selecionada ? 'check-circle' : 'radio-button-unchecked'}
            size={22}
            color={selecionada ? Colors.onPrimary : '#C4C4C4'}
          />
        ) : null}
      </View>
      {selecionada && explicacao ? <Text style={styles.opcaoExplicacao}>{explicacao}</Text> : null}
    </TouchableOpacity>
  );
}

/** Seletor de rolagem (roda do iOS). */
export function Roda({
  valor,
  opcoes,
  onChange,
  largura,
}: {
  valor: number;
  opcoes: { label: string; value: number }[];
  onChange: (v: number) => void;
  largura?: number;
}) {
  return (
    <Picker
      selectedValue={valor}
      onValueChange={(v) => onChange(Number(v))}
      style={{ width: largura ?? '100%' }}
      itemStyle={styles.rodaItem}
    >
      {opcoes.map((o) => (
        <Picker.Item key={o.value} label={o.label} value={o.value} color={Colors.text} />
      ))}
    </Picker>
  );
}

export const faixa = (de: number, ate: number, sufixo = '') =>
  Array.from({ length: ate - de + 1 }, (_, i) => ({ label: `${de + i}${sufixo}`, value: de + i }));

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Colors.background },
  topo: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8, height: 44 },
  icone: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  trilho: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E8DDE0', overflow: 'hidden' },
  barra: { height: 4, borderRadius: 2, backgroundColor: Colors.primary.DEFAULT },
  pular: { minWidth: 52, alignItems: 'flex-end', paddingHorizontal: 4 },
  pularTexto: { fontSize: 15, color: Colors.textLight, fontWeight: '600' },
  scroll: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24 },
  titulo: { fontSize: 26, fontWeight: '900', color: Colors.text, textAlign: 'center', lineHeight: 32 },
  subtitulo: { fontSize: 15, color: Colors.textLight, textAlign: 'center', marginTop: 10, lineHeight: 21 },
  conteudo: { marginTop: 24, gap: 10 },
  rodape: { paddingHorizontal: 20, paddingTop: 8 },
  botao: {
    backgroundColor: Colors.primary.DEFAULT,
    borderRadius: 999,
    paddingVertical: 17,
    alignItems: 'center',
  },
  botaoTexto: { color: Colors.onPrimary, fontSize: 17, fontWeight: '900' },
  opcao: { backgroundColor: Colors.surface, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 18 },
  opcaoAtiva: { backgroundColor: Colors.primary.DEFAULT },
  opcaoLinha: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  opcaoTitulo: { flex: 1, fontSize: 17, color: Colors.text, fontWeight: '600' },
  opcaoTituloAtivo: { color: Colors.onPrimary },
  opcaoExplicacao: { color: Colors.onPrimary, fontSize: 14, lineHeight: 20, marginTop: 10, opacity: 0.95 },
  rodaItem: { fontSize: 22, color: Colors.text, height: 200 },
});
