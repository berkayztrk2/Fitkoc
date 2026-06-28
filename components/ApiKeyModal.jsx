import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { X, KeyRound, Save, Trash2, ExternalLink } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { API_KEY_STORAGE } from '../lib/claude';

export default function ApiKeyModal({ visible, onClose }) {
  const { colors } = useTheme();
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (visible) {
      (async () => {
        const stored = await AsyncStorage.getItem(API_KEY_STORAGE);
        setKey(stored || '');
        setSaved(!!stored);
      })();
    }
  }, [visible]);

  const handleSave = async () => {
    const trimmed = key.trim();
    if (!trimmed) {
      Alert.alert('Hata', 'Lütfen geçerli bir API anahtarı gir.');
      return;
    }
    await AsyncStorage.setItem(API_KEY_STORAGE, trimmed);
    setSaved(true);
    Alert.alert('Kaydedildi', 'API anahtarın kaydedildi. Artık AI özelliklerini kullanabilirsin.');
    onClose();
  };

  const handleClear = async () => {
    await AsyncStorage.removeItem(API_KEY_STORAGE);
    setKey('');
    setSaved(false);
    Alert.alert('Silindi', 'Kayıtlı API anahtarı silindi.');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[styles.iconBg, { backgroundColor: 'rgba(255,107,53,0.1)' }]}>
                <KeyRound size={20} color="#FF6B35" />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Gemini API Anahtarı</Text>
            </View>
            <Pressable onPress={onClose} style={{ padding: 4 }}>
              <X size={24} color={colors.textSub} />
            </Pressable>
          </View>

          <Text style={[styles.desc, { color: colors.textSub }]}>
            Öğün tarama, AI koç ve tarif oluşturucu için Google Gemini API anahtarına ihtiyaç var.
            Anahtar yalnızca cihazında saklanır.
          </Text>

          <Pressable
            style={styles.linkRow}
            onPress={() => Linking.openURL('https://aistudio.google.com/app/apikey')}
          >
            <ExternalLink size={16} color="#00AAFF" />
            <Text style={styles.linkText}>Ücretsiz anahtar al (aistudio.google.com)</Text>
          </Pressable>

          <View style={[styles.inputBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="AIza..."
              placeholderTextColor={colors.textSub}
              value={key}
              onChangeText={setKey}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
          </View>

          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Save size={18} color="#FFF" />
            <Text style={styles.saveBtnText}>Kaydet</Text>
          </Pressable>

          {saved && (
            <Pressable style={styles.clearBtn} onPress={handleClear}>
              <Trash2 size={16} color="#FF3B3B" />
              <Text style={styles.clearBtnText}>Anahtarı Sil</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  content: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, borderWidth: 1, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  iconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  desc: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  linkText: { color: '#00AAFF', fontSize: 14, fontWeight: '600' },
  inputBox: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, height: 56, justifyContent: 'center', marginBottom: 16 },
  input: { fontSize: 16, fontWeight: '500' },
  saveBtn: { backgroundColor: '#FF6B35', height: 54, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  clearBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 },
  clearBtnText: { color: '#FF3B3B', fontSize: 15, fontWeight: '700' },
});
