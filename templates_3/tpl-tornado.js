export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#52525B"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Anton&family=Prompt:wght@400;700&display=swap');
            
            .tornado-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: linear-gradient(180deg, #3f3f46, #71717a, #a1a1aa);
            }

            /* Dark Stormy Clouds Top */
            .storm-clouds {
                position: absolute; top: 0; width: 100vw; height: 40vh;
                background: linear-gradient(180deg, #27272a, #52525b, transparent);
                z-index: 5;
            }

            /* The Tornado structure */
            .tornado-wrapper {
                position: absolute; bottom: 0; display: flex; flex-direction: column;
                align-items: center; z-index: 10; cursor: pointer;
            }

            /* Using multiple ellipses spinning to simulate tornado */
            .t-layer {
                border-radius: 50%; opacity: 0.2;
                background: radial-gradient(ellipse at center, #d4d4d8 20%, #71717a 80%, transparent);
                box-shadow: inset 0 0 20px #000; mix-blend-mode: multiply;
                animation: spinTornado linear infinite;
            }
            @keyframes spinTornado { 0% { transform: scaleX(1) translateX(0); } 25% { transform: scaleX(1.2) translateX(10px); } 50% { transform: scaleX(1) translateX(0); } 75% { transform: scaleX(0.8) translateX(-10px); } 100% { transform: scaleX(1) translateX(0); } }

            .hint-text { position: absolute; bottom: 10vh; color: #fff; font-family: 'Prompt', sans-serif; font-size: 1.5rem; letter-spacing: 2px; text-shadow: 0 0 10px #000; animation: bounce 1s infinite; font-weight: 700; z-index: 20; pointer-events: none;}
            @keyframes bounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }

            /* Flying debris */
            .debris {
                position: absolute; width: 20px; height: 20px; background: #52525b; clip-path: polygon(50% 0, 100% 100%, 0 100%);
                z-index: 15; opacity: 0;
            }

            /* Reveal Message Overlay */
            .clear-sky-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(14, 165, 233, 0.4), transparent);
            }
            .m-head { font-family: 'Anton', sans-serif; font-size: 4.5rem; color: #facc15; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px; text-shadow: 2px 2px 0px #b45309, 4px 4px 10px #000;}
            .m-body { font-family: 'Prompt', sans-serif; font-size: 1.6rem; color: #fff; line-height: 1.6; max-width: 700px; text-align: center; font-weight: 700; text-shadow: 2px 2px 5px #000;}
            .m-foot { font-family: 'Anton', sans-serif; font-size: 1.5rem; color: #38bdf8; margin-top: 30px; letter-spacing: 3px; text-shadow: 2px 2px 5px #000;}

        </style>

        <div class="tornado-scene" id="scene">
            <div class="storm-clouds" id="clouds"></div>
            
            <div class="tornado-wrapper" id="tornado">
                <!-- Generating layers of tornado from top to bottom -->
                ${Array(20).fill(0).map((_, i) => `<div class="t-layer" style="width: ${300 - (i*14)}px; height: 30px; margin-top: -15px; animation-duration: ${0.5 - (i*0.02)}s; animation-delay: ${Math.random()}s;"></div>`).join('')}
            </div>

            <div class="hint-text" id="hint">แตะเพื่อสลายพายุทอร์นาโด</div>

            <div class="clear-sky-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">SWEPT BY: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const tornado = document.getElementById('tornado');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    const clouds = document.getElementById('clouds');
    const scene = document.getElementById('scene');

    // Make Tornado sway side to side
    gsap.to(tornado, { x: 50, rotationZ: 5, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });

    let isDispersed = false;

    tornado.addEventListener('click', () => {
        if(isDispersed) return;
        isDispersed = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Tornado breaks apart and flies away
        const layers = document.querySelectorAll('.t-layer');
        layers.forEach((layer, index) => {
            tl.to(layer, {
                x: "+=" + (Math.random()-0.5)*1000,
                y: -1000,
                opacity: 0, scale: 3,
                duration: 1.5 + Math.random(),
                ease: "power2.in"
            }, Math.random()*0.5);
        });

        // 2. Clouds pull away and sky clears to blue
        tl.to(clouds, { y: -500, opacity: 0, duration: 2 }, 0)
          .to(scene, { background: "linear-gradient(180deg, #0ea5e9, #7dd3fc, #e0f2fe)", duration: 2 }, 0)
          
        // 3. Eject some debris out
          .call(ejectDebris, null, 0.5)

        // 4. Show the grand message
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5, scale: 1 }, 1.5);
          
        gsap.from(msg, { scale: 0.5, duration: 1.5, ease: "back.out(1.5)", delay: 1.5 });
    });

    function ejectDebris() {
        for(let i=0; i<30; i++) {
            let d = document.createElement('div');
            d.className = 'debris';
            scene.appendChild(d);
            
            gsap.set(d, { x: window.innerWidth/2, y: window.innerHeight - 200, opacity: 1, scale: Math.random()*1.5 });
            
            gsap.to(d, {
                x: window.innerWidth/2 + (Math.random()-0.5)*1500,
                y: -200 - Math.random()*500,
                rotation: Math.random()*720,
                opacity: 0,
                duration: 2 + Math.random()*2,
                ease: "power1.out",
                onComplete: ()=>d.remove()
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
