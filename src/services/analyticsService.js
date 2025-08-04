// Basit Analytics event tracking servisi (Firebase olmadan)

export async function logPhotoAnalyzed(userId, photoName, result) {
  console.log('Analytics: Photo Analyzed', {
    user_id: userId,
    photo_name: photoName,
    result: result,
    timestamp: new Date().toISOString()
  });
}

export async function logFeedbackSent(userId, feedbackLength) {
  console.log('Analytics: Feedback Sent', {
    user_id: userId,
    feedback_length: feedbackLength,
    timestamp: new Date().toISOString()
  });
}

// İhtiyaca göre başka event fonksiyonları eklenebilir.
