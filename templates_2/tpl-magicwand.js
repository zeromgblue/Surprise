export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#02070D"; // Deep magical blue/black
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    // Create a magical wand scene
    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Great+Vibes&display=swap');
            
            .wand-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; cursor: crosshair;
            }

            canvas#sparkles { position: absolute; inset: 0; pointer-events: none; z-index: 5; }

            /* Wand handle appearing from bottom */
            .wand {
                position: absolute; bottom: -200px; left: 50%; transform: translateX(-50%) rotate(15deg);
                width: 20px; height: 300px;
                background: linear-gradient(to right, #3E2723, #5D4037, #3E2723);
                border-radius: 10px 10px 5px 5px;
                box-shadow: inset 2px 0 5px rgba(255,255,255,0.3), inset -2px 0 5px rgba(0,0,0,0.8);
                transition: 1s ease; z-index: 10;
            }
            .wand-tip {
                position: absolute; top: 0; left: 50%; transform: translateX(-50%);
                width: 10px; height: 10px; border-radius: 50%;
                background: #fff; box-shadow: 0 0 20px 10px #00E5FF;
                animation: flare 1s infinite alternate;
            }
            @keyframes flare { 100% {box-shadow: 0 0 40px 20px #00E5FF;} }

            .instruction {
                position: absolute; bottom: 20%; color: #00E5FF; font-family: 'Cinzel Decorative', serif;
                font-size: 1.5rem; text-shadow: 0 0 10px #00E5FF; animation: fadeIO 2s infinite; pointer-events:none; z-index:2;
            }
            @keyframes fadeIO { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Message container */
            .msg-magic {
                position: absolute; inset:0; z-index: 20; padding: 40px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(0,229,255,0.1) 0%, transparent 60%);
            }

            .m-head { font-family: 'Cinzel Decorative', cursive; font-size: 3.5rem; color: #fff; text-shadow: 0 0 20px #00E5FF, 0 0 40px #00E5FF; margin-bottom: 20px;}
            .m-body { font-family: 'Great Vibes', cursive; font-size: 2.5rem; color: #E0F7FA; line-height: 1.4; text-shadow: 2px 2px 5px #000; }
            
        </style>

        <div class="wand-scene" id="scene">
            <canvas id="sparkles"></canvas>
            
            <div class="wand" id="wand">
                <div class="wand-tip"></div>
            </div>

            <div class="instruction" id="hint">ตวัดไม้กายสิทธิ์</div>
            
            <div class="msg-magic" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-body" style="font-size:1.5rem; margin-top:30px;">— ${escapeHtml(data.sender)} —</div>
            </div>
        </div>
    `;

    const scene = document.getElementById('scene');
    const wand = document.getElementById('wand');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    
    // Canvas setup for drawing spell
    const canvas = document.getElementById('sparkles');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    let isDrawing = false;
    let activated = false;

    // Wand presentation
    setTimeout(() => {
        wand.style.bottom = "-50px";
    }, 500);

    // Mouse/ถึงuch follow for wand and drawing
    const drawSparkle = (x, y) => {
        if(activated) return;
        particles.push({
            x: x, y: y,
            vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2 - 1,
            life: 1, size: Math.random()*4 + 1
        });
        
        // Tilt wand
        const w = window.innerWidth;
        const tilt = (x / w - 0.5) * 60; // -30 to 30 deg
        wand.style.left = x + 'px';
        wand.style.transform = `translateX(-50%) rotate(${tilt}deg)`;
        
        if(particles.length > 100) triggerSpell(); // If swished enough
    };

    scene.addEventListener('mousemove', e => { if(isDrawing) drawSparkle(e.clientX, e.clientY); });
    scene.addEventListener('mousedown', e => { isDrawing=true; drawSparkle(e.clientX, e.clientY); hint.style.display='none';});
    scene.addEventListener('mouseup', () => { isDrawing=false; });
    
    scene.addEventListener('touchmove', e => { if(isDrawing) drawSparkle(e.touches[0].clientX, e.touches[0].clientY); });
    scene.addEventListener('touchstart', e => { isDrawing=true; drawSparkle(e.touches[0].clientX, e.touches[0].clientY); hint.style.display='none';});
    scene.addEventListener('touchend', () => { isDrawing=false; });

    // Animation Loop
    function renderCanvas() {
        ctx.clearRect(0,0, canvas.width, canvas.height);
        
        for(let i=particles.length-1; i>=0; i--){
            let p = particles[i];
            p.x += p.vx; p.y += p.vy; p.life -= 0.02; p.size *= 0.95;
            
            if(p.life <= 0) { particles.splice(i,1); continue; }
            
            ctx.fillStyle = `rgba(0, 229, 255, ${p.life})`;
            ctx.shadowBlur = 10; ctx.shadowColor = "#00E5FF";
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
        }
        requestAnimationFrame(renderCanvas);
    }
    requestAnimationFrame(renderCanvas);

    function triggerSpell() {
        activated = true;
        isDrawing = false;
        
        // Quick wand flick
        gsap.to(wand, { rotation: -45, y: 100, duration: 0.3, ease: "power2.in", onComplete: () => wand.style.display='none' });
        
        // Massive flash
        const flash = document.createElement('div');
        flash.style.cssText = "position:absolute; inset:0; background:#fff; z-index:50;";
        document.body.appendChild(flash);
        gsap.to(flash, { opacity:0, duration: 1.5, onComplete:()=>flash.remove() });
        
        // Reveal text with pure magic
        gsap.to(msg, { opacity: 1, scale: 1, duration: 2, ease: "slow(0.7,0.7,false)", pointerEvents:"auto" });
        gsap.fromถึง('.m-head', { letterSpacing: "20px", opacity:0 }, { letterSpacing: "normal", opacity:1, duration:2, ease:"power4.out" });
    }
}

function escapeHtml(str) {
    if(!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}
