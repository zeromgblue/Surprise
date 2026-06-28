import { loadScript, esc, prepContainer, messageCardHtml } from '../template-helpers.js';

export async function render(container, data, config) {
    prepContainer(container, config.bg || '#0d0008');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const from = config.from || '#F59E0B';
    const to = config.to || '#EC4899';

    container.innerHTML = `
        <style>
            .bday-scene { position:relative;width:100vw;height:100vh;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center; }
            .cake {
                width:200px;height:160px;cursor:pointer;position:relative;
            }
            .cake-base { width:200px;height:80px;background:linear-gradient(180deg,${from},${to});border-radius:20px 20px 10px 10px;position:absolute;bottom:0;box-shadow:0 15px 40px rgba(0,0,0,0.4); }
            .cake-top { width:160px;height:50px;background:linear-gradient(180deg,#fff5,#fff1);border-radius:15px;position:absolute;bottom:70px;left:20px; }
            .candle { width:8px;height:40px;background:#fff;border-radius:4px;position:absolute;bottom:115px;left:96px; }
            .flame { width:14px;height:20px;background:radial-gradient(circle,#FFD700,#FF4500);border-radius:50% 50% 20% 20%;position:absolute;bottom:150px;left:93px;animation:flicker 0.3s infinite alternate; }
            @keyframes flicker { to { transform:scale(0.9); opacity:0.8; } }
            .confetti { position:absolute;width:8px;height:8px;border-radius:2px;opacity:0;pointer-events:none; }
            .hint { margin-top:40px;color:rgba(255,255,255,0.55);font-size:0.95rem; }
        </style>
        <div class="bday-scene" id="scene">
            <div class="cake" id="cake">
                <div class="flame" id="flame"></div>
                <div class="candle"></div>
                <div class="cake-top"></div>
                <div class="cake-base"></div>
            </div>
            <div class="hint">🎂 เป่าเทียน — แตะเพื่อฉลอง!</div>
        </div>
        <div id="card-slot" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:10;"></div>
    `;

    const colors = [from, to, '#FFD700', '#00FF88', '#FF3366'];
    document.getElementById('cake').addEventListener('click', () => {
        gsap.to('#flame', { scale: 0, opacity: 0, duration: 0.3 });
        for (let i = 0; i < 40; i++) {
            const c = document.createElement('div');
            c.className = 'confetti';
            c.style.background = colors[i % colors.length];
            c.style.left = '50%';
            c.style.top = '40%';
            document.getElementById('scene').appendChild(c);
            gsap.to(c, {
                opacity: 1, x: (Math.random() - 0.5) * 400, y: Math.random() * 400 - 100,
                rotation: Math.random() * 720, duration: 1.5 + Math.random(), ease: 'power2.out'
            });
        }
        setTimeout(() => {
            const slot = document.getElementById('card-slot');
            slot.style.pointerEvents = 'auto';
            slot.innerHTML = messageCardHtml(data, config, { title: '🎉 สุขสันต์วันเกิด' });
            gsap.fromTo(slot.querySelector('.msg-card'), { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.4)' });
        }, 600);
    });
}
