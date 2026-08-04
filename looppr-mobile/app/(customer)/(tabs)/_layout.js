import { Tabs } from 'expo-router';
import TabBar from '../../../src/components/TabBar';

export default function CustomerTabsLayout() {
  return (
    <Tabs
      initialRouteName="home"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: 'home-outline' }} />
      <Tabs.Screen name="book" options={{ title: 'Book', tabBarIcon: 'add-circle-outline' }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: 'list-outline' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: 'person-outline' }} />
    </Tabs>
  );
}
