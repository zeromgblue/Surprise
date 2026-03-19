export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#8ECAE6"; // Sky blue
    container.style.backgroundImage = "linear-gradient(to bottom, #8ECAE6, #219EBC)";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Mali:wght@400;600&display=swap');
            
            .sky-container {
                position: absolute; inset: 0; overflow: hidden; perspective: 800px;
                display: flex; align-items: center; justify-content: center;
            }
            
            /* Clouds */
            .cloud {
                position: absolute; background: white; border-radius: 50px;
                opacity: 0.6; filter: blur(5px);
            }
            .c1 { width: 200px; height: 60px; top: 10%; left: -200px; animation: drift 30s linear infinite; }
            .c2 { width: 300px; height: 80px; top: 30%; right: -300px; animation: drift-reverse 40s linear infinite; }
            .c3 { width: 150px; height: 50px; bottom: 20%; left: -150px; animation: drift 25s linear infinite; }
            @keyframes drift { to { transform: translateX(calc(100vw + 300px)); } }
            @keyframes drift-reverse { to { transform: translateX(calc(-100vw - 300px)); } }

            /* Origami Canvas */
            #swan-canvas {
                position: relative; z-index: 10; cursor: pointer;
            }

            .paper-letter {
                position: absolute; z-index: 20;
                width: 80%; max-width: 500px; background: #FFFEEA;
                padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                font-family: 'Mali', cursive; color: #333;
                text-align: center; border-radius: 4px;
                transform-origin: center;
                transform: scale(0) rotate(-10deg); opacity: 0; pointer-events: none;
                /* Fold lines */
                background-image: 
                    linear-gradient(to right, transparent 49.5%, rgba(0,0,0,0.05) 50%, transparent 50.5%),
                    linear-gradient(to bottom, transparent 49.5%, rgba(0,0,0,0.05) 50%, transparent 50.5%);
            }
            .pl-name { font-size: 2rem; color: #219EBC; margin-bottom: 20px; font-weight: 600; }
            .pl-msg { font-size: 1.2rem; line-height: 1.8; margin-bottom: 30px; }
            
            .hint {
                position: absolute; bottom: 15%; width: 100%; text-align: center;
                color: rgba(255,255,255,0.9); font-family: sans-serif;
                letter-spacing: 2px; text-transform: uppercase;
                animation: floatUp 2s infinite alternate; font-size: 0.9rem;
            }
            @keyframes floatUp { 0%{transform:translateY(0);} 100%{transform:translateY(-10px);} }
        </style>

        <div class="sky-container">
            <div class="cloud c1"></div><div class="cloud c2"></div><div class="cloud c3"></div>
            
            <canvas id="swan-canvas" width="300" height="300"></canvas>
            
            <div class="paper-letter" id="letter">
                <div class="pl-name">ถึง ${escapeHtml(data.receiver)}</div>
                <div class="pl-msg">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div style="text-align: right; font-weight: 600;">— ${escapeHtml(data.sender)}</div>
            </div>

            <div class="hint" id="hint">แตะเพื่อคลี่ออก</div>
        </div>
    `;

    // Canvas drawing physics for Origami Swan
    const canvas = document.getElementById('swan-canvas');
    const ctx = canvas.getContext('2d');
    let frame = 0;
    
    // We'll draw vector polygons for the swan and animate their vertices slightly
    // to simulate floating.
    let isUnfolding = false;
    let unfoldProgress = 0;

    function drawPolygon(points, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveถึง(points[0].x, points[0].y);
        for(let i=1; i<points.length; i++) ctx.lineถึง(points[i].x, points[i].y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.05)";
        ctx.stroke();
    }

    function renderSwan() {
        if(unfoldProgress >= 1) return; // Stop drawing swan when fully unfolded
        
        ctx.clearRect(0,0,300,300);
        
        const floatY = Math.sin(frame*0.05)*10;
        const wingFlap = Math.sin(frame*0.1)*10;
        
        ctx.save();
        ctx.translate(150, 150 + floatY);
        
        // As it unfolds, scale it down and rotate
        ctx.scale(1 - unfoldProgress*0.8, 1 - unfoldProgress*0.8);
        ctx.rotate(unfoldProgress * Math.PI);
        
        // Base coordinate multiplier to expand as paper
        const m = 1 + unfoldProgress * 2;
        
        // Back Wing
        drawPolygon([
            {x: 0, y: -20}, 
            {x: 60*m, y: -70 - wingFlap}, 
            {x: 80, y: 10}
        ], "#e0e4e8");

        // Body
        drawPolygon([
            {x: -60*m, y: -20}, 
            {x: 0, y: 30*m}, 
            {x: 80*m, y: 10}, 
            {x: 0, y: -20}
        ], "#f8f9fa");
        
        // Front Wing
        drawPolygon([
            {x: 0, y: -20}, 
            {x: 50*m, y: -90 + wingFlap}, 
            {x: 60, y: 20}
        ], "#ffffff");

        // Neck & Head
        drawPolygon([
            {x: -60*m, y: -20}, 
            {x: -80, y: -80*m}, 
            {x: -40, y: -30}
        ], "#f1f3f5");
        
        // Beak
        drawPolygon([
            {x: -80, y: -80*m}, 
            {x: -110*m, y: -70}, 
            {x: -70, y: -65}
        ], "#e9ecef");

        ctx.restore();

        frame++;
        requestAnimationFrame(renderSwan);
    }
    renderSwan();

    // Interaction
    canvas.addEventListener('click', () => {
        if(isUnfolding) return;
        isUnfolding = true;
        
        document.getElementById('hint').remove();

        // Animate unfoldProgress to 1
        const obj = { p: 0 };
        gsap.to(obj, {
            p: 1, duration: 1, ease: "power2.in",
            onUpdate: () => { unfoldProgress = obj.p; },
            onComplete: () => {
                canvas.style.display = 'none'; // hide canvas
                // Show the Letter
                const letter = document.getElementById('letter');
                gsap.to(letter, {
                    scale: 1, rotation: 0, opacity: 1, duration: 1.5, ease: "back.out(1.2)",
                    onComplete: () => letter.style.pointerEvents = 'auto'
                });
            }
        });
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
