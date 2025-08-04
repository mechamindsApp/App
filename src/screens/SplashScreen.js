import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const theme = useTheme();

  const handleStartExperience = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        {/* Ana İçerik */}
        <View style={styles.content}>
          {/* Logo/İkon */}
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="camera-iris" size={80} color="white" />
          </View>

          {/* Başlık */}
          <Text variant="displayMedium" style={styles.title}>
            AI Experience
          </Text>
          
          {/* Alt Başlık */}
          <Text variant="headlineSmall" style={styles.subtitle}>
            Fotoğraflarınızı AI ile Keşfedin
          </Text>

          {/* Açıklama */}
          <Text variant="bodyLarge" style={styles.description}>
            Yapay zeka destekli fotoğraf analizi ile görsellerinizi yeni bir perspektiften deneyimleyin
          </Text>

          {/* Özellikler */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <MaterialCommunityIcons name="brain" size={24} color="white" />
              <Text style={styles.featureText}>AI Analiz</Text>
            </View>
            <View style={styles.feature}>
              <MaterialCommunityIcons name="chat" size={24} color="white" />
              <Text style={styles.featureText}>Akıllı Sohbet</Text>
            </View>
            <View style={styles.feature}>
              <MaterialCommunityIcons name="image-multiple" size={24} color="white" />
              <Text style={styles.featureText}>Görsel İşleme</Text>
            </View>
          </View>
        </View>

        {/* Alt Kısım - Buton */}
        <View style={styles.bottomContainer}>
          <Button
            mode="contained"
            onPress={handleStartExperience}
            style={styles.startButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Deneyime Başla
          </Button>
          
          <Text style={styles.footerText}>
            Geleceğin fotoğraf deneyimi burada başlıyor
          </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 400,
  },
  logoContainer: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    color: 'white',
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  bottomContainer: {
    alignItems: 'center',
    width: '100%',
  },
  startButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 30,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  buttonContent: {
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SplashScreen;
