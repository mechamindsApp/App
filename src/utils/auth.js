import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export async function getUserData() {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) return null;
  try {
    const res = await axios.get('http://127.0.0.1:8000/user-data/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    return null;
  }
}

export async function logout() {
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('userInfo');
}
