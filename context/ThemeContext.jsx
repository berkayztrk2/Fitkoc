import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const THEME_COLORS = {
  light: {
    background: '#F7F7F9',
    card: '#FFFFFF',
    text: '#111111',
    textSub: '#888888',
    border: '#E5E5EA',
    primary: '#FF6B35',
    secondary: '#00AAFF',
    iconBg: '#F0F0F3',
  },
  dark: {
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    textSub: '#A1A1A6',
    border: '#38383A',
    primary: '#FF6B35',
    secondary: '#00AAFF',
    iconBg: '#2C2C2E',
  }
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'system', 'light', 'dark'
  
  useEffect(() => {
    (async () => {
      try {
        const savedMode = await AsyncStorage.getItem('fitkoc-theme');
        if (savedMode) {
          setThemeMode(savedMode);
        }
      } catch (e) {
        console.log('Failed to load theme preference', e);
      }
    })();
  }, []);

  const changeTheme = async (mode) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem('fitkoc-theme', mode);
    } catch (e) {
      console.log('Failed to save theme preference', e);
    }
  };

  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, colors, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
