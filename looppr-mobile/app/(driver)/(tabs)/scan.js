import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenHeader from '../../../src/components/ScreenHeader';
import Card from '../../../src/components/Card';
import Button from '../../../src/components/Button';
import StepperControl from '../../../src/components/StepperControl';
import { useMyDeliveries, useConfirmDeliveryWeight } from '../../../src/hooks/useDriver';
import { useToast } from '../../../src/context/ToastContext';
import { formatCurrency } from '../../../src/utils/format';
import { PRICE_PER_LB, LOAD_SIZE_LBS } from '../../../src/features/customer/bookingOptions';
import { DRIVER_STAGE } from '../../../src/constants/driverStage';

export default function Scan() {
  const { data: mine } = useMyDeliveries();
  const confirmWeight = useConfirmDeliveryWeight();
  const toast = useToast();

  const toWeigh = mine?.find((d) => d.driverStage && d.driverStage !== DRIVER_STAGE.DELIVERED && d.actualWeightLbs == null);
  const [lbs, setLbs] = useState(() => LOAD_SIZE_LBS[toWeigh?.loadSize] ?? 20);
  const estimate = lbs * PRICE_PER_LB;

  const onLogWeight = () => {
    if (!toWeigh) return;
    confirmWeight.mutate(
      { deliveryId: toWeigh._id, actualWeightLbs: lbs },
      { onSuccess: () => toast.show(`${toWeigh._id.slice(-6).toUpperCase()} weighed ${lbs} lb — customer charged ${formatCurrency(estimate)}`) }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader title="Weigh-in" subtitle={toWeigh ? toWeigh._id.slice(-6).toUpperCase() : 'No bag queued'} />
      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }}>
        {toWeigh ? (
          <Animated.View entering={FadeInDown.duration(360)}>
            <Card className="items-center py-2xl mb-lg">
              <Text className="font-body-bold text-[11px] tracking-wider uppercase text-muted mb-lg">Bag weight</Text>
              <StepperControl
                value={lbs}
                onDecrement={() => setLbs((v) => Math.max(1, v - 1))}
                onIncrement={() => setLbs((v) => v + 1)}
                size={44}
                valueClassName="font-display-semibold text-[40px] text-ink w-[70px] text-center"
              />
              <Text className="font-body text-[12px] text-muted mt-lg">
                {formatCurrency(PRICE_PER_LB)}/lb → customer pays {formatCurrency(estimate)}
              </Text>
            </Card>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(360)}>
            <Card className="items-center py-2xl mb-lg">
              <Text className="font-body-bold text-[13px] text-ink">No bag to weigh</Text>
              <Text className="font-body text-[11.5px] text-muted mt-[2px] text-center">Accept a delivery from Route to weigh it in here.</Text>
            </Card>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(70).duration(360)}>
          <Button
            title="Confirm weight & charge"
            onPress={onLogWeight}
            disabled={!toWeigh}
            loading={confirmWeight.isPending}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
