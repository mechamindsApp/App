import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

export async function pickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
  if (!result.cancelled) {
    return result.uri;
  }
  return null;
}

export async function takePhoto() {
  const { status } = await Camera.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Kamera izni gerekli. Lütfen ayarlardan izin verin.');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({ quality: 1 });
  if (!result.cancelled) {
    return result.uri;
  }
  return null;
}
