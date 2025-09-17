
```javascript
export class UIManager {
    constructor(audioManager) {
        this.audioManager = audioManager;
    }

    typeText(el, text, speed = 40) {
        el.textContent = '';
        let i = 0;
        return new Promise(res => {
            const tick = () => { 
                el.textContent += text[i++] || ''; 
                i <= text.length ? setTimeout(tick, speed) : res(); 
            };
            tick();
        });
    }

    typeTextAppend(el, text, speed = 40) {
        let i = 0;
        return new Promise(res => {
            const tick = () => { 
                el.textContent += text[i++] || ''; 
                i <= text.length ? setTimeout(tick, speed) : res(); 
            };
            tick();
        });
    }

    wrapComma(spanEl) {
        const t = spanEl.textContent;
        const idx = t.lastIndexOf(',');
        if (idx === -1) return null;
        spanEl.textContent = '';
        spanEl.append(t.slice(0, idx));
        const comma = document.createElement('span');
        comma.className = 'bounce-comma';
        comma.textContent = ",";
        spanEl.appendChild(comma);
        spanEl.append(t.slice(idx + 1));
        return comma;
    }

    pulseNotRandomly(notEl) {
        setInterval(() => {
            notEl.classList.add('pulse-red');
            setTimeout(() => notEl.classList.remove('pulse-red'), 1300);
        }, 12000 + Math.random() * 6000);
    }

    waitForNot(el) {
        return new Promise(res => {
            const id = setInterval(() => {
                if (el.textContent.includes('NOT')) { 
                    clearInterval(id); 
                    res(); 
                }
            }, 50);
        });
    }

    initButtonHovers() {
        const buttons = document.querySelectorAll('.menu button, .overlay-btn, .credits-btn');
        let staticLoopSound = null;
        let initialSoundSource = null;
        let touchInProgress = false;

        const stopAllSounds = () => {
            if (initialSoundSource) {
                try { initialSoundSource.stop(); } catch (e) { /* ignore */ }
                initialSoundSource = null;
            }
            if (staticLoopSound) {
                const { source, gainNode } = staticLoopSound;
                // Fade out
                const fadeOutDuration = 0.2;
                gainNode.gain.cancelScheduledValues(this.audioManager.audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0, this.audioManager.audioCtx.currentTime + fadeOutDuration);
                setTimeout(() => {
                    try { source.stop(); } catch (e) { /* ignore */ }
                }, fadeOutDuration * 1000);
                staticLoopSound = null;
            }
        };

        const handleHoverStart = (button) => {
            if (button.disabled) return;
            stopAllSounds();
            button.classList.add('static-bg-active');
            const hoverSound = this.audioManager.playSound(this.audioManager.uiHoverBuffer, 0.2);
            if (hoverSound) initialSoundSource = hoverSound.source;
            staticLoopSound = this.audioManager.playSound(this.audioManager.tvStaticLoopBuffer, 0.1, null, true, 0.5);
        };

        const handleHoverEnd = (button) => {
            stopAllSounds();
            button.classList.remove('static-bg-active');
        };

        buttons.forEach(button => {
            // Mouse events
            button.addEventListener('mouseenter', (e) => {
                if (touchInProgress) return;
                handleHoverStart(e.currentTarget);
            });
            button.addEventListener('mouseleave', (e) => {
                if (touchInProgress) return;
                handleHoverEnd(e.currentTarget);
            });

            // Touch events
            button.addEventListener('touchstart', (e) => {
                touchInProgress = true;
                handleHoverStart(e.currentTarget);
            }, { passive: true });

            button.addEventListener('touchend', (e) => {
                handleHoverEnd(e.currentTarget);
                setTimeout(() => {
                    touchInProgress = false;
                }, 100);
            });

            button.addEventListener('touchcancel', (e) => {
                handleHoverEnd(e.currentTarget);
                setTimeout(() => {
                    touchInProgress = false;
                }, 100);
            });
        });
    }
}