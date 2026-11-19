import { useCallback, useState } from 'react';
import { uploadPhoto } from '../lib/photos';

/** Uploads photos one by one, tracking progress and failures for the UI. */
export function useUploader() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (files: File[], onSaved: (photoId: string, file: File) => void) => {
      setBusy(true);
      setError(null);
      try {
        for (const file of files) {
          onSaved(await uploadPhoto(file), file);
        }
      } catch {
        setError(
          'That photo couldn’t be saved. Try another one, or check that this browser allows site storage.',
        );
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  return { upload, busy, error };
}
