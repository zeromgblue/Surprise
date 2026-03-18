export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#0d1117"; // cosmic dark
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
            
            .scene {
                position: relative; width: 350px; height: 350px;
                display: flex; align-items: center; justify-content: center;
            }

            .magic-ball {
                width: 250px; height: 250px; border-radius: 50%;
                background: radial-gradient(circle at 30% 30%, #444 0%, #000 70%);
                box-shadow: inset -20px -20px 40px rgba(255,255,255,0.1), 0 20px 50px rgba(0,0,0,0.8);
                display: flex; align-items: center; justify-content: center;
                cursor: grab; position: relative; z-index: 10;
            }
            .magic-ball:active { cursor: grabbing; }

            .ball-window {
                width: 120px; height: 120px; border-radius: 50%;
                background: radial-gradient(circle, #050522 0%, #000 100%);
                border: 4px solid #111; box-shadow: inset 0 20px 40px rgba(0,0,0,0.9);
                display: flex; align-items: center; justify-content: center;
                overflow: hidden; position: relative;
            }

            .triangle {
                width: 0; height: 0;
                border-left: 45px solid transparent; border-right: 45px solid transparent;
                border-top: 80px solid #1D4ED8; /* Blue fluid */
                opacity: 0; transform: scale(0.5) rotate(0deg);
                display: flex; justify-content: center;
                transition: opacity 2s, transform 2s; position: absolute; z-index: 2;
                filter: drop-shadow(0 0 10px rgba(29, 78, 216, 0.8));
            }
            
            .msg-text-cont {
                position: absolute; top: -65px; left: -35px; width: 70px; height: 60px;
                display: flex; align-items: center; justify-content: center;
                text-align: center; color: white;
                font-family: 'Space Mono', monospace; font-size: 0.6rem; font-weight: bold;
                text-transform: uppercase; line-height: 1.2;
            }

            .hint {
                position: absolute; bottom: -50px; width: 100%; text-align: center;
                color: #fff; font-family: sans-serif; letter-spacing: 3px;
                animation: float 2s infinite alternate; font-size: 0.8rem;
            }
            @keyframes float { 0%{transform:translateY(0);} 100%{transform:translateY(-10px);} }

            .cloud { position: absolute; width: 200%; height: 200%; background: url('https://www.transparenttextures.com/patterns/stardust.png'); opacity: 0.1; animation: spinCloud 60s linear infinite; pointer-events: none;}
            @keyframes spinCloud { 100% {transform: rotate(360deg);} }

            .expanded-msg {
                position: absolute; inset:0; z-index: 50;
                background: rgba(0,0,0,0.9); backdrop-filter: blur(5px);
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none; padding: 40px; text-align: center; color: #fff;
            }
        </style>

        <div class="cloud"></div>

        <div class="expanded-msg" id="fullmsg">
            <div style="font-family:'Space Mono'; font-size:1.5rem; color:#1D4ED8; margin-bottom:20px;">THE ORACLE SAYS...</div>
            <div style="font-family:'Space Mono'; font-size:1.2rem; line-height:1.6;">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
            <div style="font-family:'Space Mono'; font-size:0.9rem; color:#aaa; margin-top:30px;">~ ${escapeHtml(data.sender)}</div>
        </div>

        <div class="scene">
            <div class="magic-ball" id="ball">
                <!-- Highlight reflection overlay -->
                <div style="position:absolute; width:100%; height:100%; border-radius:50%; box-shadow:inset 10px 10px 30px rgba(255,255,255,0.2); pointer-events:none; z-index:20;"></div>
                <div style="position:absolute; top:10%; left:20%; width:60px; height:30px; background:rgba(255,255,255,0.4); border-radius:50%; transform:rotate(-30deg); filter:blur(2px); pointer-events:none; z-index:20;"></div>
                
                <div class="ball-window">
                    <div class="triangle" id="tri">
                        <div class="msg-text-cont">${escapeHtml(data.receiver)}<br>LOOK<br>CLOSER</div>
                    </div>
                </div>
            </div>
            
            <div class="hint" id="hint">เขย่าหรือแตะเพื่อถามคำทำนาย</div>
        </div>
    `;

    const ball = document.getElementById('ball');
    const tri = document.getElementById('tri');
    let revealed = false;

    // Shake logic on click for simplicity (or device motion setup)
    ball.addEventListener('click', triggerShake);

    let shakeCount = 0;
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', (event) => {
            if(revealed) return;
            const threshold = 15;
            if (Math.abs(event.acceleration.x) > threshold || Math.abs(event.acceleration.y) > threshold) {
                shakeCount++;
                if (shakeCount > 5) triggerShake();
            }
        });
    }

    function triggerShake() {
        if(revealed) return;
        revealed = true;
        document.getElementById('hint').style.display = 'none';

        // Animate shake
        gsap.to(ball, { x: 20, rotation: 10, duration: 0.1, yoyo: true, repeat: 10, ease: "rough({strength: 2, points: 20, template: linear, taper: none, randomize: true, clamp: false})" });
        
        // Liquid swirl emulation inside window
        gsap.to('.ball-window', { filter: "blur(5px)", duration: 0.5, yoyo: true, repeat: 1 });

        // Reveal Triangle
        setTimeout(() => {
            tri.style.opacity = 0.9;
            gsap.fromถึง(tri, { scale: 0.1, rotation: 45 }, { scale: 1, rotation: 0, duration: 2, ease: "power2.out" });

            // After showing short message, open the big expanded overlay
            setTimeout(() => {
                const full = document.getElementById('fullmsg');
                gsap.to(full, { opacity: 1, duration: 1, pointerEvents: "auto" });
            }, 3000);
        }, 1200);
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
