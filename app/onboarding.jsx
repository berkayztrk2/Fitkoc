import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Dimensions, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight, Check, Flame, Scale, TrendingUp, Dumbbell, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { calcBMI, bmiCategory, calcBMR, calcTDEE, targetCalories, calcMacros, idealWeightRange, GOALS, GOAL_UI } from '../lib/calc';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 7;

import SimpleSliderPicker from '../components/SimpleSliderPicker';

// Min and Max values for our slider pickers
const HEIGHT_MIN = 120;
const HEIGHT_MAX = 220;
const WEIGHT_MIN = 40;
const WEIGHT_MAX = 190;
const AGE_MIN = 14;
const AGE_MAX = 84;

// Giriş ekranı adımları arası yumuşak yatay kayma (Slide) geçiş animasyonu
function StepTransition({ children, step, prevStep }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isForward = step >= prevStep;
  const slideAnim = useRef(new Animated.Value(isForward ? 40 : -40)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(isForward ? 40 : -40);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 45,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [step]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }], flex: 1 }}>
      {children}
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding, logout } = useUser();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [step, setStep] = useState(1);
  const [prevStep, setPrevStep] = useState(1);
  const [form, setForm] = useState({
    gender: 'male', heightCm: 175, weightKg: 72, age: 25,
    activity: 'moderate', goal: null,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  const bmi = calcBMI(form.heightCm, form.weightKg);
  const cat = bmiCategory(bmi);
  const bmr = calcBMR(form);
  const tdee = calcTDEE(bmr, form.activity);
  const targetCal = form.goal ? targetCalories(tdee, form.goal) : tdee;
  const macros = form.goal ? calcMacros(targetCal, form.weightKg, form.goal) : null;
  const ideal = idealWeightRange(form.heightCm);

  const finish = () => {
    completeOnboarding({ ...form, goalLabel: GOALS[form.goal]?.label || 'Kilo Koru' });
    router.replace('/(tabs)');
  };

  const nextStep = (current) => {
    setPrevStep(current);
    setStep(current + 1);
  };

  const prevStepAction = () => {
    setPrevStep(step);
    setStep(s => s - 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER PROGRESS */}
      <View style={styles.header}>
        {step > 1 ? (
          <Pressable style={styles.backBtn} onPress={prevStepAction}>
            <ArrowLeft size={24} color={colors.text} />
          </Pressable>
        ) : (
          <Pressable style={styles.backBtn} onPress={() => { logout(); router.replace('/auth'); }}>
            <ArrowLeft size={24} color={colors.text} />
          </Pressable>
        )}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <StepTransition step={step} prevStep={prevStep}>
            {step === 1 && <StepGender form={form} set={set} onNext={() => nextStep(1)} />}
            {step === 2 && <StepHeight form={form} set={set} onNext={() => nextStep(2)} />}
            {step === 3 && <StepWeight form={form} set={set} onNext={() => nextStep(3)} />}
            {step === 4 && <StepAge form={form} set={set} onNext={() => nextStep(4)} />}
            {step === 5 && <StepActivity form={form} set={set} onNext={() => nextStep(5)} />}
            {step === 6 && <StepGoal form={form} set={set} onNext={() => nextStep(6)} />}
            {step === 7 && (
              <StepResult form={form} bmi={bmi} cat={cat} targetCal={targetCal} macros={macros} ideal={ideal} onFinish={finish} />
            )}
          </StepTransition>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StepGender({ form, set, onNext }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Cinsiyetin nedir?</Text>
      <Text style={styles.subtitle}>Kalori ve makro hesaplamaları için cinsiyet bilgisine ihtiyacımız var.</Text>
      
      <View style={{ gap: 16, marginTop: 32 }}>
        <Choice label="Erkek" active={form.gender === 'male'} onPress={() => set('gender', 'male')} />
        <Choice label="Kadın" active={form.gender === 'female'} onPress={() => set('gender', 'female')} />
      </View>
      <NextButton onPress={onNext} />
    </View>
  );
}

function StepHeight({ form, set, onNext }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Boyun kaç cm?</Text>
      <Text style={styles.subtitle}>Vücut kitle indeksini hesaplamak için boyunu bilmeliyiz.</Text>

      <View style={{ marginTop: 32, marginBottom: 16 }}>
        <SimpleSliderPicker
          min={HEIGHT_MIN}
          max={HEIGHT_MAX}
          selectedValue={form.heightCm}
          onValueChange={(val) => set('heightCm', val)}
          suffix="cm"
          textColor={colors.text}
        />
      </View>
      <NextButton onPress={onNext} />
    </View>
  );
}

function StepWeight({ form, set, onNext }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Kilon ne kadar?</Text>
      <Text style={styles.subtitle}>Sana özel kalori hedefini belirlemek için güncel kilonu girmelisin.</Text>

      <View style={{ marginTop: 32, marginBottom: 16 }}>
        <SimpleSliderPicker
          min={WEIGHT_MIN}
          max={WEIGHT_MAX}
          selectedValue={form.weightKg}
          onValueChange={(val) => set('weightKg', val)}
          suffix="kg"
          textColor={colors.text}
        />
      </View>
      <NextButton onPress={onNext} />
    </View>
  );
}

