import { ActivityIndicator, Pressable, Text } from 'react-native';
import { colors } from '../theme/tokens';

const VARIANTS = {
  primary: {
    base: 'bg-brand active:bg-brandHover',
    text: 'text-white',
  },
  secondary: {
    base: 'bg-white border-[1.5px] border-borderInput active:border-tint',
    text: 'text-brandDeep',
  },
  danger: {
    base: 'bg-white border-[1.5px] border-dangerBorder active:bg-dangerBg',
    text: 'text-danger',
  },
  ghost: {
    base: 'bg-transparent',
    text: 'text-brandDeep',
  },
};

export default function Button({ title, onPress, variant = 'primary', loading, disabled, className = '', ...rest }) {
  const v = VARIANTS[variant] ?? VARIANTS.primary;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`${v.base} rounded-md px-lg py-[14px] items-center justify-center ${isDisabled ? 'opacity-50' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.brandDeep} />
      ) : (
        <Text className={`${v.text} font-body-bold text-[14px]`}>{title}</Text>
      )}
    </Pressable>
  );
}
