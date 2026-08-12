import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenHeader from '../../../src/components/ScreenHeader';
import { usePartnerEarnings } from '../../../src/hooks/usePartner';
import { formatCurrency } from '../../../src/utils/format';

export default function Payouts() {
  const { data: earnings } = usePartnerEarnings();

  const rows = [
    { label: 'This week', value: formatCurrency(earnings?.weeklyRevenue ?? 0) },
    { label: 'This month', value: formatCurrency(earnings?.monthlyRevenue ?? 0) },
    { label: 'All time', value: formatCurrency(earnings?.totalRevenue ?? 0) },
    { label: 'Completed payouts', value: formatCurrency(earnings?.completedPayouts ?? 0) },
  ];

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
          <Text className="font-display-semibold text-[38px] text-white">{formatCurrency(earnings?.pendingPayments ?? 0)}</Text>
          <Text className="font-body text-[12px] mt-sm" style={{ color: '#BFE8D8' }}>
            Deposits every Friday via Stripe
          </Text>
        </Animated.View>

        <View className="bg-white border border-border rounded-md">
          {rows.map((row, i) => (
            <View
              key={row.label}
              className={`flex-row items-center justify-between px-lg py-[13px] ${i < rows.length - 1 ? 'border-b border-divider' : ''}`}
            >
              <Text className="font-body-bold text-[13px] text-ink">{row.label}</Text>
              <Text className="font-body-semibold text-[13px] text-muted">{row.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
