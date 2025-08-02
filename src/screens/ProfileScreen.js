import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Text, TextInput, Button, Card, useTheme } from 'react-native-paper';
import { pickImage } from '../services/photoService';
import { saveData, getData } from '../storage/storage';

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

  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={{ alignItems: 'center' }}>
          <Avatar.Image source={{ uri: profilePic }} size={100} style={{ marginBottom: 16 }} />
          <TextInput
            mode="outlined"
            label="Adınızı girin"
            value={name}
            onChangeText={handleChangeName}
            style={styles.nameInput}
          />
          <Button mode="contained" onPress={handleChangePhoto} style={styles.button}>
            Profil Fotoğrafını Değiştir
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { width: 320, padding: 16 },
  nameInput: { width: 200, marginBottom: 16 },
  button: { width: 200 },
});

export default ProfileScreen;
