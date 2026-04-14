import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator, TouchableOpacity, TouchableWithoutFeedback, Animated } from 'react-native';
import apiClient from '../../src/api/client';
import { getItemAsync } from '../../src/utils/storage';
import { Ionicons } from '@expo/vector-icons';

const InteractivePost = ({ item, currentUserId }) => {
  const [liked, setLiked] = useState(item.likes.includes(currentUserId));
  const [likeCount, setLikeCount] = useState(item.likes.length);
  const heartScale = useRef(new Animated.Value(0)).current;
  let lastTap = null;

  const toggleLike = async () => {
    try {
      const token = await getItemAsync('userToken');
      // Optimistic UI Update
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
      
      if (!liked) triggerHeartAnim();
      
      await apiClient.put(`/posts/${item._id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.log('Error liking', error);
      // Revert if failed
      setLiked(!liked);
      setLikeCount(liked ? likeCount + 1 : likeCount - 1);
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (lastTap && (now - lastTap) < DOUBLE_PRESS_DELAY) {
      if (!liked) toggleLike();
      else triggerHeartAnim(); // pop again even if already liked
    } else {
      lastTap = now;
    }
  };

  const triggerHeartAnim = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, tension: 50, friction: 5 }),
      Animated.timing(heartScale, { toValue: 0, duration: 1000, useNativeDriver: true })
    ]).start();
  };

  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{item.authorName.charAt(0)}</Text></View>
        <Text style={styles.authorName}>{item.authorName}</Text>
      </View>
      
      <TouchableWithoutFeedback onPress={handleDoubleTap}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
          <Animated.View style={[styles.giantHeart, { transform: [{ scale: heartScale }] }]}>
            <Ionicons name="heart" size={100} color="rgba(255, 255, 255, 0.9)" />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      <View style={styles.actionRow}>
        <TouchableOpacity onPress={toggleLike} style={styles.actionIcon}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={28} color={liked ? "#ED4956" : "#262626"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIcon}>
          <Ionicons name="chatbubble-outline" size={26} color="#262626" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIcon}>
          <Ionicons name="paper-plane-outline" size={26} color="#262626" />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomInfo}>
        <Text style={styles.likesText}>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</Text>
        <View style={styles.captionRow}>
          <Text style={styles.captionAuthor}>{item.authorName}</Text>
          <Text style={styles.captionText}>{item.content}</Text>
        </View>
        <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </View>
  );
};

export default function FeedTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = await getItemAsync('userToken');
      const uId = await getItemAsync('userId');
      setCurrentUserId(uId);
      
      const res = await apiClient.get('/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
    } catch (error) {
      console.log('Failed to fetch feed', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEmpty = () => {
    if (loading) return <ActivityIndicator style={{marginTop:50}} size="large" />;
    return <Text style={styles.emptyText}>No posts yet. Be the first to share an update!</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={item => item._id}
        renderItem={({ item }) => <InteractivePost item={item} currentUserId={currentUserId} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshing={loading}
        onRefresh={fetchPosts}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' },
  postContainer: { marginBottom: 15 },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1A237E', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  authorName: { fontWeight: 'bold', fontSize: 14, color: '#262626' },
  imageContainer: { width: '100%', height: 400, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center' },
  postImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  giantHeart: { position: 'absolute' },
  actionRow: { flexDirection: 'row', padding: 10 },
  actionIcon: { marginRight: 15 },
  bottomInfo: { paddingHorizontal: 10 },
  likesText: { fontWeight: 'bold', color: '#262626', marginBottom: 5 },
  captionRow: { flexDirection: 'row', flexWrap: 'wrap' },
  captionAuthor: { fontWeight: 'bold', color: '#262626', marginRight: 5 },
  captionText: { color: '#262626' },
  dateText: { color: '#8E8E8E', fontSize: 11, marginTop: 5, textTransform: 'uppercase' }
});
