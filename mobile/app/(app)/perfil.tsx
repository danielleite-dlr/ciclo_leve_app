import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { User, Settings, LogOut, ChevronRight, Bell, Target, CalendarDays, Clock, ShieldCheck, FileText } from 'lucide-react-native';
import { removeToken } from '@/services/storage';
import api from '@/services/api';

type PerfilPayload = {
  user: {
    nomeCompleto?: string | null;
    email?: string | null;
  };
  ciclo: {
    duracaoCiclo?: number | null;
    duracaoSangramento?: number | null;
  } | null;
};

export default function Perfil() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await removeToken();
    router.replace('/(auth)/login');
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/perfil');
        setPerfil(res.data);
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('[PERFIL] erro ao carregar /perfil', error?.response?.data || error?.message);
        Alert.alert(
          'Erro ao carregar perfil',
          error?.response?.data?.message || error?.response?.data?.error || 'Não foi possível carregar seus dados agora.'
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const SettingItem = ({
    icon: Icon,
    label,
    value,
    subtitle,
    onPress,
    isSwitch,
    switchValue,
    onToggle,
    iconColor,
    iconBgColor,
  }: any) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.settingItem}
      disabled={isSwitch && !onPress}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.settingIconBg,
            iconBgColor ? { backgroundColor: iconBgColor } : null,
          ]}
        >
          <Icon size={20} color={iconColor || Colors.text} />
        </View>
        <View>
          <Text style={styles.settingLabel}>{label}</Text>
          {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {isSwitch ? (
          <Switch
            trackColor={{ false: '#D1D5DB', true: Colors.primary.light }}
            thumbColor={Colors.primary.DEFAULT}
            value={!!switchValue}
            onValueChange={onToggle}
          />
        ) : (
          <ChevronRight size={20} color={Colors.textLight} />
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }] }>
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
      </View>
    );
  }

  const nome = (perfil?.user?.nomeCompleto || '').trim() || '—';
  const email = (perfil?.user?.email || '').trim() || '—';
  const duracaoCiclo = perfil?.ciclo?.duracaoCiclo ? `${perfil.ciclo.duracaoCiclo} dias` : '—';
  const duracaoSangramento = perfil?.ciclo?.duracaoSangramento ? `${perfil.ciclo.duracaoSangramento} dias` : '—';

  return (
    <View style={styles.screen}>
      {/* Top bar simples com título */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.avatarWrap}>
            <User size={48} color={Colors.primary.DEFAULT} />
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={styles.name}>{nome}</Text>
            <Text style={styles.email}>{email}</Text>
            <Text style={styles.memberSince}>Membro desde 2024</Text>
          </View>
        </View>

        {/* Meus dados */}
        <Text style={styles.sectionTitle}>Meus dados</Text>
        <View style={styles.sectionCard}>
          <SettingItem
            icon={Target}
            label="Editar Objetivos"
            subtitle="TPM, Menopausa, Bem-estar"
            iconColor="#7C3AED"
            iconBgColor="rgba(129,140,248,0.15)"
            onPress={() => { /* TODO: tela de objetivos */ }}
          />
          <SettingItem
            icon={CalendarDays}
            label="Dados do Ciclo"
            subtitle={duracaoCiclo !== '—' ? `Duração: ${duracaoCiclo}` : undefined}
            iconColor="#0EA5E9"
            iconBgColor="rgba(56,189,248,0.15)"
            onPress={() => router.push('/(onboarding)/dados-corpo')}
          />
        </View>

        {/* Preferências */}
        <Text style={styles.sectionTitle}>Preferências</Text>
        <View style={styles.sectionCard}>
          <SettingItem
            icon={Clock}
            label="Lembrete diário"
            value="09:00"
            subtitle="Defina um horário para lembrar do registro"
            iconColor="#F97316"
            iconBgColor="rgba(251,146,60,0.15)"
            onPress={() => { /* TODO: tela de lembrete diário */ }}
          />
          <SettingItem
            icon={Bell}
            label="Notificações Push"
            isSwitch
            switchValue={true}
            subtitle="Receber lembretes suaves do app"
            iconColor="#22C55E"
            iconBgColor="rgba(34,197,94,0.15)"
            onPress={() => router.push('/(app)/notificacoes')}
          />
        </View>

        {/* Assinatura */}
        <Text style={styles.sectionTitle}>Assinatura</Text>
        <View style={styles.sectionCardHighlighted}>
          <SettingItem
            icon={ShieldCheck}
            label="Gerenciar Assinatura"
            value="Plano Free"
            subtitle="Plano Free ativo"
            iconColor="#16A34A"
            iconBgColor="rgba(34,197,94,0.18)"
            onPress={() => { /* TODO: tela de assinatura */ }}
          />
        </View>

        {/* Termos e conta */}
        <View style={styles.sectionCard}>
          <SettingItem
            icon={FileText}
            label="Termos e Política"
            subtitle="Uso do app e privacidade"
            iconColor="#6B7280"
            iconBgColor="rgba(209,213,219,0.3)"
            onPress={() => { /* TODO: tela de termos */ }}
          />
        </View>

        {/* Logout / Excluir conta */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Alert.alert('Em breve', 'A exclusão de conta será liberada em uma próxima versão.')}
          style={styles.deleteAccountBtn}
        >
          <Text style={styles.deleteAccountText}>Excluir minha conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  topBar: {
    paddingTop: 44,
    paddingBottom: 12,
    paddingHorizontal: 24,
    backgroundColor: '#F3F4F6',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextBlock: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  email: {
    marginTop: 2,
    fontSize: 13,
    color: '#6B7280',
  },
  memberSince: {
    marginTop: 6,
    fontSize: 12,
    color: '#9CA3AF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 8,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionCardHighlighted: {
    backgroundColor: 'rgba(219,234,254,0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.35)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconBg: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  settingSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 13,
    color: '#6B7280',
    marginRight: 4,
  },
  logoutBtn: {
    marginTop: 16,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#B91C1C',
  },
  deleteAccountBtn: {
    marginTop: 12,
    marginHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  deleteAccountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
});
