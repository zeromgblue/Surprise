export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#050D11";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Prompt:wght@300;400&display=swap');
            
            #star-canvas { position: absolute; inset:0; z-index:1; cursor: crosshair; }

            .msg-panel {
                position: absolute; inset: 0; z-index: 10;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                background: radial-gradient(circle, rgba(5,13,17,0.7) 0%, rgba(5,13,17,0.95) 100%);
                opacity: 0; pointer-events: none; padding: 40px; text-align: center;
                transition: opacity 1.5s ease;
            }

            .c-title { font-family: 'Cinzel Decorative', serif; font-size: 2.5rem; color: #FFF; text-shadow: 0 0 20px #FFF, 0 0 40px #8AB4F8; margin-bottom: 30px; letter-spacing: 2px;}
            .c-body { font-family: 'Prompt', sans-serif; font-size: 1.2rem; color: #E8F0FE; line-height: 1.8; text-shadow: 0 2px 5px rgba(0,0,0,0.8); max-width: 500px;}
            
            .hint {
                position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
                color: #8AB4F8; font-family: sans-serif; letter-spacing: 3px; z-index: 5;
                animation: fadeHint 2s infinite alternate; pointer-events: none;
            }
            @keyframes fadeHint { 0%{opacity:0.3;} 100%{opacity:1;} }
        </style>

        <canvas id="star-canvas"></canvas>
        <div class="hint" id="hint">ปัดผ่านท้องฟ้า</div>

        <div class="msg-panel" id="msg">
            <div class="c-title" id="t-head">${escapeHtml(data.receiver)}</div>
            <div class="c-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
            <div class="c-body" style="color: #8AB4F8; margin-top:20px; font-size:0.9rem;">⭐ ${escapeHtml(data.sender)}</div>
        </div>
    `;

    const canvas = document.getElementById('star-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Background random stars
    const bgStars = [];
    for(let i=0; i<300; i++) {
        bgStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            s: Math.random() * 1.5,
            a: Math.random()
        });
    }

    // Constellation points (Heart shape roughly in center)
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 - 30; // offset up
    const scale = Math.min(canvas.width, canvas.height) * 0.35; // Size of constellation
    
    // Parametric heart formula points
    const cPoints = [];
    const numPoints = 15;
    for(let i=0; i<numPoints; i++) {
        let t = (i / numPoints) * Math.PI * 2;
        // x = 16 * sin^3(t)
        // y = 13 * cos(t) - 5 * cos(2t) - 2 * cos(3t) - cos(4t)
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        
        // Normalize and scale
        cPoints.push({
            x: cx + (x / 16) * scale,
            y: cy + (y / 16) * scale,
            connected: false,
            r: 3
        });
    }

    let isDrawing = false;
    let completed = false;
    let connections = []; // Array of {p1, p2, progress}

    function renderFrame() {
        ctx.fillStyle = '#050D11';
        ctx.fillRect(0,0,canvas.width,canvas.height);

        // Draw bg stars
        bgStars.forEach(s => {
            s.a += (Math.random()-0.5)*0.1;
            if(s.a < 0) s.a = 0; if(s.a > 1) s.a = 1;
            ctx.fillStyle = `rgba(255,255,255,${s.a})`;
            ctx.fillRect(s.x, s.y, s.s, s.s);
        });

        // Draw completed connections
        ctx.strokeStyle = '#8AB4F8';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#8AB4F8';
        
        ctx.beginPath();
        connections.forEach(line => {
            ctx.moveถึง(line.p1.x, line.p1.y);
            // Draw partial line based on progress
            let dx = line.p2.x - line.p1.x;
            let dy = line.p2.y - line.p1.y;
            ctx.lineถึง(line.p1.x + dx * line.progress, line.p1.y + dy * line.progress);
        });
        ctx.stroke();

        let allDone = true;

        // Draw Constellation Stars (bright)
        cPoints.forEach(p => {
            if(!p.connected) allDone = false;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
            ctx.fillStyle = p.connected ? '#FFF' : '#8AB4F8';
            ctx.fill();
            if(p.connected) {
                // extra glow
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r+5, 0, Math.PI*2);
                ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fill();
            }
        });
        ctx.shadowBlur = 0; // reset

        if(allDone && !completed) {
            completed = true;
            finishConstellation();
        }

        requestAnimationFrame(renderFrame);
    }
    requestAnimationFrame(renderFrame);

    let lastPoint = null;

    function handleInput(x, y) {
        if(completed) return;
        
        // Find if near any constellation point
        let hit = null;
        for(let i=0; i<cPoints.length; i++) {
            let p = cPoints[i];
            let dist = Math.hypot(p.x - x, p.y - y);
            if(dist < 40) { // Hit radius
                hit = p;
                p.connected = true;
                break;
            }
        }

        if(hit) {
            if(lastPoint && lastPoint !== hit) {
                // Determine if they are sequential (or just connect them anyway)
                let p1Idx = cPoints.indexOf(lastPoint);
                let p2Idx = cPoints.indexOf(hit);
                
                // Allow connection
                let conn = { p1: lastPoint, p2: hit, progress: 0 };
                connections.push(conn);
                gsap.to(conn, { progress: 1, duration: 0.5, ease: "power2.out" });
            }
            lastPoint = hit;
            if(isDrawing) document.getElementById('hint').style.display = 'none';
        }
    }

    // Instead of forcing user to draw exactly, if they just swipe around let's auto-fill over time if they touch enough.
    // ถึง make it easy: user just swipes screen. If they hit 3 points, we auto complete the rest!
    
    let hitCount = 0;
    
    function trackSwipe(e) {
        let x = e.touches ? e.touches[0].clientX : e.clientX;
        let y = e.touches ? e.touches[0].clientY : e.clientY;
        
        let initialHits = cPoints.filter(p=>p.connected).length;
        handleInput(x, y);
        let newHits = cPoints.filter(p=>p.connected).length;
        
        if(newHits > initialHits) hitCount++;
        
        // Auto complete if swiped enough
        if(hitCount > 2 && !completed) {
            completed = true;
            autoComplete();
        }
    }

    canvas.addEventListener('mousedown', (e)=>{ isDrawing = true; trackSwipe(e); });
    canvas.addEventListener('mousemove', (e)=>{ if(isDrawing) trackSwipe(e); });
    canvas.addEventListener('mouseup', ()=> isDrawing = false);
    
    canvas.addEventListener('touchstart', (e)=>{ isDrawing = true; trackSwipe(e); }, {passive:false});
    canvas.addEventListener('touchmove', (e)=>{ if(isDrawing){ e.preventDefault(); trackSwipe(e); } }, {passive:false});
    canvas.addEventListener('touchend', ()=> isDrawing = false);

    function autoComplete() {
        document.getElementById('hint').style.display = 'none';
        // Connect all point sequentially
        let delay = 0;
        for(let i=0; i<cPoints.length; i++) {
            setTimeout(() => {
                let p1 = cPoints[i];
                let p2 = cPoints[(i+1)%cPoints.length];
                p1.connected = true; p2.connected = true;
                let conn = { p1: p1, p2: p2, progress: 0 };
                connections.push(conn);
                gsap.to(conn, { progress: 1, duration: 0.1 });
            }, delay);
            delay += 100;
        }
        
        // After all lines drawn, trigger final effect
        setTimeout(finishConstellation, delay + 200);
    }

    function finishConstellation() {
        // Flash entire canvas then reveal message
        const tl = gsap.timeline();
        tl.to(canvas, { opacity: 0.2, duration: 1.5, ease: "power2.inOut" })
          .call(() => {
              document.getElementById('msg').style.pointerEvents = 'auto';
              document.getElementById('msg').style.opacity = 1;
              gsap.fromถึง('#t-head', { scale: 0.5, opacity: 0}, { scale: 1, opacity: 1, duration: 1, ease: "back.out(1.5)" });
          });
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
