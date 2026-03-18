export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#CF5C36"; // Mars surface color
    container.style.backgroundImage = "radial-gradient(circle at top, #EFC3A4 0%, #B7410E 60%, #5E1F03 100%)";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
            
            #mars-canvas { position: absolute; inset:0; z-index:1; }
            
            .rover-ui {
                position: absolute; inset: 0; z-index: 10; pointer-events: none;
                box-shadow: inset 0 0 100px rgba(0,0,0,0.8);
            }
            .crosshair {
                position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                width: 50px; height: 50px; border: 1px solid rgba(255,255,255,0.3); border-radius: 50%;
            }
            .crosshair::before, .crosshair::after { content:''; position:absolute; background:rgba(255,255,255,0.5); }
            .crosshair::before { top: 50%; left: -10px; width: 70px; height: 1px; }
            .crosshair::after { left: 50%; top: -10px; width: 1px; height: 70px; }

            .rec {
                position: absolute; top: 20px; right: 20px; color: red;
                font-family: 'Share Tech Mono', monospace; font-size: 1.2rem;
                display:flex; align-items:center; gap: 10px; text-shadow: 0 0 5px red;
            }
            .rec-dot { width: 12px; height: 12px; background: red; border-radius: 50%; animation: blink 1s infinite; }
            @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }

            .msg-panel {
                position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
                background: rgba(0,0,0,0.7); border: 1px solid #B7410E; border-left: 5px solid #EFC3A4;
                padding: 20px; width: 85%; max-width: 400px;
                color: #fff; font-family: 'Share Tech Mono', monospace; font-size: 1rem;
                opacity: 0; z-index: 20; box-shadow: 0 10px 30px rgba(0,0,0,0.5); pointer-events: auto;
            }

            .btn-start {
                position: absolute; bottom: 100px; left: 50%; transform: translateX(-50%);
                padding: 15px 30px; background: rgba(0,0,0,0.5); border: 2px solid #EFC3A4;
                color: #EFC3A4; font-family: 'Share Tech Mono', monospace; font-size: 1.2rem; cursor: pointer;
                pointer-events: auto; transition: 0.2s;
            }
            .btn-start:hover { background: #EFC3A4; color: #000; }
        </style>

        <canvas id="mars-canvas"></canvas>

        <div class="rover-ui">
            <div class="rec"><div class="rec-dot"></div> TRANSMITTING</div>
            <div class="crosshair"></div>
            
            <button class="btn-start" id="btn">DEPLOY ROVER</button>

            <div class="msg-panel" id="msgPanel">
                <div style="color: #EFC3A4; margin-bottom: 10px; font-weight:bold;">> SURVIVOR LOCATED: ${escapeHtml(data.receiver)}</div>
                <div id="typewriterText"></div>
                <div style="color: #888; margin-top: 15px; font-size:0.8rem;">> SENDER I.D.: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    // Canvas Mars Surface and Rover tracks
    const canvas = document.getElementById('mars-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Draw rough rocks/craters background once
    function drawMars() {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        for(let i=0; i<50; i++) {
            ctx.beginPath();
            ctx.ellipse(Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*40+10, Math.random()*20+5, 0, 0, Math.PI*2);
            ctx.fill();
        }
    }
    drawMars();

    let rover = { x: -50, y: canvas.height/2, size: 40 };

    const btn = document.getElementById('btn');
    const panel = document.getElementById('msgPanel');
    const txtBox = document.getElementById('typewriterText');
    const rawTxt = data.message;
    
    let drawingTrack = false;

    // Draw tread tracks
    function drawTread(x, y) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        // Draw two line blocks per frame for left/right wheels
        ctx.fillRect(x, y - 15, 6, 8);
        ctx.fillRect(x, y + 15, 6, 8);
    }

    let trackInterval;

    btn.addEventListener('click', () => {
        btn.style.display = 'none';
        
        // Move rover across screen
        gsap.to(rover, {
            x: canvas.width + 50,
            duration: 4,
            ease: "linear",
            onStart: () => {
                trackInterval = setInterval(()=> {
                    drawTread(rover.x, rover.y);
                }, 50); // Drop tracks
            },
            onComplete: () => {
                clearInterval(trackInterval);
                // Reveal msg panel
                gsap.to(panel, { opacity: 1, bottom: 50, Math: "power2.out", duration: 0.5 });
                
                // Typewriter effect
                let i = 0;
                txtBox.innerHTML = '';
                let typeInt = setInterval(() => {
                    if(i < rawTxt.length) {
                        txtBox.innerHTML += rawTxt.charAt(i) === '\n' ? '<br>' : rawTxt.charAt(i);
                        i++;
                    } else {
                        clearInterval(typeInt);
                    }
                }, 50);
            }
        });
        
        // Sim Camera shake
        gsap.to('.rover-ui', { x: 2, y: 1, duration: 0.1, yoyo: true, repeat: 40 });
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
