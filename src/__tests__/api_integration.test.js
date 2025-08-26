import axios from 'axios';

jest.mock('axios');

describe('FastAPI Backend Integration (mock)', () => {
  it('posts form-data to analyze-photo endpoint', async () => {
    const mockResponse = { data: { experience: 'ok', perception: { objects: ['tree'], certainty: 0.9 } } };
    axios.post.mockResolvedValueOnce(mockResponse);

    const formData = new FormData();
    formData.append('file', { uri: 'test.jpg', type: 'image/jpeg', name: 'test.jpg' });

    const response = await axios.post('http://localhost:8000/analyze-photo/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    expect(axios.post).toHaveBeenCalled();
    expect(response.data).toHaveProperty('experience');
  });
});
