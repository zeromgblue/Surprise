export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#0A0014"; // Witching hour dark
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English+SC&family=Sacramento&display=swap');
            
            .ball-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; perspective: 800px;
            }

            /* Mystic table */
            .table {
                position: absolute; bottom: -50px; width: 120%; height: 300px;
                background: radial-gradient(ellipse at top, #2C1338 0%, #0A0014 60%);
                border-radius: 50% 50% 0 0; z-index: 1; filter:blur(2px);
            }

            /* Crystal Ball Base */
            .base {
                position: absolute; bottom: 20%; width: 150px; height: 80px;
                background: linear-gradient(to right, #B8860B, #FFD700, #B8860B);
                border-radius: 50% / 20px; z-index: 2;
                box-shadow: 0 10px 20px rgba(0,0,0,0.8), inset 0 -10px 20px rgba(0,0,0,0.5);
            }
            .base::before { content:''; position:absolute; top:-10px; left:10%; width:80%; height:20px; background: #8B6508; border-radius: 50%; }

            /* Crystal Ball Glass */
            .crystal-glass {
                position: relative; width: 300px; height: 300px; border-radius: 50%;
                background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 40%, rgba(138,43,226,0.3) 80%, rgba(0,0,0,0.8) 100%);
                box-shadow: inset 0 0 50px rgba(138,43,226,0.8), 0 0 30px rgba(138,43,226,0.4);
                cursor: pointer; overflow: hidden; z-index: 10;
                transform: translateY(-40px);
            }
            .crystal-shine {
                position: absolute; top:5%; left:10%; width:80px; height:40px;
                background: rgba(255,255,255,0.8); border-radius: 50%; filter: blur(5px); transform: rotate(-30deg);
            }

            /* Plasma inside ball */
            .plasma {
                position: absolute; top:50%; left:50%; width:100%; height:100%; transform: translate(-50%, -50%);
                background: conic-gradient(from 0deg, transparent, rgba(138,43,226,0.8), rgba(0,255,255,0.8), transparent);
                animation: spinPlasma 3s linear infinite; mix-blend-mode: screen; border-radius:50%; filter:blur(20px);
            }
            @keyframes spinPlasma { 100% {transform: translate(-50%, -50%) rotate(360deg);} }

            .hint { position: absolute; bottom: 10%; color:#E6E6FA; font-family:'IM Fell English SC', serif; letter-spacing: 3px; z-index:20; pointer-events:none; text-shadow:0 0 10px #8A2BE2;}

            /* Message that appears IN the ball or zooms out of it */
            .fortune-msg {
                position: absolute; inset:0; z-index: 30; padding: 50px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none; transform: scale(0.1) translateZ(-500px);
                background: radial-gradient(circle, rgba(10,0,20,0.9) 0%, rgba(0,0,0,1) 100%);
            }

            .m-head { font-family: 'IM Fell English SC', serif; font-size: 2.5rem; color: #DDA0DD; text-shadow: 0 0 10px #8A2BE2; margin-bottom: 20px;}
            .m-body { font-family: 'Sacramento', cursive; font-size: 3.5rem; color: #E6E6FA; line-height: 1.2; text-shadow: 0 0 15px rgba(255,255,255,0.5); }
            
        </style>

        <div class="ball-scene">
            <div class="table"></div>
            <div class="base"></div>
            
            <div class="crystal-glass" id="ball">
                <div class="plasma" id="plasma"></div>
                <div class="crystal-shine"></div>
            </div>

            <div class="hint" id="hint">จ้องมองอนาคต</div>

            <div class="fortune-msg" id="msg">
                <div class="m-head">The spirits say...<br>${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-head" style="font-size:1.2rem; margin-top:30px; color:#8A2BE2;">Vision channeled by: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const ball = document.getElementById('ball');
    const plasma = document.getElementById('plasma');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    let gazed = false;

    // Ball levitation
    gsap.to(ball, { y: "-50px", duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut' });

    ball.addEventListener('click', () => {
        if(gazed) return;
        gazed = true;
        hint.style.display = 'none';

        gsap.killTweensOf(ball);

        const tl = gsap.timeline();

        // 1. Plasma goes crazy
        tl.to(plasma, { background: 'conic-gradient(from 0deg, transparent, #FFF, #00FFFF, transparent)', duration: 0.5 })
          .to(ball, { scale: 1.2, duration: 2, ease:"power1.inOut" }, 0)
          
        // 2. Flash of insight (Screen goes white)
          .call(() => {
              const flash = document.createElement('div');
              flash.style.cssText = "position:absolute; inset:0; background:#fff; z-index:50;";
              document.body.appendChild(flash);
              gsap.to(flash, { opacity:0, duration: 1.5, onComplete:()=>flash.remove() });
          })
          
        // 3. We dive INTO the ball, the message zooms out to fullscreen
          .to('.base, .table', { opacity: 0, duration: 0.1 }, "+=0.1")
          .to(ball, { display: 'none' })
          .to(msg, { opacity: 1, scale: 1, z: 0, duration: 2, pointerEvents:'auto', ease:"power3.out" });
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
