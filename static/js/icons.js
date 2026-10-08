/**
 * WeatherIcons Library - Vector SVG weather icons with micro-animations
 */

const WeatherIcons = {
    icons: {
        'clear-day': `
            <svg class="weather-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="14" fill="url(#sun-grad)"/>
                <g class="anim-spin-slow" stroke="#FFA726" stroke-width="3" stroke-linecap="round">
                    <line x1="32" y1="6" x2="32" y2="12" />
                    <line x1="32" y1="52" x2="32" y2="58" />
                    <line x1="6" y1="32" x2="12" y2="32" />
                    <line x1="52" y1="32" x2="58" y2="32" />
                    <line x1="13.6" y1="13.6" x2="17.9" y2="17.9" />
                    <line x1="46.1" y1="46.1" x2="50.4" y2="50.4" />
                    <line x1="13.6" y1="50.4" x2="17.9" y2="46.1" />
                    <line x1="46.1" y1="17.9" x2="50.4" y2="13.6" />
                </g>
                <defs>
                    <radialGradient id="sun-grad" cx="40%" cy="40%" r="60%">
                        <stop offset="0%" stop-color="#FFF176"/>
                        <stop offset="100%" stop-color="#FF9800"/>
                    </radialGradient>
                </defs>
            </svg>`,

        'clear-night': `
            <svg class="weather-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M42 38C42 47.94 33.94 56 24 56C21.8 56 19.7 55.6 17.8 54.8C25.3 52.8 31 46.1 31 38C31 29.9 25.3 23.2 17.8 21.2C19.7 20.4 21.8 20 24 20C33.94 20 42 28.06 42 38Z" fill="url(#moon-grad)" filter="drop-shadow(0 2px 8px rgba(186, 218, 255, 0.4))"/>
                <path class="anim-twinkle" d="M48 16L49.5 20.5L54 22L49.5 23.5L48 28L46.5 23.5L42 22L46.5 20.5L48 16Z" fill="#FFF" opacity="0.9"/>
                <path class="anim-twinkle-delay" d="M18 12L19 14.5L21.5 15.5L19 16.5L18 19L17 16.5L14.5 15.5L17 14.5L18 12Z" fill="#E2E8F0" opacity="0.8"/>
                <defs>
                    <linearGradient id="moon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#F8FAFC"/>
                        <stop offset="100%" stop-color="#94A3B8"/>
                    </linearGradient>
                </defs>
            </svg>`,

        'partly-cloudy-day': `
            <svg class="weather-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="22" r="11" fill="#FFA726"/>
                <path class="anim-float" d="M46 48H22C16.48 48 12 43.52 12 38C12 32.78 16.01 28.5 21.13 28.05C23.08 22.84 28.1 19 34 19C41.34 19 47.38 24.64 47.96 31.83C51.4 32.85 54 36.12 54 40C54 44.42 50.42 48 46 48Z" fill="url(#cloud-grad)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.12))"/>
                <defs>
                    <linearGradient id="cloud-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#FFFFFF"/>
                        <stop offset="100%" stop-color="#CBD5E1"/>
                    </linearGradient>
                </defs>
            </svg>`,

        'partly-cloudy-night': `
            <svg class="weather-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 18C30 24 25.5 29 19.5 29.8C20.9 30.6 22.5 31 24.3 31C30.2 31 35 26.2 35 20.3C35 18 34.3 15.9 33 14.2C31.2 15.2 30 16.5 30 18Z" fill="#E2E8F0"/>
                <path class="anim-float" d="M46 48H22C16.48 48 12 43.52 12 38C12 32.78 16.01 28.5 21.13 28.05C23.08 22.84 28.1 19 34 19C41.34 19 47.38 24.64 47.96 31.83C51.4 32.85 54 36.12 54 40C54 44.42 50.42 48 46 48Z" fill="url(#cloud-night-grad)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.2))"/>
                <defs>
                    <linearGradient id="cloud-night-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#94A3B8"/>
                        <stop offset="100%" stop-color="#475569"/>
                    </linearGradient>
                </defs>
            </svg>`,

        'mostly-clear-day': `
            <svg class="weather-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="26" r="13" fill="#FFA726"/>
                <path class="anim-float" d="M48 50H26C21.58 50 18 46.42 18 42C18 37.82 21.2 34.4 25.3 34.04C26.86 29.87 30.88 26.8 35.6 26.8C41.47 26.8 46.3 31.31 46.77 37.06C49.52 37.88 51.6 40.5 51.6 43.6C51.6 47.13 48.74 50 48 50Z" fill="url(#cloud-grad)" opacity="0.9" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.12))"/>
            </svg>`,

        'mostly-clear-night': `
            <svg class="weather-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M34 26C34 32.6 28.6 38 22 38C20.5 38 19.1 37.7 17.8 37.2C22.8 35.9 26.6 31.4 26.6 26C26.6 20.6 22.8 16.1 17.8 14.8C19.1 14.3 20.5 14 22 14C28.6 14 34 19.4 34 26Z" fill="#F8FAFC"/>
                <path class="anim-float" d="M48 50H26C21.58 50 18 46.42 18 42C18 37.82 21.2 34.4 25.3 34.04C26.86 29.87 30.88 26.8 35.6 26.8C41.47 26.8 46.3 31.31 46.77 37.06C49.52 37.88 51.6 40.5 51.6 43.6C51.6 47.13 48.74 50 48 50Z" fill="#64748B" opacity="0.85"/>
            </svg>`,

        'overcast': `
            <svg class="weather-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M42 36H24C19.58 36 16 32.42 16 28C16 23.8 19.2 20.4 23.3 20.04C24.86 15.87 28.88 12.8 33.6 12.8C39.47 12.8 44.3 17.31 44.77 23.06C47.52 23.88 49.6 26.5 49.6 29.6C49.6 33.13 46.74 36 42 36Z" fill="#94A3B8" opacity="0.7"/>
                <path class="anim-float" d="M46 50H22C16.48 50 12 45.52 12 40C12 34.78 16.01 30.5 21.13 30.05C23.08 24.84 28.1 21 34 21C41.34 21 47.38 26.64 47.96 33.83C51.4 34.85 54 38.12 54 42C54 46.42 50.42 50 46 50Z" fill="url(#cloud-grad)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.12))"/>
            </svg>`,

        'fog': `
            <svg class="weather-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path class="anim-drift" d="M12 24H52" stroke="#CBD5E1" stroke-width="4" stroke-linecap="round"/>
                <path class="anim-drift-rev" d="M16 32H48" stroke="#E2E8F0" stroke-width="4" stroke-linecap="round"/>
                <path class="anim-drift" d="M14 40H50" stroke="#CBD5E1" stroke-width="4" stroke-linecap="round"/>
                <path class="anim-drift-rev" d="M20 48H44" stroke="#94A3B8" stroke-width="4" stroke-linecap="round"/>
            </svg>`,

        'drizzle': `
            <svg class="weather-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M46 38H22C16.48 38 12 33.52 12 28C12 22.78 16.01 18.5 21.13 18.05C23.08 12.84 28.1 9 34 9C41.34 9 47.38 14.64 47.96 21.83C51.4 22.85 54 26.12 54 30C54 34.42 50.42 38 46 38Z" fill="url(#cloud-grad)"/>
                <line class="anim-rain-drop-1" x1="22" y1="44" x2="20" y2="50" stroke="#38BDF8" stroke-width="3" stroke-linecap="round"/>
                <line class="anim-rain-drop-2" x1="32" y1="44" x2="30" y2="50" stroke="#38BDF8" stroke-width="3" stroke-linecap="round"/>
                <line class="anim-rain-drop-3" x1="42" y1="44" x2="40" y2="50" stroke="#38BDF8" stroke-width="3" stroke-linecap="round"/>
            </svg>`,

        'rain-light': `
            <svg class="weather-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M46 36H22C16.48 36 12 31.52 12 26C12 20.78 16.01 16.5 21.13 16.05C23.08 10.84 28.1 7 34 7C41.34 7 47.38 12.64 47.96 19.83C51.4 20.85 54 24.12 54 28C54 32.42 50.42 36 46 36Z" fill="url(#cloud-grad)"/>
                <line class="anim-rain-drop-1" x1="22" y1="42" x2="19" y2="54" stroke="#0284C7" stroke-width="3" stroke-linecap="round"/>
                <line class="anim-rain-drop-2" x1="32" y1="42" x2="29" y2="54" stroke="#0284C7" stroke-width="3" stroke-linecap="round"/>
                <line class="anim-rain-drop-3" x1="42" y1="42" x2="39" y2="54" stroke="#0284C7" stroke-width="3" stroke-linecap="round"/>
            </svg>`,

        'rain-moderate': `
            <svg class="weather-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M46 34H22C16.48 34 12 29.52 12 24C12 18.78 16.01 14.5 21.13 14.05C23.08 8.84 28.1 5 34 5C41.34 5 47.38 10.64 47.96 17.83C51.4 18.85 54 22.12 54 26C54 30.42 50.42 34 46 34Z" fill="#94A3B8"/>
                <line class="anim-rain-drop-1" x1="20" y1="40" x2="16" y2="55" stroke="#0284C7" stroke-width="3.5" stroke-linecap="round"/>
                <line class="anim-rain-drop-2" x1="29" y1="40" x2="25" y2="55" stroke="#0284C7" stroke-width="3.5" stroke-linecap="round"/>
                <line class="anim-rain-drop-3" x1="38" y1="40" x2="34" y2="55" stroke="#0284C7" stroke-width="3.5" stroke-linecap="round"/>
                <line class="anim-rain-drop-1" x1="47" y1="40" x2="43" y2="55" stroke="#0284C7" stroke-width="3.5" stroke-linecap="round"/>
            </svg>`,

        'rain-heavy': `
            <svg class="weather-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M46 32H22C16.48 32 12 27.52 12 22C12 16.78 16.01 12.5 21.13 12.05C23.08 6.84 28.1 3 34 3C41.34 3 47.38 8.64 47.96 15.83C51.4 16.85 54 20.12 54 24C54 28.42 50.42 32 46 32Z" fill="#64748B"/>
                <line class="anim-rain-fast-1" x1="18" y1="38" x2="13" y2="58" stroke="#0369A1" stroke-width="4" stroke-linecap="round"/>
                <line class="anim-rain-fast-2" x1="28" y1="38" x2="23" y2="58" stroke="#0369A1" stroke-width="4" stroke-linecap="round"/>
                <line class="anim-rain-fast-3" x1="38" y1="38" x2="33" y2="58" stroke="#0369A1" stroke-width="4" stroke-linecap="round"/>
                <line class="anim-rain-fast-1" x1="48" y1="38" x2="43" y2="58" stroke="#0369A1" stroke-width="4" stroke-linecap="round"/>
            </svg>`,

        'thunderstorm': `
            <svg class="weather-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M46 34H22C16.48 34 12 29.52 12 24C12 18.78 16.01 14.5 21.13 14.05C23.08 8.84 28.1 5 34 5C41.34 5 47.38 10.64 47.96 17.83C51.4 18.85 54 22.12 54 26C54 30.42 50.42 34 46 34Z" fill="#475569"/>
                <path class="anim-lightning" d="M34 30L26 43H33L29 57L41 41H34L37 30H34Z" fill="#FACC15" stroke="#EAB308" stroke-width="1.5" stroke-linejoin="round"/>
            </svg>`,

        'thunderstorm-hail': `
            <svg class="weather-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M46 34H22C16.48 34 12 29.52 12 24C12 18.78 16.01 14.5 21.13 14.05C23.08 8.84 28.1 5 34 5C41.34 5 47.38 10.64 47.96 17.83C51.4 18.85 54 22.12 54 26C54 30.42 50.42 34 46 34Z" fill="#334155"/>
                <path class="anim-lightning" d="M33 28L27 39H33L30 50L39 37H33L35 28H33Z" fill="#FACC15"/>
                <circle cx="18" cy="46" r="2.5" fill="#E2E8F0"/>
                <circle cx="24" cy="54" r="2.5" fill="#E2E8F0"/>
                <circle cx="44" cy="48" r="2.5" fill="#E2E8F0"/>
            </svg>`,

        'snow-light': `
            <svg class="weather-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M46 36H22C16.48 36 12 31.52 12 26C12 20.78 16.01 16.5 21.13 16.05C23.08 10.84 28.1 7 34 7C41.34 7 47.38 12.64 47.96 19.83C51.4 20.85 54 24.12 54 28C54 32.42 50.42 36 46 36Z" fill="url(#cloud-grad)"/>
                <circle class="anim-snow-1" cx="22" cy="46" r="2.5" fill="#BAE6FD"/>
                <circle class="anim-snow-2" cx="32" cy="50" r="3" fill="#BAE6FD"/>
                <circle class="anim-snow-3" cx="42" cy="46" r="2.5" fill="#BAE6FD"/>
            </svg>`,

        'snow-moderate': `
            <svg class="weather-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M46 34H22C16.48 34 12 29.52 12 24C12 18.78 16.01 14.5 21.13 14.05C23.08 8.84 28.1 5 34 5C41.34 5 47.38 10.64 47.96 17.83C51.4 18.85 54 22.12 54 26C54 30.42 50.42 34 46 34Z" fill="#CBD5E1"/>
                <g stroke="#93C5FD" stroke-width="2" stroke-linecap="round">
                    <line x1="22" y1="42" x2="22" y2="52"/>
                    <line x1="17" y1="47" x2="27" y2="47"/>
                    <line x1="34" y1="46" x2="34" y2="56"/>
                    <line x1="29" y1="51" x2="39" y2="51"/>
                    <line x1="46" y1="42" x2="46" y2="52"/>
                    <line x1="41" y1="47" x2="51" y2="47"/>
                </g>
            </svg>`,

        'snow-heavy': `
            <svg class="weather-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M46 32H22C16.48 32 12 27.52 12 22C12 16.78 16.01 12.5 21.13 12.05C23.08 6.84 28.1 3 34 3C41.34 3 47.38 8.64 47.96 15.83C51.4 16.85 54 20.12 54 24C54 28.42 50.42 32 46 32Z" fill="#94A3B8"/>
                <g stroke="#BAE6FD" stroke-width="2.5" stroke-linecap="round">
                    <line x1="18" y1="40" x2="18" y2="52"/>
                    <line x1="12" y1="46" x2="24" y2="46"/>
                    <line x1="32" y1="44" x2="32" y2="58"/>
                    <line x1="25" y1="51" x2="39" y2="51"/>
                    <line x1="46" y1="40" x2="46" y2="52"/>
                    <line x1="40" y1="46" x2="52" y2="46"/>
                </g>
            </svg>`,

        'freezing-rain': `
            <svg class="weather-icon-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M46 34H22C16.48 34 12 29.52 12 24C12 18.78 16.01 14.5 21.13 14.05C23.08 8.84 28.1 5 34 5C41.34 5 47.38 10.64 47.96 17.83C51.4 18.85 54 22.12 54 26C54 30.42 50.42 34 46 34Z" fill="#CBD5E1"/>
                <line class="anim-rain-drop-1" x1="20" y1="42" x2="17" y2="52" stroke="#38BDF8" stroke-width="3" stroke-linecap="round"/>
                <circle cx="32" cy="48" r="3" fill="#E0F2FE" stroke="#38BDF8" stroke-width="1.5"/>
                <line class="anim-rain-drop-3" x1="44" y1="42" x2="41" y2="52" stroke="#38BDF8" stroke-width="3" stroke-linecap="round"/>
            </svg>`,

        // Metrics icons
        'thermometer': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
            </svg>`,

        'wind': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
            </svg>`,

        'humidity': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>`,

        'sunrise': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 18a5 5 0 0 0-10 0"/>
                <line x1="12" y1="2" x2="12" y2="9"/>
                <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/>
                <line x1="1" y1="18" x2="3" y2="18"/>
                <line x1="21" y1="18" x2="23" y2="18"/>
                <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
                <line x1="23" y1="22" x2="1" y2="22"/>
                <polyline points="8 6 12 2 16 6"/>
            </svg>`,

        'sunset': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 18a5 5 0 0 0-10 0"/>
                <line x1="12" y1="9" x2="12" y2="2"/>
                <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/>
                <line x1="1" y1="18" x2="3" y2="18"/>
                <line x1="21" y1="18" x2="23" y2="18"/>
                <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
                <line x1="23" y1="22" x2="1" y2="22"/>
                <polyline points="16 5 12 9 8 5"/>
            </svg>`,

        'uv': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>`,

        'aqi': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
                <path d="M8 15h.01M12 18h.01M16 15h.01"/>
            </svg>`,

        'pressure': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 12l3-3"/>
                <line x1="12" y1="6" x2="12" y2="7"/>
                <line x1="18" y1="12" x2="17" y2="12"/>
                <line x1="6" y1="12" x2="7" y2="12"/>
            </svg>`,

        'visibility': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>`,

        'compass': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
            </svg>`,

        'gps': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <line x1="12" y1="2" x2="12" y2="6"/>
                <line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="2" y1="12" x2="6" y2="12"/>
                <line x1="18" y1="12" x2="22" y2="12"/>
            </svg>`,

        'search': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>`,

        'bookmark': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>`,

        'bookmark-filled': `
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>`,

        'sound-on': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>`,

        'sound-off': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>`,

        'refresh': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>`,

        'radar': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                <path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z"/>
                <line x1="12" y1="12" x2="19" y2="5"/>
            </svg>`,

        'umbrella': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/>
            </svg>`,

        'shirt': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.5a2 2 0 0 0 1.5 1.63L6 11.2V20a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8.8l1.64-.38a2 2 0 0 0 1.5-1.63l.58-3.5a2 2 0 0 0-1.34-2.23z"/>
            </svg>`,

        'running': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="15" cy="5" r="2"/>
                <path d="M13 8l-3 4 3 4-2 6"/>
                <path d="M7 14l3-2 4-2"/>
                <path d="M16 11l4 2-1 4"/>
            </svg>`,

        'car': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="10" width="20" height="8" rx="2"/>
                <path d="M5 10l2-5h10l2 5"/>
                <circle cx="7" cy="18" r="2"/>
                <circle cx="17" cy="18" r="2"/>
            </svg>`,

        'moon-star': `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>`
    },

    get(name, fallback = 'partly-cloudy-day') {
        return this.icons[name] || this.icons[fallback] || this.icons['clear-day'];
    }
};

window.WeatherIcons = WeatherIcons;
