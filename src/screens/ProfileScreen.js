import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, TextInput, Platform, StatusBar } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { pickImage } from '../services/photoService';
import { saveData, getData } from '../storage/storage';

const { width, height } = Dimensions.get('window');

const ProfileScreen = () => {
  const [profilePic, setProfilePic] = useState('https://placehold.co/100x100');
  const [name, setName] = useState('');

  useEffect(() => {
    (async () => {
      const savedPic = await getData('profilePic');
      const savedName = await getData('profileName');
      if (savedPic) setProfilePic(savedPic);
      if (savedName) setName(savedName);
    })();
  }, []);

  const handleChangePhoto = async () => {
    const uri = await pickImage();
    if (uri) {
      setProfilePic(uri);
      await saveData('profilePic', uri);
    }
  };

  const handleChangeName = async (text) => {
    setName(text);
    await saveData('profileName', text);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <TouchableOpacity onPress={handleChangePhoto} style={styles.avatarContainer}>
              <Avatar.Image 
                source={{ uri: profilePic }} 
                size={120} 
                style={styles.avatar}
              />
              <View style={styles.editIconContainer}>
                <MaterialCommunityIcons name="camera" size={20} color="white" />
              </View>
            </TouchableOpacity>
            
            <Text variant="headlineSmall" style={styles.welcomeText}>
              Hoş Geldiniz!
            </Text>
          </View>

          {/* Name Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Adınız</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons 
                name="account" 
                size={20} 
                color="#667eea" 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.nameInput}
                placeholder="Adınızı girin"
                placeholderTextColor="#999"
                value={name}
                onChangeText={handleChangeName}
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Change Photo Button */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={handleChangePhoto}
            >
              <View style={[styles.buttonGradient, { backgroundColor: '#FF6200' }]}>
                <MaterialCommunityIcons name="image" size={24} color="white" />
                <Text style={styles.buttonText}>
                  Profil Fotoğrafını Değiştir
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="camera-image" size={30} color="white" />
              <Text variant="titleLarge" style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Analiz Edilen</Text>
            </View>
            
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="heart" size={30} color="white" />
              <Text variant="titleLarge" style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Favoriler</Text>
            </View>
            
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="share" size={30} color="white" />
              <Text variant="titleLarge" style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Paylaşılan</Text>
            </View>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>Özellikler</Text>
            
            <TouchableOpacity style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <MaterialCommunityIcons name="history" size={24} color="#667eea" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Analiz Geçmişi</Text>
                <Text style={styles.featureSubtitle}>Önceki analizlerinizi görüntüleyin</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <MaterialCommunityIcons name="heart-outline" size={24} color="#667eea" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Favoriler</Text>
                <Text style={styles.featureSubtitle}>Beğendiğiniz analizler</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <MaterialCommunityIcons name="cog-outline" size={24} color="#667eea" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Ayarlar</Text>
                <Text style={styles.featureSubtitle}>Uygulama tercihleriniz</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 100 : 95, // Header yüksekliği kadar padding
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    borderWidth: 4,
    borderColor: 'white',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6200',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  welcomeText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 25,
  },
  inputLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  buttonSection: {
    marginBottom: 30,
  },
  changePhotoButton: {
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
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    gap: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 15,
    minWidth: 80,
  },
  statNumber: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
    textAlign: 'center',
  },
  featuresSection: {
    marginTop: 10,
  },
  featuresTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginLeft: 5,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 13,
    color: '#666',
  },
});

export default ProfileScreen;
