import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../../src/components/ScreenHeader';
import AvatarTile from '../../../src/components/AvatarTile';
import Card from '../../../src/components/Card';
import Button from '../../../src/components/Button';
import Toggle from '../../../src/components/Toggle';
import AddressForm, { EMPTY_ADDRESS, isAddressComplete } from '../../../src/components/AddressForm';
import { useProfile, useUpdateProfile } from '../../../src/hooks/useProfile';
import { useAddresses, useAddAddress, useDeleteAddress } from '../../../src/hooks/useAddresses';
import { useToast } from '../../../src/context/ToastContext';
import { initials } from '../../../src/utils/format';
import { colors } from '../../../src/theme/tokens';

export default function Profile() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: addresses } = useAddresses();
  const addAddress = useAddAddress();
  const deleteAddress = useDeleteAddress();
  const toast = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState(EMPTY_ADDRESS);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setPhone(profile.phone ?? '');
    }
  }, [profile?.name, profile?.phone]);

  const hasChanges = profile && (name !== profile.name || phone !== profile.phone);
  const memberSince = profile?.createdAt ? new Date(profile.createdAt).getFullYear() : null;

  const onSaveProfile = () => {
    updateProfile.mutate(
      { name, phone },
      {
        onSuccess: () => toast.show('Profile updated'),
        onError: (err) => toast.show(err.message, 'error'),
      }
    );
  };

  const onSaveNewAddress = async () => {
    if (!isAddressComplete(newAddress)) return;
    try {
      await addAddress.mutateAsync(newAddress);
      setShowAddAddress(false);
      setNewAddress(EMPTY_ADDRESS);
    } catch (err) {
      toast.show(err.message, 'error');
    }
  };

  const onDeleteAddress = (id) => {
    deleteAddress.mutate({ id }, { onError: (err) => toast.show(err.message, 'error') });
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader title="Profile" subtitle={profile?.email} />
      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View className="items-center mb-2xl mt-sm">
          <AvatarTile label={profile ? initials(profile.name) : ''} size={64} circle />
          <Text className="font-display-semibold text-[18px] text-ink mt-sm">{profile?.name}</Text>
          <Text className="font-body text-[12px] text-muted mt-[2px]">
            {memberSince ? `Member since ${memberSince}` : ''}
          </Text>
        </View>

        <Text className="font-body-bold text-[11px] tracking-wider uppercase text-muted mb-sm">Contact info</Text>
        <Card className="mb-lg gap-sm">
          <View>
            <Text className="font-body-bold text-[10px] tracking-wider uppercase text-muted mb-[2px]">Full name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              className="font-body-semibold text-[13.5px] text-ink p-0"
            />
          </View>
          <View className="h-[1px] bg-divider" />
          <View>
            <Text className="font-body-bold text-[10px] tracking-wider uppercase text-muted mb-[2px]">Phone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              className="font-body-semibold text-[13.5px] text-ink p-0"
            />
          </View>
          {hasChanges ? (
            <Button title="Save changes" onPress={onSaveProfile} loading={updateProfile.isPending} className="mt-sm" />
          ) : null}
        </Card>

        <View className="bg-white border border-border rounded-md px-lg py-[13px] flex-row items-center gap-md mb-2xl">
          <View className="flex-1">
            <Text className="font-body-bold text-[13px] text-ink">Email notifications</Text>
            <Text className="font-body text-[11.5px] text-muted">Order updates & receipts</Text>
          </View>
          <Toggle
            value={Boolean(profile?.emailNotifications)}
            onValueChange={(v) => updateProfile.mutate({ emailNotifications: v })}
          />
        </View>

        <View className="flex-row items-center justify-between mb-sm">
          <Text className="font-body-bold text-[11px] tracking-wider uppercase text-muted">Saved addresses</Text>
          <Pressable onPress={() => setShowAddAddress((v) => !v)}>
            <Text className="font-body-bold text-[11.5px] text-brandDeep">{showAddAddress ? 'Cancel' : '+ Add'}</Text>
          </Pressable>
        </View>

        {showAddAddress ? (
          <Card className="mb-md">
            <AddressForm value={newAddress} onChange={setNewAddress} showLabel />
            <Button
              title="Save address"
              className="mt-md"
              loading={addAddress.isPending}
              disabled={!isAddressComplete(newAddress)}
              onPress={onSaveNewAddress}
            />
          </Card>
        ) : null}

        <View className="gap-sm">
          {(addresses ?? []).map((a) => (
            <View key={a._id} className="flex-row items-center gap-md bg-white border border-border rounded-md px-lg py-[13px]">
              <View className="w-9 h-9 rounded-md bg-tint items-center justify-center">
                <Ionicons name="location-outline" size={16} color={colors.brandDeep} />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="font-body-bold text-[13px] text-ink">{a.label}</Text>
                <Text className="font-body text-[11.5px] text-muted" numberOfLines={1}>
                  {a.street}{a.apartment ? `, ${a.apartment}` : ''}, {a.city}, {a.state} {a.zip}
                </Text>
              </View>
              <Pressable onPress={() => onDeleteAddress(a._id)} className="p-[6px]">
                <Ionicons name="trash-outline" size={16} color={colors.faint} />
              </Pressable>
            </View>
          ))}
          {!addresses?.length && !showAddAddress ? (
            <Text className="font-body text-[12px] text-muted text-center py-lg">No saved addresses yet.</Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
