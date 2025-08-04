import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert, Platform } from 'react-native';

// Fotoğrafı otomatik olarak optimize et (boyut küçültme)
const optimizeImage = async (uri) => {
  try {
    const optimized = await ImageManipulator.manipulateAsync(
      uri,
      [
        // Max width 1080px olarak ayarla
        { resize: { width: 1080 } }
      ],
      {
        compress: 0.8, // %80 kalite
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    return optimized.uri;
  } catch (error) {
    console.warn('Image optimization failed:', error);
    return uri; // Optimize edilemezse orijinali döndür
  }
};

export async function pickImage() {
  // Platform spesifik permissions
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeriye erişim için izin vermeniz gerekiyor.');
      return null;
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({ 
    mediaTypes: ImagePicker.MediaType.Images, 
    quality: 1,
    allowsEditing: false, // Kırpma ekranını kaldır
  });
  
  if (!result.canceled && result.assets && result.assets.length > 0) {
    // Fotoğrafı optimize et
    const optimizedUri = await optimizeImage(result.assets[0].uri);
    return optimizedUri;
  }
  return null;
}

export async function takePhoto() {
  // Platform spesifik permissions
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Kamera erişimi için izin vermeniz gerekiyor.');
      return null;
    }
  }

  const result = await ImagePicker.launchCameraAsync({ 
    quality: 1,
    allowsEditing: false, // Kırpma ekranını kaldır
  });
  
  if (!result.canceled && result.assets && result.assets.length > 0) {
    // Fotoğrafı optimize et
    const optimizedUri = await optimizeImage(result.assets[0].uri);
    return optimizedUri;
  }
  return null;
}
