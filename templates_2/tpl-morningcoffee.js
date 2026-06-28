import { loadScript, prepContainer, messageCardHtml } from '../template-helpers.js';

export async function render(container, data, config) {
    prepContainer(container, config.bg || '#1A1412');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const from = config.from || '#D4A373';

    container.innerHTML = `
        <style>
            .coffee-scene { position:relative;width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center; }
            .mug {
                width:140px;height:110px;background:linear-gradient(180deg,#f5f5f4,#d6d3d1);
                border-radius:0 0 30px 30px;position:relative;cursor:pointer;
                box-shadow:0 20px 40px rgba(0,0,0,0.4);border:4px solid #a8a29e;
            }
            .mug::after { content:'';position:absolute;right:-36px;top:20px;width:36px;height:50px;border:4px solid #a8a29e;border-left:none;border-radius:0 20px 20px 0; }
            .coffee { position:absolute;top:12px;left:10px;right:10px;height:30px;background:#3E2723;border-radius:50%; }
            .steam { position:absolute;width:20px;height:60px;background:linear-gradient(180deg,rgba(255,255,255,0.5),transparent);border-radius:50%;filter:blur(4px);opacity:0; }
            .hint { margin-top:48px;color:rgba(255,255,255,0.5);font-size:0.9rem; }
        </style>
        <div class="coffee-scene" id="scene">
            <div style="position:relative">
                <div class="steam" id="s1" style="left:40px;top:-50px;"></div>
                <div class="steam" id="s2" style="left:70px;top:-60px;"></div>
                <div class="steam" id="s3" style="left:55px;top:-70px;"></div>
                <div class="mug" id="mug"><div class="coffee"></div></div>
            </div>
            <div class="hint">☕ แตะแก้วกาแฟเพื่อดูข้อความ</div>
        </div>
        <div id="card-slot" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:10;"></div>
    `;

    ['#s1','#s2','#s3'].forEach((id, i) => {
        gsap.to(id, { opacity: 0.7, y: -20, duration: 2, repeat: -1, yoyo: true, delay: i * 0.4 });
    });

    document.getElementById('mug').addEventListener('click', () => {
        gsap.to('.steam', { opacity: 1, scale: 2, duration: 1.5, stagger: 0.1 });
        const slot = document.getElementById('card-slot');
        slot.style.pointerEvents = 'auto';
        slot.innerHTML = messageCardHtml(data, config, { title: '☀️ Good Morning' });
        gsap.fromTo(slot.querySelector('.msg-card'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.5 });
    });
}
