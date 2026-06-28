import { loadScript, prepContainer, messageCardHtml } from '../template-helpers.js';

export async function render(container, data, config) {
    prepContainer(container, config.bg || '#071A21');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const from = config.from || '#06D6A0';

    container.innerHTML = `
        <style>
            .pill-scene { position:relative;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden; }
            .capsule {
                width:200px;height:70px;border-radius:35px;cursor:pointer;position:relative;
                background:linear-gradient(90deg,${from} 50%,#fff 50%);
                box-shadow:0 15px 40px rgba(0,0,0,0.4);border:3px solid rgba(255,255,255,0.2);
            }
            .glow { position:absolute;inset:-20px;border-radius:50px;background:radial-gradient(circle,${from}44,transparent);opacity:0;pointer-events:none; }
            .hint { position:absolute;bottom:12vh;color:rgba(255,255,255,0.5);font-size:0.9rem; }
        </style>
        <div class="pill-scene">
            <div class="glow" id="glow"></div>
            <div class="capsule" id="cap"></div>
            <div class="hint">💊 แตะแคปซูลเพื่อรับกำลังใจ</div>
        </div>
        <div id="card-slot" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:10;"></div>
    `;

    document.getElementById('cap').addEventListener('click', () => {
        gsap.to('#cap', { scale: 1.2, rotation: 360, opacity: 0, duration: 0.8, ease: 'power2.in' });
        gsap.to('#glow', { opacity: 1, scale: 3, duration: 1 });
        setTimeout(() => {
            const slot = document.getElementById('card-slot');
            slot.style.pointerEvents = 'auto';
            slot.innerHTML = messageCardHtml(data, config, { title: '💚 Get Well Soon' });
            gsap.fromTo(slot.querySelector('.msg-card'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 });
        }, 500);
    });
}
