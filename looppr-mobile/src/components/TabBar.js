import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/tokens';

// Generic bottom tab bar matching the mockup's frosted-white bar with
// active/inactive icon+label color states. Pass as the `tabBar` render prop
// to expo-router's <Tabs> in every role's (tabs)/_layout.js — icon names
// come from each route's options.tabBarIcon (an Ionicons name string).
export default function TabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row bg-white/95 border-t border-border px-sm pt-sm"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const label = options.title ?? route.name;
        const iconName = options.tabBarIcon ?? 'ellipse-outline';
        const color = isFocused ? colors.brandDeep : colors.faint;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable key={route.key} onPress={onPress} className="flex-1 items-center gap-[2px] py-[4px]">
            <Ionicons name={iconName} size={21} color={color} />
            <Text style={{ color }} className="font-body-bold text-[10.5px]">{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
