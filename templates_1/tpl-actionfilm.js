export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#050505"; // Intense black
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Roboto:wght@900&display=swap');
            
            .action-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: #050505;
            }

            /* The burning core / explosion background */
            .explosion-bg {
                position: absolute; inset: -50%; width: 200%; height: 200%;
                background: radial-gradient(circle, #E53E3E 0%, #DD6B20 20%, transparent 60%);
                opacity: 0; z-index: 10; pointer-events: none; mix-blend-mode: color-dodge;
                transform: scale(0.1);
            }

            .smoke {
                position: absolute; inset: 0; background: url('https://www.transparenttextures.com/patterns/black-scales.png');
                opacity: 0; z-index: 15; pointer-events: none; mix-blend-mode: multiply;
            }

            .hint { position: absolute; z-index: 50; color: #FFF; font-family: 'Black Ops One', sans-serif; font-size: 2rem; padding: 15px 40px; border: 4px solid #E53E3E; background: rgba(229, 62, 62, 0.2); cursor: pointer; text-transform: uppercase; transition: 0.2s;}
            .hint:hover { background: rgba(229, 62, 62, 0.5); }

            /* Heavy Metal Text */
            .msg-board {
                position: absolute; z-index: 30; padding: 40px; text-align: center; width: 90%; max-width: 900px;
                opacity: 0; transform: scale(3); pointer-events: none;
            }

            .m-head { font-family: 'Black Ops One', cursive; font-size: 4rem; color: #FFF; text-shadow: 0 0 20px #E53E3E, 4px 4px 0 #000; margin-bottom: 20px; line-height: 1.1; text-transform: uppercase;}
            .m-body { font-family: 'Roboto', sans-serif; font-weight: 900; font-size: 2.5rem; color: #F6AD55; line-height: 1.2; text-shadow: 2px 2px 0 #000, -1px -1px 0 #000; text-transform: uppercase; }
            .m-foot { font-family: 'Black Ops One', cursive; font-size: 1.5rem; color: #E2E8F0; margin-top: 50px; }

        </style>

        <div class="action-scene" id="scene">
            <div class="explosion-bg" id="burst"></div>
            <div class="smoke" id="smoke"></div>

            <div class="hint" id="igniteBtn">DETONATE</div>

            <div class="msg-board" id="msgBox">
                <div class="m-head" style="color:#F56565;">TARGET: ${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-foot">MISSION BY: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const igniteBtn = document.getElementById('igniteBtn');
    const burst = document.getElementById('burst');
    const smoke = document.getElementById('smoke');
    const msgBox = document.getElementById('msgBox');
    const scene = document.getElementById('scene');

    igniteBtn.addEventListener('click', () => {
        igniteBtn.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Ignite flash
        gsap.to(scene, { backgroundColor: '#FFF', duration: 0.1, yoyo: true, repeat: 1 });
        
        // 2. Explosion expand
        tl.to(burst, { opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" })
          .to(burst, { opacity: 0.3, scale: 1.5, duration: 2, ease: "power2.out" }, "+=0.1")
          
        // 3. Smoke filled screen
          .to(smoke, { opacity: 0.5, duration: 1 }, "-=1.5")
          
        // 4. Text IMPACT (slams into screen)
          .to(msgBox, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)", pointerEvents: 'auto' }, "-=1.5")
          
        // 5. Screen shake hard
          .call(() => {
              gsap.to(scene, { x: 20, y: 20, duration: 0.05, yoyo: true, repeat: 10 });
          }, null, "-=0.5");
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
