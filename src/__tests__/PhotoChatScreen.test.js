import React from 'react';
import { render, act } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import PhotoChatScreen from '../screens/PhotoChatScreen';

jest.mock('../services/apiService', () => ({
  analyzePhoto: jest.fn().mockResolvedValue({ experience: 'test-experience', perception: { objects: ['tree'], certainty: 0.9 } }),
  sendFeedback: jest.fn().mockResolvedValue({ success: true }),
  likeAnalysis: jest.fn().mockResolvedValue({ success: true }),
  submitCorrection: jest.fn().mockResolvedValue({ success: true, data: { experience: 'ok', perception: { objects: ['tree'], certainty: 0.95 } } }),
}));

describe('PhotoChatScreen', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  it('renders without crashing with photoUri', async () => {
    const tree = render(
      <PaperProvider>
        <SafeAreaProvider>
          <PhotoChatScreen route={{ params: { photoUri: 'test.jpg' } }} navigation={{ navigate: jest.fn(), goBack: jest.fn(), replace: jest.fn() }} />
        </SafeAreaProvider>
      </PaperProvider>
    );
    expect(tree.getByText('Voyager Analizi')).toBeTruthy();

    // Flush timers and microtasks to satisfy async state updates inside effects
    await act(async () => {
      jest.runOnlyPendingTimers();
      await Promise.resolve();
    });
  });
});
