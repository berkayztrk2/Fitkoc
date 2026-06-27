import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Modal, Animated, Image, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { Hourglass, Droplet, Flame, TrendingUp, ChevronRight, Zap, ChefHat, Moon, Bot, X, Send, Lightbulb, Dumbbell, Trash2, Camera } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import RecipeGenerator from '../../components/RecipeGenerator';
import FadeInDown from '../../components/FadeInDown';

const { width } = Dimensions.get('window');

const mealCategories = [
  { key: 'Sabah', title: 'Sabah (Kahvaltı)', icon: '🍳' },
  { key: 'Öğle', title: 'Öğle Yemeği', icon: '🍗' },
  { key: 'Akşam', title: 'Akşam Yemeği', icon: '🥗' },
  { key: 'Ara Öğün', title: 'Ara Öğün', icon: '🍎' }
];

function SkeletonLoader() {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View>
          <Animated.View style={[styles.skeletonBlock, { backgroundColor: colors.border, width: 60, height: 16, marginBottom: 8, opacity: fadeAnim }]} />
          <Animated.View style={[styles.skeletonBlock, { backgroundColor: colors.border, width: 120, height: 32, opacity: fadeAnim }]} />
        </View>
        <Animated.View style={[styles.skeletonBlock, { backgroundColor: colors.border, width: 44, height: 44, borderRadius: 22, opacity: fadeAnim }]} />
      </View>
      <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 130 : 100 }} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.card, { height: 250, opacity: fadeAnim, backgroundColor: colors.card, borderColor: 'transparent' }]} />
        <Animated.View style={[styles.card, { height: 80, opacity: fadeAnim, backgroundColor: colors.card, borderColor: 'transparent' }]} />
      </ScrollView>
    </SafeAreaView>
  );
}

