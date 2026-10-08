/**
 * WeatherSoundEngine - Web Audio API Ambient Weather Sound Generator
 * Generates procedural audio in real-time (Rain, Wind, Thunder, Birds, Crickets)
 * Requires zero external audio files!
 */

class WeatherSoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isPlaying = false;
        this.isMuted = true;
        this.currentType = 'none';
        this.activeNodes = [];
        this.intervalId = null;
    }

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
    }

    createNoiseBuffer(seconds = 3) {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * seconds;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        
        // Generate soft pink noise
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5; // Gain compensation
        }
        return buffer;
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.activeNodes.forEach(node => {
            try {
                if (node.stop) node.stop();
                if (node.disconnect) node.disconnect();
            } catch (e) {}
        });
        this.activeNodes = [];
        this.isPlaying = false;
    }

    play(soundType) {
        if (this.isMuted) {
            this.currentType = soundType;
            return;
        }

        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        if (this.isPlaying && this.currentType === soundType) {
            return;
        }

        this.stop();
        this.currentType = soundType;
        this.isPlaying = true;

        switch (soundType) {
            case 'rain':
            case 'heavy-rain':
                this.playRain(soundType === 'heavy-rain');
                break;
            case 'thunder':
                this.playThunderStorm();
                break;
            case 'wind':
                this.playWind();
                break;
            case 'birds':
                this.playBirds();
                break;
            case 'crickets':
                this.playCrickets();
                break;
            default:
                this.stop();
                break;
        }
    }

    playRain(isHeavy = false) {
        const buffer = this.createNoiseBuffer(5);
        if (!buffer) return;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(isHeavy ? 1200 : 800, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(isHeavy ? 0.4 : 0.2, this.ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
        this.activeNodes.push(noise, filter, gain);

        // Add periodic droplet splatter
        this.intervalId = setInterval(() => {
            if (!this.isPlaying) return;
            this.playDrop(isHeavy ? 0.3 : 0.15);
        }, isHeavy ? 150 : 350);
    }

    playDrop(volume = 0.2) {
        if (!this.ctx || this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const freq = 1200 + Math.random() * 800;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, this.ctx.currentTime + 0.04);

        gain.gain.setValueAtTime(volume * (0.5 + Math.random() * 0.5), this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playThunderStorm() {
        this.playRain(true);
        // Periodic thunder rumbles
        this.triggerThunderClap();
        this.intervalId = setInterval(() => {
            if (!this.isPlaying) return;
            if (Math.random() > 0.4) {
                this.triggerThunderClap();
            }
        }, 8000);
    }

    triggerThunderClap() {
        if (!this.ctx || this.isMuted) return;
        const buffer = this.createNoiseBuffer(3);
        if (!buffer) return;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 2.5);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.8);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
        noise.stop(this.ctx.currentTime + 3);
    }

    playWind() {
        const buffer = this.createNoiseBuffer(5);
        if (!buffer) return;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, this.ctx.currentTime);
        filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

        // LFO to modulate wind howling
        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.25, this.ctx.currentTime);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
        lfo.start();
        this.activeNodes.push(noise, filter, gain, lfo, lfoGain);
    }

    playBirds() {
        // Soft background breeze
        this.playWind();
        // Chirping birds at random intervals
        this.intervalId = setInterval(() => {
            if (!this.isPlaying || this.isMuted) return;
            if (Math.random() > 0.3) {
                this.triggerBirdChirp();
            }
        }, 2500);
    }

    triggerBirdChirp() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const baseFreq = 2600 + Math.random() * 800;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.linearRampToValueAtTime(baseFreq + 600, now + 0.08);
        osc.frequency.linearRampToValueAtTime(baseFreq + 200, now + 0.16);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.22);
    }

    playCrickets() {
        this.intervalId = setInterval(() => {
            if (!this.isPlaying || this.isMuted) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(4500, now);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.05, now + 0.02);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.05);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.06);
        }, 200);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stop();
        } else {
            this.play(this.currentType || 'birds');
        }
        return !this.isMuted;
    }
}

window.weatherSound = new WeatherSoundEngine();
