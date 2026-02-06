import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut, updatePassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../config/firebase';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  
  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) setUserData(docSnap.data());
      }
    };
    fetchUser();
  }, []);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }
    try {
      await updatePassword(auth.currentUser, newPassword);
      Alert.alert("Success", "Password updated! Please login again.");
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert("Error", "Please logout and login again before changing password for security.");
    }
  };

  // ✅ Logout Function
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => {
            signOut(auth)
              .then(() => navigation.replace('Login'))
              .catch((error) => console.log(error));
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#141e30', '#243b55']} style={styles.background} />
      
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
             <Text style={styles.avatarText}>{userData?.regNo?.charAt(0) || 'U'}</Text>
          </View>
          <Text style={styles.name}>{userData?.regNo}</Text>
          <Text style={styles.role}>{userData?.role?.toUpperCase()}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Security</Text>
          <Text style={styles.label}>Change Password</Text>
          <TextInput 
            style={styles.input} 
            placeholder="New Password" 
            placeholderTextColor="#aaa"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword}>
            <Text style={styles.saveBtnText}>Update Password</Text>
          </TouchableOpacity>
        </View>

        {/* ✅ Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  backBtn: { marginLeft: 20, marginBottom: 10 },
  scrollContent: { paddingBottom: 50 },
  avatarContainer: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#00c6ff', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: '#fff' },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  role: { color: '#00c6ff', fontSize: 14, marginTop: 5, fontWeight: 'bold', letterSpacing: 1 },
  
  form: { paddingHorizontal: 30, marginBottom: 30 },
  sectionTitle: { color: '#aaa', fontSize: 14, marginBottom: 15, textTransform: 'uppercase' },
  label: { color: '#fff', marginBottom: 10, fontSize: 16 },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 10, color: '#fff', marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  saveBtn: { backgroundColor: '#FF00CC', padding: 15, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Logout Button Styles
  logoutBtn: { 
    flexDirection: 'row', 
    backgroundColor: '#ff4444', 
    marginHorizontal: 30, 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  logoutBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});