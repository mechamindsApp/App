import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { TextInput, Modal, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { ThemeContext } from '../context/ThemeContext';
// import { lightTheme, darkTheme } from '../theme/theme';
import { analyzePhoto, sendFeedback, submitCorrection } from '../services/apiService';
import { logPhotoAnalyzed, logFeedbackSent, logCorrectionApplied } from '../services/analyticsService';
import { logError } from '../services/errorTrackingService';
// import { startRecording, stopRecording } from '../services/audioService';
import { getUserData, logout } from '../utils/auth';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Dimensions } from 'react-native';
const { height } = Dimensions.get('window');

const PhotoChatScreen = ({ route, navigation }) => {
  const { photoUri } = route.params || {};
  // const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [recording, setRecording] = useState(null);
  // const [isRecording, setIsRecording] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  // const [feedbackSent, setFeedbackSent] = useState(false);
  const [perception, setPerception] = useState(null);
  const [showPerception, setShowPerception] = useState(false);
  const [analysisId, setAnalysisId] = useState(null);
  const [editedObjects, setEditedObjects] = useState('');
  const [correctionMode, setCorrectionMode] = useState(false);
  const [skeleton, setSkeleton] = useState(true);
  // const { darkMode } = useContext(ThemeContext);
  // const theme = useTheme();
  const viewShotRef = React.useRef(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (photoUri) {
        setLoading(true);
        setError(null);
        setSkeleton(true);
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
              setTimeout(()=>setSkeleton(false),400);
              if (userId) await logPhotoAnalyzed(userId, 'photo.jpg', 'nsfw');
              return;
            }
            setMessages([]);
            setError(result.error);
            setTimeout(()=>setSkeleton(false),400);
            if (userId) await logPhotoAnalyzed(userId, 'photo.jpg', 'error');
            if (userId) await logError(userId, 'PhotoChatScreen', result.error);
          } else if (result && result.experience) {
            setMessages([{ id: Date.now(), text: result.experience }]);
            setPerception(result.perception || null);
            setAnalysisId(result.perception ? result.perception.id || null : null);
            // Feedback modalını 3 saniye sonra aç
            setTimeout(() => {
              setShowFeedback(true);
            }, 3000);
            if (userId) await logPhotoAnalyzed(userId, 'photo.jpg', 'success');
          } else {
            setMessages([]);
            setError('AI yanıtı alınamadı.');
            setTimeout(()=>setSkeleton(false),400);
            if (userId) await logPhotoAnalyzed(userId, 'photo.jpg', 'no_experience');
            if (userId) await logError(userId, 'PhotoChatScreen', 'AI yanıtı alınamadı.');
          }
        } catch (err) {
          setMessages([]);
          setError('Sunucuya bağlanılamadı.');
          setTimeout(()=>setSkeleton(false),400);
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
  // feedback sent flag omitted for now
      setShowFeedback(false);
      setFeedbackText('');
      Alert.alert('Teşekkürler!', 'Geri bildiriminiz kaydedildi.');
    } catch (err) {
      Alert.alert('Hata', 'Geri bildirim gönderilemedi.');
    }
  };

  // const handleSendMessage = () => {
  //   if (input.trim()) {
  //     setMessages(prev => [...prev, { id: Date.now(), text: input }]);
  //     setInput('');
  //   }
  // };

  // const handleVoicePress = async () => {
  //   if (!isRecording) {
  //     const rec = await startRecording();
  //     if (rec) {
  //       setRecording(rec);
  //       setIsRecording(true);
  //     } else {
  //       Alert.alert('Ses kaydı başlatılamadı.');
  //     }
  //   } else {
  //     const uri = await stopRecording(recording);
  //     setIsRecording(false);
  //     setRecording(null);
  //     if (uri) {
  //       setMessages(prev => [...prev, { id: Date.now(), text: 'Sesli mesaj gönderildi: ' + uri }]);
  //     } else {
  //       Alert.alert('Ses kaydı alınamadı.');
  //     }
  //   }
  // };

  const handleApplyCorrection = async () => {
    if (!perception || !analysisId) return;
    const original = (perception.objects || []).join(', ');
    const corrected = editedObjects.split(',').map(s => s.trim()).filter(Boolean);
    if (!corrected.length) return;
    setLoading(true);
    setMessages([{ id: Date.now(), text: 'Voyager, düzeltilmiş nesnelere göre yeniden yorumluyor...' }]);
    const result = await submitCorrection(analysisId, original, corrected.join(', '));
    if (result.success && result.data) {
      setPerception(prev => ({ ...prev, ...result.data.perception, objects: corrected }));
      setMessages([{ id: Date.now(), text: result.data.experience }]);
      await logCorrectionApplied(null, original, corrected.join(', '));
    } else {
      setError(result.error || 'Yeniden analiz sırasında bir hata oluştu.');
      setPerception(p => ({ ...p, objects: corrected }));
      const summary = `• Nesneler güncellendi: ${corrected.slice(0,5).join(', ')}\n• Sunucuya ulaşılamadı, bu nedenle yerel olarak güncellendi.`;
      setMessages([{ id: Date.now(), text: summary }]);
    }
    setCorrectionMode(false);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ViewShot ref={viewShotRef} style={{flex:1}} options={{format:'jpg', quality:0.9}}>
        {/* Main content wrapped with ViewShot for screenshot sharing */}
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
            <Text style={styles.headerTitle}>Voyager Analizi</Text>
            <View style={{flexDirection:'row', gap:8}}>
              <TouchableOpacity style={styles.backButton} onPress={() => setShowPerception(v => !v)}>
                <MaterialCommunityIcons name={showPerception ? 'eye-off' : 'eye'} size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.backButton} onPress={async ()=>{
                try {
                  if (viewShotRef.current) {
                    const uri = await viewShotRef.current.capture();
                    if (await Sharing.isAvailableAsync()) {
                      await Sharing.shareAsync(uri, { dialogTitle: 'Analizi Paylaş' });
                    }
                  }
                } catch(e) { console.warn('Share failed', e); }
              }}>
                <MaterialCommunityIcons name="share-variant" size={20} color="white" />
              </TouchableOpacity>
            </View>
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
      {showPerception && perception && (
              <View style={styles.perceptionChipPanel}>
                <View style={styles.perceptionHeaderRow}>
                  <Text style={styles.perceptionTitle}>Algılanan Nesneler</Text>
                  <Text style={styles.perceptionMeta}>{Math.round((perception.certainty||0.6)*100)}% güven</Text>
                </View>
                <View style={styles.chipList}>
                  {(perception.objects||[]).map(o => (
          <TouchableOpacity key={o} style={styles.chip}>
                      <Text style={styles.chipText}>{o}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {!correctionMode ? (
                  <TouchableOpacity onPress={()=>{setEditedObjects((perception.objects||[]).join(', ')); setCorrectionMode(true);}}>
                    <Text style={styles.correctionLink}>Düzelt</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{gap:8}}>
                    <TextInput
                      mode="outlined"
                      label="Nesneleri düzenle (virgülle)"
                      value={editedObjects}
                      onChangeText={setEditedObjects}
                    />
                    <View style={{flexDirection:'row', gap:10}}>
                      <TouchableOpacity onPress={handleApplyCorrection} style={styles.retrySmall}>
                        <Text style={styles.retrySmallText}>Uygula</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>setCorrectionMode(false)} style={[styles.retrySmall,{backgroundColor:'#eee'}]}>
                        <Text style={[styles.retrySmallText,{color:'#333'}]}>İptal</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}
            {perception && perception.certainty < 0.45 && !error && (
              <View style={styles.lowConfidenceCard}>
                <Text style={styles.lowConfidenceTitle}>Belirsiz ışık / açı</Text>
                <Text style={styles.lowConfidenceText}>Daha net sonuç için farklı açı veya daha iyi aydınlatma deneyin.</Text>
                <TouchableOpacity style={styles.retrySmall} onPress={()=>navigation.goBack()}>
                  <Text style={styles.retrySmallText}>Tekrar Çek</Text>
                </TouchableOpacity>
              </View>
            )}
            {loading ? (
              <View style={styles.loadingContainer}>
                {skeleton ? (
                  <View style={styles.skeletonBlockWrapper}>
                    {[1,2,3].map(i => (
                      <View key={i} style={styles.skeletonLine} />
                    ))}
                  </View>
                ) : (
                  <>
                    <ActivityIndicator animating={true} size="large" color="#667eea" />
                    <Text style={styles.loadingText}>Voyager analiz ediyor...</Text>
                  </>
                )}
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
                      <MaterialCommunityIcons name="compass-rose" size={24} color="#667eea" style={styles.aiIcon} />
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
        </LinearGradient>
      </ViewShot>

      {/* Feedback Modal */}
      <Modal visible={showFeedback} onDismiss={() => setShowFeedback(false)} contentContainerStyle={styles.modalContent}>
        <View style={styles.modalHeader}>
          <MaterialCommunityIcons name="star" size={32} color="#FFD700" />
          <Text style={styles.modalTitle}>Voyager'ın yanıtı nasıldı?</Text>
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
  perceptionChipPanel: { backgroundColor:'#f1f5ff', padding:12, borderRadius:16, marginBottom:12, borderWidth:1, borderColor:'#d8e2ff' },
  perceptionHeaderRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  chipList:{ flexDirection:'row', flexWrap:'wrap', gap:8 },
  chip:{ backgroundColor:'rgba(102,126,234,0.12)', paddingVertical:6, paddingHorizontal:12, borderRadius:14, borderWidth:1, borderColor:'rgba(102,126,234,0.35)' },
  chipText:{ color:'#334', fontSize:12, fontWeight:'600' },
  correctionLink:{ marginTop:8, color:'#667eea', fontSize:12, fontWeight:'600' },
  lowConfidenceCard:{ backgroundColor:'#FFF4DB', borderRadius:14, padding:12, marginBottom:12, borderWidth:1, borderColor:'#FFDFA3' },
  lowConfidenceTitle:{ fontSize:13, fontWeight:'700', color:'#A26500', marginBottom:4 },
  lowConfidenceText:{ fontSize:12, color:'#7A5A20', lineHeight:16 },
  retrySmall:{ backgroundColor:'#FFB347', alignSelf:'flex-start', paddingVertical:6, paddingHorizontal:12, borderRadius:8, marginTop:8 },
  retrySmallText:{ color:'#542D00', fontWeight:'600', fontSize:12 },
  skeletonBlockWrapper:{ width:'100%', gap:10 },
  skeletonLine:{ height:18, borderRadius:6, backgroundColor:'#e1e6f2', overflow:'hidden' },
});

export default PhotoChatScreen;
