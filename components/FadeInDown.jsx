import React, { useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { useFocusEffect } from 'expo-router';

export default function FadeInDown({ children, index = 0, style, delay = 100 }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useFocusEffect(
    useCallback(() => {
      // Ekran her odaklandığında değerleri sıfırla
      fadeAnim.setValue(0);
      translateY.setValue(30);

      // Sıralı gecikmeli (stagger) animasyonu başlat
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay: index * delay,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          delay: index * delay,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        // Ekrandan çıkıldığında sıfırla ki tekrar girildiğinde temiz başlasın
        fadeAnim.setValue(0);
        translateY.setValue(30);
      };
    }, [index, delay])
  );

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
