export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#2a2a2a";
    // Wood texture background
    container.style.backgroundImage = `url('https://www.transparenttextures.com/patterns/wood-pattern.png')`;
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=IBM+Plex+Sans+Thai:wght@400;600&display=swap');
            
            .polaroid-frame {
                -webkit-box-sizing: border-box; box-sizing: border-box;
                background: #fff;
                width: 320px;
                padding: 15px 15px 60px 15px;
                box-shadow: 0 15px 35px rgba(0,0,0,0.4);
                transform: translateY(-500px) rotate(10deg);
                position: relative; z-index: 10;
                border-radius: 2px;
                /* Add a subtle glare */
            }
            .polaroid-frame::after {
                content:''; position: absolute; inset:0;
                background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%);
                pointer-events: none; border-radius: 2px;
            }

            .photo-area {
                width: 100%; height: 300px; background: #333; position: relative; overflow: hidden;
                border: 1px solid #ddd;
            }
            .photo-content {
                position: absolute; inset:0; background: #e0e0e0;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                padding: 20px; text-align: center; color: #333;
                background-image: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);
            }
            .photo-name { font-family: 'IBM Plex Sans Thai', sans-serif; font-size: 1.5rem; font-weight: 600; color: #E0A96D; margin-bottom: 10px; }
            .photo-msg { font-family: 'IBM Plex Sans Thai', sans-serif; font-size: 1rem; line-height: 1.6; }

            /* Black layer over photo */
            #scratch-canvas {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                z-index: 5; cursor: pointer; touch-action: none;
            }

            .polaroid-caption {
                position: absolute; bottom: 20px; left: 0; width: 100%;
                text-align: center; font-family: 'Caveat', cursive;
                font-size: 1.8rem; color: #222; transform: rotate(-2deg);
            }

            .hint-layer {
                position: absolute; inset:0; z-index: 15; pointer-events: none;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                padding-bottom: 15vh; color: #fff; font-family: sans-serif;
                text-shadow: 0 2px 10px rgba(0,0,0,0.8);
                transition: opacity 0.5s;
            }
            .hint-layer .material-symbols-rounded { font-size: 4rem; animation: rubAnim 2s infinite; }
            @keyframes rubAnim {
                0%,100% { transform: translateX(-30px); }
                50% { transform: translateX(30px); }
            }
        </style>

        <div class="hint-layer" id="hint-layer">
            <span class="material-symbols-rounded">waving_hand</span>
            <div style="letter-spacing: 2px; font-size: 1rem; text-transform: uppercase; margin-top:10px;">Rub the photo to develop</div>
        </div>

        <div class="polaroid-frame" id="polaroid">
            <div class="photo-area">
                <div class="photo-content">
                    <div class="photo-name">${escapeHtml(data.receiver)}</div>
                    <div class="photo-msg">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                </div>
                <!-- Scratch Canvas -->
                <canvas id="scratch-canvas"></canvas>
            </div>
            <div class="polaroid-caption">Memory with ${escapeHtml(data.sender)}</div>
        </div>
    `;

    // Drop In Animation
    const polaroid = document.getElementById('polaroid');
    gsap.to(polaroid, { y: 0, rotation: -5, duration: 1.5, ease: "bounce.out" });

    // Scratch Card Logic
    const canvas = document.getElementById('scratch-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas internal resolution to match element size exactly
    // since it's 290x300 inside polaroid padding
    canvas.width = 290;
    canvas.height = 300;

    // Fill with solid dark color (undeveloped film)
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Setup composite operation to "erase"
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 40;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let isDrawing = false;
    let lastX = 0; let lastY = 0;
    let revealedPixels = 0;
    const totalPixels = canvas.width * canvas.height;
    let isFullyRevealed = false;

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
        
        // Account for CSS transform rotation on parent!
        // This is a rough estimation since matrix transform inverse is complex here.
        // We will just use bounding box mapping which is "close enough" for rubbing.
        return {
            x: (clientX - rect.left) / (rect.right - rect.left) * canvas.width,
            y: (clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
        };
    }

    function startDraw(e) {
        if(isFullyRevealed) return;
        isDrawing = true;
        const pos = getMousePos(e);
        lastX = pos.x; lastY = pos.y;
        document.getElementById('hint-layer').style.opacity = 0;
    }

    function moveDraw(e) {
        if(!isDrawing || isFullyRevealed) return;
        e.preventDefault(); // prevent scrolling
        const pos = getMousePos(e);
        
        ctx.beginPath();
        ctx.moveถึง(lastX, lastY);
        ctx.lineถึง(pos.x, pos.y);
        ctx.stroke();
        
        // Add random scatter dots for realistic photo chemical effect
        for(let i=0; i<3; i++) {
            ctx.beginPath();
            ctx.arc(pos.x + (Math.random()-0.5)*30, pos.y + (Math.random()-0.5)*30, Math.random()*20, 0, Math.PI*2);
            ctx.fill();
        }

        lastX = pos.x; lastY = pos.y;

        // Check clear percentage occasionally
        if(Math.random() > 0.9) checkReveal();
    }

    function endDraw() {
        isDrawing = false;
        if(!isFullyRevealed) {
            checkReveal();
            if(revealedPixels < 0.4) {
                 // show hint again if they barely rubbed
                 document.getElementById('hint-layer').style.opacity = 1;
            }
        }
    }

    function checkReveal() {
        if(isFullyRevealed) return;
        // Check pixel data
        const imageData = ctx.getImageData(0,0,canvas.width, canvas.height);
        let clearCount = 0;
        // Check every 4th pixel (alpha channel) in steps to save CPU
        for(let i=3; i<imageData.data.length; i+=16) {
            if(imageData.data[i] === 0) clearCount++;
        }
        
        const percent = clearCount / (imageData.data.length / 16);
        revealedPixels = percent;

        if(percent > 0.6) {
            // Unveil fully!
            isFullyRevealed = true;
            document.getElementById('hint-layer').remove();
            
            // Fade canvas out completely
            gsap.to(canvas, { opacity: 0, duration: 1, onComplete: () => canvas.remove() });
            
            // Final pop animation on polaroid
            gsap.to(polaroid, { scale: 1.1, rotation: 0, duration: 0.5, ease: "back.out(1.5)" });
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
