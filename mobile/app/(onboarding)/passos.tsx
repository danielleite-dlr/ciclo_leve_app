import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MaterialIcons } from '@expo/vector-icons';
import api from '@/services/api';
import { setToken } from '@/services/storage';
import { getFertilityStatus, hasFertileWindow, parseDateOnly } from '@/services/cycle';
import { salvarLembrete } from '@/services/lembrete';
import { Colors } from '@/constants/Colors';
import { alternarObjetivo, OBJETIVOS_ONBOARDING } from '@/constants/objetivos';
import { modoCicloDe, respostasDe, useOnboardingStore } from '@/stores/onboardingStore';
import { BotaoAvancar, Etapa, faixa, Opcao, Roda } from '@/components/onboarding/ui';
import { CalendarioMenstruacao } from '@/components/onboarding/CalendarioMenstruacao';

// Onboarding: uma pergunta por tela. Na primeira vez termina criando a conta e mostrando os planos.
// Com ?modo=editar (vindo do Perfil) pula nome/resultado/lembrete/conta e salva direto.

type Passo =
  | 'nome'
  | 'objetivos'
  | 'situacao'
  | 'regularidade'
  | 'calendario'
  | 'duracao'
  | 'nascimento'
  | 'corpo'
  | 'resultado'
  | 'lembrete'
  | 'conta';

const ANO_ATUAL = new Date().getFullYear();

