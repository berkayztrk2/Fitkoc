import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Switch, Alert, Platform } from 'react-native';
import { Bell, X, Droplets, Target, Utensils } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { requestNotificationPermissions, scheduleDailyReminder, cancelReminder, sendTestNotification } from '../lib/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RemindersModal({ visible, onClose }) {
  const { colors, isDark } = useTheme();
  const [reminders, setReminders] = useState({
    water: false,
    workout: false,
    meals: false,
  });

  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('fitkoc-reminders');
      if (saved) setReminders(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  };

  const saveSettings = async (newSettings) => {
    setReminders(newSettings);
    try {
      await AsyncStorage.setItem('fitkoc-reminders', JSON.stringify(newSettings));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (type, value) => {
    const hasPerm = await requestNotificationPermissions();
    if (!hasPerm && value) {
      Alert.alert("İzin Gerekli", "Bildirimleri açmak için ayarlardan izin vermelisiniz.");
      return;
    }

    const newSettings = { ...reminders, [type]: value };
    await saveSettings(newSettings);

    if (type === 'water') {
      if (value) {
        // Örnek: Her gün 12:00, 15:00, 18:00 (Şimdilik 14:00 olarak tekil)
        await scheduleDailyReminder('water_1', '💧 Su Vakti!', 'Vücudunu susuz bırakma, bir bardak su iç.', 14, 0);
        await scheduleDailyReminder('water_2', '💧 Su Vakti!', 'Hedeflerine ulaşmak için su tüketimi şart.', 18, 0);
      } else {
        await cancelReminder('water_1');
        await cancelReminder('water_2');
      }
    }

    if (type === 'workout') {
      if (value) {
        await scheduleDailyReminder('workout_1', '🏋️‍♂️ Antrenman Vakti', 'Günün antrenmanını tamamla ve kahramanını geliştir!', 19, 0);
      } else {
        await cancelReminder('workout_1');
      }
    }

    if (type === 'meals') {
      if (value) {
        await scheduleDailyReminder('meal_1', '🍳 Kahvaltı Zamanı', 'Güne enerjik başlamak için sağlam bir kahvaltı yap.', 9, 0);
        await scheduleDailyReminder('meal_2', '🍱 Öğle Yemeği', 'Makrolarına uygun öğle yemeğini kaçırma.', 13, 0);
        await scheduleDailyReminder('meal_3', '🍽️ Akşam Yemeği', 'Günün son öğününü planla ve dinlenmeye geç.', 19, 30);
      } else {
        await cancelReminder('meal_1');
        await cancelReminder('meal_2');
        await cancelReminder('meal_3');
      }
    }
  };

  const handleTest = async () => {
    const success = await sendTestNotification();
    if (success) {
      Alert.alert("Başarılı", "5 saniye içinde test bildirimi gelecek. Lütfen uygulamayı arka plana alın veya ekranı kilitleyin.");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Bell color={colors.text} size={24} />
              <Text style={[styles.title, { color: colors.text }]}>Hatırlatmalar</Text>
            </View>
            <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.iconBg }]}>
              <X size={20} color={colors.text} />
            </Pressable>
          </View>

          <Text style={[styles.subtitle, { color: colors.textSub }]}>
            Uygulama kapalıyken bile belirlediğiniz saatlerde bildirim alarak hedeflerinize sadık kalın.
          </Text>

          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(0,170,255,0.1)' }]}>
                <Droplets size={20} color="#00AAFF" />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Su Hatırlatıcısı</Text>
                <Text style={[styles.rowDesc, { color: colors.textSub }]}>Her gün 14:00 ve 18:00'da</Text>
              </View>
            </View>
            <Switch
              value={reminders.water}
              onValueChange={(val) => handleToggle('water', val)}
              trackColor={{ false: colors.border, true: '#00AAFF' }}
            />
          </View>

          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255,107,53,0.1)' }]}>
                <Target size={20} color="#FF6B35" />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Antrenman</Text>
                <Text style={[styles.rowDesc, { color: colors.textSub }]}>Her gün 19:00'da</Text>
              </View>
            </View>
            <Switch
              value={reminders.workout}
              onValueChange={(val) => handleToggle('workout', val)}
              trackColor={{ false: colors.border, true: '#FF6B35' }}
            />
          </View>

          <View style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: 0 }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(168,85,247,0.1)' }]}>
                <Utensils size={20} color="#A855F7" />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Öğünler</Text>
                <Text style={[styles.rowDesc, { color: colors.textSub }]}>09:00, 13:00, 19:30</Text>
              </View>
            </View>
            <Switch
              value={reminders.meals}
              onValueChange={(val) => handleToggle('meals', val)}
              trackColor={{ false: colors.border, true: '#A855F7' }}
            />
          </View>

          <Pressable style={styles.testBtn} onPress={handleTest}>
            <Text style={styles.testBtnText}>Test Bildirimi Gönder (5 sn)</Text>
          </Pressable>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  rowDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  testBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  testBtnText: {
    color: '#00AAFF',
    fontSize: 15,
    fontWeight: '700',
  }
});
