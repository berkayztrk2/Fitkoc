import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bot, Send, User, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { askCoach } from '../../lib/claude';
import { ActivityIndicator } from 'react-native';

export default function ChatScreen() {
  const { colors } = useTheme();
  const { profile } = useUser();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Merhaba ${profile?.gender === 'female' ? 'Kraliçe' : 'Şampiyon'}! Bugün nasıl hissediyorsun? Antrenman veya beslenme ile ilgili her sorunu cevaplayabilirim.`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const replyText = await askCoach(history, profile);

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: replyText
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "Bağlantı kurulamadı. " + err.message
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChipPress = (text) => {
    setInputText(text);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.avatar}>
              <Bot size={24} color="#FFF" />
            </View>
            <View>
              <Text style={[styles.name, { color: colors.text }]}>FitKoç AI</Text>
              <Text style={styles.status}>Çevrimiçi</Text>
            </View>
          </View>
        </View>

        {/* Chat Area */}
        <ScrollView 
          ref={scrollViewRef}
          style={[styles.scroll, { backgroundColor: colors.iconBg }]}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(msg => (
            <View 
              key={msg.id} 
              style={[
                styles.bubbleContainer, 
                msg.sender === 'user' ? styles.bubbleUserContainer : styles.bubbleBotContainer
              ]}
            >
              <View 
                style={[
                  styles.bubble, 
                  msg.sender === 'user' 
                    ? [styles.bubbleUser, { backgroundColor: '#FF6B35' }] 
                    : [styles.bubbleBot, { backgroundColor: colors.card }]
                ]}
              >
                <Text 
                  style={[
                    styles.bubbleText, 
                    { color: msg.sender === 'user' ? '#FFF' : colors.text }
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}

          {/* Quick Option Chips */}
          {isLoading && (
            <View style={[styles.bubbleContainer, styles.bubbleBotContainer]}>
              <View style={[styles.bubble, styles.bubbleBot, { backgroundColor: colors.card, paddingVertical: 16 }]}>
                <ActivityIndicator color="#00AAFF" size="small" />
              </View>
            </View>
          )}

          {messages.length === 1 && (
            <View style={styles.chipsContainer}>
              {[
                'Motivasyona ihtiyacım var',
                'Tatlı krizini nasıl aşarım?',
                'Kol antrenmanı önerisi'
              ].map((chip, idx) => (
                <Pressable 
                  key={idx} 
                  style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleChipPress(chip)}
                >
                  <Text style={[styles.chipText, { color: colors.textSub }]}>{chip}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={[styles.inputArea, { 
          backgroundColor: colors.card, 
          borderTopColor: colors.border,
          paddingBottom: keyboardVisible ? 16 : (Platform.OS === 'ios' ? 120 : 100)
        }]}>
          <View style={[styles.inputContainer, { backgroundColor: colors.iconBg }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Bir şeyler sor..."
              placeholderTextColor={colors.textSub}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <Pressable onPress={handleSend} style={styles.sendBtn}>
              <Send size={20} color="#FF6B35" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: { fontSize: 16, fontWeight: '700' },
  status: { color: '#00AAFF', fontSize: 12, fontWeight: '600', marginTop: 2 },
  scroll: { flex: 1 },
  bubbleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    width: '100%',
  },
  bubbleUserContainer: {
    justifyContent: 'flex-end',
  },
  bubbleBotContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '500' },
  inputArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  sendBtn: {
    padding: 4,
  }
});
