import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { clsx } from 'clsx';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string; // Para classes extras
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  isLoading = false, 
  disabled = false,
  className 
}: ButtonProps) {
  
  const baseStyles = "w-full py-4 rounded-xl items-center justify-center";
  
  const variants = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    outline: "bg-transparent border border-gray-300",
    ghost: "bg-transparent",
  };

  const textVariants = {
    primary: "text-white font-bold text-lg",
    secondary: "text-white font-bold text-lg",
    outline: "text-gray-700 font-semibold text-lg",
    ghost: "text-primary font-semibold text-lg",
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={disabled || isLoading}
      className={clsx(
        baseStyles, 
        variants[variant], 
        disabled && "opacity-50",
        className
      )}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#0D9488' : 'white'} />
      ) : (
        <Text className={clsx(textVariants[variant])}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
