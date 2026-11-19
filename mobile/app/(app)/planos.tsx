import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/services/api';
import { Colors } from '@/constants/Colors';
import { formatarPreco, ModuloId, PlanoInfo, StatusAssinatura, useAssinatura } from '@/contexts/AssinaturaContext';

// Oferta dos planos. Aparece no fim do onboarding e quando a usuaria toca num recurso Premium.
// A compra ainda e simulada (sem loja); o backend so registra o plano.

const ICONES: Record<ModuloId, keyof typeof MaterialIcons.glyphMap> = {
  DICAS_ADAPTADAS: 'tips-and-updates',
  FERTILIDADE: 'favorite',
  HISTORICO_COMPLETO: 'insights',
  RELATORIO: 'description',
  BIBLIOTECA: 'menu-book',
};

const NOME_MODULO: Record<ModuloId, string> = {
  DICAS_ADAPTADAS: 'As dicas ajustadas ao seu dia',
  FERTILIDADE: 'A área de fertilidade',
  HISTORICO_COMPLETO: 'O histórico completo',
  RELATORIO: 'O relatório para o médico',
  BIBLIOTECA: 'Este artigo',
};

const fmtData = (iso: string) => format(new Date(iso), "d 'de' MMMM", { locale: ptBR });

export default function Planos() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { origem, modulo } = useLocalSearchParams<{ origem?: string; modulo?: ModuloId }>();
  const doOnboarding = origem === 'onboarding';
  const { status, refresh, definir } = useAssinatura();
  const [escolhido, setEscolhido] = useState<PlanoInfo['id']>('ANUAL');
  const [enviando, setEnviando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    if (status?.planos?.length && !status.planos.some((p) => p.id === escolhido)) setEscolhido(status.planos[0].id);
  }, [status, escolhido]);

  const sair = () => {
    if (doOnboarding || !router.canGoBack()) router.replace('/(app)/home');
    else router.back();
  };

  const assinar = async () => {
    setEnviando(true);
    try {
      const { data } = await api.post<StatusAssinatura>('/assinatura/assinar', { plano: escolhido });
      definir(data);
      Alert.alert(
        'Premium ativado',
        data.emTeste && data.expiraEm
          ? `Seu teste grátis vai até ${fmtData(data.expiraEm)}.`
          : 'Todos os recursos já estão liberados.',
        [{ text: 'OK', onPress: sair }]
      );
    } catch (error: any) {
      Alert.alert('Não foi possível assinar', error?.response?.data?.error || 'Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const cancelar = () => {
    Alert.alert('Cancelar assinatura?', 'Os recursos Premium serão bloqueados. Seus dados continuam salvos.', [
      { text: 'Manter', style: 'cancel' },
      {
        text: 'Cancelar assinatura',
        style: 'destructive',
        onPress: async () => {
          try {
            const { data } = await api.post<StatusAssinatura>('/assinatura/cancelar');
            definir(data);
          } catch {
            Alert.alert('Erro', 'Não foi possível cancelar agora.');
          }
        },
      },
    ]);
  };

  if (!status) {
    return (
      <View style={[styles.tela, styles.centro]}>
        <ActivityIndicator color={Colors.primary.DEFAULT} />
      </View>
    );
  }

  const topo = (
    <View style={[styles.topo, { paddingTop: insets.top + 6 }]}>
      <TouchableOpacity onPress={sair} style={styles.fechar} accessibilityLabel="Fechar">
        <MaterialIcons name="close" size={24} color={Colors.text} />
      </TouchableOpacity>
    </View>
  );

  // Ja e assinante: mostra o plano atual.
  if (status.premium) {
    const plano = status.planos.find((p) => p.id === status.plano);
    return (
      <View style={styles.tela}>
        {topo}
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.selo}>
            <MaterialIcons name="workspace-premium" size={34} color={Colors.primary.DEFAULT} />
          </View>
          <Text style={styles.titulo}>Você é Premium</Text>
          <Text style={styles.subtitulo}>
            Plano {plano?.nome.toLowerCase() ?? ''}
            {status.expiraEm
              ? status.emTeste
                ? `. Teste grátis até ${fmtData(status.expiraEm)}.`
                : `. Renova em ${fmtData(status.expiraEm)}.`
              : '.'}
          </Text>
          <View style={styles.beneficios}>
            {status.catalogoModulos.map((m) => (
              <View key={m.id} style={styles.beneficio}>
                <MaterialIcons name="check-circle" size={22} color={Colors.accent.DEFAULT} />
                <Text style={styles.beneficioNome}>{m.nome}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={cancelar} style={styles.secundario}>
            <Text style={styles.cancelarTexto}>Cancelar assinatura</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  const plano = status.planos.find((p) => p.id === escolhido) ?? status.planos[0];
  const comTeste = !!plano && plano.testeDias > 0 && status.testeDisponivel;
  const precoTexto = plano ? `${formatarPreco(plano.precoCentavos)} por ${plano.periodo === 'ano' ? 'ano' : 'mês'}` : '';

  return (
    <View style={styles.tela}>
      {topo}
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.selo}>
          <MaterialIcons name="workspace-premium" size={34} color={Colors.primary.DEFAULT} />
        </View>
        <Text style={styles.titulo}>CicloLeve Premium</Text>
        <Text style={styles.subtitulo}>
          {modulo && NOME_MODULO[modulo]
            ? `${NOME_MODULO[modulo]} faz parte do Premium.`
            : 'Mais recursos para entender seu ciclo e cuidar de você.'}
        </Text>

        <View style={styles.beneficios}>
          {status.catalogoModulos.map((m) => (
            <View key={m.id} style={styles.beneficio}>
              <View style={styles.beneficioIcone}>
                <MaterialIcons name={ICONES[m.id] ?? 'check'} size={20} color={Colors.primary.DEFAULT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.beneficioNome}>{m.nome}</Text>
                <Text style={styles.beneficioDesc}>{m.descricao}</Text>
              </View>
            </View>
          ))}
        </View>

        {status.planos.map((p) => {
          const ativo = p.id === escolhido;
          const teste = p.testeDias > 0 && status.testeDisponivel;
          const mensalEquivalente = p.periodo === 'ano' ? formatarPreco(Math.round(p.precoCentavos / 12)) : null;
          return (
            <TouchableOpacity
              key={p.id}
              onPress={() => setEscolhido(p.id)}
              activeOpacity={0.85}
              style={[styles.plano, ativo && styles.planoAtivo]}
              accessibilityRole="radio"
              accessibilityState={{ checked: ativo }}
            >
              {teste ? (
                <View style={styles.planoSelo}>
                  <Text style={styles.planoSeloTexto}>{p.testeDias} DIAS GRÁTIS</Text>
                </View>
              ) : null}
              <View style={styles.planoLinha}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planoNome}>{p.nome}</Text>
                  <Text style={styles.planoPreco}>
                    {formatarPreco(p.precoCentavos)} por {p.periodo === 'ano' ? 'ano' : 'mês'}
                  </Text>
                </View>
                {mensalEquivalente ? <Text style={styles.planoEquivalente}>{mensalEquivalente}/mês</Text> : null}
                <MaterialIcons
                  name={ativo ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={24}
                  color={ativo ? Colors.primary.DEFAULT : '#C4BBBE'}
                />
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.aviso}>
          {comTeste
            ? `Sem cobrança nos primeiros ${plano!.testeDias} dias. Depois, ${precoTexto}. Cancele quando quiser no Perfil.`
            : `${precoTexto}. Cancele quando quiser no Perfil.`}
        </Text>
        <Text style={styles.avisoTeste}>Versão de testes: nenhuma cobrança real é feita.</Text>
      </ScrollView>

      <View style={[styles.rodape, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={[styles.botao, enviando && { opacity: 0.6 }]} onPress={assinar} disabled={enviando} activeOpacity={0.85}>
          {enviando ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <Text style={styles.botaoTexto}>{comTeste ? `Começar ${plano!.testeDias} dias grátis` : 'Assinar'}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={sair} style={styles.secundario}>
          <Text style={styles.secundarioTexto}>Continuar com o plano gratuito</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Colors.background },
  centro: { alignItems: 'center', justifyContent: 'center' },
  topo: { paddingHorizontal: 12 },
  fechar: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  selo: {
    alignSelf: 'center',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontSize: 28, fontWeight: '900', color: Colors.text, textAlign: 'center', marginTop: 14 },
  subtitulo: { fontSize: 15, color: Colors.textLight, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  beneficios: { backgroundColor: Colors.surface, borderRadius: 18, padding: 16, gap: 14, marginTop: 22, marginBottom: 18 },
  beneficio: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  beneficioIcone: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beneficioNome: { fontSize: 15, fontWeight: '800', color: Colors.text },
  beneficioDesc: { fontSize: 13, color: Colors.textLight, marginTop: 2, lineHeight: 18 },
  plano: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  planoAtivo: { borderColor: Colors.primary.DEFAULT, backgroundColor: '#FFF7F9' },
  planoSelo: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary.DEFAULT,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  planoSeloTexto: { color: Colors.onPrimary, fontSize: 11, fontWeight: '900', letterSpacing: 0.6 },
  planoLinha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planoNome: { fontSize: 18, fontWeight: '900', color: Colors.text },
  planoPreco: { fontSize: 14, color: Colors.textLight, marginTop: 2 },
  planoEquivalente: { fontSize: 14, fontWeight: '800', color: Colors.primary.dark },
  aviso: { fontSize: 13, color: Colors.textLight, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  avisoTeste: { fontSize: 12, color: '#B0A5A9', textAlign: 'center', marginTop: 6 },
  rodape: { paddingHorizontal: 20, paddingTop: 10, backgroundColor: Colors.background },
  botao: { backgroundColor: Colors.primary.DEFAULT, borderRadius: 999, paddingVertical: 17, alignItems: 'center' },
  botaoTexto: { color: Colors.onPrimary, fontSize: 17, fontWeight: '900' },
  secundario: { paddingVertical: 14, alignItems: 'center' },
  secundarioTexto: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  cancelarTexto: { color: Colors.error, fontSize: 15, fontWeight: '700' },
});
