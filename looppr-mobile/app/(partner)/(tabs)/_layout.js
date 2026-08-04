import { Tabs } from 'expo-router';
import TabBar from '../../../src/components/TabBar';

export default function PartnerTabsLayout() {
  return (
    <Tabs
      initialRouteName="queue"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="queue" options={{ title: 'Queue', tabBarIcon: 'file-tray-stacked-outline' }} />
      <Tabs.Screen name="payouts" options={{ title: 'Payouts', tabBarIcon: 'cash-outline' }} />
    </Tabs>
  );
}
