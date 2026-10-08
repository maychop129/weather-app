/**
 * Utility functions for Nimbus Weather Clone
 * Unit conversions, WMO weather codes, moon phase, lifestyle scores, formatting
 */

const WeatherUtils = {
    // Temperature conversion
    celsiusToFahrenheit(c) {
        return (c * 9) / 5 + 32;
    },

    formatTemp(celsius, unit = 'C') {
        if (celsius === null || celsius === undefined || isNaN(celsius)) return '--°';
        const val = unit === 'F' ? this.celsiusToFahrenheit(celsius) : celsius;
        return `${Math.round(val)}°`;
    },

    formatTempValue(celsius, unit = 'C') {
        if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
        const val = unit === 'F' ? this.celsiusToFahrenheit(celsius) : celsius;
        return Math.round(val);
    },

    // Wind speed conversion
    formatWind(kmh, unit = 'metric') {
        if (kmh === null || kmh === undefined || isNaN(kmh)) return '--';
        if (unit === 'imperial') {
            const mph = kmh * 0.621371;
            return `${Math.round(mph)} mph`;
        }
        return `${Math.round(kmh)} km/h`;
    },

    // Wind direction degree to cardinal
    getWindDirection(degrees) {
        if (degrees === null || degrees === undefined) return 'N';
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round((degrees % 360) / 22.5) % 16;
        return directions[index];
    },

    // Pressure conversion (hPa to inHg if imperial)
    formatPressure(hpa, unit = 'metric') {
        if (!hpa) return '--';
        if (unit === 'imperial') {
            const inHg = hpa * 0.02953;
            return `${inHg.toFixed(2)} inHg`;
        }
        return `${Math.round(hpa)} hPa`;
    },

    // Visibility conversion (meters/km)
    formatVisibility(meters, unit = 'metric') {
        if (!meters && meters !== 0) return '--';
        const km = meters / 1000;
        if (unit === 'imperial') {
            const miles = km * 0.621371;
            return `${miles.toFixed(1)} mi`;
        }
        return `${km.toFixed(1)} km`;
    },

    // Precipitation formatting
    formatPrecip(mm, unit = 'metric') {
        if (mm === null || mm === undefined) return '0 mm';
        if (unit === 'imperial') {
            const inches = mm * 0.0393701;
            return `${inches.toFixed(2)} in`;
        }
        return `${mm.toFixed(1)} mm`;
    },

    // Time formatting
    formatTime(dateStr, is12h = true) {
        try {
            const date = new Date(dateStr);
            if (isNaN(date)) return dateStr;
            return date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: is12h
            });
        } catch (e) {
            return dateStr;
        }
    },

    formatHourOnly(dateStr, is12h = true) {
        try {
            const date = new Date(dateStr);
            if (isNaN(date)) return dateStr;
            if (is12h) {
                return date.toLocaleTimeString([], { hour: 'numeric', hour12: true });
            }
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '00', hour12: false });
        } catch (e) {
            return dateStr;
        }
    },

    formatDayName(dateStr, isToday = false) {
        try {
            const date = new Date(dateStr);
            if (isToday) return 'Today';
            return date.toLocaleDateString([], { weekday: 'short' });
        } catch (e) {
            return dateStr;
        }
    },

    formatFullDate(dateStr) {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString([], {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    },

    // WMO Weather code dictionary
    getCondition(code, isDay = 1) {
        const c = Number(code);
        const day = Boolean(isDay);

        const conditions = {
            0: {
                label: 'Clear Sky',
                icon: day ? 'clear-day' : 'clear-night',
                theme: day ? 'theme-clear-day' : 'theme-clear-night',
                sound: day ? 'birds' : 'crickets',
                desc: 'Sunny and completely clear skies.'
            },
            1: {
                label: 'Mainly Clear',
                icon: day ? 'mostly-clear-day' : 'mostly-clear-night',
                theme: day ? 'theme-clear-day' : 'theme-clear-night',
                sound: day ? 'birds' : 'crickets',
                desc: 'Scattered clouds with plenty of open sky.'
            },
            2: {
                label: 'Partly Cloudy',
                icon: day ? 'partly-cloudy-day' : 'partly-cloudy-night',
                theme: day ? 'theme-cloudy-day' : 'theme-cloudy-night',
                sound: 'wind',
                desc: 'A gentle mix of sun and passing clouds.'
            },
            3: {
                label: 'Overcast',
                icon: 'overcast',
                theme: 'theme-overcast',
                sound: 'wind',
                desc: 'Dense cloud cover blocking the sun.'
            },
            45: {
                label: 'Foggy',
                icon: 'fog',
                theme: 'theme-fog',
                sound: 'wind',
                desc: 'Reduced visibility due to mist and low fog.'
            },
            48: {
                label: 'Depositing Rime Fog',
                icon: 'fog',
                theme: 'theme-fog',
                sound: 'wind',
                desc: 'Freezing rime fog coating surfaces.'
            },
            51: {
                label: 'Light Drizzle',
                icon: 'drizzle',
                theme: 'theme-rain',
                sound: 'rain',
                desc: 'Gentle mist-like rain drops.'
            },
            53: {
                label: 'Moderate Drizzle',
                icon: 'drizzle',
                theme: 'theme-rain',
                sound: 'rain',
                desc: 'Continuous fine rain.'
            },
            55: {
                label: 'Dense Drizzle',
                icon: 'drizzle',
                theme: 'theme-rain',
                sound: 'rain',
                desc: 'Heavy drizzle soaking the streets.'
            },
            56: {
                label: 'Freezing Drizzle',
                icon: 'freezing-rain',
                theme: 'theme-snow',
                sound: 'rain',
                desc: 'Freezing drizzle causing slick conditions.'
            },
            57: {
                label: 'Heavy Freezing Drizzle',
                icon: 'freezing-rain',
                theme: 'theme-snow',
                sound: 'rain',
                desc: 'Dense freezing drizzle, caution advised.'
            },
            61: {
                label: 'Slight Rain',
                icon: 'rain-light',
                theme: 'theme-rain',
                sound: 'rain',
                desc: 'Light showers scattered across the area.'
            },
            63: {
                label: 'Moderate Rain',
                icon: 'rain-moderate',
                theme: 'theme-rain',
                sound: 'rain',
                desc: 'Steady rain showers.'
            },
            65: {
                label: 'Heavy Rain',
                icon: 'rain-heavy',
                theme: 'theme-heavy-rain',
                sound: 'heavy-rain',
                desc: 'Downpours with heavy precipitation.'
            },
            66: {
                label: 'Freezing Rain',
                icon: 'freezing-rain',
                theme: 'theme-snow',
                sound: 'rain',
                desc: 'Rain freezing upon contact with surfaces.'
            },
            67: {
                label: 'Heavy Freezing Rain',
                icon: 'freezing-rain',
                theme: 'theme-snow',
                sound: 'rain',
                desc: 'Dangerous freezing rain causing ice glaze.'
            },
            71: {
                label: 'Slight Snow',
                icon: 'snow-light',
                theme: 'theme-snow',
                sound: 'wind',
                desc: 'Gentle fluttering snow flurries.'
            },
            73: {
                label: 'Moderate Snow',
                icon: 'snow-moderate',
                theme: 'theme-snow',
                sound: 'wind',
                desc: 'Steady snowfall building accumulation.'
            },
            75: {
                label: 'Heavy Snow',
                icon: 'snow-heavy',
                theme: 'theme-snow',
                sound: 'wind',
                desc: 'Blizzard-like conditions with heavy snow.'
            },
            77: {
                label: 'Snow Grains',
                icon: 'snow-light',
                theme: 'theme-snow',
                sound: 'wind',
                desc: 'Small opaque ice grains falling.'
            },
            80: {
                label: 'Scattered Showers',
                icon: 'rain-light',
                theme: 'theme-rain',
                sound: 'rain',
                desc: 'Passing rain showers with dry intervals.'
            },
            81: {
                label: 'Moderate Showers',
                icon: 'rain-moderate',
                theme: 'theme-rain',
                sound: 'rain',
                desc: 'Periodic moderate rain showers.'
            },
            82: {
                label: 'Violent Rain Showers',
                icon: 'rain-heavy',
                theme: 'theme-heavy-rain',
                sound: 'heavy-rain',
                desc: 'Torrential rain bursts with possible localized pooling.'
            },
            85: {
                label: 'Slight Snow Showers',
                icon: 'snow-light',
                theme: 'theme-snow',
                sound: 'wind',
                desc: 'Intermittent flurries passing through.'
            },
            86: {
                label: 'Heavy Snow Showers',
                icon: 'snow-heavy',
                theme: 'theme-snow',
                sound: 'wind',
                desc: 'Intense squalls of heavy snow.'
            },
            95: {
                label: 'Thunderstorm',
                icon: 'thunderstorm',
                theme: 'theme-storm',
                sound: 'thunder',
                desc: 'Thunder and lightning with gusty winds.'
            },
            96: {
                label: 'Thunderstorm with Hail',
                icon: 'thunderstorm-hail',
                theme: 'theme-storm',
                sound: 'thunder',
                desc: 'Severe thunderstorm producing hail.'
            },
            99: {
                label: 'Severe Thunderstorm',
                icon: 'thunderstorm-hail',
                theme: 'theme-storm',
                sound: 'thunder',
                desc: 'Intense thunderstorm with heavy hail and strong gusts.'
            }
        };

        return conditions[c] || {
            label: 'Partly Cloudy',
            icon: day ? 'partly-cloudy-day' : 'partly-cloudy-night',
            theme: day ? 'theme-clear-day' : 'theme-clear-night',
            sound: 'wind',
            desc: 'Variable atmospheric conditions.'
        };
    },

    // Air Quality Index interpretation
    interpretAQI(usAqi) {
        const val = Math.round(Number(usAqi) || 0);
        if (val <= 50) {
            return {
                val,
                status: 'Good',
                color: '#10b981',
                bg: 'rgba(16, 185, 129, 0.15)',
                desc: 'Air quality is satisfactory and poses little to no risk.'
            };
        } else if (val <= 100) {
            return {
                val,
                status: 'Moderate',
                color: '#f59e0b',
                bg: 'rgba(245, 158, 11, 0.15)',
                desc: 'Air quality is acceptable; sensitive groups should limit prolonged outdoor exertion.'
            };
        } else if (val <= 150) {
            return {
                val,
                status: 'Unhealthy for Sensitive',
                color: '#f97316',
                bg: 'rgba(249, 115, 22, 0.15)',
                desc: 'Members of sensitive groups may experience health effects.'
            };
        } else if (val <= 200) {
            return {
                val,
                status: 'Unhealthy',
                color: '#ef4444',
                bg: 'rgba(239, 68, 68, 0.15)',
                desc: 'Everyone may begin to experience health effects; wear a protective mask.'
            };
        } else if (val <= 300) {
            return {
                val,
                status: 'Very Unhealthy',
                color: '#a855f7',
                bg: 'rgba(168, 85, 247, 0.15)',
                desc: 'Health alert: risk of health effects is increased for everyone.'
            };
        } else {
            return {
                val,
                status: 'Hazardous',
                color: '#831843',
                bg: 'rgba(131, 24, 67, 0.25)',
                desc: 'Health warning of emergency conditions. Stay indoors.'
            };
        }
    },

    // UV Index interpretation
    interpretUV(uv) {
        const val = Math.round(Number(uv) || 0);
        if (val <= 2) {
            return {
                val,
                level: 'Low',
                color: '#10b981',
                advice: 'Minimal danger. No protection needed for ordinary exposure.'
            };
        } else if (val <= 5) {
            return {
                val,
                level: 'Moderate',
                color: '#f59e0b',
                advice: 'Stay in shade near midday. Wear sunglasses & SPF 30+.'
            };
        } else if (val <= 7) {
            return {
                val,
                level: 'High',
                color: '#f97316',
                advice: 'Protection essential. Reduce time in direct sun 11 AM - 4 PM.'
            };
        } else if (val <= 10) {
            return {
                val,
                level: 'Very High',
                color: '#ef4444',
                advice: 'Extra protection needed. Unprotected skin can burn rapidly.'
            };
        } else {
            return {
                val,
                level: 'Extreme',
                color: '#a855f7',
                advice: 'Take all precautions. Avoid going outside during peak hours.'
            };
        }
    },

    // Moon phase calculation
    getMoonPhase(date = new Date()) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        // Approximate Julian Date calculation
        let rYear = year;
        let rMonth = month;
        if (month < 3) {
            rYear--;
            rMonth += 12;
        }

        const a = Math.floor(rYear / 100);
        const b = 2 - a + Math.floor(a / 4);
        const jd = Math.floor(365.25 * (rYear + 4716)) + Math.floor(30.6001 * (rMonth + 1)) + day + b - 1524.5;
        const daysSinceNew = (jd - 2451549.5) % 29.53058867;
        const phase = (daysSinceNew < 0 ? daysSinceNew + 29.53058867 : daysSinceNew) / 29.53058867;

        // Illumination approximation (0 to 100%)
        const illumination = Math.round((0.5 * (1 - Math.cos(2 * Math.PI * phase))) * 100);

        let phaseName = 'New Moon';
        let phaseIcon = 'new-moon';

        if (phase < 0.03 || phase >= 0.97) {
            phaseName = 'New Moon';
            phaseIcon = 'new-moon';
        } else if (phase < 0.22) {
            phaseName = 'Waxing Crescent';
            phaseIcon = 'waxing-crescent';
        } else if (phase < 0.28) {
            phaseName = 'First Quarter';
            phaseIcon = 'first-quarter';
        } else if (phase < 0.47) {
            phaseName = 'Waxing Gibbous';
            phaseIcon = 'waxing-gibbous';
        } else if (phase < 0.53) {
            phaseName = 'Full Moon';
            phaseIcon = 'full-moon';
        } else if (phase < 0.72) {
            phaseName = 'Waning Gibbous';
            phaseIcon = 'waning-gibbous';
        } else if (phase < 0.78) {
            phaseName = 'Last Quarter';
            phaseIcon = 'last-quarter';
        } else {
            phaseName = 'Waning Crescent';
            phaseIcon = 'waning-crescent';
        }

        return {
            phase,
            name: phaseName,
            illumination,
            icon: phaseIcon
        };
    },

    // Lifestyle & Activity recommendations
    calculateLifestyleScores(current, hourly, daily) {
        const temp = current.temperature_2m || 20;
        const precip = current.precipitation || 0;
        const wind = current.wind_speed_10m || 10;
        const humidity = current.relative_humidity_2m || 50;
        const cloud = current.cloud_cover || 20;
        const uv = current.uv_index || 3;

        // Running score (0-10)
        let runScore = 10;
        if (temp < 5 || temp > 32) runScore -= 4;
        else if (temp < 10 || temp > 28) runScore -= 2;
        if (precip > 0.5) runScore -= 4;
        else if (precip > 0) runScore -= 2;
        if (wind > 30) runScore -= 3;
        else if (wind > 20) runScore -= 1;
        if (humidity > 85) runScore -= 2;
        runScore = Math.max(1, Math.min(10, runScore));

        // Stargazing score (0-10)
        let starScore = 10;
        if (cloud > 80) starScore -= 8;
        else if (cloud > 50) starScore -= 5;
        else if (cloud > 25) starScore -= 2;
        if (precip > 0) starScore -= 4;
        starScore = Math.max(1, Math.min(10, starScore));

        // Car Wash score
        let carWashScore = 10;
        const nextRainProb = (daily && daily.precipitation_probability_max && daily.precipitation_probability_max[0]) || 0;
        const day2RainProb = (daily && daily.precipitation_probability_max && daily.precipitation_probability_max[1]) || 0;
        if (nextRainProb > 60 || day2RainProb > 60) carWashScore = 2;
        else if (nextRainProb > 30 || day2RainProb > 40) carWashScore = 5;
        else carWashScore = 9;

        // Clothing advice
        let clothing = 'Comfortable light clothing, t-shirt & casual wear.';
        if (temp < 5) clothing = 'Heavy winter coat, scarf, gloves, and thermal layers.';
        else if (temp < 12) clothing = 'Warm jacket or fleece sweater with long pants.';
        else if (temp < 18) clothing = 'Light jacket, cardigan or windbreaker recommended.';
        else if (temp > 28) clothing = 'Breathable lightweight fabrics, hat & sunglasses.';

        const needUmbrella = precip > 0.2 || (daily && daily.precipitation_probability_max && daily.precipitation_probability_max[0] > 40);

        return {
            running: {
                score: runScore,
                label: runScore >= 8 ? 'Ideal for Outdoor Run' : runScore >= 5 ? 'Fair Conditions' : 'Not Recommended',
                reason: runScore >= 8 ? 'Comfortable temperature and calm winds.' : 'Adverse weather or humidity.'
            },
            stargazing: {
                score: starScore,
                label: starScore >= 8 ? 'Crystal Clear Sky' : starScore >= 5 ? 'Partially Visible' : 'Cloudy / Obscured',
                reason: `${cloud}% cloud cover overhead.`
            },
            carWash: {
                score: carWashScore,
                label: carWashScore >= 7 ? 'Great Day to Wash' : carWashScore >= 5 ? 'Fair' : 'Hold Off (Rain Expected)',
                reason: carWashScore >= 7 ? 'Dry forecast for the next 48 hours.' : 'Rain probability is elevated.'
            },
            clothing,
            umbrella: {
                needed: Boolean(needUmbrella),
                text: needUmbrella ? 'Carry an umbrella (rain expected)' : 'No umbrella needed today'
            }
        };
    }
};

window.WeatherUtils = WeatherUtils;
