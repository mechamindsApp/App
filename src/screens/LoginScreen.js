import { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/theme';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    // Mock authentication - replace with real Google OAuth later
    setTimeout(() => {
      setIsLoading(false);
      navigation.replace('Tabs');
    }, 1500);
  };

  const inspirationImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=200',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200',
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=200',
  ];

  return (
    <SafeAreaView style={styles.container}>
  <LinearGradient colors={theme.gradient} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AI Experience</Text>
          <Text style={styles.subtitle}>
            Fotoğraflarınızı AI ile analiz edin ve keşfedin
          </Text>
        </View>

        {/* Inspiration Grid */}
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageGrid}>
            {inspirationImages.map((uri, index) => (
              <View key={index} style={styles.imageCard}>
                <Image 
                  source={{ uri }} 
                  style={styles.inspirationImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.imageOverlay}
                />
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Login Section */}
        <View style={styles.loginSection}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <MaterialCommunityIcons 
              name="google" 
              size={24} 
              color="#4285F4" 
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>
              {isLoading ? 'Giriş yapılıyor...' : 'Google ile Devam Et'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Devam ederek Hizmet Şartlarımızı ve Gizlilik Politikamızı kabul etmiş olursunuz.
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 30,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  imageCard: {
    width: (width - 40) / 2,
    height: 200,
    marginBottom: 10,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  inspirationImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  loginSection: {
    paddingHorizontal: 30,
    paddingVertical: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    marginBottom: 20,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  disclaimer: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 16,
  },
});
