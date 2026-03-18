export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#fffbeb"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Papyrus&family=Noto+Sans+Thai:wght@300;600&display=swap');
            
            .desert-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                overflow: hidden; background: linear-gradient(180deg, #fef3c7, #fcd34d, #f59e0b);
            }

            .sunBg {
                position: absolute; top: 10vh; right: 20vw; width: 200px; height: 200px;
                background: #fffbeb; border-radius: 50%; box-shadow: 0 0 100px #fde047;
                z-index: 1; opacity: 0.8;
            }

            /* Golden Sand Dunes */
            .dune1, .dune2 {
                position: absolute; bottom: 0; width: 120vw; height: 30vh;
                background: #d97706; border-radius: 50% / 100% 100% 0 0; z-index: 10;
            }
            .dune1 { left: -10vw; transform: rotate(-5deg); background: #b45309; height: 35vh; }
            .dune2 { right: -20vw; transform: rotate(8deg); background: #92400e; z-index: 12;}

            /* Pyramid 3D Structure */
            .pyramid-wrapper {
                position: absolute; bottom: 15vh; z-index: 15;
                transform-style: preserve-3d; transform: rotateX(20deg) rotateY(-30deg);
                perspective: 1000px; transition: 0.5s; cursor: pointer;
            }

            .p-face {
                position: absolute; width: 0; height: 0;
                border-left: 150px solid transparent; border-right: 150px solid transparent; border-bottom: 250px solid #d97706;
                transform-origin: bottom center;
            }
            .p-front { border-bottom-color: #fcd34d; transform: translateZ(150px) rotateX(30deg); }
            .p-back  { border-bottom-color: #92400e; transform: translateZ(-150px) rotateX(-30deg); }
            .p-left  { border-bottom-color: #b45309; transform: translateX(-150px) rotateY(-90deg) rotateX(30deg); }
            .p-right { border-bottom-color: #78350f; transform: translateX(150px) rotateY(90deg) rotateX(30deg); }
            .p-base  { position: absolute; width: 300px; height: 300px; background: #451a03; transform: rotateX(90deg) translateZ(-125px); left: -150px; bottom: 0;}

            /* Top/Capstone that levitates */
            .capstone {
                position: absolute; top: -100px; left: -50px; width: 100px; height: 100px;
                transform-style: preserve-3d; z-index: 16;
            }
            .c-face {
                position: absolute; width: 0; height: 0;
                border-left: 50px solid transparent; border-right: 50px solid transparent; border-bottom: 80px solid #fbbf24;
                transform-origin: bottom center; filter: drop-shadow(0 -5px 10px #fcd34d);
            }
            .c-front { border-bottom-color: #fef08a; transform: translateZ(50px) rotateX(30deg); }
            .c-left  { border-bottom-color: #f59e0b; transform: translateX(-50px) rotateY(-90deg) rotateX(30deg); }
            .c-right { border-bottom-color: #d97706; transform: translateX(50px) rotateY(90deg) rotateX(30deg); }
            .c-back  { border-bottom-color: #b45309; transform: translateZ(-50px) rotateX(-30deg); }

            /* Glowing Eye inside capstone */
            .eye {
                position: absolute; top: 40px; left: -15px; width: 30px; height: 15px;
                background: #fff; border-radius: 50%; box-shadow: 0 0 20px #60a5fa, inset 0 0 10px #2563eb;
                z-index: 17; opacity: 0; display: flex; align-items: center; justify-content: center; transform: translateZ(51px);
            }
            .pupil { width: 10px; height: 15px; background: #000; border-radius: 50%; }

            /* Ancient Text Panel */
            .papyrus-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 40; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(69, 26, 3, 0.9), rgba(0,0,0,0.95));
            }
            .m-head { font-family: 'Papyrus', 'Noto Sans Thai', serif; font-size: 3.5rem; color: #facc15; margin-bottom: 20px; font-weight: 700; text-shadow: 0 5px 10px #78350f; text-align:center;}
            .m-body { font-family: 'Noto Sans Thai', sans-serif; font-size: 1.5rem; color: #fef3c7; line-height: 1.8; max-width: 600px; text-align: center; text-shadow: 0 2px 5px #000;}
            .m-foot { font-family: 'Papyrus', 'Noto Sans Thai', serif; font-size: 1.4rem; color: #f59e0b; margin-top: 40px; letter-spacing: 2px;}

            .hint-text { position: absolute; top: 20vh; color: #78350f; font-family: 'Noto Sans Thai', sans-serif; font-size: 1.5rem; letter-spacing: 2px; animation: pulse 2s infinite; font-weight: 700; z-index: 20;}
            @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

        </style>

        <div class="desert-scene" id="scene">
            <div class="sunBg"></div>
            
            <div class="hint-text" id="hint">แตะเพื่อปลุกพีระมิด</div>

            <div class="dune1"></div>
            <div class="dune2"></div>

            <div class="pyramid-wrapper" id="pyramid">
                <div class="p-base"></div>
                <!-- Main Body -->
                <div class="p-face p-back"></div>
                <div class="p-face p-left"></div>
                <div class="p-face p-right"></div>
                <div class="p-face p-front"></div>

                <!-- Levitation Capstone -->
                <div class="capstone" id="cap">
                    <div class="c-face c-back"></div>
                    <div class="c-face c-left"></div>
                    <div class="c-face c-right"></div>
                    <div class="c-face c-front"></div>
                    <div class="eye" id="eye"><div class="pupil"></div></div>
                </div>
            </div>

            <div class="papyrus-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">THE PHARAOH: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const pyramid = document.getElementById('pyramid');
    const cap = document.getElementById('cap');
    const eye = document.getElementById('eye');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const scene = document.getElementById('scene');

    let isAwake = false;

    pyramid.addEventListener('click', () => {
        if(isAwake) return;
        isAwake = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Earthquake / rumbling
        tl.to(scene, { y: 5, yoyo: true, repeat: 10, duration: 0.1 })
          
        // 2. Capstone breaks off and levitates, spinning
          .to(cap, { y: -200, rotationY: 360, duration: 3, ease: "power2.out" })
          
        // 3. Eye of Horus opens
          .to(eye, { opacity: 1, duration: 1 }, "-=1")
          
        // 4. Background darkness sweeps in
          .to(scene, { background: "linear-gradient(180deg, #1e1b4b, #0f172a, #020617)", duration: 2 }, "-=2")
          
        // 5. Papyrus text overlay fades in
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 }, "+=0.5");
          
        // keep capstone floating
        gsap.to(cap, { y: -220, rotationY: "+=360", duration: 10, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 3 });
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
