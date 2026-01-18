/* ==========================================
   Google Maps Integration
   Sistem Kehadiran Tahfiz
   ========================================== */

const MapManager = {
    map: null,
    markers: {
        pusat: null,
        user: null
    },
    radiusCircle: null,
    infoWindows: {
        pusat: null,
        user: null
    },

    init(elementId = 'map') {
        const mapElement = document.getElementById(elementId);
        if (!mapElement) {
            console.error('Map element not found');
            return false;
        }

        this.map = new google.maps.Map(mapElement, {
            center: CONFIG.PUSAT_LOCATION,
            zoom: 16,
            mapTypeId: 'roadmap',
            styles: this.getMapStyles(),
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true
        });

        this.addPusatMarker();
        this.addRadiusCircle();
        return true;
    },

    addPusatMarker() {
        if (this.markers.pusat) {
            this.markers.pusat.setMap(null);
        }

        this.markers.pusat = new google.maps.Marker({
            position: CONFIG.PUSAT_LOCATION,
            map: this.map,
            title: CONFIG.PUSAT_LOCATION.name,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: '#4CAF50',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3
            },
            label: {
                text: 'P',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 'bold'
            }
        });

        this.infoWindows.pusat = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px;">
                    <h3 style="margin: 0 0 5px 0; color: #4CAF50;">${CONFIG.PUSAT_LOCATION.name}</h3>
                    <p style="margin: 0; font-size: 12px;">Lokasi check-in/out</p>
                </div>
            `
        });

        this.markers.pusat.addListener('click', () => {
            this.infoWindows.pusat.open(this.map, this.markers.pusat);
        });
    },

    updateUserMarker(position) {
        if (this.markers.user) {
            this.markers.user.setMap(null);
        }

        this.markers.user = new google.maps.Marker({
            position: position,
            map: this.map,
            title: 'Lokasi Anda',
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#2196F3',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2
            },
            animation: google.maps.Animation.DROP
        });

        const distance = GeoLocation.calculateDistance(
            position.lat,
            position.lng,
            CONFIG.PUSAT_LOCATION.lat,
            CONFIG.PUSAT_LOCATION.lng
        );

        this.infoWindows.user = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px;">
                    <h3 style="margin: 0 0 5px 0; color: #2196F3;">Lokasi Anda</h3>
                    <p style="margin: 0; font-size: 12px;">
                        Jarak dari pusat: <strong>${GeoLocation.formatDistance(distance)}</strong>
                    </p>
                </div>
            `
        });

        this.markers.user.addListener('click', () => {
            this.infoWindows.user.open(this.map, this.markers.user);
        });

        this.panToUser(position);
    },

    addRadiusCircle() {
        if (this.radiusCircle) {
            this.radiusCircle.setMap(null);
        }

        this.radiusCircle = new google.maps.Circle({
            center: CONFIG.PUSAT_LOCATION,
            radius: CONFIG.ALLOWED_RADIUS,
            map: this.map,
            fillColor: '#4CAF50',
            fillOpacity: 0.15,
            strokeColor: '#4CAF50',
            strokeOpacity: 0.5,
            strokeWeight: 2
        });
    },

    updateRadius(newRadius) {
        if (this.radiusCircle) {
            this.radiusCircle.setRadius(newRadius);
        }
    },

    panToUser(position) {
        if (this.map && position) {
            this.map.panTo(position);
        }
    },

    fitBounds() {
        if (!this.map) return;
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(CONFIG.PUSAT_LOCATION);
        if (this.markers.user) {
            bounds.extend(this.markers.user.getPosition());
        }
        this.map.fitBounds(bounds);
        const listener = google.maps.event.addListener(this.map, 'idle', () => {
            if (this.map.getZoom() > 17) {
                this.map.setZoom(17);
            }
            google.maps.event.removeListener(listener);
        });
    },

    centerOnPusat() {
        if (this.map) {
            this.map.setCenter(CONFIG.PUSAT_LOCATION);
            this.map.setZoom(16);
        }
    },

    getMapStyles() {
        return [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            },
            {
                featureType: 'transit',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ];
    },

    drawPath(from, to) {
        const path = new google.maps.Polyline({
            path: [from, to],
            geodesic: true,
            strokeColor: '#2196F3',
            strokeOpacity: 0.7,
            strokeWeight: 3,
            map: this.map
        });
        return path;
    },

    clearMarkers() {
        if (this.markers.user) {
            this.markers.user.setMap(null);
            this.markers.user = null;
        }
    },

    destroy() {
        this.clearMarkers();
        if (this.radiusCircle) {
            this.radiusCircle.setMap(null);
        }
        if (this.markers.pusat) {
            this.markers.pusat.setMap(null);
        }
        this.map = null;
    }
};

function initMap() {
    console.log('Google Maps API loaded');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapManager;
}
