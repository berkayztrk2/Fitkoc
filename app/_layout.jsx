import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Pressable, ScrollView } from 'react-native';

import { UserProvider } from '../context/UserContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

// Herhangi bir ekranda beklenmeyen bir hata olursa beyaz/çöken ekran yerine
// kullanıcıya düzgün bir "tekrar dene" arayüzü gösterilir (expo-router yakalar).
export function ErrorBoundary({ error, retry }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>😕</Text>
      <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 8, textAlign: 'center' }}>
        Bir şeyler ters gitti
      </Text>
      <Text style={{ color: '#A1A1A6', fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
        Beklenmeyen bir hata oluştu. Tekrar deneyebilirsin.
      </Text>
      <ScrollView style={{ maxHeight: 120, alignSelf: 'stretch', marginBottom: 20 }}>
        <Text style={{ color: '#FF6B6B', fontSize: 12, textAlign: 'center' }}>
          {error?.message || String(error)}
        </Text>
      </ScrollView>
      <Pressable
        onPress={retry}
        style={{ backgroundColor: '#FF6B35', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 16 }}
      >
        <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '800' }}>Tekrar Dene</Text>
      </Pressable>
    </View>
  );
}

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
