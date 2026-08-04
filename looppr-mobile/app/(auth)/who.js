import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AuthShell from '../../src/features/auth/AuthShell';
import BackButton from '../../src/components/BackButton';
import AvatarTile from '../../src/components/AvatarTile';
import { WHO_SCREEN } from '../../src/features/auth/roleOptions';
import { colors } from '../../src/theme/tokens';

export default function Who() {
  const { category } = useLocalSearchParams();
  const screen = WHO_SCREEN[category] ?? WHO_SCREEN.customer;

  return (
    <AuthShell>
      <View className="flex-1 px-2xl pt-lg pb-2xl">
        <BackButton onPress={() => router.back()} style={{ marginBottom: 30 }} />
        <Text className="font-display-semibold text-[25px] text-ink mb-[6px]">{screen.title}</Text>
        <Text className="font-body text-[13px] text-muted mb-2xl">{screen.subtitle}</Text>

        <View className="gap-md">
          {screen.options.map((opt) => (
            <Pressable
              key={opt.role}
              onPress={() => router.push(`/(auth)/login?role=${opt.role}`)}
              className="flex-row items-start gap-md bg-white border-[1.5px] border-border rounded-xl px-lg py-lg"
            >
              <AvatarTile label={opt.mark} bg={opt.bg} fg={opt.c} size={44} radius={13} />
              <View className="flex-1 min-w-0">
                <Text className="font-body-bold text-[15px] text-ink mb-[3px]">{opt.label}</Text>
                <Text className="font-body text-[12px] text-muted leading-[18px]">{opt.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={15} color={colors.faint} style={{ marginTop: 14 }} />
            </Pressable>
          ))}
        </View>
      </View>
    </AuthShell>
  );
}
