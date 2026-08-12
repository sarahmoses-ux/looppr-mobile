import { memo, useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../../src/components/ScreenHeader';
import StatusPill from '../../../src/components/StatusPill';
import Button from '../../../src/components/Button';
import EmptyState from '../../../src/components/EmptyState';
import { useMyPickups, useCreatePaymentIntent, useConfirmPayment } from '../../../src/hooks/usePickups';
import { usePayWithStripe } from '../../../src/hooks/usePayWithStripe';
import { useToast } from '../../../src/context/ToastContext';
import { TERMINAL_STATUSES, pickupStatusLabel, pickupStatusPillVariant } from '../../../src/constants/pickupStatus';
import { WINDOW_OPTIONS } from '../../../src/features/customer/bookingOptions';
import { formatCurrency } from '../../../src/utils/format';

const DATE_LABEL = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const windowLabel = (key) => WINDOW_OPTIONS.find((w) => w.key === key)?.label ?? key;

const OrderRow = memo(function OrderRow({ item, onTrack, onPay, onBookAgain, payingId }) {
  const isPaid = item.paymentStatus === 'paid';
  const isTerminal = TERMINAL_STATUSES.includes(item.status);
  const driver = item.driverUserId;

  return (
    <View className="bg-white border border-border rounded-md px-lg py-[13px]">
      <View className="flex-row items-center gap-sm mb-[6px]">
        <Text className="flex-1 font-body-bold text-[13.5px] text-ink" numberOfLines={1}>
          {item._id.slice(-6).toUpperCase()} · {item.address?.street}
        </Text>
        <StatusPill label={pickupStatusLabel(item.status)} variant={pickupStatusPillVariant(item.status)} />
      </View>
      <Text className="font-body text-[11.5px] text-muted mb-[2px]">
        {DATE_LABEL.format(new Date(item.preferredDate))} · {windowLabel(item.window)} pickup
      </Text>
      <Text className="font-body text-[11.5px] text-muted mb-md">
        {driver ? `${driver.name} · ${driver.vehicleName ?? driver.vehicleType}` : 'Driver not yet assigned'}
      </Text>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-body-bold text-[14px] text-ink">{formatCurrency(item.pricing?.amount ?? 0)}</Text>
          {!isPaid ? <Text className="font-body-semibold text-[10.5px] text-warnText">Payment pending</Text> : null}
        </View>
        {!isPaid ? (
          <Button title="Pay now" onPress={() => onPay(item)} loading={payingId === item._id} className="px-md py-[7px]" />
        ) : isTerminal ? (
          <Button title="Book again" variant="secondary" onPress={() => onBookAgain(item)} className="px-md py-[7px]" />
        ) : (
          <Button title="Track" onPress={() => onTrack(item._id)} className="px-md py-[7px]" />
        )}
      </View>
    </View>
  );
});

export default function Orders() {
  const { data: pickups } = useMyPickups();
  const createPaymentIntent = useCreatePaymentIntent();
  const confirmPayment = useConfirmPayment();
  const { pay } = usePayWithStripe();
  const toast = useToast();
  const [payingId, setPayingId] = useState(null);

  const onTrack = useCallback((orderId) => router.push(`/(customer)/track?orderId=${orderId}`), []);

  const onBookAgain = useCallback((order) => {
    const { street, apartment, city, state, zip } = order.address ?? {};
    router.push({
      pathname: '/(customer)/(tabs)/book',
      params: { rebookAddress: JSON.stringify({ street, apartment, city, state, zip }) },
    });
  }, []);

  const onPay = useCallback(async (order) => {
    setPayingId(order._id);
    try {
      const { clientSecret } = await createPaymentIntent.mutateAsync({ pickupId: order._id });
      const { error } = await pay(clientSecret);
      if (error) {
        toast.show(error.message, 'error');
        return;
      }
      await confirmPayment.mutateAsync({ pickupId: order._id });
      toast.show('Payment received.');
    } catch (err) {
      toast.show(err.message, 'error');
    } finally {
      setPayingId(null);
    }
  }, [createPaymentIntent, confirmPayment, pay, toast]);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader title="Orders" subtitle={`${pickups?.length ?? 0} total`} />
      <FlashList
        data={pickups ?? []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<EmptyState icon="basket-outline" title="No orders yet" subtitle="Book your first pickup to see it here." />}
        renderItem={({ item }) => (
          <OrderRow item={item} onTrack={onTrack} onPay={onPay} onBookAgain={onBookAgain} payingId={payingId} />
        )}
      />
    </SafeAreaView>
  );
}
