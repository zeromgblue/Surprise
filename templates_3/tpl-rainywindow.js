export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#0B132B";
    // Realistic window view behind glass
    container.style.backgroundImage = "url('https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')";
    container.style.backgroundSize = "cover";
    container.style.backgroundPosition = "center";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Thasadith:wght@400;700&display=swap');
            
            /* Message layer (appears under the foggy glass) */
            .msg-under-glass {
                position: absolute; width: 80%; max-width: 500px; text-align: center;
                color: #fff; font-family: 'Thasadith', sans-serif;
                text-shadow: 0 2px 10px rgba(0,0,0,0.8); z-index: 5;
            }
            .msg-title { font-size: 2rem; font-weight: 700; margin-bottom: 10px; }
            .msg-desc { font-size: 1.2rem; line-height: 1.6; }

            /* Fog Canvas on top */
            #fog-canvas {
                position: absolute; top:0; left:0; width:100%; height:100%; z-index: 10;
                touch-action: none; cursor: pointer;
            }

            .hint-msg {
                position: absolute; bottom: 10%; width: 100%; text-align: center; z-index: 15;
                color: #fff; font-family: sans-serif; letter-spacing: 2px; pointer-events: none;
                text-transform: uppercase; animation: fadeBlink 2s infinite; text-shadow: 0 0 5px black;
            }
            @keyframes fadeBlink { 0%,100%{opacity:0.3;} 50%{opacity:1;} }
        </style>

        <div class="msg-under-glass">
            <div class="msg-title">${escapeHtml(data.receiver)}</div>
            <div class="msg-desc">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
            <div style="margin-top:20px; font-size: 0.9rem;">— ${escapeHtml(data.sender)}</div>
        </div>

        <canvas id="fog-canvas"></canvas>
        <div class="hint-msg" id="hint">เช็ดกระจก</div>
    `;

    const canvas = document.getElementById('fog-canvas');
    const ctx = canvas.getContext('2d');
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawFog();
    }
    window.addEventListener('resize', resize);
    
    // Draw the foggy window base
    function drawFog() {
        ctx.fillStyle = "rgba(180, 200, 220, 0.85)"; // Fog color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some raindrop blurs
        for(let i=0; i<100; i++) {
            ctx.beginPath();
            ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*15+5, 0, Math.PI*2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            ctx.fill();
        }

        ctx.globalCompositeOperation = "destination-out"; // Important for erasing
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
    }
    
    resize();

    let isDrawing = false;
    let lastX = 0, lastY = 0;
    let clearedCount = 0;
    
    function getPos(e) {
        return {
            x: e.clientX || (e.touches && e.touches[0].clientX) || 0,
            y: e.clientY || (e.touches && e.touches[0].clientY) || 0
        };
    }

    function startDraw(e) {
        isDrawing = true;
        const p = getPos(e);
        lastX = p.x; lastY = p.y;
        document.getElementById('hint').style.display = 'none';
        
        // Draw one drop immediately
        ctx.beginPath();
        ctx.arc(lastX, lastY, 40, 0, Math.PI*2);
        ctx.fill();
    }

    function moveDraw(e) {
        if(!isDrawing) return;
        e.preventDefault();
        const p = getPos(e);
        
        ctx.lineWidth = 80; // Finger thickness
        ctx.beginPath();
        ctx.moveถึง(lastX, lastY);
        ctx.lineถึง(p.x, p.y);
        ctx.stroke();

        // Simulate water dripping down from wipe path occasionally
        if(Math.random() > 0.8) {
            drip(p.x, p.y);
        }

        lastX = p.x; lastY = p.y;
        clearedCount++;
        
        if(clearedCount > 100) {
            // Once they wiped enough, slowly fade the rest of the fog (optional)
            canvas.style.transition = "opacity 3s";
            canvas.style.opacity = 0;
            setTimeout(() => { canvas.remove(); }, 3000);
            clearedCount = -9999; // prevent retrigger
        }
    }

    function drip(x, y) {
        // Water drop sliding down
        const drop = document.createElement('div');
        drop.style.cssText = `position:absolute; left:${x}px; top:${y}px; width:4px; height:4px; 
        background:rgba(255,255,255,0.5); border-radius:50%; box-shadow:0 5px 10px rgba(0,0,0,0.3); pointer-events:none; z-index:20;`;
        container.appendChild(drop);
        
        gsap.to(drop, {
            y: "+=" + (100 + Math.random()*200),
            height: 15, // stretched slightly
            opacity: 0,
            duration: 1 + Math.random(),
            ease: "power1.in",
            onComplete: () => drop.remove()
        });
    }

    function endDraw() { isDrawing = false; }

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
