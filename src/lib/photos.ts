import { savePhoto } from './photoDb';
import type { SiteContent } from './types';

const MAX_EDGE = 1800;

/**
 * Phone photos are often 4000px+ and several MB. Scale them down before storing so the
 * website stays quick. Anything the browser can't decode is stored as it came.
 */
export async function prepareImage(file: File): Promise<Blob> {
  if (typeof createImageBitmap !== 'function' || !file.type.startsWith('image/')) return file;
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1_500_000) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext('2d');
    if (!context) {
      bitmap.close();
      return file;
    }
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.85),
    );
    return blob ?? file;
  } catch {
    return file;
  }
}

/** Resize (if needed) and store an uploaded photo. Resolves to its photo id. */
export async function uploadPhoto(file: File): Promise<string> {
  return savePhoto(await prepareImage(file), file.name);
}

/** Every photo id the content refers to. */
export function photoIdsIn(content: SiteContent): string[] {
  return [
    content.today.photoId,
    content.photos.patio.photoId,
    content.photos.crew.photoId,
    content.photos.share.photoId,
    ...content.photos.library.map((p) => p.photoId),
    ...content.menu.items.map((item) => item.photoId),
  ].filter((id): id is string => !!id);
}
