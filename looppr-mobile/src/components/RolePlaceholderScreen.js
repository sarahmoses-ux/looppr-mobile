import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from './ScreenHeader';

// Temporary landing screen for a role group before its real dashboard is
// built (see build plan phases 3-6). Proves the auth redirect + shared
// header/settings sheet work end-to-end for that role.
export default function RolePlaceholderScreen({ title, subtitle, note }) {
  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg">
      <ScreenHeader title={title} subtitle={subtitle} />
      <View className="flex-1 items-center justify-center px-2xl">
        <Text className="font-display-semibold text-[18px] text-ink text-center mb-sm">{title}</Text>
        <Text className="font-body text-[13px] text-muted text-center leading-[19px]">{note}</Text>
      </View>
    </SafeAreaView>
  );
}
