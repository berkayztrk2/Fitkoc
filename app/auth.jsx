import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'expo-router';
import { Mail, Lock, Shield, UserPlus, LogIn, KeyRound } from 'lucide-react-native';
import FadeInDown from '../components/FadeInDown';

export default function AuthScreen() {
  const { colors, isDark } = useTheme();
  const { login, register } = useUser();
  const router = useRouter();

  const [mode, setMode] = useState('login'); // login, register, reset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (!email) return;

    if (mode === 'login') {
      if (!password) return;
      login(email, password);
      router.replace('/');
    } else if (mode === 'register') {
      if (!password) return;
      register(email, password);
      router.replace('/');
    } else {
      alert('Şifre sıfırlama bağlantısı e-postanıza gönderildi!');
      setMode('login');
    }
  };

  const handleGoogle = () => {
    // Firebase / Google Auth eklenecek
    login('google@user.com', 'google');
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          <FadeInDown index={0} style={{ alignItems: 'center', marginTop: 40, marginBottom: 30 }}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(255, 107, 53, 0.1)' }]}>
              <Shield size={40} color="#FF6B35" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {mode === 'login' ? 'Tekrar Hoş Geldin' : mode === 'register' ? 'Aramıza Katıl' : 'Şifreni Sıfırla'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSub }]}>
              {mode === 'login' 
                ? 'Gelişimine kaldığın yerden devam et.' 
                : mode === 'register' 
                  ? "FitKoç'a katıl ve dönüşüme başla." 
                  : 'E-posta adresini gir, sıfırlama linki gönderelim.'}
            </Text>
          </FadeInDown>

          <FadeInDown index={1} style={styles.form}>
            
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Mail size={20} color={colors.textSub} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="E-posta Adresi"
                placeholderTextColor={colors.textSub}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {mode !== 'reset' && (
              <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Lock size={20} color={colors.textSub} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Şifre"
                  placeholderTextColor={colors.textSub}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            )}

            {mode === 'login' && (
              <Pressable style={styles.forgotBtn} onPress={() => setMode('reset')}>
                <Text style={styles.forgotText}>Şifremi Unuttum</Text>
              </Pressable>
            )}

            <Pressable style={styles.mainBtn} onPress={handleSubmit}>
              {mode === 'login' ? <LogIn size={20} color="#FFF" /> 
                : mode === 'register' ? <UserPlus size={20} color="#FFF" /> 
                : <KeyRound size={20} color="#FFF" />}
              <Text style={styles.mainBtnText}>
                {mode === 'login' ? 'Giriş Yap' : mode === 'register' ? 'Kayıt Ol' : 'Bağlantı Gönder'}
              </Text>
            </Pressable>

          </FadeInDown>

          {mode !== 'reset' && (
            <FadeInDown index={2} style={styles.socialSection}>
              <View style={styles.dividerRow}>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textSub }]}>veya şununla devam et</Text>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              </View>

              <Pressable style={[styles.googleBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleGoogle}>
                <View style={styles.googleIconDummy}>
                  <Text style={{fontWeight: '900', color: '#EA4335', fontSize: 18}}>G</Text>
                </View>
                <Text style={[styles.googleBtnText, { color: colors.text }]}>Google ile Giriş Yap</Text>
              </Pressable>
            </FadeInDown>
          )}

          <FadeInDown index={3} style={styles.footer}>
            {mode === 'login' ? (
              <Text style={[styles.footerText, { color: colors.textSub }]}>
                Hesabın yok mu?{' '}
                <Text style={styles.footerLink} onPress={() => setMode('register')}>
                  Kayıt Ol
                </Text>
              </Text>
            ) : (
              <Text style={[styles.footerText, { color: colors.textSub }]}>
                Zaten hesabın var mı?{' '}
                <Text style={styles.footerLink} onPress={() => setMode('login')}>
                  Giriş Yap
                </Text>
              </Text>
            )}
          </FadeInDown>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  
  iconBg: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center', paddingHorizontal: 20 },
  
  form: { gap: 16, marginTop: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, height: 56 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, fontWeight: '500' },
  
  forgotBtn: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { color: '#FF6B35', fontWeight: '600', fontSize: 14 },
  
  mainBtn: { backgroundColor: '#FF6B35', height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 8 },
  mainBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  
  socialSection: { marginTop: 32 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  divider: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 16, fontSize: 13, fontWeight: '500' },
  
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderWidth: 1, borderRadius: 16, gap: 12 },
  googleIconDummy: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  googleBtnText: { fontSize: 16, fontWeight: '700' },
  
  footer: { marginTop: 32, alignItems: 'center' },
  footerText: { fontSize: 15 },
  footerLink: { color: '#FF6B35', fontWeight: '700' }
});
