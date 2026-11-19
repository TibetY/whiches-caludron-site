import type { ReactNode } from 'react';
import { usePhotoUrl } from '../../hooks/usePhotoUrl';

type StoredPhotoProps = {
  photoId: string | null;
  alt: string;
  className?: string;
  /** Shown when no photo is set (or it can't be found). */
  placeholder: ReactNode;
};

/** A photo from IndexedDB, or the design's placeholder until one is uploaded. */
export function StoredPhoto({ photoId, alt, className, placeholder }: StoredPhotoProps) {
  const photo = usePhotoUrl(photoId);
  if (photo.status === 'none' || photo.status === 'missing') return <>{placeholder}</>;
  if (!photo.url) return <div className={className} aria-hidden="true" />;
  return <img src={photo.url} alt={alt} className={className} />;
}