function StepAge({ form, set, onNext }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Kaç yaşındasın?</Text>
      <Text style={styles.subtitle}>Metabolizma hızı yaşa göre değişiklik gösterir.</Text>

      <View style={{ marginTop: 32, marginBottom: 16 }}>
        <SimpleSliderPicker
          min={AGE_MIN}
          max={AGE_MAX}
          selectedValue={form.age}
          onValueChange={(val) => set('age', val)}
          suffix="yaş"
          textColor={colors.text}
        />
      </View>
      <NextButton onPress={onNext} />
    </View>
  );
}

function StepActivity({ form, set, onNext }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Günlük hareket seviyen?</Text>
      <Text style={styles.subtitle}>Gün içinde ne kadar hareketlisin?</Text>
      
      <View style={{ gap: 12, marginTop: 32 }}>
        <Choice label="Masa başı (Hareketsiz)" sub="Egzersiz yok, masa başı iş" active={form.activity === 'sedentary'} onPress={() => set('activity', 'sedentary')} />
        <Choice label="Hafif Hareketli" sub="Haftada 1-3 gün hafif egzersiz" active={form.activity === 'light'} onPress={() => set('activity', 'light')} />
        <Choice label="Orta Hareketli" sub="Haftada 3-5 gün egzersiz" active={form.activity === 'moderate'} onPress={() => set('activity', 'moderate')} />
        <Choice label="Çok Hareketli" sub="Haftada 6-7 gün ağır egzersiz" active={form.activity === 'active'} onPress={() => set('activity', 'active')} />
        <Choice label="Sporcu" sub="Günde 2 antrenman / ağır fiziksel iş" active={form.activity === 'athlete'} onPress={() => set('activity', 'athlete')} />
      </View>
      <NextButton onPress={onNext} />
    </View>
  );
}

function StepGoal({ form, set, onNext }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Uygulamadaki hedefin ne?</Text>
      <Text style={styles.subtitle}>Buna göre kalori ve makro programın özel olarak oluşturulacak.</Text>
      
      <View style={{ gap: 12, marginTop: 32 }}>
        <GoalChoice icon={Flame} color={GOAL_UI.lose.color} bg={GOAL_UI.lose.soft} label="Kilo Vermek" sub="Kalori açığı ile yağ yakımı" active={form.goal === 'lose'} onPress={() => set('goal', 'lose')} />
        <GoalChoice icon={Scale} color={GOAL_UI.maintain.color} bg={GOAL_UI.maintain.soft} label="Kilomu Korumak" sub="Güncel formunu muhafaza et" active={form.goal === 'maintain'} onPress={() => set('goal', 'maintain')} />
        <GoalChoice icon={TrendingUp} color={GOAL_UI.gain.color} bg={GOAL_UI.gain.soft} label="Kilo Almak" sub="Sağlıklı kilo artışı ve hacim" active={form.goal === 'gain'} onPress={() => set('goal', 'gain')} />
        <GoalChoice icon={Dumbbell} color={GOAL_UI.muscle.color} bg={GOAL_UI.muscle.soft} label="Kas Kazanmak" sub="Temiz büyüme (Clean bulk)" active={form.goal === 'muscle'} onPress={() => set('goal', 'muscle')} />
        <GoalChoice icon={Heart} color={GOAL_UI.healthy.color} bg={GOAL_UI.healthy.soft} label="Sağlıklı Beslenmek" sub="Genel sağlık ve zindelik" active={form.goal === 'healthy'} onPress={() => set('goal', 'healthy')} />
      </View>
      <NextButton onPress={onNext} disabled={!form.goal} />
    </View>
  );
}

