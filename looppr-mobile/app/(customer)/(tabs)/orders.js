import { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../../src/components/ScreenHeader';
import StatusPill from '../../../src/components/StatusPill';
import Button from '../../../src/components/Button';
import EmptyState from '../../../src/components/EmptyState';
import { useOrders, useRateOrder } from '../../../src/hooks/useOrders';
import { ORDER_STAGE, ORDER_STAGE_LABEL, ORDER_STAGE_PILL } from '../../../src/constants/orderStages';
import { formatCurrency } from '../../../src/utils/format';
import { colors } from '../../../src/theme/tokens';

const StarRow = memo(function StarRow({ value, onRate }) {
  return (
    <View className="flex-row gap-[2px]">
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onRate(n)}>
          <Text style={{ color: n <= value ? colors.gold : colors.border, fontSize: 15 }}>★</Text>
        </Pressable>
      ))}
    </View>
  );
});

const OrderRow = memo(function OrderRow({ item, onTrack, onRate, onReorder }) {
  const isDelivered = item.stage === ORDER_STAGE.DELIVERED;

  return (
    <View className="bg-white border border-border rounded-md px-lg py-[13px]">
      <View className="flex-row items-center gap-sm mb-[6px]">
        <Text className="flex-1 font-body-bold text-[13.5px] text-ink" numberOfLines={1}>
          {item.id} · {item.vendor?.name}
        </Text>
        <StatusPill label={ORDER_STAGE_LABEL[item.stage]} variant={ORDER_STAGE_PILL[item.stage]} />
      </View>
      <Text className="font-body text-[11.5px] text-muted mb-md">{item.window}</Text>
      <View className="flex-row items-center justify-between">
        <Text className="font-body-bold text-[14px] text-ink">{formatCurrency(item.total)}</Text>
        {isDelivered ? (
          <View className="flex-row items-center gap-sm">
            <StarRow value={item.rating ?? 0} onRate={(stars) => onRate(item.id, stars)} />
            <Button title="Reorder" variant="secondary" onPress={onReorder} className="px-md py-[7px]" />
          </View>
        ) : (
          <Button title="Track" onPress={() => onTrack(item.id)} className="px-md py-[7px]" />
        )}
      </View>
    </View>
  );
});

export default function Orders() {
  const { data: orders } = useOrders();
  const rateOrder = useRateOrder();

  const onTrack = useCallback((orderId) => router.push(`/(customer)/track?orderId=${orderId}`), []);
  const onRate = useCallback((orderId, stars) => rateOrder.mutate({ orderId, stars }), [rateOrder]);
  const onReorder = useCallback(() => router.push('/(customer)/(tabs)/book'), []);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader title="Orders" subtitle={`${orders?.length ?? 0} total`} />
      <FlashList
        data={orders ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<EmptyState icon="basket-outline" title="No orders yet" subtitle="Book your first pickup to see it here." />}
        renderItem={({ item }) => <OrderRow item={item} onTrack={onTrack} onRate={onRate} onReorder={onReorder} />}
      />
    </SafeAreaView>
  );
}
