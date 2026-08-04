import { Tabs } from 'expo-router';
import TabBar from '../../../src/components/TabBar';

export default function BusinessTabsLayout() {
  return (
    <Tabs
      initialRouteName="home"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" options={{ title: 'Properties', tabBarIcon: 'business-outline' }} />
      <Tabs.Screen name="invoices" options={{ title: 'Invoices', tabBarIcon: 'receipt-outline' }} />
    </Tabs>
  );
}
