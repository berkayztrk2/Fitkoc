import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

// Her birim arasındaki piksel mesafesi — daha geniş = daha kolay kaydırma
const NOTCH_W = 14;

// Sabit renk paletleri (light / dark arka plan uyumu)
const PALETTE = {
  light: {
    value: '#111111',
    suffix: '#888888',
    majorTick: '#FF6B35',
    midTick: '#555555',
    minorTick: '#D0D0D5',
    label: '#999999',
    btnBg: '#F0F0F3',
    fadeBg: 'rgba(255,255,255,0.92)',
  },
  dark: {
    value: '#FFFFFF',
    suffix: '#AAAAAA',
    majorTick: '#FF6B35',
    midTick: '#888888',
    minorTick: '#3A3A3C',
    label: '#777777',
    btnBg: '#2C2C2E',
    fadeBg: 'rgba(5,5,5,0.92)',
  },
};

export default function RulerPicker({
  min = 120,
  max = 220,
  value = 175,
  onChange,
  suffix = '',
  step = 1,
  variant = 'light',
}) {
  const C = PALETTE[variant] || PALETTE.light;

  const scrollRef = useRef(null);
  const [containerW, setContainerW] = useState(0);
  const [contentReady, setContentReady] = useState(false);

  // Refs — render'a bağlı olmayan mutable state
  const liveValue = useRef(value);
  const isProgrammatic = useRef(false);
  const didInitialScroll = useRef(false);
  const endTimer = useRef(null);

  // ————————— Yardımcı fonksiyonlar —————————

  const valToX = useCallback(
    (v) => ((v - min) / step) * NOTCH_W,
    [min, step],
  );

  const xToVal = useCallback(
    (x) => {
      let v = Math.round(x / NOTCH_W) * step + min;
      return Math.max(min, Math.min(max, v));
    },
    [min, max, step],
  );

  // ————————— İlk yüklemede doğru pozisyona kaydır —————————

  useEffect(() => {
    if (containerW > 0 && contentReady && !didInitialScroll.current) {
      didInitialScroll.current = true;
      const x = valToX(value);

      // İlk çerçevede konumlan, ardından bir animasyon frame sonra tekrar dene
      // (Web'de ScrollView içerik boyutu bazen geç hesaplanır)
      const doScroll = () => {
        scrollRef.current?.scrollTo({ x, animated: false });
      };
      doScroll();
      requestAnimationFrame(doScroll);
      // 3. deneme — çok yavaş cihazlar için güvenlik ağı
      setTimeout(doScroll, 200);
    }
  }, [containerW, contentReady, value, valToX]);

  // ————————— +/- butonlarıyla değer değiştiğinde scroll pozisyonunu güncelle —————————

  useEffect(() => {
    if (didInitialScroll.current && value !== liveValue.current) {
      liveValue.current = value;
      isProgrammatic.current = true;
      scrollRef.current?.scrollTo({ x: valToX(value), animated: true });
      // Animasyon bittikten sonra flag'i resetle
      setTimeout(() => {
        isProgrammatic.current = false;
      }, 400);
    }
  }, [value, valToX]);

  // ————————— Scroll olay yöneticisi —————————

  const handleScroll = useCallback(
    (e) => {
      // Programatik kaydırmalarda geri bildirim döngüsünü engelle
      if (isProgrammatic.current) return;

      const offsetX = e.nativeEvent.contentOffset.x;
      const newVal = xToVal(offsetX);

      if (newVal !== liveValue.current) {
        liveValue.current = newVal;
        onChange(newVal);
      }

      // ——— Debounced scroll-end algılama ———
      // Web'de onMomentumScrollEnd güvenilmez, bu yüzden timer kullanıyoruz
      if (endTimer.current) clearTimeout(endTimer.current);
      endTimer.current = setTimeout(() => {
        // Scroll durduğunda en yakın çizgiye sabitle
        const snapX = valToX(newVal);
        if (Math.abs(offsetX - snapX) > 1) {
          isProgrammatic.current = true;
          scrollRef.current?.scrollTo({ x: snapX, animated: true });
          setTimeout(() => {
            isProgrammatic.current = false;
          }, 300);
        }
      }, 100);
    },
    [xToVal, valToX, onChange],
  );

  // ————————— +/- butonları —————————

  const adjust = useCallback(
    (delta) => {
      const nv = Math.max(min, Math.min(max, value + delta));
      if (nv !== value) onChange(nv);
    },
    [min, max, value, onChange],
  );

  // ————————— Cleanup —————————

  useEffect(() => {
    return () => {
      if (endTimer.current) clearTimeout(endTimer.current);
    };
  }, []);

  // ————————— Tick çizgilerini oluştur —————————

  const ticks = [];
  for (let i = min; i <= max; i += step) {
    ticks.push(i);
  }

  const sidePad = containerW / 2;

  return (
    <View
      style={styles.root}
      onLayout={(e) => setContainerW(e.nativeEvent.layout.width)}
    >
      {/* ———— DEĞER GÖSTERGESİ + BUTONLAR ———— */}
      <View style={styles.valRow}>
        <Pressable
          onPress={() => adjust(-step)}
          style={[styles.adjBtn, { backgroundColor: C.btnBg }]}
          hitSlop={10}
        >
          <Minus size={22} color="#FF6B35" />
        </Pressable>

        <View style={styles.valCenter}>
          <Text style={[styles.valNum, { color: C.value }]}>{value}</Text>
          {suffix ? (
            <Text style={[styles.valSuffix, { color: C.suffix }]}>
              {suffix}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={() => adjust(step)}
          style={[styles.adjBtn, { backgroundColor: C.btnBg }]}
          hitSlop={10}
        >
          <Plus size={22} color="#FF6B35" />
        </Pressable>
      </View>

      {/* ———— CETVEL ———— */}
      <View style={styles.rulerBox}>
        {/* Ortadaki sabit gösterge (üçgen + çizgi) */}
        <View style={styles.indicatorWrap} pointerEvents="none">
          <View style={styles.indicatorTriangle} />
          <View style={styles.indicatorLine} />
        </View>

        {containerW > 0 && (
          <ScrollView
            ref={scrollRef}
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            decelerationRate="fast"
            onScroll={handleScroll}
            onContentSizeChange={() => {
              if (!contentReady) setContentReady(true);
            }}
            contentContainerStyle={{
              paddingLeft: sidePad,
              paddingRight: sidePad,
            }}
          >
            <View style={styles.ticksRow}>
              {ticks.map((v) => {
                const isMajor = v % 10 === 0;
                const isMid = v % 5 === 0 && !isMajor;

                return (
                  <View key={v} style={[styles.tickBox, { width: NOTCH_W }]}>
                    <View
                      style={[
                        styles.tick,
                        {
                          height: isMajor ? 38 : isMid ? 24 : 14,
                          width: isMajor ? 2.5 : isMid ? 2 : 1.5,
                          backgroundColor: isMajor
                            ? C.majorTick
                            : isMid
                              ? C.midTick
                              : C.minorTick,
                        },
                      ]}
                    />
                    {isMajor && (
                      <Text style={[styles.tickLabel, { color: C.label }]}>
                        {v}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}

        {/* Sol / sağ kenar solma efektleri */}
        <View
          style={[styles.fadeLeft, { backgroundColor: C.fadeBg }]}
          pointerEvents="none"
        />
        <View
          style={[styles.fadeRight, { backgroundColor: C.fadeBg }]}
          pointerEvents="none"
        />
      </View>
    </View>
  );
}

// ————————— STİLLER —————————

const styles = StyleSheet.create({
  root: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
  },

  // Değer göstergesi satırı
  valRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 20,
  },
  valCenter: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    minWidth: 130,
  },
  valNum: {
    fontSize: 52,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  valSuffix: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 6,
  },

  // +/- butonları
  adjBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  // Cetvel dış kutusu
  rulerBox: {
    height: 82,
    width: '100%',
    position: 'relative',
  },

  // Ortadaki gösterge (üçgen + dikey çizgi)
  indicatorWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  indicatorTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FF6B35',
  },
  indicatorLine: {
    width: 3,
    height: 46,
    backgroundColor: '#FF6B35',
    borderRadius: 1.5,
  },

  // Tick çizgileri satırı
  ticksRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: 72,
    paddingTop: 6,
  },
  tickBox: {
    alignItems: 'center',
  },
  tick: {
    borderRadius: 1,
  },
  tickLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },

  // Sol / sağ kenar solma efektleri
  fadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 50,
    zIndex: 10,
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 50,
    zIndex: 10,
  },
});
