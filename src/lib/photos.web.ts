// Web version of photos.ts: photos are downscaled and kept in IndexedDB on the device.

const DB_NAME = '75hard-photos';
const STORE = 'photos';
const MAX_SIDE = 1080;

const cache = new Map<string, string>(); // name -> data URL

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Loads every saved photo into memory so photoUri() can stay synchronous. */
export async function initPhotos() {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).openCursor();
      req.onsuccess = () => {
        const cur = req.result;
        if (!cur) return resolve();
        cache.set(String(cur.key), cur.value as string);
        cur.continue();
      };
      req.onerror = () => reject(req.error);
    });
    // Ask the browser not to clear app data under storage pressure.
    await navigator.storage?.persist?.();
  } catch {
    // IndexedDB unavailable (e.g. private browsing). Photos just won't load.
  }
}

export function photoUri(name: string | undefined): string | undefined {
  return name ? cache.get(name) : undefined;
}

function pickFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'; // iPhone offers Take Photo / Photo Library
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.oncancel = () => resolve(null);
    input.click();
  });
}

async function downscale(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.75);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Must be called directly from a tap so the browser allows the file picker. */
export async function capturePhoto(date: string, _source?: 'camera' | 'library'): Promise<string | null> {
  const file = await pickFile();
  if (!file) return null;
  const dataUrl = await downscale(file);
  const name = `${date}-${Date.now()}.jpg`;
  await tx('readwrite', (s) => s.put(dataUrl, name));
  cache.set(name, dataUrl);
  return name;
}

export function deletePhoto(name: string | undefined) {
  if (!name) return;
  cache.delete(name);
  tx('readwrite', (s) => s.delete(name)).catch(() => {});
}
