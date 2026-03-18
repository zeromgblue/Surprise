export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#05000a"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const color1 = config.from || '#D90429';
    const color2 = config.to || '#EF233C';

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;600&display=swap');
            #thread-canvas { position: absolute; top:0; left:0; width:100%; height:100%; z-index: 10; touch-action: none; }
            
            .msg-layer {
                position: absolute; z-index: 5; text-align: center; color: white;
                font-family: 'Sarabun', sans-serif; max-width: 600px; padding: 20px;
                opacity: 0; transform: scale(0.9); pointer-events: none;
            }
            .msg-to { font-size: 1.8rem; font-weight: 600; color: #fff; margin-bottom: 20px; text-shadow: 0 0 20px ${color1}; }
            .msg-text { font-size: 1.2rem; line-height: 1.8; margin-bottom: 30px; font-weight: 300; color: #eee; }
            .msg-from { font-size: 1rem; opacity: 0.8; letter-spacing: 1px; }

            .hint {
                position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%);
                color: rgba(255,100,100,0.8); font-family: sans-serif; font-size: 0.9rem;
                letter-spacing: 2px; text-transform: uppercase; z-index: 15;
                pointer-events: none; animation: pulseHint 2s infinite; text-align: center;
            }
            @keyframes pulseHint { 0%,100%{opacity:0.3;} 50%{opacity:1;} }
        </style>
        
        <canvas id="thread-canvas"></canvas>
        <div class="hint" id="hint-text">ลากด้ายแดงไปที่ตรงกลาง</div>

        <div class="msg-layer" id="msg-box">
            <div class="msg-to">${escapeHtml(data.receiver)}</div>
            <div class="msg-text">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
            <div class="msg-from">— ${escapeHtml(data.sender)} —</div>
        </div>
    `;

    const canvas = document.getElementById('thread-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    
    // Nodes
    let targetNode = { x: 0, y: 0, r: 15, glow: 0 };
    let startNode = { x: 0, y: 0 };
    let dragNode = { x: 0, y: 0, r: 20, isDragging: false };
    let isConnected = false;
    let heartProgress = 0; // For drawing heart line

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        targetNode.x = width / 2;
        targetNode.y = height / 2 - 50;
        
        if(!isConnected && !dragNode.isDragging) {
            startNode.x = width / 2;
            startNode.y = height + 100; // anchor point outside screen
            dragNode.x = width / 2;
            dragNode.y = height - 150;
        }
    }
    window.addEventListener('resize', resize);
    resize();

    // Heart path generator
    function getHeartPoint(t, scale, offsetX, offsetY) {
        // Parametric equation of a heart
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        return { x: x * scale + offsetX, y: y * scale + offsetY };
    }

    function renderFrame() {
        ctx.clearRect(0,0,width,height);
        
        if (!isConnected) {
            // Draw Target Node (Glow)
            targetNode.glow += 0.05;
            const glowRadius = targetNode.r + Math.sin(targetNode.glow)*5;
            ctx.beginPath();
            ctx.arc(targetNode.x, targetNode.y, glowRadius*2, 0, Math.PI*2);
            ctx.fillStyle = `rgba(239, 35, 60, 0.2)`;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(targetNode.x, targetNode.y, targetNode.r, 0, Math.PI*2);
            ctx.fillStyle = "#fff";
            ctx.shadowColor = color1;
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.shadowBlur = 0; // reset

            // Draw Thread (Bezier curve from bottom to drag point)
            ctx.beginPath();
            ctx.moveถึง(startNode.x, startNode.y);
            ctx.quadraticCurveถึง(width/2, (startNode.y + dragNode.y)/2 + (dragNode.x - width/2)*0.5, dragNode.x, dragNode.y); // Dynamic curve
            
            ctx.strokeStyle = color2;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.shadowColor = color1;
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Draw Drag Node
            ctx.beginPath();
            ctx.arc(dragNode.x, dragNode.y, dragNode.r, 0, Math.PI*2);
            ctx.fillStyle = dragNode.isDragging ? color1 : "#fff";
            ctx.fill();
            
        } else {
            // Connected! Draw Heart
            const maxT = Math.PI * 2 * heartProgress;
            if (heartProgress > 0) {
                ctx.beginPath();
                for (let t = 0; t <= maxT; t += 0.05) {
                    const p = getHeartPoint(t, 12 + (heartProgress*2), width/2, height/2 - 50);
                    if (t === 0) ctx.moveถึง(p.x, p.y);
                    else ctx.lineถึง(p.x, p.y);
                }
                ctx.strokeStyle = color1;
                ctx.lineWidth = 6;
                ctx.shadowColor = color2;
                ctx.shadowBlur = 20 + Math.sin(Date.now()*0.005)*10;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }
        
        requestAnimationFrame(renderFrame);
    }
    renderFrame();

    // Interaction
    function getDist(x1, y1, x2, y2) { return Math.hypot(x2-x1, y2-y1); }

    function onStart(e) {
        if (isConnected) return;
        const x = e.clientX || e.touches[0].clientX;
        const y = e.clientY || e.touches[0].clientY;
        if (getDist(x, y, dragNode.x, dragNode.y) < 50) {
            dragNode.isDragging = true;
            document.getElementById('hint-text').style.opacity = 0;
        }
    }

    function onMove(e) {
        if (!dragNode.isDragging || isConnected) return;
        const x = e.clientX || e.touches[0].clientX;
        const y = e.clientY || e.touches[0].clientY;
        dragNode.x = x; 
        dragNode.y = y;

        // Check if close to target
        if (getDist(dragNode.x, dragNode.y, targetNode.x, targetNode.y) < 40) {
            connect();
        }
    }

    function onEnd() {
        if (!dragNode.isDragging || isConnected) return;
        dragNode.isDragging = false;
        // Snap back if not connected
        gsap.to(dragNode, { x: width/2, y: height - 150, duration: 0.5, ease: "elastic.out(1, 0.5)" });
        document.getElementById('hint-text').style.opacity = 1;
    }

    canvas.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    canvas.addEventListener('touchstart', onStart, {passive:false});
    window.addEventListener('touchmove', onMove, {passive:false});
    window.addEventListener('touchend', onEnd);

    // Connection Sequence
    function connect() {
        isConnected = true;
        dragNode.isDragging = false;
        document.getElementById('hint-text').remove();

        // Flash screen logic using canvas overlay technically or CSS? Let's use CSS on container
        const flash = document.createElement('div');
        flash.style.cssText = `position:absolute;inset:0;background:white;z-index:20;opacity:0;pointer-events:none;`;
        container.appendChild(flash);

        const tl = gsap.timeline();
        tl.to(flash, { opacity: 1, duration: 0.1 })
          .to(flash, { opacity: 0, duration: 1 })
          .to(() => heartProgress, { 
              duration: 2, ease: "power2.out", 
              onUpdate: function() { heartProgress = this.targets()[0]; }
          }, "-=0.8")
          .to('#msg-box', { opacity: 1, scale: 1, duration: 1.5, ease: "power3.out" }, "-=1");
          
        heartProgress = 0;
        const obj = { v: 0 };
        gsap.to(obj, { v: 1, duration: 2, ease:"power2.out", onUpdate: () => heartProgress = obj.v, delay: 0.2 });
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
