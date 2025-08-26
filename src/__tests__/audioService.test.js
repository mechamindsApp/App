import { startRecording, stopRecording } from '../services/audioService';

describe('Audio Service', () => {
  it('should stop recording and return uri (mock)', async () => {
    const rec = { stopAndUnloadAsync: jest.fn(), getURI: jest.fn(() => 'mock-uri') };
    const uri = await stopRecording(rec);
    expect(rec.stopAndUnloadAsync).toHaveBeenCalled();
    expect(uri).toBe('mock-uri');
  });
});
