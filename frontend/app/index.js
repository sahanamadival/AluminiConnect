import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import apiClient from '../src/api/client';

import { setItemAsync } from '../src/utils/storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  const handleAuth = async () => {
    try {
      if (isLogin) {
        const res = await apiClient.post('/users/login', { email, password });
        const { token, role, _id } = res.data;
        await setItemAsync('userToken', token);
        await setItemAsync('userRole', role);
        await setItemAsync('userId', _id);

        router.replace('/(tabs)');
      } else {
        const res = await apiClient.post('/users/register', { 
          name, 
          email, 
          password, 
          role: 'student'
        });
        const { token, role, _id } = res.data;
        await setItemAsync('userToken', token);
        await setItemAsync('userRole', role);
        await setItemAsync('userId', _id);

        router.replace('/(tabs)');
      }
    } catch (err) {
      console.log('--- AUTH ERROR ---');
      console.log(err.message, err.response?.data);
      const msg = err.response?.data?.message || err.message || "Authentication Failed.";
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert("Error", msg);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
        <Text style={styles.subtitle}>AlumniConnect Platform</Text>
        
        {!isLogin && (
          <TextInput 
            placeholder="Full Name" 
            style={styles.input} 
            onChangeText={setName} 
            placeholderTextColor="#888" 
          />
        )}
        
        <TextInput 
          placeholder="Email Address" 
          style={styles.input} 
          onChangeText={setEmail} 
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#888" 
        />
        
        <TextInput 
          placeholder="Password" 
          style={styles.input} 
          secureTextEntry 
          onChangeText={setPassword} 
          placeholderTextColor="#888" 
        />
        
        <TouchableOpacity style={styles.button} onPress={handleAuth} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{isLogin ? 'Continue' : 'Sign Up'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleAuthMode} style={styles.switchButton}>
          <Text style={styles.switchText}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F4F6F8' },
  card: { backgroundColor: '#ffffff', padding: 30, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  title: { fontSize: 26, fontWeight: '700', color: '#1A237E', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 30, marginTop: 5 },
  input: { backgroundColor: '#FAFAFA', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#EEE' },
  button: { backgroundColor: '#1A237E', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  switchButton: { marginTop: 25, alignItems: 'center' },
  switchText: { color: '#1A237E', fontSize: 14, fontWeight: '500' }
});