function CalorieRing({ consumed, target, size = 120, strokeWidth = 10 }) {
  const { colors } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circum = radius * 2 * Math.PI;
  const percent = Math.min(consumed / target, 1);
  const offset = circum - percent * circum;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <Circle stroke={colors.border} fill="none" cx={size/2} cy={size/2} r={radius} strokeWidth={strokeWidth} />
        <Circle 
          stroke="#FF6B35" 
          fill="none" 
          cx={size/2} 
          cy={size/2} 
          r={radius} 
          strokeWidth={strokeWidth} 
          strokeDasharray={`${circum} ${circum}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      </Svg>
      <View style={styles.ringInner}>
        <Flame size={24} color="#FF6B35" />
      </View>
    </View>
  );
}

function MacroBar({ label, current, target, color }) {
  const { colors } = useTheme();
  const percent = Math.min((current / target) * 100, 100);
  return (
    <View style={styles.macroContainer}>
      <View style={styles.macroHeader}>
        <Text style={[styles.macroLabel, { color: colors.textSub }]}>{label}</Text>
        <Text style={[styles.macroValue, { color: colors.text }]}>{current} <Text style={{color: colors.textSub}}>/ {target}g</Text></Text>
      </View>
      <View style={[styles.macroTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.macroFill, { backgroundColor: color, width: `${percent}%` }]} />
      </View>
    </View>
  );
}

export default function HomeDashboard() {
  const router = useRouter();
  const { profile, derived, consumed, meals, addMeal, removeMeal, waterMl, burnedCal, addWater, resetWater } = useUser();
  const { colors } = useTheme();

  const [showTimeMachine, setShowTimeMachine] = useState(false);
  const [timeMachineMonths, setTimeMachineMonths] = useState(3);
  const [showRecipeGen, setShowRecipeGen] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);

  // Manual Meal State
  const [mealName, setMealName] = useState('');
  const [mealCal, setMealCal] = useState('');
  const [mealPro, setMealPro] = useState('');
  const [mealCarb, setMealCarb] = useState('');
  const [mealFat, setMealFat] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('Sabah');

  const handleOpenMealModal = (type) => {
    setSelectedMealType(type);
    setShowMealModal(true);
  };

  const categoryMeals = (key) => meals.filter(m => (m.type === key) || (!m.type && key === 'Ara Öğün'));
  const categoryCalories = (key) => categoryMeals(key).reduce((sum, m) => sum + (m.calories || 0), 0);

  if (!profile || !derived) {
    return <SkeletonLoader />;
  }

  const { targetCal, macros, water, goalInfo } = derived;
  const waterL = (waterMl / 1000).toFixed(1);
  const waterFilled = Math.round(waterMl / (water * 1000 / 7));
  const remaining = Math.max(0, targetCal - consumed.calories);

  // 1 kg yağ yaklaşık 7700 kaloridir.
  const dailyDeficit = targetCal - derived.tdee;
  const weightChangePerMonth = (dailyDeficit * 30) / 7700;
  const projectedWeight = profile.weightKg + (weightChangePerMonth * timeMachineMonths);

  const handleSaveMeal = () => {
    if(!mealName || !mealCal) return;
    addMeal({
      name: mealName,
      calories: parseInt(mealCal, 10) || 0,
      protein: parseInt(mealPro, 10) || 0,
      carbs: parseInt(mealCarb, 10) || 0,
      fat: parseInt(mealFat, 10) || 0,
      type: selectedMealType,
    });
    setMealName('');
    setMealCal('');
    setMealPro('');
    setMealCarb('');
    setMealFat('');
    setShowMealModal(false);
  };

  const MealRow = ({ id, icon, name, sub, cal }) => (
    <View style={[styles.mealRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.mealIconBg, { backgroundColor: colors.iconBg }]}>
        <Text style={styles.mealIconText}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.mealName, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.mealSub, { color: colors.textSub }]}>{sub}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.mealCal, { color: colors.text }]}>{cal} <Text style={{fontSize: 11, color: colors.textSub}}>kal</Text></Text>
        <Pressable onPress={() => removeMeal(id)} style={{ padding: 4, marginTop: 4 }}>
          <Trash2 size={16} color="#FF3B3B" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View>
          <Text style={[styles.dateLabel, { color: colors.textSub }]}>BUGÜN</Text>
          <Text style={[styles.greeting, { color: colors.text }]}>Merhaba</Text>
        </View>
        <Pressable style={[styles.profileBtn, { backgroundColor: colors.iconBg, overflow: 'hidden' }]} onPress={() => router.push('/profile')}>
          {profile.avatarUri ? (
            <Image source={{ uri: profile.avatarUri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
          ) : (
            <Text style={{ fontSize: 18 }}>👤</Text>
          )}
        </Pressable>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 130 : 100 }} showsVerticalScrollIndicator={false}>
        
        <FadeInDown index={0} style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.textSub }]}>GÜNLÜK KALORİ</Text>
          <View style={styles.calorieRow}>
            <View>
              <Text style={[styles.calorieCurrent, { color: colors.text }]}>{consumed.calories.toLocaleString('tr-TR')}</Text>
              <Text style={[styles.calorieTarget, { color: colors.textSub }]}>/ {targetCal.toLocaleString('tr-TR')} kalori</Text>
            </View>
            <CalorieRing consumed={consumed.calories} target={targetCal} size={110} />
          </View>
          
          <MacroBar label="Protein" current={consumed.protein} target={macros.protein} color="#00AAFF" />
          <MacroBar label="Karbonhidrat" current={consumed.carbs} target={macros.carbs} color="#FF6B35" />
          <MacroBar label="Yağ" current={consumed.fat} target={macros.fat} color="#FF3B3B" />
        </FadeInDown>

        <FadeInDown index={1}>
          <Pressable style={[styles.timeMachineBanner, { backgroundColor: colors.card }]} onPress={() => setShowTimeMachine(true)}>
            <View style={styles.timeMachineLeft}>
              <View style={[styles.timeMachineIconBg, { backgroundColor: 'rgba(0,170,255,0.1)' }]}>
                <Hourglass size={24} color="#00AAFF" />
              </View>
              <View>
                <Text style={[styles.timeMachineTitle, { color: colors.text }]}>FitKoç Zaman Makinesi</Text>
                <Text style={[styles.timeMachineSub, { color: colors.textSub }]}>Gelecekteki fiziğini gör ⏳</Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textSub} />
          </Pressable>
        </FadeInDown>

        <FadeInDown index={2} style={styles.statsRow}>
          <View style={[styles.card, styles.statCard, { backgroundColor: colors.card }]}>
            <View style={styles.statLabelRow}>
              <Droplet size={14} color="#00AAFF" />
              <Text style={[styles.statLabelText, { color: colors.textSub }]}>SU</Text>
            </View>
            <Text style={[styles.statValue, { color: '#00AAFF' }]}>{waterL} L</Text>
            <Text style={[styles.statSub, { color: colors.textSub }]}>/ {water}L hedef</Text>
            
            <View style={styles.waterDots}>
              {Array.from({ length: 7 }).map((_, i) => (
                <View key={i} style={[styles.waterDot, { backgroundColor: i < waterFilled ? '#00AAFF' : colors.border }]} />
              ))}
            </View>
            
            <View style={styles.waterButtons}>
              <Pressable style={[styles.waterBtn, { backgroundColor: colors.iconBg }]} onPress={() => addWater(250)}>
                <Text style={[styles.waterBtnText, { color: colors.text }]}>+250</Text>
              </Pressable>
              <Pressable style={[styles.waterBtn, { backgroundColor: colors.iconBg }]} onPress={() => addWater(500)}>
                <Text style={[styles.waterBtnText, { color: colors.text }]}>+500</Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.card, styles.statCard, { backgroundColor: colors.card }]}>
            <View style={styles.statLabelRow}>
              <Flame size={14} color="#FF6B35" />
              <Text style={[styles.statLabelText, { color: colors.textSub }]}>YAKILAN</Text>
            </View>
            <Text style={[styles.statValue, { color: '#FF6B35' }]}>{burnedCal}</Text>
            <Text style={[styles.statSub, { color: colors.textSub }]}>kal · antrenman</Text>
            
            <View style={[styles.pill, { backgroundColor: 'rgba(255,107,53,0.1)' }]}>
              <TrendingUp size={12} color="#FF6B35" />
              <Text style={[styles.pillText, { color: '#FF6B35' }]}>{goalInfo.adjust >= 0 ? '+' : ''}{goalInfo.adjust} kal</Text>
            </View>
            
            <Text style={[styles.bmiText, { color: colors.textSub }]}>BKİ {derived.bmi.toFixed(1)} · {derived.cat.label}</Text>
          </View>
        </FadeInDown>

        <FadeInDown index={3} style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 16 }]}>Bugünkü Öğünler</Text>
          
          {mealCategories.map((cat) => {
            const items = categoryMeals(cat.key);
            const calTotal = categoryCalories(cat.key);
            return (
              <View key={cat.key} style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 18 }}>{cat.icon}</Text>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{cat.title}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {calTotal > 0 && (
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSub }}>{calTotal} kcal</Text>
                    )}
                    <Pressable 
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(0,170,255,0.1)' }}
                      onPress={() => handleOpenMealModal(cat.key)}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#00AAFF' }}>+ Ekle</Text>
                    </Pressable>
                  </View>
                </View>

                {items.length === 0 ? (
                  <Pressable 
                    onPress={() => handleOpenMealModal(cat.key)}
                    style={{ 
                      padding: 12, 
                      borderRadius: 12, 
                      borderWidth: 1, 
                      borderColor: colors.border, 
                      borderStyle: 'dashed', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: 'transparent'
                    }}
                  >
                    <Text style={{ fontSize: 13, color: colors.textSub }}>+ Yemek Ekle</Text>
                  </Pressable>
                ) : (
                  items.map((m) => (
                    <MealRow 
                      key={m.id} 
                      id={m.id}
                      icon="🍽️" 
                      name={m.name} 
                      sub={`${m.protein || 0}g P | ${m.carbs || 0}g K | ${m.fat || 0}g Y`} 
                      cal={m.calories} 
                    />
                  ))
                )}
              </View>
            );
          })}

          <View style={[styles.remainingBox, { backgroundColor: colors.iconBg, marginTop: 10 }]}>
            <View style={[styles.remainingIconBg, { backgroundColor: colors.card }]}>
              <Moon size={20} color={colors.textSub} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.remainingTitle, { color: colors.text }]}>Kalan Kalori</Text>
              <Text style={[styles.remainingSub, { color: colors.textSub }]}>{remaining.toLocaleString('tr-TR')} kalori hakkın var</Text>
            </View>
            <Pressable style={[styles.remainingAddBtn, { backgroundColor: colors.text }]} onPress={() => handleOpenMealModal('Ara Öğün')}>
              <Text style={[styles.remainingAddBtnText, { color: colors.card }]}>Ekle</Text>
            </Pressable>
          </View>
        </FadeInDown>

        <FadeInDown index={4}>
          <Pressable style={[styles.aiWidget, { backgroundColor: colors.card, borderColor: colors.border, overflow: 'hidden' }]} onPress={() => router.push('/workout')}>
            <View style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1 }}>
              <Dumbbell size={140} color="#FF6B35" />
            </View>
            <View style={[styles.aiWidgetIcon, { backgroundColor: 'rgba(255, 107, 53, 0.15)' }]}>
              <Zap size={24} color="#FF6B35" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.aiWidgetTitle, { color: colors.text }]}>Günün Antrenmanını Kur</Text>
              <Text style={[styles.aiWidgetSub, { color: colors.textSub }]}>Hedefine ve formuna en uygun programı şimdi AI ile oluştur.</Text>
            </View>
          </Pressable>
        </FadeInDown>

        <FadeInDown index={5}>
          <Pressable style={[styles.aiWidget, { backgroundColor: colors.card, borderColor: colors.border, overflow: 'hidden' }]} onPress={() => setShowRecipeGen(true)}>
            <View style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1 }}>
              <ChefHat size={140} color="#9B51E0" />
            </View>
            <View style={[styles.aiWidgetIcon, { backgroundColor: 'rgba(155, 81, 224, 0.15)' }]}>
              <ChefHat size={24} color="#9B51E0" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.aiWidgetTitle, { color: colors.text }]}>AI Öğün Planlayıcı</Text>
              <Text style={[styles.aiWidgetSub, { color: colors.textSub }]}>Sevdiğin yiyeceklerle, kalori hedefine uygun nefis öğünler yarat.</Text>
            </View>
          </Pressable>
        </FadeInDown>
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => router.push('/chat')}>
        <Bot size={32} color="#FFF" />
        <View style={styles.fabBadge} />
      </Pressable>

      <RecipeGenerator visible={showRecipeGen} onClose={() => setShowRecipeGen(false)} />

      {/* MANUAL MEAL MODAL */}
      <Modal visible={showMealModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.mealModalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={[styles.modalTitle, { color: colors.text, padding: 0, marginBottom: 0 }]}>Öğün Ekle</Text>
              <Pressable onPress={() => setShowMealModal(false)} style={{ padding: 4 }}>
                <X size={24} color={colors.textSub} />
              </Pressable>
            </View>

            <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 }}>ÖĞÜN TÜRÜ</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
              {mealCategories.map(cat => (
                <Pressable 
                  key={cat.key} 
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: selectedMealType === cat.key ? '#FF6B35' : colors.iconBg,
                    borderWidth: 1,
                    borderColor: selectedMealType === cat.key ? '#FF6B35' : colors.border,
                    alignItems: 'center'
                  }}
                  onPress={() => setSelectedMealType(cat.key)}
                >
                  <Text style={{ color: selectedMealType === cat.key ? '#FFF' : colors.textSub, fontSize: 12, fontWeight: '700' }}>
                    {cat.key}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={[styles.mealInputBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput style={[styles.mealInput, { color: colors.text }]} placeholder="Yemek Adı (Örn: Tavuklu Pilav)" placeholderTextColor={colors.textSub} value={mealName} onChangeText={setMealName} />
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <View style={[styles.mealInputBox, { flex: 1, backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput style={[styles.mealInput, { color: colors.text }]} placeholder="Kalori" placeholderTextColor={colors.textSub} keyboardType="numeric" value={mealCal} onChangeText={setMealCal} />
              </View>
              <View style={[styles.mealInputBox, { flex: 1, backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput style={[styles.mealInput, { color: colors.text }]} placeholder="Protein (g)" placeholderTextColor={colors.textSub} keyboardType="numeric" value={mealPro} onChangeText={setMealPro} />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <View style={[styles.mealInputBox, { flex: 1, backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput style={[styles.mealInput, { color: colors.text }]} placeholder="Karb (g)" placeholderTextColor={colors.textSub} keyboardType="numeric" value={mealCarb} onChangeText={setMealCarb} />
              </View>
              <View style={[styles.mealInputBox, { flex: 1, backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput style={[styles.mealInput, { color: colors.text }]} placeholder="Yağ (g)" placeholderTextColor={colors.textSub} keyboardType="numeric" value={mealFat} onChangeText={setMealFat} />
              </View>
            </View>

            <Pressable style={styles.primaryBtn} onPress={handleSaveMeal}>
              <Text style={styles.primaryBtnText}>Manuel Kaydet</Text>
            </Pressable>

            <Text style={{ textAlign: 'center', marginVertical: 12, color: colors.textSub, fontWeight: '600' }}>VEYA</Text>

            <Pressable style={styles.aiBtn} onPress={() => { setShowMealModal(false); router.push(`/(tabs)/analyze?type=${selectedMealType}`); }}>
              <Camera size={20} color="#FFF" />
              <Text style={styles.aiBtnText}>Kamera ile AI Taraması Yap</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* TIME MACHINE MODAL */}
      <Modal visible={showTimeMachine} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Pressable style={styles.modalClose} onPress={() => setShowTimeMachine(false)}>
              <X size={24} color={colors.textSub} />
            </Pressable>
            <View style={styles.modalIconBg}>
              <Hourglass size={32} color="#00AAFF" />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Zaman Makinesi</Text>
            <Text style={styles.modalSub}>Gelecekteki fiziğine göz at</Text>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              {[1, 3, 6].map(m => (
                <Pressable 
                  key={m} 
                  style={[styles.timeOptionBtn, { backgroundColor: colors.iconBg, borderColor: colors.border }, timeMachineMonths === m && styles.timeOptionBtnActive]}
                  onPress={() => setTimeMachineMonths(m)}
                >
                  <Text style={[styles.timeOptionText, { color: colors.textSub }, timeMachineMonths === m && styles.timeOptionTextActive]}>
                    {m} Ay
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={[styles.modalInfoBox, { backgroundColor: colors.iconBg }]}>
              <Text style={[styles.modalInfoText, { color: colors.text }]}>
                Bu kalori ({targetCal} kcal) ile devam edersen <Text style={{fontWeight: '800', color: colors.text}}>{timeMachineMonths} ay</Text> sonraki ağırlığın yaklaşık 
                <Text style={{color: '#00AAFF', fontWeight: 'bold'}}> {projectedWeight.toFixed(1)} kg</Text> olacak.
              </Text>
              {Math.abs(targetCal - derived.tdee) < 50 && (
                <Text style={{fontSize: 13, color: '#FF6B35', marginTop: 12, textAlign: 'center', fontWeight: '600'}}>
                  💡 Şu anki hedefin "Kilo Koruma" olduğu için aylara göre kilon değişmeyecektir. Kilo vermek istiyorsan Profil'den hedefini değiştir!
                </Text>
              )}
            </View>

            <Pressable style={styles.modalBtn} onPress={() => setShowTimeMachine(false)}>
              <Text style={styles.modalBtnText}>Tamam</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skeletonBlock: { backgroundColor: '#E5E5EA', borderRadius: 8 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5EA'
  },
  dateLabel: { color: '#FF6B35', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  greeting: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  profileBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  
  card: {
    borderRadius: 24, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2
  },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 16 },
  calorieRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  calorieCurrent: { fontSize: 48, fontWeight: '800', letterSpacing: -1, lineHeight: 52 },
  calorieTarget: { fontSize: 15, fontWeight: '600', marginTop: 4 },
  
  macroContainer: { marginBottom: 12 },
  macroHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  macroLabel: { fontSize: 13, fontWeight: '600' },
  macroValue: { fontSize: 13, fontWeight: '700' },
  macroTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  macroFill: { height: '100%', borderRadius: 3 },
  ringInner: { position: 'absolute' },

  timeMachineBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20, padding: 16, marginBottom: 16,
  },
  timeMachineLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  timeMachineIconBg: { padding: 12, borderRadius: 16 },
  timeMachineTitle: { fontSize: 16, fontWeight: '700' },
  timeMachineSub: { fontSize: 13, marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, padding: 16, marginBottom: 0 },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  statLabelText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  statSub: { fontSize: 12 },
  
  waterDots: { flexDirection: 'row', gap: 4, marginTop: 12 },
  waterDot: { flex: 1, height: 6, borderRadius: 3 },
  waterButtons: { flexDirection: 'row', gap: 8, marginTop: 12 },
  waterBtn: { flex: 1, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#00AAFF', alignItems: 'center' },
  waterBtnText: { fontSize: 12, fontWeight: '700' },

  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 12 },
  pillText: { fontSize: 12, fontWeight: '700' },
  bmiText: { fontSize: 12, marginTop: 12 },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  addBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { fontSize: 13, fontWeight: '700' },

  mealRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  mealIconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  mealIconText: { fontSize: 20 },
  mealName: { fontSize: 16, fontWeight: '600' },
  mealSub: { fontSize: 13, marginTop: 2 },
  mealCal: { fontSize: 16, fontWeight: '700' },

  remainingBox: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginTop: 16 },
  remainingIconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  remainingTitle: { fontSize: 16, fontWeight: '600' },
  remainingSub: { fontSize: 13, marginTop: 2 },
  remainingAddBtn: { borderWidth: 1, borderColor: 'transparent', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  remainingAddBtnText: { fontSize: 13, fontWeight: '600' },

  aiWidget: { borderWidth: 1, borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  aiWidgetIcon: { padding: 16, borderRadius: 20, marginRight: 16 },
  aiWidgetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  aiWidgetSub: { fontSize: 13, lineHeight: 20, paddingRight: 20 },

  tipCard: { borderWidth: 1, borderColor: '#FF6B35', borderRadius: 24, padding: 20, marginBottom: 40 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  tipTitle: { color: '#FF6B35', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  tipText: { color: '#CCC', fontSize: 14, lineHeight: 22 },

  fab: {
    position: 'absolute', bottom: 100, right: 24, width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10
  },
  fabBadge: { position: 'absolute', top: 0, right: 0, width: 16, height: 16, backgroundColor: '#FF3B3B', borderRadius: 8, borderWidth: 3, borderColor: '#FFF' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  modalClose: { position: 'absolute', top: 24, right: 24, padding: 8 },
  modalIconBg: { backgroundColor: 'rgba(0, 170, 255, 0.15)', padding: 16, borderRadius: 32, marginBottom: 16 },
  modalTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  modalSub: { color: '#00AAFF', fontSize: 14, fontWeight: '600', marginBottom: 24 },
  
  timeOptionBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1 },
  timeOptionBtnActive: { backgroundColor: '#00AAFF', borderColor: '#00AAFF' },
  timeOptionText: { fontSize: 14, fontWeight: '600' },
  timeOptionTextActive: { color: '#FFF' },

  modalInfoBox: { padding: 20, borderRadius: 16, width: '100%', marginBottom: 24 },
  modalInfoText: { fontSize: 15, lineHeight: 24, textAlign: 'center' },
  modalBtn: { backgroundColor: '#00AAFF', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 32, width: '100%', alignItems: 'center' },
  modalBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  // Meal Modal
  mealModalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, borderWidth: 1 },
  mealInputBox: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, height: 50, justifyContent: 'center', marginBottom: 12 },
  mealInput: { fontSize: 16, fontWeight: '600', height: '100%' },
  primaryBtn: { backgroundColor: '#00AAFF', padding: 16, borderRadius: 16, alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  aiBtn: { backgroundColor: '#FF6B35', padding: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
  aiBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});
