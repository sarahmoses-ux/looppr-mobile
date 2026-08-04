import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../../src/components/ScreenHeader';
import Card from '../../../src/components/Card';
import { useDriverEarnings } from '../../../src/hooks/useOrders';
import { formatCurrency } from '../../../src/utils/format';
import { colors } from '../../../src/theme/tokens';

export default function Earn() {
  const { data: earnings } = useDriverEarnings();

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader title="Earnings" subtitle="This shift" />
      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }}>
        <Card className="items-center py-2xl mb-lg" style={{ backgroundColor: colors.brand, borderWidth: 0 }}>
          <Text className="font-body-bold text-[11px] tracking-wider uppercase text-tint mb-sm">Shift total</Text>
          <Text className="font-display-semibold text-[36px] text-white">{formatCurrency(earnings?.total ?? 0)}</Text>
          <Text className="font-body text-[11.5px] text-tint mt-sm">Paid out weekly via Stripe · Fridays</Text>
        </Card>

        <View className="bg-white border border-border rounded-md">
          {(earnings?.rows ?? []).map((row, i) => (
            <View
              key={row.label}
              className={`flex-row items-center justify-between px-lg py-[13px] ${i < (earnings.rows.length - 1) ? 'border-b border-divider' : ''}`}
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
