export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#02111b"; // Dark deep sea
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;1,300&display=swap');
            
            #ripple-canvas {
                position: absolute; inset:0; z-index: 5; pointer-events: none;
            }

            .water-surface {
                position: absolute; inset:0; z-index: 10;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                cursor: pointer;
            }

            .tear-drop {
                position: absolute; top: -50px; left: 50%; transform: translateX(-50%);
                width: 20px; height: 20px; background: #8ECAE6;
                border-radius: 0 50% 50% 50%; transform: translateX(-50%) rotate(45deg);
                box-shadow: inset 2px 2px 5px rgba(255,255,255,0.8), inset -2px -2px 5px rgba(0,0,0,0.2);
                opacity: 0; pointer-events: none; z-index: 15;
            }

            .msg-text {
                font-family: 'Sarabun', sans-serif; font-size: 1.2rem; line-height: 1.8; font-weight: 300;
                color: #BDE0FE; text-align: center; max-width: 80%; padding: 40px;
                opacity: 0; text-shadow: 0 5px 15px rgba(0,0,0,0.8);
                /* Add a subtle wave filter using CSS if possible, but GSAP takes care of it nicely */
            }
            .msg-text i { color: #8ECAE6; font-size: 1.5rem; margin-bottom: 20px; display: block;}

            .hint {
                position: absolute; bottom: 10%; width: 100%; text-align: center;
                color: rgba(142, 202, 230, 0.5); font-family: sans-serif; letter-spacing: 2px;
                pointer-events: none; font-size: 0.9rem; animation: p 2s infinite;
            }
            @keyframes p { 0%,100%{opacity:0.3;} 50%{opacity:1;} }
        </style>

        <canvas id="ripple-canvas"></canvas>

        <div class="tear-drop" id="drop"></div>

        <div class="water-surface" id="surface">
            <div class="msg-text" id="msg">
                <i>ถึง ${escapeHtml(data.receiver)}</i>
                ${escapeHtml(data.message).replace(/\n/g, '<br>')}
                <br><br><span style="opacity:0.6; font-size:0.9rem;">— ${escapeHtml(data.sender)}</span>
            </div>
            <div class="hint" id="hint">แตะเพื่อหยดน้ำตา</div>
        </div>
    `;

    const canvas = document.getElementById('ripple-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();

    let ripples = [];

    function drawRipples() {
        ctx.clearRect(0,0,width,height);
        
        // Base dark water gradient occasionally pulsating? No just pure black/blue
        
        ripples.forEach((r, i) => {
            r.radius += r.speed;
            r.alpha -= 0.01;
            
            if(r.alpha <= 0) { ripples.splice(i, 1); return; }

            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI*2);
            ctx.strokeStyle = `rgba(142, 202, 230, ${r.alpha})`;
            ctx.lineWidth = 2 + (r.alpha * 4);
            ctx.stroke();
        });

        requestAnimationFrame(drawRipples);
    }
    drawRipples();

    const surface = document.getElementById('surface');
    let clicked = false;

    surface.addEventListener('click', (e) => {
        if(clicked) return;
        clicked = true;
        document.getElementById('hint').style.display = 'none';

        const drop = document.getElementById('drop');
        const cx = width/2;
        const cy = height/2;

        // Position drop at top mid
        // Fall down animation
        gsap.to(drop, {
            y: cy + 50, opacity: 1, duration: 0.8, ease: "power2.in",
            onComplete: () => {
                drop.style.display = 'none'; // hit surface
                
                // Add big ripples
                ripples.push({x: cx, y: cy, radius: 10, speed: 4, alpha: 0.8});
                setTimeout(()=> ripples.push({x: cx, y: cy, radius: 10, speed: 3.5, alpha: 0.6}), 200);
                setTimeout(()=> ripples.push({x: cx, y: cy, radius: 10, speed: 3, alpha: 0.4}), 400);

                // Reveal text with a "wave" distort effect
                const msg = document.getElementById('msg');
                msg.style.opacity = 1;
                
                // Animate text shaking/blurring a bit to simulate water
                gsap.fromถึง(msg, 
                    { filter: "blur(10px)", y: 20 },
                    { filter: "blur(0px)", y: 0, duration: 2, ease: "power2.out" }
                );
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
