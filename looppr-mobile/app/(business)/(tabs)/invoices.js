import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenHeader from '../../../src/components/ScreenHeader';
import StatusPill from '../../../src/components/StatusPill';
import EmptyState from '../../../src/components/EmptyState';
import { useBusinessPickups } from '../../../src/hooks/useBusiness';
import { pickupStatusLabel, pickupStatusPillVariant } from '../../../src/constants/pickupStatus';
import { formatCurrency } from '../../../src/utils/format';

const STAGGER_MS = 70;
const DATE_LABEL = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

// looppr-backend has no separate invoice model — a business's "invoices"
// are just its own pickups (PickupRequest scoped to businessId), each
// billed net-30. There's no monthly rollup/statement endpoint yet, so this
// lists individual pickups rather than the mockup's monthly-invoice rows.
export default function Invoices() {
  const { data: pickups } = useBusinessPickups();

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader title="Invoices" subtitle="Net-30 · billed per pickup" />
      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="gap-sm">
          {(pickups ?? []).map((p, i) => (
            <Animated.View
              key={p._id}
              entering={FadeInDown.delay(i * STAGGER_MS).duration(360)}
              className="bg-white border border-border rounded-md px-lg py-[13px] flex-row items-center gap-md"
            >
              <View className="flex-1 min-w-0">
                <Text className="font-body-bold text-[13.5px] text-ink">
                  {DATE_LABEL.format(new Date(p.preferredDate))} · {formatCurrency(p.pricing?.amount ?? 0)}
                </Text>
                <Text className="font-body text-[11.5px] text-muted">{p.address?.street} · net-30 terms</Text>
              </View>
              <StatusPill label={pickupStatusLabel(p.status)} variant={pickupStatusPillVariant(p.status)} />
            </Animated.View>
          ))}
        </View>
        {!pickups?.length ? (
          <EmptyState icon="receipt-outline" title="No invoices yet" subtitle="Request a pickup from Home to see it billed here." />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
