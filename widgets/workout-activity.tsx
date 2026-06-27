import React from 'react';
import { Text, VStack, HStack } from '@expo/ui/swift-ui';
import { foregroundStyle, font, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity } from 'expo-widgets';

export default createLiveActivity('WorkoutActivity', (props) => {
  'widget';
  const { title = 'Antrenman Aktif', startTimestamp } = props;
  const date = startTimestamp ? new Date(startTimestamp) : new Date();

  return {
    banner: (
      <VStack style={[padding(16)]}>
        <Text style={[foregroundStyle('white'), font('headline')]}>{title}</Text>
        <Text date={date} dateStyle="timer" style={[foregroundStyle('white'), font('subheadline')]} />
      </VStack>
    ),
    compactLeading: (
      <VStack style={[padding(4)]}>
        <Text style={[foregroundStyle('#4DA1FF'), font('caption')]}>FitKoç</Text>
      </VStack>
    ),
    compactTrailing: (
      <VStack style={[padding(4)]}>
        <Text date={date} dateStyle="timer" style={[foregroundStyle('#FF4D4D'), font('caption')]} />
      </VStack>
    ),
    minimal: (
      <VStack style={[padding(4)]}>
        <Text>🔥</Text>
      </VStack>
    ),
    expandedLeading: (
      <VStack style={[padding(8)]}>
        <Text style={[foregroundStyle('white'), font('headline')]}>{title}</Text>
      </VStack>
    ),
    expandedTrailing: (
      <VStack style={[padding(8)]}>
        <Text date={date} dateStyle="timer" style={[foregroundStyle('#FF4D4D'), font('headline')]} />
      </VStack>
    ),
    expandedBottom: (
      <VStack style={[padding(8)]}>
        <Text style={[foregroundStyle('gray'), font('caption')]}>Uygulamaya dönmek için dokunun</Text>
      </VStack>
    ),
  };
});
