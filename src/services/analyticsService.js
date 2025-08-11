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

export async function logCorrectionApplied(userId, original, corrected) {
  console.log('Analytics: Correction Applied', {
    user_id: userId,
    original,
    corrected,
    timestamp: new Date().toISOString()
  });
}

export async function logLike(userId, analysisId) {
  console.log('Analytics: Like', {
    user_id: userId,
    analysis_id: analysisId,
    timestamp: new Date().toISOString()
  });
}

export async function logShare(userId, analysisId, channel) {
  console.log('Analytics: Share', {
    user_id: userId,
    analysis_id: analysisId,
    channel,
    timestamp: new Date().toISOString()
  });
}

// İhtiyaca göre başka event fonksiyonları eklenebilir.
