import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { Shield } from 'lucide-react-native';

export default function IndexScreen() {
  const { profile, isReady, isAuth } = useUser();
  const { colors, isDark } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    let forceHideTimer;

    // 1. Animasyonları başlat (Fade In & Scale Up)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web',
      })
    ]).start();

    // 2. Minimum 2.5 saniye ekranda kalmasını sağla
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => {
        setShowSplash(false);
      });

      // Güvenlik önlemi: Animasyon takılsa bile 600ms sonra kesinlikle kapat
      forceHideTimer = setTimeout(() => {
        setShowSplash(false);
      }, 600);
    }, 2500);

    return () => {
      clearTimeout(timer);
      if (forceHideTimer) clearTimeout(forceHideTimer);
    };
  }, []);

  // Eğer splash ekranı gösterimde ise VEYA veriler yüklenmediyse splash'i render et
  if (showSplash || !isReady) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: colors.background }]}>
        <Animated.View
          style={[
            styles.logoContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}
        >
          <View style={styles.iconBg}>
            <Shield size={48} color="#FF6B35" />
          </View>
          <Text style={[styles.splashTitle, { color: colors.text }]}>FitKoç</Text>
          <Text style={styles.splashSubtitle}>Senin hedefin, senin dönüşümün.</Text>
        </Animated.View>
      </View>
    );
  }

  // Yönlendirme (Routing) Mantığı
  if (!isAuth) {
    return <Redirect href="/auth" />;
  }

  if (!profile) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#050505', // Koyu, premium arka plan
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  splashTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 8,
  },
  splashSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B35',
    letterSpacing: 0.5,
  }
});
