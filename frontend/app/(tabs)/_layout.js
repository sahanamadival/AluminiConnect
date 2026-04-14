import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#FF6F00',
      tabBarInactiveTintColor: '#888',
      headerStyle: { backgroundColor: '#1A237E' },
      headerTintColor: '#fff',
      tabBarStyle: { paddingBottom: 5, paddingTop: 5, height: 60 }
    }}>
      <Tabs.Screen name="index" options={{ title: 'Feed', tabBarIcon: ({ color }) => <Ionicons name="home" size={26} color={color} /> }} />
      <Tabs.Screen name="directory" options={{ title: 'Network', tabBarIcon: ({ color }) => <Ionicons name="search" size={26} color={color} /> }} />
      <Tabs.Screen name="create" options={{ title: 'New', tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={32} color="#FF6F00" /> }} />
      <Tabs.Screen name="projects" options={{ title: 'Jobs', tabBarIcon: ({ color }) => <Ionicons name="briefcase" size={24} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Ionicons name="person-circle" size={26} color={color} /> }} />
    </Tabs>
  );
}
