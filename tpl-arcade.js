export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#0A0A0A";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const colorPink = config.from || '#FF007F';
    const colorPurple = config.to || '#7900FF';

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Prompt:wght@400;600&display=swap');
            
            .arcade-machine {
                position: relative; width: 100%; max-width: 400px; height: 80vh;
                background: #111; border: 4px solid #333; border-radius: 20px 20px 0 0;
                box-shadow: 0 0 50px rgba(0,0,0,0.8), inset 0 0 20px #000;
                display: flex; flex-direction: column; align-items: center;
                overflow: hidden;
            }

            .marquee {
                width: 100%; height: 80px; background: linear-gradient(90deg, ${colorPurple}, ${colorPink});
                display: flex; align-items: center; justify-content: center;
                border-bottom: 4px solid #222; box-shadow: inset 0 -5px 15px rgba(0,0,0,0.5);
            }
            .marquee-text {
                font-family: 'Press Start 2P', cursive; color: #fff; font-size: 1.2rem;
                text-shadow: 2px 2px 0px #000, 0 0 10px #fff; letter-spacing: 2px;
            }

            .screen-bezel {
                width: 90%; height: 60%; background: #050505; border-radius: 20px;
                margin-top: 20px; border: 15px solid #222; position: relative;
                box-shadow: inset 0 0 30px rgba(0,0,0,1);
            }

            .screen-content {
                position: absolute; inset:0; background: #000;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                color: #fff; font-family: 'Press Start 2P', cursive; text-align: center;
                padding: 10px; box-sizing: border-box; overflow: hidden;
                /* CRT scanlines */
                background-image: linear-gradient(rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.2) 50%);
                background-size: 100% 4px;
            }

            .insert-coin { color: ${colorPink}; font-size: 0.9rem; animation: blink 1s steps(2, start) infinite; line-height: 1.5; }
            @keyframes blink { to { visibility: hidden; } }

            .control-panel {
                width: 100%; flex-grow: 1; background: #1a1a1a; margin-top: 20px;
                border-top: 4px solid #333; display: flex; align-items: center; justify-content: center;
                perspective: 300px;
            }
            .panel-surface {
                width: 90%; height: 80%; background: linear-gradient(#222, #111);
                transform: rotateX(20deg); border-radius: 10px; border: 2px solid #444;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 10px 20px rgba(0,0,0,0.8);
            }

            .start-btn {
                width: 80px; height: 80px; background: radial-gradient(circle at center, #ff3333 0%, #a00 100%);
                border-radius: 50%; border: 4px solid #500;
                box-shadow: 0 10px 0 #500, 0 15px 20px rgba(0,0,0,0.5), inset 0 5px 10px rgba(255,100,100,0.5);
                cursor: pointer; position: relative; transition: all 0.1s;
                display: flex; align-items: center; justify-content: center;
            }
            .start-btn:active {
                transform: translateY(10px); box-shadow: 0 0px 0 #500, 0 5px 10px rgba(0,0,0,0.5), inset 0 5px 10px rgba(255,100,100,0.5);
            }
            .start-btn span { font-family: sans-serif; font-size: 0.7rem; font-weight: bold; color: rgba(255,255,255,0.8); margin-top: 110px; letter-spacing: 2px;}

            /* Hidden msg elements */
            .msg-data { display: none; }
            #screen-msg { display: none; font-family: 'Prompt', sans-serif; font-size: 1.1rem; text-shadow: none; font-weight: 500;}
            #screen-title { color: #FFD700; font-size: 0.9rem; margin-bottom: 15px;}
            
            /* Pixel explosion canvas */
            #pixel-canvas { position: absolute; inset:0; z-index: 5; pointer-events:none; }
        </style>

        <div class="arcade-machine">
            <div class="marquee"><div class="marquee-text">SURPRISE</div></div>
            
            <div class="screen-bezel">
                <canvas id="pixel-canvas"></canvas>
                <div class="screen-content" id="screen">
                    <div id="intro-layer">
                        <div style="color:#0FF; margin-bottom:20px; font-size:1.5rem;">READY?</div>
                        <div class="insert-coin">INSERT COIN<br><br>OR PRESS START</div>
                    </div>
                    
                    <div id="msg-layer" style="display:none; z-index: 10; padding:10px;">
                        <div id="screen-title">P1: ${escapeHtml(data.receiver)}</div>
                        <div id="screen-msg">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                        <div style="font-size: 0.7rem; color: #888; margin-top:20px;">CREDIT: ${escapeHtml(data.sender)}</div>
                    </div>
                </div>
            </div>

            <div class="control-panel">
                <div class="panel-surface">
                    <div class="start-btn" id="btn-start">
                        <span>START</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    const btn = document.getElementById('btn-start');
    const screen = document.getElementById('screen');
    const intro = document.getElementById('intro-layer');
    const msgLayer = document.getElementById('msg-layer');
    const canvas = document.getElementById('pixel-canvas');
    const ctx = canvas.getContext('2d');
    
    let isStarted = false;

    // Set canvas internal resolution low for blocky pixel effect
    canvas.width = 100; 
    canvas.height = 100;

    let particles = [];
    function renderPixels() {
        ctx.clearRect(0,0,100,100);
        particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy; p.a -= 0.05;
            ctx.fillStyle = `rgba(${p.c}, ${p.a})`;
            ctx.fillRect(p.x, p.y, p.s, p.s);
            if(p.a <= 0) particles.splice(i, 1);
        });
        if(particles.length > 0) requestAnimationFrame(renderPixels);
    }

    btn.addEventListener('click', () => {
        if(isStarted) return;
        isStarted = true;

        // Flash screen white
        gsap.to(screen, { backgroundColor: '#fff', duration: 0.1, yoyo: true, repeat: 1, onComplete: () => {
            screen.style.backgroundColor = '#000';
            intro.style.display = 'none';
            msgLayer.style.display = 'block';
            
            // Pixel Explosion from middle
            const colors = ['255,0,127', '121,0,255', '0,255,255', '255,255,0'];
            for(let i=0; i<50; i++) {
                particles.push({
                    x: 50, y: 50, s: Math.random()*4+2, // blocky size
                    vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10,
                    a: 1.5, c: colors[Math.floor(Math.random()*colors.length)]
                });
            }
            renderPixels();

            // Typewriter effect for prompt font msg
            const txtObj = document.getElementById('screen-msg');
            txtObj.style.display = 'block';
            const fullHtml = txtObj.innerHTML;
            txtObj.innerHTML = '';
            
            // Just fade in the whole layer nicely simulating old screen fade up
            gsap.from('#msg-layer', { opacity: 0, scale: 0.5, duration: 1, ease: "steps(10)", delay: 0.2 });
        }});
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
