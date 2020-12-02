const storage = {
    init: ()=>{
        storage.ready = new Promise((resolve, reject) => {
            var request = window.indexedDB.open(location.origin);
        
            request.onupgradeneeded = e => {
                storage.db = e.target.result;
                storage.db.createObjectStore('store');
            };
        
            request.onsuccess = e => {
                storage.db = e.target.result;
              resolve();
            };
        
            request.onerror = e => {
                storage.db = e.target.result;
              reject(e);
            };
        });
    },
    get: (key) => {
        return storage.ready.then(() => {
          return new Promise((resolve, reject) => {
            var request = storage.getStore().get(key);
            request.onsuccess = e => resolve(e.target.result);
            request.onerror = reject;
          });
        });
    },
    
    getStore: () => {
        return storage.db
        .transaction(['store'], 'readwrite')
        .objectStore('store');
    },

    set: (key, value) => {
        return storage.ready.then(() => {
          return new Promise((resolve, reject) => {
            var request = storage.getStore().put(value, key);
            request.onsuccess = resolve;
            request.onerror = reject;
          });
        });
    },
    
    delete: (key, value) => {
        window.indexedDB.deleteDatabase(location.origin);
    }
}

export default storage;