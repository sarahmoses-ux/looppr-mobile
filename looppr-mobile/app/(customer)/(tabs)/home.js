import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenHeader from '../../../src/components/ScreenHeader';
import Card from '../../../src/components/Card';
import Button from '../../../src/components/Button';
import { SegmentedProgressBar } from '../../../src/components/ProgressBar';
import { useMyPickups, useMyStats } from '../../../src/hooks/usePickups';
import { useNotifications } from '../../../src/hooks/useNotifications';
import { colors } from '../../../src/theme/tokens';
import { PICKUP_STATUS_ORDER, TERMINAL_STATUSES, pickupStatusLabel } from '../../../src/constants/pickupStatus';
import { WINDOW_OPTIONS } from '../../../src/features/customer/bookingOptions';
import { formatCurrency, formatShortDate } from '../../../src/utils/format';

const STAGE_SEGMENTS = ['done', 'active', 'upcomingLight', 'upcomingLight'];
const STAGGER_MS = 70;
const windowLabel = (key) => WINDOW_OPTIONS.find((w) => w.key === key)?.label ?? key;

export default function Home() {
  const { data: pickups } = useMyPickups();
  const { data: stats } = useMyStats();
  const { data: notifications } = useNotifications();

  const activeOrder = pickups?.find((p) => !TERMINAL_STATUSES.includes(p.status));
  const lastOrder = pickups?.[0];
  const unread = notifications?.filter((n) => !n.read).length ?? 0;
  const stageIdx = activeOrder ? PICKUP_STATUS_ORDER.indexOf(activeOrder.status) : -1;
  const segments = STAGE_SEGMENTS.map((_, i) => (i < stageIdx ? 'done' : i === stageIdx ? 'active' : 'upcomingLight'));

  const onBookAgain = () => {
    if (!lastOrder) {
      router.push('/(customer)/(tabs)/book');
      return;
    }
    const { street, apartment, city, state, zip } = lastOrder.address ?? {};
    router.push({
      pathname: '/(customer)/(tabs)/book',
      params: { rebookAddress: JSON.stringify({ street, apartment, city, state, zip }) },
    });
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
                  Order {activeOrder._id.slice(-6).toUpperCase()} · {pickupStatusLabel(activeOrder.status)}
                </Text>
              </View>
              <Text className="font-display-semibold text-[19px] text-white mb-[4px]">{activeOrder.address?.street}</Text>
              <Text className="font-body text-[12.5px] text-[#F1EFFE] mb-lg">{windowLabel(activeOrder.window)} pickup</Text>
              <View className="mb-lg">
                <SegmentedProgressBar segments={segments} />
              </View>
              <Button
                title="Track live →"
                variant="secondary"
                style={{ borderWidth: 0 }}
                onPress={() => router.push(`/(customer)/track?orderId=${activeOrder._id}`)}
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
            <Text className="font-body text-[11.5px] text-muted">Choose your address & date</Text>
          </Card>
          <Card className="flex-1 p-[15px]" onPress={onBookAgain}>
            <View className="w-8 h-8 rounded-xs bg-successBg items-center justify-center mb-sm">
              <Ionicons name="refresh" size={16} color={colors.success} />
            </View>
            <Text className="font-body-bold text-[13.5px] text-ink mb-[1px]">Book again</Text>
            <Text className="font-body text-[11.5px] text-muted" numberOfLines={1}>
              {lastOrder ? lastOrder.address?.street : 'No orders yet'}
            </Text>
          </Card>
        </Animated.View>

        <Animated.View entering={rise()} className="flex-row gap-sm mb-md">
          <Card className="flex-1 items-center py-lg">
            <Text className="font-display-semibold text-[22px] text-ink">{stats?.totalOrders ?? 0}</Text>
            <Text className="font-body text-[11px] text-muted mt-[2px]">Total orders</Text>
          </Card>
          <Card className="flex-1 items-center py-lg">
            <Text className="font-display-semibold text-[22px] text-ink">{formatCurrency(stats?.totalSpent ?? 0)}</Text>
            <Text className="font-body text-[11px] text-muted mt-[2px]">Total spent</Text>
          </Card>
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
