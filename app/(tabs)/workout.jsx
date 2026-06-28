import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, Pressable, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';

// expo-notifications Expo Go'dan SDK 53 ile kaldırıldı.
// Lazy require ile sadece native build'de yüklenir, Expo Go'da null kalır.
let Notifications = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  // Expo Go — notifications modülü yok, sessizce devam et
}

import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, Plus, ArrowRight, Zap, Target, Calendar, ChevronRight, ChevronDown, Activity, X, Info, Search, Trash2, CheckCircle2, Play, Square, Timer } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { PROGRAMS, PROGRAM_LIST, recommendByFrequencyAndGoal } from '../../data/workouts';
import { EXERCISES } from '../../data/exercises';
import FadeInDown from '../../components/FadeInDown';
import Body from 'react-native-body-highlighter';

const MAP_TO_RBH = {
  f_chest_l: 'chest', f_chest_r: 'chest',
  f_delt_l: 'front-deltoids', f_delt_r: 'front-deltoids',
  b_delt_l: 'back-deltoids', b_delt_r: 'back-deltoids',
  f_bicep_l: 'biceps', f_bicep_r: 'biceps',
  f_tri_l: 'triceps', f_tri_r: 'triceps', b_tri_l: 'triceps', b_tri_r: 'triceps',
  f_fgarm_l: 'forearm', f_fgarm_r: 'forearm', b_fgarm_l: 'forearm', b_fgarm_r: 'forearm',
  f_core: 'abs', f_oblq_l: 'obliques', f_oblq_r: 'obliques',
  f_quad_l: 'quadriceps', f_quad_r: 'quadriceps',
  b_ham_l: 'hamstring', b_ham_r: 'hamstring',
  b_glute: 'gluteal',
  b_calf_l: 'calves', b_calf_r: 'calves',
  b_lat_l: 'upper-back', b_lat_r: 'upper-back', b_trap: 'trapezius',
  b_mid_bk: 'lower-back', b_lo_bk: 'lower-back', b_erect: 'lower-back',
  f_addc: 'adductor'
};

const LEVEL_THEMES = {
  'Başlangıç': {
    primary: '#10B981', // Emerald green
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.3)',
    text: '#059669'
  },
  'Orta': {
    primary: '#00AAFF', // Ocean blue
    bg: 'rgba(0, 170, 255, 0.1)',
    border: 'rgba(0, 170, 255, 0.3)',
    text: '#0088CC'
  },
  'İleri': {
    primary: '#8B5CF6', // Electric purple
    bg: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(139, 92, 246, 0.3)',
    text: '#7C3AED'
  },
  'Özel': {
    primary: '#FF6B35', // Orange
    bg: 'rgba(255, 107, 53, 0.1)',
    border: 'rgba(255, 107, 53, 0.3)',
    text: '#E04A15'
  }
};

const getBodyData = (exObj) => {
  if (!exObj) return [];
  const ROLE_LEVELS = { primary: 3, secondary: 2, stabilizer: 1 };
  const merged = {};
  const process = (sideData) => {
    if (!sideData) return;
    Object.entries(sideData).forEach(([k, role]) => {
      const rbhKey = MAP_TO_RBH[k];
      if (rbhKey) {
        const lvl = ROLE_LEVELS[role] || 1;
        if (!merged[rbhKey] || merged[rbhKey] < lvl) {
          merged[rbhKey] = lvl;
        }
      }
    });
  };
  process(exObj.front);
  process(exObj.back);
  return Object.entries(merged).map(([slug, intensity]) => ({ slug, intensity }));
};

