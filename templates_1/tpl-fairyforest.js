export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#011A11"; // Deep enchanted forest green
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Playfair+Display:ital@1&display=swap');
            
            .forest-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; cursor: pointer;
            }

            /* Forest silhouette backgroud */
            .trees {
                position: absolute; bottom: 0; width: 100%; height: 50%;
                background: url('https://www.transparenttextures.com/patterns/tree-bark.png'), linear-gradient(to top, #000, transparent);
                z-index: 1; opacity: 0.8;
            }

            /* The glowing flower bud */
            .magic-flower {
                position: relative; width: 100px; height: 100px;
                background: radial-gradient(circle, #A78BFA, #5B21B6);
                border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
                box-shadow: 0 0 30px #A78BFA;
                z-index: 10; transition: 0.5s;
                animation: breathe 3s infinite alternate;
            }
            @keyframes breathe { 100% {transform: rotate(-45deg) scale(1.1); box-shadow: 0 0 50px #C4B5FD;} }

            .hint { position: absolute; top: 30%; color:#C4B5FD; font-family:'Playfair Display', serif; font-size:1.2rem; letter-spacing: 2px; z-index:20; pointer-events:none;}

            /* Fireflies canvas */
            canvas#fireflies { position: absolute; inset:0; z-index: 5; pointer-events: none; }

            /* Message */
            .forest-msg {
                position: absolute; inset:0; z-index: 20; padding: 40px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none;
            }

            .m-head { font-family: 'Playfair Display', serif; font-size: 2.5rem; color: #FFF; text-shadow: 0 0 15px #A78BFA; margin-bottom: 20px;}
            .m-body { font-family: 'Dancing Script', cursive; font-size: 3rem; color: #E0E7FF; line-height: 1.4; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }
            
        </style>

        <div class="forest-scene" id="scene">
            <div class="trees"></div>
            <canvas id="fireflies"></canvas>
            
            <div class="hint" id="hint">แตะที่ดอกตูม</div>

            <div class="magic-flower" id="flower"></div>

            <div class="forest-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-head" style="font-size:1.5rem; margin-top:40px; color:#C4B5FD;">~ ${escapeHtml(data.sender)} ~</div>
            </div>
        </div>
    `;

    // Fireflies system
    const canvas = document.getElementById('fireflies');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let flies = [];
    for(let i=0; i<100; i++) {
        flies.push({
            x: Math.random()*canvas.width, y: Math.random()*canvas.height,
            vx: (Math.random()-0.5)*1, vy: (Math.random()-0.5)*1,
            s: Math.random()*3 + 1, a: Math.random()
        });
    }

    let isBlooming = false;

    function renderFlies() {
        ctx.clearRect(0,0, canvas.width, canvas.height);
        flies.forEach(f => {
            f.x += f.vx; f.y += f.vy;
            f.a += (Math.random()-0.5)*0.1;
            if(f.a > 1) f.a = 1; if(f.a < 0) f.a = 0;
            
            if(f.x < 0 || f.x > canvas.width) f.vx *= -1;
            if(f.y < 0 || f.y > canvas.height) f.vy *= -1;

            ctx.fillStyle = `rgba(167, 139, 250, ${f.a})`;
            ctx.shadowBlur = isBlooming ? 20 : 10; ctx.shadowColor = "#A78BFA";
            ctx.beginPath(); ctx.arc(f.x, f.y, f.s, 0, Math.PI*2); ctx.fill();
        });
        requestAnimationFrame(renderFlies);
    }
    requestAnimationFrame(renderFlies);

    const scene = document.getElementById('scene');
    const flower = document.getElementById('flower');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');

    scene.addEventListener('click', () => {
        if(isBlooming) return;
        isBlooming = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Flower bursts into light
        gsap.killTweensOf(flower);
        tl.to(flower, { scale: 50, opacity: 0, duration: 1.5, ease: "power2.in" })
          
        // 2. Scene gets brighter (magical morning)
          .to('.forest-scene', { background: 'radial-gradient(circle, #2E1065, #011A11)', duration: 2 }, 0)
          
        // 3. Fireflies go crazy (speeds up handled in logic if we wanted to, but visually we just reveal text)
          .to(msg, { opacity: 1, pointerEvents:'auto', duration: 2, ease:"power1.inOut" }, 1);
          
        // Make fireflies faster
        flies.forEach(f => { f.vx *= 3; f.vy *= 3; });
    });
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
