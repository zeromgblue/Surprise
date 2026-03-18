export async function render(container, data, config) {
    // 1. Reset container
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "block";
    container.style.background = `linear-gradient(to bottom, #020024 0%, #090979 50%, #00d4ff 100%)`; // Night to horizon
    container.style.background = config.bg || "#020024";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    // 2. Load GSAP
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const lanternColor = config.from || '#FFB703';

    // 3. Inject HTML Structure
    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;600&display=swap');
            
            #sky-canvas {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none;
            }

            .content-layer {
                position: absolute; inset: 0; z-index: 10;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                pointer-events: none; /* Let canvas handle touches first if needed, but we handle it globally */
            }

            .message-box {
                text-align: center; color: white;
                font-family: 'Sarabun', sans-serif;
                background: rgba(0,0,0,0.4);
                backdrop-filter: blur(5px);
                padding: 40px; border-radius: 20px;
                border: 1px solid rgba(255,255,255,0.1);
                max-width: 80%;
                opacity: 0; transform: translateY(50px);
                box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            }
            .msg-to { font-size: 1.5rem; font-weight: 600; color: ${lanternColor}; margin-bottom: 20px; }
            .msg-text { font-size: 1.2rem; line-height: 1.8; margin-bottom: 30px; font-weight: 300; }
            .msg-from { font-size: 1rem; opacity: 0.7; }

            .swipe-hint {
                position: absolute; bottom: 50px; left: 50%; transform: translateX(-50%);
                display: flex; flex-direction: column; align-items: center;
                color: rgba(255,255,255,0.6); font-family: sans-serif;
                font-size: 0.9rem; letter-spacing: 2px; text-transform: uppercase;
                animation: floatHint 2s ease-in-out infinite; pointer-events: auto;
            }
            .swipe-hint .material-symbols-rounded { font-size: 2rem; margin-bottom: 10px; }
            @keyframes floatHint { 0%,100%{transform: translate(-50%, 0);} 50%{transform: translate(-50%, -15px);} }

            /* A physical lantern object to drag */
            #drag-lantern {
                position: absolute; bottom: 120px; left: 50%; width: 60px; height: 80px;
                margin-left: -30px;
                background: linear-gradient(to bottom, #FFD166, #F4A261);
                border-radius: 30px 30px 10px 10px;
                box-shadow: 0 0 30px #FFD166, inset 0 -10px 20px rgba(0,0,0,0.2);
                cursor: grab; pointer-events: auto; z-index: 20;
            }
            #drag-lantern::after { /* Flame */
                content: ''; position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
                width: 20px; height: 20px; background: white; border-radius: 50%;
                box-shadow: 0 0 20px white, 0 0 40px yellow;
                animation: flicker 0.5s infinite alternate;
            }
            @keyframes flicker { 0%{opacity:0.8; transform:translateX(-50%) scale(0.9);} 100%{opacity:1; transform:translateX(-50%) scale(1.1);} }
        </style>

        <canvas id="sky-canvas"></canvas>

        <div id="drag-lantern"></div>
        <div class="swipe-hint" id="hint">
            <span class="material-symbols-rounded">swipe_up</span>
            Swipe up to release
        </div>

        <div class="content-layer">
            <div class="message-box" id="msg-box">
                <div class="msg-to">แด่... ${escapeHtml(data.receiver)}</div>
                <div class="msg-text">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="msg-from">จาก ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    // 4. Canvas Engine for Lanterns & Stars
    const canvas = document.getElementById('sky-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();

    const stars = [];
    for(let i=0; i<150; i++) {
        stars.push({ x: Math.random()*width, y: Math.random()*height, r: Math.random()*1.5, a: Math.random() });
    }

    const lanterns = [];
    let isReleased = false;

    function renderCanvas() {
        ctx.clearRect(0,0,width,height);
        
        // Draw Stars
        ctx.fillStyle = "white";
        stars.forEach(s => {
            s.a += (Math.random()-0.5)*0.1;
            if(s.a < 0) s.a = 0; if(s.a > 1) s.a = 1;
            ctx.globalAlpha = s.a;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
            ctx.fill();
        });
        
        // Draw Lanterns (background swarm)
        lanterns.forEach((l, index) => {
            l.y -= l.vy;
            l.x += Math.sin(l.y/50 + l.offset) * l.vx;
            
            // Glow
            ctx.globalAlpha = 0.8;
            const grad = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.s*2);
            grad.addColorStop(0, 'rgba(255, 200, 100, 1)');
            grad.addColorStop(0.5, 'rgba(255, 100, 0, 0.5)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(l.x, l.y, l.s*2, 0, Math.PI*2);
            ctx.fill();

            // Core
            ctx.fillStyle = "#FFF";
            ctx.globalAlpha = 1;
            ctx.fillRect(l.x - l.s/4, l.y - l.s/2, l.s/2, l.s);

            if(l.y < -50) lanterns.splice(index, 1);
        });

        // Generate continuously after release
        if (isReleased && Math.random() > 0.8) {
            lanterns.push({
                x: width/2 + (Math.random()-0.5)*(width*0.8),
                y: height + 50,
                s: 5 + Math.random()*15, // size
                vy: 0.5 + Math.random()*1.5,
                vx: 0.5 + Math.random(),
                offset: Math.random()*100
            });
        }

        ctx.globalAlpha = 1;
        requestAnimationFrame(renderCanvas);
    }
    renderCanvas();

    // 5. Interaction: Drag Logic
    const dragItem = document.getElementById('drag-lantern');
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    
    function onถึงuchStart(e) {
        if(isReleased) return;
        isDragging = true;
        startY = e.clientY || e.touches[0].clientY;
        dragItem.style.transition = 'none';
    }
    
    function onถึงuchMove(e) {
        if(!isDragging || isReleased) return;
        const y = e.clientY || e.touches[0].clientY;
        currentY = y - startY;
        
        if (currentY < 0) { // dragging up
            dragItem.style.transform = `translateY(${currentY}px) scale(${1 + currentY/-500})`;
            // Fade out hint
            document.getElementById('hint').style.opacity = Math.max(0, 1 - (currentY/-100));
        }
    }
    
    function onถึงuchEnd() {
        if(!isDragging || isReleased) return;
        isDragging = false;
        
        if (currentY < -150) {
            // RELEASED!
            isReleased = true;
            document.getElementById('hint').remove();
            
            // Fly main lantern to the sky
            dragItem.style.transition = 'transform 3s cubic-bezier(0.25, 1, 0.5, 1), opacity 3s';
            dragItem.style.transform = `translateY(-${height + 200}px) scale(0.2)`;
            dragItem.style.opacity = 0;

            // Spawn first batch of canvas lanterns at the bottom
            for(let i=0; i<30; i++) {
                setTimeout(() => {
                    lanterns.push({
                        x: width/2 + (Math.random()-0.5)*200,
                        y: height + Math.random()*100,
                        s: 10 + Math.random()*15,
                        vy: 1 + Math.random()*2,
                        vx: 0.5 + Math.random()*1.5,
                        offset: Math.random()*100
                    });
                }, Math.random()*2000);
            }

            // Reveal Message Box
            setTimeout(() => {
                const msgBox = document.getElementById('msg-box');
                gsap.to(msgBox, {
                    y: 0, opacity: 1, duration: 2, ease: "power3.out",
                    onComplete: () => msgBox.style.pointerEvents = 'auto'
                });
            }, 1000); // 1 sec after release
            
        } else {
            // Snap back
            dragItem.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            dragItem.style.transform = `translateY(0px) scale(1)`;
            document.getElementById('hint').style.opacity = 1;
        }
        currentY = 0;
    }

    dragItem.addEventListener('touchstart', onถึงuchStart, {passive:false});
    window.addEventListener('touchmove', onถึงuchMove, {passive:false});
    window.addEventListener('touchend', onถึงuchEnd);
    
    // Mouse fallback
    dragItem.addEventListener('mousedown', onถึงuchStart);
    window.addEventListener('mousemove', onถึงuchMove);
    window.addEventListener('mouseup', onถึงuchEnd);
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