const formatTime = (secs) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export default function WorkoutScreen() {
  const {
    selectedProgram, setSelectedProgram,
    todaySession, recordSet,
    customPrograms, saveCustomProgram,
    addXP, addFatigue, addBurnedCal
  } = useUser();
  const { colors, isDark } = useTheme();

  const [showProgramModal, setShowProgramModal] = useState(!selectedProgram);
  const [expandedProgramId, setExpandedProgramId] = useState(null);
  
  // Asistan State
  const [wizardStep, setWizardStep] = useState('idle'); // idle | freq | goal | result | create_custom | picker
  const [wizardFreq, setWizardFreq] = useState(4);
  const [wizardGoal, setWizardGoal] = useState('muscle');
  const [recommendedProgId, setRecommendedProgId] = useState(null);

  // Egzersiz Detay Modal State
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Custom Workout State
  const [customName, setCustomName] = useState('Özel Antrenmanım');
  const [customExList, setCustomExList] = useState([]);
  const [exSearch, setExSearch] = useState('');

  // Workout Player State
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [inputValues, setInputValues] = useState({});
  const timerRef = useRef(null);
  const restTimerRef = useRef(null);
  const liveActivityRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isWorkoutActive && Platform.OS === 'android' && Notifications) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
    }
  }, [isWorkoutActive]);

  const prog = selectedProgram ? (PROGRAMS[selectedProgram] || customPrograms[selectedProgram]) : null;

  const getTodayDayIndex = () => {
    const day = new Date().getDay(); 
    return day === 0 ? 6 : day - 1; 
  };

  const todayWorkout = prog ? prog.days[getTodayDayIndex() % prog.days.length] : null;
  
  const LEVEL_ORDER = { 'Başlangıç': 1, 'Orta': 2, 'İleri': 3, 'Özel': 4 };
  const ALL_PROGRAMS = [...PROGRAM_LIST, ...Object.values(customPrograms || {})].sort((a, b) => {
    const levelA = a.level === 'Özel' || a.id.startsWith('custom_') ? 'Özel' : a.level;
    const levelB = b.level === 'Özel' || b.id.startsWith('custom_') ? 'Özel' : b.level;
    return (LEVEL_ORDER[levelA] || 99) - (LEVEL_ORDER[levelB] || 99);
  });

  const groupedPrograms = ALL_PROGRAMS.reduce((acc, p) => {
    const lvl = p.level === 'Özel' || p.id.startsWith('custom_') ? 'Özel' : p.level;
    if (!acc[lvl]) acc[lvl] = [];
    acc[lvl].push(p);
    return acc;
  }, {});

  const handleSetProgram = (id) => {
    setSelectedProgram(id);
    setShowProgramModal(false);
  };

  const handleRunWizard = () => {
    const recId = recommendByFrequencyAndGoal(wizardFreq, wizardGoal);
    setRecommendedProgId(recId);
    setWizardStep('result');
  };

  const handleSaveCustom = () => {
    if (customExList.length === 0) return;
    const id = 'custom_' + Date.now();
    const newProg = {
      id,
      name: customName,
      short: 'Özel',
      desc: 'Kullanıcı tarafından oluşturulmuş özel antrenman.',
      frequency: 1,
      level: 'Özel',
      days: [
        {
          day: 'Günün Antrenmanı',
          focus: 'Özel',
          exercises: customExList
        }
      ]
    };
    saveCustomProgram(newProg);
    setCustomName('Özel Antrenmanım');
    setCustomExList([]);
    setWizardStep('idle');
    handleSetProgram(id);
  };

  const handleRemoveCustomEx = (index) => {
    setCustomExList(prev => prev.filter((_, i) => i !== index));
  };

  // Workout Player Actions
  const startWorkout = async () => {
    setIsWorkoutActive(true);
    setWorkoutDuration(0);

    if (Platform.OS === 'android' && Notifications) {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          await Notifications.setNotificationChannelAsync('workout', {
            name: 'Antrenman Süreci',
            importance: Notifications.AndroidImportance.HIGH,
          });
          await Notifications.scheduleNotificationAsync({
            identifier: 'workout_notification',
            content: {
              title: 'Antrenman Aktif 💪',
              body: 'Antrenmanınız devam ediyor...',
              sticky: true,
            },
            trigger: null,
          });
        }
      } catch (e) {
        console.warn('Bildirim gönderilemedi:', e);
      }
    }

    timerRef.current = setInterval(() => setWorkoutDuration(d => d + 1), 1000);
  };

  const endWorkout = async () => {
    setIsWorkoutActive(false);
    if(timerRef.current) clearInterval(timerRef.current);
    if(restTimerRef.current) clearInterval(restTimerRef.current);
    setRestTimeLeft(0);

    // Süreye göre yakılan kalori (~6 kal/dk, kuvvet antrenmanı için makul tahmin)
    const minutes = workoutDuration / 60;
    const burned = Math.round(minutes * 6);
    if (burned > 0) {
      addBurnedCal(burned);
      Alert.alert(
        'Antrenman Tamamlandı 💪',
        `Süre: ${formatTime(workoutDuration)}\nYaktığın kalori: ~${burned} kal\n\nBu kalori bugünkü "hak ettiğin" kaloriye eklendi.`
      );
    }
    setWorkoutDuration(0);

    if (Platform.OS === 'android' && Notifications) {
      try {
        await Notifications.dismissNotificationAsync('workout_notification');
      } catch (e) {
        console.warn('Bildirim kapatılamadı:', e);
      }
    }
  };

  // Tamamlanan bir setin çalıştırdığı kaslara rol bazlı XP + yorgunluk verir,
  // ve tahmini yakılan kaloriyi günlüğe ekler.
  const awardForCompletedSet = (exId, reps) => {
    const ex = EXERCISES[exId];
    if (!ex) return;
    const byRole = { primary: [], secondary: [], stabilizer: [] };
    const collect = (side) => {
      if (!side) return;
      Object.entries(side).forEach(([muscle, role]) => {
        if (byRole[role]) byRole[role].push(muscle);
      });
    };
    collect(ex.front);
    collect(ex.back);

    if (byRole.primary.length) addXP(byRole.primary, 15);
    if (byRole.secondary.length) addXP(byRole.secondary, 8);
    if (byRole.stabilizer.length) addXP(byRole.stabilizer, 4);
    if (byRole.primary.length) addFatigue(byRole.primary, 12);
    // Yakılan kalori antrenman bitince süreye göre kredilenir (endWorkout).
  };

  const handleCompleteSet = (exId, setIdx, targetReps, defaultRest) => {
    const wKey = `${exId}_${setIdx}_w`;
    const rKey = `${exId}_${setIdx}_r`;
    const weight = inputValues[wKey] || '0';
    
    // Extract purely numbers from targetReps if it's a string like "8-10" or "45sn". We'll just take the first number as a default.
    let parsedTarget = 10;
    if (typeof targetReps === 'string') {
       const match = targetReps.match(/\d+/);
       if (match) parsedTarget = parseInt(match[0], 10);
    } else if (typeof targetReps === 'number') {
       parsedTarget = targetReps;
    }

    const reps = inputValues[rKey] || String(parsedTarget);
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps, 10) || 0;

    recordSet(exId, setIdx, { weight: w, reps: r });

    // Tamamlanan sete göre kas XP'si, yorgunluk ve yakılan kaloriyi işle
    awardForCompletedSet(exId, r);

    // Start rest timer
    setRestTimeLeft(defaultRest || 60);
    if(restTimerRef.current) clearInterval(restTimerRef.current);
    restTimerRef.current = setInterval(() => {
      setRestTimeLeft(prev => {
        if(prev <= 1) {
          clearInterval(restTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const renderExerciseModal = () => (
    <Modal visible={!!selectedExercise} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.exModalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <TouchableOpacity style={[styles.closeIconBtn, { backgroundColor: colors.card }]} onPress={() => setSelectedExercise(null)}>
            <X color={colors.text} size={20} />
          </TouchableOpacity>
          {selectedExercise && (
            <>
              <Text style={[styles.exModalTitle, { color: colors.text }]}>{selectedExercise.name}</Text>
              <View style={styles.exModalBadges}>
                <View style={[styles.badge, { backgroundColor: 'rgba(0,170,255,0.1)' }]}>
                  <Text style={[styles.badgeText, { color: '#00AAFF' }]}>{selectedExercise.difficulty}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: 'rgba(255,107,53,0.1)' }]}>
                  <Text style={[styles.badgeText, { color: '#FF6B35' }]}>{selectedExercise.category}</Text>
                </View>
              </View>
              <Text style={[styles.exModalSubtitle, { color: colors.textSub, marginBottom: 12 }]}>Aktif Kas Grupları</Text>
              <View style={[styles.bodyMapContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.bodyMapHalf}>
                  <Text style={[styles.bodyMapLabel, { color: colors.textSub }]}>Ön</Text>
                  <Body 
                    data={getBodyData(selectedExercise)}
                    gender="male"
                    side="front"
                    scale={0.5}
                    frontOnly={true}
                    colors={['#7A7A7A', '#2E7DC4', '#D94040']}
                  />
                </View>
                <View style={styles.bodyMapHalf}>
                  <Text style={[styles.bodyMapLabel, { color: colors.textSub }]}>Arka</Text>
                  <Body 
                    data={getBodyData(selectedExercise)}
                    gender="male"
                    side="back"
                    scale={0.5}
                    frontOnly={false}
                    colors={['#7A7A7A', '#2E7DC4', '#D94040']}
                  />
                </View>
              </View>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#D94040' }]} /><Text style={[styles.legendText, { color: colors.textSub }]}>Primer</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#2E7DC4' }]} /><Text style={[styles.legendText, { color: colors.textSub }]}>Yardımcı</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#7A7A7A' }]} /><Text style={[styles.legendText, { color: colors.textSub }]}>Stabilizatör</Text></View>
              </View>
              <ScrollView style={{ marginTop: 12 }}>
                <Text style={[styles.tipsHeader, { color: colors.text }]}>İpuçları:</Text>
                {selectedExercise.tips?.map((tip, idx) => (
                  <View key={idx} style={styles.tipRow}>
                    <View style={[styles.tipBullet, { backgroundColor: colors.textSub }]} />
                    <Text style={[styles.tipText, { color: colors.textSub }]}>{tip}</Text>
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderProgramSelection = () => (
    <Modal visible={showProgramModal} animationType="slide">
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        {wizardStep === 'idle' ? (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 0 }]}>Program Seç</Text>
              <Pressable onPress={() => setShowProgramModal(false)} style={{ padding: 8, backgroundColor: colors.card, borderRadius: 20 }}>
                <X size={24} color={colors.textSub} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.scroll}>
              
              <Pressable style={[styles.wizardBtn, { padding: 16, marginBottom: 16, borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => setWizardStep('library')}>
                <View style={[styles.wizardBtnIconWrap, { backgroundColor: colors.iconBg }]}><Search color={colors.text} size={20} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.wizardBtnText, { color: colors.text }]}>Egzersiz Kütüphanesi</Text>
                  <Text style={[styles.wizardBtnSubText, { color: colors.textSub }]}>Hareketleri detaylı incele</Text>
                </View>
              </Pressable>

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                <Pressable style={[styles.wizardBtn, { flex: 1, marginBottom: 0 }]} onPress={() => setWizardStep('freq')}>
                  <View style={styles.wizardBtnIconWrap}><Zap color="#00AAFF" size={20} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.wizardBtnText}>AI Asistan</Text>
                    <Text style={styles.wizardBtnSubText}>Program öner</Text>
                  </View>
                </Pressable>
                
                <Pressable style={[styles.wizardBtn, { flex: 1, marginBottom: 0, borderColor: '#FF6B35', backgroundColor: 'rgba(255,107,53,0.1)' }]} onPress={() => setWizardStep('create_custom')}>
                  <View style={[styles.wizardBtnIconWrap, { backgroundColor: 'rgba(255,107,53,0.2)' }]}><Plus color="#FF6B35" size={20} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.wizardBtnText, { color: '#FF6B35' }]}>Özel Oluştur</Text>
                    <Text style={[styles.wizardBtnSubText, { color: '#FF6B35' }]}>Kendin hazırla</Text>
                  </View>
                </Pressable>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>Tüm Programlar</Text>

              {Object.entries(groupedPrograms).map(([level, progs]) => {
                const theme = LEVEL_THEMES[level] || LEVEL_THEMES['Özel'];
                return (
                  <View key={level} style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
                      <View style={{ width: 4, height: 18, backgroundColor: theme.primary, borderRadius: 2 }} />
                      <Text style={{ fontSize: 15, fontWeight: '800', color: colors.textSub, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {level === 'Özel' ? 'Özel Programlar' : `${level} Seviye`}
                      </Text>
                    </View>

                    {progs.map(p => {
                      const isExpanded = expandedProgramId === p.id;
                      return (
                        <Pressable 
                          key={p.id} 
                          style={[
                            styles.progCard, 
                            { 
                              backgroundColor: colors.card, 
                              borderColor: isExpanded ? theme.primary : colors.border,
                              borderWidth: isExpanded ? 2 : 1,
                              paddingVertical: 16,
                              paddingHorizontal: 16,
                              marginBottom: 12
                            }
                          ]} 
                          onPress={() => setExpandedProgramId(isExpanded ? null : p.id)}
                        >
                          <View style={styles.progHeader}>
                            <Text style={[styles.progName, { color: colors.text }]}>{p.name}</Text>
                            <View style={[styles.progBadge, { backgroundColor: theme.bg }]}>
                              <Text style={[styles.progBadgeText, { color: theme.primary }]}>{p.level}</Text>
                            </View>
                          </View>
                          
                          <Text style={[styles.progDesc, { color: colors.textSub, marginBottom: isExpanded ? 16 : 8 }]}>
                            {p.desc}
                          </Text>

                          {isExpanded ? (
                            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16, marginTop: 8 }}>
                              {p.about && (
                                <View style={{ marginBottom: 12 }}>
                                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSub, marginBottom: 4 }}>Program Hakkında</Text>
                                  <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20 }}>{p.about}</Text>
                                </View>
                              )}

                              {p.target && (
                                <View style={{ marginBottom: 12 }}>
                                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSub, marginBottom: 4 }}>Kimler İçin Uygun?</Text>
                                  <Text style={{ fontSize: 14, color: colors.text }}>{p.target}</Text>
                                </View>
                              )}

                              {p.benefits && p.benefits.length > 0 && (
                                <View style={{ marginBottom: 16 }}>
                                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSub, marginBottom: 6 }}>Öne Çıkan Avantajları</Text>
                                  {p.benefits.map((benefit, idx) => (
                                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                      <CheckCircle2 size={14} color="#10B981" />
                                      <Text style={{ fontSize: 13, color: colors.textSub, flex: 1 }}>{benefit}</Text>
                                    </View>
                                  ))}
                                </View>
                              )}

                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <View style={styles.progFreqRow}>
                                  <Calendar size={14} color={theme.primary} />
                                  <Text style={[styles.progFreq, { color: colors.textSub }]}>Haftada {p.frequency} Gün</Text>
                                </View>
                                <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} onPress={() => setExpandedProgramId(null)}>
                                  <Text style={{ fontSize: 12, fontWeight: '600', color: theme.primary }}>Kapat</Text>
                                  <ChevronDown size={16} color={theme.primary} />
                                </Pressable>
                              </View>

                              <Pressable 
                                style={[styles.wizardPrimaryBtn, { backgroundColor: theme.primary, marginTop: 8, marginVertical: 0 }]} 
                                onPress={() => handleSetProgram(p.id)}
                              >
                                <Text style={styles.wizardPrimaryBtnText}>Bu Programı Aktifleştir</Text>
                              </Pressable>
                            </View>
                          ) : (
                            <View style={[styles.progFooter, { marginTop: 8 }]}>
                              <View style={styles.progFreqRow}>
                                <Calendar size={14} color={theme.primary} />
                                <Text style={[styles.progFreq, { color: colors.textSub }]}>Haftada {p.frequency} Gün</Text>
                              </View>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: theme.primary }}>Detaylar</Text>
                                <ChevronRight size={16} color={theme.primary} />
                              </View>
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                );
              })}
              {selectedProgram && (
                <Pressable style={styles.cancelBtn} onPress={() => setShowProgramModal(false)}>
                  <Text style={styles.cancelBtnText}>İptal</Text>
                </Pressable>
              )}
            </ScrollView>
          </>
        ) : wizardStep === 'create_custom' ? (
          <View style={styles.wizardContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity onPress={() => setWizardStep('idle')} style={{ paddingRight: 16 }}>
                <ChevronRight size={28} color={colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
              <Text style={[styles.wizardTitle, { color: colors.text, marginBottom: 0, marginTop: 0 }]}>Özel Program Oluştur</Text>
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput 
                style={[styles.textInput, { color: colors.text }]}
                placeholder="Program Adı"
                placeholderTextColor={colors.textSub}
                value={customName}
                onChangeText={setCustomName}
              />
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16, marginBottom: 12, fontSize: 18 }]}>Hareketler</Text>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {customExList.length === 0 ? (
                <View style={[styles.emptyState, { borderColor: colors.border }]}>
                  <Dumbbell size={40} color={colors.border} />
                  <Text style={[styles.emptyStateText, { color: colors.textSub }]}>Henüz hareket eklemedin.</Text>
                </View>
              ) : (
                customExList.map((item, index) => (
                  <View key={index} style={[styles.customExCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.exName, { color: colors.text, fontSize: 16 }]}>{EXERCISES[item.ex].name}</Text>
                      <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                        <TextInput 
                          style={[styles.smallInput, { backgroundColor: colors.background, color: colors.text }]} 
                          value={String(item.sets)}
                          onChangeText={(v) => { const n = [...customExList]; n[index].sets = v; setCustomExList(n); }}
                          keyboardType="numeric"
                        />
                        <Text style={{ color: colors.textSub, alignSelf: 'center' }}>Set</Text>
                        <TextInput 
                          style={[styles.smallInput, { backgroundColor: colors.background, color: colors.text, width: 60 }]} 
                          value={String(item.reps)}
                          onChangeText={(v) => { const n = [...customExList]; n[index].reps = v; setCustomExList(n); }}
                        />
                        <Text style={{ color: colors.textSub, alignSelf: 'center' }}>Tekrar</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={{ padding: 8 }} onPress={() => handleRemoveCustomEx(index)}>
                      <Trash2 size={20} color="#FF3B3B" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
              <Pressable style={[styles.addExBtn, { borderColor: colors.border }]} onPress={() => setWizardStep('picker')}>
                <Plus color="#00AAFF" size={24} />
                <Text style={styles.addExBtnText}>Yeni Hareket Ekle</Text>
              </Pressable>
            </ScrollView>

            <Pressable style={[styles.wizardPrimaryBtn, customExList.length === 0 && { opacity: 0.5 }]} onPress={handleSaveCustom}>
              <Text style={styles.wizardPrimaryBtnText}>Programı Kaydet</Text>
            </Pressable>
          </View>
        ) : wizardStep === 'picker' ? (
          <View style={styles.wizardContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity onPress={() => setWizardStep('create_custom')} style={{ paddingRight: 16 }}>
                <ChevronRight size={28} color={colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
              <Text style={[styles.wizardTitle, { color: colors.text, marginBottom: 0, marginTop: 0 }]}>Hareket Seç</Text>
            </View>

            <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Search size={20} color={colors.textSub} />
              <TextInput 
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Hareket ara..."
                placeholderTextColor={colors.textSub}
                value={exSearch}
                onChangeText={setExSearch}
              />
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {Object.values(EXERCISES).filter(ex => ex.name.toLowerCase().includes(exSearch.toLowerCase())).map(ex => (
                <Pressable 
                  key={ex.id} 
                  style={[styles.pickerItem, { backgroundColor: colors.card, borderColor: colors.border }]} 
                  onPress={() => {
                    setCustomExList([...customExList, { ex: ex.id, sets: 3, reps: '10' }]);
                    setExSearch('');
                    setWizardStep('create_custom');
                  }}
                >
                  <Text style={[styles.pickerItemName, { color: colors.text }]}>{ex.name}</Text>
                  <Text style={[styles.pickerItemCat, { color: colors.textSub }]}>{ex.category} • {ex.difficulty}</Text>
                  <Plus size={20} color="#FF6B35" style={{ position: 'absolute', right: 16, top: 18 }} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : wizardStep === 'library' ? (
          <View style={styles.wizardContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity onPress={() => setWizardStep('idle')} style={{ paddingRight: 16 }}>
                <ChevronRight size={28} color={colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
              <Text style={[styles.wizardTitle, { color: colors.text, marginBottom: 0, marginTop: 0 }]}>Kütüphane</Text>
            </View>

            <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Search size={20} color={colors.textSub} />
              <TextInput 
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Hareket ara..."
                placeholderTextColor={colors.textSub}
                value={exSearch}
                onChangeText={setExSearch}
              />
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {Object.values(EXERCISES).filter(ex => ex.name.toLowerCase().includes(exSearch.toLowerCase())).map(ex => (
                <Pressable 
                  key={ex.id} 
                  style={[styles.pickerItem, { backgroundColor: colors.card, borderColor: colors.border }]} 
                  onPress={() => setSelectedExercise(ex)}
                >
                  <Text style={[styles.pickerItemName, { color: colors.text }]}>{ex.name}</Text>
                  <Text style={[styles.pickerItemCat, { color: colors.textSub }]}>{ex.category} • {ex.difficulty}</Text>
                  <Info size={20} color="#FF6B35" style={{ position: 'absolute', right: 16, top: 18 }} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : wizardStep === 'freq' ? (
          <View style={styles.wizardContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity onPress={() => setWizardStep('idle')} style={{ paddingRight: 16 }}>
                <ChevronRight size={28} color={colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
              <Text style={[styles.wizardTitle, { color: colors.text, marginBottom: 0, marginTop: 0 }]}>Kaç Gün?</Text>
            </View>
            <ScrollView>
              {[2, 3, 4, 5, 6].map(days => (
                <Pressable 
                  key={days}
                  style={[styles.wizardOption, wizardFreq === days && styles.wizardOptionSelected, { borderColor: wizardFreq === days ? '#FF6B35' : colors.border }]}
                  onPress={() => setWizardFreq(days)}
                >
                  <View style={styles.wizardOptionRow}>
                    <View style={[styles.wizardIconBox, { backgroundColor: colors.iconBg }]}><Calendar color={colors.text} size={20} /></View>
                    <Text style={[styles.wizardOptionText, { color: colors.text }, wizardFreq === days && styles.wizardOptionTextSelected]}>Haftada {days} Gün</Text>
                  </View>
                  <View style={[styles.wizardRadio, wizardFreq === days && styles.wizardRadioSelected]} />
                </Pressable>
              ))}
              <Pressable style={styles.wizardPrimaryBtn} onPress={() => setWizardStep('goal')}>
                <Text style={styles.wizardPrimaryBtnText}>Devam Et</Text>
                <ArrowRight size={20} color="#FFF" />
              </Pressable>
            </ScrollView>
          </View>
        ) : wizardStep === 'goal' ? (
          <View style={styles.wizardContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity onPress={() => setWizardStep('freq')} style={{ paddingRight: 16 }}>
                <ChevronRight size={28} color={colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
              <Text style={[styles.wizardTitle, { color: colors.text, marginBottom: 0, marginTop: 0 }]}>Hedefin Nedir?</Text>
            </View>
            <ScrollView>
              {[
                { id: 'muscle', label: 'Kas Kütlesi (Hipertrofi)', icon: <Dumbbell color={colors.text} size={20} /> },
                { id: 'strength', label: 'Saf Güç (Strength)', icon: <Zap color={colors.text} size={20} /> },
                { id: 'gain', label: 'Kilo Almak (Hacim)', icon: <Target color={colors.text} size={20} /> },
                { id: 'weight_loss', label: 'Kilo Verme & Sıkılaşma', icon: <Target color={colors.text} size={20} /> },
                { id: 'healthy', label: 'Sağlıklı Beslenmek & Zindelik', icon: <Activity color={colors.text} size={20} /> }
              ].map(g => (
                <Pressable 
                  key={g.id}
                  style={[styles.wizardOption, wizardGoal === g.id && styles.wizardOptionSelected, { borderColor: wizardGoal === g.id ? '#FF6B35' : colors.border }]}
                  onPress={() => setWizardGoal(g.id)}
                >
                  <View style={styles.wizardOptionRow}>
                    <View style={[styles.wizardIconBox, { backgroundColor: colors.iconBg }]}>{g.icon}</View>
                    <Text style={[styles.wizardOptionText, { color: colors.text }, wizardGoal === g.id && styles.wizardOptionTextSelected]}>{g.label}</Text>
                  </View>
                  <View style={[styles.wizardRadio, wizardGoal === g.id && styles.wizardRadioSelected]} />
                </Pressable>
              ))}
              <Pressable style={styles.wizardPrimaryBtn} onPress={handleRunWizard}>
                <Text style={styles.wizardPrimaryBtnText}>Programımı Bul</Text>
                <Zap size={20} color="#FFF" />
              </Pressable>
            </ScrollView>
          </View>
        ) : wizardStep === 'result' ? (
          <View style={styles.wizardContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity onPress={() => setWizardStep('goal')} style={{ paddingRight: 16 }}>
                <ChevronRight size={28} color={colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
              <Text style={[styles.wizardTitle, { color: colors.text, marginBottom: 0, marginTop: 0 }]}>Sonuç</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <View style={[styles.progCard, { width: '100%', backgroundColor: colors.card, borderColor: '#00AAFF', borderWidth: 2 }]}>
                <Text style={[styles.progBadgeText, { color: '#00AAFF', marginBottom: 12, textAlign: 'center' }]}>Senin İçin En Uygunu</Text>
                <Text style={[styles.progName, { color: colors.text, textAlign: 'center', marginBottom: 8, fontSize: 22 }]}>{PROGRAMS[recommendedProgId]?.name}</Text>
                <Text style={[styles.progDesc, { color: colors.textSub, textAlign: 'center', marginBottom: 20 }]}>{PROGRAMS[recommendedProgId]?.desc}</Text>
                
                <View style={[styles.progFreqRow, { justifyContent: 'center', marginBottom: 24 }]}>
                  <Calendar size={16} color="#00AAFF" />
                  <Text style={[styles.progFreq, { color: colors.textSub }]}>Haftada {PROGRAMS[recommendedProgId]?.frequency} Gün</Text>
                </View>
                <Pressable style={styles.wizardPrimaryBtn} onPress={() => handleSetProgram(recommendedProgId)}>
                  <Text style={styles.wizardPrimaryBtnText}>Bu Programı Seç</Text>
                </Pressable>
                <Pressable style={styles.wizardSecondaryBtn} onPress={() => setWizardStep('freq')}>
                  <Text style={styles.wizardSecondaryBtnText}>Yeniden Dene</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </Modal>
  );

  if (!selectedProgram || !prog) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {renderProgramSelection()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {renderExerciseModal()}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Antrenman</Text>
          <Text style={styles.subtitle}>Aktif: {prog.name}</Text>
        </View>
        <View style={{flexDirection: 'row', gap: 8, alignItems: 'center'}}>
          <Pressable style={[styles.changeBtn, { backgroundColor: colors.iconBg, paddingHorizontal: 12 }]} onPress={() => { setWizardStep('library'); setShowProgramModal(true); }}>
            <Search size={18} color={colors.text} />
          </Pressable>
          {!isWorkoutActive && (
            <Pressable style={[styles.changeBtn, { backgroundColor: colors.iconBg }]} onPress={() => { setWizardStep('idle'); setShowProgramModal(true); }}>
              <Text style={[styles.changeBtnText, { color: colors.text }]}>Değiştir</Text>
            </Pressable>
          )}
        </View>
        {isWorkoutActive && (
          <View style={[styles.timerBadge, { backgroundColor: 'rgba(255,107,53,0.1)' }]}>
             <Timer size={16} color="#FF6B35" />
             <Text style={[styles.timerText, { color: '#FF6B35' }]}>{formatTime(workoutDuration)}</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!isWorkoutActive && (
          <FadeInDown index={0} style={[styles.todayCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.todayHeader}>
              <Zap size={24} color="#FF6B35" />
              <Text style={[styles.todayTitle, { color: colors.textSub }]}>Günün Odak Noktası</Text>
            </View>
            <Text style={[styles.todayFocus, { color: colors.text }]}>{todayWorkout?.focus || 'Dinlenme Günü'}</Text>
            {todayWorkout?.exercises ? (
               <Text style={[styles.todaySub, { color: colors.textSub }]}>{todayWorkout.day} - {todayWorkout.exercises.length} Egzersiz</Text>
            ) : (
               <Text style={[styles.todaySub, { color: colors.textSub }]}>Bugün dinlen ve toparlan.</Text>
            )}

            {todayWorkout?.exercises && (
              <Pressable style={[styles.startWorkoutBtn]} onPress={startWorkout}>
                <Play color="#FFF" size={20} fill="#FFF" />
                <Text style={styles.startWorkoutBtnText}>Antrenmana Başla</Text>
              </Pressable>
            )}
          </FadeInDown>
        )}

        {isWorkoutActive && restTimeLeft > 0 && (
          <FadeInDown index={0} style={[styles.restBanner, { backgroundColor: '#FF6B35' }]}>
            <Timer color="#FFF" size={24} />
            <Text style={styles.restBannerText}>Dinlenme Süresi: {formatTime(restTimeLeft)}</Text>
            <Pressable style={styles.restSkipBtn} onPress={() => { setRestTimeLeft(0); clearInterval(restTimerRef.current); }}>
              <Text style={styles.restSkipBtnText}>Atla</Text>
            </Pressable>
          </FadeInDown>
        )}

        {todayWorkout?.exercises && (
          <FadeInDown index={isWorkoutActive ? 1 : 1}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Egzersizler</Text>
          </FadeInDown>
        )}
        
        {todayWorkout?.exercises?.map((item, index) => {
          const exInfo = EXERCISES[item.ex];
          if (!exInfo) return null;
          
          const session = todaySession(item.ex);
          const sets = session?.sets || [];
          
          // Parse target sets count
          let targetSetsCount = 3;
          if (typeof item.sets === 'number') targetSetsCount = item.sets;

          return (
            <FadeInDown key={index} index={index + 2} style={[styles.exCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.exHeaderRow}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => setSelectedExercise(exInfo)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.exName, { color: colors.text }]}>{exInfo.name}</Text>
                    <Info size={16} color={colors.textSub} />
                  </View>
                  <Text style={[styles.exTarget, { color: colors.textSub }]}>Hedef: {item.sets} set, {item.reps} tekrar</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.setsContainer}>
                {Array.from({ length: targetSetsCount }).map((_, idx) => {
                  const completedSet = sets[idx];
                  const isCompleted = !!completedSet;

                  if (!isWorkoutActive) {
                    // Sadece Liste Görünümü
                    return (
                      <View key={idx} style={[styles.setRow, { backgroundColor: colors.iconBg, opacity: isCompleted ? 0.6 : 1 }]}>
                        <Text style={[styles.setNum, { color: colors.textSub }]}>Set {idx + 1}</Text>
                        <View style={styles.setInputs}>
                          <Text style={[styles.setVal, { color: isCompleted ? colors.textSub : colors.text }]}>
                            {isCompleted ? completedSet.weight : '-'} kg
                          </Text>
                          <Text style={[styles.setVal, { color: isCompleted ? colors.textSub : colors.text }]}>
                            x {isCompleted ? completedSet.reps : '-'}
                          </Text>
                        </View>
                        {isCompleted && <CheckCircle2 color="#00AAFF" size={20} />}
                      </View>
                    );
                  }

                  // Aktif Antrenman Görünümü
                  return (
                    <View key={idx} style={[styles.setRowActive, { backgroundColor: isCompleted ? 'rgba(0,170,255,0.1)' : colors.background, borderColor: colors.border }]}>
                      <Text style={[styles.setNumActive, { color: colors.textSub, width: 45 }]}>Set {idx + 1}</Text>
                      
                      <View style={styles.activeInputsWrap}>
                        <View style={[styles.activeInputBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                          <TextInput 
                            style={[styles.activeInput, { color: colors.text }]}
                            placeholder="0"
                            placeholderTextColor={colors.textSub}
                            keyboardType="numeric"
                            value={isCompleted ? String(completedSet.weight) : inputValues[`${item.ex}_${idx}_w`]}
                            onChangeText={(val) => setInputValues(p => ({ ...p, [`${item.ex}_${idx}_w`]: val }))}
                            editable={!isCompleted}
                          />
                          <Text style={[styles.activeInputLabel, { color: colors.textSub }]}>kg</Text>
                        </View>

                        <View style={[styles.activeInputBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                          <TextInput 
                            style={[styles.activeInput, { color: colors.text }]}
                            placeholder="0"
                            placeholderTextColor={colors.textSub}
                            keyboardType="numeric"
                            value={isCompleted ? String(completedSet.reps) : inputValues[`${item.ex}_${idx}_r`]}
                            onChangeText={(val) => setInputValues(p => ({ ...p, [`${item.ex}_${idx}_r`]: val }))}
                            editable={!isCompleted}
                          />
                          <Text style={[styles.activeInputLabel, { color: colors.textSub }]}>tkr</Text>
                        </View>
                      </View>

                      {!isCompleted ? (
                        <TouchableOpacity style={[styles.checkBtn, { backgroundColor: '#00AAFF' }]} onPress={() => handleCompleteSet(item.ex, idx, item.reps, exInfo.defaultRestSec)}>
                          <CheckCircle2 color="#FFF" size={20} />
                        </TouchableOpacity>
                      ) : (
                        <View style={[styles.checkBtn, { backgroundColor: 'transparent' }]}>
                          <CheckCircle2 color="#00AAFF" size={24} />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </FadeInDown>
          );
        })}

        {isWorkoutActive && (
           <Pressable style={styles.endWorkoutBtn} onPress={endWorkout}>
             <Square color="#FFF" size={20} fill="#FFF" />
             <Text style={styles.endWorkoutBtnText}>Antrenmanı Bitir</Text>
           </Pressable>
        )}
      </ScrollView>

      {renderProgramSelection()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, fontWeight: '600', color: '#00AAFF', marginTop: 4 },
  changeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  changeBtnText: { fontSize: 13, fontWeight: '700' },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  timerText: { fontSize: 16, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 100 },
  
  todayCard: { padding: 20, borderRadius: 20, marginBottom: 24, borderWidth: 1 },
  todayHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  todayTitle: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  todayFocus: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  todaySub: { fontSize: 15 },
  startWorkoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#00AAFF', padding: 16, borderRadius: 16, marginTop: 20 },
  startWorkoutBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  endWorkoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FF3B3B', padding: 16, borderRadius: 16, marginTop: 12, marginBottom: 40 },
  endWorkoutBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },

  restBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 16, gap: 12 },
  restBannerText: { flex: 1, color: '#FFF', fontSize: 16, fontWeight: '700' },
  restSkipBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  restSkipBtnText: { color: '#FFF', fontWeight: '700' },

  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16 },
  
  exCard: { borderWidth: 1, padding: 16, borderRadius: 20, marginBottom: 16 },
  exHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  exName: { fontSize: 18, fontWeight: '700' },
  exTarget: { fontSize: 14, marginTop: 4 },
  
  setsContainer: { gap: 8, marginBottom: 8 },
  setRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 12 },
  setNum: { fontSize: 15, fontWeight: '600' },
  setInputs: { flexDirection: 'row', gap: 16 },
  setVal: { fontSize: 16, fontWeight: '700' },
  
  setRowActive: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, gap: 12 },
  setNumActive: { fontSize: 14, fontWeight: '700' },
  activeInputsWrap: { flex: 1, flexDirection: 'row', gap: 12 },
  activeInputBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, height: 40 },
  activeInput: { flex: 1, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  activeInputLabel: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
  checkBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  modalContainer: { flex: 1 },
  modalTitle: { fontSize: 24, fontWeight: '800', padding: 20, paddingBottom: 0 },
  progCard: { borderWidth: 1, padding: 20, borderRadius: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  progHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progName: { fontSize: 18, fontWeight: '800' },
  progBadge: { backgroundColor: 'rgba(0, 170, 255, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  progBadgeText: { color: '#00AAFF', fontSize: 12, fontWeight: '700' },
  progDesc: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  progFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progFreqRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progFreq: { fontSize: 13, fontWeight: '600' },
  cancelBtn: { padding: 16, alignItems: 'center', marginTop: 16 },
  cancelBtnText: { color: '#FF3B3B', fontSize: 16, fontWeight: '700' },

  wizardBtn: { flexDirection: 'row', backgroundColor: 'rgba(0,170,255,0.1)', borderWidth: 1, borderColor: '#00AAFF', padding: 20, borderRadius: 20, marginBottom: 24, alignItems: 'center', gap: 16 },
  wizardBtnIconWrap: { backgroundColor: 'rgba(0,170,255,0.2)', padding: 12, borderRadius: 16 },
  wizardBtnText: { color: '#00AAFF', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  wizardBtnSubText: { color: '#00AAFF', fontSize: 13, opacity: 0.8 },
  
  wizardContainer: { flex: 1, padding: 20 },
  wizardTitle: { fontSize: 24, fontWeight: '800', marginBottom: 24, marginTop: 20 },
  wizardOption: { borderWidth: 2, padding: 16, borderRadius: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wizardOptionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  wizardIconBox: { padding: 10, borderRadius: 12 },
  wizardOptionSelected: { borderColor: '#FF6B35', backgroundColor: 'rgba(255,107,53,0.05)' },
  wizardOptionText: { fontSize: 18, fontWeight: '600' },
  wizardOptionTextSelected: { color: '#FF6B35', fontWeight: '800' },
  wizardRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#555' },
  wizardRadioSelected: { borderColor: '#FF6B35', backgroundColor: '#FF6B35', borderWidth: 6 },
  wizardPrimaryBtn: { backgroundColor: '#FF6B35', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 20, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  wizardPrimaryBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  wizardSecondaryBtn: { backgroundColor: 'transparent', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: '#333' },
  wizardSecondaryBtnText: { color: '#888', fontSize: 16, fontWeight: '700' },

  // Exercise Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  exModalContent: { height: '85%', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, borderWidth: 1, borderBottomWidth: 0 },
  closeIconBtn: { position: 'absolute', right: 24, top: 24, zIndex: 10, padding: 8, borderRadius: 16 },
  exModalTitle: { fontSize: 26, fontWeight: '800', marginBottom: 8, paddingRight: 40 },
  exModalBadges: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  exModalSubtitle: { fontSize: 16, fontWeight: '700' },
  bodyMapContainer: { flexDirection: 'row', paddingVertical: 16, borderRadius: 20, borderWidth: 1, justifyContent: 'space-around', alignItems: 'center' },
  bodyMapHalf: { alignItems: 'center', flex: 1 },
  bodyMapLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  legendContainer: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, fontWeight: '600' },
  tipsHeader: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  tipBullet: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  tipText: { fontSize: 15, flex: 1, lineHeight: 22 },

  // Custom Builder Styles
  inputWrapper: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, marginBottom: 16 },
  textInput: { height: 50, fontSize: 16, fontWeight: '600' },
  emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderRadius: 20 },
  emptyStateText: { fontSize: 16, marginTop: 12, fontWeight: '600' },
  customExCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  smallInput: { borderWidth: 1, borderColor: 'transparent', borderRadius: 8, width: 48, height: 36, textAlign: 'center', fontSize: 15, fontWeight: '700' },
  addExBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderWidth: 1, borderStyle: 'dashed', borderRadius: 16, gap: 10, marginTop: 10, marginBottom: 40 },
  addExBtnText: { color: '#00AAFF', fontSize: 16, fontWeight: '700' },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, marginBottom: 16, gap: 12 },
  searchInput: { flex: 1, height: 50, fontSize: 16 },
  pickerItem: { padding: 16, borderWidth: 1, borderRadius: 16, marginBottom: 12 },
  pickerItemName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  pickerItemCat: { fontSize: 13 },
});
