
```javascript
import { applyPosterizeToImage } from './posterize.js';
import { animateBirds } from './birds.js';

export class GameFlowManager {
    constructor(audioManager, uiManager) {
        this.audioManager = audioManager;
        this.uiManager = uiManager;
    }

    sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    initOverlayFlow() {
        const overlay = document.getElementById('ui-overlay');
        const prompt = document.getElementById('overlay-prompt');
        const yesBtn = document.getElementById('overlay-yes');
        const overlayInner = overlay.querySelector('.overlay-inner');
        const title = document.getElementById('main-title');
        const titleText = title.getAttribute('aria-label') || "NO, I'M NOT A HUMAN";

        this.uiManager.typeText(prompt, "Are you a human?").then(() => { 
            yesBtn.disabled = false; 
        });
        
        yesBtn.addEventListener('click', async () => {
            overlay.style.pointerEvents = 'none';
            if(overlayInner) overlayInner.style.pointerEvents = 'auto';
            yesBtn.style.display = 'none';
            prompt.classList.add('fade');
            if(overlayInner) overlayInner.style.pointerEvents = 'none';
            
            await this.audioManager.unlockAudio();
            this.audioManager.setupAudio();
            this.audioManager.scheduleNextKnock();

            // Transition fog to be a background element on the main page
            const fogCanvas = document.getElementById('fog-canvas');
            if (fogCanvas) {
                fogCanvas.style.zIndex = '1';
                fogCanvas.style.background = 'transparent';
            }

            // fade out the black loading overlay now that user confirmed
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
            
            title.textContent = '';
            const prefix = document.createElement('span');
            const rest = document.createElement('span');
            title.append(prefix, rest);
            
            await this.uiManager.typeText(prefix, "NO,", 180);
            const commaEl = this.uiManager.wrapComma(prefix);
            await this.sleep(900);
            if (commaEl){ commaEl.classList.add('slow'); }
            
            const typing = this.uiManager.typeTextAppend(rest, " I'M NOT A HUMAN", 90);
            await this.uiManager.waitForNot(rest);
            
            // wrap NOT and handle initial red fade to white
            rest.innerHTML = rest.textContent.replace('NOT','<span class="not-word">NOT</span>');
            const notEl = rest.querySelector('.not-word');
            requestAnimationFrame(() => { notEl.style.color = '#ddd'; });
            this.uiManager.pulseNotRandomly(notEl);
            await typing;
        }, { once: true });
    }

    async startCutscene() {
        const cs = document.getElementById('cutscene');
        const img = document.createElement('img');
        img.id = 'cutscene-image';
        img.alt = 'Cutscene scene';
        cs.prepend(img);

        const canvas = document.getElementById('cutscene-canvas');
        const loading = cs.querySelector('.cutscene-loading'); 
        cs.style.display = 'flex'; 
        loading.style.display = 'grid';
        
        img.onload = () => { 
            loading.style.display = 'none'; 
            applyPosterizeToImage(canvas, img, 5.0, 0.12); 
            canvas.classList.add('reveal');
            img.style.display = 'none';
            animateBirds();
        };
        img.src = 'cutscene_landscape.png';
        
        this.audioManager.pauseBackgroundAudio();
        await this.audioManager.setupCutsceneAudio();
    }

    setupNewGameButton() {
        const newGameBtn = Array.from(document.querySelectorAll('.menu button'))
            .find(b => b.textContent.trim() === 'New Game');
        
        if (newGameBtn) {
            newGameBtn.addEventListener('click', async () => {
                newGameBtn.disabled = true; 
                this.audioManager.stopKnocks(); 
                if (this.audioManager.primaryKnockBuffer) {
                    this.audioManager.playSound(this.audioManager.primaryKnockBuffer, 1.0);
                }
                await this.startCutscene();
            });
        }
    }
}