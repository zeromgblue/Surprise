import { loadScript, esc, prepContainer, messageCardHtml } from '../template-helpers.js';

export async function render(container, data, config) {
    prepContainer(container, config.bg || '#0d0010');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const from = config.from || '#FF3366';
    const to = config.to || '#9333EA';

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
            .love-scene { position:relative;width:100vw;height:100vh;overflow:hidden;display:flex;align-items:center;justify-content:center; }
            .envelope {
                width:280px;height:180px;background:linear-gradient(135deg,${from},${to});
                border-radius:8px;cursor:pointer;position:relative;box-shadow:0 20px 50px rgba(0,0,0,0.4);
                display:flex;align-items:center;justify-content:center;
            }
            .envelope::before {
                content:'';position:absolute;top:0;left:0;right:0;height:90px;
                background:linear-gradient(135deg,rgba(255,255,255,0.25),transparent);
                clip-path:polygon(0 0,50% 100%,100% 0);
            }
            .env-label { color:#fff;font-family:'Playfair Display',serif;font-size:1.1rem;z-index:2;text-shadow:0 2px 8px rgba(0,0,0,0.3); }
            .heart { position:absolute;font-size:1.2rem;opacity:0;pointer-events:none; }
            .hint { position:absolute;bottom:12vh;color:rgba(255,255,255,0.5);font-size:0.9rem;letter-spacing:0.08em; }
        </style>
        <div class="love-scene" id="scene">
            <div class="envelope" id="env"><span class="env-label">💌 แตะเพื่อเปิดจดหมาย</span></div>
            <div class="hint">Love Letter</div>
        </div>
        <div id="card-slot" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:10;"></div>
    `;

    for (let i = 0; i < 12; i++) {
        const h = document.createElement('div');
        h.className = 'heart';
        h.textContent = '♥';
        h.style.color = from;
        h.style.left = Math.random() * 100 + 'vw';
        h.style.top = Math.random() * 100 + 'vh';
        document.getElementById('scene').appendChild(h);
        gsap.to(h, { opacity: 0.6, y: '-=30', duration: 2 + Math.random() * 2, repeat: -1, yoyo: true, delay: Math.random() * 2 });
    }

    document.getElementById('env').addEventListener('click', () => {
        gsap.to('#env', { scale: 0, rotation: 15, opacity: 0, duration: 0.6, ease: 'back.in(1.5)' });
        const slot = document.getElementById('card-slot');
        slot.style.pointerEvents = 'auto';
        slot.innerHTML = messageCardHtml(data, config);
        gsap.to(slot.querySelector('.msg-card'), { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 });
    });
}
