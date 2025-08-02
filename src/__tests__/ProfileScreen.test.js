import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileScreen from '../screens/ProfileScreen';

describe('ProfileScreen', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<ProfileScreen />);
    expect(getByPlaceholderText('Adınızı girin')).toBeTruthy();
    expect(getByText('Profil Fotoğrafını Değiştir')).toBeTruthy();
  });
});
