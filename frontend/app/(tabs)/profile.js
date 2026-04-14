import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import apiClient from '../../src/api/client';
import { getItemAsync } from '../../src/utils/storage';

export default function ProfileTab() {
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [graduationYear, setGraduationYear] = useState('');

  const handleUpdate = async () => {
    try {
      const token = await getItemAsync('userToken');
      const skillsArray = skills ? skills.split(',').map(s => s.trim()).filter(s => s) : undefined;
      
      const payload = {};
      if (bio) payload.bio = bio;
      if (skillsArray) payload.skills = skillsArray;
      if (graduationYear) payload.graduationYear = parseInt(graduationYear);

      await apiClient.put('/users/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert('Success', 'Profile updated successfully!');
      setBio('');
      setSkills('');
      setGraduationYear('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Try again.');
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Your Bio</Text>
        <TextInput 
          style={styles.input} 
          placeholder="I am a software engineer..." 
          value={bio} 
          onChangeText={setBio} 
          multiline 
        />

        <Text style={styles.label}>Skills (comma separated)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="React, Node.js, Python" 
          value={skills} 
          onChangeText={setSkills} 
        />

        <Text style={styles.label}>Graduation Year</Text>
        <TextInput 
          style={styles.input} 
          placeholder="2024" 
          keyboardType="numeric"
          value={graduationYear} 
          onChangeText={setGraduationYear} 
        />

        <TouchableOpacity style={styles.btn} onPress={handleUpdate}>
          <Text style={styles.btnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8', padding: 15 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1A237E', marginBottom: 15 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 2 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#EEE', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 10 },
  btn: { backgroundColor: '#1A237E', padding: 15, borderRadius: 8, marginTop: 20, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
