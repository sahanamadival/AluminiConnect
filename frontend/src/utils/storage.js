import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const setItemAsync = async (key, value) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

export const getItemAsync = async (key) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

export const deleteItemAsync = async (key) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};
