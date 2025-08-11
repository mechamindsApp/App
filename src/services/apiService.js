// Mock AI Service - Gerçek backend olmadığında kullanılır
// Bu service fotoğrafları analiz ederek deneyimsel yorumlar üretir

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const mockAnalyses = {
  // Doğa fotoğrafları
  nature: [
    "Bu manzara sabah erken saatlerde çok daha büyüleyici görünür. Güneş doğumunda burada olmak kesinlikle değer. Fotoğraf çekerken önce manzaranın genel hatlarını yakalayın, sonra detaylara odaklanın.",
    "Bu doğal alan piknik için mükemmel! Ancak hafta sonu oldukça kalabalık olabilir. Hafta içi gelirseniz doğanın sesini daha iyi duyabilirsiniz. Yanınıza böcek spreyi almayı unutmayın.",
    "Bu alan yürüyüş için harika ama patika biraz zorlu. Rahat ayakkabı şart. Manzara için çıktığınız noktada 10-15 dakika bekleyin, gözleriniz ortama alışsın."
  ],
  
  // Mimari/Şehir fotoğrafları
  architecture: [
    "Bu binanın mimarisi çok etkileyici! Fotoğraf çekerken farklı açılardan denemenizi öneririm. Özellikle alt açıdan çekilen kareler dramatik görünüyor. Gün batımında ışıklandırma muhteşem oluyor.",
    "Bu tarz tarihi yapıları gezerken rehberli tur almanızı tavsiye ederim. Her taşın bir hikayesi var. Fotoğraf çekerken arka plandaki diğer ziyaretçilere dikkat edin.",
    "Bu alan çok fotojenik! Instagram için mükemmel ama burada çekilmiş binlerce foto var. Farklı perspektifler deneyin, belki daha az bilinen açıları keşfedin."
  ],

  // Yemek fotoğrafları
  food: [
    "Bu yemek görünüşe göre çok lezzetli! Bu restoran rezervasyon gerektiriyor mu? Porsiyonlar nasıl? Fotoğraftan anladığım kadarıyla sunum çok güzel, lezzet de muhtemelen harika.",
    "Bu tarz yemekleri evde yapmayı denediniz mi? Malzemeler pahalı olabilir ama sonuç çok tatmin edici. Sosunun hazırlanış süreci kritik, aceleci davranmayın.",
    "Bu restoran atmosferi nasıl? Romantik bir akşam yemeği için uygun görünüyor. Fiyatlar nasıl? Bu tabak için bütçe ayırmak gerekiyor gibi."
  ],

  // Araç fotoğrafları
  vehicle: [
    "Bu araç şehir içi kullanım için çok uygun görünüyor! Park etmesi kolay, yakıt tüketimi ekonomik olmalı. Uzun yolculuklar için konfor nasıl? Bagaj hacmi yeterli mi?",
    "Bu model güvenilir bir marka. Bakım maliyetleri makul, yedek parça bulma sorunu yok. Test sürüşünde direksiyon hakimiyeti ve fren performansına dikkat edin.",
    "Bu araç macera severlere hitap ediyor! Arazi performansı iyi olmalı ama şehirde yakıt tüketimi yüksek olabilir. Kış koşullarında da güvenilir."
  ],

  // Teknoloji/Elektronik
  technology: [
    "Bu cihazın kullanıcı deneyimi nasıl? Arayüz sezgisel mi? Batarya ömrü günlük kullanım için yeterli olmalı. Benzer fiyat kategorisindeki alternatiflerle karşılaştırdınız mı?",
    "Bu teknoloji trend olmaya başladı. Erken benimseyenler için heyecan verici ama fiyat/performans oranını değerlendirmek önemli. Garantı ve servis desteği nasıl?",
    "Bu ürün kategoriside çok hızlı gelişiyor. 6 ay sonra daha iyileri çıkabilir ama şu anki ihtiyaçları karşılıyorsa almaya değer. Kullanıcı yorumlarını da inceleyin."
  ],

  // Moda/Giyim
  fashion: [
    "Bu stil çok trendy! Hangi mevsimde kullanmayı planlıyorsunuz? Kombinleme seçenekleri çok, versatil bir parça. Kumaş kalitesi ve konforu nasıl?",
    "Bu tarz giysileri şık etkinliklerde giyebilirsiniz. Ütü gerektiriyor mu? Renk kombinasyonları için neler önerirsiniz? Aksesuar seçimi de önemli.",
    "Bu trend bu sezon çok popüler. Fiyat kategorisi nasıl? Kaliteli dikiş detayları mı var? Uzun vadede kullanabilir misiniz yoksa sezonluk mu?"
  ],

  // Varsayılan/Genel
  general: [
    "Bu fotoğraf çok ilginç! Hikayesini merak ettim. Hangi koşullarda çekildi? Arka planındaki detaylar da dikkat çekici. Benzer deneyimler yaşadınız mı?",
    "Bu görüntü bende farklı duygular uyandırdı. Kompozisyon çok başarılı. Işık ve gölge oyunu harika. Profesyonel bir fotoğrafçı mısınız?",
    "Bu an yakalanması zor bir kare olmalı. Timing mükemmel! Bu tür fotoğraflar için sabırlı olmak gerekiyor. Hangi tekniği kullandınız?"
  ]
};

