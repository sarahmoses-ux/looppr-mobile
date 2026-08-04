import { Linking, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../../src/components/ScreenHeader';
import Card from '../../../src/components/Card';
import Button from '../../../src/components/Button';
import StatusPill from '../../../src/components/StatusPill';
import { FillProgressBar } from '../../../src/components/ProgressBar';
import DriverRouteMap from '../../../src/features/driver/DriverRouteMap';
import { stopAction } from '../../../src/features/driver/stopStatus';
import { useAdvanceOrderStage, useDriverRoute } from '../../../src/hooks/useOrders';
import { useToast } from '../../../src/context/ToastContext';
import { colors } from '../../../src/theme/tokens';

export default function Route() {
  const { data: stops } = useDriverRoute();
  const advanceStage = useAdvanceOrderStage();
  const toast = useToast();

  const list = stops ?? [];
  const next = list[0];
  const progress = list.length ? Math.round(((4 - list.length) / 4) * 100) : 100;

  const navigate = (order) => {
    const query = encodeURIComponent(order.address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    toast.show(`Opening Google Maps — ${order.address}`);
  };

  const completeStop = (order) => {
    const action = stopAction(order);
    advanceStage.mutate(
      { orderId: order.id },
      { onSuccess: () => toast.show(`${order.id} — ${action.completeLabel.toLowerCase()}`) }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader
        title="Looppr Driver"
        subtitle="Sunday route · OKC Metro"
        statusPill={<StatusPill label="On shift" variant="done" />}
      />
      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {list.length ? <View className="mb-md"><DriverRouteMap stops={list} /></View> : null}

        {next ? (
          <Card className="mb-md">
            <Text className="font-body-bold text-[10.5px] tracking-wider uppercase text-muted mb-[4px]">Next stop</Text>
            <Text className="font-display-semibold text-[16px] text-ink mb-[2px]">{next.customerName}</Text>
            <Text className="font-body text-[12px] text-muted mb-md">{stopAction(next).verb} · {next.address}</Text>
            <View className="mb-md"><FillProgressBar percent={progress} /></View>
            <View className="flex-row gap-sm">
              <Button title="Navigate ▸" onPress={() => navigate(next)} className="flex-1" />
              <Button title={stopAction(next).completeLabel} variant="secondary" onPress={() => completeStop(next)} className="flex-1" />
            </View>
          </Card>
        ) : (
          <Card className="mb-md items-center py-2xl">
            <Text className="font-body-bold text-[13px] text-ink">All caught up</Text>
            <Text className="font-body text-[11.5px] text-muted mt-[2px]">No stops left on today's route.</Text>
          </Card>
        )}

        <Text className="font-body-bold text-[11px] tracking-wider uppercase text-muted mb-sm">Today's stops</Text>
        <View className="gap-sm">
          {list.map((order, i) => {
            const action = stopAction(order);
            return (
              <View key={order.id} className="flex-row items-center gap-md bg-white border border-border rounded-md px-lg py-[13px]">
                <View
                  className="w-7 h-7 rounded-full items-center justify-center"
                  style={{ backgroundColor: i === 0 ? colors.brand : colors.tint }}
                >
                  <Text style={{ color: i === 0 ? colors.white : colors.brandDeep, fontWeight: '700', fontSize: 12 }}>{i + 1}</Text>
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="font-body-bold text-[13px] text-ink" numberOfLines={1}>{order.customerName}</Text>
                  <Text className="font-body text-[11px] text-muted" numberOfLines={1}>{action.verb} · {order.address}</Text>
                </View>
                <StatusPill label={action.verb} variant={action.variant} />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
