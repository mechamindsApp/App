import React from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity 
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DiscoverScreen = () => {
  // Mock data for other users' analyses
  const discoveries = [
    {
      id: 1,
      user: 'Ahmet K.',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
      analysis: 'Bu manzara sabah saatlerinde çok daha güzel görünüyor...',
      category: 'Doğa',
      likes: 24,
    },
    {
      id: 2,
      user: 'Elif S.',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200',
      analysis: 'Bu restoran çok kalabalık, rezervasyon yapmadan gitmeyin...',
      category: 'Restoran',
      likes: 18,
    },
    {
      id: 3,
      user: 'Mehmet Y.',
      image: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=200',
      analysis: 'Burası fotoğraf çekmek için mükemmel bir yer...',
      category: 'Mimari',
      likes: 31,
    },
    {
      id: 4,
      user: 'Zehra A.',
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200',
      analysis: 'Bu araba şehir içi için çok uygun, park etmesi kolay...',
      category: 'Otomobil',
      likes: 12,
    },
  ];

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
        <View style={styles.header}>
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
          {discoveries.map((item) => (
            <TouchableOpacity key={item.id} style={styles.discoveryCard} onPress={() => handleOpenItem(item)}>
              <View style={styles.cardContent}>
                <View style={styles.imageContainer}>
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.imageOverlay}
                  />
                </View>
                
                <View style={styles.cardInfo}>
                  <View style={styles.userInfo}>
                    <MaterialCommunityIcons 
                      name="account-circle" 
                      size={20} 
                      color="white" 
                    />
                    <Text style={styles.userName}>{item.user}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{item.category}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.analysisText} numberOfLines={2}>
                    {item.analysis}
                  </Text>
                  
                  <View style={styles.cardFooter}>
                    <TouchableOpacity style={styles.likeButton}>
                      <MaterialCommunityIcons 
                        name="heart-outline" 
                        size={16} 
                        color="white" 
                      />
                      <Text style={styles.likeCount}>{item.likes}</Text>
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
  },
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
