export async function getCurrentLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
        // fallback stub for non-https or unsupported envs
        return { latitude: 37.4979, longitude: 127.0276, accuracy_m: 50 };
    }
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((pos) => resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy_m: pos.coords.accuracy ?? 0,
        }), (err) => reject(err), { enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 });
    });
}
