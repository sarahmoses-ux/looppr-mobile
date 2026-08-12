import { forwardRef, useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../store/settingsStore';
import { ROLE_LABEL } from '../constants/roles';
import Toggle from './Toggle';
import Button from './Button';
import AvatarTile from './AvatarTile';
import StatusPill from './StatusPill';

// Shared Settings bottom sheet (accounts, preferences, security, logout) —
// mounted once at the root layout and opened via ref from any role's header.
const SettingsSheet = forwardRef(function SettingsSheet(_props, ref) {
  const { user, currentRole, switchRole, signOut } = useAuth();
  const { notificationsEnabled, darkMode, toggleNotifications, toggleDarkMode } = useSettings();
  const snapPoints = useMemo(() => ['65%'], []);

  const close = useCallback(() => {
    ref?.current?.dismiss();
  }, [ref]);

  // signOut() only clears auth state — nothing in expo-router's Slot-based
  // root layout reacts to that on its own, so without this the current
  // (now-unauthenticated) screen would just stay mounted, broken.
  const handleLogout = useCallback(async () => {
    close();
    await signOut();
    router.replace('/');
  }, [close, signOut]);

  return (
    <BottomSheetModal ref={ref} snapPoints={snapPoints} backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 22 }}>
      <BottomSheetView className="px-lg pb-xl">
        <View className="flex-row items-center mb-lg">
          <Text className="flex-1 font-display-semibold text-[19px] text-ink">Settings</Text>
          <Button title="✕" variant="secondary" onPress={close} className="w-[30px] h-[30px] px-0 py-0" />
        </View>

        <Text className="font-body-bold text-[10.5px] tracking-wider uppercase text-muted mb-sm ml-[2px]">Your accounts</Text>
        <View className="gap-sm mb-lg">
          {(user?.ownedRoles ?? []).map((role) => (
            <View key={role} className="flex-row items-center gap-md bg-white border-[1.5px] border-border rounded-md px-md py-[11px]">
              <AvatarTile label={ROLE_LABEL[role]?.slice(0, 2)?.toUpperCase()} size={34} radius={10} />
              <View className="flex-1 min-w-0">
                <Text className="font-body-bold text-[13px] text-ink">{ROLE_LABEL[role]}</Text>
                <Text className="font-body text-[11px] text-muted">{user?.email}</Text>
              </View>
              {role === currentRole ? (
                <StatusPill label="Current" variant="active" />
              ) : (
                <Button title="Switch" onPress={() => switchRole(role)} className="px-md py-[7px]" />
              )}
            </View>
          ))}
        </View>

        <Text className="font-body-bold text-[10.5px] tracking-wider uppercase text-muted mb-sm ml-[2px]">Preferences</Text>
        <View className="bg-white border border-border rounded-md mb-lg">
          <View className="flex-row items-center gap-md px-md py-[12px] border-b border-divider">
            <Text className="flex-1 font-body-bold text-[13px] text-ink">Notifications</Text>
            <Toggle value={notificationsEnabled} onValueChange={toggleNotifications} />
          </View>
          <View className="flex-row items-center gap-md px-md py-[12px] border-b border-divider">
            <Text className="flex-1 font-body-bold text-[13px] text-ink">Dark mode</Text>
            <Toggle value={darkMode} onValueChange={toggleDarkMode} />
          </View>
          <View className="flex-row items-center gap-md px-md py-[12px]">
            <Text className="flex-1 font-body-bold text-[13px] text-ink">Language</Text>
            <Text className="font-body-semibold text-[12px] text-muted">English ›</Text>
          </View>
        </View>

        <Text className="font-body-bold text-[10.5px] tracking-wider uppercase text-muted mb-sm ml-[2px]">Security & support</Text>
        <View className="bg-white border border-border rounded-md mb-lg">
          <View className="flex-row items-center gap-md px-md py-[12px] border-b border-divider">
            <Text className="flex-1 font-body-bold text-[13px] text-ink">Account security</Text>
            <Text className="font-body-semibold text-[12px] text-faint">›</Text>
          </View>
          <View className="flex-row items-center gap-md px-md py-[12px]">
            <Text className="flex-1 font-body-bold text-[13px] text-ink">Help center</Text>
            <Text className="font-body-semibold text-[12px] text-faint">›</Text>
          </View>
        </View>

        <Button title="Log out" variant="danger" onPress={handleLogout} />
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default SettingsSheet;
