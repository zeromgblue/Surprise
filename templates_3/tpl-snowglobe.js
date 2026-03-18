export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#e0f2fe"; // Light sky blue
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Nunito:wght@400;700&display=swap');
            
            .globe-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle, #e0f2fe, #bae6fd, #7dd3fc);
            }

            /* Snow Globe */
            .snowglobe-wrapper {
                position: relative; width: 300px; height: 350px;
                display: flex; flex-direction: column; align-items: center;
                cursor: grab; z-index: 20;
            }
            .snowglobe-wrapper:active { cursor: grabbing; }

            .glass-sphere {
                position: relative; width: 250px; height: 250px; border-radius: 50%;
                background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), rgba(255,255,255,0.1) 40%, rgba(0,0,0,0.1) 100%);
                box-shadow: inset 0 -10px 30px rgba(0,0,0,0.2), inset 0 10px 20px rgba(255,255,255,0.5), 0 15px 30px rgba(0,0,0,0.3);
                overflow: hidden; z-index: 2; border: 2px solid rgba(255,255,255,0.3);
            }

            /* Snow inside sphere requires a canvas */
            canvas#snowCanvas {
                position: absolute; inset: 0; border-radius: 50%; z-index: 3; pointer-events: none;
            }

            /* Inner scenery */
            .inner-scene {
                position: absolute; bottom: 0; width: 100%; height: 50%;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                z-index: 1; padding-bottom: 10px; box-sizing: border-box;
            }
            .tiny-tree {
                width: 0; height: 0; border-left: 20px solid transparent; border-right: 20px solid transparent; border-bottom: 50px solid #166534;
                position: relative;
            }
            .tiny-tree::after { content:''; position:absolute; bottom: -50px; left: -10px; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 30px solid #14532d; }

            .base {
                width: 200px; height: 80px; background: linear-gradient(180deg, #7c2d12, #451a03);
                border-radius: 20px 20px 10px 10px; margin-top: -10px; z-index: 1;
                box-shadow: 0 10px 20px rgba(0,0,0,0.4), inset 0 5px 10px rgba(255,255,255,0.3);
                display: flex; align-items: center; justify-content: center;
                border: 2px solid #b45309; border-top: none;
            }
            .name-plate {
                background: linear-gradient(135deg, #fef08a, #ca8a04); padding: 5px 15px; border-radius: 5px;
                font-family: 'Dancing Script', cursive; color: #451a03; font-weight: bold; border: 1px solid #713f12;
            }

            .hint { position: absolute; top: 10vh; color: #0284c7; font-family: 'Nunito', sans-serif; font-size: 1.5rem; letter-spacing: 1px; animation: pulse 2s infinite; pointer-events:none;}
            @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

            /* Message Display */
            .magical-msg {
                position: absolute; inset:0; z-index: 10; padding: 40px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none;
            }
            .m-head { font-family: 'Dancing Script', cursive; font-size: 5rem; color: #E0F2FE; margin-bottom: 20px; text-shadow: 0 5px 15px #0284c7; }
            .m-body { font-family: 'Nunito', sans-serif; font-size: 1.8rem; color: #FFF; line-height: 1.6; max-width: 600px; text-shadow: 0 2px 5px #0284c7; }
            .m-foot { font-family: 'Dancing Script', cursive; font-size: 2rem; color: #bae6fd; margin-top: 30px; }

        </style>

        <div class="globe-scene">
            <div class="hint" id="hint">เขย่าลูกแก้วหิมะ (แตะหรือลาก)</div>

            <div class="magical-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-foot">FROM: ${escapeHtml(data.sender)}</div>
            </div>

            <div class="snowglobe-wrapper" id="globe">
                <div class="glass-sphere">
                    <div class="inner-scene">
                        <div class="tiny-tree"></div>
                    </div>
                    <canvas id="snowCanvas" width="250" height="250"></canvas>
                </div>
                <div class="base">
                    <div class="name-plate">${escapeHtml(data.receiver)}</div>
                </div>
            </div>
        </div>
    `;

    const globe = document.getElementById('globe');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    const canvas = document.getElementById('snowCanvas');
    const ctx = canvas.getContext('2d');

    // Float globe
    gsap.to(globe, { y: -15, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });

    // Snow System inside Canvas
    let flakes = [];
    for(let i=0; i<150; i++) {
        flakes.push({
            x: Math.random() * 250,
            y: Math.random() * 250,
            r: Math.random() * 3 + 1,
            vx: (Math.random() - 0.5) * 1,
            vy: Math.random() * 2 + 1,
            opacity: Math.random()
        });
    }

    let isShaken = false;

    function renderSnow() {
        ctx.clearRect(0,0, 250, 250);
        
        ctx.fillStyle = '#FFF';
        flakes.forEach(f => {
            f.x += f.vx;
            f.y += f.vy;
            if(f.y > 250) { f.y = -5; f.x = Math.random() * 250; }
            if(f.x > 250) f.x = 0;
            if(f.x < 0) f.x = 250;

            ctx.beginPath();
            ctx.globalAlpha = f.opacity;
            ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
            ctx.fill();
        });
        requestAnimationFrame(renderSnow);
    }
    renderSnow();

    function triggerShake() {
        if(isShaken) return;
        isShaken = true;
        hint.style.display = 'none';

        // Exciting snow flurry
        flakes.forEach(f => {
            f.vy = Math.random() * -10 - 5; // shoot up
            f.vx = (Math.random() - 0.5) * 15; // chaos sideways
        });

        const tl = gsap.timeline();

        // Shake animation
        tl.to(globe, { x: 20, rotation: 5, duration: 0.1, yoyo: true, repeat: 10 })
          
        // Background darkens a bit to show text clearly
          .to('.globe-scene', { background: 'radial-gradient(circle, #0284c7, #075985, #082f49)', duration: 2 }, "+=0.5")
          
        // Msg appears majestically behind globe
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 })
          
        // Slow down snow gradually
          .call(() => {
              gsap.to(flakes, { vy: 2, vx: 0, duration: 3, stagger: 0.01 }); // Normal calm gravity
          }, null, "-=1");
    }

    globe.addEventListener('click', triggerShake);
    
    // Rudimentary drag to shake
    let startX = 0;
    globe.addEventListener('mousedown', (e) => startX = e.clientX);
    globe.addEventListener('mouseup', (e) => {
        if(Math.abs(e.clientX - startX) > 20) triggerShake();
    });
    globe.addEventListener('touchstart', (e) => startX = e.touches[0].clientX);
    globe.addEventListener('touchend', (e) => {
        if(Math.abs(e.changedTouches[0].clientX - startX) > 20) triggerShake();
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
