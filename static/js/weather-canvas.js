/**
 * WeatherCanvasEngine - 60FPS dynamic particle background system
 * Renders rain, thunderstorm lightning, snow, starry night, sunbeams, drifting clouds
 */

class WeatherCanvasEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.currentMode = 'clear-day';
        this.animationId = null;
        this.lightningTimer = 0;
        this.lightningAlpha = 0;
        this.meteors = [];
        this.width = 0;
        this.height = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.setMode('clear-day');
        this.loop = this.loop.bind(this);
        this.loop();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.spawnParticles();
    }

    setMode(mode) {
        if (this.currentMode === mode && this.particles.length > 0) return;
        this.currentMode = mode;
        this.spawnParticles();
    }

    spawnParticles() {
        this.particles = [];
        this.meteors = [];
        this.lightningAlpha = 0;

        const count = this.getParticleCount();

        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle());
        }
    }

    getParticleCount() {
        switch (this.currentMode) {
            case 'rain':
            case 'rain-light':
                return 160;
            case 'heavy-rain':
            case 'thunderstorm':
                return 280;
            case 'snow':
            case 'snow-light':
            case 'snow-moderate':
            case 'snow-heavy':
                return 150;
            case 'stars':
            case 'clear-night':
                return 180;
            case 'clear-day':
                return 40;
            case 'clouds':
            case 'overcast':
            case 'fog':
                return 25;
            default:
                return 50;
        }
    }

    createParticle() {
        const w = this.width;
        const h = this.height;

        if (this.currentMode.includes('rain') || this.currentMode === 'thunderstorm') {
            return {
                x: Math.random() * w * 1.3 - w * 0.15,
                y: Math.random() * h,
                length: 12 + Math.random() * 20,
                speed: 16 + Math.random() * 12,
                opacity: 0.15 + Math.random() * 0.35,
                thickness: 1 + Math.random() * 1.5,
                wind: 2 + Math.random() * 3
            };
        } else if (this.currentMode.includes('snow')) {
            return {
                x: Math.random() * w,
                y: Math.random() * h,
                radius: 1 + Math.random() * 3.5,
                speed: 0.8 + Math.random() * 2,
                opacity: 0.2 + Math.random() * 0.7,
                drift: Math.random() * Math.PI * 2,
                driftSpeed: 0.02 + Math.random() * 0.03
            };
        } else if (this.currentMode.includes('night') || this.currentMode === 'stars') {
            return {
                x: Math.random() * w,
                y: Math.random() * h,
                radius: 0.6 + Math.random() * 1.8,
                alpha: Math.random(),
                twinkleSpeed: 0.01 + Math.random() * 0.03,
                maxAlpha: 0.3 + Math.random() * 0.7
            };
        } else if (this.currentMode.includes('day') || this.currentMode === 'clear-day') {
            return {
                x: Math.random() * w,
                y: Math.random() * h,
                radius: 2 + Math.random() * 5,
                speedY: -(0.2 + Math.random() * 0.6),
                speedX: (Math.random() - 0.5) * 0.4,
                alpha: 0.05 + Math.random() * 0.2,
                pulse: Math.random() * Math.PI * 2
            };
        } else {
            // Clouds / Mist
            return {
                x: Math.random() * (w + 400) - 200,
                y: Math.random() * (h * 0.6),
                radius: 60 + Math.random() * 120,
                speedX: 0.2 + Math.random() * 0.5,
                alpha: 0.03 + Math.random() * 0.07
            };
        }
    }

    loop() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.currentMode.includes('rain') || this.currentMode === 'thunderstorm') {
            this.renderRain();
        } else if (this.currentMode.includes('snow')) {
            this.renderSnow();
        } else if (this.currentMode.includes('night') || this.currentMode === 'stars') {
            this.renderStars();
        } else if (this.currentMode.includes('day') || this.currentMode === 'clear-day') {
            this.renderSunny();
        } else {
            this.renderClouds();
        }

        if (this.currentMode === 'thunderstorm') {
            this.handleLightning();
        }

        this.animationId = requestAnimationFrame(this.loop);
    }

    renderRain() {
        this.ctx.strokeStyle = 'rgba(186, 230, 253, 0.6)';
        this.ctx.lineCap = 'round';

        for (const p of this.particles) {
            this.ctx.lineWidth = p.thickness;
            this.ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity})`;

            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p.x + p.wind * 1.5, p.y + p.length);
            this.ctx.stroke();

            p.x += p.wind;
            p.y += p.speed;

            if (p.y > this.height) {
                p.y = -p.length;
                p.x = Math.random() * this.width * 1.3 - this.width * 0.15;
            }
        }
    }

    handleLightning() {
        this.lightningTimer++;
        if (this.lightningTimer > 180 && Math.random() > 0.96) {
            this.lightningAlpha = 0.75 + Math.random() * 0.25;
            this.lightningTimer = 0;
        }

        if (this.lightningAlpha > 0) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningAlpha})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.lightningAlpha *= 0.82;
            if (this.lightningAlpha < 0.02) this.lightningAlpha = 0;
        }
    }

    renderSnow() {
        for (const p of this.particles) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();

            p.drift += p.driftSpeed;
            p.x += Math.sin(p.drift) * 1.2;
            p.y += p.speed;

            if (p.y > this.height) {
                p.y = -p.radius * 2;
                p.x = Math.random() * this.width;
            }
        }
    }

    renderStars() {
        // Twinkling stars
        for (const p of this.particles) {
            p.alpha += p.twinkleSpeed;
            const currentAlpha = (Math.sin(p.alpha) + 1) * 0.5 * p.maxAlpha;

            this.ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Random shooting star
        if (Math.random() < 0.005 && this.meteors.length === 0) {
            this.meteors.push({
                x: Math.random() * this.width * 0.8,
                y: Math.random() * (this.height * 0.3),
                len: 80 + Math.random() * 70,
                speed: 12 + Math.random() * 6,
                alpha: 1
            });
        }

        for (let i = this.meteors.length - 1; i >= 0; i--) {
            const m = this.meteors[i];
            const grad = this.ctx.createLinearGradient(m.x, m.y, m.x - m.len, m.y - m.len * 0.5);
            grad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            this.ctx.strokeStyle = grad;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(m.x, m.y);
            this.ctx.lineTo(m.x - m.len, m.y - m.len * 0.5);
            this.ctx.stroke();

            m.x += m.speed;
            m.y += m.speed * 0.5;
            m.alpha -= 0.025;

            if (m.alpha <= 0) {
                this.meteors.splice(i, 1);
            }
        }
    }

    renderSunny() {
        // Subtle sun particles / light motes
        for (const p of this.particles) {
            p.pulse += 0.02;
            const curAlpha = p.alpha + Math.sin(p.pulse) * 0.03;

            this.ctx.fillStyle = `rgba(254, 240, 138, ${Math.max(0.02, curAlpha)})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();

            p.x += p.speedX;
            p.y += p.speedY;

            if (p.y < -p.radius) {
                p.y = this.height + p.radius;
                p.x = Math.random() * this.width;
            }
        }
    }

    renderClouds() {
        for (const p of this.particles) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();

            p.x += p.speedX;
            if (p.x - p.radius > this.width) {
                p.x = -p.radius * 2;
                p.y = Math.random() * (this.height * 0.6);
            }
        }
    }
}

window.WeatherCanvasEngine = WeatherCanvasEngine;
