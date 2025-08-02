import { startRecording, stopRecording } from '../services/audioService';

describe('Audio Service', () => {
  it('should start and stop recording (mock)', async () => {
    // Bu test gerçek cihazda çalıştırılmalı, burada mock ile örnek
    const mockRecording = { stopAndUnloadAsync: jest.fn(), getURI: jest.fn(() => 'mock-uri') };
    const rec = mockRecording;
    const uri = await stopRecording(rec);
    expect(uri).toBe('mock-uri');
  });
});
