// Guardado sin conexión (RNF-13, DESIGN-WEB.md §11): IndexedDB `replica-offline`, por cuenta. Guarda la
// última copia de la cuenta que llegó del servidor y la bandeja de notas que no salieron. Cada lectura y
// escritura va protegida: sin IndexedDB (ventana privada, almacenamiento bloqueado), la web sigue igual,
// solo que sin copia.

const NAME = "replica-offline";
const VERSION = 1;
export const STORES = { outbox: "outbox", snapshot: "snapshot" } as const;
type Store = (typeof STORES)[keyof typeof STORES];

let opening: Promise<IDBDatabase> | null = null;

function open() {
  if (opening) return opening;
  opening = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Sin IndexedDB"));
      return;
    }
    const request = indexedDB.open(NAME, VERSION);
    request.onupgradeneeded = () => {
      for (const store of Object.values(STORES)) {
        if (!request.result.objectStoreNames.contains(store)) request.result.createObjectStore(store);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).catch((error: unknown) => {
    opening = null;
    throw error;
  });
  return opening;
}

function run<T>(store: Store, mode: IDBTransactionMode, action: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const request = action(tx.objectStore(store));
        tx.oncomplete = () => resolve(request.result as T);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
  );
}

export async function idbGet<T>(store: Store, key: string): Promise<T | undefined> {
  try {
    return await run<T | undefined>(store, "readonly", (s) => s.get(key));
  } catch {
    return undefined;
  }
}

export async function idbSet(store: Store, key: string, value: unknown) {
  try {
    await run(store, "readwrite", (s) => s.put(value, key));
  } catch {
    // Sin almacenamiento: se sigue en memoria.
  }
}

export async function idbDelete(store: Store, key: string) {
  try {
    await run(store, "readwrite", (s) => s.delete(key));
  } catch {
    // Nada que borrar.
  }
}

export async function idbKeys(store: Store): Promise<string[]> {
  try {
    return (await run<IDBValidKey[]>(store, "readonly", (s) => s.getAllKeys())).map(String);
  } catch {
    return [];
  }
}
