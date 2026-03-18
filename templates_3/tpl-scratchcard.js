export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#2D3748"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Righteous&family=Mali:wght@600&display=swap');
            
            .scratch-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle, #4A5568, #1A202C);
            }

            .hint-text {
                position: absolute; top: 10vh; color: #E2E8F0; font-family: 'Righteous', cursive;
                font-size: 2rem; z-index: 5; text-align: center; width: 100%;
                text-shadow: 0 5px 15px #000; pointer-events:none;
                animation: pulse 2s infinite;
            }
            @keyframes pulse { 0%,100%{opacity:0.7;} 50%{opacity:1;} }

            /* Real Message Underneath */
            .hidden-card {
                position: absolute; width: 340px; height: 500px;
                background: linear-gradient(135deg, #FFD700, #F6AD55);
                border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.8);
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                padding: 30px; box-sizing: border-box; text-align: center;
                border: 8px solid #FFF; z-index: 1;
            }

            .m-head { font-family: 'Righteous', cursive; font-size: 2rem; color: #C05621; margin-bottom: 20px;}
            .m-body { font-family: 'Mali', cursive; font-size: 1.5rem; color: #2D3748; line-height: 1.6; }
            
            /* The scratch canvas on top */
            canvas#scratchCanvas {
                position: absolute; z-index: 10; cursor: pointer;
                border-radius: 20px; /* match card */
            }

            /* Confetti overlay for win */
            .win-overlay {
                position: absolute; inset:0; z-index: 50; pointer-events: none; opacity: 0;
            }

        </style>

        <div class="scratch-scene">
            <div class="hint-text" id="hint">ขูดเพื่อดูข้อความ!</div>

            <!-- The content underneath -->
            <div class="hidden-card" id="card">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-body" style="font-size:1.2rem; margin-top:30px; color:#C05621;">- ${escapeHtml(data.sender)} -</div>
            </div>

            <!-- The silvery scratchable top layer -->
            <canvas id="scratchCanvas"></canvas>
            
            <div class="win-overlay" id="winFx"></div>
        </div>
    `;

    const canvas = document.getElementById('scratchCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const card = document.getElementById('card');
    const hint = document.getElementById('hint');
    const winFx = document.getElementById('winFx');

    // Make canvas same size & pos as card
    const cardRect = card.getBoundingClientRect();
    canvas.width = 340;
    canvas.height = 500;
    
    // Fill canvas with silvery gradient pattern
    function fillCanvas() {
        let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#E2E8F0');
        gradient.addColorStop(0.5, '#A0AEC0');
        gradient.addColorStop(1, '#718096');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add some noise/texture
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        for(let i=0; i<1000; i++) {
            ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 2, 2);
        }

        // Add text on the coating
        ctx.font = 'bold 30px "Righteous"';
        ctx.fillStyle = '#4A5568';
        ctx.textAlign = 'center';
        ctx.fillText('ตั๋วผู้ชนะ', canvas.width/2, canvas.height/2);
        ctx.font = '20px "Righteous"';
        ctx.fillText('ขูดตรงนี้', canvas.width/2, canvas.height/2 + 40);
    }

    fillCanvas();

    let isDrawing = false;
    let isRevealed = false;

    // Set brush
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 40; // Brush size
    ctx.globalCompositeOperation = "destination-out"; // Crucial: draws transparent!

    function getMousePos(e) {
        let rect = canvas.getBoundingClientRect();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function startDraw(e) {
        if(isRevealed) return;
        isDrawing = true;
        hint.style.display = 'none';
        let pos = getMousePos(e);
        ctx.beginPath();
        ctx.moveถึง(pos.x, pos.y);
    }

    function draw(e) {
        if(!isDrawing || isRevealed) return;
        e.preventDefault(); // stop scrolling on mobile
        let pos = getMousePos(e);
        ctx.lineถึง(pos.x, pos.y);
        ctx.stroke();
        
        // Optional: spark effect on finger
        createSpark(e.clientX, e.clientY);

        checkProgress();
    }

    function stopDraw() {
        isDrawing = false;
    }

    // Events
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDraw);

    canvas.addEventListener('touchstart', startDraw, {passive:false});
    canvas.addEventListener('touchmove', draw, {passive:false});
    window.addEventListener('touchend', stopDraw);

    // Minor visual sparks
    function createSpark(x, y) {
        if(Math.random()>0.3) return;
        let p = document.createElement('div');
        p.style.cssText = `position:absolute; width:4px; height:4px; border-radius:50%; background:#FFF; left:${x}px; top:${y}px; z-index:20; box-shadow:0 0 10px #FFF; pointer-events:none;`;
        document.body.appendChild(p);
        gsap.to(p, {
            y: "+=30", x: (Math.random()-0.5)*40, opacity: 0, duration: 0.5, onComplete:()=>p.remove()
        });
    }

    // Check how much is scratched
    // Avoid checking every frame, throttle it
    let checkCounter = 0;
    function checkProgress() {
        checkCounter++;
        if(checkCounter % 10 !== 0) return; // check every 10 strokes

        const pixels = ctx.getImageData(0,0, canvas.width, canvas.height).data;
        let clearPixels = 0;
        
        // Check alpha channel (every 4th value)
        for(let i=3; i<pixels.length; i+=4) {
            if(pixels[i] === 0) clearPixels++;
        }

        const percent = (clearPixels / (pixels.length/4)) * 100;
        
        if(percent > 60) { // If 60% scratched, reveal all
            isRevealed = true;
            gsap.to(canvas, { opacity: 0, duration: 1, onComplete: () => {
                canvas.style.display = 'none';
                triggerWin();
            }});
        }
    }

    function triggerWin() {
        // Flash win
        winFx.style.background = 'radial-gradient(circle, rgba(255,215,0,0.5), transparent)';
        gsap.to(winFx, { opacity: 1, duration: 0.5, yoyo: true, repeat: 3 });
        
        gsap.to(card, { scale: 1.05, duration: 1, ease: 'elastic.out(1, 0.3)' });
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
