import { Platform } from 'react-native';
import Constants from 'expo-constants';

const extra = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};

const devDefaultBase = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';

export default {
  apiBaseUrl: extra.apiBaseUrl || devDefaultBase,
  useMockAi: typeof extra.useMockAi === 'boolean' ? extra.useMockAi : true,
};