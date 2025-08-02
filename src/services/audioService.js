import * as Audio from 'expo-av';

import { Alert } from 'react-native';

export async function startRecording() {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ses kaydı izni gerekli. Lütfen ayarlardan izin verin.');
      return null;
    }
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await recording.startAsync();
    return recording;
  } catch (error) {
    return null;
  }
}

export async function stopRecording(recording) {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    return uri;
  } catch (error) {
    return null;
  }
}
