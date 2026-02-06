import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { auth } from '../config/firebase';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setLoading(false); 
      navigation.replace('Home'); 
      
    } catch (error) {
      setLoading(false);
      
      // ✅ Custom English Error Messages
      let errorMessage = "An error occurred. Please try again.";

      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "The email address is not valid.";
          break;
        case 'auth/user-not-found':
          errorMessage = "No account found with this email. Please Sign Up first.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password. Please try again.";
          break;
        case 'auth/invalid-credential':
          errorMessage = "Invalid email or password. Please check your credentials.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Your account is temporarily blocked.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your internet connection.";
          break;
      }

      Alert.alert('Login Failed', errorMessage);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Required", "Please enter your Email address first!");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert("Email Sent 📧", "Please check your email inbox to reset your password.");
    } catch (error) {
      let forgotMsg = "Could not send reset email. Please try again.";
      if(error.code === 'auth/user-not-found') forgotMsg = "No user found with this email.";
      Alert.alert("Error", forgotMsg);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient colors={['#4a00e0', '#8e2de2']} style={styles.background} />
      
      <View style={[styles.bubble, { top: 50, left: 30, width: 100, height: 100, backgroundColor: 'rgba(255,255,255,0.1)' }]} />
      <View style={[styles.bubble, { bottom: 100, right: 20, width: 150, height: 150, backgroundColor: 'rgba(255,255,255,0.1)' }]} />

      <View style={styles.cardContainer}>
        <BlurView intensity={90} tint="dark" style={styles.glassCard}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>UOV Events</Text>
            <Text style={styles.subtitle}>Welcome Back!</Text>
          </View>

          <TextInput
            placeholder="Email"
            placeholderTextColor="#ccc"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#ccc"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotBtn}>
            <Text style={styles.forgotBtnText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogin} disabled={loading}>
            <LinearGradient colors={['#FF00CC', '#333399']} style={styles.button}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>LOGIN</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkBold}>Sign Up</Text></Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  background: { position: 'absolute', left: 0, right: 0, top: 0, height: height },
  bubble: { position: 'absolute', borderRadius: 1000 }, 
  cardContainer: { width: width * 0.9 },
  glassCard: { padding: 25, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logoText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#ddd', marginTop: 5 },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 15, color: '#fff', marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  button: { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#ccc', textAlign: 'center', marginTop: 20 },
  linkBold: { color: '#fff', fontWeight: 'bold' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotBtnText: { color: '#00c6ff', fontWeight: 'bold', fontSize: 14 }
});