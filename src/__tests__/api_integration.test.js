import axios from 'axios';

describe('FastAPI Backend Integration', () => {
  it('should return experience for uploaded photo', async () => {
    // Burada test için örnek bir fotoğraf URI'si kullanılmalı
    const formData = new FormData();
    formData.append('file', {
      uri: 'test.jpg',
      type: 'image/jpeg',
      name: 'test.jpg',
    });
    const response = await axios.post('http://localhost:8000/analyze-photo/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(response.data).toHaveProperty('experience');
    expect(response.data.experience.length).toBeGreaterThan(0);
  });
});
