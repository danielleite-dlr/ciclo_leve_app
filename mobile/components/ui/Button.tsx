import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
}

// NOTE: Avoid NativeWind/className here for release APK reliability.
export function Button({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const containerStyle = [styles.base, stylesByVariant[variant], disabled ? styles.disabled : null, style];
  const textStyle = [styles.textBase, textStylesByVariant[variant]];

  const spinnerColor = variant === 'outline' || variant === 'ghost' ? Colors.primary.DEFAULT : '#FFFFFF';

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || isLoading} style={containerStyle}>
      {isLoading ? <ActivityIndicator color={spinnerColor} /> : <Text style={textStyle}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontSize: 18,
  },
});

const stylesByVariant: Record<NonNullable<ButtonProps['variant']>, ViewStyle> = {
  primary: {
    backgroundColor: Colors.primary.DEFAULT,
  },
  secondary: {
    backgroundColor: '#DB2777',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
};

const textStylesByVariant = {
  primary: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  secondary: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  outline: {
    color: '#374151',
    fontWeight: '600' as const,
  },
  ghost: {
    color: Colors.primary.DEFAULT,
    fontWeight: '600' as const,
  },
};
