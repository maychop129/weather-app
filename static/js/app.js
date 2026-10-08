/**
 * Nimbus Weather Clone - Main Application Controller
 * Manages state, UI updates, events, charts, radar, and sound.
 */

class WeatherApp {
    constructor() {
        this.currentLocation = null;
        this.currentWeather = null;
        this.currentAQI = null;
        this.tempUnit = localStorage.getItem('nimbus_unit') || 'C'; // 'C' | 'F'
        this.favorites = this.loadFavorites();
        
        this.canvasEngine = null;
        this.weatherChart = null;
        this.weatherRadar = null;

        this.init();
    }

    async init() {
        // Initialize Canvas Engine
        this.canvasEngine = new WeatherCanvasEngine('weather-canvas');

        // Initialize Hourly Chart
        this.weatherChart = new WeatherChart('hourly-chart-canvas');

        // Initialize Radar Map
        this.weatherRadar = new WeatherRadar('radar-map');

        // Setup Event Listeners
        this.bindEvents();

        // Update Unit Toggle UI
        this.updateUnitUI();

        // Update Favorites Bar
        this.renderFavoritesBar();

        // Auto-detect Live Location & Load Weather
        await this.loadLiveLocation();
    }

    bindEvents() {
        // GPS Locate Button
        const locateBtn = document.getElementById('btn-my-location');
        if (locateBtn) {
            locateBtn.addEventListener('click', () => {
                this.loadLiveLocation(true);
            });
        }

        // Unit Toggle Button
        const unitBtn = document.getElementById('btn-unit-toggle');
        if (unitBtn) {
            unitBtn.addEventListener('click', () => {
                this.tempUnit = this.tempUnit === 'C' ? 'F' : 'C';
                localStorage.setItem('nimbus_unit', this.tempUnit);
                this.updateUnitUI();
                if (this.currentWeather) {
                    this.renderAll();
                }
            });
        }

        // Ambient Sound Toggle Button
        const soundBtn = document.getElementById('btn-sound-toggle');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                const isPlaying = window.weatherSound.toggleMute();
                soundBtn.innerHTML = isPlaying ? WeatherIcons.get('sound-on') : WeatherIcons.get('sound-off');
                soundBtn.classList.toggle('active', isPlaying);
                soundBtn.title = isPlaying ? 'Ambient sound playing (Click to mute)' : 'Ambient sound muted (Click to play)';
            });
        }

        // Refresh Button
        const refreshBtn = document.getElementById('btn-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.classList.add('rotating');
                if (this.currentLocation) {
                    await this.loadWeatherForLocation(this.currentLocation);
                } else {
                    await this.loadLiveLocation(true);
                }
                setTimeout(() => refreshBtn.classList.remove('rotating'), 800);
            });
        }

        // Favorite Current City Button
        const favBtn = document.getElementById('btn-favorite-current');
        if (favBtn) {
            favBtn.addEventListener('click', () => {
                this.toggleCurrentFavorite();
            });
        }

        // Share Weather Snapshot Button
        const shareBtn = document.getElementById('btn-share-weather');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareWeatherSnapshot();
            });
        }

        // Search Input & Autocomplete
        const searchInput = document.getElementById('city-search-input');
        const searchResults = document.getElementById('search-results-dropdown');
        let searchTimeout = null;

        if (searchInput && searchResults) {
            searchInput.addEventListener('input', (e) => {
                const val = e.target.value.trim();
                clearTimeout(searchTimeout);
                if (val.length < 2) {
                    searchResults.classList.remove('show');
                    return;
                }

                searchTimeout = setTimeout(async () => {
                    const results = await window.weatherService.searchCity(val);
                    this.renderSearchResults(results, searchResults);
                }, 300);
            });

            // Close search results on outside click
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                    searchResults.classList.remove('show');
                }
            });

            // Keyboard shortcut '/' to search
            document.addEventListener('keydown', (e) => {
                if (e.key === '/' && document.activeElement !== searchInput) {
                    e.preventDefault();
                    searchInput.focus();
                } else if (e.key === 'Escape') {
                    searchResults.classList.remove('show');
                    searchInput.blur();
                }
            });
        }

        // Chart Metric Tabs
        const chartTabs = document.querySelectorAll('.chart-tab-btn');
        chartTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                chartTabs.forEach(t => t.classList.remove('active'));
                const target = e.currentTarget;
                target.classList.add('active');
                const mode = target.dataset.mode;
                if (this.weatherChart) {
                    this.weatherChart.setMode(mode);
                }
            });
        });

        // Day detail modal close
        const modalClose = document.getElementById('modal-close-btn');
        const modalBackdrop = document.getElementById('day-modal-backdrop');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeDayModal());
        }
        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', (e) => {
                if (e.target === modalBackdrop) this.closeDayModal();
            });
        }
    }

    updateUnitUI() {
        const unitBtn = document.getElementById('btn-unit-toggle');
        if (unitBtn) {
            unitBtn.textContent = `°${this.tempUnit}`;
            unitBtn.title = `Switch to °${this.tempUnit === 'C' ? 'F' : 'C'}`;
        }
    }

    async loadLiveLocation(forceRefresh = false) {
        this.showLoading('Detecting your live location...');
        try {
            const loc = await window.geoManager.getLiveLocation(forceRefresh);
            await this.loadWeatherForLocation(loc);
        } catch (e) {
            console.error('Error loading live location:', e);
            this.showToast('Unable to detect live location. Using default.');
        } finally {
            this.hideLoading();
        }
    }

    async loadWeatherForLocation(loc) {
        this.currentLocation = loc;
        this.updateLocationHeader(loc);
        this.updateFavoriteButtonState();

        this.showLoading(`Fetching weather for ${loc.city}...`);

        try {
            const [weatherData, aqiData] = await Promise.all([
                window.weatherService.getForecast(loc.latitude, loc.longitude),
                window.weatherService.getAirQuality(loc.latitude, loc.longitude)
            ]);

            this.currentWeather = weatherData;
            this.currentAQI = aqiData;

            this.renderAll();

            // Initialize/update radar map with these coordinates
            if (this.weatherRadar) {
                this.weatherRadar.init(loc.latitude, loc.longitude);
            }

            this.showToast(`Updated weather for ${loc.city}`);
        } catch (err) {
            console.error('Failed to load weather data:', err);
            this.showToast('Failed to load latest weather data');
        } finally {
            this.hideLoading();
        }
    }

    renderAll() {
        if (!this.currentWeather) return;

        const current = this.currentWeather.current;
        const daily = this.currentWeather.daily;
        const hourly = this.currentWeather.hourly;
        const condition = WeatherUtils.getCondition(current.weather_code, current.is_day);

        // Update Body Theme
        this.updateTheme(condition.theme);

        // Update Dynamic Canvas Particles
        if (this.canvasEngine) {
            this.canvasEngine.setMode(condition.icon);
        }

        // Update Ambient Sound if unmuted
        if (window.weatherSound) {
            window.weatherSound.play(condition.sound);
        }

        // Render Hero Card
        this.renderHeroCard(current, daily, condition);

        // Render Hourly Forecast Cards & Chart
        this.renderHourlyForecast(hourly);

        // Render 10-Day Forecast List
        this.renderDailyForecast(daily);

        // Render Detailed Metrics Grid (9 Cards)
        this.renderMetricsGrid(current, daily, hourly, this.currentAQI);

        // Render Lifestyle & Activity Recommendations
        this.renderLifestyleAdvice(current, hourly, daily);

        // Render Timestamp
        const updatedTimeEl = document.getElementById('last-updated-time');
        if (updatedTimeEl) {
            updatedTimeEl.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
    }

    updateTheme(themeClass) {
        document.body.className = '';
        document.body.classList.add(themeClass);
    }

    updateLocationHeader(loc) {
        const nameEl = document.getElementById('location-name');
        const subEl = document.getElementById('location-subtitle');
        const badgeEl = document.getElementById('location-source-badge');

        if (nameEl) nameEl.textContent = loc.city;
        if (subEl) {
            const parts = [loc.state, loc.country].filter(Boolean);
            subEl.textContent = parts.join(', ');
        }
        if (badgeEl) {
            badgeEl.textContent = loc.source || 'Live GPS';
            badgeEl.className = 'location-badge ' + (loc.source.includes('GPS') ? 'badge-gps' : 'badge-ip');
        }
    }

    renderHeroCard(current, daily, condition) {
        const tempEl = document.getElementById('hero-temp');
        const condLabelEl = document.getElementById('hero-condition-label');
        const condDescEl = document.getElementById('hero-condition-desc');
        const feelsLikeEl = document.getElementById('hero-feels-like');
        const highLowEl = document.getElementById('hero-high-low');
        const iconContainer = document.getElementById('hero-icon-container');

        if (tempEl) {
            tempEl.textContent = WeatherUtils.formatTemp(current.temperature_2m, this.tempUnit);
        }
        if (condLabelEl) {
            condLabelEl.textContent = condition.label;
        }
        if (condDescEl) {
            condDescEl.textContent = condition.desc;
        }
        if (feelsLikeEl) {
            feelsLikeEl.textContent = `Feels like ${WeatherUtils.formatTemp(current.apparent_temperature, this.tempUnit)}`;
        }
        if (highLowEl && daily) {
            const high = WeatherUtils.formatTemp(daily.temperature_2m_max[0], this.tempUnit);
            const low = WeatherUtils.formatTemp(daily.temperature_2m_min[0], this.tempUnit);
            highLowEl.textContent = `H: ${high} • L: ${low}`;
        }
        if (iconContainer) {
            iconContainer.innerHTML = WeatherIcons.get(condition.icon);
        }

        // Hero quick metrics ribbon
        const ribbonWind = document.getElementById('hero-ribbon-wind');
        const ribbonHumidity = document.getElementById('hero-ribbon-humidity');
        const ribbonPressure = document.getElementById('hero-ribbon-pressure');
        const ribbonUV = document.getElementById('hero-ribbon-uv');

        if (ribbonWind) ribbonWind.textContent = WeatherUtils.formatWind(current.wind_speed_10m, this.tempUnit === 'F' ? 'imperial' : 'metric');
        if (ribbonHumidity) ribbonHumidity.textContent = `${Math.round(current.relative_humidity_2m)}%`;
        if (ribbonPressure) ribbonPressure.textContent = WeatherUtils.formatPressure(current.pressure_msl, this.tempUnit === 'F' ? 'imperial' : 'metric');
        if (ribbonUV) ribbonUV.textContent = `${Math.round(current.uv_index || 0)} ${WeatherUtils.interpretUV(current.uv_index).level}`;
    }

    renderHourlyForecast(hourly) {
        const container = document.getElementById('hourly-cards-container');
        if (!container || !hourly) return;

        // Build data points for next 24 hours
        const items = [];
        const count = Math.min(24, hourly.time.length);
        const now = new Date();

        for (let i = 0; i < count; i++) {
            items.push({
                time: hourly.time[i],
                temp: hourly.temperature_2m[i],
                rainProb: (hourly.precipitation_probability && hourly.precipitation_probability[i]) || 0,
                weatherCode: hourly.weather_code[i],
                windSpeed: hourly.wind_speed_10m[i],
                isDay: (hourly.is_day && hourly.is_day[i] !== undefined) ? hourly.is_day[i] : 1
            });
        }

        // Render Cards
        container.innerHTML = items.map((item, index) => {
            const timeLabel = index === 0 ? 'Now' : WeatherUtils.formatHourOnly(item.time, true);
            const cond = WeatherUtils.getCondition(item.weatherCode, item.isDay);
            const tempStr = WeatherUtils.formatTemp(item.temp, this.tempUnit);
            const rainBadge = item.rainProb > 0 ? `<div class="hourly-rain-badge">💧 ${Math.round(item.rainProb)}%</div>` : '';

            return `
                <div class="hourly-card ${index === 0 ? 'active' : ''}">
                    <div class="hourly-time">${timeLabel}</div>
                    <div class="hourly-icon">${WeatherIcons.get(cond.icon)}</div>
                    <div class="hourly-temp">${tempStr}</div>
                    ${rainBadge}
                </div>
            `;
        }).join('');

        // Render Interactive Spline Chart
        if (this.weatherChart) {
            this.weatherChart.setData(items, this.tempUnit, this.tempUnit === 'F' ? 'imperial' : 'metric');
        }
    }

    renderDailyForecast(daily) {
        const container = document.getElementById('daily-forecast-list');
        if (!container || !daily) return;

        // Find min and max across all days for the Apple Weather-style gradient bar
        const allMins = daily.temperature_2m_min;
        const allMaxs = daily.temperature_2m_max;
        const weekMin = Math.min(...allMins);
        const weekMax = Math.max(...allMaxs);
        const range = weekMax - weekMin || 1;

        const count = Math.min(10, daily.time.length);
        let html = '';

        for (let i = 0; i < count; i++) {
            const dateStr = daily.time[i];
            const isToday = i === 0;
            const dayName = WeatherUtils.formatDayName(dateStr, isToday);
            const cond = WeatherUtils.getCondition(daily.weather_code[i], 1);
            const minT = daily.temperature_2m_min[i];
            const maxT = daily.temperature_2m_max[i];
            const rainProb = (daily.precipitation_probability_max && daily.precipitation_probability_max[i]) || 0;

            // Bar calculations
            const leftPercent = Math.max(0, ((minT - weekMin) / range) * 100);
            const widthPercent = Math.max(8, ((maxT - minT) / range) * 100);

            html += `
                <div class="daily-item" data-day-index="${i}">
                    <div class="daily-col-day">
                        <span class="day-title">${dayName}</span>
                        <span class="day-subtitle">${new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div class="daily-col-icon">
                        <div class="daily-icon-svg">${WeatherIcons.get(cond.icon)}</div>
                        ${rainProb > 10 ? `<span class="daily-rain-pct">💧 ${Math.round(rainProb)}%</span>` : ''}
                    </div>
                    <div class="daily-col-temp-min">${WeatherUtils.formatTemp(minT, this.tempUnit)}</div>
                    <div class="daily-col-bar">
                        <div class="range-bar-track">
                            <div class="range-bar-fill" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>
                        </div>
                    </div>
                    <div class="daily-col-temp-max">${WeatherUtils.formatTemp(maxT, this.tempUnit)}</div>
                </div>
            `;
        }

        container.innerHTML = html;

        // Click on any day to open detailed breakdown modal
        container.querySelectorAll('.daily-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.dayIndex, 10);
                this.openDayModal(index);
            });
        });
    }

    renderMetricsGrid(current, daily, hourly, aqiData) {
        // 1. Air Quality Card
        const aqiVal = (aqiData && aqiData.current && aqiData.current.us_aqi) || 45;
        const aqiInfo = WeatherUtils.interpretAQI(aqiVal);
        const aqiScoreEl = document.getElementById('metric-aqi-score');
        const aqiStatusEl = document.getElementById('metric-aqi-status');
        const aqiDescEl = document.getElementById('metric-aqi-desc');
        const aqiBar = document.getElementById('metric-aqi-bar');
        const aqiBreakdown = document.getElementById('metric-aqi-breakdown');

        if (aqiScoreEl) aqiScoreEl.textContent = aqiInfo.val;
        if (aqiStatusEl) {
            aqiStatusEl.textContent = aqiInfo.status;
            aqiStatusEl.style.color = aqiInfo.color;
        }
        if (aqiDescEl) aqiDescEl.textContent = aqiInfo.desc;
        if (aqiBar) {
            aqiBar.style.width = `${Math.min(100, (aqiInfo.val / 300) * 100)}%`;
            aqiBar.style.backgroundColor = aqiInfo.color;
        }
        if (aqiBreakdown && aqiData && aqiData.current) {
            const c = aqiData.current;
            aqiBreakdown.innerHTML = `
                <div class="aqi-chip"><span>PM2.5</span> <b>${c.pm2_5 ? c.pm2_5.toFixed(1) : '--'}</b></div>
                <div class="aqi-chip"><span>PM10</span> <b>${c.pm10 ? c.pm10.toFixed(1) : '--'}</b></div>
                <div class="aqi-chip"><span>NO₂</span> <b>${c.nitrogen_dioxide ? c.nitrogen_dioxide.toFixed(1) : '--'}</b></div>
                <div class="aqi-chip"><span>O₃</span> <b>${c.ozone ? c.ozone.toFixed(1) : '--'}</b></div>
            `;
        }

        // 2. UV Index Card
        const uvVal = current.uv_index || 0;
        const uvInfo = WeatherUtils.interpretUV(uvVal);
        const uvScoreEl = document.getElementById('metric-uv-score');
        const uvStatusEl = document.getElementById('metric-uv-status');
        const uvAdviceEl = document.getElementById('metric-uv-advice');
        const uvBar = document.getElementById('metric-uv-bar');

        if (uvScoreEl) uvScoreEl.textContent = uvInfo.val;
        if (uvStatusEl) {
            uvStatusEl.textContent = uvInfo.level;
            uvStatusEl.style.color = uvInfo.color;
        }
        if (uvAdviceEl) uvAdviceEl.textContent = uvInfo.advice;
        if (uvBar) {
            uvBar.style.width = `${Math.min(100, (uvInfo.val / 11) * 100)}%`;
            uvBar.style.backgroundColor = uvInfo.color;
        }

        // 3. Wind & Compass Card
        const windSpeed = current.wind_speed_10m || 0;
        const windGusts = current.wind_gusts_10m || 0;
        const windDir = current.wind_direction_10m || 0;
        const windValEl = document.getElementById('metric-wind-val');
        const windDirEl = document.getElementById('metric-wind-direction');
        const windGustEl = document.getElementById('metric-wind-gusts');
        const compassArrow = document.getElementById('compass-arrow');

        if (windValEl) windValEl.textContent = WeatherUtils.formatWind(windSpeed, this.tempUnit === 'F' ? 'imperial' : 'metric');
        if (windDirEl) windDirEl.textContent = `${WeatherUtils.getWindDirection(windDir)} (${Math.round(windDir)}°)`;
        if (windGustEl) windGustEl.textContent = `Gusts up to ${WeatherUtils.formatWind(windGusts, this.tempUnit === 'F' ? 'imperial' : 'metric')}`;
        if (compassArrow) {
            compassArrow.style.transform = `rotate(${windDir}deg)`;
        }

        // 4. Sunrise & Sunset Solar Arc
        const sunriseStr = daily.sunrise[0];
        const sunsetStr = daily.sunset[0];
        const sunriseTimeEl = document.getElementById('metric-sunrise-time');
        const sunsetTimeEl = document.getElementById('metric-sunset-time');
        const daylightRemainEl = document.getElementById('metric-daylight-status');
        const sunArcPoint = document.getElementById('sun-arc-dot');

        if (sunriseTimeEl) sunriseTimeEl.textContent = WeatherUtils.formatTime(sunriseStr, true);
        if (sunsetTimeEl) sunsetTimeEl.textContent = WeatherUtils.formatTime(sunsetStr, true);

        // Calculate solar position along arc
        const sunriseDate = new Date(sunriseStr).getTime();
        const sunsetDate = new Date(sunsetStr).getTime();
        const nowDate = Date.now();

        if (daylightRemainEl && sunArcPoint) {
            if (nowDate < sunriseDate) {
                const diffMin = Math.round((sunriseDate - nowDate) / 60000);
                const h = Math.floor(diffMin / 60);
                const m = diffMin % 60;
                daylightRemainEl.textContent = `Sunrise in ${h}h ${m}m`;
                sunArcPoint.style.left = '0%';
                sunArcPoint.style.top = '100%';
                sunArcPoint.style.transform = 'translate(-50%, -50%)';
            } else if (nowDate > sunsetDate) {
                daylightRemainEl.textContent = `Sunset was ${WeatherUtils.formatTime(sunsetStr, true)}`;
                sunArcPoint.style.left = '100%';
                sunArcPoint.style.top = '100%';
                sunArcPoint.style.transform = 'translate(-50%, -50%)';
            } else {
                const daylightTotal = sunsetDate - sunriseDate;
                const elapsed = nowDate - sunriseDate;
                const pct = Math.min(1, Math.max(0, elapsed / daylightTotal));
                const remainMin = Math.round((sunsetDate - nowDate) / 60000);
                const h = Math.floor(remainMin / 60);
                const m = remainMin % 60;
                daylightRemainEl.textContent = `${h}h ${m}m of daylight remaining`;

                // Arc math: inverted sine wave from 0 to PI
                const xPct = pct * 100;
                const yPct = (1 - Math.sin(Math.PI * pct)) * 100;
                sunArcPoint.style.left = `${xPct}%`;
                sunArcPoint.style.top = `${yPct}%`;
                sunArcPoint.style.transform = 'translate(-50%, -50%)';
            }
        }

        // 5. Humidity & Dew Point Card
        const humidity = current.relative_humidity_2m || 0;
        const dewPoint = (hourly && hourly.dew_point_2m && hourly.dew_point_2m[0]) || (current.temperature_2m - ((100 - humidity) / 5));
        const humValEl = document.getElementById('metric-humidity-val');
        const dewValEl = document.getElementById('metric-dewpoint-val');
        const humDescEl = document.getElementById('metric-humidity-desc');

        if (humValEl) humValEl.textContent = `${Math.round(humidity)}%`;
        if (dewValEl) dewValEl.textContent = `Dew point is ${WeatherUtils.formatTemp(dewPoint, this.tempUnit)}`;
        if (humDescEl) {
            if (humidity < 35) humDescEl.textContent = 'Air is dry and crisp.';
            else if (humidity < 65) humDescEl.textContent = 'Comfortable moisture level.';
            else humDescEl.textContent = 'High humidity, feels warm and muggy.';
        }

        // 6. Precipitation Card
        const precipSum = (daily && daily.precipitation_sum && daily.precipitation_sum[0]) || current.precipitation || 0;
        const precipValEl = document.getElementById('metric-precip-val');
        const precipDescEl = document.getElementById('metric-precip-desc');

        if (precipValEl) precipValEl.textContent = WeatherUtils.formatPrecip(precipSum, this.tempUnit === 'F' ? 'imperial' : 'metric');
        if (precipDescEl) {
            if (precipSum > 5) precipDescEl.textContent = 'Significant rainfall accumulated today.';
            else if (precipSum > 0) precipDescEl.textContent = 'Light showers measured.';
            else precipDescEl.textContent = 'No precipitation measured in the last 24h.';
        }

        // 7. Visibility Card
        const visibilityMeters = (hourly && hourly.visibility && hourly.visibility[0]) || 10000;
        const visValEl = document.getElementById('metric-visibility-val');
        const visDescEl = document.getElementById('metric-visibility-desc');

        if (visValEl) visValEl.textContent = WeatherUtils.formatVisibility(visibilityMeters, this.tempUnit === 'F' ? 'imperial' : 'metric');
        if (visDescEl) {
            if (visibilityMeters >= 9000) visDescEl.textContent = 'Perfect clarity all around.';
            else if (visibilityMeters >= 5000) visDescEl.textContent = 'Moderate visibility.';
            else visDescEl.textContent = 'Haze or mist restricting distance view.';
        }

        // 8. Atmospheric Pressure Card
        const pressure = current.pressure_msl || 1013;
        const pressValEl = document.getElementById('metric-pressure-val');
        const pressDescEl = document.getElementById('metric-pressure-desc');

        if (pressValEl) pressValEl.textContent = WeatherUtils.formatPressure(pressure, this.tempUnit === 'F' ? 'imperial' : 'metric');
        if (pressDescEl) {
            if (pressure > 1020) pressDescEl.textContent = 'High pressure: Fair, stable conditions.';
            else if (pressure < 1005) pressDescEl.textContent = 'Low pressure: Unsettled storm systems.';
            else pressDescEl.textContent = 'Normal atmospheric pressure.';
        }

        // 9. Moon Phase Card
        const moon = WeatherUtils.getMoonPhase(new Date());
        const moonNameEl = document.getElementById('metric-moon-name');
        const moonIllumEl = document.getElementById('metric-moon-illum');
        const moonIconEl = document.getElementById('metric-moon-icon');

        if (moonNameEl) moonNameEl.textContent = moon.name;
        if (moonIllumEl) moonIllumEl.textContent = `${moon.illumination}% illuminated`;
        if (moonIconEl) moonIconEl.innerHTML = WeatherIcons.get('moon-star');
    }

    renderLifestyleAdvice(current, hourly, daily) {
        const scores = WeatherUtils.calculateLifestyleScores(current, hourly, daily);

        // Running
        const runBadge = document.getElementById('lifestyle-run-score');
        const runDesc = document.getElementById('lifestyle-run-desc');
        if (runBadge) {
            runBadge.textContent = `${scores.running.score}/10`;
            runBadge.className = 'lifestyle-score-badge ' + (scores.running.score >= 7 ? 'score-good' : scores.running.score >= 5 ? 'score-mid' : 'score-low');
        }
        if (runDesc) runDesc.textContent = `${scores.running.label} • ${scores.running.reason}`;

        // Stargazing
        const starBadge = document.getElementById('lifestyle-star-score');
        const starDesc = document.getElementById('lifestyle-star-desc');
        if (starBadge) {
            starBadge.textContent = `${scores.stargazing.score}/10`;
            starBadge.className = 'lifestyle-score-badge ' + (scores.stargazing.score >= 7 ? 'score-good' : scores.stargazing.score >= 5 ? 'score-mid' : 'score-low');
        }
        if (starDesc) starDesc.textContent = `${scores.stargazing.label} • ${scores.stargazing.reason}`;

        // Car Wash
        const carBadge = document.getElementById('lifestyle-car-score');
        const carDesc = document.getElementById('lifestyle-car-desc');
        if (carBadge) {
            carBadge.textContent = `${scores.carWash.score}/10`;
            carBadge.className = 'lifestyle-score-badge ' + (scores.carWash.score >= 7 ? 'score-good' : scores.carWash.score >= 5 ? 'score-mid' : 'score-low');
        }
        if (carDesc) carDesc.textContent = `${scores.carWash.label} • ${scores.carWash.reason}`;

        // Umbrella & Clothing
        const clothEl = document.getElementById('lifestyle-clothing-text');
        const umbrellaEl = document.getElementById('lifestyle-umbrella-text');
        if (clothEl) clothEl.textContent = scores.clothing;
        if (umbrellaEl) umbrellaEl.textContent = scores.umbrella.text;
    }

    renderSearchResults(results, container) {
        if (!results || results.length === 0) {
            container.innerHTML = `<div class="search-item empty">No matching cities found</div>`;
            container.classList.add('show');
            return;
        }

        container.innerHTML = results.map(item => {
            const subtitle = [item.admin1, item.country].filter(Boolean).join(', ');
            return `
                <div class="search-item" data-lat="${item.latitude}" data-lon="${item.longitude}" data-name="${item.name}" data-country="${item.country || ''}" data-admin="${item.admin1 || ''}">
                    <div class="search-item-info">
                        <span class="search-item-name">${item.name}</span>
                        <span class="search-item-sub">${subtitle}</span>
                    </div>
                    <span class="search-item-flag">${item.country_code || '📍'}</span>
                </div>
            `;
        }).join('');

        container.classList.add('show');

        container.querySelectorAll('.search-item').forEach(el => {
            el.addEventListener('click', () => {
                const lat = parseFloat(el.dataset.lat);
                const lon = parseFloat(el.dataset.lon);
                const city = el.dataset.name;
                const state = el.dataset.admin;
                const country = el.dataset.country;

                container.classList.remove('show');
                const searchInput = document.getElementById('city-search-input');
                if (searchInput) searchInput.value = '';

                this.loadWeatherForLocation({
                    latitude: lat,
                    longitude: lon,
                    city,
                    state,
                    country,
                    source: 'Selected Location'
                });
            });
        });
    }

    openDayModal(index) {
        if (!this.currentWeather || !this.currentWeather.daily) return;
        const daily = this.currentWeather.daily;
        const dateStr = daily.time[index];
        const cond = WeatherUtils.getCondition(daily.weather_code[index], 1);
        const modal = document.getElementById('day-modal');
        const modalTitle = document.getElementById('modal-day-title');
        const modalBody = document.getElementById('modal-day-content');

        if (!modal || !modalTitle || !modalBody) return;

        modalTitle.textContent = WeatherUtils.formatFullDate(dateStr);

        const high = WeatherUtils.formatTemp(daily.temperature_2m_max[index], this.tempUnit);
        const low = WeatherUtils.formatTemp(daily.temperature_2m_min[index], this.tempUnit);
        const rainProb = (daily.precipitation_probability_max && daily.precipitation_probability_max[index]) || 0;
        const rainSum = (daily.precipitation_sum && daily.precipitation_sum[index]) || 0;
        const uvMax = (daily.uv_index_max && daily.uv_index_max[index]) || 0;
        const windMax = (daily.wind_speed_10m_max && daily.wind_speed_10m_max[index]) || 0;
        const windGustMax = (daily.wind_gusts_10m_max && daily.wind_gusts_10m_max[index]) || 0;

        modalBody.innerHTML = `
            <div class="modal-hero">
                <div class="modal-icon">${WeatherIcons.get(cond.icon)}</div>
                <div class="modal-temps">
                    <div class="modal-condition">${cond.label}</div>
                    <div class="modal-high-low">High ${high} • Low ${low}</div>
                    <p class="modal-desc">${cond.desc}</p>
                </div>
            </div>

            <div class="modal-stats-grid">
                <div class="modal-stat-box">
                    <span class="stat-box-label">Rain Chance</span>
                    <span class="stat-box-value">${Math.round(rainProb)}%</span>
                </div>
                <div class="modal-stat-box">
                    <span class="stat-box-label">Rain Accumulation</span>
                    <span class="stat-box-value">${WeatherUtils.formatPrecip(rainSum, this.tempUnit === 'F' ? 'imperial' : 'metric')}</span>
                </div>
                <div class="modal-stat-box">
                    <span class="stat-box-label">Peak UV Index</span>
                    <span class="stat-box-value">${Math.round(uvMax)} (${WeatherUtils.interpretUV(uvMax).level})</span>
                </div>
                <div class="modal-stat-box">
                    <span class="stat-box-label">Peak Wind Speed</span>
                    <span class="stat-box-value">${WeatherUtils.formatWind(windMax, this.tempUnit === 'F' ? 'imperial' : 'metric')}</span>
                </div>
                <div class="modal-stat-box">
                    <span class="stat-box-label">Max Wind Gusts</span>
                    <span class="stat-box-value">${WeatherUtils.formatWind(windGustMax, this.tempUnit === 'F' ? 'imperial' : 'metric')}</span>
                </div>
                <div class="modal-stat-box">
                    <span class="stat-box-label">Sunrise & Sunset</span>
                    <span class="stat-box-value">${WeatherUtils.formatTime(daily.sunrise[index], true)} / ${WeatherUtils.formatTime(daily.sunset[index], true)}</span>
                </div>
            </div>
        `;

        modal.classList.add('open');
    }

    closeDayModal() {
        const modal = document.getElementById('day-modal');
        if (modal) modal.classList.remove('open');
    }

    // Favorites
    loadFavorites() {
        try {
            const saved = localStorage.getItem('nimbus_favorites');
            return saved ? JSON.parse(saved) : [
                { city: 'London', state: 'England', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
                { city: 'Tokyo', state: 'Tokyo', country: 'Japan', latitude: 35.6895, longitude: 139.6917 },
                { city: 'New York', state: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060 }
            ];
        } catch (e) {
            return [];
        }
    }

    saveFavorites() {
        try {
            localStorage.setItem('nimbus_favorites', JSON.stringify(this.favorites));
        } catch (e) {}
    }

    toggleCurrentFavorite() {
        if (!this.currentLocation) return;
        const existsIndex = this.favorites.findIndex(f => 
            Math.abs(f.latitude - this.currentLocation.latitude) < 0.05 && 
            Math.abs(f.longitude - this.currentLocation.longitude) < 0.05
        );

        if (existsIndex >= 0) {
            this.favorites.splice(existsIndex, 1);
            this.showToast(`Removed ${this.currentLocation.city} from favorites`);
        } else {
            this.favorites.push({
                city: this.currentLocation.city,
                state: this.currentLocation.state,
                country: this.currentLocation.country,
                latitude: this.currentLocation.latitude,
                longitude: this.currentLocation.longitude
            });
            this.showToast(`Saved ${this.currentLocation.city} to favorites!`);
        }

        this.saveFavorites();
        this.updateFavoriteButtonState();
        this.renderFavoritesBar();
    }

    updateFavoriteButtonState() {
        const favBtn = document.getElementById('btn-favorite-current');
        if (!favBtn || !this.currentLocation) return;

        const isFav = this.favorites.some(f => 
            Math.abs(f.latitude - this.currentLocation.latitude) < 0.05 && 
            Math.abs(f.longitude - this.currentLocation.longitude) < 0.05
        );

        favBtn.innerHTML = isFav ? WeatherIcons.get('bookmark-filled') : WeatherIcons.get('bookmark');
        favBtn.classList.toggle('favorited', isFav);
        favBtn.title = isFav ? 'Remove from favorites' : 'Add to favorite cities';
    }

    renderFavoritesBar() {
        const container = document.getElementById('favorites-pill-bar');
        if (!container) return;

        if (this.favorites.length === 0) {
            container.innerHTML = `<span class="fav-empty-hint">Pin favorite cities to quickly switch between them</span>`;
            return;
        }

        container.innerHTML = this.favorites.map((fav, i) => `
            <button class="fav-pill" data-index="${i}">
                <span class="fav-pill-dot"></span>
                <span class="fav-pill-name">${fav.city}</span>
            </button>
        `).join('');

        container.querySelectorAll('.fav-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index, 10);
                const fav = this.favorites[idx];
                if (fav) {
                    this.loadWeatherForLocation({
                        ...fav,
                        source: 'Saved Favorite'
                    });
                }
            });
        });
    }

    async shareWeatherSnapshot() {
        if (!this.currentWeather || !this.currentLocation) {
            this.showToast('Weather data not ready to share');
            return;
        }

        const cur = this.currentWeather.current;
        const daily = this.currentWeather.daily;
        const cond = WeatherUtils.getCondition(cur.weather_code, cur.is_day);
        const temp = WeatherUtils.formatTemp(cur.temperature_2m, this.tempUnit);
        const feels = WeatherUtils.formatTemp(cur.apparent_temperature, this.tempUnit);
        const high = daily ? WeatherUtils.formatTemp(daily.temperature_2m_max[0], this.tempUnit) : '--°';
        const low = daily ? WeatherUtils.formatTemp(daily.temperature_2m_min[0], this.tempUnit) : '--°';
        const loc = [this.currentLocation.city, this.currentLocation.country].filter(Boolean).join(', ');

        const shareText = `🌦️ Nimbus Weather: ${loc}\n` +
                          `🌡️ ${temp} (${cond.label}, Feels like ${feels})\n` +
                          `📈 High: ${high} • Low: ${low}\n` +
                          `💨 Wind: ${WeatherUtils.formatWind(cur.wind_speed_10m, this.tempUnit === 'F' ? 'imperial' : 'metric')}\n` +
                          `💧 Humidity: ${Math.round(cur.relative_humidity_2m)}% • UV: ${Math.round(cur.uv_index || 0)}\n` +
                          `🌐 Live Weather Clone App`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Live Weather in ${loc}`,
                    text: shareText
                });
                return;
            } catch (e) {
                // User cancelled or share failed, fallback to clipboard
            }
        }

        try {
            await navigator.clipboard.writeText(shareText);
            this.showToast('📋 Weather snapshot copied to clipboard!');
        } catch (err) {
            this.showToast('Failed to copy to clipboard');
        }
    }

    showToast(message) {
        let toast = document.getElementById('nimbus-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'nimbus-toast';
            toast.className = 'nimbus-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('visible');
        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.classList.remove('visible');
        }, 3000);
    }

    showLoading(text = 'Loading...') {
        const loader = document.getElementById('loading-indicator');
        const loaderText = document.getElementById('loading-text');
        if (loader) loader.classList.add('active');
        if (loaderText) loaderText.textContent = text;
    }

    hideLoading() {
        const loader = document.getElementById('loading-indicator');
        if (loader) loader.classList.remove('active');
    }
}

// Start app once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new WeatherApp();
});
