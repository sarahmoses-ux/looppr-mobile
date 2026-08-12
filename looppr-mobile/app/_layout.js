import '../global.css';
import { useCallback, useEffect, useRef } from 'react';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk';

import { queryClient } from '../src/config/queryClient';
import { env } from '../src/config/env';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import { SettingsProvider } from '../src/store/settingsStore';
import { SettingsSheetProvider } from '../src/navigation/SettingsSheetContext';
import { paperTheme } from '../src/theme/paperTheme';
import { colors } from '../src/theme/tokens';
import ToastHost from '../src/components/ToastHost';
import SettingsSheet from '../src/components/SettingsSheet';
import ResponsiveContainer from '../src/components/ResponsiveContainer';
import { useRegisterPushNotifications } from '../src/hooks/usePushNotifications';

SplashScreen.preventAutoHideAsync().catch(() => {});

function PushNotificationsBridge() {
  useRegisterPushNotifications();
  return null;
}

export default function RootLayout() {
  const settingsSheetRef = useRef(null);
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_500Medium,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StripeProvider publishableKey={env.stripePublishableKey}>
          <QueryClientProvider client={queryClient}>
            <PaperProvider theme={paperTheme}>
              <AuthProvider>
                <SettingsProvider>
                  <ToastProvider>
                    <BottomSheetModalProvider>
                      <SettingsSheetProvider sheetRef={settingsSheetRef}>
                        <PushNotificationsBridge />
                        <ResponsiveContainer>
                          <Slot />
                        </ResponsiveContainer>
                        <SettingsSheet ref={settingsSheetRef} />
                        <ToastHost />
                      </SettingsSheetProvider>
                    </BottomSheetModalProvider>
                  </ToastProvider>
                </SettingsProvider>
              </AuthProvider>
            </PaperProvider>
          </QueryClientProvider>
        </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
