import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import apiClient from '../../src/api/client';
import { getItemAsync } from '../../src/utils/storage';
import { router } from 'expo-router';

export default function CreateTab() {
  const [content, setContent] = useState('');
  
  // Generating a highly dynamic placeholder for this specific post
  const randomImageSeed = Math.floor(Math.random() * 1000);
  const placeholderUrl = `https://picsum.photos/seed/${randomImageSeed}/800/800`;

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Hold on', 'Caption cannot be empty');
      return;
    }

    try {
      const token = await getItemAsync('userToken');
      await apiClient.post('/posts', {
        content,
        imageUrl: placeholderUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Success', 'Post shared to the feed!');
      setContent('');
      router.replace('/(tabs)/');
    } catch (error) {
      console.log('Error posting', error);
      Alert.alert('Error', 'Failed to share your post.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Text style={styles.header}>New Post</Text>
      
      <View style={styles.contentContainer}>
        <Image source={{ uri: placeholderUrl }} style={styles.previewImage} />
        <TextInput
          style={styles.input}
          placeholder="Write a caption..."
          placeholderTextColor="#888"
          multiline
          value={content}
          onChangeText={setContent}
        />
      </View>

      <TouchableOpacity style={styles.shareBtn} onPress={handlePost}>
        <Text style={styles.shareText}>Share</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#262626', marginBottom: 20 },
  contentContainer: { flexDirection: 'row', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#DBDBDB', paddingBottom: 20 },
  previewImage: { width: 80, height: 80, resizeMode: 'cover', borderRadius: 8, marginRight: 15 },
  input: { flex: 1, fontSize: 16, minHeight: 80, color: '#262626', paddingTop: 10 },
  shareBtn: { backgroundColor: '#FF6F00', padding: 15, borderRadius: 8, marginTop: 30, alignItems: 'center' },
  shareText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
