// Firebase Analytics ile hata ve login eventlerini loglamak için servis
import analytics from '@react-native-firebase/analytics';

export async function logLogin(userId, method = 'email') {
  await analytics().logEvent('user_login', {
    user_id: userId,
    method,
  });
}

export async function logError(userId, screen, errorMessage) {
  await analytics().logEvent('app_error', {
    user_id: userId || 'anonymous',
    screen,
    error_message: errorMessage,
    timestamp: Date.now(),
  });
}

// Diğer hata ve event fonksiyonları eklenebilir.
