import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';

describe('HomeScreen', () => {
  it('renders main actions', () => {
    const { getByText } = render(<HomeScreen navigation={{ navigate: jest.fn() }} />);
    expect(getByText('Fotoğraf Çek')).toBeTruthy();
    expect(getByText('Galeriden Seç')).toBeTruthy();
  });

  it('shows action buttons', async () => {
    const { getByText } = render(<HomeScreen navigation={{ navigate: jest.fn() }} />);
    await waitFor(() => getByText('Fotoğraf Çek'));
    expect(getByText('Galeriden Seç')).toBeTruthy();
  });
});
