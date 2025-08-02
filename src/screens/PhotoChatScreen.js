import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, TextInput, Modal, ActivityIndicator, Card, Snackbar, useTheme } from 'react-native-paper';
import { ThemeContext } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/theme';
import VoiceInputBar from '../components/VoiceInputBar';
import { analyzePhoto, sendFeedback } from '../services/apiService';
import { logPhotoAnalyzed, logFeedbackSent } from '../services/analyticsService';
import { logError } from '../services/errorTrackingService';
import { logPhotoAnalyzed, logFeedbackSent } from '../services/analyticsService';
import { startRecording, stopRecording } from '../services/audioService';
import { getUserData, logout } from '../utils/auth';

const PhotoChatScreen = ({ route, navigation }) => {
  const { photoUri } = route.params || {};
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const { darkMode } = useContext(ThemeContext);
  const theme = useTheme();

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (photoUri) {
        setLoading(true);
        setError(null);
        try {
          const result = await analyzePhoto(photoUri);
          let userId = null;
          try {
            const userData = await getUserData();
            userId = userData?.user?.email || userData?.user?.id || null;
          } catch {}
          if (result && result.error) {
            if (result.error.includes('Token')) {
              await logout();
              navigation.replace('Login');
              return;
            }
            if (result.error.includes('Uygunsuz fotoğraf')) {
              setMessages([]);
              setError('Bu tür fotoğrafları inceleyemiyoruz. Lütfen başka bir fotoğraf seçin.');
              setLoading(false);
              if (userId) await logPhotoAnalyzed(userId, 'photo.jpg', 'nsfw');
              return;
            }
            setMessages([]);
            setError(result.error);
            if (userId) await logPhotoAnalyzed(userId, 'photo.jpg', 'error');
            if (userId) await logError(userId, 'PhotoChatScreen', result.error);
          } else if (result && result.experience) {
            setMessages([{ id: Date.now(), text: result.experience }]);
            setShowFeedback(true); // AI yanıtı geldiyse feedback modalını aç
            if (userId) await logPhotoAnalyzed(userId, 'photo.jpg', 'success');
          } else {
            setMessages([]);
            setError('AI yanıtı alınamadı.');
            if (userId) await logPhotoAnalyzed(userId, 'photo.jpg', 'no_experience');
            if (userId) await logError(userId, 'PhotoChatScreen', 'AI yanıtı alınamadı.');
          }
        } catch (err) {
          setMessages([]);
          setError('Sunucuya bağlanılamadı.');
          try {
            const userData = await getUserData();
            const userId = userData?.user?.email || userData?.user?.id || null;
            if (userId) await logError(userId, 'PhotoChatScreen', 'Sunucuya bağlanılamadı.');
          } catch {}
        }
        setLoading(false);
      }
    };
    fetchAnalysis();

    // Kullanıcıya özel veri örneği (chat geçmişi vs.)
    const fetchUserData = async () => {
      const userData = await getUserData();
      if (userData && userData.data) {
        // Özel veri örneği: chat geçmişi, vs.
        // setMessages(prev => [...prev, ...userData.data.map((d, i) => ({ id: 'user-' + i, text: d }))]);
      }
    };
    fetchUserData();
  }, [photoUri]);

  // Feedback gönderme fonksiyonu
  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return;
    try {
      await sendFeedback(feedbackText);
      let userId = null;
      try {
        const userData = await getUserData();
        userId = userData?.user?.email || userData?.user?.id || null;
      } catch {}
      if (userId) await logFeedbackSent(userId, feedbackText.length);
      setFeedbackSent(true);
      setShowFeedback(false);
      setFeedbackText('');
      Alert.alert('Teşekkürler!', 'Geri bildiriminiz kaydedildi.');
    } catch (err) {
      Alert.alert('Hata', 'Geri bildirim gönderilemedi.');
    }
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages(prev => [...prev, { id: Date.now(), text: input }]);
      setInput('');
    }
  };

  const handleVoicePress = async () => {
    if (!isRecording) {
      const rec = await startRecording();
      if (rec) {
        setRecording(rec);
        setIsRecording(true);
      } else {
        Alert.alert('Ses kaydı başlatılamadı.');
      }
    } else {
      const uri = await stopRecording(recording);
      setIsRecording(false);
      setRecording(null);
      if (uri) {
        setMessages(prev => [...prev, { id: Date.now(), text: 'Sesli mesaj gönderildi: ' + uri }]);
      } else {
        Alert.alert('Ses kaydı alınamadı.');
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      {photoUri && (
        <Card style={styles.photoCard}>
          <Image source={{ uri: photoUri }} style={styles.photo} />
        </Card>
      )}
      {loading ? (
        <ActivityIndicator animating={true} size="large" style={{ marginTop: 32 }} />
      ) : error ? (
        <Snackbar
          visible={!!error}
          onDismiss={() => setError(null)}
          duration={4000}
          style={{ backgroundColor: theme.colors.error, margin: 16 }}>
          {error}
        </Snackbar>
      ) : (
        <ScrollView style={styles.chatContainer}>
          {messages.map(msg => (
            <Card key={msg.id} style={styles.bubble}>
              <Card.Content>
                <Text style={{ color: theme.colors.onSurface }}>{msg.text}</Text>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
      <Modal visible={showFeedback} onDismiss={() => setShowFeedback(false)} contentContainerStyle={styles.modalContent}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>AI yanıtı nasıldı?</Text>
        <TextInput
          mode="outlined"
          label="Yorumunuzu yazın..."
          value={feedbackText}
          onChangeText={setFeedbackText}
          multiline
          style={styles.input}
        />
        <Button mode="contained" onPress={handleSendFeedback} style={styles.sendBtn}>
          Gönder
        </Button>
        <Button onPress={() => setShowFeedback(false)} style={styles.closeBtn}>
          Kapat
        </Button>
      </Modal>
      <VoiceInputBar value={input} onChangeText={setInput} onVoicePress={handleVoicePress} />
      {isRecording && (
        <Text style={{ color: theme.colors.primary, textAlign: 'center', marginBottom: 8 }}>Kaydediliyor...</Text>
      )}
      <Button mode="contained" onPress={handleSendMessage} style={{ marginVertical: 8 }}>
        Mesajı Gönder
      </Button>
      <Button mode="outlined" onPress={() => navigation.navigate('Home')}>
        Başka fotoğraf çek
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  photoCard: { width: '100%', borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
  photo: { width: '100%', height: 200 },
  chatContainer: { flex: 1 },
  bubble: { marginBottom: 8 },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 16, alignItems: 'center', margin: 32 },
  input: { width: 260, minHeight: 60, marginBottom: 12 },
  sendBtn: { width: 260, marginBottom: 8 },
  closeBtn: { width: 260 },
});

export default PhotoChatScreen;
