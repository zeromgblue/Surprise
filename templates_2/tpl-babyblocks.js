import { loadScript, esc, prepContainer, messageCardHtml } from '../template-helpers.js';

export async function render(container, data, config) {
    prepContainer(container, config.bg || '#19140B');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const from = config.from || '#F8961E';
    const to = config.to || '#F9C74F';
    const letters = (data.receiver || 'BABY').slice(0, 6).toUpperCase().split('');

    container.innerHTML = `
        <style>
            .block-scene { position:relative;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:12px; }
            .block {
                width:64px;height:64px;border-radius:12px;cursor:pointer;
                background:linear-gradient(135deg,${from},${to});
                display:flex;align-items:center;justify-content:center;
                font-size:1.8rem;font-weight:900;color:#fff;
                box-shadow:0 8px 0 rgba(0,0,0,0.3),0 15px 30px rgba(0,0,0,0.3);
                transform:translateY(-200px);opacity:0;
            }
            .hint { position:absolute;bottom:12vh;color:rgba(255,255,255,0.5);font-size:0.9rem;width:100%;text-align:center; }
        </style>
        <div class="block-scene" id="scene">
            ${letters.map((l,i)=>`<div class="block" data-i="${i}">${esc(l)}</div>`).join('')}
            <div class="hint">🧸 แตะบล็อกเพื่อเรียงชื่อ</div>
        </div>
        <div id="card-slot" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:10;"></div>
    `;

    document.querySelectorAll('.block').forEach((b, i) => {
        b.addEventListener('click', () => {
            gsap.to(b, { y: 0, opacity: 1, duration: 0.6, ease: 'bounce.out', delay: i * 0.15 });
            if (i === letters.length - 1) {
                setTimeout(() => {
                    const slot = document.getElementById('card-slot');
                    slot.style.pointerEvents = 'auto';
                    slot.innerHTML = messageCardHtml(data, config, { title: '🧸 Welcome!' });
                    gsap.fromTo(slot.querySelector('.msg-card'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.3 });
                }, letters.length * 150 + 400);
            }
        });
    });
}
