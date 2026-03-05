import { useState, useEffect } from "react";

const DB_NAME = "AxiomOfflineDB";
const STORE_NAME = "offline_sync";

export function useOfflineStore<T>(key: string, initialValue: T) {
    const [data, setData] = useState<T>(initialValue);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Load from IDB on mount
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e: any) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = (e: any) => {
            const db = e.target.result;
            const tx = db.transaction(STORE_NAME, "readonly");
            const store = tx.objectStore(STORE_NAME);
            const getReq = store.get(key);
            getReq.onsuccess = () => {
                if (getReq.result) {
                    setData(getReq.result);
                }
            };
        };

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [key]);

    const saveOffline = (newData: T) => {
        setData(newData);
        const request = indexedDB.open(DB_NAME, 1);
        request.onsuccess = (e: any) => {
            const db = e.target.result;
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            store.put(newData, key);
        };
    };

    return { data, saveOffline, isOnline };
}
