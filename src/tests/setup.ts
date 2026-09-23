import { vi } from 'vitest';

const store = new Map<string, string>();

if (typeof globalThis.localStorage === 'undefined') {
  const mockLocalStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, String(value)); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size; }
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
    configurable: true
  });
}

// In-memory Firestore store for unit/integration tests
const firestoreStore = new Map<string, Map<string, any>>();

function getCollectionMap(colName: string) {
  if (!firestoreStore.has(colName)) {
    firestoreStore.set(colName, new Map());
  }
  return firestoreStore.get(colName)!;
}

vi.mock('firebase/firestore', () => {
  return {
    getFirestore: vi.fn(() => ({})),
    connectFirestoreEmulator: vi.fn(),
    collection: vi.fn((_db: any, path: string) => ({ path, type: 'collection' })),
    doc: vi.fn((_db: any, path: string, id?: string) => ({ path, id: id || 'auto_id', type: 'doc' })),
    setDoc: vi.fn(async (docRef: any, data: any, _options?: any) => {
      const col = getCollectionMap(docRef.path);
      col.set(docRef.id, { ...col.get(docRef.id), ...data, id: docRef.id });
    }),
    getDoc: vi.fn(async (docRef: any) => {
      const col = getCollectionMap(docRef.path);
      const data = col.get(docRef.id);
      return {
        exists: () => !!data,
        data: () => data,
        id: docRef.id
      };
    }),
    getDocs: vi.fn(async (queryOrCol: any) => {
      const colPath = queryOrCol.path || queryOrCol.collection?.path || 'unknown';
      const col = getCollectionMap(colPath);
      const items = Array.from(col.values());
      const filtered = queryOrCol.filters
        ? items.filter(item => queryOrCol.filters.every((f: any) => item[f.field] === f.value))
        : items;
      return {
        empty: filtered.length === 0,
        size: filtered.length,
        docs: filtered.map(d => ({
          id: d.id,
          data: () => d,
          ref: { id: d.id, path: colPath }
        })),
        forEach: (cb: any) => filtered.forEach(d => cb({ id: d.id, data: () => d, ref: { id: d.id, path: colPath } }))
      };
    }),
    deleteDoc: vi.fn(async (docRef: any) => {
      const col = getCollectionMap(docRef.path);
      col.delete(docRef.id);
    }),
    query: vi.fn((colRef: any, ...constraints: any[]) => {
      const filters = constraints.filter(c => c && c.type === 'where').map(c => ({ field: c.field, op: c.op, value: c.value }));
      return { collection: colRef, path: colRef.path, filters };
    }),
    where: vi.fn((field: string, op: string, value: any) => ({ type: 'where', field, op, value })),
    orderBy: vi.fn(() => ({ type: 'orderBy' })),
    writeBatch: vi.fn(() => {
      const operations: Array<() => Promise<void>> = [];
      return {
        set: (docRef: any, data: any) => {
          operations.push(async () => {
            const col = getCollectionMap(docRef.path);
            col.set(docRef.id, { ...col.get(docRef.id), ...data, id: docRef.id });
          });
        },
        delete: (docRef: any) => {
          operations.push(async () => {
            const col = getCollectionMap(docRef.path);
            col.delete(docRef.id);
          });
        },
        commit: async () => {
          for (const op of operations) await op();
        }
      };
    }),
    onSnapshot: vi.fn((queryOrCol: any, callback: any) => {
      const colPath = queryOrCol.path || queryOrCol.collection?.path || 'unknown';
      const col = getCollectionMap(colPath);
      const items = Array.from(col.values());
      const filtered = queryOrCol.filters
        ? items.filter(item => queryOrCol.filters.every((f: any) => item[f.field] === f.value))
        : items;
      callback({
        empty: filtered.length === 0,
        size: filtered.length,
        forEach: (cb: any) => filtered.forEach(d => cb({ id: d.id, data: () => d, ref: { id: d.id, path: colPath } }))
      });
      return () => {};
    })
  };
});
