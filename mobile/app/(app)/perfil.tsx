import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, CalendarDays, ChevronRight, Clock, FileHeart, FileText, Fingerprint, HeartPulse, History, KeyRound, Lock, LogOut, ShieldCheck, Target } from 'lucide-react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Colors } from '@/constants/Colors';
import { OBJETIVOS } from '@/constants/objetivos';
import Constants from 'expo-constants';
import { removeToken } from '@/services/storage';
import { formatarHora, LembretePref, lerLembrete, limparLembrete } from '@/services/lembrete';
import { bloqueioAtivo, definirBloqueio, limparBloqueio, nomeDoMetodo } from '@/services/bloqueio';
import { ativarSaude, desativarSaude, saudeAtiva } from '@/services/saude';
import api from '@/services/api';
import { useAssinatura } from '@/contexts/AssinaturaContext';

type PerfilPayload = {
  user: {
    nomeCompleto?: string | null;
    email?: string | null;
    createdAt?: string | null;
    plano?: string | null;
    consentimentoSaudeSexual?: boolean | null;
  };
  ciclo: { duracaoCiclo?: number | null; duracaoSangramento?: number | null; objetivos?: string[] | null } | null;
};

const emBreve = (titulo: string) => Alert.alert(titulo, 'Disponível em uma próxima versão.');

function SettingItem({
  icon: Icon,
  label,
  subtitle,
  value,
  onPress,
  last,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.item, last && styles.itemLast]} activeOpacity={0.7}>
      <View style={styles.itemIcon}>
        <Icon size={20} color={Colors.primary.DEFAULT} />
      </View>
      <View style={styles.flex1}>
        <Text style={styles.itemLabel}>{label}</Text>
        {subtitle ? (
          <Text style={styles.itemSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? <Text style={styles.itemValue}>{value}</Text> : null}
      <ChevronRight size={20} color={Colors.textLight} />
    </TouchableOpacity>
  );
}

