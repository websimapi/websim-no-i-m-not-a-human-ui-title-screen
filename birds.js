export function animateBirds() {
    const flockContainer = document.getElementById('bird-flock');
    if (!flockContainer) return;

    const flockSize = 4;
    const journeyDuration = 70000;
    const startTime = performance.now() + 4000;

    const birds = [];
    for (let i = 0; i < flockSize; i++) {
        const bird = document.createElement('div');
        bird.className = 'bird';
        bird.style.transform = 'translate(-100px, -100px)';
        flockContainer.appendChild(bird);
        
        bird.style.animationDelay = `${Math.random() * -0.5}s`;

        birds.push({
            el: bird,
            offsetX: (i % 2 === 0 ? 1 : -1) * Math.ceil(i/2) * (window.innerWidth * 0.025),
            offsetY: Math.ceil(i/2) * (window.innerHeight * -0.015),
            wobbleX: Math.random() * 20 - 10,
            wobbleY: Math.random() * 15 - 7.5,
            wobbleSpeed: Math.random() * 0.5 + 0.5,
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
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        const p0 = { x: window.innerWidth * 0.3, y: window.innerHeight * 0.5 };
        const p1 = { x: window.innerWidth * 0.4, y: window.innerHeight * 0.15 };
        const p2 = { x: window.innerWidth * 0.9, y: window.innerHeight * -0.1 };

        const leaderX = Math.pow(1 - easedProgress, 2) * p0.x + 2 * (1 - easedProgress) * easedProgress * p1.x + Math.pow(easedProgress, 2) * p2.x;
        const leaderY = Math.pow(1 - easedProgress, 2) * p0.y + 2 * (1 - easedProgress) * easedProgress * p1.y + Math.pow(easedProgress, 2) * p2.y;
        
        const scale = 1.0 - (easedProgress * 0.7);

        birds.forEach((bird, i) => {
            if(progress > 0.01 && bird.el.style.opacity !== '1') {
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

