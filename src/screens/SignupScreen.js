import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';

// Firebase Imports
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const { width, height } = Dimensions.get('window');

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !regNo || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      const cleanRegNo = regNo.trim().toUpperCase();

      // ✅ 1. Firebase Whitelist එක චෙක් කිරීම (Real-time)
      const whitelistRef = collection(db, "whitelist");
      const q = query(whitelistRef, where("regNo", "==", cleanRegNo));
      const querySnapshot = await getDocs(q);

      // පරණ වයිට්ලිස්ට් ලොජික් එක වෙනුවට මෙය භාවිතා වේ
      let status = !querySnapshot.empty ? 'approved' : 'pending';

      // ✅ 2. Firebase Auth හරහා User හදනවා
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // ✅ 3. Firestore එකේ User Profile එක Save කරනවා
      await setDoc(doc(db, "users", user.uid), {
        fullName: fullName.trim(),
        regNo: cleanRegNo,
        email: email.trim().toLowerCase(),
        role: 'student',
        status: status,
        createdAt: serverTimestamp()
      });

      setLoading(false);

      if (status === 'approved') {
        Alert.alert(
          "Success! 🎉", 
          "Your Registration Number is whitelisted. Account approved!", 
          [{ text: "OK", onPress: () => navigation.replace('Home') }]
        );
      } else {
        // වයිට්ලිස්ට් එකේ නැතිනම් 'pending' තත්ත්වයට වැටේ
        Alert.alert(
          "Pending ⏳", 
          "Reg No not in the official whitelist. An admin will review your account soon.", 
          [{ text: "OK", onPress: () => navigation.replace('Login') }]
        );
      }

    } catch (error) {
      setLoading(false);
      // Firebase errors (email already in use, weak password etc.)
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') errorMessage = "This email is already registered.";
      Alert.alert('Signup Failed', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient colors={['#4a00e0', '#8e2de2']} style={styles.background} />
      
      <View style={[styles.bubble, { top: 50, left: 30, width: 100, height: 100, backgroundColor: 'rgba(255,255,255,0.1)' }]} />
      <View style={[styles.bubble, { bottom: 100, right: 20, width: 150, height: 150, backgroundColor: 'rgba(255,255,255,0.1)' }]} />
      <View style={[styles.bubble, { top: height * 0.4, left: -20, width: 80, height: 80, backgroundColor: 'rgba(255,255,255,0.08)' }]} />

      <View style={styles.cardContainer}>
        <BlurView intensity={90} tint="dark" style={styles.glassCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>Sign Up</Text>
              <Text style={styles.subtitle}>Join UOV Events</Text>
            </View>

            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#ccc"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
            />

            <TextInput
              placeholder="Registration No (e.g. 2021/ICT/01)"
              placeholderTextColor="#ccc"
              style={styles.input}
              value={regNo}
              onChangeText={setRegNo}
              autoCapitalize="characters"
            />

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

            <TouchableOpacity onPress={handleSignup} disabled={loading}>
              <LinearGradient colors={['#FF00CC', '#333399']} style={styles.button}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>REGISTER</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Login</Text></Text>
            </TouchableOpacity>

          </ScrollView>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  background: { position: 'absolute', left: 0, right: 0, top: 0, height: height },
  bubble: { position: 'absolute', borderRadius: 1000 }, 
  cardContainer: { width: width * 0.9, maxHeight: height * 0.85 },
  glassCard: { padding: 25, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logoText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#ddd', marginTop: 5 },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 15, color: '#fff', marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  button: { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#ccc', textAlign: 'center', marginTop: 20 },
  linkBold: { color: '#fff', fontWeight: 'bold' }
});