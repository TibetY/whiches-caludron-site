import { useEffect, useState } from 'react';
import { getPhoto } from '../lib/photoDb';

type Loaded = { id: string; url: string | null; name: string | null };

export type PhotoState = {
  url: string | null;
  name: string | null;
  /** none: no photo set · loading · ready · missing: the id isn't in IndexedDB */
  status: 'none' | 'loading' | 'ready' | 'missing';
};

/** An object URL for a photo stored in IndexedDB, revoked when no longer needed. */
export function usePhotoUrl(photoId: string | null): PhotoState {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    if (!photoId) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    getPhoto(photoId)
      .then((record) => {
        if (cancelled) return;
        if (!record) {
          setLoaded({ id: photoId, url: null, name: null });
          return;
        }
        objectUrl = URL.createObjectURL(record.blob);
        setLoaded({ id: photoId, url: objectUrl, name: record.name });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ id: photoId, url: null, name: null });
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photoId]);

  if (!photoId) return { url: null, name: null, status: 'none' };
  if (!loaded || loaded.id !== photoId) return { url: null, name: null, status: 'loading' };
  return loaded.url
    ? { url: loaded.url, name: loaded.name, status: 'ready' }
    : { url: null, name: null, status: 'missing' };
}
