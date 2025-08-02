// Firebase Analytics event tracking için servis
import analytics from '@react-native-firebase/analytics';

export async function logPhotoAnalyzed(userId, photoName, result) {
  await analytics().logEvent('photo_analyzed', {
    user_id: userId,
    photo_name: photoName,
    result: result,
  });
}

export async function logFeedbackSent(userId, feedbackLength) {
  await analytics().logEvent('feedback_sent', {
    user_id: userId,
    feedback_length: feedbackLength,
  });
}

// İhtiyaca göre başka event fonksiyonları eklenebilir.
