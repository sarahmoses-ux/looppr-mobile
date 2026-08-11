import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenHeader from '../../../src/components/ScreenHeader';
import Card from '../../../src/components/Card';
import Button from '../../../src/components/Button';
import Toggle from '../../../src/components/Toggle';
import { SegmentedProgressBar } from '../../../src/components/ProgressBar';
import { useOrders } from '../../../src/hooks/useOrders';
import { useNotifications } from '../../../src/hooks/useNotifications';
import { useProfile, useUpdatePreferences } from '../../../src/hooks/useProfile';
import { useToast } from '../../../src/context/ToastContext';
import { colors } from '../../../src/theme/tokens';
import { ORDER_STAGE, ORDER_STAGE_LABEL, ORDER_STAGE_ORDER } from '../../../src/constants/orderStages';
import { formatCurrency, formatShortDate } from '../../../src/utils/format';

const STAGE_SEGMENTS = ['done', 'active', 'upcomingLight', 'upcomingLight', 'upcomingLight'];
const STAGGER_MS = 70;

export default function Home() {
  const { data: orders } = useOrders();
  const { data: notifications } = useNotifications();
  const { data: profile } = useProfile();
  const updatePreferences = useUpdatePreferences();
  const toast = useToast();

  const activeOrder = orders?.find((o) => o.stage !== ORDER_STAGE.DELIVERED);
  const unread = notifications?.filter((n) => !n.read).length ?? 0;
  const stageIdx = activeOrder ? ORDER_STAGE_ORDER.indexOf(activeOrder.stage) : -1;
  const segments = STAGE_SEGMENTS.map((_, i) => (i < stageIdx ? 'done' : i === stageIdx ? 'active' : 'upcomingLight'));

  const copyCode = () => {
    toast.show(`Referral code ${profile?.referralCode ?? 'LOOP20'} copied`);
  };

  let step = 0;
  const rise = () => FadeInDown.delay((step++) * STAGGER_MS).duration(360);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader
        title="Looppr"
        subtitle={`Edmond, OK · ${formatShortDate(new Date())}`}
        onPressNotifications={() => router.push('/(customer)/notifications')}
        unreadCount={unread}
      />
      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {activeOrder ? (
          <Animated.View entering={rise()}>
            <LinearGradient colors={[colors.brand, colors.brand]} style={{ borderRadius: 18, padding: 18, marginBottom: 14 }}>
              <View className="flex-row items-center gap-sm mb-md">
                <View className="w-2 h-2 rounded-full bg-successBright" />
                <Text className="font-body-bold text-[12px] tracking-wider uppercase text-tint">
                  Order {activeOrder.id} · {ORDER_STAGE_LABEL[activeOrder.stage]}
                </Text>
              </View>
              <Text className="font-display-semibold text-[19px] text-white mb-[4px]">{activeOrder.vendor?.name}</Text>
              <Text className="font-body text-[12.5px] text-[#F1EFFE] mb-lg">{activeOrder.window}</Text>
              <View className="mb-lg">
                <SegmentedProgressBar segments={segments} />
              </View>
              <Button
                title="Track live →"
                variant="secondary"
                style={{ borderWidth: 0 }}
                onPress={() => router.push(`/(customer)/track?orderId=${activeOrder.id}`)}
              />
            </LinearGradient>
          </Animated.View>
        ) : null}

        <Animated.View entering={rise()} className="flex-row gap-sm mb-md">
          <Card className="flex-1 p-[15px]" onPress={() => router.push('/(customer)/(tabs)/book')}>
            <View className="w-8 h-8 rounded-xs bg-tint items-center justify-center mb-sm">
              <Ionicons name="add" size={16} color={colors.brandDeep} />
            </View>
            <Text className="font-body-bold text-[13.5px] text-ink mb-[1px]">Schedule pickup</Text>
            <Text className="font-body text-[11.5px] text-muted">Next window today 4 PM</Text>
          </Card>
          <Card className="flex-1 p-[15px]" onPress={() => router.push('/(customer)/(tabs)/book')}>
            <View className="w-8 h-8 rounded-xs bg-successBg items-center justify-center mb-sm">
              <Ionicons name="refresh" size={16} color={colors.success} />
            </View>
            <Text className="font-body-bold text-[13.5px] text-ink mb-[1px]">Reorder last</Text>
            <Text className="font-body text-[11.5px] text-muted">Wash & fold · {formatCurrency(38.25)}</Text>
          </Card>
        </Animated.View>

        <Animated.View entering={rise()}>
          <Card className="flex-row items-center gap-md mb-sm">
            <View className="w-9 h-9 rounded-md bg-tint items-center justify-center">
              <Ionicons name="calendar-outline" size={17} color={colors.brandDeep} />
            </View>
            <View className="flex-1">
              <Text className="font-body-bold text-[13px] text-ink">Weekly pickup</Text>
              <Text className="font-body text-[11.5px] text-muted">
                {profile?.preferences?.recurring ? 'Every Sunday, 4-6 PM' : 'Not scheduled'}
              </Text>
            </View>
            <Toggle
              value={Boolean(profile?.preferences?.recurring)}
              onValueChange={(v) => updatePreferences.mutate({ recurring: v })}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={rise()}>
          <LinearGradient
            colors={[colors.brandLight, colors.brand]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 15, padding: 16, marginBottom: 10 }}
          >
            <View className="flex-row items-center gap-md">
              <View className="flex-1">
                <Text className="font-body-bold text-[13.5px] text-white mb-[2px]">Give $20, get $20</Text>
                <Text className="font-body text-[11.5px] text-[#F1EFFE] leading-[16px]">
                  Friends get $20 off their first order — you get $20 credit.
                </Text>
              </View>
              <Button
                title={profile?.referralCode ?? 'LOOP20'}
                onPress={copyCode}
                className="px-md py-[9px]"
                style={{ backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
              />
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={rise()}>
          <View
            className="bg-white rounded-md px-lg py-[13px] flex-row items-center gap-md"
            style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: '#C8C2EE' }}
          >
            <View className="w-9 h-9 rounded-md items-center justify-center" style={{ backgroundColor: colors.warnBg }}>
              <Ionicons name="business-outline" size={16} color={colors.warnText} />
            </View>
            <View className="flex-1">
              <Text className="font-body-bold text-[13px] text-ink">Looppr for Business</Text>
              <Text className="font-body text-[11.5px] text-muted">Airbnbs, gyms, salons — commercial rates & invoicing.</Text>
            </View>
            <Text className="font-body-bold text-[12px] text-brandDeep">Learn →</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
