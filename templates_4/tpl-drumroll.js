export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#100500;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Sarabun:wght@300;400&display=swap');
        .drum-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at 50% 100%,#3d1500,#100500);display:flex;flex-direction:column;align-items:center;justify-content:center;}
        .stage-light{position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:300px;height:600px;background:conic-gradient(from 180deg,transparent 150deg,rgba(255,200,50,0.15) 180deg,transparent 210deg);pointer-events:none;}
        .drum{width:160px;height:80px;background:radial-gradient(ellipse,#8B1A00,#5C0000);border:4px solid #B45309;border-radius:50%;cursor:pointer;position:relative;box-shadow:0 10px 30px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10;}
        .drum-shell{position:absolute;top:0;left:0;width:100%;height:100%;border-radius:50%;border:2px solid rgba(255,200,50,0.4);}
        .drum-label{font-family:'Cinzel',serif;font-size:0.8rem;color:#F59E0B;letter-spacing:3px;text-shadow:0 0 10px #F59E0B;}
        .sticks{display:flex;gap:80px;margin-bottom:20px;}
        .stick{width:8px;height:100px;background:linear-gradient(180deg,#F5DEB3,#D2B48C);border-radius:4px;transform-origin:bottom center;cursor:pointer;}
        .hint-txt{font-family:'Sarabun',sans-serif;color:rgba(245,158,11,0.8);font-size:1.1rem;margin-top:25px;animation:pulse 1.5s infinite;}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        .cymbal-ring{position:absolute;border-radius:50%;border:2px solid #F59E0B;opacity:0;pointer-events:none;}
        .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
        .m-to{font-family:'Cinzel',serif;font-size:3.5rem;color:#F59E0B;text-shadow:0 0 30px #F59E0B;margin-bottom:20px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.3rem;color:#FFF;line-height:1.8;max-width:600px;}
        .m-from{font-family:'Cinzel',serif;font-size:1.2rem;color:#B45309;margin-top:30px;letter-spacing:3px;}
        .confetti-p{position:absolute;width:8px;height:8px;border-radius:2px;pointer-events:none;}
    </style>
    <div class="drum-scene" id="scene">
        <div class="stage-light"></div>
        <div class="sticks" id="sticks">
            <div class="stick" id="stick1"></div>
            <div class="stick" id="stick2"></div>
        </div>
        <div class="drum" id="drum">
            <div class="drum-shell"></div>
            <div class="drum-label">🥁 TAP ME</div>
        </div>
        <div class="hint-txt" id="hint">แตะกลอง 5 ครั้งเพื่อเปิดตัว!</div>
        <div class="msg-panel" id="msg">
            <div class="m-to">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
            <div class="m-from">🥁 ${escapeHtml(data.sender)}</div>
        </div>
    </div>`;

    const drum = document.getElementById('drum');
    const stick1 = document.getElementById('stick1');
    const stick2 = document.getElementById('stick2');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    const scene = document.getElementById('scene');
    let hits = 0;
    let alternate = true;

    drum.addEventListener('click', () => {
        hits++;
        const stick = alternate ? stick1 : stick2;
        alternate = !alternate;
        gsap.to(stick, { rotation: alternate ? -30 : 30, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.out' });
        gsap.to(drum, { scale: 0.92, duration: 0.05, yoyo: true, repeat: 1, ease: 'none' });
        createRing();
        hint.textContent = `แตะกลอง ${5 - hits} ครั้ง!`;

        if (hits >= 5) {
            hint.style.display = 'none';
            drum.style.pointerEvents = 'none';
            boom();
        }
    });

    function createRing() {
        const ring = document.createElement('div');
        ring.className = 'cymbal-ring';
        const rect = drum.getBoundingClientRect();
        const size = 160;
        ring.style.cssText = `width:${size}px;height:${size*0.5}px;left:${rect.left}px;top:${rect.top}px;`;
        scene.appendChild(ring);
        gsap.to(ring, { width: size * 4, height: size * 2, x: -size * 1.5, y: -size * 0.75, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ring.remove() });
    }

    function boom() {
        const colors = ['#F59E0B','#EF4444','#10B981','#3B82F6','#F472B6'];
        for (let i = 0; i < 40; i++) {
            const c = document.createElement('div');
            c.className = 'confetti-p';
            c.style.cssText = `background:${colors[i%colors.length]};left:50%;top:40%;`;
            scene.appendChild(c);
            gsap.to(c, { x: (Math.random()-0.5)*window.innerWidth, y: -Math.random()*window.innerHeight, rotation: Math.random()*720, opacity:0, duration: 1.5+Math.random()*1, ease:'power2.out', onComplete:()=>c.remove() });
        }
        gsap.to(drum, { scale: 1.5, opacity: 0, duration: 0.6, delay: 0.3, ease: 'power2.in' });
        gsap.to('#sticks', { y: -200, opacity: 0, duration: 0.5, delay: 0.2 });
        gsap.to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5, delay: 1, ease: 'power2.out' });
    }
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
