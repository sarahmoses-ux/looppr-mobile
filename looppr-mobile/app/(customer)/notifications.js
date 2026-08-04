import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../src/components/BackButton';
import Button from '../../src/components/Button';
import EmptyState from '../../src/components/EmptyState';
import { useMarkAllRead, useNotifications } from '../../src/hooks/useNotifications';

export default function Notifications() {
  const { data: notifications } = useNotifications();
  const markAllRead = useMarkAllRead();

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg">
      <View className="flex-row items-center gap-md px-lg pt-lg pb-md">
        <BackButton onPress={() => router.back()} />
        <Text className="flex-1 font-display-semibold text-[18px] text-ink">Notifications</Text>
        <Button title="Mark all read" variant="ghost" onPress={() => markAllRead.mutate()} />
      </View>
      <FlashList
        data={notifications ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={<EmptyState icon="notifications-outline" title="You're all caught up" subtitle="New updates will show up here." />}
        renderItem={({ item }) => (
          <View className={`bg-white border border-border rounded-md px-lg py-[13px] ${item.read ? 'opacity-60' : ''}`}>
            <Text className="font-body-bold text-[13px] text-ink mb-[2px]">{item.title}</Text>
            <Text className="font-body text-[12px] text-muted leading-[17px] mb-[4px]">{item.body}</Text>
            <Text className="font-body text-[10.5px] text-faint">{item.time}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
