import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, ScrollView, Alert, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'expo-router';
import { Settings, LogOut, Crown, Activity, Target, Moon, Sun, Smartphone, Watch, Medal, Dumbbell, Flame, CheckCircle, Star } from 'lucide-react-native';

import { WeeklyChart, MonthlyChart, WeightProgressChart, OneRMChart, HistoryCalendar, DayDetailSheet, WeekDetailSheet } from '../../components/StatsCharts';
import HeroMuscleMap from '../../components/HeroMuscleMap';
import PremiumModal from '../../components/PremiumModal';
import EditProfileModal from '../../components/EditProfileModal';
import RemindersModal from '../../components/RemindersModal';
import ApiKeyModal from '../../components/ApiKeyModal';
import FadeInDown from '../../components/FadeInDown';
import { Bell, KeyRound } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, derived, resetProfile, muscleXP, streak, unlockedBadges } = useUser();
  const { isDark, colors, themeMode, changeTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'hero'
  const [reportTab, setReportTab] = useState('weekly'); // 'weekly' | 'monthly' | 'weight' | '1rm' | 'calendar'
  const [showPremium, setShowPremium] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Modals for charts
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);

  const BADGE_CONFIG = [
    { id: 'streak_3', title: '3 Gün Seri', icon: Flame, color: '#FF6B35' },
    { id: 'streak_7', title: '7 Gün Seri', icon: Flame, color: '#FF3B3B' },
    { id: 'first_custom_program', title: 'İlk Özel Program', icon: Target, color: '#00AAFF' },
    { id: 'first_workout', title: 'İlk Antrenman', icon: Dumbbell, color: '#A855F7' },
    { id: 'workout_10', title: '10 Antrenman', icon: Star, color: '#FFD700' },
    { id: 'workout_100', title: '100. Antrenman', icon: Crown, color: '#FFD700' },
  ];

  if (!profile || !derived) return null;

  const { bmi, cat, targetCal, macros } = derived;

  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Tüm yerel verilerin silinecek ve başa döneceksin. Emin misin?",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Çıkış Yap", 
          style: "destructive", 
          onPress: async () => {
            await resetProfile();
            router.replace('/onboarding');
          }
        }
      ]
    );
  };

  const handleThemeToggle = () => {
    if (themeMode === 'system') changeTheme('dark');
    else if (themeMode === 'dark') changeTheme('light');
    else changeTheme('system');
  };

  const ThemeIcon = themeMode === 'system' ? Smartphone : themeMode === 'dark' ? Moon : Sun;
  const themeLabel = themeMode === 'system' ? 'Sistem' : themeMode === 'dark' ? 'Koyu' : 'Açık';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profil</Text>
        <Pressable style={[styles.settingsBtn, { backgroundColor: colors.iconBg }]} onPress={() => setShowEditProfile(true)}>
          <Settings size={20} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* PROFILE CARD */}
        <FadeInDown index={0} style={[styles.card, { backgroundColor: '#FF6B35', borderColor: '#FF6B35' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={styles.avatarBox}>
              {profile.avatarUri ? (
                <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{profile.gender === 'female' ? 'K' : 'E'}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.userName}>{profile.name || 'FitKoç Üyesi'}</Text>
                <Crown size={16} color="#FFD700" />
              </View>
              <Text style={styles.goalText}>Hedef: {profile.goalLabel}</Text>
              
              <View style={styles.bmiBadge}>
                <Text style={styles.bmiBadgeText}>BKİ {bmi.toFixed(1)} — {cat.label}</Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 }}>
                <Flame size={16} color={streak > 0 ? '#FFD700' : 'rgba(255,255,255,0.5)'} />
                <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '700' }}>{streak || 0} Gün Seri</Text>
              </View>
            </View>
          </View>
        </FadeInDown>

        {/* TABS */}
        <FadeInDown index={1} style={[styles.tabContainer, { backgroundColor: colors.border }]}>
          <Pressable 
            style={[styles.tabBtn, activeTab === 'stats' && [styles.tabBtnActive, { backgroundColor: colors.card }]]}
            onPress={() => setActiveTab('stats')}
          >
            <Text style={[styles.tabText, { color: colors.textSub }, activeTab === 'stats' && { color: colors.text }]}>İstatistikler</Text>
          </Pressable>
          <Pressable 
            style={[styles.tabBtn, activeTab === 'hero' && [styles.tabBtnActive, { backgroundColor: colors.card }]]}
            onPress={() => setActiveTab('hero')}
          >
            <Text style={[styles.tabText, { color: colors.textSub }, activeTab === 'hero' && { color: colors.text }]}>Kahraman Paneli</Text>
          </Pressable>
        </FadeInDown>

        {activeTab === 'stats' ? (
          <View>
            {/* INFO CARDS */}
            <FadeInDown index={2} style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <View style={styles.statIconBg}>
                  <Target size={20} color="#FF6B35" />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{profile.weightKg} kg</Text>
                <Text style={[styles.statLabel, { color: colors.textSub }]}>Güncel Kilo</Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <View style={[styles.statIconBg, { backgroundColor: 'rgba(0,170,255,0.1)' }]}>
                  <Activity size={20} color="#00AAFF" />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{profile.heightCm} cm</Text>
                <Text style={[styles.statLabel, { color: colors.textSub }]}>Boy</Text>
              </View>
            </FadeInDown>

            {/* MACROS CARD */}
            <FadeInDown index={3} style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Günlük Hedeflerin</Text>
              <View style={styles.macrosRow}>
                <View style={styles.macroCol}>
                  <Text style={[styles.macroVal, { color: '#FF6B35' }]}>{targetCal}</Text>
                  <Text style={[styles.macroName, { color: colors.textSub }]}>Kalori</Text>
                </View>
                <View style={styles.macroCol}>
                  <Text style={[styles.macroVal, { color: '#00AAFF' }]}>{macros.protein}g</Text>
                  <Text style={[styles.macroName, { color: colors.textSub }]}>Protein</Text>
                </View>
                <View style={styles.macroCol}>
                  <Text style={[styles.macroVal, { color: '#FF3B3B' }]}>{macros.fat}g</Text>
                  <Text style={[styles.macroName, { color: colors.textSub }]}>Yağ</Text>
                </View>
                <View style={styles.macroCol}>
                  <Text style={[styles.macroVal, { color: '#A855F7' }]}>{macros.carbs}g</Text>
                  <Text style={[styles.macroName, { color: colors.textSub }]}>Karb</Text>
                </View>
              </View>
            </FadeInDown>

            {/* COMBINED REPORTS */}
            <FadeInDown index={4} style={[styles.card, { backgroundColor: colors.card, padding: 0, overflow: 'hidden' }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.reportTabRow, { borderBottomColor: colors.border }]}>
                <Pressable style={[styles.reportTabBtn, reportTab === 'weekly' && { borderBottomColor: '#FF6B35' }]} onPress={() => setReportTab('weekly')}>
                  <Text style={[styles.reportTabText, { color: colors.textSub }, reportTab === 'weekly' && { color: '#FF6B35' }]}>Haftalık</Text>
                </Pressable>
                <Pressable style={[styles.reportTabBtn, reportTab === 'monthly' && { borderBottomColor: '#A855F7' }]} onPress={() => setReportTab('monthly')}>
                  <Text style={[styles.reportTabText, { color: colors.textSub }, reportTab === 'monthly' && { color: '#A855F7' }]}>Aylık</Text>
                </Pressable>
                <Pressable style={[styles.reportTabBtn, reportTab === 'weight' && { borderBottomColor: '#00AAFF' }]} onPress={() => setReportTab('weight')}>
                  <Text style={[styles.reportTabText, { color: colors.textSub }, reportTab === 'weight' && { color: '#00AAFF' }]}>Kilo Gelişimi</Text>
                </Pressable>
                <Pressable style={[styles.reportTabBtn, reportTab === '1rm' && { borderBottomColor: '#FF6B35' }]} onPress={() => setReportTab('1rm')}>
                  <Text style={[styles.reportTabText, { color: colors.textSub }, reportTab === '1rm' && { color: '#FF6B35' }]}>1RM</Text>
                </Pressable>
                <Pressable style={[styles.reportTabBtn, reportTab === 'calendar' && { borderBottomColor: '#00AAFF' }]} onPress={() => setReportTab('calendar')}>
                  <Text style={[styles.reportTabText, { color: colors.textSub }, reportTab === 'calendar' && { color: '#00AAFF' }]}>Takvim</Text>
                </Pressable>
              </ScrollView>
              
              <View style={{ padding: 16 }}>
                {reportTab === 'weekly' && <WeeklyChart onDayTap={setSelectedDay} />}
                {reportTab === 'monthly' && <MonthlyChart onWeekTap={setSelectedWeek} />}
                {reportTab === 'weight' && <WeightProgressChart />}
                {reportTab === '1rm' && <OneRMChart />}
                {reportTab === 'calendar' && <HistoryCalendar />}
              </View>
            </FadeInDown>

          </View>
        ) : (
          <View>
            <FadeInDown index={2} style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Kas Gelişim Haritası</Text>
              <Text style={{color: colors.textSub, fontSize: 13, marginBottom: 16}}>
                Antrenman yaptıkça kas grupların gelişir ve renkleri değişir (Seviye 1 - Seviye 5).
              </Text>
              
              <HeroMuscleMap muscleXP={muscleXP} gender={profile.gender} isDark={isDark} />
            </FadeInDown>
          </View>
        )}

        
        {/* BADGES SECTION */}
        <FadeInDown index={4} style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>Başarı Rozetlerin</Text>
            <Medal size={20} color="#FFD700" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
            {BADGE_CONFIG.map((badge, idx) => {
              const isUnlocked = unlockedBadges?.includes(badge.id) || false;
              const Icon = badge.icon;
              return (
                <View key={badge.id} style={{alignItems: 'center', marginRight: 16, width: 80, opacity: isUnlocked ? 1 : 0.4}}>
                  <View style={[styles.badgeCircle, { backgroundColor: isUnlocked ? `${badge.color}15` : colors.iconBg }]}>
                    <Icon size={32} color={isUnlocked ? badge.color : colors.textSub} />
                  </View>
                  <Text style={[styles.badgeTitle, { color: isUnlocked ? colors.text : colors.textSub }]} numberOfLines={2}>
                    {badge.title}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </FadeInDown>

        {/* SETTINGS LIST */}
        <FadeInDown index={5} style={[styles.settingsList, { backgroundColor: colors.card }]}>
          <Pressable style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={handleThemeToggle}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
              <ThemeIcon size={20} color={colors.text} />
              <Text style={[styles.settingItemText, { color: colors.text }]}>Tema: {themeLabel}</Text>
            </View>
          </Pressable>
          <Pressable style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={() => setShowEditProfile(true)}>
            <Text style={[styles.settingItemText, { color: colors.text }]}>Kişisel Bilgileri Güncelle</Text>
          </Pressable>
          <Pressable style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={() => setShowReminders(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
              <Bell size={20} color={colors.text} />
              <Text style={[styles.settingItemText, { color: colors.text }]}>Hatırlatmalar</Text>
            </View>
          </Pressable>
          <Pressable style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={() => setShowApiKey(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
              <KeyRound size={20} color={colors.text} />
              <Text style={[styles.settingItemText, { color: colors.text }]}>Gemini API Anahtarı</Text>
            </View>
          </Pressable>
          <Pressable style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={() => Alert.alert("Yakında", "Apple Health ve Fitbit entegrasyonu geliştirme aşamasında. Yakında aktif olacak.")}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
              <Watch size={20} color={colors.text} />
              <Text style={[styles.settingItemText, { color: colors.text }]}>Cihaz Entegrasyonu (Fitbit vb.)</Text>
              <View style={{ backgroundColor: colors.iconBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSub }}>Yakında</Text>
              </View>
            </View>
          </Pressable>
          <Pressable style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={() => setShowPremium(true)}>
            <Text style={[styles.settingItemText, { color: colors.text }]}>FitKoç Premium'a Geç</Text>
            <Crown size={16} color="#FFD700" />
          </Pressable>
          <Pressable style={[styles.settingItem, { borderBottomWidth: 0 }]} onPress={handleLogout}>
            <LogOut size={18} color="#FF3B3B" />
            <Text style={[styles.settingItemText, { color: '#FF3B3B', marginLeft: 8 }]}>Çıkış Yap / Sıfırla</Text>
          </Pressable>
        </FadeInDown>

      </ScrollView>

      <PremiumModal visible={showPremium} onClose={() => setShowPremium(false)} />
      <EditProfileModal visible={showEditProfile} onClose={() => setShowEditProfile(false)} />
      <RemindersModal visible={showReminders} onClose={() => setShowReminders(false)} />
      <ApiKeyModal visible={showApiKey} onClose={() => setShowApiKey(false)} />
      <DayDetailSheet data={selectedDay} onClose={() => setSelectedDay(null)} />
      <WeekDetailSheet data={selectedWeek} onClose={() => setSelectedWeek(null)} />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  settingsBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  
  scrollContent: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 130 : 100 },
  
  card: { borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  
  avatarBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#FF6B35' },
  userName: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  goalText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  bmiBadge: { backgroundColor: '#FFF', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginTop: 12 },
  bmiBadgeText: { color: '#FF6B35', fontSize: 12, fontWeight: '700' },

  tabContainer: { flexDirection: 'row', borderRadius: 24, padding: 4, marginBottom: 20 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  tabBtnActive: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600' },

  reportTabRow: { flexDirection: 'row', borderBottomWidth: 1 },
  reportTabBtn: { paddingVertical: 16, paddingHorizontal: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  reportTabText: { fontSize: 14, fontWeight: '700' },

  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 24, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  statIconBg: { backgroundColor: 'rgba(255,107,53,0.1)', padding: 12, borderRadius: 16, marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 13, marginTop: 4 },

  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  macrosRow: { flexDirection: 'row', justifyContent: 'space-between' },
  macroCol: { alignItems: 'center' },
  macroVal: { fontSize: 20, fontWeight: '800' },
  macroName: { fontSize: 12, marginTop: 4 },

  settingsList: { borderRadius: 24, paddingHorizontal: 20, marginTop: 8 },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  settingItemText: { flex: 1, fontSize: 16, fontWeight: '500' },
  badgeCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  badgeTitle: { fontSize: 12, fontWeight: '700', textAlign: 'center' }
});
