import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import io from 'socket.io-client';
import { getItemAsync } from '../../src/utils/storage';
import apiClient from '../../src/api/client';
import { Ionicons } from '@expo/vector-icons';

// Using the same IP as API
const SOCKET_URL = 'http://172.25.17.159:5000';

export default function ChatScreen() {
  const { projectId } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [userId, setUserId] = useState('');
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    setupChat();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const setupChat = async () => {
    try {
      const token = await getItemAsync('userToken');
      const uId = await getItemAsync('userId');
      setUserId(uId);

      // Fetch history
      const res = await apiClient.get(`/chat/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
      
      // Setup socket
      socketRef.current = io(SOCKET_URL);
      socketRef.current.emit('join_project', projectId);

      socketRef.current.on('receive_message', (newMsg) => {
        setMessages((prev) => [...prev, newMsg]);
      });
    } catch (err) {
      console.log('Error setting up chat:', err);
    }
  };

  const sendMessage = () => {
    if (!text.trim() || !socketRef.current || !userId) return;

    socketRef.current.emit('send_message', {
      projectId,
      senderId: userId,
      text: text.trim()
    });
    
    setText('');
  };

  const renderMessage = ({ item }) => {
    // If our backend populated the sender object, item.sender._id might exist. Otherwise item.sender is just ID string.
    const isSender = (item.sender?._id || item.sender) === userId;
    const senderName = item.sender?.name || 'Unknown User';
    
    return (
      <View style={[styles.messageBubble, isSender ? styles.myBubble : styles.theirBubble]}>
        {!isSender && <Text style={styles.senderName}>{senderName}</Text>}
        <Text style={[styles.messageText, isSender ? styles.myText : styles.theirText]}>{item.text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discussion Room</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#888"
            value={text}
            onChangeText={setText}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  header: { backgroundColor: '#1A237E', paddingVertical: 15, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'android' ? 40 : 15 },
  backBtn: { marginRight: 15 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  listContent: { padding: 15 },
  messageBubble: { padding: 12, borderRadius: 18, marginBottom: 10, maxWidth: '80%' },
  myBubble: { backgroundColor: '#FF6F00', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#FFF', alignSelf: 'flex-start', borderBottomLeftRadius: 4, elevation: 1 },
  senderName: { fontSize: 11, color: '#3949AB', fontWeight: 'bold', marginBottom: 4 },
  myText: { color: '#FFF', fontSize: 15 },
  theirText: { color: '#333', fontSize: 15 },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F4F6F8', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, fontSize: 15, color: '#333' },
  sendButton: { backgroundColor: '#1A237E', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }
});
