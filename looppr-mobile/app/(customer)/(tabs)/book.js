import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import BackButton from '../../../src/components/BackButton';
import Card from '../../../src/components/Card';
import Button from '../../../src/components/Button';
import Toggle from '../../../src/components/Toggle';
import ChipGroup from '../../../src/components/ChipGroup';
import AddressForm, { EMPTY_ADDRESS, isAddressComplete } from '../../../src/components/AddressForm';
import { SegmentedProgressBar } from '../../../src/components/ProgressBar';
import { useAddresses, useAddAddress } from '../../../src/hooks/useAddresses';
import { useMyPickups, useCreatePickup } from '../../../src/hooks/usePickups';
import { usePayWithStripe } from '../../../src/hooks/usePayWithStripe';
import { useToast } from '../../../src/context/ToastContext';
import {
  LOAD_SIZE_OPTIONS, WINDOW_OPTIONS, FOLD_OPTIONS, DETERGENT_OPTIONS, TEMP_OPTIONS,
  estimateOrderPrice,
} from '../../../src/features/customer/bookingOptions';
import { formatCurrency } from '../../../src/utils/format';
import { colors } from '../../../src/theme/tokens';

const TOTAL_STEPS = 4;

function nextDays(count) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });
}
const DAY_LABEL = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
const DATE_LABEL = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });


