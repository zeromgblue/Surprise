import { loadScript, prepContainer, messageCardHtml } from '../template-helpers.js';

export async function render(container, data, config) {
    prepContainer(container, config.bg || '#1A0E19');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const from = config.from || '#EF476F';
    const to = config.to || '#FFD166';

    container.innerHTML = `
        <style>
            .rocket-scene { position:relative;width:100vw;height:100vh;overflow:hidden;display:flex;align-items:flex-end;justify-content:center;padding-bottom:15vh; }
            .rocket {
                width:60px;height:140px;cursor:pointer;position:relative;z-index:5;
                background:linear-gradient(180deg,#fff,${from});border-radius:30px 30px 8px 8px;
                box-shadow:0 10px 30px rgba(0,0,0,0.4);
            }
            .rocket::before { content:'';position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);border-left:20px solid transparent;border-right:20px solid transparent;border-top:25px solid ${to}; }
            .flame-trail { position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:30px;height:0;background:linear-gradient(180deg,${to},transparent);border-radius:50%;filter:blur(4px);opacity:0; }
            .star { position:absolute;width:2px;height:2px;background:#fff;border-radius:50%; }
            .hint { position:absolute;bottom:8vh;color:rgba(255,255,255,0.5);font-size:0.9rem; }
        </style>
        <div class="rocket-scene" id="scene">
            ${Array(40).fill(0).map(()=>`<div class="star" style="left:${Math.random()*100}%;top:${Math.random()*100}%;opacity:${Math.random()}"></div>`).join('')}
            <div class="flame-trail" id="trail"></div>
            <div class="rocket" id="rocket"></div>
            <div class="hint">🚀 แตะเพื่อปล่อยจรวด!</div>
        </div>
        <div id="card-slot" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:10;"></div>
    `;

    document.getElementById('rocket').addEventListener('click', () => {
        gsap.to('#trail', { height: 80, opacity: 1, duration: 0.3 });
        gsap.to('#rocket', { y: '-120vh', duration: 2, ease: 'power4.in' });
        gsap.to('#trail', { height: 200, opacity: 0, duration: 2, delay: 0.2 });
        setTimeout(() => {
            const slot = document.getElementById('card-slot');
            slot.style.pointerEvents = 'auto';
            slot.innerHTML = messageCardHtml(data, config, { title: '🚀 You Got This!' });
            gsap.fromTo(slot.querySelector('.msg-card'), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)' });
        }, 1200);
    });
}
