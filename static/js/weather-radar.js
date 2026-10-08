/**
 * WeatherRadar - Interactive Leaflet Radar Map with RainViewer Animated Precipitation
 */

class WeatherRadar {
    constructor(containerId) {
        this.containerId = containerId;
        this.map = null;
        this.marker = null;
        this.radarLayers = [];
        this.timestamps = [];
        this.host = 'https://tilecache.rainviewer.com';
        this.currentFrame = 0;
        this.animationTimer = null;
        this.isPlaying = false;
        this.lat = 28.6139;
        this.lon = 77.2090;
        this.radarData = null;
    }

    init(lat, lon) {
        this.lat = lat;
        this.lon = lon;

        const container = document.getElementById(this.containerId);
        if (!container) return;

        if (typeof L === 'undefined') {
            container.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text-secondary);gap:10px;padding:20px;text-align:center;">
                    <svg style="width:40px;height:40px;color:var(--accent-color);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                        <line x1="12" y1="12" x2="19" y2="5"/>
                    </svg>
                    <div style="font-weight:600;">Interactive Radar Map</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);max-width:300px;">Connect to internet or allow external scripts to stream real-time radar satellite layers.</div>
                </div>
            `;
            return;
        }

        if (!this.map) {
            // Initialize Leaflet Map
            this.map = L.map(this.containerId, {
                center: [this.lat, this.lon],
                zoom: 7,
                zoomControl: false,
                attributionControl: false
            });

            // Smooth dark tile layer
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                maxZoom: 18,
                subdomains: 'abcd'
            }).addTo(this.map);

            // Pulsing marker for user's location
            const pulseIcon = L.divIcon({
                className: 'radar-user-marker',
                html: '<div class="beacon-outer"><div class="beacon-inner"></div></div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            this.marker = L.marker([this.lat, this.lon], { icon: pulseIcon }).addTo(this.map);
            this.marker.bindPopup(`<b>Your Live Location</b><br>${this.lat.toFixed(4)}, ${this.lon.toFixed(4)}`);
        } else {
            this.map.setView([this.lat, this.lon], 7);
            if (this.marker) {
                this.marker.setLatLng([this.lat, this.lon]);
                this.marker.setPopupContent(`<b>Your Live Location</b><br>${this.lat.toFixed(4)}, ${this.lon.toFixed(4)}`);
            }
        }

        this.loadRadarData();
    }

    async loadRadarData() {
        try {
            // First try proxy endpoint, then fallback to public API
            let res;
            try {
                res = await fetch('/api/radar-frames');
            } catch (e) {
                res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
            }

            if (!res.ok) throw new Error('Failed to load radar');
            const data = await res.json();
            this.radarData = data;
            this.host = data.host || 'https://tilecache.rainviewer.com';

            const past = data.radar && data.radar.past ? data.radar.past : [];
            const now = data.radar && data.radar.nowcast ? data.radar.nowcast : [];
            const allFrames = [...past, ...now];

            if (allFrames.length === 0) return;

            this.timestamps = allFrames.map(f => f.time);
            this.setupRadarLayers(allFrames);
            this.updateControls();
        } catch (err) {
            console.warn('Radar data fetch failed:', err);
        }
    }

    setupRadarLayers(frames) {
        // Clear previous layers
        this.radarLayers.forEach(l => {
            if (this.map.hasLayer(l)) this.map.removeLayer(l);
        });
        this.radarLayers = [];

        // Pre-create tile layers with 0 opacity
        frames.forEach(frame => {
            const layer = L.tileLayer(`${this.host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`, {
                opacity: 0,
                zIndex: 10,
                tileSize: 256
            });
            this.radarLayers.push(layer);
        });

        // Set to latest frame by default
        this.currentFrame = this.radarLayers.length - 1;
        this.showFrame(this.currentFrame);
    }

    showFrame(index) {
        if (!this.map || this.radarLayers.length === 0) return;

        // Hide all layers
        this.radarLayers.forEach((layer, i) => {
            if (i === index) {
                if (!this.map.hasLayer(layer)) layer.addTo(this.map);
                layer.setOpacity(0.75);
            } else {
                layer.setOpacity(0);
            }
        });

        this.currentFrame = index;
        this.updateTimeDisplay();
    }

    updateTimeDisplay() {
        const timeEl = document.getElementById('radar-timestamp');
        const slider = document.getElementById('radar-slider');

        if (slider) {
            slider.max = this.radarLayers.length - 1;
            slider.value = this.currentFrame;
        }

        if (timeEl && this.timestamps[this.currentFrame]) {
            const time = new Date(this.timestamps[this.currentFrame] * 1000);
            timeEl.textContent = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }

    play() {
        if (this.isPlaying || this.radarLayers.length === 0) return;
        this.isPlaying = true;
        const playBtn = document.getElementById('radar-play-btn');
        if (playBtn) playBtn.innerHTML = '⏸';

        this.animationTimer = setInterval(() => {
            let next = this.currentFrame + 1;
            if (next >= this.radarLayers.length) next = 0;
            this.showFrame(next);
        }, 750);
    }

    pause() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        if (this.animationTimer) clearInterval(this.animationTimer);
        const playBtn = document.getElementById('radar-play-btn');
        if (playBtn) playBtn.innerHTML = '▶';
    }

    togglePlay() {
        if (this.isPlaying) this.pause();
        else this.play();
    }

    updateControls() {
        const playBtn = document.getElementById('radar-play-btn');
        const slider = document.getElementById('radar-slider');

        if (playBtn && !playBtn.dataset.bound) {
            playBtn.dataset.bound = 'true';
            playBtn.addEventListener('click', () => this.togglePlay());
        }

        if (slider && !slider.dataset.bound) {
            slider.dataset.bound = 'true';
            slider.addEventListener('input', (e) => {
                this.pause();
                this.showFrame(parseInt(e.target.value, 10));
            });
        }
    }
}

window.WeatherRadar = WeatherRadar;