export default function Book() {
  const { rebookAddress: rebookAddressParam } = useLocalSearchParams();
  const rebookAddress = useMemo(() => {
    if (!rebookAddressParam) return null;
    try {
      return JSON.parse(rebookAddressParam);
    } catch {
      return null;
    }
  }, [rebookAddressParam]);

  const { data: addresses } = useAddresses();
  const addAddress = useAddAddress();
  const { data: existingPickups } = useMyPickups();
  const createPickup = useCreatePickup();
  const { pay } = usePayWithStripe();
  const toast = useToast();

  const [step, setStep] = useState(1);

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(Boolean(rebookAddress));
  const [newAddress, setNewAddress] = useState(() => (rebookAddress ? { ...EMPTY_ADDRESS, ...rebookAddress } : EMPTY_ADDRESS));

  const [preferredDate, setPreferredDate] = useState(() => nextDays(1)[0]);
  const [window, setWindow] = useState(null);
  const [deliveryWindow, setDeliveryWindow] = useState(null);
  const [differentDelivery, setDifferentDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(EMPTY_ADDRESS);

  const [loadSize, setLoadSize] = useState(null);
  const [foldStyle, setFoldStyle] = useState('standard');
  const [detergent, setDetergent] = useState('freeAndClear');
  const [waterTemperature, setWaterTemperature] = useState('cold');
  const [notes, setNotes] = useState('');

  const [confirmedPickup, setConfirmedPickup] = useState(null);
  const [paymentPending, setPaymentPending] = useState(false);

  const days = useMemo(() => nextDays(10), []);
  const selectedAddress = (addresses ?? []).find((a) => a._id === selectedAddressId);
  const priorOrderCount = existingPickups?.length ?? 0;
  const estimate = loadSize ? estimateOrderPrice(loadSize, priorOrderCount) : null;

  const resetAndGoHome = () => {
    setStep(1);
    setSelectedAddressId(null);
    setShowAddAddress(false);
    setNewAddress(EMPTY_ADDRESS);
    setWindow(null);
    setDeliveryWindow(null);
    setDifferentDelivery(false);
    setDeliveryAddress(EMPTY_ADDRESS);
    setLoadSize(null);
    setNotes('');
    setConfirmedPickup(null);
    router.replace('/(customer)/(tabs)/home');
  };

  const onSaveNewAddress = async () => {
    if (!isAddressComplete(newAddress)) return;
    try {
      const list = await addAddress.mutateAsync(newAddress);
      const created = list[list.length - 1];
      setSelectedAddressId(created._id);
      setShowAddAddress(false);
      setNewAddress(EMPTY_ADDRESS);
    } catch (err) {
      toast.show(err.message, 'error');
    }
  };

  const onConfirm = async () => {
    try {
      const { street, apartment, city, state, zip } = selectedAddress;
      const { pickup, clientSecret } = await createPickup.mutateAsync({
        address: { street, apartment, city, state, zip },
        preferredDate: preferredDate.toISOString(),
        window,
        loadSize,
        foldStyle,
        detergent,
        waterTemperature,
        notes,
        deliveryWindow,
        deliveryAddress: differentDelivery ? deliveryAddress : undefined,
      });
      setConfirmedPickup(pickup);

      if (clientSecret) {
        const { error } = await pay(clientSecret);
        setPaymentPending(Boolean(error));
        if (error) toast.show(`Order booked — payment not completed (${error.message}). Pay from Orders anytime.`, 'error');
      } else {
        setPaymentPending(true);
      }
      setStep(5);
    } catch (err) {
      toast.show(err.message, 'error');
    }
  };

  if (step === 5 && confirmedPickup) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-bg">
        <View className="flex-1 items-center justify-center px-2xl">
          <View className="w-16 h-16 rounded-full bg-successBg items-center justify-center mb-lg">
            <Ionicons name="checkmark" size={30} color={colors.success} />
          </View>
          <Text className="font-display-semibold text-[22px] text-ink mb-sm">Pickup booked</Text>
          <Text className="font-body text-[13px] text-muted text-center mb-sm">
            {DATE_LABEL.format(preferredDate)} · {WINDOW_OPTIONS.find((w) => w.key === window)?.label} pickup
          </Text>
          {paymentPending ? (
            <Text className="font-body-semibold text-[12px] text-warnText text-center mb-2xl">
              Payment still pending — you can pay anytime from Orders.
            </Text>
          ) : (
            <Text className="font-body-semibold text-[12px] text-success text-center mb-2xl">Payment received.</Text>
          )}
          <Button
            title="Track this order"
            className="w-full mb-sm"
            onPress={() => {
              const id = confirmedPickup._id;
              resetAndGoHome();
              router.push(`/(customer)/track?orderId=${id}`);
            }}
          />
          <Button title="Back home" variant="secondary" className="w-full" onPress={resetAndGoHome} />
        </View>
      </SafeAreaView>
    );
  }

  const STEP_META = {
    1: { title: 'Where should we pick up?', label: 'Step 1 of 4 · Address' },
    2: { title: 'When works for you?', label: 'Step 2 of 4 · Date & windows' },
    3: { title: "What's in the load?", label: 'Step 3 of 4 · Load & preferences' },
    4: { title: 'Review & pay', label: 'Step 4 of 4 · Confirm' },
  };
  const stepMeta = STEP_META[step];
  const segments = Array.from({ length: TOTAL_STEPS }, (_, i) => (i + 1 < step ? 'done' : i + 1 === step ? 'active' : 'upcomingLight'));

  const goNext = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const canContinue =
    (step === 1 && Boolean(selectedAddress)) ||
    (step === 2 && Boolean(window) && Boolean(deliveryWindow) && (!differentDelivery || isAddressComplete(deliveryAddress))) ||
    (step === 3 && Boolean(loadSize)) ||
    step === 4;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <View className="px-lg pt-lg pb-md">
        <View className="flex-row items-center gap-md mb-md">
          {step > 1 ? <BackButton onPress={goBack} /> : null}
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
              {(addresses ?? []).map((a) => (
                <Card
                  key={a._id}
                  onPress={() => setSelectedAddressId(a._id)}
                  className="flex-row items-center gap-md"
                  style={selectedAddressId === a._id ? { borderColor: colors.brand, borderWidth: 1.5 } : undefined}
                >
                  <View className="w-11 h-11 rounded-md bg-tint items-center justify-center">
                    <Ionicons name="location-outline" size={19} color={colors.brandDeep} />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="font-body-bold text-[14px] text-ink">{a.label}</Text>
                    <Text className="font-body text-[11.5px] text-muted" numberOfLines={1}>
                      {a.street}{a.apartment ? `, ${a.apartment}` : ''}, {a.city}, {a.state} {a.zip}
                    </Text>
                  </View>
                </Card>
              ))}

              {showAddAddress ? (
                <Card>
                  <AddressForm value={newAddress} onChange={setNewAddress} />
                  <Button
                    title="Save address"
                    className="mt-md"
                    loading={addAddress.isPending}
                    disabled={!isAddressComplete(newAddress)}
                    onPress={onSaveNewAddress}
                  />
                </Card>
              ) : (
                <Card onPress={() => setShowAddAddress(true)} className="flex-row items-center gap-md">
                  <View className="w-11 h-11 rounded-md bg-tint items-center justify-center">
                    <Ionicons name="add" size={19} color={colors.brandDeep} />
                  </View>
                  <Text className="font-body-bold text-[13.5px] text-ink">Add a new address</Text>
                </Card>
              )}
            </View>
          ) : null}

          {step === 2 ? (
            <View>
              <Text className="font-body-bold text-[11px] tracking-wider uppercase text-muted mb-sm">Pickup date</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-lg -mx-lg px-lg">
                <View className="flex-row gap-sm">
                  {days.map((d) => {
                    const active = d.toDateString() === preferredDate.toDateString();
                    return (
                      <Card
                        key={d.toISOString()}
                        onPress={() => setPreferredDate(d)}
                        className="items-center py-md px-md"
                        style={{ minWidth: 62, ...(active ? { borderColor: colors.brand, borderWidth: 1.5 } : {}) }}
                      >
                        <Text className="font-body-bold text-[10.5px] text-muted uppercase">{DAY_LABEL.format(d)}</Text>
                        <Text className="font-display-semibold text-[15px] text-ink mt-[2px]">{d.getDate()}</Text>
                      </Card>
                    );
                  })}
                </View>
              </ScrollView>

              <ChipGroup label="Pickup window" options={WINDOW_OPTIONS} value={window} onChange={setWindow} />
              <ChipGroup label="Delivery window" options={WINDOW_OPTIONS} value={deliveryWindow} onChange={setDeliveryWindow} />

              <View className="bg-white border border-border rounded-md px-lg py-[13px] flex-row items-center gap-md mb-md">
                <View className="flex-1">
                  <Text className="font-body-bold text-[13px] text-ink">Deliver to a different address</Text>
                  <Text className="font-body text-[11.5px] text-muted">Defaults to your pickup address</Text>
                </View>
                <Toggle value={differentDelivery} onValueChange={setDifferentDelivery} />
              </View>
              {differentDelivery ? (
                <Card>
                  <AddressForm value={deliveryAddress} onChange={setDeliveryAddress} />
                </Card>
              ) : null}
            </View>
          ) : null}

          {step === 3 ? (
            <View>
              <Text className="font-body-bold text-[11px] tracking-wider uppercase text-muted mb-sm">Load size</Text>
              <View className="gap-sm mb-lg">
                {LOAD_SIZE_OPTIONS.map((o) => {
                  const active = loadSize === o.key;
                  const price = estimateOrderPrice(o.key, priorOrderCount);
                  return (
                    <Card
                      key={o.key}
                      onPress={() => setLoadSize(o.key)}
                      className="flex-row items-center gap-md"
                      style={active ? { borderColor: colors.brand, borderWidth: 1.5 } : undefined}
                    >
                      <View className="flex-1 min-w-0">
                        <Text className="font-body-bold text-[14px] text-ink">{o.label}</Text>
                        <Text className="font-body text-[11.5px] text-muted">{o.sub}</Text>
                      </View>
                      <Text className="font-body-bold text-[13px] text-ink">{formatCurrency(price.amount)}</Text>
                    </Card>
                  );
                })}
              </View>

              <ChipGroup label="Fold style" options={FOLD_OPTIONS} value={foldStyle} onChange={setFoldStyle} />
              <ChipGroup label="Detergent" options={DETERGENT_OPTIONS} value={detergent} onChange={setDetergent} />
              <ChipGroup label="Water temp" options={TEMP_OPTIONS} value={waterTemperature} onChange={setWaterTemperature} />

              <Text className="font-body-bold text-[11px] tracking-wider uppercase text-muted mb-sm">Notes (optional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Gate code, special instructions, stains to flag…"
                multiline
                numberOfLines={3}
                className="bg-white border-[1.5px] border-borderInput rounded-md px-md py-[12px] font-body text-[13px] text-ink mb-md"
                style={{ minHeight: 76, textAlignVertical: 'top' }}
              />
            </View>
          ) : null}

          {step === 4 ? (
            <View>
              <Card className="mb-md gap-[6px]">
                <View className="flex-row justify-between">
                  <Text className="font-body text-[12.5px] text-muted">Address</Text>
                  <Text className="font-body-semibold text-[12.5px] text-ink flex-1 text-right" numberOfLines={1}>
                    {selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}` : ''}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-body text-[12.5px] text-muted">Pickup</Text>
                  <Text className="font-body-semibold text-[12.5px] text-ink">
                    {DATE_LABEL.format(preferredDate)} · {WINDOW_OPTIONS.find((w) => w.key === window)?.label}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-body text-[12.5px] text-muted">Delivery</Text>
                  <Text className="font-body-semibold text-[12.5px] text-ink">
                    {WINDOW_OPTIONS.find((w) => w.key === deliveryWindow)?.label}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-body text-[12.5px] text-muted">Load size</Text>
                  <Text className="font-body-semibold text-[12.5px] text-ink">
                    {LOAD_SIZE_OPTIONS.find((o) => o.key === loadSize)?.label}
                  </Text>
                </View>
              </Card>

              <Card className="mb-md">
                <View className="flex-row justify-between mb-[6px]">
                  <Text className="font-body text-[12.5px] text-muted">Subtotal</Text>
                  <Text className="font-body-semibold text-[12.5px] text-ink">{formatCurrency(estimate?.subtotal ?? 0)}</Text>
                </View>
                <View className="flex-row justify-between mb-[6px]">
                  <Text className="font-body text-[12.5px] text-muted">Delivery fee</Text>
                  <Text className="font-body-semibold text-[12.5px] text-ink">
                    {estimate?.deliveryFee ? formatCurrency(estimate.deliveryFee) : 'Free'}
                  </Text>
                </View>
                <View className="h-[1px] bg-divider my-sm" />
                <View className="flex-row justify-between">
                  <Text className="font-body-bold text-[14px] text-ink">Estimated total</Text>
                  <Text className="font-body-bold text-[14px] text-ink">{formatCurrency(estimate?.amount ?? 0)}</Text>
                </View>
              </Card>
              <Text className="font-body text-[11px] text-faint mb-md">
                Final price is confirmed at checkout. You'll enter your card details in the next step.
              </Text>
            </View>
          ) : null}
        </Animated.View>
      </ScrollView>

      <View className="px-lg pb-lg pt-sm bg-bg">
        <Button
          title={step === 4 ? `Book & pay · ${formatCurrency(estimate?.amount ?? 0)}` : 'Continue'}
          onPress={step === 4 ? onConfirm : goNext}
          disabled={!canContinue}
          loading={createPickup.isPending}
        />
      </View>
    </SafeAreaView>
  );
}