export default function Perfil() {
  const router = useRouter();
  const assinatura = useAssinatura();
  const insets = useSafeAreaInsets();
  const [perfil, setPerfil] = useState<PerfilPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [lembrete, setLembrete] = useState<LembretePref | null>(null);
  const [bloqueio, setBloqueio] = useState<{ ativo: boolean; metodo: string }>({ ativo: false, metodo: 'Face ID' });
  const [saude, setSaude] = useState(false);

  // Recarrega ao voltar para a aba (ex.: depois de editar objetivos ou dados do ciclo)
  useFocusEffect(
    useCallback(() => {
      let active = true;
      lerLembrete().then((l) => active && setLembrete(l));
      saudeAtiva().then((a) => active && setSaude(a));
      Promise.all([bloqueioAtivo(), nomeDoMetodo()]).then(([ativo, metodo]) => active && setBloqueio({ ativo, metodo }));
      (async () => {
        try {
          const res = await api.get('/perfil');
          if (active) setPerfil(res.data);
        } catch (error: any) {
          if (active && !perfil) {
            Alert.alert(
              'Erro ao carregar perfil',
              error?.response?.data?.error || 'Não foi possível carregar seus dados agora.'
            );
          }
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Deseja mesmo sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await removeToken();
          await limparLembrete();
          await limparBloqueio();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const alternarBloqueio = async () => {
    const { ok, motivo } = await definirBloqueio(!bloqueio.ativo);
    if (ok) setBloqueio((b) => ({ ...b, ativo: !b.ativo }));
    else if (motivo) Alert.alert('Não foi possível ativar', motivo);
  };

  const alternarSaude = async () => {
    if (saude) {
      Alert.alert(
        'Desligar o app Saúde',
        'O CicloLeve para de enviar e receber dados. O que já foi gravado continua no app Saúde e pode ser apagado por lá.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desligar',
            style: 'destructive',
            onPress: async () => {
              await desativarSaude();
              setSaude(false);
            },
          },
        ]
      );
      return;
    }
    const { ok, motivo } = await ativarSaude();
    if (ok) {
      setSaude(true);
      Alert.alert(
        'App Saúde conectado',
        'Suas menstruações e sintomas vão para o app Saúde, e as menstruações anotadas no Apple Watch entram no CicloLeve. Para mudar as permissões, use Ajustes > Saúde > Acesso a Dados.'
      );
    } else if (motivo) Alert.alert('Não foi possível conectar', motivo);
  };

  // LGPD: revogar o consentimento apaga todos os registros de relacao e testes.
  const gerenciarDadosIntimos = () => {
    if (!perfil?.user?.consentimentoSaudeSexual) {
      Alert.alert(
        'Privacidade dos dados íntimos',
        'Você ainda não autorizou o registro de relações e testes. A autorização é pedida no primeiro registro.'
      );
      return;
    }
    Alert.alert(
      'Apagar dados íntimos?',
      'Vamos apagar todos os seus registros de relação e testes e revogar a autorização. Isso não pode ser desfeito.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar e revogar',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.post('/fertilidade/consentimento', { aceito: false });
              setPerfil((p) => (p ? { ...p, user: { ...p.user, consentimentoSaudeSexual: false } } : p));
              Alert.alert('Pronto', `Autorização revogada. ${res.data?.apagados ?? 0} registro(s) apagado(s).`);
            } catch {
              Alert.alert('Erro', 'Não foi possível apagar agora. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
      </View>
    );
  }

  const nome = (perfil?.user?.nomeCompleto || '').trim() || '—';
  const email = (perfil?.user?.email || '').trim();
  const iniciais = nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  const membroDesde = perfil?.user?.createdAt
    ? `Membro desde ${format(new Date(perfil.user.createdAt), 'MMMM yyyy', { locale: ptBR })}`
    : '';

  const ciclo = perfil?.ciclo;
  const objetivos = (ciclo?.objetivos ?? [])
    .map((id) => OBJETIVOS.find((o) => o.id === id)?.title)
    .filter(Boolean)
    .join(', ');
  const resumoCiclo = ciclo?.duracaoCiclo
    ? `Ciclo de ${ciclo.duracaoCiclo} dias · sangramento de ${ciclo.duracaoSangramento} dias`
    : 'Complete seus dados';
  const plano = !assinatura.status
    ? (perfil?.user?.plano || 'FREE').toUpperCase() === 'FREE' ? 'Gratuito' : 'Premium'
    : assinatura.status.premium
      ? assinatura.status.emTeste ? 'Premium (teste)' : 'Premium'
      : 'Gratuito';

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.profileCard} onPress={() => router.push('/(app)/editar-dados')} activeOpacity={0.8}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{iniciais || '?'}</Text>
          </View>
          <View style={styles.flex1}>
            <Text style={styles.name}>{nome}</Text>
            {email ? <Text style={styles.email}>{email}</Text> : null}
            {membroDesde ? <Text style={styles.memberSince}>{membroDesde}</Text> : null}
          </View>
          <View style={styles.editHint}>
            <Text style={styles.editHintText}>Editar</Text>
            <ChevronRight size={18} color={Colors.primary.DEFAULT} />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Meus dados</Text>
        <View style={styles.section}>
          <SettingItem
            icon={Target}
            label="Objetivos"
            subtitle={objetivos || 'Nenhum objetivo escolhido'}
            onPress={() => router.push('/(app)/objetivos')}
          />
          <SettingItem
            icon={CalendarDays}
            label="Dados do ciclo"
            subtitle={resumoCiclo}
            onPress={() => router.push({ pathname: '/(onboarding)/passos', params: { modo: 'editar' } })}
          />
          <SettingItem
            icon={History}
            label="Histórico do ciclo"
            subtitle="Menstruações registradas e médias"
            onPress={() => router.push('/(app)/historico')}
          />
          <SettingItem
            icon={FileHeart}
            label="Relatório para o médico"
            subtitle="PDF com ciclos e sintomas"
            value={assinatura.temModulo('RELATORIO') ? undefined : 'Premium'}
            onPress={() =>
              assinatura.temModulo('RELATORIO') ? router.push('/(app)/relatorio') : assinatura.abrirPlanos('RELATORIO')
            }
            last
          />
        </View>

        <Text style={styles.sectionTitle}>Preferências</Text>
        <View style={styles.section}>
          {Platform.OS === 'ios' ? (
            <SettingItem
              icon={HeartPulse}
              label="App Saúde e Apple Watch"
              subtitle={saude ? 'Conectado · menstruação e sintomas' : 'Desconectado'}
              onPress={alternarSaude}
            />
          ) : null}
          <SettingItem
            icon={Clock}
            label="Lembrete diário"
            subtitle={lembrete?.ativo ? `Todos os dias às ${formatarHora(lembrete)}` : 'Desativado'}
            onPress={() => router.push('/(app)/lembrete')}
          />
          <SettingItem
            icon={Bell}
            label="Notificações"
            subtitle="Lembretes e avisos do app"
            onPress={() => router.push('/(app)/notificacoes')}
            last
          />
        </View>

        <Text style={styles.sectionTitle}>Conta</Text>
        <View style={styles.section}>
          <SettingItem icon={ShieldCheck} label="Assinatura" value={plano} onPress={() => router.push('/(app)/planos')} />
          <SettingItem icon={KeyRound} label="Alterar senha" onPress={() => router.push('/(app)/alterar-senha')} />
          <SettingItem
            icon={Fingerprint}
            label={`Bloquear com ${bloqueio.metodo}`}
            subtitle={bloqueio.ativo ? 'Ativado · pede ao abrir o app' : 'Desativado'}
            onPress={alternarBloqueio}
          />
          <SettingItem
            icon={Lock}
            label="Privacidade dos dados íntimos"
            subtitle={perfil?.user?.consentimentoSaudeSexual ? 'Autorizado · toque para apagar' : 'Relações e testes'}
            onPress={gerenciarDadosIntimos}
          />
          <SettingItem
            icon={FileText}
            label="Termos e privacidade"
            subtitle="Uso do app e seus dados"
            onPress={() => emBreve('Termos e privacidade')}
            last
          />
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.7}>
          <LogOut size={20} color={Colors.primary.dark} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(app)/excluir-conta')} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>Excluir minha conta</Text>
        </TouchableOpacity>

        <Text style={styles.version}>CicloLeve · versão {Constants.expoConfig?.version ?? '—'}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  flex1: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: Colors.text },
  content: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 120 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '900', color: Colors.primary.dark },
  name: { fontSize: 20, fontWeight: '900', color: Colors.text },
  email: { marginTop: 2, fontSize: 14, color: Colors.textLight },
  memberSince: { marginTop: 4, fontSize: 12, color: Colors.textLight },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 8,
  },
  section: { backgroundColor: Colors.surface, borderRadius: 20, marginBottom: 20, overflow: 'hidden' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  itemLast: { borderBottomWidth: 0 },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: { fontSize: 15, fontWeight: '700', color: Colors.text },
  itemSubtitle: { marginTop: 2, fontSize: 13, color: Colors.textLight },
  itemValue: { fontSize: 13, fontWeight: '700', color: Colors.textLight },

  logoutBtn: {
    marginTop: 4,
    paddingVertical: 16,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: { fontSize: 15, fontWeight: '800', color: Colors.primary.dark },
  deleteBtn: { marginTop: 12, paddingVertical: 10, alignItems: 'center' },
  deleteText: { fontSize: 13, fontWeight: '700', color: Colors.error },
  version: { marginTop: 8, textAlign: 'center', fontSize: 12, color: Colors.textLight },
  editHint: { flexDirection: 'row', alignItems: 'center' },
  editHintText: { fontSize: 13, fontWeight: '800', color: Colors.primary.DEFAULT },
});
