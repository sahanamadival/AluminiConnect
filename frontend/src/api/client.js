import axios from 'axios';

import { Platform } from 'react-native';

const API_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000/api' 
  : 'http://172.25.17.159:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

export default apiClient;