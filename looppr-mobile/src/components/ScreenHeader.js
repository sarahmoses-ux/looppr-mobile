import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';
import { useSettingsSheet } from '../navigation/SettingsSheetContext';

// Shared top header used by every role shell: title/subtitle on the left,
// optional notification bell (with unread badge), settings gear on the right.
export default function ScreenHeader({ title, subtitle, onPressNotifications, unreadCount = 0, statusPill }) {
  const { open } = useSettingsSheet();

  return (
    <View className="flex-row items-center gap-md px-lg pt-lg pb-md">
      <View className="flex-1 min-w-0">
        <Text className="font-display-semibold text-[15px] text-ink" numberOfLines={1}>{title}</Text>
        {subtitle ? <Text className="font-body text-[11.5px] text-muted mt-[1px]" numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {statusPill}
      {onPressNotifications ? (
        <Pressable
          onPress={onPressNotifications}
          className="w-[38px] h-[38px] rounded-sm bg-white border border-border items-center justify-center"
        >
          <Ionicons name="notifications-outline" size={17} color={colors.ink} />
          {unreadCount > 0 ? (
            <View className="absolute -top-1 -right-1 bg-danger rounded-full w-4 h-4 items-center justify-center">
              <Text className="text-white text-[9.5px] font-body-bold">{unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>
      ) : null}
      <Pressable onPress={open} className="w-[38px] h-[38px] rounded-sm bg-white border border-border items-center justify-center">
        <Ionicons name="settings-outline" size={16} color={colors.ink} />
      </Pressable>
    </View>
  );
}
