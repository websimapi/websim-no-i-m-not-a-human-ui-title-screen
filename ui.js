
```javascript
export function adjustLayout() {
    const sidePanels = document.querySelectorAll('.side-panel');
    if (sidePanels.length === 0) return;

    const app = document.getElementById('app');
    if (!app) return;

    const contentHeight = app.clientHeight - (4 * parseFloat(getComputedStyle(app).paddingTop));
    const panelWidth = sidePanels[0].clientWidth;
    const gap = parseFloat(getComputedStyle(sidePanels[0]).gap) || 0;
    const boxHeight = (contentHeight - (4 * gap)) / 5;
    const requiredWidth = boxHeight * (16 / 9);

    sidePanels.forEach(panel => {
        if (requiredWidth > panelWidth) {
            panel.classList.add('vertical-aspect');
        } else {
            panel.classList.remove('vertical-aspect');
        }
    });
}

export function updateBackgroundDrip() {
    const bg = document.querySelector('.background-drip');
    const fig = document.querySelector('.figure-container');
    if (!bg || !fig) return;
    const r = fig.getBoundingClientRect();
    const startY = Math.round(r.top + r.height * 0.85);
    bg.style.clipPath = `inset(${startY}px 0 0 0)`;
}

export function initSideCarousels() {
    document.querySelectorAll('.side-panel').forEach(panel => {
        if (panel.querySelector('.panel-track')) return;
        const boxes = Array.from(panel.querySelectorAll('.feature-box'));
        const track = document.createElement('div');
        track.className = 'panel-track';
        boxes.forEach(b => track.appendChild(b));
        panel.appendChild(track);
        panel.dataset.direction = panel.classList.contains('left-panel') ? 'down' : 'up';
    });
}

function measureStep(panel) {
    const track = panel.querySelector('.panel-track');
    const a = track.children[0], b = track.children[1];
    if (!a || !b) return 0;
    const r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect();
    return Math.max(0, r2.top - r1.top);
}

function cyclePanel(panel) {
    const track = panel.querySelector('.panel-track');
    if (!track || track.children.length < 2) return;
    const dir = panel.dataset.direction;
    const step = measureStep(panel);
    if (!step) return;

    if (dir === 'up') {
        track.style.transition = 'transform 2.2s ease-in-out';
        track.style.transform = `translateY(${-step}px)`;
        track.addEventListener('transitionend', () => {
            track.appendChild(track.firstElementChild);
            track.style.transition = 'none';
            track.style.transform = 'translateY(0)';
        }, { once: true });
    } else {
        track.style.transition = 'none';
        track.insertBefore(track.lastElementChild, track.firstElementChild);
        track.style.transform = `translateY(${-step}px)`;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                track.style.transition = 'transform 2.2s ease-in-out';
                track.style.transform = 'translateY(0)';
            });
        });
    }
}

export function startCarousels() {
    const panels = Array.from(document.querySelectorAll('.side-panel'));
    if (!panels.length) return;
    setTimeout(() => {
        panels.forEach(p => cyclePanel(p));
    }, 600);
    setInterval(() => {
        panels.forEach(p => cyclePanel(p));
    }, 3000);
}

export function typeText(el, text, speed = 40) {
    el.textContent = '';
    let i = 0;
    return new Promise(res => {
        const tick = () => { el.textContent += text[i++] || ''; i <= text.length ? setTimeout(tick, speed) : res(); };
        tick();
    });
}

function typeTextAppend(el, text, speed = 40) {
    let i = 0;
    return new Promise(res => {
        const tick = () => { el.textContent += text[i++] || ''; i <= text.length ? setTimeout(tick, speed) : res(); };
        tick();
    });
}

function wrapComma(spanEl){ 
    const t = spanEl.textContent;
    const idx = t.lastIndexOf(',');
    if (idx === -1) return null;
    spanEl.textContent = '';
    spanEl.append(t.slice(0, idx));
    const comma = document.createElement('span');
    comma.className = 'bounce-comma';
    comma.textContent = ',';
    spanEl.appendChild(comma);
    spanEl.append(t.slice(idx+1));
    return comma;
}

function pulseNotRandomly(notEl){
    setInterval(() => {
        notEl.classList.add('pulse-red');
        setTimeout(()=>notEl.classList.remove('pulse-red'), 1300);
    }, 12000 + Math.random()*6000);
}

function waitForNot(el){
    return new Promise(res=>{
        const id = setInterval(()=>{
            if (el.textContent.includes('NOT')){ clearInterval(id); res(); }
        }, 50);
    });
}

export async function animateTitle() {
    const title = document.getElementById('main-title');
    if (!title) return;
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    title.textContent = '';
    const prefix = document.createElement('span');
    const rest = document.createElement('span');
    title.append(prefix, rest);

    await typeText(prefix, "NO,", 180);
    const commaEl = wrapComma(prefix);
    await sleep(900);
    if (commaEl){ commaEl.classList.add('slow'); }

    const typing = typeTextAppend(rest, " I'M NOT A HUMAN", 90);
    await waitForNot(rest);

    rest.innerHTML = rest.textContent.replace('NOT','<span class="not-word">NOT</span>');
    const notEl = rest.querySelector('.not-word');
    requestAnimationFrame(()=>{ notEl.style.color = '#ddd'; });
    pulseNotRandomly(notEl);

    await typing;
}