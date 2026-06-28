import { loadScript, prepContainer, messageCardHtml } from '../template-helpers.js';

export async function render(container, data, config) {
    prepContainer(container, config.bg || '#171A11');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            .zen-scene { position:relative;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;cursor:pointer; }
            .sand {
                width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,#3D405B,#171A11);
                border:2px solid rgba(255,255,255,0.08);position:relative;overflow:hidden;
                box-shadow:inset 0 0 60px rgba(0,0,0,0.5);
            }
            .ripple { position:absolute;border:1px solid rgba(129,178,154,0.4);border-radius:50%;width:20px;height:20px;left:50%;top:50%;transform:translate(-50%,-50%);opacity:0; }
            .rake-line { position:absolute;height:1px;background:rgba(129,178,154,0.3);transform-origin:left;opacity:0; }
            .hint { position:absolute;bottom:12vh;color:rgba(255,255,255,0.45);font-size:0.9rem; }
        </style>
        <div class="zen-scene" id="scene">
            <div class="sand" id="sand">
                <div class="ripple" id="r1"></div>
                <div class="ripple" id="r2"></div>
                <div class="ripple" id="r3"></div>
            </div>
            <div class="hint">🪨 แตะเพื่อคราดทราย</div>
        </div>
        <div id="card-slot" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:10;"></div>
    `;

    document.getElementById('scene').addEventListener('click', () => {
        ['#r1','#r2','#r3'].forEach((id, i) => {
            gsap.fromTo(id, { opacity: 0.8, width: 20, height: 20 }, { opacity: 0, width: 280, height: 280, duration: 2, delay: i * 0.3, ease: 'power1.out' });
        });
        setTimeout(() => {
            const slot = document.getElementById('card-slot');
            slot.style.pointerEvents = 'auto';
            slot.innerHTML = messageCardHtml(data, config, { title: '🧘 Zen Message' });
            gsap.fromTo(slot.querySelector('.msg-card'), { opacity: 0 }, { opacity: 1, duration: 1 });
        }, 1000);
    });
}
