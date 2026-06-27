import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

/**
 * A minimalist, real-world sliding picker.
 * Uses the native slider component for 100% stability across Web, iOS, and Android.
 */
export default function SimpleSliderPicker({
  min = 0,
  max = 100,
  step = 1,
  selectedValue,
  onValueChange,
  suffix = '',
  textColor = '#111', // Defaults to light mode text, overridden for dark mode
}) {
  // We keep a local state for smooth sliding updates before committing to the parent
  const [localValue, setLocalValue] = useState(selectedValue);

  const handleValueChange = (val) => {
    setLocalValue(val);
  };

  const handleSlidingComplete = (val) => {
    if (onValueChange) {
      onValueChange(val);
    }
  };

  return (
    <View style={styles.container}>
      {/* Huge, clean value display */}
      <View style={styles.valueContainer}>
        <Text style={[styles.valueText, { color: textColor }]}>
          {localValue}
        </Text>
        {suffix ? (
          <Text style={[styles.suffixText, { color: textColor }]}>
            {suffix}
          </Text>
        ) : null}
      </View>

      {/* Minimalist Native Slider */}
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={localValue}
        onValueChange={handleValueChange}
        onSlidingComplete={handleSlidingComplete}
        minimumTrackTintColor="#FF6B35"
        maximumTrackTintColor="#E5E5EA"
        thumbTintColor="#FF6B35"
      />
      
      {/* Min / Max Labels for context */}
      <View style={styles.labelsRow}>
        <Text style={styles.edgeLabel}>{min}</Text>
        <Text style={styles.edgeLabel}>{max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 24,
  },
  valueText: {
    fontSize: 56,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  suffixText: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 4,
    opacity: 0.6,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
    marginTop: -8,
  },
  edgeLabel: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
});
