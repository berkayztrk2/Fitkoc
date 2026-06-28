import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Save, Camera, Flame, Scale, TrendingUp, Dumbbell, Heart } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { GOALS, ACTIVITY, GOAL_UI } from '../lib/calc';
import SimpleSliderPicker from './SimpleSliderPicker';

const EDIT_WEIGHT_MIN = 40;
const EDIT_WEIGHT_MAX = 190;
const EDIT_HEIGHT_MIN = 120;
const EDIT_HEIGHT_MAX = 220;
const EDIT_AGE_MIN = 14;
const EDIT_AGE_MAX = 84;

// İkonlar yerelde; renkler tek kaynaktan (GOAL_UI) gelir.
const GOAL_ICONS = { lose: Flame, maintain: Scale, gain: TrendingUp, muscle: Dumbbell, healthy: Heart };
const GOAL_THEMES = Object.fromEntries(
  Object.keys(GOAL_ICONS).map(k => [k, { icon: GOAL_ICONS[k], color: GOAL_UI[k]?.color || '#FF6B35', bg: GOAL_UI[k]?.soft || 'rgba(255,107,53,0.1)' }])
);

export default function EditProfileModal({ visible, onClose }) {
  const { profile, updateProfile } = useUser();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [form, setForm] = useState(profile || {});

  useEffect(() => {
    if (visible && profile) {
      setForm(profile);
    }
  }, [visible, profile]);

  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("İzin Gerekli", "Fotoğraf seçmek için galeri izni vermelisin.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setVal('avatarUri', result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!form.weightKg || !form.heightCm || !form.age) {
      Alert.alert('Hata', 'Lütfen boy, kilo ve yaş alanlarını doldur.');
      return;
    }
    
    // Verileri numaraya çevir ve kaydet
    const finalForm = {
      ...form,
      weightKg: Number(form.weightKg),
      heightCm: Number(form.heightCm),
      age: Number(form.age),
      goalLabel: GOALS[form.goal]?.label || 'Bilinmiyor'
    };

    updateProfile(finalForm);
    onClose();
  };

  const setVal = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (!profile) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Kişisel Bilgiler</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          <View style={styles.avatarSection}>
            <Pressable style={styles.avatarContainer} onPress={handlePickImage}>
              {form.avatarUri ? (
                <Image source={{ uri: form.avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{profile.gender === 'female' ? 'K' : 'E'}</Text>
                </View>
              )}
              <View style={styles.cameraIconContainer}>
                <Camera size={16} color="#FFF" />
              </View>
            </Pressable>
            <Text style={styles.avatarHint}>Fotoğrafı Değiştir</Text>
          </View>

          <Text style={styles.label}>İsim</Text>
          <View style={[styles.input, { marginBottom: 16, paddingVertical: 0, justifyContent: 'center' }]}>
            <TextInput
              style={{ color: colors.text, fontSize: 18, fontWeight: '600', height: 56 }}
              placeholder="Adın (opsiyonel)"
              placeholderTextColor={colors.textSub}
              value={form.name || ''}
              onChangeText={val => setVal('name', val)}
            />
          </View>

          <Text style={styles.label}>Kilo (kg)</Text>
          <SimpleSliderPicker
            min={EDIT_WEIGHT_MIN}
            max={EDIT_WEIGHT_MAX}
            selectedValue={Number(form.weightKg || 70)}
            onValueChange={val => setVal('weightKg', val)}
            suffix="kg"
            textColor={colors.text}
          />

          <Text style={styles.label}>Boy (cm)</Text>
          <SimpleSliderPicker
            min={EDIT_HEIGHT_MIN}
            max={EDIT_HEIGHT_MAX}
            selectedValue={Number(form.heightCm || 170)}
            onValueChange={val => setVal('heightCm', val)}
            suffix="cm"
            textColor={colors.text}
          />

          <Text style={styles.label}>Yaş</Text>
          <SimpleSliderPicker
            min={EDIT_AGE_MIN}
            max={EDIT_AGE_MAX}
            selectedValue={Number(form.age || 25)}
            onValueChange={val => setVal('age', val)}
            suffix="yaş"
            textColor={colors.text}
          />

          <Text style={[styles.label, {marginTop: 16}]}>Günlük Aktivite Seviyen</Text>
          {Object.entries(ACTIVITY).map(([key, val]) => (
            <Pressable 
              key={key} 
              style={[styles.optionCard, form.activity === key && styles.optionCardSelected]} 
              onPress={() => setVal('activity', key)}
            >
              <Text style={[styles.optionTitle, form.activity === key && styles.optionTitleSelected]}>{val.label}</Text>
              <Text style={styles.optionDesc}>{val.desc}</Text>
            </Pressable>
          ))}

          <Text style={[styles.label, {marginTop: 24}]}>Ana Hedefin</Text>
          {Object.entries(GOALS).map(([key, val]) => {
            const theme = GOAL_THEMES[key] || { icon: Flame, color: '#FF6B35', bg: 'rgba(255,107,53,0.1)' };
            const Icon = theme.icon;
            const active = form.goal === key;
            
            return (
              <Pressable 
                key={key} 
                style={[
                  styles.optionCard, 
                  { flexDirection: 'row', alignItems: 'center', padding: 16 },
                  active && { borderColor: theme.color, backgroundColor: theme.bg }
                ]} 
                onPress={() => setVal('goal', key)}
              >
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: active ? theme.color : colors.iconBg, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                  <Icon size={20} color={active ? '#FFF' : colors.textSub} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionTitle, active && { color: theme.color }]}>{val.label}</Text>
                  <Text style={styles.optionDesc}>{val.desc}</Text>
                </View>
                <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: active ? theme.color : colors.border, justifyContent: 'center', alignItems: 'center' }}>
                  {active && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: theme.color }} />}
                </View>
              </Pressable>
            );
          })}

        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Save size={20} color="#FFF" />
            <Text style={styles.saveBtnText}>Profili Güncelle</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  closeBtn: { padding: 8, backgroundColor: colors.iconBg, borderRadius: 20 },
  scroll: { padding: 20, paddingBottom: 100 },
  label: { fontSize: 14, fontWeight: '700', color: colors.textSub, marginBottom: 8, marginLeft: 4 },
  fieldRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  fieldHalf: { flex: 1 },
  input: { backgroundColor: colors.card, color: colors.text, fontSize: 18, fontWeight: '600', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  optionCard: { backgroundColor: colors.card, padding: 16, borderRadius: 16, borderWidth: 2, borderColor: colors.border, marginBottom: 12 },
  optionCardSelected: { borderColor: '#FF6B35', backgroundColor: 'rgba(255,107,53,0.1)' },
  optionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  optionTitleSelected: { color: '#FF6B35' },
  optionDesc: { fontSize: 13, color: colors.textSub },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
  saveBtn: { backgroundColor: '#FF6B35', flexDirection: 'row', gap: 10, padding: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },

  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FF6B35', position: 'relative' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 50 },
  avatarPlaceholder: { width: '100%', height: '100%', borderRadius: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.iconBg },
  avatarInitial: { fontSize: 36, fontWeight: '800', color: '#FF6B35' },
  cameraIconContainer: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FF6B35', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.background },
  avatarHint: { color: '#FF6B35', fontSize: 14, fontWeight: '700', marginTop: 12 }
});
