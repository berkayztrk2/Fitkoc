import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

let Notifications = null;

if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    console.log('expo-notifications yüklenemedi:', e);
  }
}

export async function requestNotificationPermissions() {
  if (isExpoGo || !Notifications) {
    Alert.alert("Desteklenmiyor", "Yerel bildirimler Expo Go uygulamasında (SDK 53+) desteklenmemektedir. Tam test için Development Build ('npx expo run:android') almanız gereklidir.");
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Genel Bildirimler',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00AAFF',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

export async function scheduleDailyReminder(id, title, body, hour, minute) {
  if (isExpoGo || !Notifications) return;
  
  await Notifications.cancelScheduledNotificationAsync(id); 
  
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
}

export async function cancelReminder(id) {
  if (isExpoGo || !Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function sendTestNotification() {
  const hasPerm = await requestNotificationPermissions();
  if (!hasPerm) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Harika! 🚀",
      body: "Uygulama kapalıyken bile bildirim sistemi başarıyla çalışıyor.",
      sound: true,
    },
    trigger: { seconds: 5 },
  });
  return true;
}
