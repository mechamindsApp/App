// Jest setup for React Native/Expo environment
// - Mocks native modules that are unavailable in Jest
// - Adds Testing Library matchers

import '@testing-library/jest-native/extend-expect';

// expo-av mock (avoid requiring native ExponentAV)
jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    Recording: class MockRecording {
      async prepareToRecordAsync() {}
      async startAsync() {}
      async stopAndUnloadAsync() {}
      getURI() { return 'mock-uri'; }
    }
  }
}));

// Image picker/manipulator simple mocks
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  MediaTypeOptions: { Images: 'Images' },
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true }),
  launchCameraAsync: jest.fn().mockResolvedValue({ canceled: true }),
}));

jest.mock('expo-image-manipulator', () => ({
  SaveFormat: { JPEG: 'jpeg' },
  manipulateAsync: jest.fn(async (uri) => ({ uri })),
}));

// ViewShot and Sharing mocks
jest.mock('react-native-view-shot', () => 'ViewShot');
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(false),
  shareAsync: jest.fn(),
}));

// LinearGradient mock (provided by jest-expo normally, but keep safe)
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// AsyncStorage in-memory mock
jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    setItem: jest.fn(async (key, value) => { store[key] = String(value); }),
    getItem: jest.fn(async (key) => (key in store ? store[key] : null)),
    removeItem: jest.fn(async (key) => { delete store[key]; }),
    clear: jest.fn(async () => { store = {}; }),
    getAllKeys: jest.fn(async () => Object.keys(store)),
  };
});

// Expo vector icons minimal mock to avoid setState warnings
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const View = (props) => React.createElement('Icon', props, props.name || 'Icon');
  return new Proxy({}, {
    get: () => View,
  });
});

// Note: Rely on jest-expo's built-in React Native mocks; avoid overriding core RN to prevent TurboModule issues.
