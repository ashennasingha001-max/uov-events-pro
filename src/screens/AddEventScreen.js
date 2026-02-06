import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Firebase
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function AddEventScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddEvent = async () => {
    if (!title || !date || !location || !description) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "events"), {
        title,
        date,
        location,
        description,
        joinedUsers: [],
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser.uid // ✅ මේක තමයි අලුතින් එකතු කළේ! (හැදුවේ කවුද කියලා Save වෙනවා)
      });

      setLoading(false);
      Alert.alert('Success', 'Event added successfully! 🎉', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#141e30', '#243b55']} style={styles.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Event</Text>
      </View>

      <View style={styles.form}>
        <TextInput placeholder="Event Title" placeholderTextColor="#aaa" style={styles.input} value={title} onChangeText={setTitle} />
        <TextInput placeholder="Date (e.g. 2026-03-10)" placeholderTextColor="#aaa" style={styles.input} value={date} onChangeText={setDate} />
        <TextInput placeholder="Location" placeholderTextColor="#aaa" style={styles.input} value={location} onChangeText={setLocation} />
        <TextInput 
          placeholder="Description" 
          placeholderTextColor="#aaa" 
          style={[styles.input, { height: 100 }]} 
          multiline 
          value={description} 
          onChangeText={setDescription} 
        />

        <TouchableOpacity onPress={handleAddEvent} disabled={loading}>
          <LinearGradient colors={['#FF00CC', '#333399']} style={styles.button}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>PUBLISH EVENT</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  header: { marginTop: 50, padding: 20, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  form: { padding: 20 },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 15, color: '#fff', marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  button: { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});