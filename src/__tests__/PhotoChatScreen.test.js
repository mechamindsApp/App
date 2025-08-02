import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PhotoChatScreen from '../screens/PhotoChatScreen';

describe('PhotoChatScreen', () => {
  it('renders loading indicator when loading', () => {
    const { getByTestId } = render(<PhotoChatScreen route={{ params: { photoUri: 'test.jpg' } }} navigation={{ navigate: jest.fn() }} />);
    // loading state test için mock gerekebilir
  });

  it('sends text message', () => {
    const { getByText, getByPlaceholderText } = render(<PhotoChatScreen route={{ params: { photoUri: 'test.jpg' } }} navigation={{ navigate: jest.fn() }} />);
    const input = getByPlaceholderText('Mesajınızı yazın veya sesli ekleyin...');
    fireEvent.changeText(input, 'Merhaba');
    fireEvent.press(getByText('Mesajı Gönder'));
    expect(getByText('Merhaba')).toBeTruthy();
  });
});
