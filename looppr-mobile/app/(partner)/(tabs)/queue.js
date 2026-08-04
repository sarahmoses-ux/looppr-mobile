import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../../src/components/ScreenHeader';
import StatusPill from '../../../src/components/StatusPill';
import { FillProgressBar } from '../../../src/components/ProgressBar';
import { usePartnerQueue, useFacilityCapacity } from '../../../src/hooks/usePartner';
import { useAdvanceOrderStage } from '../../../src/hooks/useOrders';
import { useToast } from '../../../src/context/ToastContext';
import { ORDER_STAGE } from '../../../src/constants/orderStages';
import { colors } from '../../../src/theme/tokens';

const COLUMNS = [
  { stage: ORDER_STAGE.WASHING, title: 'Washing', dot: colors.brand },
  { stage: ORDER_STAGE.FOLDING_QC, title: 'Folding & QC', dot: colors.success },
];

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

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader
        title="Looppr Partner"
        subtitle="Suds & Fold · Edmond wash facility"
        statusPill={<StatusPill label="Accepting" variant="done" />}
      />
      <View className="px-lg mb-md">
        <Text className="font-body-bold text-[11.5px] text-muted mb-[6px]">
          {capacity?.bagsInFacility ?? 0} bags in facility · capacity {capacity?.capacityPerDay ?? 40}/day
        </Text>
        <FillProgressBar percent={capPercent} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 24 }}>
        {COLUMNS.map((col) => {
          const cards = (jobs ?? []).filter((j) => j.stage === col.stage);
          return (
            <View key={col.stage} style={{ width: 260 }}>
              <View className="flex-row items-center gap-sm mb-sm">
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: col.dot }} />
                <Text className="font-body-bold text-[12.5px] text-ink">{col.title}</Text>
                <Text className="font-body text-[11.5px] text-muted">({cards.length})</Text>
              </View>
              <View className="gap-sm">
                {cards.map((job) => (
                  <Pressable
                    key={job.id}
                    onPress={() => advance(job)}
                    className="bg-white border border-border rounded-md px-md py-[12px]"
                  >
                    <Text className="font-body-bold text-[13px] text-ink mb-[2px]">{job.id}</Text>
                    <Text className="font-body text-[11.5px] text-muted">{job.customerName}</Text>
                  </Pressable>
                ))}
                {cards.length === 0 ? (
                  <View className="bg-white border border-dashed border-border rounded-md px-md py-lg items-center">
                    <Text className="font-body text-[11.5px] text-faint">Nothing here</Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
