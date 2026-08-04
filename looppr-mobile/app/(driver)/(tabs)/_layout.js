import { Tabs } from 'expo-router';
import TabBar from '../../../src/components/TabBar';

export default function DriverTabsLayout() {
  return (
    <Tabs
      initialRouteName="route"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="route" options={{ title: 'Route', tabBarIcon: 'navigate-outline' }} />
      <Tabs.Screen name="scan" options={{ title: 'Weigh-in', tabBarIcon: 'scan-outline' }} />
      <Tabs.Screen name="earn" options={{ title: 'Earnings', tabBarIcon: 'cash-outline' }} />
    </Tabs>
  );
}
