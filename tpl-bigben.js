export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#d6d3d1"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Karla:wght@400;700&display=swap');
            
            .clock-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: linear-gradient(180deg, #78716c, #a8a29e, #d6d3d1);
            }

            /* Fog Layers */
            .fog {
                position: absolute; inset:0; background: url('https://www.transparenttextures.com/patterns/dust.png'); opacity: 0.4;
                animation: fogDrift 20s linear infinite; z-index: 5; pointer-events: none;
            }
            .fog-dense {
                position: absolute; inset:0; background: linear-gradient(180deg, rgba(214, 211, 209, 0.8), rgba(245, 245, 244, 0.9));
                z-index: 6; pointer-events: none; transition: opacity 3s;
            }
            @keyframes fogDrift { 0% { background-position: 0 0; } 100% { background-position: 200px 50px; } }

            /* Big Ben Clock Tower Top */
            .tower {
                position: absolute; top: 10vh; width: 300px; height: 500px;
                background: #d4d4d8; border: 4px solid #52525b; border-radius: 5px;
                box-shadow: 20px 20px 30px rgba(0,0,0,0.3); z-index: 10; display: flex; justify-content: center;
            }
            .tower-roof {
                position: absolute; top: -150px; width: 0; height: 0;
                border-left: 155px solid transparent; border-right: 155px solid transparent; border-bottom: 150px solid #52525b;
            }

            /* Clock Face */
            .clock-face {
                position: absolute; top: 50px; width: 220px; height: 220px;
                background: #f8fafc; border-radius: 50%; border: 15px solid #a1a1aa;
                box-shadow: inset 0 0 20px rgba(0,0,0,0.2), 0 0 10px rgba(0,0,0,0.5);
                display: flex; align-items: center; justify-content: center; cursor: pointer;
            }
            /* Inner ring design */
            .clock-face::before { content: ''; position: absolute; width: 180px; height: 180px; border: 2px solid #94a3b8; border-radius: 50%;}
            .clock-center { position: absolute; width: 15px; height: 15px; background: #1e293b; border-radius: 50%; z-index: 15; }

            /* Hands */
            .hand { position: absolute; bottom: 50%; left: 50%; transform-origin: bottom center; background: #1e293b; border-radius: 5px; z-index: 12;}
            .hour { width: 8px; height: 60px; transform: translateX(-50%) rotate(45deg); }
            .minute { width: 5px; height: 90px; transform: translateX(-50%) rotate(180deg); }

            /* Sonic Chime Ring */
            .chime-ring {
                position: absolute; top: 160px; width: 220px; height: 220px;
                border: 10px solid #facc15; border-radius: 50%; z-index: 9;
                opacity: 0; transform: scale(1); filter: blur(2px); pointer-events: none;
            }

            .hint-text { position: absolute; bottom: 15vh; color: #1c1917; font-family: 'Karla', sans-serif; font-size: 1.5rem; letter-spacing: 2px; text-shadow: 0 0 10px #fafaf9; animation: pulse 2s infinite; font-weight: 700; z-index: 20;}
            @keyframes pulse { 0%,100%{opacity:0.4;} 50%{opacity:1;} }

            /* Elegant British Message Overlay */
            .london-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(248, 250, 252, 0.8), rgba(168, 162, 158, 0.95));
            }
            .m-head { font-family: 'Playfair Display', serif; font-size: 4.5rem; color: #1e293b; margin-bottom: 20px; font-weight: 700; text-shadow: 2px 2px 0px #fff;}
            .m-body { font-family: 'Karla', sans-serif; font-size: 1.5rem; color: #44403c; line-height: 1.8; max-width: 600px; text-align: center; font-weight: 400; font-style: italic;}
            .m-foot { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: #78716c; margin-top: 40px; letter-spacing: 2px; border-top: 1px solid #78716c; padding-top: 10px;}

        </style>

        <div class="clock-scene" id="scene">
            <div class="fog"></div>
            <div class="fog-dense" id="denseFog"></div>
            
            <div class="hint-text" id="hint">หมุนเข็มนาฬิกาบิ๊กเบน</div>

            <div class="tower">
                <div class="tower-roof"></div>
                <div class="clock-face" id="clockBtn">
                    <div class="clock-center"></div>
                    <div class="hand hour" id="hHand"></div>
                    <div class="hand minute" id="mHand"></div>
                </div>
            </div>

            <div class="chime-ring" id="ring"></div>

            <div class="london-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">"${escapeHtml(data.message).replace(/\n/g, '<br>')}"</div>
                 <div class="m-foot">YOURS FAITHFULLY, ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const clockBtn = document.getElementById('clockBtn');
    const hHand = document.getElementById('hHand');
    const mHand = document.getElementById('mHand');
    const ring = document.getElementById('ring');
    const denseFog = document.getElementById('denseFog');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const scene = document.getElementById('scene');

    let isChiming = false;

    clockBtn.addEventListener('click', () => {
        if(isChiming) return;
        isChiming = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Hands spin rapidly exactly to midnight (12 o'clock / 360deg)
        tl.to(mHand, { rotation: 360*5, duration: 3, ease: "power2.inOut" }, 0)
          .to(hHand, { rotation: 360, duration: 3, ease: "power2.inOut" }, 0)
          
        // 2. Chime effect (sonic rings)
          .call(() => {
              gsap.fromTo(ring, { scale: 1, opacity: 0.8 }, { scale: 3, opacity: 0, duration: 1, ease: "power1.out" });
              gsap.fromTo(scene, { y: -5 }, { y: 0, duration: 0.1, yoyo: true, repeat: 10 });
          }, null, 3)

        // 3. Dense fog blows away rapidly
          .to(denseFog, { opacity: 0, duration: 2 }, 3.5)
          
        // 4. Elegant text overlay fades in
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 }, 4.5);
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
