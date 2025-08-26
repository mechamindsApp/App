import { useState, useContext } from 'react';
import { View, StyleSheet, Image, Dimensions, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { takePhoto, pickImage } from '../services/photoService';
import { ThemeContext } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/theme';

const { width, height } = Dimensions.get('window');

export default function PhotoPreviewScreen({ route, navigation }) {
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;
  const initialUri = route?.params?.photoUri || null;
  const [uri, setUri] = useState(initialUri);
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    if (!uri) {
      Alert.alert('Fotoğraf seçilmedi');
      return;
    }
    navigation.replace('PhotoChat', { photoUri: uri });
  };

  const handlePick = async () => {
    setLoading(true);
    const newUri = await pickImage();
    setLoading(false);
    if (newUri) setUri(newUri);
  };

  const handleCamera = async () => {
    setLoading(true);
    const newUri = await takePhoto();
    setLoading(false);
    if (newUri) setUri(newUri);
  };

  return (
    <View style={styles.container}>
  <LinearGradient colors={theme.gradient} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.title}>Önizleme</Text>
          <Text style={styles.subtitle}>Görseli onaylayın veya yeniden seçin</Text>
        </View>

        <View style={styles.previewArea}>
          {loading ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : uri ? (
            <Image source={{ uri }} style={styles.image} resizeMode="contain" />
          ) : (
            <Text style={styles.noImage}>Henüz görsel seçilmedi</Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.secondary]} onPress={handlePick}>
            <MaterialCommunityIcons name="image" size={22} color="#333" />
            <Text style={styles.secondaryText}>Galeriden Seç</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.secondary]} onPress={handleCamera}>
            <MaterialCommunityIcons name="camera" size={22} color="#333" />
            <Text style={styles.secondaryText}>Fotoğraf Çek</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.primary]} onPress={handleConfirm} disabled={!uri}>
            <MaterialCommunityIcons name="check" size={22} color="#fff" />
            <Text style={styles.primaryText}>Tamam</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 110, paddingBottom: 12, alignItems: 'center' },
  title: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  subtitle: { color: '#fff', opacity: 0.85, marginTop: 4 },
  previewArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: width - 32, height: height * 0.55, borderRadius: 12 },
  noImage: { color: '#fff', opacity: 0.8 },
  actions: { paddingBottom: 36, gap: 12 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 24, gap: 10 },
  primary: { backgroundColor: '#FF6200' },
  secondary: { backgroundColor: 'rgba(255,255,255,0.9)' },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondaryText: { color: '#333', fontWeight: '600' },
});