import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
        <View className="items-center py-2xl rounded-lg mb-lg" style={{ backgroundColor: '#0A3B2E' }}>
          <Text className="font-body-bold text-[11px] tracking-wider uppercase mb-sm" style={{ color: '#BFE8D8' }}>
            Pending payout
          </Text>
          <Text className="font-display-semibold text-[32px] text-white">{formatCurrency(pending?.total ?? 0)}</Text>
          <Text className="font-body text-[11.5px] mt-sm" style={{ color: '#BFE8D8' }}>
            Deposits every Friday via Stripe
          </Text>
        </View>

        <View className="gap-sm">
          {(payouts ?? []).map((p) => (
            <View key={p.id} className="flex-row items-center gap-md bg-white border border-border rounded-md px-lg py-[13px]">
              <View className="flex-1 min-w-0">
                <Text className="font-body-bold text-[13.5px] text-ink">{formatCurrency(p.total)}</Text>
                <Text className="font-body text-[11.5px] text-muted">
                  {p.label} · {p.bags} bags · ${p.ratePerLb.toFixed(2)}/lb avg
                </Text>
              </View>
              <StatusPill label={p.status} variant={p.status === 'Paid' ? 'done' : 'warn'} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
