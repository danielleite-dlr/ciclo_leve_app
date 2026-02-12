import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { User, Settings, LogOut, ChevronRight, Moon, Bell } from 'lucide-react-native';
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

  const SettingItem = ({ icon: Icon, label, value, onPress, isSwitch, switchValue, onToggle }: any) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.settingItem}
      disabled={isSwitch && !onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIconBg}>
          <Icon size={20} color={Colors.text} />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <User size={48} color={Colors.primary.DEFAULT} />
        </View>
        <Text style={styles.name}>{nome}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ciclo */}
        <Text style={styles.sectionTitle}>Configurações do Ciclo</Text>
        <View style={styles.sectionCard}>
          <SettingItem
            icon={Settings}
            label="Duração do Ciclo"
            value={duracaoCiclo}
            onPress={() => router.push('/(onboarding)/dados-corpo')}
          />
          <SettingItem
            icon={Settings}
            label="Duração da Menstruação"
            value={duracaoSangramento}
            onPress={() => router.push('/(onboarding)/dados-corpo')}
          />
          <SettingItem
            icon={Bell}
            label="Notificações"
            isSwitch
            switchValue={true}
            onPress={() => router.push('/(app)/notificacoes')}
          />
        </View>

        {/* App */}
        <Text style={styles.sectionTitle}>App</Text>
        <View style={styles.sectionCard}>
          <SettingItem icon={Moon} label="Tema Escuro" isSwitch switchValue={false} />
        </View>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  email: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
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
    marginBottom: 24,
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
    fontWeight: '600',
    color: '#111827',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  logoutBtn: {
    marginTop: 8,
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
});
