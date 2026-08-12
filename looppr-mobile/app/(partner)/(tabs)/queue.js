import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenHeader from '../../../src/components/ScreenHeader';
import Card from '../../../src/components/Card';
import Button from '../../../src/components/Button';
import StatusPill from '../../../src/components/StatusPill';
import { FillProgressBar } from '../../../src/components/ProgressBar';
import {
  usePartnerOverview, useIncomingOrders, useMyOrders,
  useAcceptOrder, useRejectOrder, useUpdatePartnerOrderStage, useUpdatePartnerAvailability,
} from '../../../src/hooks/usePartner';
import { useToast } from '../../../src/context/ToastContext';
import { useAuth } from '../../../src/context/AuthContext';
import { PARTNER_STAGE, QUEUE_COLUMNS } from '../../../src/constants/partnerStage';
import { colors } from '../../../src/theme/tokens';

const STAGGER_MS = 70;
const addressLine = (a) => (a ? `${a.street}${a.apartment ? `, ${a.apartment}` : ''}, ${a.city}` : '');

export default function Queue() {
  const { user } = useAuth();
  const { data: overview } = usePartnerOverview();
  const { data: incoming } = useIncomingOrders();
  const { data: mine } = useMyOrders();
  const acceptOrder = useAcceptOrder();
  const rejectOrder = useRejectOrder();
  const updateStage = useUpdatePartnerOrderStage();
  const updateAvailability = useUpdatePartnerAvailability();
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);

  const activeOrders = (mine ?? []).filter((o) => o.partnerStage !== PARTNER_STAGE.DELIVERED);
  const isAccepting = overview?.availability !== 'offline';
  const maxDailyCapacity = user?.maxDailyCapacity ?? 20;
  const capPercent = Math.round((activeOrders.length / maxDailyCapacity) * 100);

  const accept = (order) => {
    setBusyId(order._id);
    acceptOrder.mutate(
      { orderId: order._id },
      {
        onSuccess: () => toast.show(`Accepted order from ${order.customerName}`),
        onError: (err) => toast.show(err.message, 'error'),
        onSettled: () => setBusyId(null),
      }
    );
  };

  const reject = (order) => {
    setBusyId(order._id);
    rejectOrder.mutate({ orderId: order._id, reason: 'At capacity' }, { onSettled: () => setBusyId(null) });
  };

  const advance = (job, column) => {
    updateStage.mutate(
      { orderId: job._id, action: column.nextAction },
      {
        onSuccess: () => toast.show(
          column.nextAction === 'ready_for_delivery'
            ? `${job._id.slice(-6).toUpperCase()} handed off to driver for delivery`
            : `${job._id.slice(-6).toUpperCase()} moved to Folding & QC`
        ),
      }
    );
  };

  const toggleAccepting = () => {
    updateAvailability.mutate({ availability: isAccepting ? 'offline' : 'online' });
  };

  let step = 0;
  const rise = () => FadeInDown.delay((step++) * STAGGER_MS).duration(360);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader
        title="Looppr Partner"
        subtitle={user?.businessName ?? 'Wash facility'}
        statusPill={
          <Pressable onPress={toggleAccepting}>
            <StatusPill label={isAccepting ? 'Accepting' : 'Paused'} variant={isAccepting ? 'done' : 'muted'} />
          </Pressable>
        }
      />
      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={rise()}>
          <Card className="mb-md">
            <Text className="font-body-bold text-[12.5px] text-ink mb-sm">
              {activeOrders.length} bags in facility · capacity {maxDailyCapacity}/day
            </Text>
            <FillProgressBar percent={capPercent} height={8} />
          </Card>
        </Animated.View>

        {incoming?.length ? (
          <Animated.View entering={rise()} className="mb-lg">
            <Text className="font-body-bold text-[11px] tracking-wider uppercase text-muted mb-sm">
              New requests ({incoming.length})
            </Text>
            <View className="gap-sm">
              {incoming.map((o) => (
                <Card key={o._id}>
                  <Text className="font-body-bold text-[13px] text-ink mb-[2px]">{o.customerName}</Text>
                  <Text className="font-body text-[11.5px] text-muted mb-md">{addressLine(o.address)} · {o.window}</Text>
                  <View className="flex-row gap-sm">
                    <Button
                      title="Accept"
                      onPress={() => accept(o)}
                      loading={busyId === o._id && acceptOrder.isPending}
                      disabled={busyId === o._id}
                      className="flex-1 py-[9px]"
                    />
                    <Button
                      title="Reject"
                      variant="secondary"
                      onPress={() => reject(o)}
                      loading={busyId === o._id && rejectOrder.isPending}
                      disabled={busyId === o._id}
                      className="flex-1 py-[9px]"
                    />
                  </View>
                </Card>
              ))}
            </View>
          </Animated.View>
        ) : null}

        <Animated.View entering={rise()}>
          <Text className="font-body text-[11.5px] text-muted mb-md">
            Tap a bag to advance it — updates the customer's live tracker and Looppr OS instantly.
          </Text>
        </Animated.View>

        {QUEUE_COLUMNS.map((col) => {
          const cards = activeOrders.filter((o) => col.stages.includes(o.partnerStage));
          return (
            <Animated.View key={col.key} entering={rise()} className="mb-lg">
              <View className="flex-row items-center gap-sm mb-sm">
                <View
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: col.key === 'ready' ? colors.success : colors.brand }}
                />
                <Text className="font-body-bold text-[12.5px] text-ink">{col.title}</Text>
                <Text className="font-body text-[11.5px] text-muted">({cards.length})</Text>
              </View>
              <View className="gap-sm">
                {cards.map((job) =>
                  col.advanceable ? (
                    <Pressable
                      key={job._id}
                      onPress={() => advance(job, col)}
                      className="bg-white border border-border rounded-md px-md py-[12px]"
                    >
                      <Text className="font-body-bold text-[13px] text-ink mb-[2px]">{job._id.slice(-6).toUpperCase()}</Text>
                      <Text className="font-body text-[11.5px] text-muted">{job.customerName}</Text>
                    </Pressable>
                  ) : (
                    <View key={job._id} className="bg-white border border-border rounded-md px-md py-[12px]">
                      <Text className="font-body-bold text-[13px] text-ink mb-[2px]">{job._id.slice(-6).toUpperCase()}</Text>
                      <Text className="font-body text-[11.5px] text-muted">{job.customerName} · awaiting driver</Text>
                    </View>
                  )
                )}
                {cards.length === 0 ? (
                  <View className="bg-white border border-dashed border-border rounded-md px-md py-lg items-center">
                    <Text className="font-body text-[11.5px] text-faint">Nothing here</Text>
                  </View>
                ) : null}
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
