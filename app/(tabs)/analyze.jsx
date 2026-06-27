import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, Image, ActivityIndicator, Alert, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { analyzeFoodPhoto } from '../../lib/claude';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { Camera as CameraIcon, Image as ImageIcon, X, Check, Scan, Info } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import FadeInDown from '../../components/FadeInDown';

export default function AnalyzeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { type } = useLocalSearchParams();
  const { addMeal } = useUser();
  const [selectedType, setSelectedType] = useState('Sabah');

  useEffect(() => {
    if (type) {
      setSelectedType(type);
    }
  }, [type]);
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [userNotes, setUserNotes] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  const cameraRef = useRef(null);

  if (!permission) return <View />;
  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("İzin Gerekli", "Fotoğraf seçmek için galeri izni vermelisin.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
      setResult(null);
      setUserNotes('');
    }
  };

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 });
        setImageUri(photo.uri);
        setImageBase64(photo.base64);
        setShowCamera(false);
        setResult(null);
        setUserNotes('');
      } catch (e) {
        console.error("Camera capture error:", e);
        Alert.alert("Hata", "Fotoğraf çekilemedi. Lütfen tekrar dene.");
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setIsAnalyzing(true);
    try {
      const data = await analyzeFoodPhoto(imageBase64, userNotes);
      setResult(data);
    } catch (err) {
      Alert.alert('Hata', err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (result && result.calories > 0) {
      addMeal({
        name: result.foods?.join(', ') || 'Yemek',
        calories: result.calories,
        protein: result.protein_g,
        carbs: result.carbs_g,
        fat: result.fat_g,
        type: selectedType,
      });
      // Clear state so it's ready for the next analysis
      setImageUri(null);
      setImageBase64(null);
      setResult(null);
      setUserNotes('');
      router.replace('/(tabs)');
    }
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>AI Öğün Tarayıcı</Text>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* IMAGE PREVIEW AREA */}
        <FadeInDown index={0} style={[styles.previewBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {showCamera && !permission?.granted ? (
            <View style={[styles.placeholderBox, { padding: 20 }]}>
              <Text style={[styles.placeholderText, { textAlign: 'center', marginBottom: 16 }]}>Kamera izni gerekli.</Text>
              <Pressable style={{ backgroundColor: '#FF6B35', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }} onPress={requestPermission}>
                <Text style={{ color: '#FFF', fontWeight: '700' }}>İzin Ver</Text>
              </Pressable>
              <Pressable style={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.1)', padding: 8, borderRadius: 20 }} onPress={() => setShowCamera(false)}>
                <X color={colors.text} size={20} />
              </Pressable>
            </View>
          ) : showCamera ? (
            <CameraView style={{ flex: 1 }} facing="back" ref={cameraRef}>
              <View style={{ flex: 1, justifyContent: 'flex-end', padding: 16, alignItems: 'center' }}>
                <Pressable 
                  style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' }} 
                  onPress={takePicture}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF' }} />
                </Pressable>
                <Pressable 
                  style={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 }} 
                  onPress={() => setShowCamera(false)}>
                  <X color="#FFF" size={20} />
                </Pressable>
              </View>
            </CameraView>
          ) : imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderBox}>
              <CameraIcon size={48} color="#E5E5EA" />
              <Text style={styles.placeholderText}>Tabağının fotoğrafını çek veya yükle</Text>
            </View>
          )}

          {/* ACTION BUTTONS ON TOP OF/BELOW PREVIEW */}
          {!imageUri && !showCamera && (
            <View style={styles.actionRow}>
              <Pressable style={[styles.actionBtn, { backgroundColor: colors.iconBg }]} onPress={() => setShowCamera(true)}>
                <CameraIcon size={20} color="#FF6B35" />
                <Text style={[styles.actionBtnText, { color: colors.text }]}>Kamera</Text>
              </Pressable>
              <Pressable style={[styles.actionBtn, { backgroundColor: colors.iconBg }]} onPress={pickImage}>
                <ImageIcon size={20} color="#FF6B35" />
                <Text style={[styles.actionBtnText, { color: colors.text }]}>Galeri</Text>
              </Pressable>
            </View>
          )}
        </FadeInDown>


        {!imageUri && (
          <FadeInDown index={1} style={{ marginTop: 24 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Nasıl Çalışır?</Text>
            
            <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.tipIcon, { backgroundColor: 'rgba(255,107,53,0.1)' }]}>
                <CameraIcon size={20} color="#FF6B35" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tipTitle, { color: colors.text }]}>1. Fotoğraf Çek</Text>
                <Text style={[styles.tipDesc, { color: colors.textSub }]}>Yediğin yemeğin veya içtiğin içeceğin fotoğrafını net şekilde çek veya galerinden seç.</Text>
              </View>
            </View>

            <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.tipIcon, { backgroundColor: 'rgba(0,170,255,0.1)' }]}>
                <Scan size={20} color="#00AAFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tipTitle, { color: colors.text }]}>2. AI Analizi</Text>
                <Text style={[styles.tipDesc, { color: colors.textSub }]}>Yapay zeka görseldeki besinleri tanır, porsiyonu tahmin eder ve makrolarını hesaplar.</Text>
              </View>
            </View>
            
            <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.tipIcon, { backgroundColor: 'rgba(255,215,0,0.1)' }]}>
                <Check size={20} color="#FFD700" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tipTitle, { color: colors.text }]}>3. Günlüğüne Ekle</Text>
                <Text style={[styles.tipDesc, { color: colors.textSub }]}>Tek tuşla günlük beslenme hedeflerine ekle ve kalori takibini kolayca yap.</Text>
              </View>
            </View>
          </FadeInDown>
        )}

        {imageUri && !result && (
          <View>

          <FadeInDown index={1} style={{ marginTop: 20 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Görünmeyen Detay Var Mı? (Opsiyonel)</Text>
            <TextInput
              style={[styles.notesInput, { backgroundColor: colors.iconBg, color: colors.text, borderColor: colors.border }]}
              placeholder="Örn: 2 kaşık şeker attım, bol yağlı..."
              placeholderTextColor={colors.textSub}
              value={userNotes}
              onChangeText={setUserNotes}
              multiline
            />
          </FadeInDown>

          <FadeInDown index={2} style={styles.analyzeActions}>
            <Pressable style={[styles.retakeBtn, { backgroundColor: colors.iconBg }]} onPress={() => setImageUri(null)}>
              <Text style={[styles.retakeBtnText, { color: colors.text }]}>Vazgeç</Text>
            </Pressable>
            <Pressable style={[styles.primaryBtn, isAnalyzing && { opacity: 0.7 }]} onPress={handleAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryBtnText}>✨ AI Analizi Yap</Text>
              )}
            </Pressable>
          </FadeInDown>
          </View>
        )}

        {/* RESULTS AREA */}
        {result && (
          <FadeInDown index={2} style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {result.calories === 0 ? (
              <View style={styles.noFoodBox}>
                <Info color="#FF3B3B" size={32} />
                <Text style={styles.noFoodText}>Bu fotoğrafta yemek algılanamadı!</Text>
                <Pressable style={[styles.retakeBtnFull, { backgroundColor: colors.iconBg }]} onPress={() => { setImageUri(null); setResult(null); }}>
                  <Text style={[styles.retakeBtnText, { color: colors.text }]}>Tekrar Dene</Text>
                </Pressable>
              </View>
            ) : (
              <View>
                <Text style={[styles.resultTitle, { color: colors.textSub }]}>Tarama Başarılı</Text>
                <Text style={[styles.resultFoods, { color: colors.text }]}>{result.foods?.join(', ')}</Text>
                
                <View style={styles.macrosRow}>
                  <View style={[styles.macroBox, { backgroundColor: colors.iconBg, borderColor: colors.border }]}>
                    <Text style={[styles.macroVal, { color: colors.text }]}>{result.calories}</Text>
                    <Text style={[styles.macroLabel, { color: colors.textSub }]}>Kalori</Text>
                  </View>
                  <View style={[styles.macroBox, { backgroundColor: colors.iconBg, borderColor: colors.border }]}>
                    <Text style={[styles.macroVal, { color: colors.text }]}>{result.protein_g}g</Text>
                    <Text style={[styles.macroLabel, { color: colors.textSub }]}>Protein</Text>
                  </View>
                  <View style={[styles.macroBox, { backgroundColor: colors.iconBg, borderColor: colors.border }]}>
                    <Text style={[styles.macroVal, { color: colors.text }]}>{result.carbs_g}g</Text>
                    <Text style={[styles.macroLabel, { color: colors.textSub }]}>Karb</Text>
                  </View>
                  <View style={[styles.macroBox, { backgroundColor: colors.iconBg, borderColor: colors.border }]}>
                    <Text style={[styles.macroVal, { color: colors.text }]}>{result.fat_g}g</Text>
                    <Text style={[styles.macroLabel, { color: colors.textSub }]}>Yağ</Text>
                  </View>
                </View>

                {result.note && (
                  <View style={styles.noteBox}>
                     <Text style={styles.noteText}>{result.note}</Text>
                  </View>
                )}

                <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 }}>ÖĞÜN TÜRÜ</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 20 }}>
                  {['Sabah', 'Öğle', 'Akşam', 'Ara Öğün'].map(t => (
                    <Pressable 
                      key={t} 
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 12,
                        backgroundColor: selectedType === t ? '#FF6B35' : colors.iconBg,
                        borderWidth: 1,
                        borderColor: selectedType === t ? '#FF6B35' : colors.border,
                        alignItems: 'center'
                      }}
                      onPress={() => setSelectedType(t)}
                    >
                      <Text style={{ color: selectedType === t ? '#FFF' : colors.textSub, fontSize: 12, fontWeight: '700' }}>
                        {t}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable style={styles.saveBtn} onPress={handleSave}>
                  <Check color="#FFF" size={20} />
                  <Text style={styles.saveBtnText}>Öğünü Kaydet</Text>
                </Pressable>
              </View>
            )}
          </FadeInDown>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  notesInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top'
  },
  container: { flex: 1, backgroundColor: '#050505' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  permissionText: { fontSize: 18, color: '#FFF', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', padding: 20, paddingBottom: 10 },
  
  scrollContent: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 130 : 100 },
  previewBox: { width: '100%', height: 320, backgroundColor: '#1A1A1A', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#333', position: 'relative' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#AAA', marginTop: 12, fontSize: 15, fontWeight: '500' },
  
  actionRow: { position: 'absolute', bottom: 20, left: 20, right: 20, flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, backgroundColor: '#222', paddingVertical: 14, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  actionBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

  analyzeActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  retakeBtn: { flex: 1, paddingVertical: 16, backgroundColor: '#222', borderRadius: 16, alignItems: 'center' },
  retakeBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  primaryBtn: { flex: 2, paddingVertical: 16, backgroundColor: '#FF6B35', borderRadius: 16, alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

  resultCard: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 24, marginTop: 24, borderWidth: 1, borderColor: '#333' },
  resultTitle: { fontSize: 13, fontWeight: '700', color: '#AAA', letterSpacing: 1, marginBottom: 8 },
  resultFoods: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 20 },
  
  macrosRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  macroBox: { flex: 1, backgroundColor: '#222', padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  macroVal: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  macroLabel: { fontSize: 12, color: '#AAA', marginTop: 4 },

  noteBox: { backgroundColor: 'rgba(255, 107, 53, 0.1)', padding: 16, borderRadius: 16, marginBottom: 20 },
  noteText: { color: '#FF6B35', fontSize: 14, fontWeight: '500', lineHeight: 20 },

  saveBtn: { backgroundColor: '#FF6B35', padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  noFoodBox: { alignItems: 'center', padding: 20 },
  noFoodText: { color: '#FF3B3B', fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 24 },
  retakeBtnFull: { width: '100%', padding: 16, backgroundColor: '#222', borderRadius: 16, alignItems: 'center' },

  // Camera Overlay Styles
  cameraOverlay: { flex: 1, justifyContent: 'space-between' },
  closeCameraBtn: { padding: 20, alignSelf: 'flex-start' },
  cameraFrame: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraControls: { padding: 40, alignItems: 'center' },
  captureBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  captureBtnInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF' },
  
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16 },
  tipCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12 },
  tipIcon: { padding: 12, borderRadius: 16, marginRight: 16 },
  tipTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  tipDesc: { fontSize: 13, lineHeight: 20 },
});
