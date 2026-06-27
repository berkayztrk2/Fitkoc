import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { X, ChefHat, Plus, Info } from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { generateRecipeFromIngredients } from '../lib/claude';

export default function RecipeGenerator({ visible, onClose }) {
  const { profile, addMeal } = useUser();
  const { colors, isDark } = useTheme();
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    setError('');
    setRecipe(null);
    try {
      const res = await generateRecipeFromIngredients(ingredients, profile);
      setRecipe(res);
    } catch (e) {
      setError('Tarif oluşturulamadı: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeal = () => {
    if (!recipe) return;
    addMeal({
      name: recipe.name,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      ingredients: ingredients
    });
    setIngredients('');
    setRecipe(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBg}><ChefHat size={20} color="#FF6B35" /></View>
              <Text style={[styles.title, { color: colors.text }]}>AI Tarif & Öğün Planı</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <X size={24} color={colors.textSub} />
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {!recipe ? (
              <View style={styles.inputSection}>
                <Text style={[styles.label, { color: colors.text }]}>Evde ne malzemeler var?</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.iconBg, borderColor: colors.border, color: colors.text }]}
                  placeholder="Örn: 2 yumurta, yulaf, süt, muz..."
                  placeholderTextColor={colors.textSub}
                  value={ingredients}
                  onChangeText={setIngredients}
                  multiline
                />
                
                <View style={styles.infoBox}>
                  <Info size={16} color="#00AAFF" />
                  <Text style={styles.infoText}>Hedeflerine ve elindeki malzemelere en uygun pratik tarifi senin için anında yaratacağız.</Text>
                </View>

                <Pressable style={[styles.generateBtn, !ingredients && { backgroundColor: colors.border }]} onPress={handleGenerate} disabled={!ingredients || loading}>
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text style={[styles.generateBtnText, !ingredients && { color: colors.textSub }]}>Tarif Yarat</Text>}
                </Pressable>
                
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>
            ) : (
              <View style={styles.resultSection}>
                <Text style={[styles.recipeName, { color: colors.text }]}>{recipe.name}</Text>
                
                <View style={[styles.macrosBox, { backgroundColor: colors.iconBg }]}>
                  <View style={styles.macro}>
                    <Text style={[styles.macroVal, { color: colors.text }]}>{recipe.calories}</Text>
                    <Text style={[styles.macroLbl, { color: colors.textSub }]}>Kalori</Text>
                  </View>
                  <View style={styles.macro}>
                    <Text style={[styles.macroVal, { color: colors.text }]}>{recipe.protein}g</Text>
                    <Text style={[styles.macroLbl, { color: colors.textSub }]}>Protein</Text>
                  </View>
                  <View style={styles.macro}>
                    <Text style={[styles.macroVal, { color: colors.text }]}>{recipe.carbs}g</Text>
                    <Text style={[styles.macroLbl, { color: colors.textSub }]}>Karb</Text>
                  </View>
                  <View style={styles.macro}>
                    <Text style={[styles.macroVal, { color: colors.text }]}>{recipe.fat}g</Text>
                    <Text style={[styles.macroLbl, { color: colors.textSub }]}>Yağ</Text>
                  </View>
                </View>

                <View style={[styles.recipeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.recipeTitle, { color: colors.text }]}>Nasıl Yapılır?</Text>
                  <Text style={[styles.recipeText, { color: colors.text }]}>{recipe.recipe}</Text>
                </View>

                <View style={styles.actions}>
                  <Pressable style={[styles.retryBtn, { backgroundColor: colors.iconBg }]} onPress={() => setRecipe(null)}>
                    <Text style={[styles.retryBtnText, { color: colors.text }]}>Yeni Malzeme Gir</Text>
                  </Pressable>
                  <Pressable style={styles.saveBtn} onPress={handleSaveMeal}>
                    <Plus size={18} color="#FFF" />
                    <Text style={styles.saveBtnText}>Öğünlere Ekle</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: Dimensions.get('window').height * 0.9,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBg: { backgroundColor: 'rgba(255, 107, 53, 0.15)', padding: 10, borderRadius: 12 },
  title: { fontSize: 20, fontWeight: '800' },
  closeBtn: { padding: 4 },
  scroll: { flexGrow: 0 },
  inputSection: { paddingBottom: 20 },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 16, padding: 16,
    fontSize: 16,
    minHeight: 120, textAlignVertical: 'top',
    marginBottom: 16
  },
  infoBox: { flexDirection: 'row', backgroundColor: 'rgba(0, 170, 255, 0.1)', padding: 16, borderRadius: 16, alignItems: 'flex-start', gap: 12, marginBottom: 24 },
  infoText: { flex: 1, color: '#00AAFF', fontSize: 14, fontWeight: '500', lineHeight: 20 },
  generateBtn: { backgroundColor: '#FF6B35', padding: 18, borderRadius: 20, alignItems: 'center' },
  generateBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  errorText: { color: '#FF3B3B', marginTop: 12, textAlign: 'center' },

  resultSection: { paddingBottom: 20 },
  recipeName: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 24 },
  macrosBox: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderRadius: 20, marginBottom: 24 },
  macro: { alignItems: 'center', flex: 1 },
  macroVal: { fontSize: 18, fontWeight: '800' },
  macroLbl: { fontSize: 12, marginTop: 4 },
  recipeCard: { borderWidth: 1, borderRadius: 20, padding: 20, marginBottom: 24 },
  recipeTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  recipeText: { fontSize: 15, lineHeight: 24 },
  actions: { flexDirection: 'row', gap: 12 },
  retryBtn: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center' },
  retryBtnText: { fontSize: 15, fontWeight: '700' },
  saveBtn: { flex: 1, backgroundColor: '#FF6B35', flexDirection: 'row', padding: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
