import { Tabs, router } from 'expo-router';
import { View, Text, Platform, Pressable } from 'react-native';
import { Home, Camera, User, Dumbbell, MessageSquare } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

function CustomTabBar({ state, descriptors, navigation }) {
  const { colors, isDark } = useTheme();
  const BAR_HEIGHT = 72;

  const getIcon = (routeName, focused, color, size) => {
    switch (routeName) {
      case 'index': return <Home color={color} size={size} />;
      case 'analyze': return <Camera color={color} size={size} />;
      case 'workout': return <Dumbbell color={color} size={size} />;
      case 'chat': return <MessageSquare color={color} size={size} />;
      case 'profile': return <User color={color} size={size} />;
      default: return null;
    }
  };

  const getLabel = (routeName) => {
    switch (routeName) {
      case 'index': return 'ANA SAYFA';
      case 'analyze': return 'TARAMA';
      case 'workout': return 'ANTRENMAN';
      case 'chat': return 'ASİSTAN';
      case 'profile': return 'PROFİL';
      default: return '';
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 32 : 16,
        left: 20,
        right: 20,
        backgroundColor: colors.card,
        height: BAR_HEIGHT,
        borderRadius: 36,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 8,
        elevation: 8,
        shadowColor: isDark ? '#000' : '#888',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            const path = route.name === 'index' ? '/' : `/(tabs)/${route.name}`;
            router.navigate(path);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              height: BAR_HEIGHT, 
            }}
          >
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                borderRadius: 22, 
                width: 60, 
                height: 52,
              }}
            >
              {getIcon(route.name, isFocused, isFocused ? '#FF6B35' : colors.textSub, 22)}
              {isFocused && (
                <Text
                  style={{
                    color: '#FF6B35',
                    fontSize: 10,
                    marginTop: 3,
                    fontWeight: '700',
                    letterSpacing: 0.2,
                  }}
                >
                  {getLabel(route.name)}
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="analyze" />
      <Tabs.Screen name="workout" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
