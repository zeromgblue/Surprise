export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#0A0500;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Sarabun:wght@300;400&display=swap');
        .orch-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at 50% 80%,#1a0a00,#0A0500);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;}
        .concert-hall{position:absolute;bottom:0;width:100%;height:30%;background:linear-gradient(180deg,transparent,#1a0a00);pointer-events:none;}
        .bow-wrap{display:flex;align-items:center;justify-content:center;margin-bottom:20px;z-index:10;}
        .bow{width:180px;height:6px;background:linear-gradient(90deg,#D4AF37,#8B6914,#D4AF37);border-radius:3px;position:relative;cursor:pointer;}
        .bow-tip{width:12px;height:12px;border-radius:50%;background:#D4AF37;position:absolute;right:-6px;top:-3px;box-shadow:0 0 15px #D4AF37;}
        .bow-horse{width:12px;height:12px;border-radius:50%;background:#8B6914;position:absolute;left:-6px;top:-3px;}
        .violin-body{width:80px;height:120px;background:radial-gradient(ellipse at 40% 30%,#8B4513,#4A2400);border-radius:40px 40px 20px 20px;margin-left:20px;box-shadow:0 10px 30px rgba(0,0,0,0.6),inset 0 2px 10px rgba(255,200,100,0.2);position:relative;}
        .v-hole{width:20px;height:30px;background:#000;border-radius:50%;position:absolute;left:30px;top:45px;}
        .hint-txt{font-family:'Cinzel',serif;color:#D4AF37;font-size:1rem;margin-top:20px;animation:glow 2s infinite;letter-spacing:4px;text-align:center;}
        @keyframes glow{0%,100%{text-shadow:0 0 5px #D4AF37}50%{text-shadow:0 0 25px #D4AF37,0 0 50px rgba(212,175,55,0.4)}}
        .wave-canvas{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;}
        .note-float{position:absolute;font-size:1.5rem;color:#D4AF37;opacity:0;pointer-events:none;}
        .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
        .m-to{font-family:'Cinzel',serif;font-size:3rem;color:#D4AF37;text-shadow:0 0 30px rgba(212,175,55,0.8);margin-bottom:25px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.3rem;color:#FEF3C7;line-height:1.8;max-width:600px;}
        .m-from{font-family:'Cinzel',serif;font-size:1.1rem;color:#B45309;margin-top:30px;letter-spacing:4px;}
    </style>
    <div class="orch-scene" id="scene">
        <canvas class="wave-canvas" id="waveCanvas"></canvas>
        <div class="bow-wrap" id="instruments">
            <div class="bow" id="bow"><div class="bow-tip"></div><div class="bow-horse"></div></div>
            <div class="violin-body"><div class="v-hole"></div></div>
        </div>
        <div class="hint-txt" id="hint">แตะเพื่อดีดคันชักไวโอลิน</div>
        <div class="msg-panel" id="msg">
            <div class="m-to">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
            <div class="m-from">🎻 จาก ${escapeHtml(data.sender)}</div>
        </div>
    </div>`;

    const canvas = document.getElementById('waveCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const scene = document.getElementById('scene');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    const bow = document.getElementById('bow');
    let playing = false;
    let phase = 0;
    let animId;
    const waves = [];

    scene.addEventListener('click', () => {
        if (playing) return;
        playing = true;
        hint.style.display = 'none';
        gsap.to(bow, { x: 100, duration: 0.3, yoyo: true, repeat: 5, ease: 'sine.inOut' });

        // Spawn waves
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                waves.push({ phase: 0, color: `hsl(${40 + i * 15}, 80%, ${50 + i * 5}%)`, amp: 30 + i * 10, speed: 0.05 + i * 0.01, y: canvas.height * (0.3 + i * 0.1) });
                spawnNote();
            }, i * 300);
        }
        animId = requestAnimationFrame(drawWaves);

        setTimeout(() => {
            cancelAnimationFrame(animId);
            gsap.to('#instruments', { y: -200, opacity: 0, duration: 0.8, ease: 'power2.in' });
            gsap.to(canvas, { opacity: 0, duration: 1 });
            gsap.to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5, delay: 0.8, ease: 'power2.out' });
        }, 4000);
    });

    function drawWaves() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        waves.forEach(w => {
            w.phase += w.speed;
            ctx.beginPath();
            ctx.strokeStyle = w.color;
            ctx.lineWidth = 2.5;
            ctx.globalAlpha = 0.6;
            for (let x = 0; x < canvas.width; x++) {
                const y = w.y + Math.sin(x * 0.015 + w.phase) * w.amp;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
        });
        animId = requestAnimationFrame(drawWaves);
    }

    function spawnNote() {
        const notes = ['♩','♪','♫','♬'];
        const el = document.createElement('div');
        el.className = 'note-float';
        el.textContent = notes[Math.floor(Math.random() * notes.length)];
        el.style.left = (20 + Math.random() * 60) + '%';
        el.style.top = '60%';
        scene.appendChild(el);
        gsap.to(el, { y: -200, opacity: 0.8, duration: 2, ease: 'power2.out', onComplete: () => el.remove() });
    }
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
