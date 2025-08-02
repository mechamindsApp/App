import * as ImageManipulator from 'expo-image-manipulator';

export async function resizePhoto(uri) {
  // 1200px genişlik, kalite %70 (2-5MB arası)
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return manipResult.uri;
}
