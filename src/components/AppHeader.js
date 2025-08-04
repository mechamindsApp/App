import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AppHeader = ({ navigation }) => {
  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          {/* Logo placeholder */}
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons 
              name="camera-iris" 
              size={32} 
              color="white" 
            />
            <Text variant="titleMedium" style={styles.logoText}>
              AI Experience
            </Text>
          </View>

          {/* Settings Icon */}
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={handleSettingsPress}
          >
            <MaterialCommunityIcons 
              name="cog" 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoText: {
    color: 'white',
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

export default AppHeader;
