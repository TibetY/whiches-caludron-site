/**
 * Uploaded photos live in IndexedDB as blobs. The store only keeps their ids.
 * Every function is async so a missing or blocked IndexedDB surfaces as a rejected promise.
 */
import { clear, createStore, del, get, keys, set, type UseStore } from 'idb-keyval';
import { newId } from './utils';

export type PhotoRecord = { blob: Blob; name: string };

let db: UseStore | null = null;

/** Opened lazily so that merely importing this module never touches IndexedDB. */
function photoStore(): UseStore {
  db ??= createStore('wiches-cauldron', 'photos');
  return db;
}

export async function savePhoto(blob: Blob, name: string): Promise<string> {
  const id = newId('photo');
  await set(id, { blob, name } satisfies PhotoRecord, photoStore());
  return id;
}

export async function getPhoto(id: string): Promise<PhotoRecord | undefined> {
  return get<PhotoRecord>(id, photoStore());
}

export async function deletePhoto(id: string): Promise<void> {
  await del(id, photoStore());
}

export async function clearPhotos(): Promise<void> {
  await clear(photoStore());
}

/** Deletes every stored photo whose id is not in `keep`. */
export async function prunePhotos(keep: Set<string>): Promise<void> {
  const stored = await keys(photoStore());
  await Promise.all(
    stored.filter((id) => !keep.has(String(id))).map((id) => del(id, photoStore())),
  );
}
