import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Switch, Card, useTheme } from 'react-native-paper';
import { ThemeContext } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/theme';

const SettingsScreen = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>Ayarlar</Text>
          <View style={styles.row}>
            <Text>Karanlık Mod</Text>
            <Switch value={darkMode} onValueChange={toggleDarkMode} />
          </View>
          <View style={styles.row}>
            <Text>Bildirimler</Text>
            <Switch value={false} onValueChange={() => {}} />
          </View>
          <Text style={styles.privacy}>Gizlilik Politikası (placeholder)</Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  card: { padding: 16 },
  title: { marginBottom: 24, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  privacy: { marginTop: 32, color: 'gray' },
});

export default SettingsScreen;
