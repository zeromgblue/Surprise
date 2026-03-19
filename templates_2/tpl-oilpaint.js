export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#1e1b4b"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Bungee+Outline&family=Prompt:wght@300;600&display=swap');
            
            .oil-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: #000;
            }

            /* Container for rotating gradients */
            .oil-canvas {
                position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
                z-index: 5; pointer-events: none; filter: blur(30px) contrast(2);
            }

            .oil-swirl {
                position: absolute; width: 800px; height: 800px; border-radius: 50%;
                opacity: 0; mix-blend-mode: color-dodge;
            }
            .s1 { background: radial-gradient(circle, #f43f5e, #8b5cf6, transparent); transform: translateX(-150px) translateY(-150px); }
            .s2 { background: radial-gradient(circle, #3b82f6, #10b981, transparent); transform: translateX(150px) translateY(150px); }
            .s3 { background: radial-gradient(circle, #f59e0b, #ec4899, transparent); transform: translateX(-100px) translateY(150px); }

            .hint-text { position: absolute; bottom: 15vh; color: #cbd5e1; font-family: 'Prompt', sans-serif; font-size: 1.2rem; letter-spacing: 2px; text-shadow: 0 0 10px #475569; animation: pulse 2s infinite; font-weight: 300; z-index: 20; cursor: pointer;}
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Modern Bold Message Overlay */
            .gallery-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: rgba(0,0,0,0.5); backdrop-filter: blur(5px);
            }
            .m-head { font-family: 'Bungee Outline', cursive; font-size: 6rem; color: #fff; margin-bottom: 20px; letter-spacing: 5px; text-shadow: 0 0 20px rgba(255,255,255,0.5);}
            .m-body { font-family: 'Prompt', sans-serif; font-size: 1.5rem; color: #f8fafc; line-height: 1.8; max-width: 600px; text-align: center; font-weight: 400; background: rgba(255,255,255,0.1); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.5);}
            .m-foot { font-family: 'Prompt', sans-serif; font-size: 1.2rem; color: #94a3b8; margin-top: 40px; font-weight: 600; text-transform: uppercase; letter-spacing: 5px;}

        </style>

        <div class="oil-scene" id="scene">
            <div class="oil-canvas" id="canvas">
                <div class="oil-swirl s1"></div>
                <div class="oil-swirl s2"></div>
                <div class="oil-swirl s3"></div>
            </div>
            
            <div class="hint-text" id="hint">แตะเพื่อผสมสีน้ำมัน</div>

            <div class="gallery-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    const scene = document.getElementById('scene');
    const swirls = document.querySelectorAll('.oil-swirl');
    
    let isSwirled = false;

    scene.addEventListener('click', () => {
        if(isSwirled) return;
        isSwirled = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Swirls become visible and start rotating around center 
        tl.to(swirls, { opacity: 0.8, duration: 2, ease: "power2.inOut" })
          .to('.s1', { rotation: 360, duration: 15, repeat: -1, ease: "none", transformOrigin: "center center" }, 0)
          .to('.s2', { rotation: -360, duration: 12, repeat: -1, ease: "none", transformOrigin: "center center" }, 0)
          .to('.s3', { rotation: 360, duration: 18, repeat: -1, ease: "none", transformOrigin: "center center" }, 0)
          
        // 2. Pulse scales
          .to(swirls, { scale: 1.2, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut" }, 0)

        // 3. Crisp Glassmorphism text comes in
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 }, 1)
          .from('.m-head', { letterSpacing: "50px", opacity: 0, duration: 2, ease: "power3.out" }, 1);
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
