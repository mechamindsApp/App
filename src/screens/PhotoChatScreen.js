import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { Button, TextInput, Modal, ActivityIndicator, Card, Snackbar, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/theme';
import VoiceInputBar from '../components/VoiceInputBar';
import { analyzePhoto, sendFeedback } from '../services/apiService';
import { logPhotoAnalyzed, logFeedbackSent } from '../services/analyticsService';
import { logError } from '../services/errorTrackingService';
import { startRecording, stopRecording } from '../services/audioService';
import { getUserData, logout } from '../utils/auth';

const { width, height } = Dimensions.get('window');

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
            // Feedback modalını 3 saniye sonra aç
            setTimeout(() => {
              setShowFeedback(true);
            }, 3000);
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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Analiz</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Photo Display - Much Larger */}
        {photoUri && (
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              <Image source={{ uri: photoUri }} style={styles.photo} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)']}
                style={styles.photoOverlay}
              />
            </View>
          </View>
        )}

        {/* Content Area */}
        <View style={styles.contentArea}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator animating={true} size="large" color="white" />
              <Text style={styles.loadingText}>AI analiz ediyor...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={48} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.retryButtonText}>Tekrar Dene</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.chatContainer} showsVerticalScrollIndicator={false}>
              {messages.map(msg => (
                <View key={msg.id} style={styles.messageContainer}>
                  <View style={styles.messageBubble}>
                    <MaterialCommunityIcons name="robot" size={24} color="#667eea" style={styles.aiIcon} />
                    <Text style={styles.messageText}>{msg.text}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Home')}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF8E8E']}
                style={styles.actionButtonGradient}
              >
                <MaterialCommunityIcons name="camera" size={20} color="white" />
                <Text style={styles.actionButtonText}>Yeni Fotoğraf</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feedback Modal */}
        <Modal visible={showFeedback} onDismiss={() => setShowFeedback(false)} contentContainerStyle={styles.modalContent}>
          <View style={styles.modalHeader}>
            <MaterialCommunityIcons name="star" size={32} color="#FFD700" />
            <Text style={styles.modalTitle}>AI yanıtı nasıldı?</Text>
          </View>
          <TextInput
            mode="outlined"
            label="Yorumunuzu yazın..."
            value={feedbackText}
            onChangeText={setFeedbackText}
            multiline
            style={styles.feedbackInput}
            theme={{
              colors: {
                primary: '#667eea',
              }
            }}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={handleSendFeedback}>
              <LinearGradient
                colors={['#4ECDC4', '#6BCBD1']}
                style={styles.modalButtonGradient}
              >
                <Text style={styles.modalButtonText}>Gönder</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalCancelButton]} 
              onPress={() => setShowFeedback(false)}
            >
              <Text style={styles.modalCancelText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Error Snackbar */}
        {error && (
          <View style={styles.snackbarContainer}>
            <View style={styles.snackbar}>
              <MaterialCommunityIcons name="alert" size={20} color="white" />
              <Text style={styles.snackbarText}>{error}</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  photoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  photoContainer: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  photo: {
    width: '100%',
    height: height * 0.4, // 40% of screen height - much larger
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  contentArea: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 25,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#667eea',
    fontSize: 16,
    marginTop: 15,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 15,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 15,
  },
  messageBubble: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  aiIcon: {
    marginBottom: 10,
  },
  messageText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 24,
  },
  actionButtons: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  actionButton: {
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    gap: 10,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    margin: 30,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  feedbackInput: {
    backgroundColor: 'white',
    marginBottom: 20,
    minHeight: 80,
  },
  modalButtons: {
    gap: 10,
  },
  modalButton: {
    borderRadius: 25,
  },
  modalButtonGradient: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalCancelButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 16,
  },
  snackbarContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  snackbar: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    gap: 10,
  },
  snackbarText: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
});

export default PhotoChatScreen;
