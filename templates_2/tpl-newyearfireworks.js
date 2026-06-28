import { loadScript, prepContainer, messageCardHtml } from '../template-helpers.js';

export async function render(container, data, config) {
    prepContainer(container, config.bg || '#110505');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const colors = [config.from || '#F94144', config.to || '#F9C74F', '#00FF88', '#FF3366', '#00B4FF'];

    container.innerHTML = `
        <style>
            .fw-scene { position:relative;width:100vw;height:100vh;overflow:hidden;cursor:crosshair; }
            .particle { position:absolute;width:6px;height:6px;border-radius:50%;pointer-events:none; }
            .hint { position:absolute;bottom:12vh;left:0;right:0;text-align:center;color:rgba(255,255,255,0.5);font-size:0.9rem;pointer-events:none; }
            .counter { position:absolute;top:20px;right:20px;color:rgba(255,255,255,0.4);font-size:0.85rem;pointer-events:none; }
        </style>
        <div class="fw-scene" id="scene">
            <div class="hint">🎆 แตะจอเพื่อยิงพลุ (3 ครั้ง)</div>
            <div class="counter" id="cnt">0 / 3</div>
        </div>
        <div id="card-slot" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:10;"></div>
    `;

    let taps = 0;
    const scene = document.getElementById('scene');

    scene.addEventListener('click', (e) => {
        if (taps >= 3) return;
        taps++;
        document.getElementById('cnt').textContent = `${taps} / 3`;

        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.background = colors[i % colors.length];
            p.style.left = e.clientX + 'px';
            p.style.top = e.clientY + 'px';
            scene.appendChild(p);
            const angle = (Math.PI * 2 * i) / 30;
            const dist = 80 + Math.random() * 120;
            gsap.to(p, {
                x: Math.cos(angle) * dist, y: Math.sin(angle) * dist,
                opacity: 0, duration: 1 + Math.random() * 0.5, ease: 'power2.out',
                onComplete: () => p.remove()
            });
        }

        if (taps >= 3) {
            setTimeout(() => {
                const slot = document.getElementById('card-slot');
                slot.style.pointerEvents = 'auto';
                slot.innerHTML = messageCardHtml(data, config, { title: '🎆 Happy New Year!' });
                gsap.fromTo(slot.querySelector('.msg-card'), { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.4)' });
            }, 800);
        }
    });
}
