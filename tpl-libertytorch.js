export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#bae6fd"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Fredericka+the+Great&family=Kanit:wght@300;600&display=swap');
            
            .liberty-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                overflow: hidden; background: linear-gradient(180deg, #bae6fd, #7dd3fc, #0284c7);
                transition: 2s;
            }

            .clouds {
                position: absolute; top: 10vh; width: 200vw; height: 20vh;
                background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><path d="M10 50 Q10 30 30 30 Q40 10 60 20 Q80 10 90 30 Q100 30 100 50 Z" fill="%23e0f2fe" opacity="0.6"/></svg>') repeat-x;
                background-size: auto 100%; z-index: 5; opacity: 0.8;
                animation: floatClouds 60s linear infinite;
            }
            @keyframes floatClouds { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

            /* Torch base */
            .torch-wrapper {
                position: absolute; bottom: -20vh; z-index: 20; display: flex; flex-direction: column; align-items: center;
                cursor: pointer; transform-origin: bottom center; transition: 0.3s;
            }

            /* Golden Handle */
            .handle {
                width: 60px; height: 300px; background: linear-gradient(90deg, #b45309, #fcd34d, #92400e);
                border-radius: 5px 5px 20px 20px; box-shadow: inset 0 0 10px #78350f, 0 10px 30px rgba(0,0,0,0.5);
                position: relative;
            }
            .handle-trim { position: absolute; top: -30px; left: -20px; width: 100px; height: 40px; background: #eab308; border-radius: 5px; box-shadow: inset 0 5px 5px #fef08a, 0 5px 10px rgba(0,0,0,0.5);}
            .handle-cup { position: absolute; top: -80px; left: -40px; width: 140px; height: 50px; background: #ca8a04; border-radius: 0 0 50px 50px; box-shadow: inset 0 -5px 10px #78350f;}

            /* Flame (off initially) */
            .flame {
                position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
                width: 100px; height: 140px; background: radial-gradient(ellipse at bottom, #fef08a, #ef4444, transparent);
                border-radius: 50% 50% 20% 20%; filter: blur(5px); opacity: 0; mix-blend-mode: screen;
            }
            .flame-inner { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); width: 50px; height: 80px; background: #fff; border-radius: 50%; filter: blur(3px); }

            /* Glow aura */
            .aura { position: absolute; top: -300px; left: 50%; transform: translateX(-50%); width: 400px; height: 400px; background: radial-gradient(circle, rgba(250,204,21,0.5), transparent 70%); opacity: 0; pointer-events: none;}

            .hint-text { position: absolute; bottom: 40vh; color: #1e3a8a; font-family: 'Kanit', sans-serif; font-size: 1.5rem; letter-spacing: 2px; text-shadow: 0 0 10px #bae6fd; animation: pulse 2s infinite; font-weight: 700;}
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Independence Message Overlay */
            .nyc-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(2, 6, 23, 0.8), rgba(15, 23, 42, 0.95));
            }
            .m-head { font-family: 'Fredericka the Great', cursive; font-size: 4rem; color: #facc15; margin-bottom: 20px; font-weight: 400; text-shadow: 0 0 20px #eab308;}
            .m-body { font-family: 'Kanit', sans-serif; font-size: 1.5rem; color: #f1f5f9; line-height: 1.6; max-width: 600px; text-align: center; font-weight: 300; text-shadow: 0 2px 5px #000;}
            .m-foot { font-family: 'Fredericka the Great', cursive; font-size: 2rem; color: #38bdf8; margin-top: 40px; letter-spacing: 4px;}

        </style>

        <div class="liberty-scene" id="scene">
            <div class="clouds"></div>
            
            <div class="hint-text" id="hint">จุดคบเพลิงเสรีภาพ</div>

            <div class="torch-wrapper" id="torch">
                <div class="aura" id="aura"></div>
                <div class="flame" id="flame"><div class="flame-inner"></div></div>
                <div class="handle">
                    <div class="handle-cup"></div>
                    <div class="handle-trim"></div>
                </div>
            </div>

            <div class="nyc-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">"${escapeHtml(data.message).replace(/\n/g, '<br>')}"</div>
                 <div class="m-foot">${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const torch = document.getElementById('torch');
    const flame = document.getElementById('flame');
    const aura = document.getElementById('aura');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const scene = document.getElementById('scene');

    // Idle torch gently sways like a hand holding it
    gsap.to(torch, { rotationZ: 2, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" });

    let isLit = false;

    torch.addEventListener('click', () => {
        if(isLit) return;
        isLit = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Light the flame!
        tl.to(flame, { opacity: 1, duration: 1, ease: "power2.in" })
          .to(aura, { opacity: 1, duration: 2 }, "-=0.5")
          
        // 2. Day turns to night to show the glowing torch brightly
          .to(scene, { background: "linear-gradient(180deg, #1e1b4b, #0f172a, #020617)", duration: 2 }, "-=1")
          
        // 3. Flame animates continuously
          .call(() => {
              gsap.to(flame, { scaleX: 1.1, scaleY: 1.2, duration: 0.2, yoyo: true, repeat: -1, ease: "rough" });
          })
          
        // 4. Message appears from the darkness
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 }, "+=1");
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
