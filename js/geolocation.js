/* ==========================================
   Geolocation Module
   Sistem Kehadiran Tahfiz
   ========================================== */

const GeoLocation = {
    currentLocation: null,
    distanceFromPusat: null,
    isWithinRadius: false,
    watchId: null,

    init(onLocationUpdate, onError) {
        if (!navigator.geolocation) {
            if (onError) {
                onError({
                    code: 0,
                    message: 'Geolocation tidak disokong oleh pelayar anda'
                });
            }
            return false;
        }
        this.getCurrentLocation(onLocationUpdate, onError);
        this.watchLocation(onLocationUpdate, onError);
        return true;
    },

    getCurrentLocation(onSuccess, onError) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.updateLocation(position);
                if (onSuccess) {
                    onSuccess({
                        location: this.currentLocation,
                        distance: this.distanceFromPusat,
                        isWithinRadius: this.isWithinRadius
                    });
                }
            },
            (error) => {
                if (onError) {
                    onError(this.handleGeolocationError(error));
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    },

    watchLocation(onSuccess, onError) {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
        }
        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.updateLocation(position);
                if (onSuccess) {
                    onSuccess({
                        location: this.currentLocation,
                        distance: this.distanceFromPusat,
                        isWithinRadius: this.isWithinRadius
                    });
                }
            },
            (error) => {
                if (onError) {
                    onError(this.handleGeolocationError(error));
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000
            }
        );
    },

    stopWatching() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    },

    updateLocation(position) {
        this.currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
        };
        this.distanceFromPusat = this.calculateDistance(
            this.currentLocation.lat,
            this.currentLocation.lng,
            CONFIG.PUSAT_LOCATION.lat,
            CONFIG.PUSAT_LOCATION.lng
        );
        this.isWithinRadius = this.distanceFromPusat <= CONFIG.ALLOWED_RADIUS;
    },

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const φ1 = this.toRadians(lat1);
        const φ2 = this.toRadians(lat2);
        const Δφ = this.toRadians(lat2 - lat1);
        const Δλ = this.toRadians(lon2 - lon1);
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return Math.round(distance);
    },

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    },

    formatDistance(meters) {
        if (meters < 1000) {
            return `${meters}m`;
        } else {
            return `${(meters / 1000).toFixed(2)}km`;
        }
    },

    handleGeolocationError(error) {
        let message = '';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = 'Akses lokasi ditolak. Sila aktifkan akses lokasi untuk menggunakan sistem ini.';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Maklumat lokasi tidak tersedia. Sila cuba lagi.';
                break;
            case error.TIMEOUT:
                message = 'Timeout mendapatkan lokasi. Sila cuba lagi.';
                break;
            default:
                message = 'Ralat mendapatkan lokasi. Sila cuba lagi.';
        }
        return {
            code: error.code,
            message: message
        };
    },

    canCheckIn() {
        if (!this.currentLocation) {
            return {
                allowed: false,
                message: 'Lokasi tidak dapat dikesan'
            };
        }
        if (!this.isWithinRadius) {
            return {
                allowed: false,
                message: `Anda berada ${this.formatDistance(this.distanceFromPusat)} dari ${CONFIG.PUSAT_LOCATION.name}. Anda perlu berada dalam radius ${CONFIG.ALLOWED_RADIUS}m.`
            };
        }
        return {
            allowed: true,
            message: 'Anda boleh check in/out',
            location: this.currentLocation,
            distance: this.distanceFromPusat
        };
    },

    getLocationData() {
        return {
            lat: this.currentLocation?.lat || 0,
            lng: this.currentLocation?.lng || 0,
            distance: this.distanceFromPusat || 0,
            accuracy: this.currentLocation?.accuracy || 0,
            timestamp: this.currentLocation?.timestamp || Date.now()
        };
    },

    async requestPermission() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                () => resolve(true),
                (error) => reject(this.handleGeolocationError(error)),
                { timeout: 5000 }
            );
        });
    },

    isSupported() {
        return 'geolocation' in navigator;
    },

    getCoordinatesString() {
        if (!this.currentLocation) return '--';
        return `${this.currentLocation.lat.toFixed(6)}, ${this.currentLocation.lng.toFixed(6)}`;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeoLocation;
}
