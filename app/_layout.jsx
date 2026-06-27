import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

let notifee = null;
if (Platform.OS === 'android') {
  notifee = require('@notifee/react-native').default;
  notifee.registerForegroundService((notification) => {
    return new Promise(() => {
      // Keep the service running
    });
  });
}
import { UserProvider } from '../context/UserContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function RootContent() {
  const { isDark, colors } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <UserProvider>
        <RootContent />
      </UserProvider>
    </ThemeProvider>
  );
}
