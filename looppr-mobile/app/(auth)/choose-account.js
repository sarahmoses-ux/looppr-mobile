import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AuthShell from '../../src/features/auth/AuthShell';
import AvatarTile from '../../src/components/AvatarTile';
import { AUTH_ROLE_COPY } from '../../src/features/auth/roleOptions';
import { ROLE_LABEL } from '../../src/constants/roles';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/tokens';

// Shown when a login/signup resolves to an account that owns more than one
// role (e.g. residential + driver) — lets the user pick which dashboard to
// land in. They can always switch again later from the Settings sheet.
export default function ChooseAccount() {
  const { user, switchRole, signOut } = useAuth();
  const ownedRoles = user?.ownedRoles ?? [];

  const enter = async (role) => {
    await switchRole(role);
    router.replace('/');
  };

  const useDifferentAccount = async () => {
    await signOut();
    router.replace('/(auth)/welcome');
  };

  return (
    <AuthShell>
      <View className="flex-1 px-2xl pt-lg pb-2xl">
        <Animated.View entering={FadeInDown.delay(0).duration(360)}>
          <Text className="font-display-semibold text-[22px] text-ink mb-[4px]">Choose your account</Text>
          <Text className="font-body text-[12.5px] text-muted mb-2xl">
            {user?.email} owns {ownedRoles.length} Looppr account{ownedRoles.length === 1 ? '' : 's'} — pick which one to access.
          </Text>
        </Animated.View>

        <View className="gap-sm">
          {ownedRoles.map((role, i) => {
            const copy = AUTH_ROLE_COPY[role] ?? {};
            return (
              <Animated.View key={role} entering={FadeInDown.delay(70 + i * 70).duration(360)}>
                <Pressable
                  onPress={() => enter(role)}
                  className="flex-row items-center gap-md bg-white border-[1.5px] border-border rounded-lg px-md py-[14px]"
                >
                  <AvatarTile label={copy.mark} bg={copy.bg} fg={copy.c} size={42} radius={12} />
                  <View className="flex-1 min-w-0">
                    <Text className="font-body-bold text-[14.5px] text-ink">{ROLE_LABEL[role]}</Text>
                    <Text className="font-body text-[11.5px] text-muted">{copy.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={15} color={colors.faint} />
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        <Pressable onPress={useDifferentAccount} className="mt-lg">
          <Text className="font-body-bold text-[12.5px] text-brand text-center">Use a different account</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}
