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
            @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Kanit:wght@300;600&display=swap');
            
            .colosseum-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                overflow: hidden; background: linear-gradient(180deg, #fcd34d, #fdba74, #ea580c);
                perspective: 1000px;
            }

            /* Sun setting */
            .sun {
                position: absolute; top: 30vh; width: 150px; height: 150px;
                background: #fef08a; border-radius: 50%; box-shadow: 0 0 100px #fff;
                z-index: 1; opacity: 0.9; transition: 3s;
            }

            /* Colosseum Archway */
            .arch-wrapper {
                position: absolute; bottom: 0; width: 400px; height: 500px;
                z-index: 20; transform-style: preserve-3d;
            }
            .arch-pillar {
                position: absolute; bottom: 0; width: 80px; height: 400px; background: #b45309;
                border-left: 10px solid #d97706; border-right: 10px solid #78350f; box-shadow: 10px 10px 30px rgba(0,0,0,0.5);
            }
            .left-p { left: 0; }
            .right-p { right: 0; }
            
            .arch-top {
                position: absolute; top: 0; left: 0; width: 400px; height: 200px;
                background: #b45309; border-radius: 50% 50% 0 0 / 100% 100% 0 0;
                border-top: 15px solid #d97706; box-shadow: 0 20px 30px rgba(0,0,0,0.5);
                clip-path: polygon(0 0, 100% 0, 100% 100%, 80% 100%, 80% 50%, 50% 30%, 20% 50%, 20% 100%, 0 100%);
            }

            /* Gates (closed initially) */
            .gate {
                position: absolute; bottom: 0; width: 120px; height: 350px;
                background: #1c1917; border: 5px solid #000; z-index: 15;
                background-image: repeating-linear-gradient(90deg, transparent, transparent 15px, #44403c 15px, #44403c 25px);
                transform-origin: center right; transition: 2s; cursor: pointer;
            }
            .gate-left { left: 80px; transform-origin: left center;}
            .gate-right { right: 80px; transform-origin: right center;}

            .hint-text { position: absolute; bottom: 40vh; color: #fff; font-family: 'Kanit', sans-serif; font-size: 1.5rem; letter-spacing: 2px; text-shadow: 0 0 10px #000; animation: pulse 2s infinite; font-weight: 700; z-index: 25; pointer-events:none;}
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Roman Stone Tablet Text Overlay */
            .roman-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(120, 53, 15, 0.8), rgba(0,0,0,0.95));
            }
            .stone-panel {
                background: url('https://www.transparenttextures.com/patterns/concrete-wall.png') #d4d4d8;
                padding: 60px; border-radius: 10px; border: 10px solid #a1a1aa;
                box-shadow: inset 0 0 20px rgba(0,0,0,0.5), 0 20px 50px rgba(0,0,0,0.8);
                display: flex; flex-direction: column; align-items: center;
            }
            .m-head { font-family: 'Cinzel Decorative', cursive; font-size: 3rem; color: #b45309; margin-bottom: 20px; font-weight: 700; text-shadow: 1px 1px 0px #fff, -1px -1px 0px #52525b;}
            .m-body { font-family: 'Kanit', sans-serif; font-size: 1.4rem; color: #3f3f46; line-height: 1.6; max-width: 500px; text-align: center; font-weight: 600;}
            .m-foot { font-family: 'Cinzel Decorative', cursive; font-size: 1.5rem; color: #78350f; margin-top: 30px; border-top: 2px solid #a1a1aa; padding-top: 20px;}

        </style>

        <div class="colosseum-scene" id="scene">
            <div class="sun" id="sun"></div>
            
            <div class="arch-wrapper">
                <div class="arch-pillar left-p"></div>
                <div class="arch-pillar right-p"></div>
                <div class="arch-top"></div>
                
                <div class="hint-text" id="hint">เปิดประตูกลาดิเอเตอร์</div>
                <div class="gate gate-left" id="gLeft"></div>
                <div class="gate gate-right" id="gRight"></div>
            </div>

            <div class="roman-msg" id="msg">
                <div class="stone-panel">
                    <div class="m-head">${escapeHtml(data.receiver)}</div>
                    <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                    <div class="m-foot">EMPEROR ${escapeHtml(data.sender)}</div>
                </div>
            </div>
        </div>
    `;

    const gLeft = document.getElementById('gLeft');
    const gRight = document.getElementById('gRight');
    const sun = document.getElementById('sun');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');

    let isOpened = false;

    // Click anywhere on the gates
    [gLeft, gRight].forEach(el => el.addEventListener('click', () => {
        if(isOpened) return;
        isOpened = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Heavy iron gates swing open in 3D
        tl.to(gLeft, { rotationY: -100, duration: 2, ease: "power2.inOut" }, 0)
          .to(gRight, { rotationY: 100, duration: 2, ease: "power2.inOut" }, 0)
          
        // 2. Camera pushes through the door (scale up)
          .to('.arch-wrapper', { scale: 3, z: 200, y: 300, opacity: 0, duration: 2, ease: "power1.in" }, "+=0.5")
          
        // 3. Sun sets quickly into darkness
          .to(sun, { top: "100vh", opacity: 0, duration: 2 }, "-=2")
          
        // 4. Heavy stone tablet falls into view
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1 }, "-=0.5")
          .from('.stone-panel', { y: -800, rotationZ: -10, duration: 1, ease: "bounce.out" }, "-=1");
    }));
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
