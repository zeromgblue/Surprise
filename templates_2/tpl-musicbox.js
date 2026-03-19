export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "radial-gradient(circle at 50% 30%, #4a3018, #1a0f05)"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital@1&display=swap');
            
            .box-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; perspective: 1500px;
            }

            /* Golden dust particles */
            .dust {
                position: absolute; width: 4px; height: 4px; border-radius: 50%;
                background: #FDE047; box-shadow: 0 0 10px #FDE047; opacity: 0; pointer-events: none;
            }

            /* Music Box 3D Base */
            .music-box {
                position: relative; width: 250px; height: 150px; 
                transform-style: preserve-3d; transform: rotateX(20deg) rotateY(-15deg);
                z-index: 20; transition: 0.5s; cursor: pointer;
            }

            /* Box faces */
            .mb-face { position: absolute; background: url('https://www.transparenttextures.com/patterns/wood-pattern.png') #7c2d12; border: 4px solid #b45309; box-sizing: border-box; box-shadow: inset 0 0 20px rgba(0,0,0,0.8); }
            .mb-front { width: 250px; height: 150px; transform: translateZ(75px); }
            .mb-back  { width: 250px; height: 150px; transform: rotateY(180deg) translateZ(75px); }
            .mb-left  { width: 150px; height: 150px; transform: rotateY(-90deg) translateZ(125px); }
            .mb-right { width: 150px; height: 150px; transform: rotateY(90deg) translateZ(125px); }
            .mb-top   { width: 250px; height: 150px; background: url('https://www.transparenttextures.com/patterns/wood-pattern.png') #9a3412; transform: rotateX(90deg) translateZ(75px); transform-origin: top; display: flex; align-items: center; justify-content: center; border: 4px solid #d97706; }
            .mb-bottom{ width: 250px; height: 150px; background: #27272a; transform: rotateX(-90deg) translateZ(75px); box-shadow: 0 50px 100px rgba(0,0,0,0.8); }

            /* Key winder */
            .mb-key {
                position: absolute; right: -20px; top: 50%; width: 40px; height: 10px; background: #d97706;
                transform: translateZ(20px); border-radius: 5px; box-shadow: inset 0 0 5px rgba(0,0,0,0.5);
            }
            .mb-key-handle {
                position: absolute; right: -10px; top: -15px; width: 10px; height: 40px; background: #f59e0b; border-radius: 5px;
            }

            /* The core inside box */
            .mb-inside {
                position: absolute; width: 230px; height: 130px; background: #000;
                transform: rotateX(90deg) translateZ(70px); top: 10px; left: 10px;
                box-shadow: inset 0 0 30px #000; display: flex; align-items: center; justify-content: center;
                overflow: hidden;
            }

            /* Ballerina or glowing core */
            .mb-core {
                width: 40px; height: 40px; background: radial-gradient(circle, #fde047, #b45309);
                border-radius: 50%; box-shadow: 0 0 30px #fde047; opacity: 0; transform: translateY(50px);
            }

            .hint { position: absolute; top: -100px; width: 100%; text-align: center; color: #fde047; font-family: 'Playfair Display', serif; font-size: 1.5rem; animation: pulse 2s infinite; pointer-events:none; text-shadow: 0 2px 10px rgba(0,0,0,0.8);}
            @keyframes pulse { 0%,100%{opacity:0.6;} 50%{opacity:1;} }

            /* Message Display */
            .music-msg {
                position: absolute; width: 80%; max-width: 600px; top: -60vh; text-align: center; z-index: 50;
                opacity: 0; pointer-events: none;
            }
            .m-head { font-family: 'Great Vibes', cursive; font-size: 4rem; color: #fde047; margin-bottom: 20px; text-shadow: 0 4px 10px rgba(0,0,0,0.8); }
            .m-body { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #fef3c7; line-height: 1.8; text-shadow: 0 2px 5px rgba(0,0,0,0.8); }
            .m-foot { font-family: 'Playfair Display', serif; font-size: 1.2rem; color: #d97706; margin-top: 40px; }

        </style>

        <div class="box-scene">
            <div class="music-box" id="mbox">
                <div class="hint" id="hint">หมุนลานกล่องดนตรี (แตะที่กล่อง)</div>
                <div class="mb-face mb-front"></div>
                <div class="mb-face mb-back"></div>
                <div class="mb-face mb-left"></div>
                <div class="mb-face mb-right">
                    <div class="mb-key" id="key"><div class="mb-key-handle"></div></div>
                </div>
                <!-- Box inside -->
                <div class="mb-inside"><div class="mb-core" id="core"></div></div>
                <!-- Top lid -->
                <div class="mb-face mb-top" id="lid">
                    <div style="width: 150px; height: 80px; border: 2px solid #f59e0b; border-radius: 10px; display:flex; align-items:center; justify-content:center;">
                        <span style="font-family:'Great Vibes'; color:#f59e0b; font-size:2rem;">For You</span>
                    </div>
                </div>
                <div class="mb-face mb-bottom"></div>
            </div>

            <div class="music-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-foot">WITH LOVE, ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const mbox = document.getElementById('mbox');
    const lid = document.getElementById('lid');
    const key = document.getElementById('key');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    const core = document.getElementById('core');

    // Float box slightly
    gsap.to(mbox, { y: -10, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });

    let isPlaying = false;

    mbox.addEventListener('click', () => {
        if(isPlaying) return;
        isPlaying = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Wind the key
        tl.to(key, { rotationX: 720, duration: 2, ease: "power2.inOut" })
          
        // 2. Open Lid
          .to(lid, { rotationX: 200, duration: 1.5, ease: "power2.inOut" }, "-=0.5")
          
        // 3. Tilt box to view inside and message
          .to(mbox, { rotationX: 10, rotationY: 0, scale: 0.8, y: 150, duration: 1.5, ease: "power2.inOut" }, "-=1")
          
        // 4. Glow core rises
          .to(core, { opacity: 1, y: 0, duration: 1, ease: "back.out(1)" }, "-=0.5")
          .to(core, { rotationY: 360, duration: 3, repeat: -1, ease: "none" }) // keep spinning core

        // 5. Message fades down like magic dust from the core
          .to(msg, { y: "40vh", opacity: 1, pointerEvents: 'auto', duration: 2, ease: "power2.out" }, "-=1")
          .call(createDustParticles);
    });

    function createDustParticles() {
        const scene = document.querySelector('.box-scene');
        for(let i=0; i<30; i++) {
            let p = document.createElement('div');
            p.className = 'dust';
            scene.appendChild(p);
            
            // Start from center of screen roughly
            gsap.set(p, { x: window.innerWidth/2, y: window.innerHeight/2 + 50 });
            
            gsap.to(p, {
                x: window.innerWidth/2 + (Math.random()-0.5)*500,
                y: window.innerHeight/2 - Math.random()*400,
                opacity: Math.random(),
                duration: 2 + Math.random()*2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: Math.random()*2
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
