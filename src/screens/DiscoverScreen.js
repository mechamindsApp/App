import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPopularAnalyses } from '../services/apiService';

const { width } = Dimensions.get('window');

const DiscoverScreen = () => {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await getPopularAnalyses();
      if (res?.analyses) setItems(res.analyses);
    })();
  }, []);

  const categories = ['Tümü', 'Doğa', 'Restoran', 'Mimari', 'Otomobil', 'UX/UI'];

  const handleOpenItem = (item) => {
    // Gelecekte detay ekranına gidebilir
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
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
          {items.map((item, idx) => (
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
                    <TouchableOpacity style={styles.likeButton}>
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 15,
  },
  imageContainer: {
    height: 120,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  imageThumb: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderRadius: 10,
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
    opacity: 0.9,
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
