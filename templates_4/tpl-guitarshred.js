export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#0a0005;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Metal+Mania&family=Sarabun:wght@300;700&display=swap');
        .guitar-scene{position:relative;width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;background:radial-gradient(ellipse at 50% 100%,#3d0010,#0a0005);}
        .guitar-body{position:relative;cursor:pointer;z-index:10;filter:drop-shadow(0 0 30px rgba(220,20,60,0.5));}
        .guitar-svg{width:200px;height:auto;}
        .string{stroke:#FFD700;stroke-width:2;fill:none;transform-origin:center;}
        .hint-txt{font-family:'Sarabun',sans-serif;color:rgba(255,140,0,0.9);font-size:1.1rem;margin-top:20px;animation:glow 1.5s infinite;}
        @keyframes glow{0%,100%{text-shadow:0 0 5px #FF8C00}50%{text-shadow:0 0 20px #FF8C00}}
        .wave-line{position:absolute;height:3px;border-radius:3px;pointer-events:none;opacity:0;}
        .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
        .m-to{font-family:'Metal Mania',cursive;font-size:3.5rem;color:#DC143C;text-shadow:0 0 20px #DC143C,0 0 40px rgba(220,20,60,0.5);margin-bottom:20px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.3rem;color:#FFF;line-height:1.7;max-width:600px;text-shadow:0 2px 10px rgba(0,0,0,0.8);}
        .m-from{font-family:'Metal Mania',cursive;font-size:1.5rem;color:#FF8C00;margin-top:30px;text-shadow:0 0 20px #FF8C00;}
        .spark{position:absolute;width:6px;height:6px;border-radius:50%;pointer-events:none;}
    </style>
    <div class="guitar-scene" id="scene">
        <div class="guitar-body" id="guitar">
            <svg class="guitar-svg" viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
                <defs><radialGradient id="bodyGrad" cx="50%" cy="60%"><stop offset="0%" stop-color="#8B0000"/><stop offset="100%" stop-color="#3d0010"/></radialGradient></defs>
                <ellipse cx="100" cy="300" rx="70" ry="90" fill="url(#bodyGrad)" stroke="#DC143C" stroke-width="2"/>
                <ellipse cx="100" cy="220" rx="40" ry="50" fill="url(#bodyGrad)" stroke="#DC143C" stroke-width="2"/>
                <rect x="93" y="60" width="14" height="170" fill="#5C0000" rx="5"/>
                <rect x="85" y="40" width="30" height="25" fill="#333" rx="4"/>
                <circle cx="100" cy="300" r="25" fill="none" stroke="#FFD700" stroke-width="2" opacity="0.6"/>
                <line id="s1" x1="100" y1="60" x2="100" y2="380" stroke="#FFD700" stroke-width="1.5" opacity="0.8"/>
                <line id="s2" x1="94" y1="60" x2="94" y2="380" stroke="#FFD700" stroke-width="1.5" opacity="0.8"/>
                <line id="s3" x1="88" y1="60" x2="88" y2="380" stroke="#FFD700" stroke-width="1.5" opacity="0.8"/>
                <line id="s4" x1="106" y1="60" x2="106" y2="380" stroke="#FFD700" stroke-width="1.5" opacity="0.8"/>
                <line id="s5" x1="112" y1="60" x2="112" y2="380" stroke="#FFD700" stroke-width="1.5" opacity="0.8"/>
            </svg>
        </div>
        <div class="hint-txt" id="hint">แตะกีตาร์เพื่อดีดสาย</div>
        <div class="msg-panel" id="msg">
            <div class="m-to">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
            <div class="m-from">🎸 ${escapeHtml(data.sender)}</div>
        </div>
    </div>`;

    const guitar = document.getElementById('guitar');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    const scene = document.getElementById('scene');
    let clicks = 0;

    guitar.addEventListener('click', () => {
        clicks++;
        shredStrings();
        createWaves();
        if (clicks >= 3) {
            setTimeout(() => {
                hint.style.display = 'none';
                guitar.style.pointerEvents = 'none';
                gsap.to(guitar, { y: 200, opacity: 0, scale: 0.5, duration: 0.8, ease: 'power2.in' });
                gsap.to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.2, delay: 0.6, ease: 'power2.out' });
            }, 200);
        }
    });

    function shredStrings() {
        for (let i = 1; i <= 5; i++) {
            const s = document.getElementById('s' + i);
            if (s) gsap.to(s, { attr: { x1: 88 + i * 2 + (Math.random() - 0.5) * 20 }, duration: 0.05, yoyo: true, repeat: 8, ease: 'none' });
        }
        createSparks();
    }

    function createSparks() {
        const rect = guitar.getBoundingClientRect();
        for (let i = 0; i < 8; i++) {
            const spark = document.createElement('div');
            spark.className = 'spark';
            spark.style.cssText = `background:${Math.random() > 0.5 ? '#FFD700' : '#DC143C'};left:${rect.left + rect.width * 0.5}px;top:${rect.top + rect.height * 0.6}px;`;
            scene.appendChild(spark);
            gsap.to(spark, { x: (Math.random() - 0.5) * 150, y: -100 - Math.random() * 100, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => spark.remove() });
        }
    }

    function createWaves() {
        const colors = ['#DC143C', '#FF8C00', '#FFD700'];
        for (let i = 0; i < 3; i++) {
            const wave = document.createElement('div');
            wave.className = 'wave-line';
            wave.style.cssText = `width:${200 + i * 100}px;background:${colors[i]};left:50%;top:${40 + i * 5}%;transform:translateX(-50%);`;
            scene.appendChild(wave);
            gsap.to(wave, { opacity: 0.8, scaleX: 1.5, duration: 0.3, delay: i * 0.1, ease: 'power2.out',
                onComplete: () => gsap.to(wave, { opacity: 0, scaleX: 0.5, duration: 0.5, ease: 'power2.in', onComplete: () => wave.remove() }) });
        }
    }
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
