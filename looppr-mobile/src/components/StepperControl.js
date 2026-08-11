import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

export default function StepperControl({
  value,
  onDecrement,
  onIncrement,
  min = 0,
  size = 32,
  valueClassName = 'font-body-bold text-[14px] text-ink w-[20px] text-center',
}) {
  const btnClass = 'items-center justify-center bg-surface border border-borderInput rounded-xs';

  return (
    <View className="flex-row items-center gap-sm">
      <Pressable
        onPress={onDecrement}
        disabled={value <= min}
        className={btnClass}
        style={{ width: size, height: size, opacity: value <= min ? 0.4 : 1 }}
      >
        <Ionicons name="remove" size={16} color={colors.brandDeep} />
      </Pressable>
      <Text className={valueClassName}>{value}</Text>
      <Pressable onPress={onIncrement} className={btnClass} style={{ width: size, height: size }}>
        <Ionicons name="add" size={16} color={colors.brandDeep} />
      </Pressable>
    </View>
  );
}
