import React from 'react';
import { Platform, View, Text, StyleSheet, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';

/**
 * Cross‑platform picker that works on iOS/Android (native wheel picker) and on the web
 * using a styled HTML <select>. Props are compatible with the previous WheelPicker.
 */
export default function CrossPlatformPicker({
  items = [],
  selectedValue,
  onValueChange,
  suffix = '',
  style,
}) {
  // Render native picker for mobile platforms
  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.nativeContainer, style]}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
        >
          {items.map((item) => (
            <Picker.Item
              key={item.toString()}
              label={`${item}${suffix}`}
              value={item}
            />
          ))}
        </Picker>
      </View>
    );
  }

  // Web fallback – styled <select>
  return (
    <View style={[styles.webContainer, style]}>
      <select
        value={selectedValue}
        onChange={(e) => onValueChange(e.target.value)}
        style={styles.select}
      >
        {items.map((item) => (
          <option key={item.toString()} value={item}>
            {item}{suffix}
          </option>
        ))}
      </select>
    </View>
  );
}

const styles = StyleSheet.create({
  nativeContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    color: '#111',
  },
  webContainer: {
    background: 'linear-gradient(135deg, #FFEDE6, #FFF2E9)',
    borderRadius: 12,
    border: '1px solid #FF6B35',
    padding: 4,
  },
  select: {
    width: '100%',
    padding: '12px',
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    appearance: 'none',
  },
});
