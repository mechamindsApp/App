import React, { useContext } from 'react';
import { View, StyleSheet, Alert, Dimensions, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { takePhoto, pickImage } from '../services/photoService';
import { ThemeContext } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { darkMode } = useContext(ThemeContext);

  const handleTakePhoto = async () => {
    const uri = await takePhoto();
    if (uri) {
      navigation.navigate('PhotoChat', { photoUri: uri });
    } else {
      Alert.alert('Kamera erişimi reddedildi veya işlem iptal edildi.');
    }
  };

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri) {
      navigation.navigate('PhotoChat', { photoUri: uri });
    } else {
      Alert.alert('Galeri erişimi reddedildi veya işlem iptal edildi.');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <MaterialCommunityIcons name="camera-iris" size={60} color="white" />
          <Text variant="headlineLarge" style={styles.title}>
            Deneyiminizi Başlatın
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Fotoğrafınızı AI ile analiz edin ve keşfedin
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTakePhoto}
          >
            <View style={[styles.buttonGradient, { backgroundColor: '#FF6200' }]}>
              <MaterialCommunityIcons name="camera" size={32} color="white" />
              <Text variant="titleMedium" style={styles.buttonText}>
                Fotoğraf Çek
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePickImage}
          >
            <View style={[styles.buttonGradient, { backgroundColor: '#E0E0E0' }]}>
              <MaterialCommunityIcons name="image" size={32} color="black" />
              <Text variant="titleMedium" style={[styles.buttonText, { color: 'black' }]}>
                Galeriden Seç
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Features Preview */}
        <View style={styles.featuresSection}>
          <View style={styles.feature}>
            <MaterialCommunityIcons name="brain" size={24} color="white" />
            <Text style={styles.featureText}>AI Analiz</Text>
          </View>
          <View style={styles.feature}>
            <MaterialCommunityIcons name="lightbulb-on" size={24} color="white" />
            <Text style={styles.featureText}>Deneyimsel Öneriler</Text>
          </View>
          <View style={styles.feature}>
            <MaterialCommunityIcons name="eye" size={24} color="white" />
            <Text style={styles.featureText}>Görsel Anlama</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 100 : 95, // Header yüksekliği kadar padding
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  actionSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  actionButton: {
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 25,
    gap: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  featuresSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 40,
    paddingTop: 20,
  },
  feature: {
    alignItems: 'center',
    opacity: 0.8,
  },
  featureText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default HomeScreen;
