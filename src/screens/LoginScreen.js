import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Checkbox, ActivityIndicator, Snackbar, useTheme } from 'react-native-paper';
import * as Google from 'expo-auth-session/providers/google';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { logLogin, logError } from '../services/errorTrackingService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  const handleLogin = async () => {
    setError(null);
    if (!privacyChecked) {
      setError('Lütfen gizlilik sözleşmesini kabul edin.');
      return;
    }
    setLoading(true);
    promptAsync();
  };

  React.useEffect(() => {
    const sendUserToBackend = async () => {
      if (response?.type === 'success') {
        try {
          const userInfo = response.authentication?.id_token
            ? JSON.parse(atob(response.authentication.id_token.split('.')[1]))
            : {};
          // userInfo: { sub, email, name, picture }
          const res = await axios.post('http://127.0.0.1:8000/login/', {
            google_id: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
          });
          if (res.data.success && res.data.token) {
            await AsyncStorage.setItem('userToken', res.data.token);
            await AsyncStorage.setItem('userInfo', JSON.stringify(res.data.user));
            await logLogin(res.data.user?.email || res.data.user?.id || 'unknown', 'google');
            navigation.replace('Tabs');
          } else {
            setError('Backend oturum açma başarısız.');
            await logError(res.data.user?.email || 'unknown', 'LoginScreen', 'Backend oturum açma başarısız.');
          }
        } catch (err) {
          setError('Backend bağlantı hatası.');
          await logError('unknown', 'LoginScreen', 'Backend bağlantı hatası.');
        }
      } else if (response?.type === 'error') {
        setError('Google ile giriş başarısız.');
        await logError('unknown', 'LoginScreen', 'Google ile giriş başarısız.');
      }
      setLoading(false);
    };
    sendUserToBackend();
  }, [response]);

  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Ionicons name="person-circle-outline" size={64} color={theme.colors.primary} style={{ marginBottom: 16 }} />
      <Text variant="headlineMedium" style={styles.title}>Hoşgeldiniz</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>AI Deneyim Uygulamasına giriş yapın</Text>
      <View style={styles.privacyRow}>
        <Checkbox
          status={privacyChecked ? 'checked' : 'unchecked'}
          onPress={() => setPrivacyChecked(!privacyChecked)}
        />
        <Text style={styles.privacyText}>Gizlilik sözleşmesini okudum ve kabul ediyorum.</Text>
      </View>
      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        duration={4000}
        style={{ backgroundColor: theme.colors.error, marginBottom: 8 }}>
        {error}
      </Snackbar>
      {loading ? (
        <ActivityIndicator animating={true} size="large" style={{ marginVertical: 16 }} />
      ) : (
        <Button mode="contained" onPress={handleLogin} disabled={!request}>
          Google ile Giriş Yap
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { marginBottom: 8, textAlign: 'center' },
  subtitle: { marginBottom: 24, textAlign: 'center' },
  privacyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  privacyText: { marginLeft: 8, fontSize: 14 },
});

export default LoginScreen;
