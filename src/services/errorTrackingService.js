// Basit Error Tracking servisi (Firebase olmadan)

export async function logLogin(userId, method = 'email') {
  console.log('Analytics: User Login', {
    user_id: userId,
    method,
    timestamp: new Date().toISOString()
  });
}

export async function logError(userId, screen, errorMessage) {
  console.error('Error Tracking:', {
    user_id: userId || 'anonymous',
    screen,
    error_message: errorMessage,
    timestamp: new Date().toISOString()
  });
}

// Diğer hata ve event fonksiyonları eklenebilir.
