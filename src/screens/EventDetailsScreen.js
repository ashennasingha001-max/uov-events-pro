import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { arrayUnion, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function EventDetailsScreen({ route, navigation }) {
  const { event } = route.params;
  const [joined, setJoined] = useState(false);
  const [userRole, setUserRole] = useState('student'); // Role 
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    // Check if user already joined
    if (event.joinedUsers.includes(userId)) {
      setJoined(true);
    }

    // Check User Role 
    const fetchUserRole = async () => {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role);
      }
    };
    fetchUserRole();
  }, []);

  const handleJoin = async () => {
    if (!userId) return;
    try {
      const eventRef = doc(db, "events", event.id);
      await updateDoc(eventRef, { joinedUsers: arrayUnion(userId) });
      setJoined(true);
      Alert.alert("Success", "You have joined this event! 🎉");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // ✅ Delete Function
  const handleDelete = () => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "events", event.id));
              Alert.alert("Deleted", "Event has been removed successfully.");
              navigation.goBack(); 
            } catch (error) {
              Alert.alert("Error", "Could not delete event: " + error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#141e30', '#243b55']} style={styles.background} />

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Event Header Image Area */}
        <View style={styles.imageContainer}>
          <LinearGradient colors={['#FF00CC', '#333399']} style={styles.placeholderImg}>
             <Ionicons name="calendar" size={80} color="rgba(255,255,255,0.3)" />
          </LinearGradient>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{event.date}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{event.title}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#00c6ff" />
            <Text style={styles.location}>{event.location}</Text>
          </View>

          <View style={styles.statRow}>
             <View style={styles.stat}>
                <Text style={styles.statValue}>{event.joinedUsers ? event.joinedUsers.length : 0}</Text>
                <Text style={styles.statLabel}>Going</Text>
             </View>
             <View style={styles.divider} />
             <View style={styles.stat}>
                <Text style={styles.statValue}>Open</Text>
                <Text style={styles.statLabel}>Status</Text>
             </View>
          </View>

          <Text style={styles.sectionHeader}>About Event</Text>
          <Text style={styles.description}>{event.description}</Text>

          {/* Join Button */}
          <TouchableOpacity 
            style={[styles.joinBtn, joined && styles.joinedBtn]} 
            onPress={!joined ? handleJoin : null}
            activeOpacity={0.8}
          >
            <Text style={styles.joinBtnText}>
              {joined ? "You are going ✅" : "Join Event"}
            </Text>
          </TouchableOpacity>

          {/* ✅ DELETE BUTTON (Only for Admin or Event Creator) */}
          {(userRole === 'admin' || (userRole === 'organizer' && event.createdBy === userId)) && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.deleteBtnText}>Delete Event</Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },
  imageContainer: { height: 300, width: '100%', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' },
  placeholderImg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dateBadge: { position: 'absolute', bottom: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.7)', padding: 10, borderRadius: 10 },
  dateText: { color: '#fff', fontWeight: 'bold' },
  content: { padding: 20 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  location: { color: '#ddd', marginLeft: 5, fontSize: 16 },
  statRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 15, marginBottom: 20, justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: '#aaa', fontSize: 12 },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  sectionHeader: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  description: { color: '#ccc', lineHeight: 24, fontSize: 15 },
  joinBtn: { marginTop: 30, backgroundColor: '#00c6ff', padding: 15, borderRadius: 15, alignItems: 'center' },
  joinedBtn: { backgroundColor: '#4caf50' },
  joinBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  // Delete Button Styles
  deleteBtn: { marginTop: 20, backgroundColor: '#ff4444', padding: 15, borderRadius: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  deleteBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
