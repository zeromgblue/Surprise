import { loadScript, prepContainer, messageCardHtml } from '../template-helpers.js';

export async function render(container, data, config) {
    prepContainer(container, config.bg || '#03045E');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            .night-scene { position:relative;width:100vw;height:100vh;overflow:hidden;display:flex;align-items:center;justify-content:center; }
            .moon {
                width:120px;height:120px;border-radius:50%;cursor:pointer;
                background:radial-gradient(circle at 35% 35%,#fff9e6,#f0e6c8);
                box-shadow:0 0 60px rgba(255,255,255,0.3),0 0 120px rgba(189,224,254,0.2);
            }
            .star { position:absolute;width:3px;height:3px;background:#fff;border-radius:50%;opacity:0.6; }
            .curtain { position:absolute;top:0;width:50%;height:100%;background:linear-gradient(90deg,#03045E,#1a1a4e);z-index:5; }
            .curtain.left { left:0;transform-origin:left; }
            .curtain.right { right:0;transform-origin:right; }
            .hint { position:absolute;bottom:12vh;color:rgba(255,255,255,0.45);font-size:0.9rem;z-index:6; }
        </style>
        <div class="night-scene" id="scene">
            ${Array(30).fill(0).map(()=>`<div class="star" style="left:${Math.random()*100}%;top:${Math.random()*60}%;"></div>`).join('')}
            <div class="moon" id="moon"></div>
            <div class="curtain left" id="cl"></div>
            <div class="curtain right" id="cr"></div>
            <div class="hint">🌙 แตะพระจันทร์เพื่อเปิดมู่ลี่</div>
        </div>
        <div id="card-slot" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:20;"></div>
    `;

    document.getElementById('moon').addEventListener('click', () => {
        gsap.to('#cl', { scaleX: 0, duration: 1.2, ease: 'power2.inOut' });
        gsap.to('#cr', { scaleX: 0, duration: 1.2, ease: 'power2.inOut' });
        setTimeout(() => {
            const slot = document.getElementById('card-slot');
            slot.style.pointerEvents = 'auto';
            slot.innerHTML = messageCardHtml(data, config, { title: '🌙 ราตรีสวัสดิ์' });
            gsap.fromTo(slot.querySelector('.msg-card'), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8 });
        }, 800);
    });
}
