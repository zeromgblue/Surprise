export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#050005;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Sarabun:wght@300;700&display=swap');
        .dj-scene { position:relative;width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;background:#050005; }
        .grid-bg { position:absolute;inset:0;background:linear-gradient(rgba(255,107,0,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,0,0.07) 1px,transparent 1px);background-size:40px 40px;animation:gridPulse 0.1s infinite; }
        @keyframes gridPulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
        .wave-ring { position:absolute;border-radius:50%;border:3px solid rgba(255,107,0,0.6);opacity:0;pointer-events:none; }
        .drop-btn { width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,#FF6B00,#6B00FF);display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;z-index:10;box-shadow:0 0 60px rgba(255,107,0,0.5);transition:transform 0.1s; }
        .drop-btn:hover { transform:scale(1.05); }
        .drop-label { font-family:'Bebas Neue',sans-serif;font-size:2.5rem;color:#fff;letter-spacing:4px;text-shadow:0 0 20px #fff; }
        .hint-txt { font-family:'Sarabun',sans-serif;color:rgba(255,107,0,0.8);font-size:1rem;margin-top:20px;animation:blink 1.5s infinite; }
        @keyframes blink { 0%,100%{opacity:0.4}50%{opacity:1} }
        .msg-panel { position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:20;padding:40px;text-align:center; }
        .msg-to { font-family:'Bebas Neue',sans-serif;font-size:4rem;color:#FF6B00;letter-spacing:4px;text-shadow:0 0 30px #FF6B00; }
        .msg-body { font-family:'Sarabun',sans-serif;font-size:1.3rem;color:#fff;line-height:1.7;max-width:600px;margin-top:20px; }
        .msg-from { font-family:'Bebas Neue',sans-serif;font-size:1.5rem;color:#A855F7;margin-top:30px;letter-spacing:3px; }
        .shake { animation:shakeAll 0.5s ease; }
        @keyframes shakeAll { 0%,100%{transform:translate(0,0)}10%,30%,50%,70%,90%{transform:translate(-8px,0)}20%,40%,60%,80%{transform:translate(8px,0)} }
    </style>
    <div class="dj-scene" id="scene">
        <div class="grid-bg" id="grid"></div>
        <div class="drop-btn" id="dropBtn"><div class="drop-label">DROP</div></div>
        <div class="hint-txt" id="hint">แตะปุ่ม DROP</div>
        <div class="msg-panel" id="msg">
            <div class="msg-to">${escapeHtml(data.receiver)}</div>
            <div class="msg-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
            <div class="msg-from">— ${escapeHtml(data.sender)} —</div>
        </div>
    </div>`;

    const scene = document.getElementById('scene');
    const dropBtn = document.getElementById('dropBtn');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    const grid = document.getElementById('grid');
    let dropped = false;

    dropBtn.addEventListener('click', () => {
        if (dropped) return;
        dropped = true;
        hint.style.display = 'none';

        // Create expanding rings
        for (let i = 0; i < 6; i++) {
            const ring = document.createElement('div');
            ring.className = 'wave-ring';
            scene.appendChild(ring);
            const size = 160;
            gsap.set(ring, { width: size, height: size, left: '50%', top: '50%', xPercent: -50, yPercent: -50 });
            gsap.to(ring, { width: size * 8, height: size * 8, opacity: 0, duration: 1.5, delay: i * 0.15, ease: 'power2.out', onComplete: () => ring.remove() });
        }

        // Shake screen
        scene.classList.add('shake');
        setTimeout(() => scene.classList.remove('shake'), 500);

        // Flash grid
        gsap.to(grid, { opacity: 1, duration: 0.05, yoyo: true, repeat: 10, ease: 'none' });

        // Hide button, show message
        const tl = gsap.timeline({ delay: 0.5 });
        tl.to(dropBtn, { scale: 0, opacity: 0, duration: 0.4, ease: 'back.in(2)' })
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1, ease: 'power2.out' }, '+=0.2');

        // Pulse glow
        gsap.to(scene, { filter: 'brightness(1.3)', duration: 0.1, yoyo: true, repeat: 5, delay: 0.5, ease: 'none' });
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
