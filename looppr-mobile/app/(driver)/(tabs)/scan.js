import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../../src/components/ScreenHeader';
import Card from '../../../src/components/Card';
import Button from '../../../src/components/Button';
import StepperControl from '../../../src/components/StepperControl';
import { useDriverRoute, useLogOrderWeight } from '../../../src/hooks/useOrders';
import { useToast } from '../../../src/context/ToastContext';
import { formatCurrency } from '../../../src/utils/format';
import { colors } from '../../../src/theme/tokens';
import { ORDER_STAGE } from '../../../src/constants/orderStages';

const RATE_PER_LB = 1.75;

export default function Scan() {
  const { data: stops } = useDriverRoute();
  const logWeight = useLogOrderWeight();
  const toast = useToast();
  const [lbs, setLbs] = useState(8);

  const pickupOrder = stops?.find((o) => o.stage === ORDER_STAGE.PICKUP_QUEUE);
  const estimate = lbs * RATE_PER_LB;

  const onLogWeight = () => {
    if (!pickupOrder) return;
    logWeight.mutate(
      { orderId: pickupOrder.id, lbs, ratePerLb: RATE_PER_LB },
      { onSuccess: () => toast.show(`${pickupOrder.id} weighed ${lbs} lb — customer charged ${formatCurrency(estimate)}`) }
    );
  };

  const onPhoto = () => {
    // expo-image-picker/camera isn't in this project's dependency set yet —
    // stubbed until that capability is added.
    toast.show('Photo capture coming soon');
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader title="Weigh-in" subtitle={pickupOrder ? pickupOrder.id : 'No pickup queued'} />
      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }}>
        {pickupOrder ? (
          <Card className="items-center py-2xl mb-lg">
            <Text className="font-body-bold text-[11px] tracking-wider uppercase text-muted mb-lg">Bag weight</Text>
            <StepperControl value={lbs} onDecrement={() => setLbs((v) => Math.max(1, v - 1))} onIncrement={() => setLbs((v) => v + 1)} size={44} />
            <Text className="font-display-semibold text-[15px] text-ink mt-lg">{lbs} lb</Text>
            <Text className="font-body text-[12px] text-muted mt-[4px]">
              {formatCurrency(RATE_PER_LB)}/lb → customer pays {formatCurrency(estimate)}
            </Text>
          </Card>
        ) : (
          <Card className="items-center py-2xl mb-lg">
            <Text className="font-body-bold text-[13px] text-ink">No bag to weigh</Text>
            <Text className="font-body text-[11.5px] text-muted mt-[2px] text-center">Pick up a stop from Route to weigh it in here.</Text>
          </Card>
        )}

        <Button title="Log weight & charge" onPress={onLogWeight} disabled={!pickupOrder} loading={logWeight.isPending} className="mb-sm" />
        <Button
          title="📷 Photo confirmation"
          variant="secondary"
          onPress={onPhoto}
          disabled={!pickupOrder}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
