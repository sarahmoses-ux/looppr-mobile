import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenHeader from '../../../src/components/ScreenHeader';
import StatusPill from '../../../src/components/StatusPill';
import { usePartnerPayouts } from '../../../src/hooks/usePartner';
import { formatCurrency } from '../../../src/utils/format';
import { colors } from '../../../src/theme/tokens';

export default function Payouts() {
  const { data: payouts } = usePartnerPayouts();
  const pending = payouts?.find((p) => p.status === 'Pending');

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader title="Payouts" subtitle="Suds & Fold" />
      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }}>
        <Animated.View
          entering={FadeInDown.delay(0).duration(360)}
          className="items-center py-2xl rounded-lg mb-lg"
          style={{ backgroundColor: '#0A3B2E' }}
        >
          <Text className="font-body-bold text-[11.5px] tracking-wider uppercase mb-sm" style={{ color: '#7CE6B8' }}>
            Pending payout
          </Text>
          <Text className="font-display-semibold text-[38px] text-white">{formatCurrency(pending?.total ?? 0)}</Text>
          <Text className="font-body text-[12px] mt-sm" style={{ color: '#BFE8D8' }}>
            Deposits every Friday via Stripe
          </Text>
        </Animated.View>

        <View className="gap-sm">
          {(payouts ?? []).map((p, i) => (
            <Animated.View
              key={p.id}
              entering={FadeInDown.delay(70 + i * 70).duration(360)}
              className="flex-row items-center gap-md bg-white border border-border rounded-md px-lg py-[13px]"
            >
              <View className="flex-1 min-w-0">
                <Text className="font-body-bold text-[13.5px] text-ink">{formatCurrency(p.total)}</Text>
                <Text className="font-body text-[11.5px] text-muted">{p.label}</Text>
              </View>
              <StatusPill label={p.status} variant={p.status === 'Paid' ? 'done' : 'warn'} />
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
