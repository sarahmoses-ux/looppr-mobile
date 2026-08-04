import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as notificationsApi from '../services/api/notifications.api';
import { useSettings } from '../store/settingsStore';
import { useAuth } from '../context/AuthContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Registers for push once the user has both signed in and turned
// notifications on in Settings. Requires an EAS project id to fetch a real
// Expo push token (see app.json/eas.json) — until one exists this safely
// stops after the local permission request instead of throwing.
export function useRegisterPushNotifications() {
  const { notificationsEnabled } = useSettings();
  const { status, user } = useAuth();

  useEffect(() => {
    if (!notificationsEnabled || status !== 'signedIn' || !user) return;

    (async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      const { status: permStatus } = await Notifications.requestPermissionsAsync();
      if (permStatus !== 'granted') return;

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) return;

      const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
      await notificationsApi.registerPushToken({ token });
    })().catch(() => {});
  }, [notificationsEnabled, status, user]);
}
