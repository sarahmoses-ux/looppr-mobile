import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../../src/components/ScreenHeader';
import AvatarTile from '../../../src/components/AvatarTile';
import ChipGroup from '../../../src/components/ChipGroup';
import Toggle from '../../../src/components/Toggle';
import { useProfile, useUpdatePreferences } from '../../../src/hooks/useProfile';
import { useToast } from '../../../src/context/ToastContext';
import { FOLD_OPTIONS, DETERGENT_OPTIONS, TEMP_OPTIONS } from '../../../src/features/customer/preferenceOptions';
import { initials } from '../../../src/utils/format';

export default function Profile() {
  const { data: profile } = useProfile();
  const updatePreferences = useUpdatePreferences();
  const toast = useToast();
  const prefs = profile?.preferences ?? {};

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader title="Profile" subtitle={profile?.email} />
      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View className="items-center mb-2xl mt-sm">
          <AvatarTile label={profile ? initials(profile.name) : ''} size={64} circle />
          <Text className="font-display-semibold text-[18px] text-ink mt-sm">{profile?.name}</Text>
          <Text className="font-body text-[12px] text-muted mt-[2px]">
            {profile?.address} · Member since {profile?.memberSince}
          </Text>
        </View>

        <ChipGroup
          label="Fold style"
          options={FOLD_OPTIONS}
          value={prefs.fold}
          onChange={(fold) => updatePreferences.mutate({ fold })}
        />
        <ChipGroup
          label="Detergent"
          options={DETERGENT_OPTIONS}
          value={prefs.detergent}
          onChange={(detergent) => updatePreferences.mutate({ detergent })}
        />
        <ChipGroup
          label="Water temp"
          options={TEMP_OPTIONS}
          value={prefs.temp}
          onChange={(temp) => updatePreferences.mutate({ temp })}
        />

        <View className="bg-white border border-border rounded-md px-lg py-[13px] flex-row items-center gap-md mb-sm">
          <View className="flex-1">
            <Text className="font-body-bold text-[13px] text-ink">Fabric softener</Text>
            <Text className="font-body text-[11.5px] text-muted">Applied to every order</Text>
          </View>
          <Toggle value={Boolean(prefs.softener)} onValueChange={(softener) => updatePreferences.mutate({ softener })} />
        </View>
        <View className="bg-white border border-border rounded-md px-lg py-[13px] flex-row items-center gap-md mb-lg">
          <View className="flex-1">
            <Text className="font-body-bold text-[13px] text-ink">Weekly pickup</Text>
            <Text className="font-body text-[11.5px] text-muted">{prefs.recurring ? 'Every Sunday, 4-6 PM' : 'Not scheduled'}</Text>
          </View>
          <Toggle value={Boolean(prefs.recurring)} onValueChange={(recurring) => updatePreferences.mutate({ recurring })} />
        </View>

        <View className="bg-white border border-border rounded-md px-lg py-[13px] flex-row items-center gap-md">
          <View className="flex-1">
            <Text className="font-body-bold text-[13px] text-ink">Referral code</Text>
            <Text className="font-body text-[11.5px] text-muted">$20 credit per friend you refer</Text>
          </View>
          <Text
            className="font-body-bold text-[12px] text-brandDeep"
            onPress={() => toast.show(`Referral code ${profile?.referralCode} copied`)}
          >
            Copy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
