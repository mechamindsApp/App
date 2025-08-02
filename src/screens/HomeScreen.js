import React, { useContext } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, useTheme, Card } from 'react-native-paper';
import { takePhoto, pickImage } from '../services/photoService';
import { ThemeContext } from '../context/ThemeContext';

const HomeScreen = ({ navigation }) => {
  const { darkMode } = useContext(ThemeContext);
  const theme = useTheme();

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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>AI Experience App</Text>
          <Button mode="contained" onPress={handleTakePhoto} style={styles.button}>
            Fotoğraf Çek
          </Button>
          <Button mode="outlined" onPress={handlePickImage} style={styles.button}>
            Galeriden Yükle
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { width: 320, padding: 16 },
  title: { marginBottom: 24, textAlign: 'center' },
  button: { marginBottom: 12 },
});

export default HomeScreen;