// Fotoğraf içeriğini URI ve dosya adına göre analiz eden gelişmiş fonksiyon
const detectPhotoCategory = (photoUri) => {
  const url = photoUri.toLowerCase();
  
  // Unsplash URL'lerinden kategori çıkarma
  if (url.includes('unsplash.com')) {
    if (url.includes('nature') || url.includes('mountain') || url.includes('forest') || 
        url.includes('landscape') || url.includes('tree') || url.includes('sky') || 
        url.includes('water') || url.includes('lake') || url.includes('beach')) {
      return 'nature';
    }
    if (url.includes('building') || url.includes('architecture') || url.includes('city') || 
        url.includes('urban') || url.includes('street') || url.includes('house') ||
        url.includes('bridge') || url.includes('tower')) {
      return 'architecture';
    }
    if (url.includes('food') || url.includes('restaurant') || url.includes('meal') || 
        url.includes('coffee') || url.includes('pizza') || url.includes('burger') ||
        url.includes('plate') || url.includes('kitchen')) {
      return 'food';
    }
    if (url.includes('car') || url.includes('vehicle') || url.includes('auto') || 
        url.includes('transport') || url.includes('bike') || url.includes('motorcycle')) {
      return 'vehicle';
    }
    if (url.includes('tech') || url.includes('phone') || url.includes('computer') || 
        url.includes('laptop') || url.includes('device') || url.includes('gadget')) {
      return 'technology';
    }
    if (url.includes('fashion') || url.includes('clothing') || url.includes('style') || 
        url.includes('dress') || url.includes('shoe') || url.includes('accessory')) {
      return 'fashion';
    }
  }
  
  // Dosya adından kategori çıkarma
  if (url.includes('photo') || url.includes('img') || url.includes('image')) {
    // Photo ID'sine göre kategori atama (son rakamına göre)
    const photoId = url.match(/\d+/g);
    if (photoId && photoId.length > 0) {
      const lastDigit = parseInt(photoId[photoId.length - 1]) % 6;
      const categories = ['nature', 'architecture', 'food', 'vehicle', 'technology', 'fashion'];
      return categories[lastDigit];
    }
  }
  
  // Varsayılan: URL'deki rakamların toplamına göre kategori
  const numbers = url.match(/\d/g);
  if (numbers) {
    const sum = numbers.reduce((acc, num) => acc + parseInt(num), 0);
    const categories = ['nature', 'architecture', 'food', 'vehicle', 'technology', 'fashion', 'general'];
    return categories[sum % categories.length];
  }
  
  return 'general';
};