function StepResult({ form, bmi, cat, targetCal, macros, ideal, onFinish }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.stepContainer}>
      <View style={{ alignItems: 'center', marginVertical: 32 }}>
        <Check size={64} color="#FF6B35" />
        <Text style={[styles.title, { textAlign: 'center', marginTop: 16 }]}>Her Şey Hazır!</Text>
        <Text style={[styles.subtitle, { textAlign: 'center' }]}>Sana özel planını oluşturduk.</Text>
      </View>

      <View style={styles.resultCard}>
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Günlük Kalori Hedefi:</Text>
          <Text style={styles.resultValue}>{targetCal} kalori</Text>
        </View>
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Vücut Kitle İndeksi (BKİ):</Text>
          <Text style={styles.resultValue}>{bmi.toFixed(1)} ({cat.label})</Text>
        </View>
        <View style={[styles.resultRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.resultLabel}>İdeal Kilo Aralığın:</Text>
          <Text style={styles.resultValue}>{ideal.min} - {ideal.max} kg</Text>
        </View>
      </View>

      <Pressable style={[styles.nextBtn, { marginTop: 32 }]} onPress={onFinish}>
        <Text style={styles.nextBtnText}>Hemen Başla</Text>
      </Pressable>
    </View>
  );
}

// Reusable Components
function Choice({ label, sub, active, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable style={[styles.choice, active && styles.choiceActive]} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.choiceLabel, active && styles.choiceLabelActive]}>{label}</Text>
        {sub && <Text style={styles.choiceSub}>{sub}</Text>}
      </View>
      <View style={[styles.radioBtn, active && styles.radioBtnActive]}>
        {active && <View style={styles.radioInner} />}
      </View>
    </Pressable>
  );
}

function GoalChoice({ icon: Icon, color, bg, label, sub, active, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable style={[styles.goalChoice, active && { borderColor: color, backgroundColor: bg }]} onPress={onPress}>
      <View style={[styles.goalIconWrap, { backgroundColor: active ? color : colors.iconBg }]}>
        <Icon size={24} color={active ? '#FFF' : colors.textSub} />
      </View>
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={[styles.choiceLabel, active && { color: color }]}>{label}</Text>
        <Text style={styles.choiceSub}>{sub}</Text>
      </View>
      <View style={[styles.radioBtn, active && { borderColor: color }]}>
        {active && <View style={[styles.radioInner, { backgroundColor: color }]} />}
      </View>
    </Pressable>
  );
}

function NextButton({ onPress, disabled }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable style={[styles.nextBtn, disabled && styles.nextBtnDisabled]} onPress={onPress} disabled={disabled}>
      <Text style={styles.nextBtnText}>Devam Et</Text>
      <ChevronRight color="#FFF" size={20} />
    </Pressable>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 60 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  progressBar: { flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3, marginHorizontal: 16, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FF6B35' },

  scrollContent: { padding: 24, paddingBottom: 64 },
  stepContainer: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.textSub, lineHeight: 22 },

  input: {
    fontSize: 48, fontWeight: '800', color: '#FF6B35', textAlign: 'center',
    marginTop: 48, paddingVertical: 16, borderBottomWidth: 2, borderBottomColor: '#FF6B35'
  },

  choice: {
    flexDirection: 'row', alignItems: 'center', padding: 20,
    borderWidth: 2, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.card
  },
  goalChoice: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderWidth: 2, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.card
  },
  goalIconWrap: {
    width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center'
  },
  choiceActive: { borderColor: '#FF6B35', backgroundColor: 'rgba(255,107,53,0.08)' },
  choiceLabel: { fontSize: 17, fontWeight: '700', color: colors.text },
  choiceLabelActive: { color: '#FF6B35' },
  choiceSub: { fontSize: 13, color: colors.textSub, marginTop: 4 },

  radioBtn: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  radioBtnActive: { borderColor: '#FF6B35' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF6B35' },

  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FF6B35', padding: 18, borderRadius: 32, marginTop: 48,
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
  },
  nextBtnDisabled: { backgroundColor: colors.border, shadowOpacity: 0 },
  nextBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700', marginRight: 8 },

  resultCard: { backgroundColor: colors.card, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  resultLabel: { fontSize: 15, color: colors.textSub, fontWeight: '500' },
  resultValue: { fontSize: 15, color: colors.text, fontWeight: '800' }
});
