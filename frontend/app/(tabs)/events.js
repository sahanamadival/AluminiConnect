import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import apiClient from '../../src/api/client';
import { getItemAsync } from '../../src/utils/storage';
import { Ionicons } from '@expo/vector-icons';

export default function EventsTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = await getItemAsync('userToken');
      const res = await apiClient.get('/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data);
    } catch (error) {
      console.log('Failed to fetch events', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={{marginTop:50}} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upcoming Events</Text>
      
      {events.length === 0 && (
        <Text style={styles.empty}>No upcoming events scheduled. Check back soon!</Text>
      )}

      <FlatList
        data={events}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.row}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{item.location}</Text>
            </View>
            <Text style={styles.desc}>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8', padding: 15 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1A237E', marginBottom: 15 },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 15, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#1A237E' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  metaText: { color: '#666', fontSize: 14, marginLeft: 8 },
  desc: { color: '#444', fontSize: 14, marginTop: 10, lineHeight: 20 }
});
