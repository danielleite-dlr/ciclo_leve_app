import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

// Ilustracao decorativa da Home: o passaro da marca dentro do ciclo, com as 4 fases.
// Serve de pausa visual entre os blocos de texto.

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 160" preserveAspectRatio="xMidYMid slice"><rect width="340" height="160" fill="#FBE0E9"/><circle cx="300" cy="10" r="95" fill="#F6CBD8" opacity="0.55"/><circle cx="30" cy="165" r="80" fill="#CCF2EC" opacity="0.7"/><circle cx="70" cy="30" r="14" fill="#FFFFFF" opacity="0.6"/><circle cx="285" cy="135" r="10" fill="#FFFFFF" opacity="0.7"/><path d="M0 120 C 60 95, 110 140, 170 118 S 280 95, 340 120" stroke="#FFFFFF" stroke-width="2" fill="none" opacity="0.7"/><circle cx="170" cy="80" r="72" fill="#FFFFFF" opacity="0.45"/><circle cx="170" cy="80" r="56" fill="none" stroke="#EF7496" stroke-width="1.6" stroke-dasharray="2 6" stroke-linecap="round" opacity="0.7"/><circle cx="170.0" cy="24.0" r="6" fill="#DC5279"/><circle cx="226.0" cy="80.0" r="5" fill="#F2BDCD"/><circle cx="170.0" cy="136.0" r="6" fill="#15A99D"/><circle cx="114.0" cy="80.0" r="5" fill="#EF7496"/><g transform="translate(127.2 20.6) scale(0.15)"><polygon fill="#F2BDCD" points="385.59,138.81 394.71,220.58 497.39,199.81"/><polygon fill="#EF7496" points="385.95,138.81 413.52,383.7 275.56,344.39 308.19,172.3"/><polygon fill="#DC5279" points="290.95,267.09 276.66,347.16 170.89,314.81 73.72,188.72"/><polygon fill="#15A99D" points="413.52,383.7 235.74,432.5 79.98,288.37"/><polygon fill="#F4BDCD" points="413.52,383.7 182.34,653.19 235.73,432.5"/></g><path d="M250 48 L252.1 52.9 L257 55 L252.1 57.1 L250 62 L247.9 57.1 L243 55 L247.9 52.9 Z" fill="#EF7496"/><path d="M95 90 L96.5 93.5 L100 95 L96.5 96.5 L95 100 L93.5 96.5 L90 95 L93.5 93.5 Z" fill="#15A99D"/><path d="M265 81 L266.2 83.8 L269 85 L266.2 86.2 L265 89 L263.8 86.2 L261 85 L263.8 83.8 Z" fill="#F2BDCD"/></svg>`;

export function Respiro() {
  return (
    <View style={styles.caixa} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <SvgXml xml={SVG} width="100%" height="100%" />
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: { width: '100%', aspectRatio: 340 / 160, borderRadius: 24, overflow: 'hidden', marginTop: 4, marginBottom: 20 },
});
