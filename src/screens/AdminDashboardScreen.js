import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { collection, deleteDoc, doc, onSnapshot, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../config/firebase';

export default function AdminDashboardScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

 
  const currentAdminId = auth.currentUser?.uid;

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
      setFilteredUsers(userList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Search Function
  const handleSearch = (text) => {
    setSearch(text);
    if (text) {
      const newData = users.filter(item => {
        const itemData = item.regNo ? item.regNo.toUpperCase() : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1 || (item.email && item.email.toUpperCase().includes(textData));
      });
      setFilteredUsers(newData);
    } else {
      setFilteredUsers(users);
    }
  };

  // ✅ 1. Approve User (Pending -> Approved)
  const approveUser = async (id) => {
    try { await updateDoc(doc(db, "users", id), { status: 'approved' }); Alert.alert("Approved ✅"); } 
    catch (e) { Alert.alert("Error", e.message); }
  };

  // ✅ 2. Make Organizer (Student -> Organizer)
  const makeOrganizer = async (id) => {
    try { await updateDoc(doc(db, "users", id), { role: 'organizer' }); Alert.alert("Promoted 🎤", "User is now an Organizer!"); } 
    catch (e) { Alert.alert("Error", e.message); }
  };

  // ✅ 3. Demote to Student (Organizer -> Student)
  const makeStudent = async (id) => {
    Alert.alert(
      "Demote User",
      "Change role back to Student?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Demote", 
          onPress: async () => {
            try { await updateDoc(doc(db, "users", id), { role: 'student' }); Alert.alert("Demoted ⬇️", "User is now a Student."); } 
            catch (e) { Alert.alert("Error", e.message); }
          }
        }
      ]
    );
  };

  // ✅ 4. Delete User (Any User)
  const deleteUser = async (id) => {
    Alert.alert(
      "Delete User",
      "Are you sure? This will permanently remove the user.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try { await deleteDoc(doc(db, "users", id)); Alert.alert("Deleted 🗑️", "User removed successfully."); } 
            catch (e) { Alert.alert("Error", e.message); }
          }
        }
      ]
    );
  };

  const renderUser = ({ item }) => {
    ෑ
    const isMe = item.id === currentAdminId;

    return (
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <Text style={styles.regNo}>{item.regNo} {isMe && "(You)"}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <Text style={styles.status}>Status: <Text style={{ color: item.status === 'approved' ? '#0f0' : '#f00' }}> {item.status?.toUpperCase()}</Text></Text>
          <Text style={styles.role}>Role: <Text style={{ fontWeight: 'bold', color: '#00c6ff' }}>{item.role?.toUpperCase()}</Text></Text>
        </View>

        <View style={styles.actions}>
          
          {/* PENDING Users: Approve or Reject */}
          {item.status === 'pending' && (
            <>
              <TouchableOpacity onPress={() => approveUser(item.id)} style={styles.approveBtn}>
                <Ionicons name="checkmark" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteUser(item.id)} style={styles.rejectBtn}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </>
          )}

          {/* APPROVED Users: Promote/Demote/Delete */}
          {item.status === 'approved' && !isMe && (
            <>
              {/* Make Organizer Button */}
              {item.role === 'student' && (
                <TouchableOpacity onPress={() => makeOrganizer(item.id)} style={styles.orgBtn}>
                  <Ionicons name="mic-outline" size={18} color="#fff" />
                  <Text style={styles.btnText}> Prom</Text>
                </TouchableOpacity>
              )}

              {/* Make Student (Demote) Button */}
              {item.role === 'organizer' && (
                <TouchableOpacity onPress={() => makeStudent(item.id)} style={styles.demoteBtn}>
                  <Ionicons name="arrow-down-circle-outline" size={18} color="#fff" />
                  <Text style={styles.btnText}> Demote</Text>
                </TouchableOpacity>
              )}

              {/* Delete Button (Always visible for approved users except me) */}
              <TouchableOpacity onPress={() => deleteUser(item.id)} style={styles.deleteIconBtn}>
                <Ionicons name="trash-outline" size={20} color="#ff4444" />
              </TouchableOpacity>
            </>
          )}

        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#141e30', '#243b55']} style={styles.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#ccc" style={{ marginRight: 10 }} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search Reg No or Email..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? <ActivityIndicator color="#fff" /> : (
        <FlatList 
          data={filteredUsers}
          keyExtractor={item => item.id}
          renderItem={renderUser}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  header: { marginTop: 50, padding: 20, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  searchContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 20, padding: 10, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  searchInput: { color: '#fff', flex: 1 },
  
  userCard: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flex: 1 },
  regNo: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  email: { color: '#ccc', fontSize: 12 },
  status: { color: '#ddd', fontSize: 12, marginTop: 5 },
  role: { color: '#aaa', fontSize: 12 },
  
  actions: { flexDirection: 'row', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 3 },
  
  // Buttons
  approveBtn: { backgroundColor: 'green', padding: 8, borderRadius: 5, marginRight: 5 },
  rejectBtn: { backgroundColor: 'red', padding: 8, borderRadius: 5 },
  
  orgBtn: { backgroundColor: '#FF00CC', padding: 8, borderRadius: 5, flexDirection: 'row', alignItems: 'center', marginRight: 5 },
  demoteBtn: { backgroundColor: '#FF8800', padding: 8, borderRadius: 5, flexDirection: 'row', alignItems: 'center', marginRight: 5 }, // Orange for Demote
  
  deleteIconBtn: { padding: 8, backgroundColor: 'rgba(255,0,0,0.1)', borderRadius: 5, marginLeft: 5 }, // Trash Icon
});
