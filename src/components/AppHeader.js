import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/theme';

const AppHeader = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;
  const topPad = insets.top + 10; // küçük ekstra boşluk

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: topPad }] }>
      <View style={styles.row}>
        <View style={styles.sideSpacer} />
        <View style={styles.centerBrand}>
          {/* Logo placeholder (user will replace later) */}
          <View style={[styles.logoPlaceholder, { borderColor: 'rgba(255,255,255,0.9)' }]} />
        </View>
        <TouchableOpacity style={[styles.settingsButton, { backgroundColor: theme.surfaceGlass }]} onPress={handleSettingsPress}>
          <MaterialCommunityIcons name="cog" size={24} color={theme.text === '#fff' ? 'white' : 'white'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sideSpacer: { width: 40, height: 40 },
  centerBrand: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  logoPlaceholder: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)', backgroundColor: 'transparent' },
  settingsButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)' },
  logoText: { color: 'white', fontWeight: 'bold' },
});

export default AppHeader;
