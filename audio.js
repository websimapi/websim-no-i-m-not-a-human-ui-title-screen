
```javascript
const AUDIO_DURATION = 95, FADE = 15, FADE_OUT_START = 80;

export class AudioManager {
    constructor() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.audioUnlocked = false;
        this.backgroundAudioElement = null;
        this.cutsceneAudio = null;
        this.knockBuffers = [];
        this.uiHoverBuffer = null;
        this.tvStaticLoopBuffer = null;
        this.primaryKnockBuffer = null;
        this.knockTimeoutId = null;
        this.knockingActive = false;
    }

    async unlockAudio() {
        if (this.audioUnlocked) return;
        if (this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
        }
        this.audioUnlocked = true;
    }

    async _loadSound(url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            return await this.audioCtx.decodeAudioData(arrayBuffer);
        } catch (e) {
            console.error(`Failed to load or decode sound: ${url}`, e);
            return null;
        }
    }

    async loadAllSounds() {
        const knockSoundUrls = ['knock.mp3', 'knock_2.mp3', 'knock_3.mp3', 'knock_4.mp3'];
        this.knockBuffers = await Promise.all(knockSoundUrls.map(url => this._loadSound(url)));
        this.knockBuffers = this.knockBuffers.filter(b => b);
        this.uiHoverBuffer = await this._loadSound('ui_hover.mp3');
        this.tvStaticLoopBuffer = await this._loadSound('tv_static_loop.mp3');
        this.primaryKnockBuffer = await this._loadSound('knock.mp3');
    }

    setupBackgroundMusic() {
        if (this.backgroundAudioElement) return;
        const audio = new Audio('Fleshy Decay - Sonauto.ai.ogg');
        this.backgroundAudioElement = audio;
        audio.loop = false; audio.preload = 'auto';

        const src = this.audioCtx.createMediaElementSource(audio);
        const gain = this.audioCtx.createGain(); gain.gain.value = 0;
        src.connect(gain).connect(this.audioCtx.destination);

        const apply = () => {
            const t = audio.currentTime; let g = 1;
            if (t < FADE) g = t / FADE;
            else if (t >= FADE_OUT_START) g = Math.max(0, (AUDIO_DURATION - t) / FADE);
            gain.gain.setTargetAtTime(g, this.audioCtx.currentTime, 0.05);
        };
        audio.addEventListener('timeupdate', apply);
        audio.addEventListener('seeked', apply);

        audio.addEventListener('ended', () => { audio.currentTime = 0; audio.play(); });
        audio.play().catch(e => console.error("Background audio play failed:", e));
    }

    playSound(buffer, volume = 1.0, onEndedCallback = null, loop = false, fadeInDuration = 0) {
        if (!this.audioUnlocked || !buffer) return null;

        try {
            const source = this.audioCtx.createBufferSource();
            source.buffer = buffer;
            source.loop = loop;

            const gainNode = this.audioCtx.createGain();
            if (fadeInDuration > 0) {
                gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(volume, this.audioCtx.currentTime + fadeInDuration);
            } else {
                gainNode.gain.value = volume;
            }

            source.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);
            source.start(0);

            if (onEndedCallback && !loop) {
                source.addEventListener('ended', onEndedCallback, { once: true });
            }

            return { source, gainNode };
        } catch (e) {
            console.error("Could not play sound:", e);
            return null;
        }
    }

    playKnock() {
        if (this.knockBuffers.length === 0) return;
        const randomIndex = Math.floor(Math.random() * this.knockBuffers.length);
        this.playSound(this.knockBuffers[randomIndex]);
    }

    startKnocking() {
        this.knockingActive = true;
        const scheduleNext = () => {
            const randomInterval = Math.random() * (10000 - 3000) + 3000;
            this.knockTimeoutId = setTimeout(() => {
                if (!this.knockingActive) return;
                this.playKnock();
                scheduleNext();
            }, randomInterval);
        };
        scheduleNext();
    }

    stopKnocking() {
        this.knockingActive = false;
        if (this.knockTimeoutId) {
            clearTimeout(this.knockTimeoutId);
            this.knockTimeoutId = null;
        }
    }

    async playCutsceneAudio() {
        if (this.backgroundAudioElement) {
            try { this.backgroundAudioElement.pause(); } catch(e) {}
        }
        this.cutsceneAudio = new Audio('Distant Transmission - Sonauto.ai.ogg');
        const src = this.audioCtx.createMediaElementSource(this.cutsceneAudio);
        const g = this.audioCtx.createGain();
        g.gain.value = 0;
        src.connect(g).connect(this.audioCtx.destination);
        await this.audioCtx.resume();
        await this.cutsceneAudio.play().catch(() => {});
        g.gain.linearRampToValueAtTime(1, this.audioCtx.currentTime + 7);
        setTimeout(() => {
            g.gain.cancelScheduledValues(this.audioCtx.currentTime);
            g.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 7);
        }, (115 - 7) * 1000);
    }
}