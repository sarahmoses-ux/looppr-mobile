import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../../src/components/ScreenHeader';
import StatusPill from '../../../src/components/StatusPill';
import { useInvoices } from '../../../src/hooks/useBusiness';
import { formatCurrency } from '../../../src/utils/format';

export default function Invoices() {
  const { data: invoices } = useInvoices();

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader title="Invoices" subtitle="Net-30 · billed monthly" />
      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="gap-sm">
          {(invoices ?? []).map((inv) => (
            <View key={inv.id} className="bg-white border border-border rounded-md px-lg py-[13px] flex-row items-center gap-md">
              <View className="flex-1 min-w-0">
                <Text className="font-body-bold text-[13.5px] text-ink">{inv.label}</Text>
                <Text className="font-body text-[11.5px] text-muted">{inv.orders} orders · {formatCurrency(inv.amount)}</Text>
              </View>
              <StatusPill label={inv.status} variant={inv.status === 'Paid' ? 'done' : 'warn'} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
