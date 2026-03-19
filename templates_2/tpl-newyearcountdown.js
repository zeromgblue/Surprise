export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#fff"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Monoton&family=Prompt:wght@400;700&display=swap');
            
            .ny-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle, #1e293b, #020617);
                perspective: 1000px;
            }

            /* Golden 3D Mirror Ball */
            .ball-wrapper {
                position: absolute; top: -300px; /* Hidden initially */
                width: 250px; height: 250px; z-index: 15; cursor: pointer;
            }

            .mirror-ball {
                position: absolute; inset: 0; background: radial-gradient(circle at 30% 30%, #fef08a, #ca8a04, #713f12);
                border-radius: 50%; box-shadow: inset -20px -20px 40px rgba(0,0,0,0.8), 0 0 50px #facc15;
                display: flex; align-items: center; justify-content: center; filter: blur(0px);
                /* Disco ball fake squares */
                background-image: repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(255,255,255,0.2) 10px, rgba(255,255,255,0.2) 20px), repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.2) 10px, rgba(255,255,255,0.2) 20px);
                animation: spinBall 10s linear infinite;
            }
            @keyframes spinBall { 100% { background-position: 100px 100px; } }

            .rope { position: absolute; bottom: 100%; left: 50%; width: 4px; height: 100vh; background: #64748b; transform: translateX(-50%); box-shadow: inset 1px 0 2px #000; }

            .hint-text { position: absolute; bottom: 15vh; color: #fde047; font-family: 'Prompt', sans-serif; font-size: 1.5rem; letter-spacing: 2px; text-shadow: 0 0 10px #ca8a04; animation: pulse 2s infinite; font-weight: 700; z-index: 20;}
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Fireworks Box */
            .fw-box { position: absolute; inset: 0; z-index: 10; pointer-events: none;}
            .fw-spark { position: absolute; width: 6px; height: 6px; border-radius: 50%; opacity: 0; mix-blend-mode: screen;}

            /* Countdown Giant Text Overlay */
            .cd-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 30; pointer-events: none; }
            .cd-num { font-family: 'Monoton', cursive; font-size: 15rem; color: #facc15; opacity: 0; text-shadow: 0 0 50px #ea580c; }

            /* New Year Message Overlay */
            .ny-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: rgba(0,0,0,0.6); backdrop-filter: blur(10px);
            }
            .m-head { font-family: 'Monoton', cursive; font-size: 4rem; color: #f8fafc; margin-bottom: 20px; font-weight: 400; text-shadow: 0 0 20px #facc15, 0 5px 10px #000;}
            .m-body { font-family: 'Prompt', sans-serif; font-size: 1.6rem; color: #fef3c7; line-height: 1.8; max-width: 600px; text-align: center; font-weight: 700; background: rgba(0,0,0,0.5); padding: 40px; border-radius: 20px; border: 2px solid #ca8a04; box-shadow: 0 0 30px rgba(250, 204, 21, 0.4);}
            .m-foot { font-family: 'Prompt', sans-serif; font-size: 1.2rem; color: #cbd5e1; margin-top: 40px; letter-spacing: 5px; text-transform: uppercase;}

        </style>

        <div class="ny-scene" id="scene">
            <div class="hint-text" id="hint">เริ่มเคาท์ดาวน์</div>

            <div class="ball-wrapper" id="ballWrapper">
                <div class="rope"></div>
                <div class="mirror-ball"></div>
            </div>

            <div class="cd-overlay"><div class="cd-num" id="cdNum">3</div></div>
            <div class="fw-box" id="fwBox"></div>

            <div class="ny-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">HAPPY NEW YEAR - ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const ballWrapper = document.getElementById('ballWrapper');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const cdNum = document.getElementById('cdNum');
    const fwBox = document.getElementById('fwBox');
    
    let isCounting = false;

    // Ball initially waiting at top
    gsap.set(ballWrapper, { y: 0 });

    hint.addEventListener('click', () => {
        if(isCounting) return;
        isCounting = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Ball starts dropping to center
        tl.to(ballWrapper, { y: window.innerHeight/2 - 125, duration: 4, ease: "linear" })
          
        // 2. Countdown sequence synchronously
          .call(() => flashNumber("3"), null, 0)
          .call(() => flashNumber("2"), null, 1)
          .call(() => flashNumber("1"), null, 2)
          
        // 3. Explosion at 0
          .call(() => {
              shootFireworks(window.innerWidth/2, window.innerHeight/2);
              shootFireworks(window.innerWidth/4, window.innerHeight/4);
              shootFireworks(window.innerWidth*0.75, window.innerHeight/3);
          }, null, 3.5)
          
        // 4. Ball vanishes in light and Message appears
          .to(ballWrapper, { scale: 5, opacity: 0, duration: 0.5 }, 3.5)
          .to('.ny-scene', { background: "radial-gradient(circle, #450a0a, #020617)", duration: 1 }, 3.5)
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 }, 4)
          .from('.m-head', { y: -100, opacity: 0, duration: 2, ease: "bounce.out" }, 4);
    });

    function flashNumber(numStr) {
        cdNum.innerHTML = numStr;
        gsap.fromTo(cdNum, { scale: 0.5, opacity: 0 }, { scale: 1.5, opacity: 1, duration: 0.2 });
        gsap.to(cdNum, { scale: 3, opacity: 0, duration: 0.8, delay: 0.2 });
    }

    const fwColors = ['#fde047', '#facc15', '#ef4444', '#3b82f6', '#10b981', '#ffffff'];
    function shootFireworks(cx, cy) {
        for(let i=0; i<50; i++) {
            let s = document.createElement('div');
            s.className = 'fw-spark';
            s.style.background = fwColors[Math.floor(Math.random()*fwColors.length)];
            fwBox.appendChild(s);
            
            gsap.set(s, { x: cx, y: cy, scale: 3, opacity: 1 });
            
            let angle = Math.random() * Math.PI * 2;
            let vel = 100 + Math.random()*300;
            
            gsap.to(s, {
                x: cx + Math.cos(angle)*vel,
                y: cy + Math.sin(angle)*vel + 100, // gravity effect
                opacity: 0, scale: 0,
                duration: 1.5 + Math.random()*1.5,
                ease: "power2.out",
                onComplete: () => s.remove()
            });
        }
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
