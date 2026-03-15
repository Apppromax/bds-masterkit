export const setStorageItem = (key: string, value: any) => {
    try {
        if (value === null || value === undefined) {
            sessionStorage.removeItem(key);
        } else {
            sessionStorage.setItem(key, JSON.stringify(value));
        }
    } catch (e) {
        console.warn('[Storage] sessionStorage quota exceeded or unavailable', e);
    }
};

export const getStorageItem = <T>(key: string, defaultValue: T): T => {
    try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) as T : defaultValue;
    } catch (e) {
        console.warn('[Storage] Error reading from sessionStorage', e);
        return defaultValue;
    }
};
