export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#450A0A;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700;900&display=swap');
        .hotpot-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at 50% 80%,#7f1d1d,#450A0A);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;}
        .pot{width:240px;height:140px;background:radial-gradient(ellipse at 50% 40%,#DC2626,#991B1B);border-radius:20px 20px 40px 40px;border:4px solid #EF4444;position:relative;box-shadow:0 20px 50px rgba(0,0,0,0.5),inset 0 -10px 30px rgba(0,0,0,0.3);z-index:10;}
        .pot-handles{position:absolute;top:20px;width:100%;display:flex;justify-content:space-between;}
        .handle{width:24px;height:30px;border:4px solid #EF4444;border-radius:12px;background:transparent;}
        .handle-l{margin-left:-14px;}
        .handle-r{margin-right:-14px;}
        .broth-surface{position:absolute;top:10px;left:10px;right:10px;height:90px;background:radial-gradient(ellipse,rgba(255,100,50,0.5),rgba(180,30,30,0.6));border-radius:10px 10px 30px 30px;overflow:hidden;}
        .bubble-el{position:absolute;border-radius:50%;background:rgba(255,150,80,0.7);border:1px solid rgba(255,200,150,0.5);}
        .letter-bubble{position:absolute;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,200,100,0.9),rgba(200,80,50,0.8));display:flex;align-items:center;justify-content:center;font-family:'Sarabun',sans-serif;font-weight:900;font-size:1rem;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,0.5);box-shadow:0 2px 10px rgba(0,0,0,0.3);opacity:0;cursor:pointer;}
        .hint-txt{font-family:'Sarabun',sans-serif;color:#FCA5A5;font-size:1rem;margin-top:25px;animation:pulse 1.5s infinite;}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        .steam-el{position:absolute;border-radius:50%;background:rgba(255,180,100,0.15);filter:blur(10px);}
        .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
        .m-to{font-family:'Sarabun',sans-serif;font-size:3rem;font-weight:900;color:#FCA5A5;text-shadow:0 0 30px rgba(252,165,165,0.5);margin-bottom:20px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#FEF2F2;line-height:1.8;max-width:600px;}
        .m-from{font-family:'Sarabun',sans-serif;font-size:1rem;color:#F97316;margin-top:25px;letter-spacing:3px;}
    </style>
    <div class="hotpot-scene" id="scene">
        <div class="pot" id="pot">
            <div class="pot-handles"><div class="handle handle-l"></div><div class="handle handle-r"></div></div>
            <div class="broth-surface" id="brothSurface"></div>
        </div>
        <div class="hint-txt" id="hint">🍲 แตะหม้อสุกี้เพื่อดูข้อความในฟอง!</div>
        <div class="msg-panel" id="msg">
            <div class="m-to">🍲 ${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)} —</div>
        </div>
    </div>`;

    const scene = document.getElementById('scene');
    const surface = document.getElementById('brothSurface');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');

    // Bubble small decorations
    for (let i = 0; i < 8; i++) {
        const b = document.createElement('div');
        b.className = 'bubble-el';
        const size = 5 + Math.random() * 10;
        b.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*90}%;top:${Math.random()*80}%;`;
        surface.appendChild(b);
        gsap.to(b, { y: -(10 + Math.random()*15), opacity: 0, duration: 0.8 + Math.random(), repeat: -1, delay: Math.random() * 2, ease: 'power2.out', onRepeat: () => { b.style.left = Math.random()*90+'%'; b.style.top = Math.random()*80+'%'; } });
    }

    let clicked = false;
    document.getElementById('pot').addEventListener('click', () => {
        if (clicked) return;
        clicked = true;
        hint.style.display = 'none';

        // Letter bubbles rise
        const name = (data.receiver || 'HELLO').substring(0, 8);
        name.split('').forEach((char, i) => {
            const lb = document.createElement('div');
            lb.className = 'letter-bubble';
            lb.textContent = char;
            const size = 45 + Math.random() * 15;
            lb.style.cssText = `width:${size}px;height:${size}px;left:${20 + i * 9}%;bottom:25%;position:absolute;z-index:20;font-size:${size*0.35}px;`;
            scene.appendChild(lb);
            gsap.to(lb, { opacity: 1, y: -(150 + Math.random()*100), duration: 1.5, delay: i * 0.15, ease: 'power2.out',
                onComplete: () => {
                    if (i === name.length - 1) {
                        setTimeout(() => {
                            gsap.to('.letter-bubble', { opacity: 0, scale: 2, duration: 0.5 });
                            gsap.to('#pot', { y: 200, opacity: 0, duration: 0.8, delay: 0.3, ease: 'power2.in' });
                            gsap.to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5, delay: 1, ease: 'power2.out' });
                        }, 800);
                    }
                }
            });
        });
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
