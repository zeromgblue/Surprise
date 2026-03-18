export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#020617"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,600&family=Prompt:wght@300;400&display=swap');
            
            .smoke-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: #020617;
            }

            /* Container for smoke images */
            .smoke-wrapper {
                position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
                filter: blur(2px) contrast(1.2) sepia(100%) hue-rotate(280deg) saturate(300%) opacity(0.8);
                pointer-events: none; mix-blend-mode: color-dodge;
            }

            .smoke-puff {
                position: absolute; width: 400px; height: 400px;
                /* Using a generic cloud/smoke SVG pattern */
                background: radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%);
                border-radius: 50%; opacity: 0; mix-blend-mode: screen;
            }

            /* The magical orb in the center */
            .orb {
                width: 60px; height: 60px; background: #fff; border-radius: 50%;
                box-shadow: 0 0 40px #d946ef, 0 0 80px #a855f7, inset 0 0 20px #fdf4ff;
                z-index: 20; cursor: pointer; display: flex; align-items: center; justify-content: center;
                animation: floatOrb 4s ease-in-out infinite; transition: 0.3s;
            }
            .orb:hover { transform: scale(1.2); box-shadow: 0 0 60px #f0abfc, 0 0 100px #c084fc; }
            @keyframes floatOrb { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-20px) scale(1.05);} }

            .hint-text { position: absolute; bottom: 20vh; color: #fdf4ff; font-family: 'Prompt', sans-serif; font-size: 1.2rem; letter-spacing: 2px; text-shadow: 0 0 10px #c084fc; animation: pulse 2s infinite; font-weight: 300; z-index: 25; pointer-events: none;}
            @keyframes pulse { 0%,100%{opacity:0.4;} 50%{opacity:1;} }

            /* Reveal Message Overlay */
            .magic-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
            }
            .m-head { font-family: 'Cormorant Garamond', serif; font-size: 5rem; color: #fdf4ff; margin-bottom: 20px; font-weight: 600; text-shadow: 0 0 20px #e879f9, 0 0 40px #c084fc; font-style: italic;}
            .m-body { font-family: 'Prompt', sans-serif; font-size: 1.5rem; color: #f3e8ff; line-height: 1.8; max-width: 650px; text-align: center; font-weight: 300; text-shadow: 0 2px 10px #000; letter-spacing: 1px;}
            .m-foot { font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; color: #d946ef; margin-top: 50px; font-style: italic; letter-spacing: 2px;}

        </style>

        <div class="smoke-scene" id="scene">
            <div class="smoke-wrapper" id="smokeBox"></div>
            
            <div class="orb" id="orb"></div>
            <div class="hint-text" id="hint">แตะลูกแก้วเพื่อปลดปล่อยพลังงาน</div>

            <div class="magic-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">ETHEREAL ESSENCE BY ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const orb = document.getElementById('orb');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const smokeBox = document.getElementById('smokeBox');
    
    // Idle gentle pulsing smoke
    const idleSmoke = [];
    for(let i=0; i<3; i++) {
        let s = document.createElement('div');
        s.className = 'smoke-puff';
        smokeBox.appendChild(s);
        gsap.set(s, { scale: 0.5, opacity: 0 });
        gsap.to(s, {
            scale: 2, opacity: 0.3, rotation: "+=180",
            duration: 8 + Math.random()*4, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i*2
        });
        idleSmoke.push(s);
    }

    let isExploded = false;

    orb.addEventListener('click', () => {
        if(isExploded) return;
        isExploded = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Orb shrinks slightly then explodes
        tl.to(orb, { scale: 0.5, opacity: 0.5, duration: 0.5, ease: "power2.in" })
          .to(orb, { scale: 10, opacity: 0, duration: 1, ease: "power2.out" })
          .set(orb, { display: 'none' })
          
        // 2. Huge colorful smoke burst
          .call(createSmokeExplosion, null, 0.5)
          
        // 3. Background color shift to subtle purple
          .to('.smoke-wrapper', { filter: "blur(20px) contrast(1.5) sepia(50%) hue-rotate(250deg) saturate(200%) opacity(0.6)", duration: 3 }, 0.5)
          
        // 4. Ethereal message fades in 
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 3, ease: "power1.inOut" }, 1.5)
          .from('.m-head', { letterSpacing: "20px", filter: "blur(10px)", duration: 3, ease: "power2.out" }, 1.5);
    });

    function createSmokeExplosion() {
        for(let i=0; i<15; i++) {
            let s = document.createElement('div');
            s.className = 'smoke-puff';
            smokeBox.appendChild(s);
            
            gsap.set(s, { x: 0, y: 0, scale: 0.1, opacity: 0.8 });
            
            gsap.to(s, {
                x: (Math.random()-0.5)*800,
                y: (Math.random()-0.5)*800,
                scale: 3 + Math.random()*3,
                opacity: 0,
                rotation: Math.random()*360,
                duration: 4 + Math.random()*2,
                ease: "power2.out",
                onComplete: ()=>s.remove()
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
