import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { LogBox, View } from 'react-native';
import 'react-native-gesture-handler';

// Firebase Config Import
import { auth } from './src/config/firebase';

// Screens Imports
import AddEventScreen from './src/screens/AddEventScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import CustomSplashScreen from './src/screens/CustomSplashScreen';
import EventDetailsScreen from './src/screens/EventDetailsScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SignupScreen from './src/screens/SignupScreen';

LogBox.ignoreLogs(['Warning: ...']);

// Native Splash එක පෙන්වාගෙන ඉන්නවා අපේ Custom එක ලෑස්ති වෙනකම්
SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createStackNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState("Login");

  useEffect(() => {
    async function prepare() {
      try {
        // Firebase Auth State එක චෙක් කරලා යන්න ඕන තැන තීරණය කරනවා
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setInitialRoute("Home");
          } else {
            setInitialRoute("Login");
          }
          setAppIsReady(true); // ඩේටා ලැබුණු ගමන් appIsReady true කරනවා
        });

        return unsubscribe;
      } catch (e) {
        console.warn(e);
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Native splash එක වහාම අයින් කරලා Custom එකට ඉඩ දෙනවා
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; 
  }

  return (
    // පසුබිම නිල් පාට කිරීමෙන් අර රෝස පාට පෙනීම වළක්වනවා
    <View style={{ flex: 1, backgroundColor: '#4a00e0' }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Splash" 
          screenOptions={{ 
            headerShown: false,
            // මුළු Navigation එකේම පසුබිම නිල් පාට කරනවා
            cardStyle: { backgroundColor: '#4a00e0' },
            animationEnabled: false, // Splash එකේදී transition එක smooth වීමට
          }}
        >
          {/* Custom Splash Screen */}
          <Stack.Screen 
            name="Splash" 
            component={CustomSplashScreen} 
            initialParams={{ initialRoute: initialRoute }} 
          />

          {/* Auth Screens */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          
          {/* Main Screens */}
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="AddEvent" component={AddEventScreen} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        </Stack.Navigator>
        
        <StatusBar style="light" />
      </NavigationContainer>
    </View>
  );
}