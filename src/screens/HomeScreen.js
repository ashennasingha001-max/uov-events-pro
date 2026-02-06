import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  Dimensions, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Firebase Imports
import {
  arrayUnion,
  collection,
  doc, getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('student');
  const [userId, setUserId] = useState('');

  // 1. User Role & ID 
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setUserId(user.uid);
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data()?.role || 'student');
          }
        }
      } catch (error) {
        console.log("Error fetching role:", error);
      }
    };
    fetchUserRole();
  }, []);

  // 2. Events Fetch(Real-time)
  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsList = [];
      querySnapshot.forEach((doc) => {
        eventsList.push({ 
          id: doc.id, 
          ...doc.data(),
          joinedUsers: doc.data().joinedUsers || [] 
        });
      });
      setEvents(eventsList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 3. Join Event Function
  const handleJoin = async (eventId) => {
    if (!auth.currentUser) return;

    try {
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, {
        joinedUsers: arrayUnion(auth.currentUser.uid)
      });
      Alert.alert("Success", "You have successfully joined the event! 🎉");
    } catch (error) {
      Alert.alert("Error", "Could not join event: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* ✅ 1. Purple Gradient Background (Updated) */}
      <LinearGradient colors={['#4a00e0', '#8e2de2']} style={styles.background} />

      {/* ✅ 2. Floating Bubbles Effect (New) */}
      <View style={[styles.bubble, { top: 50, left: -30, width: 120, height: 120, backgroundColor: 'rgba(255,255,255,0.1)' }]} />
      <View style={[styles.bubble, { top: height * 0.25, right: -40, width: 180, height: 180, backgroundColor: 'rgba(255,255,255,0.05)' }]} />
      <View style={[styles.bubble, { bottom: 100, left: 20, width: 80, height: 80, backgroundColor: 'rgba(255,255,255,0.08)' }]} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.username}>
            {userRole === 'admin' ? 'Admin 👑' : userRole === 'organizer' ? 'Organizer 🎤' : 'Student 👋'}
          </Text>
        </View>
        
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileBtn}>
          <Ionicons name="person-circle-outline" size={40} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <BlurView intensity={30} tint="light" style={styles.glassBanner}>
            <LinearGradient colors={['#FF00CC', '#333399']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.bannerGradient}>
                <Text style={styles.bannerTitle}>Welcome to UOV Events</Text>
                <Text style={styles.bannerSubtitle}>Check out the latest updates!</Text>
            </LinearGradient>
          </BlurView>
        </View>

        <Text style={styles.sectionTitle}>Upcoming Events</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
        ) : (
          <>
            {events.length === 0 ? (
              <View style={styles.emptyContainer}>
                  <Ionicons name="calendar-outline" size={50} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.noEventsText}>No events scheduled yet.</Text>
              </View>
            ) : (
              events.map((event) => {
                const isJoined = event.joinedUsers.includes(userId);

                return (
                  <TouchableOpacity 
                    key={event.id} 
                    style={styles.cardContainer}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('EventDetails', { event: event })}
                  >
                    <BlurView intensity={40} tint="dark" style={styles.glassCard}>
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <View style={styles.row}>
                            <Ionicons name="calendar" size={14} color="#00c6ff" style={{marginRight:5}} />
                            <Text style={styles.eventDate}>{event.date}</Text>
                        </View>
                        <View style={styles.row}>
                            <Ionicons name="location" size={14} color="#ff00cc" style={{marginRight:5}} />
                            <Text style={styles.eventLocation}>{event.location}</Text>
                        </View>
                        <Text style={styles.eventDesc} numberOfLines={2}>{event.description}</Text>
                        <Text style={styles.participantCount}>👥 {event.joinedUsers.length} joining</Text>
                      </View>
                      
                      <TouchableOpacity 
                        style={[styles.registerBtn, isJoined && styles.joinedBtn]} 
                        onPress={() => !isJoined && handleJoin(event.id)}
                        disabled={isJoined} 
                      >
                        <Text style={styles.registerBtnText}>
                          {isJoined ? "Joined" : "Join"}
                        </Text>
                      </TouchableOpacity>

                    </BlurView>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      {/* Organizer/Admin Add Button */}
      {(userRole === 'admin' || userRole === 'organizer') && (
        <TouchableOpacity 
          style={styles.floatingBtn} 
          onPress={() => navigation.navigate('AddEvent')}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Admin Dashboard Button */}
      {userRole === 'admin' && (
        <TouchableOpacity 
          style={styles.adminBtn} 
          onPress={() => navigation.navigate('AdminDashboard')}
        >
          <Ionicons name="settings-sharp" size={24} color="#fff" />
        </TouchableOpacity>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, height: height },
  
  // ✅ Bubble Style added
  bubble: { position: 'absolute', borderRadius: 1000 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  greeting: { color: '#e0e0e0', fontSize: 16 },
  username: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  profileBtn: { opacity: 0.9 },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  
  bannerContainer: { marginBottom: 30, marginTop: 10, borderRadius: 20, overflow: 'hidden' },
  glassBanner: { borderRadius: 20, overflow: 'hidden' },
  bannerGradient: { padding: 25, alignItems: 'center' },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  bannerSubtitle: { color: '#e0e0e0', fontSize: 14, marginTop: 5 },
  
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15, marginLeft: 5 },
  
  emptyContainer: { alignItems: 'center', marginTop: 40, opacity: 0.7 },
  noEventsText: { color: '#fff', textAlign: 'center', marginTop: 10, fontSize: 16 },
  
  cardContainer: { marginBottom: 15, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  glassCard: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventInfo: { flex: 1, paddingRight: 10 },
  eventTitle: { color: '#fff', fontSize: 19, fontWeight: 'bold', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  eventDate: { color: '#e0e0e0', fontSize: 13, fontWeight: '600' },
  eventLocation: { color: '#e0e0e0', fontSize: 13 },
  eventDesc: { color: '#aaa', fontSize: 12, marginTop: 5, marginBottom: 5 },
  participantCount: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: 5, opacity: 0.8 },

  registerBtn: { backgroundColor: '#00c6ff', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, height: 36, justifyContent: 'center', shadowColor: "#00c6ff", shadowOpacity: 0.4, shadowRadius: 5 },
  joinedBtn: { backgroundColor: 'rgba(50, 255, 100, 0.2)', borderWidth: 1, borderColor: '#4ade80', shadowOpacity: 0 }, 
  registerBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  // Floating Buttons
  floatingBtn: { position: 'absolute', bottom: 30, right: 20, width: 65, height: 65, borderRadius: 35, backgroundColor: '#ff00cc', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },

  adminBtn: {
    position: 'absolute',
    bottom: 110,
    right: 28,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
});
