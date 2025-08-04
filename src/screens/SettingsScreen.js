import React, { useContext } from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { Text, Switch, Card, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/theme';

const SettingsScreen = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.title}>Ayarlar</Text>
              <View style={styles.row}>
                <Text style={styles.rowText}>Karanlık Mod</Text>
                <Switch value={darkMode} onValueChange={toggleDarkMode} />
              </View>
              <View style={styles.row}>
                <Text style={styles.rowText}>Bildirimler</Text>
                <Switch value={false} onValueChange={() => {}} />
              </View>
              <Text style={styles.privacy}>Gizlilik Politikası (placeholder)</Text>
            </Card.Content>
          </Card>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 100 : 95, // Header yüksekliği kadar padding
  },
  card: { 
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  title: { 
    marginBottom: 24, 
    textAlign: 'center',
    color: '#333',
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  rowText: {
    color: '#333',
    fontSize: 16,
  },
  privacy: { 
    marginTop: 32, 
    color: '#666',
    textAlign: 'center',
  },
});

export default SettingsScreen;
