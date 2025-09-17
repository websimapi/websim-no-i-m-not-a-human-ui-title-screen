import { applyPosterizeToImage } from './posterize.js';

function animateBirds() {
    const flockContainer = document.getElementById('bird-flock');
    if (!flockContainer) return;

    const flockSize = 5;
    const journeyDuration = 22000;
    const startTime = performance.now() + 4000;

    const birds = [];
    for (let i = 0; i < flockSize; i++) {
        const bird = document.createElement('div');
        bird.className = 'bird';
        flockContainer.appendChild(bird);
        
        bird.style.animationDelay = `${Math.random() * -0.5}s`;

        birds.push({
            el: bird,
            offsetX: (i % 2 === 0 ? 1 : -1) * Math.ceil(i/2) * (window.innerWidth * 0.03),
            offsetY: Math.ceil(i/2) * (window.innerHeight * -0.02),
            wobbleX: Math.random() * 15 - 7.5,
            wobbleY: Math.random() * 10 - 5,
            wobbleSpeed: Math.random() * 1.5 + 1,
        });
    }

    let animationFrameId;
    function flightLoop(now) {
        if (now < startTime) {
            animationFrameId = requestAnimationFrame(flightLoop);
            return;
        }

        const elapsedTime = now - startTime;
        let progress = elapsedTime / journeyDuration;
        
        if (progress > 1.2) {
            flockContainer.innerHTML = '';
            cancelAnimationFrame(animationFrameId);
            return;
        }
        
        progress = Math.min(progress, 1);
        const easedProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

        const startX = window.innerWidth * 0.3;
        const startY = window.innerHeight * 0.45;
        const endX = window.innerWidth * 0.8;
        const endY = window.innerHeight * -0.1;

        const leaderX = startX + (endX - startX) * easedProgress;
        const leaderY = startY + (endY - startY) * easedProgress;
        
        const scale = Math.min(1, 0.4 + easedProgress / 0.4);

        birds.forEach((bird, i) => {
            if(progress > 0 && bird.el.style.opacity !== '1') {
                bird.el.style.opacity = '1';
            }

            const wobbleTime = elapsedTime / 1000 * bird.wobbleSpeed;
            const currentWobbleX = Math.sin(wobbleTime + i) * bird.wobbleX;
            const currentWobbleY = Math.cos(wobbleTime + i) * bird.wobbleY;

            bird.el.style.transform = `translate(
                ${leaderX + bird.offsetX + currentWobbleX}px,
                ${leaderY + bird.offsetY + currentWobbleY}px
            ) scale(${scale})`;
        });

        animationFrameId = requestAnimationFrame(flightLoop);
    }
    
    animationFrameId = requestAnimationFrame(flightLoop);
}

export async function startCutscene(audioManager) {
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
    
    await audioManager.playCutsceneAudio();
}

