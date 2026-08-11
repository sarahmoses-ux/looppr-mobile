import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import BackButton from '../../../src/components/BackButton';
import Card from '../../../src/components/Card';
import Button from '../../../src/components/Button';
import StatusPill from '../../../src/components/StatusPill';
import Toggle from '../../../src/components/Toggle';
import StepperControl from '../../../src/components/StepperControl';
import { SegmentedProgressBar } from '../../../src/components/ProgressBar';
import { useVendors, useCreateOrder, useOrders } from '../../../src/hooks/useOrders';
import { useAuth } from '../../../src/context/AuthContext';
import { useProfile } from '../../../src/hooks/useProfile';
import { useToast } from '../../../src/context/ToastContext';
import { SERVICE_CATALOG, DELIVERY_WINDOWS, STEP_TITLES, PROMO_CODE, PROMO_DISCOUNT } from '../../../src/features/customer/bookFlowData';
import { formatCurrency } from '../../../src/utils/format';
import { colors } from '../../../src/theme/tokens';

const TOTAL_STEPS = 4;

export default function Book() {
  const { user } = useAuth();
  const { data: vendors } = useVendors();
  const { data: existingOrders } = useOrders();
  const { data: profile } = useProfile();
  const createOrder = useCreateOrder();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [vendorId, setVendorId] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [windowKey, setWindowKey] = useState(null);
  const [recurring, setRecurring] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const selectedVendor = vendors?.find((v) => v.id === vendorId);
  const selectedWindow = DELIVERY_WINDOWS.find((w) => w.key === windowKey);

  const lineItems = useMemo(
    () => SERVICE_CATALOG.filter((s) => quantities[s.key] > 0).map((s) => ({ ...s, qty: quantities[s.key] })),
    [quantities]
  );
  const subtotal = lineItems.reduce((sum, s) => sum + s.qty * s.price, 0);
  const isFirstOrder = (existingOrders?.length ?? 0) === 0;
  const total = Math.max(0, subtotal - (isFirstOrder ? PROMO_DISCOUNT : 0));

  const resetAndGoHome = () => {
    setStep(1);
    setVendorId(null);
    setQuantities({});
    setWindowKey(null);
    setConfirmedOrder(null);
    router.replace('/(customer)/(tabs)/home');
  };

  const onConfirm = async () => {
    try {
      const order = await createOrder.mutateAsync({
        customerEmail: user.email,
        vendorId,
        services: lineItems.map(({ key, name, qty, price }) => ({ key, name, qty, price })),
        address: profile?.address ?? '',
        window: `${selectedWindow.day} · ${selectedWindow.time}`,
        total,
      });
      setConfirmedOrder(order);
      setStep(5);
    } catch (err) {
      toast.show(err.message, 'error');
    }
  };

  if (step === 5 && confirmedOrder) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-bg">
        <View className="flex-1 items-center justify-center px-2xl">
          <View className="w-16 h-16 rounded-full bg-successBg items-center justify-center mb-lg">
            <Ionicons name="checkmark" size={30} color={colors.success} />
          </View>
          <Text className="font-display-semibold text-[22px] text-ink mb-sm">Pickup booked</Text>
          <Text className="font-body text-[13px] text-muted text-center mb-2xl">
            {confirmedOrder.id} · {confirmedOrder.vendor?.name} · {confirmedOrder.window}
          </Text>
          <Button
            title="Track this order"
            className="w-full mb-sm"
            onPress={() => {
              const id = confirmedOrder.id;
              resetAndGoHome();
              router.push(`/(customer)/track?orderId=${id}`);
            }}
          />
          <Button title="Back home" variant="secondary" className="w-full" onPress={resetAndGoHome} />
        </View>
      </SafeAreaView>
    );
  }

  const canBack = step > 1;
  const stepMeta = STEP_TITLES[step];
  const segments = Array.from({ length: TOTAL_STEPS }, (_, i) => (i + 1 < step ? 'done' : i + 1 === step ? 'active' : 'upcomingLight'));

  const goNext = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const canContinue =
    (step === 1 && Boolean(vendorId)) ||
    (step === 2 && lineItems.length > 0) ||
    (step === 3 && Boolean(windowKey)) ||
    step === 4;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <View className="px-lg pt-lg pb-md">
        <View className="flex-row items-center gap-md mb-md">
          {canBack ? <BackButton onPress={goBack} /> : null}
          <View className="flex-1 min-w-0">
            <Text className="font-display-semibold text-[17px] text-ink">{stepMeta.title}</Text>
            <Text className="font-body text-[11px] text-muted">{stepMeta.label}</Text>
          </View>
        </View>
        <SegmentedProgressBar segments={segments} />
      </View>

      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Animated.View key={step} entering={FadeIn.duration(200)}>
          {step === 1 ? (
            <View className="gap-sm">
              {(vendors ?? []).map((v) => (
                <Card
                  key={v.id}
                  onPress={() => setVendorId(v.id)}
                  className="flex-row items-center gap-md"
                  style={vendorId === v.id ? { borderColor: colors.brand, borderWidth: 1.5 } : undefined}
                >
                  <View className="w-11 h-11 rounded-md bg-tint items-center justify-center">
                    <Text className="font-display-semibold text-[14px] text-brandDeep">{v.initials}</Text>
                  </View>
                  <View className="flex-1 min-w-0">
                    <View className="flex-row items-center gap-sm mb-[1px]">
                      <Text className="font-body-bold text-[14px] text-ink">{v.name}</Text>
                      {v.badge ? <StatusPill label={v.badge} variant="done" /> : null}
                    </View>
                    <Text className="font-body text-[11.5px] text-muted">{v.meta}</Text>
                  </View>
                  <Text className="font-body-bold text-[13px] text-ink">${v.rate}/{v.unit}</Text>
                </Card>
              ))}
            </View>
          ) : null}

          {step === 2 ? (
            <View className="gap-sm">
              {SERVICE_CATALOG.map((s) => (
                <Card key={s.key} className="flex-row items-center gap-md">
                  <View className="flex-1 min-w-0">
                    <Text className="font-body-bold text-[13.5px] text-ink">{s.name}</Text>
                    <Text className="font-body text-[11px] text-muted mb-[1px]">{s.desc}</Text>
                    <Text className="font-body text-[11.5px] text-muted">{formatCurrency(s.price)} {s.unitLabel}</Text>
                  </View>
                  <StepperControl
                    value={quantities[s.key] ?? 0}
                    onDecrement={() => setQuantities((q) => ({ ...q, [s.key]: Math.max(0, (q[s.key] ?? 0) - 1) }))}
                    onIncrement={() => setQuantities((q) => ({ ...q, [s.key]: (q[s.key] ?? 0) + 1 }))}
                  />
                </Card>
              ))}
              {lineItems.length > 0 ? (
                <Text className="font-body-bold text-[13px] text-ink text-right mt-sm">Subtotal {formatCurrency(subtotal)}</Text>
              ) : null}
            </View>
          ) : null}

          {step === 3 ? (
            <View>
              <Card className="mb-md flex-row items-center gap-md">
                <Ionicons name="location-outline" size={18} color={colors.brandDeep} />
                <Text className="flex-1 font-body-semibold text-[13px] text-ink">{profile?.address}</Text>
              </Card>
              <View className="flex-row flex-wrap gap-sm mb-lg">
                {DELIVERY_WINDOWS.map((w) => {
                  const active = windowKey === w.key;
                  return (
                    <Card
                      key={w.key}
                      onPress={() => setWindowKey(w.key)}
                      className="w-[48%]"
                      style={active ? { borderColor: colors.brand, borderWidth: 1.5 } : undefined}
                    >
                      <Text className="font-body-bold text-[12.5px] text-ink">{w.day}</Text>
                      <Text className="font-body-bold text-[13.5px] text-ink mb-[2px]">{w.time}</Text>
                      <Text className="font-body text-[10.5px] text-muted">{w.capLabel}</Text>
                    </Card>
                  );
                })}
              </View>
              <View className="bg-white border border-border rounded-md px-lg py-[13px] flex-row items-center gap-md">
                <View className="flex-1">
                  <Text className="font-body-bold text-[13px] text-ink">Repeat weekly</Text>
                  <Text className="font-body text-[11.5px] text-muted">Same window every week · skip anytime</Text>
                </View>
                <Toggle value={recurring} onValueChange={setRecurring} />
              </View>
            </View>
          ) : null}

          {step === 4 ? (
            <View>
              <Card className="mb-md">
                {lineItems.map((s) => (
                  <View key={s.key} className="flex-row justify-between mb-[6px]">
                    <Text className="font-body text-[12.5px] text-muted">{s.qty}× {s.name}</Text>
                    <Text className="font-body-semibold text-[12.5px] text-ink">{formatCurrency(s.qty * s.price)}</Text>
                  </View>
                ))}
                <View className="h-[1px] bg-divider my-sm" />
                <View className="flex-row justify-between">
                  <Text className="font-body-bold text-[14px] text-ink">Total</Text>
                  <Text className="font-body-bold text-[14px] text-ink">{formatCurrency(total)}</Text>
                </View>
              </Card>
              <Card className="mb-md flex-row items-center gap-md">
                <Ionicons name="card-outline" size={18} color={colors.brandDeep} />
                <Text className="flex-1 font-body-semibold text-[13px] text-ink">Visa ·· 4242</Text>
              </Card>
              {isFirstOrder ? (
                <View className="bg-successBg border border-successBg rounded-md px-md py-[10px] mb-md">
                  <Text className="font-body-bold text-[12px] text-success">{PROMO_CODE} applied — {formatCurrency(PROMO_DISCOUNT)} off</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </Animated.View>
      </ScrollView>

      <View className="px-lg pb-lg pt-sm bg-bg">
        <Button
          title={step === 4 ? `Confirm pickup · ${formatCurrency(total)}` : `Continue${selectedVendor && step === 1 ? ` with ${selectedVendor.name}` : ''}`}
          onPress={step === 4 ? onConfirm : goNext}
          disabled={!canContinue}
          loading={createOrder.isPending}
        />
      </View>
    </SafeAreaView>
  );
}
