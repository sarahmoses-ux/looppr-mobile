import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  Extrapolation,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '../../theme/tokens';
import { PICKUP_STATUS_ORDER as ORDER_STAGE_ORDER, PICKUP_STATUS_LABEL as ORDER_STAGE_LABEL } from '../../constants/pickupStatus';
import { ROLES } from '../../constants/roles';
import { AUTH_ROLE_COPY } from './roleOptions';

const STAGE_CARD = { width: 250, height: 250, alignItems: 'center', justifyContent: 'center' };

// --- Slide 1: pickup ------------------------------------------------------
// A bag dropping onto the doorstep with a spring, then a floating pickup-
// window pill — the same "Today · 4–6 PM" phrasing used on real order cards.
export function PickupArt() {
  const drop = useSharedValue(0);
  const bob = useSharedValue(0);
  const pill = useSharedValue(0);
  const ring = useSharedValue(0);

  useEffect(() => {
    drop.value = withSpring(1, { damping: 9, stiffness: 90, mass: 0.9 });
    ring.value = withDelay(120, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    pill.value = withDelay(420, withSpring(1, { damping: 12, stiffness: 140 }));
    bob.value = withDelay(700, withRepeat(withSequence(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) })
    ), -1, true));
  }, []);

  const matStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ring.value, [0, 1], [0, 1]),
    transform: [{ scaleX: interpolate(ring.value, [0, 1], [0.7, 1]) }],
  }));

  const bagStyle = useAnimatedStyle(() => {
    const y = interpolate(drop.value, [0, 0.7, 1], [-70, 6, 0], Extrapolation.CLAMP);
    const bobY = interpolate(bob.value, [0, 1], [0, -5]);
    const squash = interpolate(drop.value, [0.85, 1], [1, 0.92], Extrapolation.CLAMP);
    return {
      opacity: interpolate(drop.value, [0, 0.15, 1], [0, 1, 1]),
      transform: [{ translateY: y + bobY }, { scaleY: squash }, { scaleX: 2 - squash }],
    };
  });

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pill.value,
    transform: [{ translateY: interpolate(pill.value, [0, 1], [10, 0]) }, { scale: interpolate(pill.value, [0, 1], [0.85, 1]) }],
  }));

  return (
    <View style={STAGE_CARD}>
      <View style={{ width: 132, height: 132, alignItems: 'center', justifyContent: 'flex-end' }}>
        <Animated.View
          style={[
            { position: 'absolute', bottom: 6, width: 120, height: 14, borderRadius: 999, backgroundColor: colors.tint },
            matStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              width: 88, height: 88, borderRadius: 26, backgroundColor: colors.brand,
              alignItems: 'center', justifyContent: 'center', marginBottom: 8,
              shadowColor: '#1E1B4B', shadowOpacity: 0.3, shadowRadius: 26, shadowOffset: { width: 0, height: 14 }, elevation: 8,
            },
            bagStyle,
          ]}
        >
          <Ionicons name="bag-handle-outline" size={40} color="#F1EFFE" />
        </Animated.View>
      </View>
      <Animated.View
        style={[
          {
            flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 22,
            backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
            borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14,
          },
          pillStyle,
        ]}
      >
        <Ionicons name="time-outline" size={14} color={colors.brandDeep} />
        <Text className="font-body-bold text-[12px] text-ink">Today · 4–6 PM</Text>
      </Animated.View>
    </View>
  );
}

// --- Slide 2: track ---------------------------------------------------------
// The real order pipeline (ORDER_STAGE_ORDER), auto-advancing through every
// stage on a loop so the motion itself explains "watch your order move".
export function TrackArt() {
  const step = useSharedValue(0);
  const total = ORDER_STAGE_ORDER.length;

  useEffect(() => {
    step.value = withDelay(
      300,
      withRepeat(
        withSequence(
          ...ORDER_STAGE_ORDER.map((_, i) => withTiming(i, { duration: i === 0 ? 1 : 650, easing: Easing.out(Easing.cubic) })),
          withTiming(total - 1, { duration: 900 }),
          withTiming(0, { duration: 1 })
        ),
        -1,
        false
      )
    );
  }, []);

  return (
    <View style={[STAGE_CARD, { alignItems: 'flex-start', paddingLeft: 40 }]}>
      {ORDER_STAGE_ORDER.map((stage, i) => (
        <StageRow key={stage} label={ORDER_STAGE_LABEL[stage]} index={i} step={step} isLast={i === total - 1} />
      ))}
    </View>
  );
}

