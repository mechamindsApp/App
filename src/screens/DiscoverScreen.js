import { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPopularAnalyses } from '../services/apiService';
import { likeAnalysis } from '../services/apiService';
import { logLike } from '../services/analyticsService';
import { ThemeContext } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/theme';

// no-op: width not required currently

const DiscoverScreen = () => {
  const insets = useSafeAreaInsets();
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getPopularAnalyses();
      if (res?.analyses) setItems(res.analyses);
      setTimeout(()=>setLoading(false),400);
    })();
  }, []);

  const categories = ['Tümü', 'Doğa', 'Restoran', 'Mimari', 'Otomobil', 'UX/UI'];

  const handleOpenItem = () => {
    // Gelecekte detay ekranına gidebilir
  };

  const handleLike = async (item, index) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, likes: (it.likes || 0) + 1 } : it));
    await likeAnalysis(item.id);
    await logLike(null, item.id);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradient} style={styles.gradient}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 100 }] }>
          <Text variant="headlineSmall" style={styles.title}>
            Keşfet
          </Text>
          <Text style={styles.subtitle}>
            Diğer kullanıcıların deneyimlerini keşfedin
          </Text>
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryChip}>
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Discoveries Feed */}
        <ScrollView style={styles.feedContainer} showsVerticalScrollIndicator={false}>
          {loading && (
            <View style={{gap:16, paddingTop:10}}>
              {[1,2,3,4].map(i => (
                <View key={i} style={[styles.discoveryCard,{height:180, padding:0}]}> 
                  <View style={{flex:1, backgroundColor:'rgba(255,255,255,0.08)'}} />
                </View>
              ))}
            </View>
          )}
          {!loading && items.length === 0 && (
            <View style={{alignItems:'center', padding:40}}>
              <MaterialCommunityIcons name="image-off" size={42} color="white" />
              <Text style={{color:'white', opacity:0.8, marginTop:12, textAlign:'center'}}>Henüz analiz yok. İlk fotoğrafını paylaş ve burayı doldur.</Text>
            </View>
          )}
          {!loading && items.map((item, idx) => (
            <TouchableOpacity key={item.id || idx} style={styles.discoveryCard} onPress={() => handleOpenItem(item)}>
              <View style={styles.cardContent}>
                <View style={styles.imageContainer}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.imageThumb} resizeMode="cover" />
                  ) : null}
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.imageOverlay} />
                </View>
                
                <View style={styles.cardInfo}>
                  <View style={styles.userInfo}>
                    <MaterialCommunityIcons 
                      name="account-circle" 
                      size={20} 
                      color="white" 
                    />
                    <Text style={styles.userName}>{item.user || 'Kullanıcı'}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{item.category || 'Genel'}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.analysisText} numberOfLines={2}>
                    {item.experience || item.preview}
                  </Text>
                  
                  <View style={styles.cardFooter}>
                    <TouchableOpacity style={styles.likeButton} onPress={() => handleLike(item, idx)}>
                      <MaterialCommunityIcons 
                        name="heart-outline" 
                        size={16} 
                        color="white" 
                      />
                      <Text style={styles.likeCount}>{item.likes || 0}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.shareButton}>
                      <MaterialCommunityIcons 
                        name="share-outline" 
                        size={16} 
                        color="white" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 120, // Header yüksekliği kadar padding
    paddingBottom: 15,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 5,
  },
  categoriesContainer: {
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  categoryChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  feedContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  discoveryCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    marginBottom: 18,
    overflow: 'hidden',
    borderWidth:1,
    borderColor:'rgba(255,255,255,0.15)'
  },
  cardContent: {
    padding: 14,
  },
  imageContainer: {
    height: 140,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  imageThumb: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    borderRadius: 14,
  },
  cardInfo: {
    gap: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  categoryBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  categoryBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  analysisText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.92,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  likeCount: {
    color: 'white',
    fontSize: 12,
  },
  shareButton: {
    padding: 5,
  },
});

export default DiscoverScreen;
