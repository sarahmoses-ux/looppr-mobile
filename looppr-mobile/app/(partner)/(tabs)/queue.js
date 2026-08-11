import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenHeader from '../../../src/components/ScreenHeader';
import Card from '../../../src/components/Card';
import StatusPill from '../../../src/components/StatusPill';
import { FillProgressBar } from '../../../src/components/ProgressBar';
import { usePartnerQueue, useFacilityCapacity } from '../../../src/hooks/usePartner';
import { useAdvanceOrderStage } from '../../../src/hooks/useOrders';
import { useToast } from '../../../src/context/ToastContext';
import { ORDER_STAGE } from '../../../src/constants/orderStages';
import { colors } from '../../../src/theme/tokens';

const COLUMNS = [
  { stage: ORDER_STAGE.WASHING, title: 'Washing', dot: colors.brand, advanceable: true },
  { stage: ORDER_STAGE.FOLDING_QC, title: 'Folding & QC', dot: '#5B8DEF', advanceable: true },
  { stage: ORDER_STAGE.OUT_FOR_DELIVERY, title: 'Ready for pickup', dot: colors.success, advanceable: false },
];

const STAGGER_MS = 70;

export default function Queue() {
  const { data: jobs } = usePartnerQueue();
  const { data: capacity } = useFacilityCapacity();
  const advanceStage = useAdvanceOrderStage();
  const toast = useToast();

  const advance = (job) => {
    const isLastStage = job.stage === ORDER_STAGE.FOLDING_QC;
    advanceStage.mutate(
      { orderId: job.id },
      { onSuccess: () => toast.show(isLastStage ? `${job.id} handed off to driver for delivery` : `${job.id} moved to Folding & QC`) }
    );
  };

  const capPercent = capacity ? Math.round((capacity.bagsInFacility / capacity.capacityPerDay) * 100) : 0;

  let step = 0;
  const rise = () => FadeInDown.delay((step++) * STAGGER_MS).duration(360);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader
        title="Looppr Partner"
        subtitle="Suds & Fold · Edmond wash facility"
        statusPill={<StatusPill label="Accepting" variant="done" />}
      />
      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={rise()}>
          <Card className="mb-md">
            <Text className="font-body-bold text-[12.5px] text-ink mb-sm">
              {capacity?.bagsInFacility ?? 0} bags in facility · capacity {capacity?.capacityPerDay ?? 40}/day
            </Text>
            <FillProgressBar percent={capPercent} height={8} />
          </Card>
        </Animated.View>

        <Animated.View entering={rise()}>
          <Text className="font-body text-[11.5px] text-muted mb-md">
            Tap a bag to advance it — updates the customer's live tracker and Looppr OS instantly.
          </Text>
        </Animated.View>

        {COLUMNS.map((col) => {
          const cards = (jobs ?? []).filter((j) => j.stage === col.stage);
          return (
            <Animated.View key={col.stage} entering={rise()} className="mb-lg">
              <View className="flex-row items-center gap-sm mb-sm">
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: col.dot }} />
                <Text className="font-body-bold text-[12.5px] text-ink">{col.title}</Text>
                <Text className="font-body text-[11.5px] text-muted">({cards.length})</Text>
              </View>
              <View className="gap-sm">
                {cards.map((job) =>
                  col.advanceable ? (
                    <Pressable
                      key={job.id}
                      onPress={() => advance(job)}
                      className="bg-white border border-border rounded-md px-md py-[12px]"
                    >
                      <Text className="font-body-bold text-[13px] text-ink mb-[2px]">{job.id}</Text>
                      <Text className="font-body text-[11.5px] text-muted">{job.customerName}</Text>
                    </Pressable>
                  ) : (
                    <View key={job.id} className="bg-white border border-border rounded-md px-md py-[12px]">
                      <Text className="font-body-bold text-[13px] text-ink mb-[2px]">{job.id}</Text>
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