function StageRow({ label, index, step, isLast }) {
  const dotStyle = useAnimatedStyle(() => {
    const done = step.value > index;
    const active = Math.round(step.value) === index;
    return {
      backgroundColor: withTiming(done ? colors.success : active ? colors.brand : colors.divider, { duration: 260 }),
      transform: [{ scale: withTiming(active ? 1.25 : 1, { duration: 260 }) }],
    };
  });

  const lineStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(step.value > index ? colors.success : colors.divider, { duration: 260 }),
  }));

  const labelStyle = useAnimatedStyle(() => {
    const active = Math.round(step.value) === index;
    const done = step.value > index;
    return {
      opacity: withTiming(active || done ? 1 : 0.55, { duration: 260 }),
    };
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', height: isLast ? 22 : 40 }}>
      <View style={{ alignItems: 'center', width: 14, marginRight: 12 }}>
        <Animated.View style={[{ width: 12, height: 12, borderRadius: 6 }, dotStyle]} />
        {!isLast ? <Animated.View style={[{ width: 2, flex: 1, marginTop: 2 }, lineStyle]} /> : null}
      </View>
      <Animated.Text style={[{ fontSize: 13, marginTop: -1 }, labelStyle]} className="font-body-semibold text-ink">
        {label}
      </Animated.Text>
    </View>
  );
}

// --- Slide 3: roles ----------------------------------------------------------
// The four real auth roles orbiting the loop mark — "everyone in the loop"
// made literal. Positions are computed directly from the orbital angle, so
// each chip stays upright without needing a counter-rotation.
const ORBIT_ROLES = [ROLES.RESIDENTIAL, ROLES.BUSINESS, ROLES.PARTNER, ROLES.DRIVER];

export function RolesArt() {
  const angle = useSharedValue(0);
  const enter = useSharedValue(0);

  useEffect(() => {
    enter.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    angle.value = withRepeat(withTiming(360, { duration: 26000, easing: Easing.linear }), -1, false);
  }, []);

  const markStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ scale: interpolate(enter.value, [0, 1], [0.7, 1]) }],
  }));

  return (
    <View style={[STAGE_CARD]}>
      <View style={{ width: 210, height: 210, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={markStyle}>
          <Image source={require('../../../assets/images/looppr-mark.png')} style={{ width: 56, height: 56 }} contentFit="contain" />
        </Animated.View>
        {ORBIT_ROLES.map((role, i) => (
          <OrbitChip key={role} role={role} index={i} count={ORBIT_ROLES.length} angle={angle} enter={enter} />
        ))}
      </View>
    </View>
  );
}

function OrbitChip({ role, index, count, angle, enter }) {
  const copy = AUTH_ROLE_COPY[role];
  const radius = 92;
  const baseDeg = (360 / count) * index;

  const style = useAnimatedStyle(() => {
    const deg = baseDeg + angle.value;
    const rad = (deg * Math.PI) / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;
    return {
      opacity: enter.value,
      // No counter-rotation needed: x/y are computed directly from the
      // orbital angle (not inherited from a rotated parent), so the chip's
      // own orientation was never touched — it's upright by construction.
      transform: [
        { translateX: x },
        { translateY: y },
        { scale: interpolate(enter.value, [0, 1], [0.5, 1]) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute', width: 40, height: 40, borderRadius: 13,
          backgroundColor: copy.bg, alignItems: 'center', justifyContent: 'center',
          shadowColor: '#1E1B4B', shadowOpacity: 0.14, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
        },
        style,
      ]}
    >
      <Text style={{ color: copy.c }} className="font-display-semibold text-[13px]">
        {copy.mark}
      </Text>
    </Animated.View>
  );
}