// Ana AI analiz fonksiyonu
export const analyzePhoto = async (photoUri) => {
  const extra = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};
  const base = extra.apiBaseUrl || (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000');
  const useMock = typeof extra.useMockAi === 'boolean' ? extra.useMockAi : true;

  try {
    if (!useMock && base) {
      const data = new FormData();
      data.append('file', { uri: photoUri, name: 'photo.jpg', type: 'image/jpeg' });
      const res = await axios.post(`${base}/analyze-photo/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 20000,
      });
      const perception = res.data?.perception || null;
      const confidence = res.data?.perception?.certainty ?? 0.9;
      return {
        success: true,
        experience: res.data?.experience || 'Deneyimsel yorum alınamadı',
        perception,
        id: res.data?.id || null,
        category: Array.isArray(perception?.objects) && perception.objects.length ? perception.objects[0] : 'general',
        confidence,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    console.warn('Backend analyze failed, fallback to mock:', error?.message);
  }

  // --- MOCK FALLBACK ---
  // Loading simülasyonu (daha hızlı ve stabil)
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Fotoğraf kategorisini tespit et
  const category = detectPhotoCategory(photoUri);

  // İlgili kategoriden rastgele analiz seç
  const analyses = mockAnalyses[category] || mockAnalyses.general;
  const selectedAnalysis = analyses[Math.floor(Math.random() * analyses.length)];

  // Deneyimsel öneriler ekle
  const additionalTips = [
    "\n\n💡 İpucu: Bu tür fotoğrafları paylaşırken hikayesini de anlatmayı unutmayın!",
    "\n\n🎯 Öneri: Benzer deneyimler için #AIExperience hashtag'ini kullanabilirsiniz.",
    "\n\n⭐ Not: Bu analiz topluluğumuzun deneyimlerine dayanmaktadır.",
    "\n\n🔍 Keşfet: Bu konuda daha fazla içerik için Keşfet sekmesini ziyaret edin!",
    "\n\n📱 Paylaş: Bu analizi beğendiyseniz arkadaşlarınızla paylaşabilirsiniz."
  ];

  const randomTip = additionalTips[Math.floor(Math.random() * additionalTips.length)];

  return {
    success: true,
    experience: selectedAnalysis + randomTip,
    category,
    confidence: 0.9, // sabit güven skoru (MVP)
    timestamp: new Date().toISOString()
  };

};

// Feedback gönderme mock fonksiyonu
export const sendFeedback = async (feedbackText, analysisId) => {
  try {
    const extra = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};
    const base = extra.apiBaseUrl || (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000');
    const useMock = typeof extra.useMockAi === 'boolean' ? extra.useMockAi : true;
    const payload = { feedback: feedbackText, analysis_id: analysisId };
    if (!useMock && base) {
      await axios.post(`${base}/feedback`, payload, { timeout: 10000 });
    } else {
      // fallback local
      const raw = (await AsyncStorage.getItem('userFeedbacks')) || '[]';
      const existing = JSON.parse(raw);
      existing.push({ ...payload, ts: Date.now() });
      await AsyncStorage.setItem('userFeedbacks', JSON.stringify(existing));
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Geri bildirim gönderilemedi.' };
  }
};

export const likeAnalysis = async (analysisId) => {
  const extra = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};
  const base = extra.apiBaseUrl || (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000');
  const useMock = typeof extra.useMockAi === 'boolean' ? extra.useMockAi : true;
  try {
    if (!useMock && base) {
      await axios.post(`${base}/like`, { analysis_id: analysisId }, { timeout: 8000 });
    }
    return { success: true };
  } catch {
    return { success: false };
  }
};

export const submitCorrection = async (analysisId, original, corrected) => {
  const extra = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};
  const base = extra.apiBaseUrl || (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000');
  const useMock = typeof extra.useMockAi === 'boolean' ? extra.useMockAi : true;
  try {
    if (!useMock && base) {
      await axios.post(`${base}/correction`, { analysis_id: analysisId, original, corrected }, { timeout: 10000 });
    }
    return { success: true };
  } catch {
    return { success: false };
  }
};

// Kullanıcı verilerini alma mock fonksiyonu
export const getUserAnalytics = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      totalAnalyses: 12,
      favoriteCategory: 'nature',
      recentAnalyses: [
        { date: '2025-01-15', category: 'nature', liked: true },
        { date: '2025-01-14', category: 'food', liked: true },
        { date: '2025-01-13', category: 'architecture', liked: false }
      ],
      streakDays: 5
    };
  } catch (error) {
    return { error: 'Kullanıcı verileri alınamadı' };
  }
};

// Popüler analizleri getirme mock fonksiyonu (Discover screen için)
export const getPopularAnalyses = async () => {
  const extra = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  const base = extra.apiBaseUrl || (isAndroid ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000');
  const useMock = typeof extra.useMockAi === 'boolean' ? extra.useMockAi : true;

  try {
    if (!useMock && base) {
      const res = await axios.get(`${base}/discover`, { timeout: 15000 });
      return { success: true, analyses: res.data?.analyses || [] };
    }
  } catch (e) {
    console.warn('discover fetch failed, using mock', e?.message);
  }
  // fallback to previous mockPopular
  const mockPopular = [
    {
      id: 1,
      user: 'Ahmet K.',
      category: 'nature',
      preview: 'Bu manzara sabah saatlerinde çok daha güzel...',
      likes: 24,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200'
    },
    {
      id: 2,
      user: 'Elif S.',
      category: 'food',
      preview: 'Bu restoran çok kalabalık, rezervasyon yapmadan...',
      likes: 18,
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200'
    }
  ];
  return { success: true, analyses: mockPopular };
};

// Export default
export default {
  analyzePhoto,
  sendFeedback,
  getUserAnalytics,
  getPopularAnalyses,
  likeAnalysis,
  submitCorrection
};
