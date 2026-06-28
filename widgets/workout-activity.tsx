import React from 'react';
import { Text, VStack, HStack } from '@expo/ui/swift-ui';
import { foregroundStyle, font, padding, frame } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity } from 'expo-widgets';

export default createLiveActivity('WorkoutActivity', (props) => {
  'widget';
  const { title = 'Antrenman Aktif 💪', startTimestamp, exerciseName = 'Egzersiz' } = props;
  const date = startTimestamp ? new Date(startTimestamp) : new Date();

  return {
    // ── Lock Screen Banner ──
    banner: (
      <VStack style={[padding(16)]}>
        <HStack>
          <Text style={[foregroundStyle('#FF8C00'), font('headline')]}>🔥 FitKoç</Text>
          <Text style={[foregroundStyle('#FF6B00'), font('headline')]}> | </Text>
          <Text style={[foregroundStyle('white'), font('headline')]}>{title}</Text>
        </HStack>
        <HStack>
          <Text style={[foregroundStyle('#FFB366'), font('subheadline')]}>⏱ Süre: </Text>
          <Text date={date} dateStyle="timer" style={[foregroundStyle('#FF8C00'), font('title2')]} />
        </HStack>
        <HStack>
          <Text style={[foregroundStyle('#FFB366'), font('caption')]}>🏋️ {exerciseName}</Text>
        </HStack>
      </VStack>
    ),

    // ── Compact: Dynamic Island küçük hali ──
    compactLeading: (
      <HStack style={[padding(4)]}>
        <Text style={[foregroundStyle('#FF8C00'), font('caption2')]}>🔥</Text>
        <Text style={[foregroundStyle('#FF8C00'), font('caption2')]}> FitKoç</Text>
      </HStack>
    ),
    compactTrailing: (
      <HStack style={[padding(4)]}>
        <Text style={[foregroundStyle('#FFB366'), font('caption2')]}>⏱ </Text>
        <Text date={date} dateStyle="timer" style={[foregroundStyle('#FF8C00'), font('caption')]} />
      </HStack>
    ),

    // ── Minimal: Birden fazla Live Activity varsa ──
    minimal: (
      <VStack style={[padding(2)]}>
        <Text style={[foregroundStyle('#FF8C00'), font('caption2')]}>🔥</Text>
      </VStack>
    ),

    // ── Expanded: Dynamic Island'a uzun basınca ──
    expandedLeading: (
      <VStack style={[padding(8)]}>
        <Text style={[foregroundStyle('#FF8C00'), font('title3')]}>🔥</Text>
        <Text style={[foregroundStyle('#FF8C00'), font('headline')]}>FitKoç</Text>
      </VStack>
    ),
    expandedTrailing: (
      <VStack style={[padding(8)]}>
        <Text style={[foregroundStyle('#FFB366'), font('caption')]}>Süre</Text>
        <Text date={date} dateStyle="timer" style={[foregroundStyle('#FF8C00'), font('title2')]} />
      </VStack>
    ),
    expandedCenter: (
      <VStack style={[padding(4)]}>
        <Text style={[foregroundStyle('white'), font('headline')]}>{title}</Text>
        <Text style={[foregroundStyle('#FFB366'), font('subheadline')]}>🏋️ {exerciseName}</Text>
      </VStack>
    ),
    expandedBottom: (
      <VStack style={[padding(8)]}>
        <HStack>
          <Text style={[foregroundStyle('#FF8C00'), font('caption')]}>💪 Devam et, harika gidiyorsun!</Text>
        </HStack>
        <Text style={[foregroundStyle('#666666'), font('caption2')]}>Uygulamaya dönmek için dokun</Text>
      </VStack>
    ),
  };
});
