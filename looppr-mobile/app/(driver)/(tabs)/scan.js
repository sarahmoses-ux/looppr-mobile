import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenHeader from '../../../src/components/ScreenHeader';
import Card from '../../../src/components/Card';
import Button from '../../../src/components/Button';
import StepperControl from '../../../src/components/StepperControl';
import { useDriverRoute, useLogOrderWeight, useLogOrderPhoto } from '../../../src/hooks/useOrders';
import { useToast } from '../../../src/context/ToastContext';
import { formatCurrency } from '../../../src/utils/format';
import { colors } from '../../../src/theme/tokens';
import { ORDER_STAGE } from '../../../src/constants/orderStages';

const RATE_PER_LB = 1.75;

export default function Scan() {
  const { data: stops } = useDriverRoute();
  const logWeight = useLogOrderWeight();
  const logPhoto = useLogOrderPhoto();
  const toast = useToast();
  const [lbs, setLbs] = useState(8);
  const [photoUri, setPhotoUri] = useState(null);

  const pickupOrder = stops?.find((o) => o.stage === ORDER_STAGE.PICKUP_QUEUE);
  const estimate = lbs * RATE_PER_LB;

  useEffect(() => {
    setPhotoUri(null);
  }, [pickupOrder?.id]);

  const onLogWeight = () => {
    if (!pickupOrder) return;
    logWeight.mutate(
      { orderId: pickupOrder.id, lbs, ratePerLb: RATE_PER_LB },
      { onSuccess: () => toast.show(`${pickupOrder.id} weighed ${lbs} lb — customer charged ${formatCurrency(estimate)}`) }
    );
  };

  const onPhoto = async () => {
    if (!pickupOrder) return;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      toast.show('Camera access is needed to confirm pickup.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true });
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setPhotoUri(uri);
    logPhoto.mutate(
      { orderId: pickupOrder.id, photoUri: uri },
      { onSuccess: () => toast.show(`${pickupOrder.id} photo confirmed`) }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader title="Weigh-in" subtitle={pickupOrder ? pickupOrder.id : 'No pickup queued'} />
      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }}>
        {pickupOrder ? (
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
                {formatCurrency(RATE_PER_LB)}/lb → customer pays {formatCurrency(estimate)}
              </Text>
            </Card>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(360)}>
            <Card className="items-center py-2xl mb-lg">
              <Text className="font-body-bold text-[13px] text-ink">No bag to weigh</Text>
              <Text className="font-body text-[11.5px] text-muted mt-[2px] text-center">Pick up a stop from Route to weigh it in here.</Text>
            </Card>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(70).duration(360)}>
          <Button title="Log weight & charge" onPress={onLogWeight} disabled={!pickupOrder} loading={logWeight.isPending} className="mb-sm" />
        </Animated.View>

        {photoUri ? (
          <Card className="items-center py-lg mb-sm">
            <Image source={{ uri: photoUri }} style={{ width: '100%', height: 160, borderRadius: 8 }} contentFit="cover" />
            <Text className="font-body text-[11.5px] text-muted mt-sm">Photo confirmation saved</Text>
          </Card>
        ) : null}

        <Animated.View entering={FadeInDown.delay(140).duration(360)}>
          <Button
            title={photoUri ? '📷 Retake photo' : '📷 Photo confirmation'}
            variant="secondary"
            onPress={onPhoto}
            disabled={!pickupOrder}
            loading={logPhoto.isPending}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
