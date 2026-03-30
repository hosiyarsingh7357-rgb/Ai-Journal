import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export const uploadImage = async (file: File, userId: string): Promise<string> => {
  const storageRef = ref(storage, `screenshots/${userId}/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};
