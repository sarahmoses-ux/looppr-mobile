import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenHeader from '../../../src/components/ScreenHeader';
import Card from '../../../src/components/Card';
import Button from '../../../src/components/Button';
import ChipGroup from '../../../src/components/ChipGroup';
import StatusPill from '../../../src/components/StatusPill';
import AddressForm, { EMPTY_ADDRESS, isAddressComplete } from '../../../src/components/AddressForm';
import { useBusinessOverview, useBusinessPickups, useCreateBusinessPickup } from '../../../src/hooks/useBusiness';
import { useAuth } from '../../../src/context/AuthContext';
import { useToast } from '../../../src/context/ToastContext';
import { WINDOW_OPTIONS, LOAD_SIZE_OPTIONS } from '../../../src/features/customer/bookingOptions';
import { pickupStatusLabel, pickupStatusPillVariant } from '../../../src/constants/pickupStatus';
import { formatCurrency } from '../../../src/utils/format';
import { colors } from '../../../src/theme/tokens';

const STAGGER_MS = 70;
const DATE_LABEL = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
function nextDays(count) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export default function BusinessHome() {
  const { user } = useAuth();
  const { data: overview } = useBusinessOverview();
  const { data: pickups } = useBusinessPickups();
  const createPickup = useCreateBusinessPickup();
  const toast = useToast();

  const [showBook, setShowBook] = useState(false);
  const [address, setAddress] = useState(() => ({
    ...EMPTY_ADDRESS,
    street: user?.address ?? '',
    city: user?.city ?? '',
    state: user?.state ?? 'OK',
  }));
  const [preferredDate, setPreferredDate] = useState(() => nextDays(1)[0]);
  const [window, setWindow] = useState(null);
  const [loadSize, setLoadSize] = useState(null);
  const days = useMemo(() => nextDays(7), []);

  const canBook = isAddressComplete(address) && Boolean(window) && Boolean(loadSize);

  const onRequestPickup = () => {
    createPickup.mutate(
      {
        address,
        preferredDate: preferredDate.toISOString(),
        window,
        deliveryWindow: window,
        loadSize,
      },
      {
        onSuccess: () => {
          toast.show('Pickup requested');
          setShowBook(false);
          setWindow(null);
          setLoadSize(null);
        },
        onError: (err) => toast.show(err.message, 'error'),
      }
    );
  };

  let step = 0;
  const rise = () => FadeInDown.delay((step++) * STAGGER_MS).duration(360);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader
        title="Looppr for Business"
        subtitle={`${user?.businessName ?? 'Business'} · net-30`}
        statusPill={<StatusPill label="Commercial" variant="active" />}
      />
      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={rise()}>
          <LinearGradient
            colors={[colors.brandLight, colors.brand]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 18, padding: 18, marginBottom: 14 }}
          >
            <Text className="font-body-bold text-[10.5px] tracking-wider uppercase text-tint mb-[4px]">This month</Text>
            <Text className="font-display-semibold text-[19px] text-white mb-[4px]">
              {overview?.ordersThisMonth ?? 0} orders · {formatCurrency(overview?.monthlySpending ?? 0)}
            </Text>
            <Text className="font-body text-[12px] text-[#F1EFFE] mb-lg">
              {overview?.avgProcessingHours ? `Avg ${overview.avgProcessingHours}h turnaround` : 'No completed orders yet'}
            </Text>
            <Button
              title={showBook ? 'Cancel' : 'Request pickup'}
              variant="secondary"
              style={{ borderWidth: 0 }}
              onPress={() => setShowBook((v) => !v)}
            />
          </LinearGradient>
        </Animated.View>

        {showBook ? (
          <Animated.View entering={FadeInDown.duration(220)} className="mb-lg">
            <Card className="mb-md">
              <Text className="font-body-bold text-[11px] tracking-wider uppercase text-muted mb-sm">Pickup address</Text>
              <AddressForm value={address} onChange={setAddress} />
            </Card>

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
                      style={{ minWidth: 56, ...(active ? { borderColor: colors.brand, borderWidth: 1.5 } : {}) }}
                    >
                      <Text className="font-display-semibold text-[15px] text-ink">{d.getDate()}</Text>
                      <Text className="font-body text-[10px] text-muted">{DATE_LABEL.format(d).split(' ')[0]}</Text>
                    </Card>
                  );
                })}
              </View>
            </ScrollView>

            <ChipGroup label="Window" options={WINDOW_OPTIONS} value={window} onChange={setWindow} />
            <ChipGroup label="Load size" options={LOAD_SIZE_OPTIONS} value={loadSize} onChange={setLoadSize} />

            <Button title="Submit request" onPress={onRequestPickup} disabled={!canBook} loading={createPickup.isPending} />
          </Animated.View>
        ) : null}

        <Animated.View entering={rise()}>
          <Text className="font-body-bold text-[11px] tracking-wider uppercase text-muted mb-sm">Recent pickups</Text>
        </Animated.View>
        <View className="gap-sm">
          {(pickups ?? []).slice(0, 6).map((p) => (
            <Animated.View key={p._id} entering={rise()}>
              <View className="bg-white border border-border rounded-md px-lg py-[13px] flex-row items-center gap-md">
                <View className="flex-1 min-w-0">
                  <Text className="font-body-bold text-[13.5px] text-ink">{p.address?.street}</Text>
                  <Text className="font-body text-[11.5px] text-muted">{DATE_LABEL.format(new Date(p.preferredDate))} · {p.loadSize}</Text>
                </View>
                <StatusPill label={pickupStatusLabel(p.status)} variant={pickupStatusPillVariant(p.status)} />
              </View>
            </Animated.View>
          ))}
          {!pickups?.length ? (
            <Text className="font-body text-[12px] text-muted text-center py-lg">No pickups yet — request your first above.</Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
