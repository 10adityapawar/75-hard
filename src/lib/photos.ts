import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

const FOLDER = 'progress-photos';

export async function initPhotos() {}

function folder(): Directory {
  const dir = new Directory(Paths.document, FOLDER);
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

/**
 * Photos are stored by file name, not absolute path: on iOS the app's
 * document folder path can change after an update.
 */
export function photoUri(name: string | undefined): string | undefined {
  if (!name) return undefined;
  if (Platform.OS === 'web' || name.includes('://')) return name;
  return new File(Paths.document, FOLDER, name).uri;
}

/** Opens the camera (or library) and saves the photo for the given date. Returns the stored name. */
export async function capturePhoto(date: string, source: 'camera' | 'library'): Promise<string | null> {
  const perm =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Permission needed', `Allow ${source === 'camera' ? 'camera' : 'photo'} access in Settings to add your progress photo.`);
    return null;
  }

  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7 };
  const result =
    source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets?.length) return null;

  const src = result.assets[0].uri;
  if (Platform.OS === 'web') return src;

  const name = `${date}-${Date.now()}.jpg`;
  new File(src).copy(new File(folder(), name));
  return name;
}

export function deletePhoto(name: string | undefined) {
  if (!name || Platform.OS === 'web' || name.includes('://')) return;
  const file = new File(Paths.document, FOLDER, name);
  if (file.exists) file.delete();
}
