import { FogFX } from './fog.js';
import { AudioManager } from './audio.js';
import * as UI from './ui.js';
import { startCutscene } from './cutscene.js';
import { initButtonHovers, initCoreInteractions } from './events.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Script loaded and running.");
    
    function initOverlayFlow(audioManager) {
        const overlay = document.getElementById('ui-overlay');
        const prompt = document.getElementById('overlay-prompt');
        const yesBtn = document.getElementById('overlay-yes');
        const overlayInner = overlay.querySelector('.overlay-inner');
        
        UI.typeText(prompt, "Are you a human?").then(() => { yesBtn.disabled = false; });
        
        yesBtn.addEventListener('click', async () => {
            overlay.style.pointerEvents = 'none';
            if(overlayInner) overlayInner.style.pointerEvents = 'auto';
            yesBtn.style.display = 'none';
            prompt.classList.add('fade');
            if(overlayInner) overlayInner.style.pointerEvents = 'none';
            
            await audioManager.unlockAudio();
            audioManager.setupBackgroundMusic();
            audioManager.startKnocking();

            const fogCanvas = document.getElementById('fog-canvas');
            if (fogCanvas) {
                fogCanvas.style.zIndex = '1';
                fogCanvas.style.background = 'transparent';
            }

            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
            
            UI.animateTitle();

        }, { once: true });
    }

    async function main() {
        const audioManager = new AudioManager();
        const loadingOverlay = document.getElementById('loading-overlay');

        const fogInstance = new FogFX('#fog-canvas');
        fogInstance.start();

        initOverlayFlow(audioManager);
        
        UI.adjustLayout();
        UI.updateBackgroundDrip();
        UI.initSideCarousels();
        UI.startCarousels();
        
        initButtonHovers(audioManager);
        initCoreInteractions(audioManager, startCutscene);

        window.addEventListener('resize', () => {
            UI.adjustLayout();
            UI.updateBackgroundDrip();
        });

        await audioManager.loadAllSounds();

        const spinner = loadingOverlay && loadingOverlay.querySelector('.loader');
        if (spinner) spinner.style.display = 'none';
    }

    main();
});