/**
 * WeatherChart - Canvas Interactive Hourly Spline & Forecast Graph
 * Supports Temperature curve, Rain probability bars, and Wind speed
 */

class WeatherChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.data = [];
        this.mode = 'temp'; // 'temp' | 'rain' | 'wind'
        this.unit = 'C';
        this.speedUnit = 'metric';
        this.hoverIndex = -1;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.bindEvents();
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.width = rect.width;
        this.height = 160;

        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;

        this.ctx.scale(dpr, dpr);
        this.render();
    }

    bindEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            this.handlePointer(x);
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.hoverIndex = -1;
            this.render();
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.touches[0].clientX - rect.left;
                this.handlePointer(x);
            }
        });

        this.canvas.addEventListener('touchend', () => {
            this.hoverIndex = -1;
            this.render();
        });
    }

    handlePointer(x) {
        if (!this.data || this.data.length === 0) return;
        const paddingLeft = 30;
        const paddingRight = 30;
        const usableWidth = this.width - paddingLeft - paddingRight;
        const step = usableWidth / (this.data.length - 1);

        const index = Math.round((x - paddingLeft) / step);
        if (index >= 0 && index < this.data.length) {
            if (this.hoverIndex !== index) {
                this.hoverIndex = index;
                this.render();
                if (this.onHover) this.onHover(this.data[index], index);
            }
        }
    }

    setData(hourlyItems, unit = 'C', speedUnit = 'metric') {
        this.data = hourlyItems.slice(0, 24); // Next 24 hours
        this.unit = unit;
        this.speedUnit = speedUnit;
        this.render();
    }

    setMode(mode) {
        this.mode = mode;
        this.render();
    }

    render() {
        if (!this.ctx || !this.data || this.data.length === 0) return;

        const w = this.width;
        const h = this.height;
        this.ctx.clearRect(0, 0, w, h);

        const paddingLeft = 35;
        const paddingRight = 35;
        const paddingTop = 30;
        const paddingBottom = 35;
        const chartW = w - paddingLeft - paddingRight;
        const chartH = h - paddingTop - paddingBottom;

        // Extract values based on mode
        let values = [];
        let formatFn = (v) => `${v}`;

        if (this.mode === 'temp') {
            values = this.data.map(d => this.unit === 'F' ? WeatherUtils.celsiusToFahrenheit(d.temp) : d.temp);
            formatFn = (v) => `${Math.round(v)}°`;
        } else if (this.mode === 'rain') {
            values = this.data.map(d => d.rainProb || 0);
            formatFn = (v) => `${Math.round(v)}%`;
        } else if (this.mode === 'wind') {
            values = this.data.map(d => this.speedUnit === 'imperial' ? (d.windSpeed * 0.621371) : d.windSpeed);
            formatFn = (v) => `${Math.round(v)}`;
        }

        let minVal = Math.min(...values);
        let maxVal = Math.max(...values);

        if (this.mode === 'rain') {
            minVal = 0;
            maxVal = Math.max(100, maxVal);
        } else {
            // Buffer
            const diff = maxVal - minVal;
            const buffer = diff === 0 ? 2 : Math.max(1, diff * 0.15);
            minVal -= buffer;
            maxVal += buffer;
        }

        const step = chartW / (this.data.length - 1);
        const points = values.map((val, i) => {
            const x = paddingLeft + i * step;
            const y = paddingTop + chartH - ((val - minVal) / (maxVal - minVal || 1)) * chartH;
            return { x, y, val, original: this.data[i] };
        });

        // If rain mode, draw gradient bars
        if (this.mode === 'rain') {
            for (let i = 0; i < points.length; i++) {
                const pt = points[i];
                const barW = Math.max(6, step * 0.55);
                const barH = ((pt.val) / 100) * chartH;
                const barY = paddingTop + chartH - barH;

                const grad = this.ctx.createLinearGradient(0, barY, 0, paddingTop + chartH);
                grad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
                grad.addColorStop(1, 'rgba(56, 189, 248, 0.1)');

                this.ctx.fillStyle = grad;
                this.ctx.beginPath();
                this.ctx.roundRect(pt.x - barW / 2, barY, barW, barH, [4, 4, 0, 0]);
                this.ctx.fill();

                // Draw percentage label on every 2nd or 3rd bar
                if (i % 3 === 0 || i === this.hoverIndex) {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                    this.ctx.font = '11px sans-serif';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(`${Math.round(pt.val)}%`, pt.x, Math.max(14, barY - 6));
                }
            }
        } else {
            // Draw smooth spline curve
            this.ctx.beginPath();
            this.ctx.moveTo(points[0].x, points[0].y);

            for (let i = 0; i < points.length - 1; i++) {
                const cpX = (points[i].x + points[i + 1].x) / 2;
                this.ctx.bezierCurveTo(cpX, points[i].y, cpX, points[i + 1].y, points[i + 1].x, points[i + 1].y);
            }

            // Stroke line
            this.ctx.strokeStyle = this.mode === 'temp' ? '#FBBF24' : '#38BDF8';
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();

            // Gradient fill under the curve
            this.ctx.lineTo(points[points.length - 1].x, paddingTop + chartH);
            this.ctx.lineTo(points[0].x, paddingTop + chartH);
            this.ctx.closePath();

            const areaGrad = this.ctx.createLinearGradient(0, paddingTop, 0, paddingTop + chartH);
            if (this.mode === 'temp') {
                areaGrad.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
                areaGrad.addColorStop(1, 'rgba(251, 191, 36, 0.0)');
            } else {
                areaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
                areaGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
            }
            this.ctx.fillStyle = areaGrad;
            this.ctx.fill();

            // Value text above key points
            for (let i = 0; i < points.length; i++) {
                if (i % 3 === 0 || i === this.hoverIndex) {
                    const pt = points[i];
                    this.ctx.fillStyle = '#FFFFFF';
                    this.ctx.font = '12px "Segoe UI", sans-serif';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(formatFn(pt.val), pt.x, pt.y - 10);

                    // Point dot
                    this.ctx.fillStyle = this.mode === 'temp' ? '#FBBF24' : '#38BDF8';
                    this.ctx.beginPath();
                    this.ctx.arc(pt.x, pt.y, i === this.hoverIndex ? 5 : 3.5, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#FFFFFF';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.stroke();
                }
            }
        }

        // Draw Time labels at the bottom
        for (let i = 0; i < points.length; i++) {
            if (i % 3 === 0) {
                const pt = points[i];
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                this.ctx.font = '11px "Segoe UI", sans-serif';
                this.ctx.textAlign = 'center';
                const timeLabel = WeatherUtils.formatHourOnly(pt.original.time, true);
                this.ctx.fillText(timeLabel, pt.x, h - 8);
            }
        }

        // Render hover guide line
        if (this.hoverIndex >= 0 && this.hoverIndex < points.length) {
            const pt = points[this.hoverIndex];
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.setLineDash([3, 3]);
            this.ctx.beginPath();
            this.ctx.moveTo(pt.x, paddingTop);
            this.ctx.lineTo(pt.x, paddingTop + chartH);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }
}

window.WeatherChart = WeatherChart;
