import React from 'react';
import { render } from '@testing-library/react-native';
import SettingsScreen from '../screens/SettingsScreen';
import { ThemeContext } from '../context/ThemeContext';

describe('SettingsScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={{ darkMode: false, toggleDarkMode: jest.fn() }}>
        <SettingsScreen />
      </ThemeContext.Provider>
    );
    expect(getByText('Ayarlar')).toBeTruthy();
    expect(getByText('Karanlık Mod')).toBeTruthy();
    expect(getByText('Bildirimler')).toBeTruthy();
    expect(getByText('Gizlilik Politikası (placeholder)')).toBeTruthy();
  });
});
