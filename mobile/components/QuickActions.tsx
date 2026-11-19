import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { FertilityGoal } from '@/components/FertilityHero';
import { parseDateOnly } from '@/services/cycle';

type ActionProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  hint: string;
  onPress: () => void;
  primary?: boolean; // circulo rose cheio (acao principal)
  done?: boolean; // selo de "feito hoje"
  onSheet?: boolean; // dentro de janela branca: circulos neutros ganham fundo
};

function Action({ icon, label, hint, onPress, primary, done, onSheet }: ActionProps) {
  return (
    <TouchableOpacity style={styles.action} onPress={onPress} activeOpacity={0.75} accessibilityLabel={`${label}: ${hint}`}>
      <View
        style={[
          styles.circle,
          primary ? styles.circlePrimary : onSheet ? styles.circleOnSheet : styles.circleDefault,
        ]}
      >
        <MaterialIcons name={icon} size={26} color={primary ? Colors.onPrimary : Colors.primary.DEFAULT} />
        {done ? (
          <View style={[styles.badge, onSheet && { borderColor: Colors.surface }]}>
            <MaterialIcons name="check" size={12} color={Colors.onPrimary} />
          </View>
        ) : null}
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.hint, done && styles.hintDone]} numberOfLines={1}>
        {hint}
      </Text>
    </TouchableOpacity>
  );
}

// Atalhos fixos da home, conforme o objetivo:
// Engravidar = Menstruacao, Sintomas, Relacao, Teste | Evitar = sem Teste | demais = Menstruacao e Sintomas
export function QuickActions({
  goal,
  menstruacaoEmAndamento,
  ultimaMenstruacao,
  sintomasFeitos,
  relacaoFeita,
  testeFeito,
  onMenstruacao,
  onSintomas,
  onRelacao,
  onTeste,
  surface = 'page',
}: {
  surface?: 'page' | 'sheet';
  goal: FertilityGoal | null;
  menstruacaoEmAndamento: boolean;
  /** data (AAAA-MM-DD) da ultima menstruacao registrada, para mostrar no atalho */
  ultimaMenstruacao?: string | null;
  sintomasFeitos: boolean;
  relacaoFeita: boolean;
  testeFeito: boolean;
  onMenstruacao: () => void;
  onSintomas: () => void;
  onRelacao: () => void;
  onTeste: () => void;
}) {
  return (
    <View style={styles.row}>
      <Action
        icon="water-drop"
        label="Menstruação"
        hint={
          menstruacaoEmAndamento
            ? 'registrar fim'
            : ultimaMenstruacao
              ? `última ${format(parseDateOnly(ultimaMenstruacao), 'd MMM', { locale: ptBR })}`
              : 'registrar'
        }
        onPress={onMenstruacao}
        primary
        onSheet={surface === 'sheet'}
      />
      <Action
        icon={sintomasFeitos ? 'edit' : 'add'}
        label="Sintomas"
        hint={sintomasFeitos ? 'feito hoje' : 'registrar'}
        onPress={onSintomas}
        done={sintomasFeitos}
        onSheet={surface === 'sheet'}
      />
      {goal ? (
        <Action
          icon="favorite-border"
          label="Relação"
          hint={relacaoFeita ? 'feito hoje' : 'registrar'}
          onPress={onRelacao}
          done={relacaoFeita}
          onSheet={surface === 'sheet'}
        />
      ) : null}
      {goal === 'ENGRAVIDAR' ? (
        <Action
          icon="science"
          label="Teste"
          hint={testeFeito ? 'feito hoje' : 'registrar'}
          onPress={onTeste}
          done={testeFeito}
          onSheet={surface === 'sheet'}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  action: { flex: 1, maxWidth: 104, alignItems: 'center' },
  circle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  circlePrimary: { backgroundColor: Colors.primary.DEFAULT },
  circleDefault: { backgroundColor: Colors.surface },
  circleOnSheet: { backgroundColor: Colors.primary.light },
  badge: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.accent.DEFAULT,
    borderWidth: 2,
    borderColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { marginTop: 8, fontSize: 13, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  hint: { fontSize: 12, fontWeight: '600', color: Colors.textLight, textAlign: 'center', marginTop: 1 },
  hintDone: { color: Colors.accent.dark },
});
