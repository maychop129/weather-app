/**
 * WeatherService - API connector for Open-Meteo Weather, Air Quality, and Geocoding
 * Supports local proxy, direct fallback, client caching, and offline demo data.
 */

class WeatherService {
    constructor() {
        this.cache = new Map();
        this.cacheDuration = 5 * 60 * 1000; // 5 mins
    }

    async getForecast(lat, lon) {
        const cacheKey = `f_${round(lat)}_${round(lon)}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        // Try proxy endpoint first
        let data = null;
        try {
            const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
            if (res.ok) {
                data = await res.json();
            }
        } catch (e) {}

        // Fallback to direct Open-Meteo public API
        if (!data || data.error) {
            try {
                const url = (
                    `https://api.open-meteo.com/v1/forecast?` +
                    `latitude=${lat}&longitude=${lon}&` +
                    `current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&` +
                    `hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,pressure_msl,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,uv_index,is_day&` +
                    `daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&` +
                    `timezone=auto&forecast_days=14`
                );
                const res = await fetch(url);
                if (res.ok) data = await res.json();
            } catch (err) {
                console.warn('Direct forecast request failed:', err);
            }
        }

        // If still no data (completely offline), return realistic mock forecast
        if (!data) {
            data = this.generateMockForecast(lat, lon);
        }

        this.setInCache(cacheKey, data);
        return data;
    }

    async getAirQuality(lat, lon) {
        const cacheKey = `aqi_${round(lat)}_${round(lon)}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        let data = null;
        try {
            const res = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`);
            if (res.ok) data = await res.json();
        } catch (e) {}

        if (!data || data.error) {
            try {
                const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;
                const res = await fetch(url);
                if (res.ok) data = await res.json();
            } catch (err) {
                console.warn('Direct AQI request failed:', err);
            }
        }

        if (!data || data.error) {
            data = {
                current: {
                    us_aqi: 48,
                    european_aqi: 25,
                    pm2_5: 12.4,
                    pm10: 24.8,
                    carbon_monoxide: 220,
                    nitrogen_dioxide: 18,
                    sulphur_dioxide: 6,
                    ozone: 42
                }
            };
        }

        this.setInCache(cacheKey, data);
        return data;
    }

    async searchCity(query) {
        if (!query || query.trim().length < 2) return [];

        let results = [];
        try {
            const res = await fetch(`/api/geocoding?name=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                results = data.results || [];
            }
        } catch (e) {}

        if (results.length === 0) {
            try {
                const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    results = data.results || [];
                }
            } catch (err) {
                console.warn('Direct geocoding search failed:', err);
            }
        }

        return results;
    }

    getFromCache(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        if (Date.now() - item.time > this.cacheDuration) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }

    setInCache(key, data) {
        this.cache.set(key, { time: Date.now(), data });
    }

    generateMockForecast(lat, lon) {
        const now = new Date();
        const hourlyTimes = [];
        const hourlyTemps = [];
        const hourlyPrecipProb = [];
        const hourlyWeatherCode = [];
        const hourlyWind = [];

        for (let i = 0; i < 48; i++) {
            const d = new Date(now.getTime() + i * 3600000);
            hourlyTimes.push(d.toISOString());
            hourlyTemps.push(22 + Math.sin(i / 4) * 6);
            hourlyPrecipProb.push(Math.max(0, Math.sin(i / 3) * 40));
            hourlyWeatherCode.push(1);
            hourlyWind.push(12 + Math.cos(i / 5) * 6);
        }

        const dailyTimes = [];
        const dailyMax = [];
        const dailyMin = [];
        const dailyCode = [];
        const dailyPrecip = [];
        const dailySunrise = [];
        const dailySunset = [];

        for (let i = 0; i < 10; i++) {
            const d = new Date(now.getTime() + i * 86400000);
            dailyTimes.push(d.toISOString().slice(0, 10));
            dailyMax.push(28 + Math.round(Math.random() * 4));
            dailyMin.push(18 + Math.round(Math.random() * 3));
            dailyCode.push(i % 3 === 0 ? 2 : 1);
            dailyPrecip.push(Math.round(Math.random() * 30));
            dailySunrise.push(`${dailyTimes[i]}T06:15`);
            dailySunset.push(`${dailyTimes[i]}T18:25`);
        }

        return {
            current: {
                temperature_2m: 24,
                apparent_temperature: 25,
                relative_humidity_2m: 58,
                is_day: 1,
                precipitation: 0,
                weather_code: 1,
                cloud_cover: 20,
                pressure_msl: 1013,
                wind_speed_10m: 14,
                wind_direction_10m: 120,
                wind_gusts_10m: 22,
                uv_index: 5
            },
            hourly: {
                time: hourlyTimes,
                temperature_2m: hourlyTemps,
                precipitation_probability: hourlyPrecipProb,
                weather_code: hourlyWeatherCode,
                wind_speed_10m: hourlyWind
            },
            daily: {
                time: dailyTimes,
                weather_code: dailyCode,
                temperature_2m_max: dailyMax,
                temperature_2m_min: dailyMin,
                precipitation_probability_max: dailyPrecip,
                sunrise: dailySunrise,
                sunset: dailySunset,
                uv_index_max: [6, 7, 6, 5, 6, 7, 6, 6, 5, 6],
                precipitation_sum: [0, 0.2, 0, 1.4, 0, 0, 0, 0.5, 0, 0]
            }
        };
    }
}

function round(val) {
    return Math.round(Number(val) * 100) / 100;
}

window.weatherService = new WeatherService();
