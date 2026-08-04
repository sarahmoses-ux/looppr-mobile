import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

export default function EmptyState({ icon = 'file-tray-outline', title, subtitle }) {
  return (
    <View className="items-center justify-center py-[64px] px-2xl">
      <View className="w-14 h-14 rounded-full bg-tint items-center justify-center mb-md">
        <Ionicons name={icon} size={24} color={colors.brandDeep} />
      </View>
      <Text className="font-body-bold text-[14px] text-ink text-center mb-[4px]">{title}</Text>
      {subtitle ? <Text className="font-body text-[12px] text-muted text-center leading-[18px]">{subtitle}</Text> : null}
    </View>
  );
}