export default function Passos() {
  const router = useRouter();
  const { modo } = useLocalSearchParams<{ modo?: string }>();
  const editar = modo === 'editar';
  const s = useOnboardingStore();
  const [idx, setIdx] = useState(0);
  const [carregando, setCarregando] = useState(editar && !s.hidratado);
  const [salvando, setSalvando] = useState(false);

  // Conta (so no primeiro acesso)
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [aceite, setAceite] = useState(false);
  const [verSenha, setVerSenha] = useState(false);

  const passos = useMemo<Passo[]>(() => {
    const lista: Passo[] = ['nome', 'objetivos', 'situacao', 'regularidade', 'calendario', 'duracao', 'nascimento', 'corpo', 'resultado', 'lembrete', 'conta'];
    return lista.filter((p) => {
      if (editar && ['nome', 'resultado', 'lembrete', 'conta'].includes(p)) return false;
      // Com anticoncepcional hormonal ou na menopausa a pergunta de regularidade nao se aplica.
      if (p === 'regularidade' && s.situacao && s.situacao !== 'NENHUMA') return false;
      return true;
    });
  }, [editar, s.situacao]);

  const passo = passos[Math.min(idx, passos.length - 1)];
  const progresso = (idx + 1) / passos.length;

  // Edicao: carrega o que ja esta salvo.
  useEffect(() => {
    if (!editar || s.hidratado) return;
    let ativo = true;
    (async () => {
      try {
        const { data } = await api.get('/perfil');
        const { user, ciclo } = data ?? {};
        const dados: Parameters<typeof s.preencher>[0] = { hidratado: true };
        if (user?.nomeCompleto) dados.nome = user.nomeCompleto;
        if (user?.alturaCm) dados.alturaCm = Number(user.alturaCm);
        if (user?.pesoKg) dados.pesoKg = Math.round(Number(user.pesoKg));
        if (user?.dataNascimento) dados.anoNascimento = parseDateOnly(user.dataNascimento).getFullYear();
        if (ciclo) {
          Object.assign(dados, respostasDe(ciclo.modoCiclo, ciclo.cicloRegular));
          dados.dataUltimaMenstruacao = parseDateOnly(ciclo.dataUltimaMenstruacao);
          dados.duracaoCiclo = ciclo.duracaoCiclo;
          dados.duracaoSangramento = ciclo.duracaoSangramento;
          dados.objetivos = Array.isArray(ciclo.objetivos) ? ciclo.objetivos : [];
        }
        if (ativo) s.preencher(dados);
      } catch {
        if (ativo) s.preencher({ hidratado: true });
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const avancar = () => setIdx((i) => Math.min(i + 1, passos.length - 1));
  const voltar = () => {
    if (idx === 0) {
      s.reset();
      if (router.canGoBack()) router.back();
      else router.replace(editar ? '/(app)/perfil' : '/(onboarding)/inicio');
      return;
    }
    setIdx((i) => i - 1);
  };

  const nomeCurto = s.nome.trim().split(/\s+/)[0] || '';
  const comNome = (texto: string) => (nomeCurto ? `${nomeCurto}, ${texto.charAt(0).toLowerCase()}${texto.slice(1)}` : texto);

  const payloadCiclo = () => {
    const modoCiclo = modoCicloDe(s);
    return {
      modoCiclo,
      cicloRegular: s.regularidade === 'SIM',
      duracaoCiclo: s.duracaoCiclo,
      duracaoSangramento: s.duracaoSangramento,
      // Sem data lembrada, hoje vira o ponto de partida; o primeiro registro de menstruacao corrige.
      dataUltimaMenstruacao: format(s.naoLembraData || !s.dataUltimaMenstruacao ? new Date() : s.dataUltimaMenstruacao, 'yyyy-MM-dd'),
      objetivos: s.objetivos,
      alturaCm: s.alturaCm ?? undefined,
      pesoKg: s.pesoKg ?? undefined,
      idade: s.anoNascimento ? ANO_ATUAL - s.anoNascimento : undefined,
    };
  };

  // Edicao: salva e volta para o Perfil.
  const salvarEdicao = async () => {
    setSalvando(true);
    try {
      await api.put('/perfil/ciclo', payloadCiclo());
      s.reset();
      if (router.canGoBack()) router.back();
      else router.replace('/(app)/perfil');
    } catch (error: any) {
      Alert.alert('Não foi possível salvar', error?.response?.data?.error || 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  // Primeiro acesso: cria a conta, salva as respostas e abre a tela de planos.
  const criarConta = async () => {
    setSalvando(true);
    try {
      const { data } = await api.post('/auth/register', {
        nome: s.nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
        consentimentoLgpd: true,
      });
      await setToken(data.token);
      await api.put('/perfil/ciclo', payloadCiclo());
      s.reset();
      router.replace({ pathname: '/(app)/planos', params: { origem: 'onboarding' } });
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.response?.data?.errors?.[0]?.message;
      if (msg === 'Email já cadastrado') {
        Alert.alert('E-mail já cadastrado', 'Entre com sua conta ou use outro e-mail.', [
          { text: 'Usar outro', style: 'cancel' },
          { text: 'Entrar', onPress: () => router.replace('/(auth)/login') },
        ]);
      } else {
        Alert.alert('Não foi possível criar a conta', msg || 'Verifique sua conexão e tente novamente.');
      }
    } finally {
      setSalvando(false);
    }
  };

  // Ultimo passo da edicao salva; os demais avancam.
  const proximo = () => (editar && idx === passos.length - 1 ? salvarEdicao() : avancar());
  const tituloBotao = editar && idx === passos.length - 1 ? 'Salvar' : 'Avançar';

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator color={Colors.primary.DEFAULT} />
      </View>
    );
  }

  const base = { progresso, onVoltar: voltar };

  switch (passo) {
    case 'nome':
      return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Etapa
            {...base}
            titulo="Como podemos te chamar?"
            subtitulo="Seu nome aparece só para você."
            rodape={<BotaoAvancar onPress={avancar} desabilitado={s.nome.trim().length < 2} />}
          >
            <TextInput
              value={s.nome}
              onChangeText={(v) => s.setDado('nome', v)}
              placeholder="Seu nome"
              placeholderTextColor="#B5AAAE"
              autoFocus
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => s.nome.trim().length >= 2 && avancar()}
              style={styles.campoGrande}
            />
          </Etapa>
        </KeyboardAvoidingView>
      );

    case 'objetivos':
      return (
        <Etapa
          {...base}
          titulo={comNome('O que você quer acompanhar?')}
          subtitulo="Escolha quantos quiser. Engravidar e evitar gravidez não podem ser escolhidos juntos."
          rodape={<BotaoAvancar titulo={tituloBotao} onPress={proximo} desabilitado={s.objetivos.length === 0} carregando={salvando} />}
        >
          {OBJETIVOS_ONBOARDING.map((o) => (
            <Opcao
              key={o.id}
              multipla
              icone={o.icon}
              titulo={o.title}
              selecionada={s.objetivos.includes(o.id)}
              onPress={() => s.setDado('objetivos', alternarObjetivo(s.objetivos, o.id))}
            />
          ))}
        </Etapa>
      );

    case 'situacao':
      return (
        <Etapa
          {...base}
          titulo="Você usa anticoncepcional hormonal ou está na menopausa?"
          subtitulo="Isso muda o que dá para prever no seu ciclo."
          rodape={s.situacao ? <BotaoAvancar onPress={avancar} /> : null}
        >
          <Opcao
            titulo="Nenhuma das duas"
            explicacao="Vamos prever sua menstruação e seus dias férteis a partir das datas que você informar e registrar."
            selecionada={s.situacao === 'NENHUMA'}
            onPress={() => s.setDado('situacao', 'NENHUMA')}
          />
          <Opcao
            titulo="Uso anticoncepcional hormonal"
            explicacao="A pílula, o adesivo, o anel e a injeção costumam bloquear a ovulação, então não mostramos dias férteis. Acompanhamos os sangramentos e os sintomas."
            selecionada={s.situacao === 'ANTICONCEPCIONAL'}
            onPress={() => s.setDado('situacao', 'ANTICONCEPCIONAL')}
          />
          <Opcao
            titulo="Menopausa ou perimenopausa"
            explicacao="Nessa fase os ciclos ficam irregulares. O foco passa a ser sintomas como sono, humor e inchaço."
            selecionada={s.situacao === 'MENOPAUSA'}
            onPress={() => s.setDado('situacao', 'MENOPAUSA')}
          />
        </Etapa>
      );

    case 'regularidade':
      return (
        <Etapa
          {...base}
          titulo={comNome('Sua menstruação é regular?')}
          subtitulo="Regular quer dizer que o intervalo entre uma menstruação e outra quase não muda de um mês para o outro."
          rodape={s.regularidade ? <BotaoAvancar onPress={avancar} /> : null}
        >
          <Opcao
            titulo="Sim"
            explicacao="Com ciclos regulares as previsões já saem mais precisas no primeiro mês."
            selecionada={s.regularidade === 'SIM'}
            onPress={() => s.setDado('regularidade', 'SIM')}
          />
          <Opcao
            titulo="Não"
            explicacao="As previsões são recalculadas a cada menstruação que você registrar, e ficam mais próximas da sua realidade com o tempo."
            selecionada={s.regularidade === 'NAO'}
            onPress={() => s.setDado('regularidade', 'NAO')}
          />
          <Opcao
            titulo="Não sei"
            explicacao="Depois de dois ou três ciclos registrados, mostramos no histórico se o seu ciclo é regular."
            selecionada={s.regularidade === 'NAO_SEI'}
            onPress={() => s.setDado('regularidade', 'NAO_SEI')}
          />
        </Etapa>
      );

    case 'calendario': {
      const escolhida = !!s.dataUltimaMenstruacao && !s.naoLembraData;
      return (
        <Etapa
          {...base}
          titulo="Quando começou sua última menstruação?"
          subtitulo="Toque no primeiro dia. Os dias de sangramento são preenchidos pela duração abaixo."
          rodape={
            <View style={{ gap: 12 }}>
              <View style={styles.stepper}>
                <Text style={styles.stepperTexto}>Dias de sangramento</Text>
                <View style={styles.stepperControles}>
                  <TouchableOpacity
                    style={styles.stepperBotao}
                    onPress={() => s.setDado('duracaoSangramento', Math.max(1, s.duracaoSangramento - 1))}
                    accessibilityLabel="Menos um dia"
                  >
                    <MaterialIcons name="remove" size={20} color={Colors.primary.dark} />
                  </TouchableOpacity>
                  <Text style={styles.stepperValor}>{s.duracaoSangramento}</Text>
                  <TouchableOpacity
                    style={styles.stepperBotao}
                    onPress={() => s.setDado('duracaoSangramento', Math.min(10, s.duracaoSangramento + 1))}
                    accessibilityLabel="Mais um dia"
                  >
                    <MaterialIcons name="add" size={20} color={Colors.primary.dark} />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                style={styles.naoLembro}
                onPress={() => s.preencher({ naoLembraData: !s.naoLembraData })}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: s.naoLembraData }}
              >
                <MaterialIcons
                  name={s.naoLembraData ? 'check-circle' : 'radio-button-unchecked'}
                  size={22}
                  color={s.naoLembraData ? Colors.primary.DEFAULT : '#B5AAAE'}
                />
                <Text style={styles.naoLembroTexto}>Não lembro</Text>
              </TouchableOpacity>
              <BotaoAvancar titulo={tituloBotao} onPress={proximo} desabilitado={!escolhida && !s.naoLembraData} carregando={salvando} />
            </View>
          }
        >
          <CalendarioMenstruacao
            inicio={s.naoLembraData ? null : s.dataUltimaMenstruacao}
            diasSangramento={s.duracaoSangramento}
            onEscolher={(d) => s.preencher({ dataUltimaMenstruacao: d, naoLembraData: false })}
          />
        </Etapa>
      );
    }

    case 'duracao':
      return (
        <Etapa
          {...base}
          titulo="Quantos dias costuma durar seu ciclo?"
          subtitulo="Conte do primeiro dia de uma menstruação até o dia anterior à próxima. A média é de 28 dias."
          rodape={<BotaoAvancar titulo={tituloBotao} onPress={proximo} carregando={salvando} />}
        >
          <View style={[styles.cartaoRoda, s.naoSabeDuracao && { opacity: 0.35 }]} pointerEvents={s.naoSabeDuracao ? 'none' : 'auto'}>
            <Roda
              valor={s.duracaoCiclo}
              opcoes={faixa(21, 45, ' dias')}
              onChange={(v) => s.preencher({ duracaoCiclo: v, naoSabeDuracao: false })}
            />
          </View>
          <Opcao
            titulo="Não sei"
            explicacao="Usamos 28 dias para começar e ajustamos pela média dos ciclos que você registrar."
            selecionada={s.naoSabeDuracao}
            onPress={() => s.preencher({ naoSabeDuracao: !s.naoSabeDuracao, duracaoCiclo: 28 })}
          />
        </Etapa>
      );

    case 'nascimento':
      return (
        <Etapa
          {...base}
          titulo="Em que ano você nasceu?"
          subtitulo="A idade ajuda a interpretar mudanças no ciclo."
          onPular={() => {
            s.setDado('anoNascimento', null);
            proximo();
          }}
          rodape={
            <BotaoAvancar
              titulo={tituloBotao}
              carregando={salvando}
              onPress={() => {
                if (!s.anoNascimento) s.setDado('anoNascimento', ANO_ATUAL - 28);
                proximo();
              }}
            />
          }
        >
          <View style={styles.cartaoRoda}>
            <Roda
              valor={s.anoNascimento ?? ANO_ATUAL - 28}
              opcoes={faixa(ANO_ATUAL - 65, ANO_ATUAL - 10).reverse()}
              onChange={(v) => s.setDado('anoNascimento', v)}
            />
          </View>
        </Etapa>
      );

    case 'corpo':
      return (
        <Etapa
          {...base}
          titulo="Qual sua altura e seu peso?"
          subtitulo="Usamos para acompanhar o peso ao longo do ciclo. Se preferir, pule."
          onPular={() => {
            s.preencher({ alturaCm: null, pesoKg: null });
            proximo();
          }}
          rodape={
            <BotaoAvancar
              titulo={tituloBotao}
              carregando={salvando}
              onPress={() => {
                s.preencher({ alturaCm: s.alturaCm ?? 160, pesoKg: s.pesoKg ?? 60 });
                proximo();
              }}
            />
          }
        >
          <View style={styles.duasRodas}>
            <View style={[styles.cartaoRoda, { flex: 1 }]}>
              <Text style={styles.rodaLegenda}>Altura</Text>
              <Roda valor={s.alturaCm ?? 160} opcoes={faixa(130, 210, ' cm')} onChange={(v) => s.setDado('alturaCm', v)} />
            </View>
            <View style={[styles.cartaoRoda, { flex: 1 }]}>
              <Text style={styles.rodaLegenda}>Peso</Text>
              <Roda valor={s.pesoKg ?? 60} opcoes={faixa(35, 180, ' kg')} onChange={(v) => s.setDado('pesoKg', v)} />
            </View>
          </View>
        </Etapa>
      );

    case 'resultado': {
      const ciclo = {
        modoCiclo: modoCicloDe(s),
        duracaoCiclo: s.duracaoCiclo,
        duracaoSangramento: s.duracaoSangramento,
        dataUltimaMenstruacao: format(s.dataUltimaMenstruacao ?? new Date(), 'yyyy-MM-dd'),
      };
      const st = getFertilityStatus(ciclo);
      const fmt = (d: Date) => format(d, "d 'de' MMMM", { locale: ptBR });
      const semData = s.naoLembraData || !s.dataUltimaMenstruacao;
      const titulo = semData
        ? 'Vamos começar a acompanhar a partir de hoje'
        : st.nextPeriod
          ? `Sua próxima menstruação deve começar em ${fmt(st.nextPeriod)}`
          : 'Seu ciclo está configurado';
      const fertil =
        !semData && hasFertileWindow(ciclo) && st.fertileStart && st.fertileEnd
          ? st.inFertile
            ? `Você está no período fértil estimado, que vai até ${fmt(st.fertileEnd)}.`
            : `Seu próximo período fértil estimado vai de ${fmt(st.fertileStart)} a ${fmt(st.fertileEnd)}.`
          : null;
      return (
        <Etapa {...base} titulo={titulo} rodape={<BotaoAvancar onPress={avancar} />}>
          <View style={styles.resultado}>
            <View style={styles.resultadoIcone}>
              <MaterialIcons name={semData ? 'event-available' : 'event'} size={36} color={Colors.primary.DEFAULT} />
            </View>
            {fertil ? <Text style={styles.resultadoTexto}>{fertil}</Text> : null}
            <Text style={styles.resultadoNota}>
              {semData
                ? 'Quando a menstruação vier, toque em Menstruação na tela inicial. A partir daí calculamos as previsões.'
                : 'É uma estimativa. Ela fica mais precisa a cada menstruação que você registrar.'}
            </Text>
          </View>
        </Etapa>
      );
    }

    case 'lembrete':
      return (
        <Etapa
          {...base}
          titulo="Quer um lembrete diário?"
          subtitulo="Registrar como você está leva menos de um minuto e deixa as dicas do dia mais certeiras. Ao avançar, o aparelho pede permissão para enviar notificações."
          rodape={
            <BotaoAvancar
              carregando={salvando}
              onPress={async () => {
                if (s.lembreteAtivo) {
                  setSalvando(true);
                  const ok = await salvarLembrete({ ativo: true, hora: s.lembreteHora, minuto: 0 }).catch(() => false);
                  setSalvando(false);
                  if (!ok) {
                    s.setDado('lembreteAtivo', false);
                    Alert.alert('Notificações desativadas', 'Você pode ligar o lembrete depois em Perfil > Lembrete diário.');
                  }
                }
                avancar();
              }}
            />
          }
        >
          <Opcao
            titulo="Sim, quero o lembrete"
            explicacao="Escolha o horário abaixo. Dá para mudar depois no Perfil."
            selecionada={s.lembreteAtivo}
            onPress={() => s.setDado('lembreteAtivo', true)}
          />
          {s.lembreteAtivo ? (
            <View style={styles.cartaoRoda}>
              <Roda
                valor={s.lembreteHora}
                opcoes={faixa(6, 23).map((o) => ({ ...o, label: `${String(o.value).padStart(2, '0')}:00` }))}
                onChange={(v) => s.setDado('lembreteHora', v)}
              />
            </View>
          ) : null}
          <Opcao titulo="Agora não" selecionada={!s.lembreteAtivo} onPress={() => s.setDado('lembreteAtivo', false)} />
        </Etapa>
      );

    case 'conta': {
      const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
      const senhaOk = senha.length >= 6;
      const confere = senha === confirmacao;
      return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Etapa
            {...base}
            titulo={comNome('Crie sua conta para guardar seus dados')}
            subtitulo="Assim seus registros ficam salvos e você pode entrar em outro aparelho."
            rodape={
              <BotaoAvancar
                titulo="Criar conta"
                onPress={criarConta}
                carregando={salvando}
                desabilitado={!emailOk || !senhaOk || !confere || !aceite}
              />
            }
          >
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="E-mail"
              placeholderTextColor="#B5AAAE"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              style={styles.campo}
            />
            <View>
              <TextInput
                value={senha}
                onChangeText={setSenha}
                placeholder="Senha (mínimo 6 caracteres)"
                placeholderTextColor="#B5AAAE"
                secureTextEntry={!verSenha}
                autoCapitalize="none"
                textContentType="newPassword"
                style={styles.campo}
              />
              <TouchableOpacity style={styles.olho} onPress={() => setVerSenha((v) => !v)} accessibilityLabel="Mostrar senha">
                <MaterialIcons name={verSenha ? 'visibility' : 'visibility-off'} size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <TextInput
              value={confirmacao}
              onChangeText={setConfirmacao}
              placeholder="Confirme a senha"
              placeholderTextColor="#B5AAAE"
              secureTextEntry={!verSenha}
              autoCapitalize="none"
              textContentType="newPassword"
              style={[styles.campo, confirmacao.length > 0 && !confere && styles.campoErro]}
            />
            {confirmacao.length > 0 && !confere ? <Text style={styles.erro}>As senhas não conferem</Text> : null}

            <TouchableOpacity style={styles.aceite} onPress={() => setAceite((v) => !v)} accessibilityRole="checkbox" accessibilityState={{ checked: aceite }}>
              <MaterialIcons name={aceite ? 'check-box' : 'check-box-outline-blank'} size={24} color={aceite ? Colors.primary.DEFAULT : '#B5AAAE'} />
              <Text style={styles.aceiteTexto}>Li e aceito os Termos de Uso e a Política de Privacidade.</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={{ alignSelf: 'center', marginTop: 8 }}>
              <Text style={styles.link}>Já tenho conta</Text>
            </TouchableOpacity>
          </Etapa>
        </KeyboardAvoidingView>
      );
    }
  }
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  campoGrande: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    fontSize: 20,
    color: Colors.text,
    textAlign: 'center',
  },
  campo: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  campoErro: { borderColor: Colors.error },
  erro: { color: Colors.error, fontSize: 13, marginTop: -4, marginLeft: 4 },
  olho: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  aceite: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  aceiteTexto: { flex: 1, fontSize: 14, color: Colors.text, lineHeight: 20 },
  link: { color: Colors.primary.dark, fontWeight: '800', fontSize: 15 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  stepperTexto: { fontSize: 15, fontWeight: '700', color: Colors.text },
  stepperControles: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepperBotao: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValor: { fontSize: 18, fontWeight: '900', color: Colors.text, minWidth: 22, textAlign: 'center' },
  naoLembro: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center' },
  naoLembroTexto: { fontSize: 15, fontWeight: '700', color: Colors.text },
  cartaoRoda: { backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden', paddingVertical: 4 },
  duasRodas: { flexDirection: 'row', gap: 10 },
  rodaLegenda: { textAlign: 'center', fontSize: 13, fontWeight: '800', color: Colors.textLight, marginTop: 10 },
  resultado: { alignItems: 'center', gap: 14, marginTop: 8 },
  resultadoIcone: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultadoTexto: { fontSize: 17, color: Colors.text, textAlign: 'center', lineHeight: 24, fontWeight: '600' },
  resultadoNota: { fontSize: 14, color: Colors.textLight, textAlign: 'center', lineHeight: 20 },
});
