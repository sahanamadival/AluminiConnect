import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import apiClient from '../../src/api/client';
import { getItemAsync } from '../../src/utils/storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DirectoryTab() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      const token = await getItemAsync('userToken');
      const res = await apiClient.get('/users/alumni', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlumni(res.data);
    } catch (error) {
      console.log('Failed to fetch alumni', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={{marginTop:50}} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Alumni Network</Text>
      <FlatList
        data={alumni}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.gradYear}>Class of {item.graduationYear || 'N/A'}</Text>
              </View>
            </View>
            <Text style={styles.bio}>{item.bio || 'No bio provided.'}</Text>
            
            <View style={styles.skillContainer}>
              {item.skills?.map(skill => (
                <Text key={skill} style={styles.skillBadge}>{skill}</Text>
              ))}
            </View>

            <TouchableOpacity style={styles.messageBtn} onPress={() => router.push(`/chat/${item._id}`)}>
              <Ionicons name="chatbubble" size={16} color="#fff" />
              <Text style={styles.messageText}>Connect</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8', padding: 15 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1A237E', marginBottom: 15 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#3949AB', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  gradYear: { color: '#666', fontSize: 14 },
  bio: { color: '#555', fontSize: 14, marginBottom: 10, fontStyle: 'italic' },
  skillContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  skillBadge: { backgroundColor: '#E0E0E0', color: '#333', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginRight: 5, marginBottom: 5, fontSize: 12 },
  messageBtn: { backgroundColor: '#FF6F00', flexDirection: 'row', justifyContent: 'center', padding: 12, borderRadius: 8, alignItems: 'center' },
  messageText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 }
});
