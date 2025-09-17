export function initButtonHovers(audioManager) {
    const buttons = document.querySelectorAll('.menu button, .overlay-btn, .credits-btn');
    let staticLoopSound = null;
    let initialSoundSource = null;
    let touchInProgress = false;

    const stopAllSounds = () => {
        if (initialSoundSource) {
            try { initialSoundSource.stop(); } catch (e) {}
            initialSoundSource = null;
        }
        if (staticLoopSound) {
            const { source, gainNode } = staticLoopSound;
            const fadeOutDuration = 0.2;
            if (audioManager.audioCtx) {
                gainNode.gain.cancelScheduledValues(audioManager.audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0, audioManager.audioCtx.currentTime + fadeOutDuration);
                setTimeout(() => {
                    try { source.stop(); } catch (e) {}
                }, fadeOutDuration * 1000);
            }
            staticLoopSound = null;
        }
    };

    const handleHoverStart = (button) => {
        if (button.disabled) return;
        stopAllSounds();
        button.classList.add('static-bg-active');
        const hoverSound = audioManager.playSound(audioManager.uiHoverBuffer, 0.2);
        if(hoverSound) initialSoundSource = hoverSound.source;
        staticLoopSound = audioManager.playSound(audioManager.tvStaticLoopBuffer, 0.1, null, true, 0.5);
    };

    const handleHoverEnd = (button) => {
        stopAllSounds();
        button.classList.remove('static-bg-active');
    };

    buttons.forEach(button => {
        button.addEventListener('mouseenter', (e) => {
            if (touchInProgress) return;
            handleHoverStart(e.currentTarget);
        });
        button.addEventListener('mouseleave', (e) => {
            if (touchInProgress) return;
            handleHoverEnd(e.currentTarget);
        });
        button.addEventListener('touchstart', (e) => {
            touchInProgress = true;
            handleHoverStart(e.currentTarget);
        }, { passive: true });
        button.addEventListener('touchend', (e) => {
            handleHoverEnd(e.currentTarget);
            setTimeout(() => { touchInProgress = false; }, 100);
        });
         button.addEventListener('touchcancel', (e) => {
            handleHoverEnd(e.currentTarget);
            setTimeout(() => { touchInProgress = false; }, 100);
        });
    });
}

export function initCoreInteractions(audioManager, cutsceneRunner) {
    const newGameBtn = Array.from(document.querySelectorAll('.menu button')).find(b => b.textContent.trim() === 'New Game');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', async () => {
            newGameBtn.disabled = true;
            audioManager.stopKnocking();
            if (audioManager.primaryKnockBuffer) {
                audioManager.playSound(audioManager.primaryKnockBuffer, 1.0);
            }
            await cutsceneRunner(audioManager);
        });
    }
}

