import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';

const ITEM_H = 56;
const VISIBLE = 5;
const HALF = Math.floor(VISIBLE / 2); // 2
const CONTAINER_H = ITEM_H * VISIBLE; // 280

export default function WheelPicker({
  items,
  selectedValue,
  onValueChange,
  suffix = '',
}) {
  const scrollRef = useRef(null);
  const liveIdx = useRef(0);
  const isProgrammatic = useRef(false);
  const didInit = useRef(false);
  const [contentReady, setContentReady] = useState(false);
  const endTimer = useRef(null);

  // Seçili değerin index'ini bul
  const selectedIdx = Math.max(0, items.indexOf(selectedValue));

  // ————— Yardımcı: index → scroll offset —————
  const idxToY = useCallback((i) => i * ITEM_H, []);

  // ————— Yardımcı: scroll offset → index —————
  const yToIdx = useCallback(
    (y) => {
      let i = Math.round(y / ITEM_H);
      return Math.max(0, Math.min(items.length - 1, i));
    },
    [items.length],
  );

  // ————— İlk yüklemede doğru pozisyona kaydır —————
  useEffect(() => {
    if (contentReady && !didInit.current) {
      didInit.current = true;
      liveIdx.current = selectedIdx;
      const y = idxToY(selectedIdx);
      const doScroll = () => {
        scrollRef.current?.scrollTo({ y, animated: false });
      };
      doScroll();
      requestAnimationFrame(doScroll);
      setTimeout(doScroll, 150);
    }
  }, [contentReady, selectedIdx, idxToY]);

  // ————— Dışarıdan değer değiştiğinde scroll güncelle —————
  useEffect(() => {
    if (didInit.current && selectedIdx !== liveIdx.current) {
      liveIdx.current = selectedIdx;
      isProgrammatic.current = true;
      scrollRef.current?.scrollTo({ y: idxToY(selectedIdx), animated: true });
      setTimeout(() => {
        isProgrammatic.current = false;
      }, 400);
    }
  }, [selectedIdx, idxToY]);

  // ————— Scroll handler & momentum snap —————
  const handleScroll = useCallback(
    (e) => {
      if (isProgrammatic.current) return;
      const offsetY = e.nativeEvent.contentOffset.y;
      const newIdx = yToIdx(offsetY);
      if (newIdx !== liveIdx.current) {
        liveIdx.current = newIdx;
        onValueChange(items[newIdx]);
      }
      // Debounced snap for web (same as before)
      if (endTimer.current) clearTimeout(endTimer.current);
      endTimer.current = setTimeout(() => {
        const snapY = idxToY(newIdx);
        if (Math.abs(offsetY - snapY) > 2) {
          isProgrammatic.current = true;
          scrollRef.current?.scrollTo({ y: snapY, animated: true });
          setTimeout(() => (isProgrammatic.current = false), 300);
        }
      }, 80);
    },
    [yToIdx, idxToY, items, onValueChange],
  );

  // Momentum scroll end handler for native platforms – provides a reliable snap
  const handleMomentumScrollEnd = useCallback(
    (e) => {
      const offsetY = e.nativeEvent.contentOffset.y;
      const snapY = idxToY(yToIdx(offsetY));
      if (Math.abs(offsetY - snapY) > 2) {
        isProgrammatic.current = true;
        scrollRef.current?.scrollTo({ y: snapY, animated: true });
        setTimeout(() => (isProgrammatic.current = false), 300);
      }
    },
    [idxToY, yToIdx],
  );

  // ————— Tıklama ile seçim —————
  const handlePress = useCallback(
    (index) => {
      liveIdx.current = index;
      isProgrammatic.current = true;
      scrollRef.current?.scrollTo({ y: idxToY(index), animated: true });
      onValueChange(items[index]);
      setTimeout(() => {
        isProgrammatic.current = false;
      }, 400);
    },
    [idxToY, items, onValueChange],
  );

  // ————— Cleanup —————
  useEffect(() => {
    return () => {
      if (endTimer.current) clearTimeout(endTimer.current);
    };
  }, []);

  // Üst ve alt boşluk — seçili öğenin tam ortaya gelmesini sağlar
  const padH = HALF * ITEM_H;

  return (
    <View style={styles.container}>
      {/* Seçim çubuğu — ortadaki vurgulu bar */}
      <View style={styles.selectionBar} pointerEvents="none" />

      {/* Üst soluk bölge */}
      <View style={styles.fadeTop} pointerEvents="none" />

      {/* Alt soluk bölge */}
      <View style={styles.fadeBottom} pointerEvents="none" />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        bounces={false}
        onScroll={handleScroll}
        onContentSizeChange={() => {
          if (!contentReady) setContentReady(true);
        }}
        contentContainerStyle={{
          paddingTop: padH,
          paddingBottom: padH,
        }}
      >
        {items.map((item, index) => {
          const isSelected = item === selectedValue;

          return (
            <Pressable
              key={item.toString()}
              onPress={() => handlePress(index)}
              style={styles.itemWrap}
            >
              <View style={styles.itemContent}>
                <Text
                  style={[
                    styles.itemText,
                    isSelected && styles.itemTextSelected,
                  ]}
                >
                  {item}
                </Text>
                {suffix && isSelected ? (
                  <Text style={styles.suffixText}>{suffix}</Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: CONTAINER_H,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
  },

  // Ortadaki seçim çubuğu
  selectionBar: {
    position: 'absolute',
    top: HALF * ITEM_H,
    left: '10%',
    right: '10%',
    height: ITEM_H,
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 107, 53, 0.25)',
    zIndex: 1,
  },

  // Üst solma efekti
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_H * 1.8,
    zIndex: 2,
    // Beyaz'dan şeffafa — onboarding white bg için
    backgroundColor: 'transparent',
    // Çoklu platform uyumluluğu: opak overlay yerine web linear-gradient
    ...Platform.select({
      web: {
        backgroundImage:
          'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)',
      },
      default: {
        backgroundColor: 'rgba(255,255,255,0.65)',
      },
    }),
  },

  // Alt solma efekti
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_H * 1.8,
    zIndex: 2,
    ...Platform.select({
      web: {
        backgroundImage:
          'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)',
      },
      default: {
        backgroundColor: 'rgba(255,255,255,0.65)',
      },
    }),
  },

  // Her öğe satırı
  itemWrap: {
    height: ITEM_H,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#AAAAAA',
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  itemTextSelected: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FF6B35',
  },
  suffixText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B35',
    marginLeft: 6,
    opacity: 0.8,
  },
});
