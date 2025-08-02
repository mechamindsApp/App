import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resizePhoto } from '../utils/photoUtils';

const API_URL = 'http://localhost:8000/analyze-photo/';

export const analyzePhoto = async (photoUri) => {
  const resizedUri = await resizePhoto(photoUri);
  const formData = new FormData();
  formData.append('file', {
    uri: resizedUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  });
  const token = await AsyncStorage.getItem('userToken');
  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return { error: error.message };
  }
};
