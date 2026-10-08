/**
 * GeolocationManager - Live GPS Geolocation with IP Fallback & Reverse Geocoding
 */

class GeolocationManager {
    constructor() {
        this.currentLocation = null;
        this.isLocating = false;
        this.cacheKey = 'nimbus_last_location';
    }

    getLastSavedLocation() {
        try {
            const saved = localStorage.getItem(this.cacheKey);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    }

    saveLocation(loc) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(loc));
        } catch (e) {}
    }

    async getLiveLocation(forceRefresh = false) {
        this.isLocating = true;

        // Try HTML5 Browser Geolocation first
        try {
            const coords = await this.getBrowserCoordinates();
            const locationInfo = await this.reverseGeocode(coords.latitude, coords.longitude);
            
            const result = {
                latitude: coords.latitude,
                longitude: coords.longitude,
                city: locationInfo.city || locationInfo.locality || 'Current Location',
                state: locationInfo.principalSubdivision || locationInfo.region || '',
                country: locationInfo.countryName || '',
                countryCode: locationInfo.countryCode || '',
                source: 'GPS (High Accuracy)',
                accuracy: coords.accuracy
            };

            this.currentLocation = result;
            this.saveLocation(result);
            this.isLocating = false;
            return result;
        } catch (browserErr) {
            console.warn('Browser GPS unavailable, falling back to IP geolocation:', browserErr.message);

            // Fallback to IP geolocation
            try {
                const ipLoc = await this.getIpLocation();
                const result = {
                    latitude: ipLoc.latitude,
                    longitude: ipLoc.longitude,
                    city: ipLoc.city || 'My Location',
                    state: ipLoc.region || '',
                    country: ipLoc.country || '',
                    countryCode: ipLoc.country_code || '',
                    source: 'IP Location Fallback',
                    accuracy: 5000
                };

                this.currentLocation = result;
                this.saveLocation(result);
                this.isLocating = false;
                return result;
            } catch (ipErr) {
                console.error('IP Geolocation failed:', ipErr);

                // Ultimate fallback: Last saved location or default
                const cached = this.getLastSavedLocation();
                if (cached) {
                    this.currentLocation = cached;
                    this.isLocating = false;
                    return cached;
                }

                // Default
                const fallback = {
                    latitude: 28.6139,
                    longitude: 77.2090,
                    city: 'New Delhi',
                    state: 'Delhi',
                    country: 'India',
                    countryCode: 'IN',
                    source: 'Default Location',
                    accuracy: null
                };
                this.currentLocation = fallback;
                this.isLocating = false;
                return fallback;
            }
        }
    }

    getBrowserCoordinates() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                return reject(new Error('Geolocation is not supported by your browser'));
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    resolve({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        accuracy: pos.coords.accuracy
                    });
                },
                (err) => {
                    reject(err);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 9000,
                    maximumAge: 60000
                }
            );
        });
    }

    async getIpLocation() {
        // Try local Flask proxy first
        try {
            const res = await fetch('/api/ip-location');
            if (res.ok) {
                const data = await res.json();
                if (data.latitude && data.longitude) return data;
            }
        } catch (e) {}

        // Fallback to direct client request
        const res = await fetch('https://ipwho.is/');
        if (!res.ok) throw new Error('IP service error');
        const data = await res.json();
        return data;
    }

    async reverseGeocode(lat, lon) {
        // Try local proxy first
        try {
            const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
            if (res.ok) {
                const data = await res.json();
                if (data.city || data.locality) return data;
            }
        } catch (e) {}

        // Fallback to direct public endpoint
        try {
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            if (res.ok) return await res.json();
        } catch (e) {}

        return { city: 'Current Location', countryName: '' };
    }
}

window.geoManager = new GeolocationManager();
