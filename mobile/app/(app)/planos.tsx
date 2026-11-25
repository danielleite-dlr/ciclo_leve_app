import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/services/api';
import { Colors } from '@/constants/Colors';
import { formatarPreco, ModuloId, PlanoInfo, StatusAssinatura, useAssinatura } from '@/contexts/AssinaturaContext';
import { carregarPacotes, comprar, PacoteLoja, restaurar, URL_GERENCIAR_ASSINATURA } from '@/services/compras';
import { abrirLink, LINKS } from '@/constants/links';

// Oferta dos planos. Aparece no fim do onboarding e quando a usuaria toca num recurso Premium.
// No Android a compra e feita pelo Google Play (RevenueCat): preco e teste gratis vem da loja.
// Sem loja (Expo Go, iPhone por enquanto) usa a compra simulada do backend, quando ele permite.

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
  const { status, refresh, definir, lojaDisponivel, sincronizar } = useAssinatura();
  const [escolhido, setEscolhido] = useState<PlanoInfo['id']>('ANUAL');
  const [enviando, setEnviando] = useState(false);
  const [pacotes, setPacotes] = useState<PacoteLoja[] | null>(null);

  // Planos com preco da loja
  useEffect(() => {
    if (!lojaDisponivel) return;
    carregarPacotes()
      .then(setPacotes)
      .catch(() => setPacotes([]));
  }, [lojaDisponivel]);

  // 'loja' = Google Play; 'simulada' = sem cobranca (testes); 'indisponivel' = ainda nao da para assinar aqui
  const modo: 'loja' | 'simulada' | 'indisponivel' = lojaDisponivel
    ? 'loja'
    : status?.compras?.simulada === false
      ? 'indisponivel'
      : 'simulada';
  const pacoteDe = (id: PlanoInfo['id']) => pacotes?.find((p) => p.plano === id);

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

  const avisarAtivado = (data: StatusAssinatura) =>
    Alert.alert(
      'Premium ativado',
      data.emTeste && data.expiraEm
        ? `Seu teste grátis vai até ${fmtData(data.expiraEm)}.`
        : 'Todos os recursos já estão liberados.',
      [{ text: 'OK', onPress: sair }]
    );

  const assinar = async () => {
    setEnviando(true);
    try {
      if (modo === 'loja') {
        const pacote = pacoteDe(escolhido);
        if (!pacote) throw new Error('Plano indisponível na loja. Tente de novo em instantes.');
        if ((await comprar(pacote.pacote)) === 'cancelado') return;
        const data = await sincronizar();
        if (data?.premium) avisarAtivado(data);
        else Alert.alert('Compra recebida', 'Estamos liberando o Premium. Pode levar alguns instantes.', [{ text: 'OK', onPress: sair }]);
        return;
      }
      const { data } = await api.post<StatusAssinatura>('/assinatura/assinar', { plano: escolhido });
      definir(data);
      avisarAtivado(data);
    } catch (error: any) {
      Alert.alert('Não foi possível assinar', error?.response?.data?.error || error?.message || 'Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const restaurarCompra = async () => {
    setEnviando(true);
    try {
      const temAssinatura = await restaurar();
      const data = temAssinatura ? await sincronizar() : null;
      if (data?.premium) avisarAtivado(data);
      else Alert.alert('Nenhuma assinatura encontrada', 'Não achamos uma assinatura ativa nesta conta do Google Play.');
    } catch {
      Alert.alert('Erro', 'Não foi possível consultar a loja agora.');
    } finally {
      setEnviando(false);
    }
  };

  const cancelar = () => {
    // Assinatura da loja se cancela na propria loja
    if (modo !== 'simulada') {
      Linking.openURL(URL_GERENCIAR_ASSINATURA);
      return;
    }
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
            <Text style={styles.cancelarTexto}>{modo === 'simulada' ? 'Cancelar assinatura' : 'Gerenciar ou cancelar no Google Play'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Na loja, preco e teste gratis vem do Google Play (a loja ja sabe se ela pode usar o teste)
  const preco = (p: PlanoInfo) => pacoteDe(p.id)?.preco ?? formatarPreco(p.precoCentavos);
  const diasTeste = (p: PlanoInfo) =>
    modo === 'loja' ? (pacoteDe(p.id)?.testeDias ?? 0) : status.testeDisponivel ? p.testeDias : 0;
  const equivalenteMensal = (p: PlanoInfo) => {
    if (p.periodo !== 'ano') return null;
    const loja = pacoteDe(p.id)?.pacote.product;
    if (loja) return loja.pricePerMonthString;
    return formatarPreco(Math.round(p.precoCentavos / 12));
  };

  const plano = status.planos.find((p) => p.id === escolhido) ?? status.planos[0];
  const comTeste = !!plano && diasTeste(plano) > 0;
  const precoTexto = plano ? `${preco(plano)} por ${plano.periodo === 'ano' ? 'ano' : 'mês'}` : '';
  const carregandoLoja = modo === 'loja' && pacotes === null;
  const podeAssinar = modo !== 'indisponivel' && !carregandoLoja && (modo !== 'loja' || !!pacoteDe(escolhido));

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
          const teste = diasTeste(p);
          const mensalEquivalente = equivalenteMensal(p);
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
                  <Text style={styles.planoSeloTexto}>{teste} DIAS GRÁTIS</Text>
                </View>
              ) : null}
              <View style={styles.planoLinha}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planoNome}>{p.nome}</Text>
                  <Text style={styles.planoPreco}>
                    {preco(p)} por {p.periodo === 'ano' ? 'ano' : 'mês'}
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

        {modo === 'indisponivel' ? (
          <Text style={styles.aviso}>As assinaturas ainda não estão disponíveis neste aparelho. Volte em breve.</Text>
        ) : (
          <Text style={styles.aviso}>
            {comTeste
              ? `Sem cobrança nos primeiros ${diasTeste(plano!)} dias. Depois, ${precoTexto}.`
              : `${precoTexto}.`}
            {modo === 'loja'
              ? ' A assinatura renova automaticamente até ser cancelada. Cancele quando quiser no Google Play, até 24 horas antes da renovação.'
              : ' Cancele quando quiser no Perfil.'}
          </Text>
        )}
        {modo === 'simulada' ? <Text style={styles.avisoTeste}>Versão de testes: nenhuma cobrança real é feita.</Text> : null}
        <View style={styles.legal}>
          <Text style={styles.legalLink} onPress={() => abrirLink(LINKS.termos)}>
            Termos de Uso
          </Text>
          <Text style={styles.legalSep}>·</Text>
          <Text style={styles.legalLink} onPress={() => abrirLink(LINKS.privacidade)}>
            Política de Privacidade
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.rodape, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity
          style={[styles.botao, (enviando || !podeAssinar) && { opacity: 0.6 }]}
          onPress={assinar}
          disabled={enviando || !podeAssinar}
          activeOpacity={0.85}
        >
          {enviando || carregandoLoja ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <Text style={styles.botaoTexto}>{comTeste ? `Começar ${diasTeste(plano!)} dias grátis` : 'Assinar'}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={sair} style={styles.secundario}>
          <Text style={styles.secundarioTexto}>Continuar com o plano gratuito</Text>
        </TouchableOpacity>
        {modo === 'loja' ? (
          <TouchableOpacity onPress={restaurarCompra} disabled={enviando} style={styles.restaurar}>
            <Text style={styles.restaurarTexto}>Já assinei: restaurar compra</Text>
          </TouchableOpacity>
        ) : null}
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
  legal: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  legalLink: { fontSize: 12, color: Colors.textLight, textDecorationLine: 'underline' },
  legalSep: { fontSize: 12, color: Colors.textLight },
  restaurar: { paddingBottom: 6, alignItems: 'center' },
  restaurarTexto: { color: Colors.textLight, fontSize: 13, fontWeight: '600' },
  avisoTeste: { fontSize: 12, color: '#B0A5A9', textAlign: 'center', marginTop: 6 },
  rodape: { paddingHorizontal: 20, paddingTop: 10, backgroundColor: Colors.background },
  botao: { backgroundColor: Colors.primary.DEFAULT, borderRadius: 999, paddingVertical: 17, alignItems: 'center' },
  botaoTexto: { color: Colors.onPrimary, fontSize: 17, fontWeight: '900' },
  secundario: { paddingVertical: 14, alignItems: 'center' },
  secundarioTexto: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  cancelarTexto: { color: Colors.error, fontSize: 15, fontWeight: '700' },
});
