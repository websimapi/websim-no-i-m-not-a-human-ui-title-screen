import { FogFX } from './fog.js';
import { AudioManager } from './audio.js';
import { UIManager } from './ui.js';
import { LayoutManager } from './layout.js';
import { GameFlowManager } from './gameflow.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Script loaded and running.");
    
    let fogInstance;

    // Initialize managers
    const audioManager = new AudioManager();
    const uiManager = new UIManager(audioManager);
    const layoutManager = new LayoutManager();
    const gameFlowManager = new GameFlowManager(audioManager, uiManager);

    async function main() {
        const loadingOverlay = document.getElementById('loading-overlay');

        // Start fog immediately so it's ready when the loading overlay fades
        fogInstance = new FogFX('#fog-canvas');
        fogInstance.start();

        // Start the overlay flow immediately, above the loading overlay
        gameFlowManager.initOverlayFlow();

        // Initial layout adjustments
        layoutManager.adjustLayout();
        layoutManager.updateBackgroundDrip();
        layoutManager.initSideCarousels();
        layoutManager.startCarousels();
        uiManager.initButtonHovers();

        // Setup game flow
        gameFlowManager.setupNewGameButton();

        // Adjust on window resize
        window.addEventListener('resize', () => {
            layoutManager.adjustLayout();
            layoutManager.updateBackgroundDrip();
        });

        // Wait for all sounds to load (do NOT hide loading overlay here)
        await audioManager.loadAllSounds();

        // hide spinner but keep black overlay until "Yes..." click
        const spinner = loadingOverlay && loadingOverlay.querySelector('.loader');
        if (spinner) spinner.style.display = 'none';
    }

    main();
});