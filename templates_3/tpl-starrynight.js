export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "linear-gradient(to bottom, #010014, #000428, #004e92)";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;600&display=swap');
            #star-canvas { position: absolute; top:0; left:0; width:100%; height:100%; z-index: 10; touch-action: none; }
            
            .msg-panel {
                position: absolute; z-index: 5; text-align: center; color: white;
                font-family: 'Kanit', sans-serif; max-width: 80%; padding: 30px;
                opacity: 0; transform: translateY(30px); pointer-events: none;
                background: radial-gradient(circle at center, rgba(0,0,0,0.6) 0%, transparent 100%);
            }
            .msg-name { font-size: 2.5rem; font-weight: 600; color: #4EA8DE; margin-bottom: 20px; letter-spacing: 2px; }
            .msg-text { font-size: 1.2rem; line-height: 1.8; margin-bottom: 30px; font-weight: 300; color: #E0FBFC; text-shadow: 0 0 10px rgba(255,255,255,0.3); }
            
            .hint-layer {
                position: absolute; inset:0; z-index: 15; pointer-events: none;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                color: rgba(255,255,255,0.6); font-family: sans-serif; transition: opacity 0.5s;
            }
            .hint-layer .material-symbols-rounded { font-size: 3rem; margin-bottom: 10px; animation: swipeAnim 2s infinite; }
            @keyframes swipeAnim {
                0% { transform: translateX(-50px) translateY(50px) scale(1); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateX(50px) translateY(-50px) scale(0.8); opacity: 0; }
            }
        </style>
        
        <canvas id="star-canvas"></canvas>
        <div class="hint-layer" id="hint-layer">
            <span class="material-symbols-rounded">touch_app</span>
            <div style="letter-spacing: 3px; font-size: 0.9rem; text-transform: uppercase;">Draw a shooting star</div>
        </div>

        <div class="msg-panel" id="msg-panel">
            <div class="msg-name">${escapeHtml(data.receiver)}</div>
            <div class="msg-text">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
            <div style="opacity: 0.6; font-size: 0.9rem;">— ${escapeHtml(data.sender)}</div>
        </div>
    `;

    const canvas = document.getElementById('star-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    
    // Background Stars
    const bgStars = [];
    // User Trail
    let trail = [];
    let isDrawing = false;
    let hasWished = false;
    let shootingStar = null;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        bgStars.length = 0;
        for(let i=0; i<200; i++){
            bgStars.push({
                x: Math.random()*width, y: Math.random()*height,
                r: Math.random()*2, a: Math.random()
            });
        }
    }
    window.addEventListener('resize', resize);
    resize();

    function renderCanvas() {
        ctx.fillStyle = "rgba(0, 0, 10, 0.3)"; // fade effect for trail
        ctx.fillRect(0,0,width,height);
        
        // Draw bg stars
        ctx.fillStyle = "white";
        bgStars.forEach(s => {
            s.a += (Math.random()-0.5)*0.1;
            if(s.a < 0) s.a = 0; if(s.a > 1) s.a = 1;
            ctx.globalAlpha = s.a;
            ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
        });

        // Draw User Trail (drawing)
        if (trail.length > 0 && !hasWished) {
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.moveถึง(trail[0].x, trail[0].y);
            for(let i=1; i<trail.length; i++) { ctx.lineถึง(trail[i].x, trail[i].y); }
            ctx.strokeStyle = "rgba(255,255,255,0.8)";
            ctx.lineWidth = 4; ctx.lineCap = "round";
            ctx.shadowColor = "#4EA8DE"; ctx.shadowBlur = 15;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Animated Shooting Star after release
        if (shootingStar) {
            ctx.globalAlpha = 1;
            shootingStar.x += shootingStar.vx;
            shootingStar.y += shootingStar.vy;
            
            // Draw head
            ctx.beginPath();
            ctx.arc(shootingStar.x, shootingStar.y, 4, 0, Math.PI*2);
            ctx.fillStyle = "#fff";
            ctx.shadowColor = "#E0FBFC"; ctx.shadowBlur = 20;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Constellation explode check
            shootingStar.life--;
            if(shootingStar.life <= 0) {
                explodeConstellation(shootingStar.x, shootingStar.y);
                shootingStar = null;
            }
        }

        requestAnimationFrame(renderCanvas);
    }
    renderCanvas();

    function explodeConstellation(x, y) {
        // Prevent JS crash if hint-layer is already gone
        const hintLayer = document.getElementById('hint-layer');
        if (hintLayer) hintLayer.remove();
        
        // Simple DOM flash
        const flash = document.createElement('div');
        flash.style.cssText = `position:absolute;inset:0;background:white;z-index:20;opacity:0;pointer-events:none;`;
        container.appendChild(flash);
        
        gsap.to(flash, { opacity: 0.8, duration: 0.1, yoyo: true, repeat: 1, onComplete: () => flash.remove() });

        // Add lots of fast particles to bgStars
        for(let i=0; i<40; i++) {
            bgStars.push({
                x: x, y: y, r: Math.random()*5+1.5, a: 3,
                vx: (Math.random()-0.5)*15, vy: (Math.random()-0.5)*15
            });
        }
        
        // Custom animation loop for explosion stars
        const interval = setInterval(() => {
            let active = false;
            bgStars.forEach(s => {
                if(s.vx || s.vy) {
                    s.x += s.vx; s.y += s.vy;
                    s.vx *= 0.85; s.vy *= 0.85;
                    if(Math.abs(s.vx) < 0.1) s.vx = 0;
                    if(Math.abs(s.vy) < 0.1) s.vy = 0;
                    s.a -= 0.03;
                    active = true;
                }
            });
            if(!active) clearInterval(interval);
        }, 16);

        // Show message
        const msg = document.getElementById('msg-panel');
        if (msg) gsap.to(msg, { y: 0, opacity: 1, duration: 2, ease: "power2.out", delay: 0.5 });
    }

    // Interaction Events
    function startDraw(e) {
        if(hasWished) return;
        isDrawing = true;
        trail = [];
        const x = e.clientX || e.touches[0].clientX;
        const y = e.clientY || e.touches[0].clientY;
        trail.push({x, y});
        const hintLayer = document.getElementById('hint-layer');
        if (hintLayer) hintLayer.style.opacity = 0;
    }

    function moveDraw(e) {
        if(!isDrawing || hasWished) return;
        const x = e.clientX || e.touches[0].clientX;
        const y = e.clientY || e.touches[0].clientY;
        trail.push({x, y});
        
        // Keep trail short visually
        if(trail.length > 20) trail.shift();
    }

    function endDraw() {
        if(!isDrawing || hasWished) return;
        isDrawing = false;
        
        // Check if gesture was long enough
        if(trail.length > 5) {
            // Calculate vector
            const start = trail[0];
            const end = trail[trail.length-1];
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist > 10) {
                hasWished = true;
                shootingStar = {
                    x: end.x, y: end.y,
                    vx: (dx/dist) * 25,
                    vy: (dy/dist) * 25,
                    life: 30 // frames until explode
                };
            } else {
                const hintLayer = document.getElementById('hint-layer');
                if (hintLayer) hintLayer.style.opacity = 1;
            }
            trail = [];
        } else {
            trail = [];
            const hintLayer = document.getElementById('hint-layer');
            if (hintLayer) hintLayer.style.opacity = 1;
        }
    }

    canvas.addEventListener('mousedown', startDraw);
    window.addEventListener('mousemove', moveDraw);
    window.addEventListener('mouseup', endDraw);
    canvas.addEventListener('touchstart', startDraw, {passive:false});
    window.addEventListener('touchmove', moveDraw, {passive:false});
    window.addEventListener('touchend', endDraw);
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
