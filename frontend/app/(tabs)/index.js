import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert, Animated } from 'react-native';
import apiClient from '../../src/api/client';
import { getItemAsync, deleteItemAsync } from '../../src/utils/storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeTab() {
  const [role, setRole] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Alumni Specific State
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');

  useEffect(() => {
    checkRoleAndFetch();
  }, []);

  const checkRoleAndFetch = async () => {
    const userRole = await getItemAsync('userRole');
    setRole(userRole);
    fetchUpdates(userRole);
  };

  const fetchUpdates = async (currentRole) => {
    try {
      const token = await getItemAsync('userToken');
      if (currentRole === 'student') {
        const res = await apiClient.get('/projects/recommendations', { headers: { Authorization: `Bearer ${token}` } });
        setItems(res.data);
      } else {
        const res = await apiClient.get('/projects', { headers: { Authorization: `Bearer ${token}` } });
        setItems(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostProject = async () => {
    if (!projectTitle || !description) return Alert.alert("Error", "Please fill required fields");
    try {
      const token = await getItemAsync('userToken');
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
      const res = await apiClient.post('/projects', { title: projectTitle, description, requiredSkills: skillsArray }, { headers: { Authorization: `Bearer ${token}` } });
      setItems([res.data, ...items]);
      setProjectTitle(''); setDescription(''); setSkills('');
      Alert.alert("Success", "Project posted!");
    } catch (error) {
      Alert.alert("Error", "Failed to post");
    }
  };

  const logout = async () => {
    await deleteItemAsync('userToken');
    await deleteItemAsync('userRole');
    await deleteItemAsync('userId');
    router.replace('/');
  };

  const renderStudentItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.project.title}</Text>
      <Text style={styles.cardDesc}>{item.project.description}</Text>
      <View style={styles.aiBadge}>
        <Ionicons name="sparkles" size={16} color="#FF6F00" />
        <Text style={styles.aiText}>AI Match Insight: {item.aiReasoning}</Text>
      </View>
      <TouchableOpacity 
        style={styles.chatBtn} 
        onPress={() => router.push(`/chat/${item.project._id}`)}>
        <Text style={{color:'#fff', fontWeight:'bold'}}>Chat with Alumni</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAlumniItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDesc}>{item.description}</Text>
      <View style={{flexDirection:'row', flexWrap:'wrap', marginTop: 10}}>
        {item.requiredSkills?.map(s => (
          <Text key={s} style={styles.skillTag}>{s}</Text>
        ))}
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator style={{marginTop:50}} size="large" />;

  return (
    <View style={styles.container}>
      {role === 'alumni' && (
        <View style={styles.formCard}>
          <Text style={styles.formHeader}>Post a New Project</Text>
          <TextInput style={styles.input} placeholder="Project Title" value={projectTitle} onChangeText={setProjectTitle} />
          <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} multiline />
          <TextInput style={styles.input} placeholder="Required Skills (comma separated)" value={skills} onChangeText={setSkills} />
          <TouchableOpacity style={styles.postBtn} onPress={handlePostProject}>
            <Text style={{color:'#fff', fontWeight:'bold', textAlign:'center'}}>Post Project</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.headerTitle}>{role === 'student' ? 'Recommended Projects' : 'Your Opportunities'}</Text>
      
      <FlatList
        data={items}
        keyExtractor={(item) => (item.project ? item.project._id : item._id)}
        renderItem={role === 'student' ? renderStudentItem : renderAlumniItem}
        contentContainerStyle={{paddingBottom: 20}}
      />
      
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
         <Text style={{color:'#fff', fontWeight:'bold', textAlign:'center'}}>Logout Securely</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8', padding: 15 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1A237E', marginVertical: 15 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset:{width:0, height:2}, shadowOpacity:0.05 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A237E' },
  cardDesc: { fontSize: 14, color: '#555', marginTop: 5 },
  aiBadge: { flexDirection: 'row', backgroundColor: '#FFF3E0', padding: 10, borderRadius: 8, marginTop: 10 },
  aiText: { color: '#E65100', fontSize: 13, marginLeft: 5, flexShrink: 1 },
  chatBtn: { backgroundColor: '#FF6F00', padding: 12, borderRadius: 8, marginTop: 15, alignItems: 'center' },
  formCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 10, elevation: 3 },
  formHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  input: { backgroundColor: '#F9F9F9', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  postBtn: { backgroundColor: '#1A237E', padding: 15, borderRadius: 8, marginTop: 5 },
  logoutBtn: { backgroundColor: '#D32F2F', padding: 15, borderRadius: 8, marginTop: 10 },
  skillTag: { backgroundColor: '#E8EAF6', color: '#1A237E', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginRight: 8, marginBottom: 8, fontSize: 12 }
});
