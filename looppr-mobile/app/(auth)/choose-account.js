import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  const { user, switchRole } = useAuth();

  const enter = async (role) => {
    await switchRole(role);
    router.replace('/');
  };

  return (
    <AuthShell>
      <View className="flex-1 px-2xl pt-lg pb-2xl">
        <Text className="font-display-semibold text-[22px] text-ink mb-[4px]">Choose your account</Text>
        <Text className="font-body text-[12.5px] text-muted mb-2xl">This email has more than one Looppr role.</Text>

        <View className="gap-sm">
          {(user?.ownedRoles ?? []).map((role) => {
            const copy = AUTH_ROLE_COPY[role] ?? {};
            return (
              <Pressable
                key={role}
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
            );
          })}
        </View>
      </View>
    </AuthShell>
  );
}
