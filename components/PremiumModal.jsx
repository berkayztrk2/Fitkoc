import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, Animated } from 'react-native';
import { Crown, Check, X } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export default function PremiumModal({ visible, onClose }) {
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const { colors, isDark } = useTheme();

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <Pressable style={[styles.closeBtn, { backgroundColor: colors.iconBg }]} onPress={onClose}>
            <X size={24} color={colors.textSub} />
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.header}>
              <View style={styles.iconBg}>
                <Crown size={32} color="#FFD700" />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>FitKoç Premium</Text>
              <Text style={[styles.sub, { color: colors.textSub }]}>Potansiyelini zirveye taşı.</Text>
            </View>

            <View style={styles.features}>
              <FeatureItem text="Sınırsız AI Koç desteği ve kişiselleştirilmiş analizler" colors={colors} />
              <FeatureItem text="Yapay Zeka ile sınırsız özel antrenman programı oluşturma" colors={colors} />
              <FeatureItem text="Sonsuz öğün alternatifi ve akıllı mutfak" colors={colors} />
              <FeatureItem text="Detaylı aylık raporlar ve kas gelişim haritası takibi" colors={colors} />
            </View>

            <View style={styles.plans}>
              <Pressable 
                style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border }, selectedPlan === 'monthly' && [styles.planActive, { backgroundColor: isDark ? 'rgba(255,107,53,0.1)' : '#FFF4F0' }]]} 
                onPress={() => setSelectedPlan('monthly')}
              >
                <View style={[styles.planRadio, { borderColor: colors.border }]}>
                  {selectedPlan === 'monthly' && <View style={styles.planRadioInner} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.planTitle, { color: colors.text }, selectedPlan === 'monthly' && { color: '#FF6B35' }]}>Aylık</Text>
                  <Text style={[styles.planPrice, { color: colors.text }]}>₺199<Text style={{fontSize: 14, color: colors.textSub}}>/ay</Text></Text>
                </View>
              </Pressable>

              <Pressable 
                style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border }, selectedPlan === 'annual' && [styles.planActive, { borderColor: '#FFD700', backgroundColor: isDark ? 'rgba(255,215,0,0.05)' : '#FFFAF0' }]]} 
                onPress={() => setSelectedPlan('annual')}
              >
                <View style={styles.badge}><Text style={styles.badgeText}>En Popüler</Text></View>
                <View style={[styles.planRadio, { borderColor: selectedPlan === 'annual' ? '#FFD700' : colors.border }]}>
                  {selectedPlan === 'annual' && <View style={[styles.planRadioInner, { backgroundColor: '#FFD700' }]} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.planTitle, { color: colors.text }, selectedPlan === 'annual' && { color: '#D4AF37' }]}>Yıllık</Text>
                  <Text style={[styles.planPrice, { color: colors.text }]}>₺99<Text style={{fontSize: 14, color: colors.textSub}}>/ay</Text></Text>
                  <Text style={[styles.planSave, { color: colors.textSub }]}>₺1,188 fatura edilir</Text>
                </View>
              </Pressable>
            </View>

            <Pressable style={[styles.buyBtn, { backgroundColor: colors.text }]} onPress={onClose}>
              <Text style={[styles.buyBtnText, { color: colors.card }]}>Premium'a Geç</Text>
            </Pressable>
            <Text style={[styles.footerText, { color: colors.textSub }]}>
              İstediğin zaman iptal edebilirsin. Şartlar ve koşullar geçerlidir.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function FeatureItem({ text, colors }) {
  return (
    <View style={styles.fItem}>
      <Check size={20} color="#00CC6A" />
      <Text style={[styles.fText, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  content: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%' },
  closeBtn: { position: 'absolute', top: 20, right: 20, zIndex: 10, padding: 8, borderRadius: 20 },
  header: { alignItems: 'center', marginTop: 16, marginBottom: 32 },
  iconBg: { backgroundColor: 'rgba(255, 215, 0, 0.15)', padding: 16, borderRadius: 32, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  sub: { fontSize: 16, fontWeight: '500' },
  features: { marginBottom: 32 },
  fItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  fText: { fontSize: 15, flex: 1, lineHeight: 22 },
  plans: { gap: 16, marginBottom: 32 },
  planCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, borderWidth: 2 },
  planActive: { borderColor: '#FF6B35' },
  planRadio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, marginRight: 16, justifyContent: 'center', alignItems: 'center' },
  planRadioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF6B35' },
  planTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  planPrice: { fontSize: 24, fontWeight: '800' },
  planSave: { fontSize: 13, marginTop: 4 },
  badge: { position: 'absolute', top: -12, right: 20, backgroundColor: '#FFD700', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#000', fontSize: 12, fontWeight: '800' },
  buyBtn: { paddingVertical: 18, borderRadius: 32, alignItems: 'center' },
  buyBtnText: { fontSize: 18, fontWeight: '700' },
  footerText: { textAlign: 'center', fontSize: 12, marginTop: 16 }
});
