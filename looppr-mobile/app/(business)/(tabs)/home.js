import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenHeader from '../../../src/components/ScreenHeader';
import Button from '../../../src/components/Button';
import StatusPill from '../../../src/components/StatusPill';
import { useProperties, useRequestExtraPickup } from '../../../src/hooks/useBusiness';
import { useToast } from '../../../src/context/ToastContext';
import { colors } from '../../../src/theme/tokens';

const STATUS_VARIANT = { Scheduled: 'active', Auto: 'muted', Done: 'done' };

export default function BusinessHome() {
  const { data: properties } = useProperties();
  const requestPickup = useRequestExtraPickup();
  const toast = useToast();
  const [requested, setRequested] = useState({});

  const onRequest = (property) => {
    requestPickup.mutate(property.name, {
      onSuccess: () => {
        setRequested((r) => ({ ...r, [property.id]: true }));
        toast.show(`Extra pickup requested for ${property.name}`);
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader
        title="Looppr for Business"
        subtitle="Hazel St Airbnb · 3 properties · net-30"
        statusPill={<StatusPill label="Commercial" variant="active" />}
      />
      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[colors.brandLight, colors.brand]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 18, padding: 18, marginBottom: 14 }}
        >
          <Text className="font-body-bold text-[10.5px] tracking-wider uppercase text-tint mb-[4px]">Linen service plan</Text>
          <Text className="font-display-semibold text-[19px] text-white mb-[4px]">Turnover-synced · 2×/week</Text>
          <Text className="font-body text-[12px] text-[#F1EFFE] mb-lg">Commercial rate $1.40/lb</Text>
          <Button
            title="Request extra pickup"
            variant="secondary"
            style={{ borderWidth: 0 }}
            onPress={() => onRequest(properties?.[0] ?? { id: 'general', name: 'Hazel St Airbnb' })}
          />
        </LinearGradient>

        <Text className="font-body-bold text-[11px] tracking-wider uppercase text-muted mb-sm">Properties</Text>
        <View className="gap-sm">
          {(properties ?? []).map((property) => (
            <View key={property.id} className="bg-white border border-border rounded-md px-lg py-[13px] flex-row items-center gap-md">
              <View className="flex-1 min-w-0">
                <Text className="font-body-bold text-[13.5px] text-ink">{property.name}</Text>
                <Text className="font-body text-[11.5px] text-muted">{property.sub}</Text>
              </View>
              {requested[property.id] ? (
                <StatusPill label="Requested ✓" variant="done" />
              ) : (
                <StatusPill label={property.status} variant={STATUS_VARIANT[property.status] ?? 'muted'} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
