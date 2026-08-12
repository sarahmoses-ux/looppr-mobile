import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenHeader from '../../../src/components/ScreenHeader';
import Card from '../../../src/components/Card';
import { useDriverEarnings } from '../../../src/hooks/useDriver';
import { formatCurrency } from '../../../src/utils/format';
import { colors } from '../../../src/theme/tokens';

const STAGGER_MS = 70;

export default function Earn() {
  const { data: earnings } = useDriverEarnings();

  const rows = [
    { label: 'Total earnings', value: formatCurrency(earnings?.totalEarnings ?? 0) },
    { label: 'This month', value: formatCurrency(earnings?.monthlyEarnings ?? 0) },
    { label: 'Pending payments', value: formatCurrency(earnings?.pendingPayments ?? 0) },
    { label: 'Completed payouts', value: formatCurrency(earnings?.completedPayouts ?? 0) },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader title="Earnings" subtitle="This week" />
      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }}>
        <Animated.View entering={FadeInDown.duration(360)}>
          <Card className="items-center py-2xl mb-lg" style={{ backgroundColor: colors.brand, borderWidth: 0 }}>
            <Text className="font-body-bold text-[11px] tracking-wider uppercase text-tint mb-sm">This week's earnings</Text>
            <Text className="font-display-semibold text-[36px] text-white">{formatCurrency(earnings?.weeklyEarnings ?? 0)}</Text>
            <Text className="font-body text-[11.5px] text-tint mt-sm">Paid out weekly via Stripe · Fridays</Text>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(STAGGER_MS).duration(360)} className="bg-white border border-border rounded-md">
          {rows.map((row, i) => (
            <View
              key={row.label}
              className={`flex-row items-center justify-between px-lg py-[13px] ${i < rows.length - 1 ? 'border-b border-divider' : ''}`}
            >
              <Text className="font-body-bold text-[13px] text-ink">{row.label}</Text>
              <Text className="font-body-semibold text-[13px] text-muted">{row.value}</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
