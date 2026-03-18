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
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600&family=Prompt:wght@400;700&display=swap');
            
            .lk-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                overflow: hidden; background: linear-gradient(180deg, #1e1b4b, #0f172a, #020617);
                perspective: 1500px;
            }

            .moon { position: absolute; top: 10vh; width: 150px; height: 150px; background: #fef08a; border-radius: 50%; box-shadow: 0 0 100px #fef08a; filter: blur(2px); z-index: 1;}

            /* 3D River Surface */
            .river {
                position: absolute; bottom: -50px; width: 150vw; height: 60vh;
                background: linear-gradient(0deg, #020617, #1e3a8a);
                transform: rotateX(70deg); transform-origin: top center; z-index: 5;
                box-shadow: inset 0 20px 50px rgba(0,0,0,0.8);
                display: flex; justify-content: center; align-items: flex-end;
            }

            /* 3D Krathong Wrapper */
            .k-wrapper {
                position: absolute; bottom: 50px; width: 200px; height: 100px;
                transform-style: preserve-3d; z-index: 20; cursor: pointer; transition: 0.3s;
            }
            .k-wrapper:hover { filter: drop-shadow(0 0 10px #facc15); }

            /* Lotus leaves (Banana leaves) */
            .leaf {
                position: absolute; bottom: 0; width: 60px; height: 40px; background: #15803d;
                border: 2px solid #166534; border-radius: 50% 50% 0 0;
                transform-origin: bottom center;
            }
            /* Candle & Incense */
            .base-circle { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%) rotateX(70deg); width: 120px; height: 120px; background: #854d0e; border-radius: 50%;}
            .incense { position: absolute; bottom: 10px; left: 90px; width: 4px; height: 70px; background: #78350f; transform: rotate(10deg);}
            .incense2 { position: absolute; bottom: 10px; left: 95px; width: 4px; height: 70px; background: #78350f; transform: rotate(-5deg);}
            .candle { position: absolute; bottom: 10px; left: 105px; width: 15px; height: 40px; background: #fde047; border-radius: 5px; box-shadow: inset -5px 0 5px rgba(0,0,0,0.2);}
            .flame { position: absolute; bottom: 50px; left: 102px; width: 20px; height: 30px; background: radial-gradient(ellipse at bottom, #fff, #facc15, transparent); border-radius: 50%; filter: blur(2px); opacity: 0; mix-blend-mode: screen;}

            .hint-text { position: absolute; bottom: 35vh; color: #fef08a; font-family: 'Prompt', sans-serif; font-size: 1.5rem; letter-spacing: 2px; text-shadow: 0 0 10px #eab308; animation: pulse 2s infinite; font-weight: 400; z-index: 25; pointer-events: none;}
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Back lanterns Sky */
            .sky-lanterns { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
            .sl { position: absolute; width: 10px; height: 15px; background: #facc15; border-radius: 2px; box-shadow: 0 0 10px #facc15; opacity: 0;}

            /* Lanna Thai Message Overlay */
            .thai-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(15, 23, 42, 0.7), rgba(2, 6, 23, 0.95));
            }
            .m-head { font-family: 'Sarabun', sans-serif; font-size: 4rem; color: #fef08a; margin-bottom: 20px; font-weight: 600; text-shadow: 0 0 20px #eab308, 0 5px 10px #000;}
            .m-body { font-family: 'Prompt', sans-serif; font-size: 1.5rem; color: #f8fafc; line-height: 1.8; max-width: 600px; text-align: center; font-weight: 300; letter-spacing: 1px;}
            .m-foot { font-family: 'Sarabun', sans-serif; font-size: 1.2rem; color: #94a3b8; margin-top: 50px; border-top: 1px solid #475569; padding-top: 20px;}

        </style>

        <div class="lk-scene" id="scene">
            <div class="moon"></div>
            <div class="sky-lanterns" id="slBox"></div>

            <div class="hint-text" id="hint">จุดเทียนลอยกระทง</div>

            <div class="river">
                <div class="k-wrapper" id="krathong">
                    <div class="base-circle"></div>
                    <!-- Create a ring of leaves -->
                    ${Array(8).fill(0).map((_, i) => '<div class="leaf" style="left:70px; transform: rotate('+(i * 45)+'deg) translateY(-40px) rotateX(45deg);"></div>').join('')}
                    <!-- Inner ring -->
                    ${Array(6).fill(0).map((_, i) => '<div class="leaf" style="left:70px; background:#166534; transform: scale(0.8) rotate('+(i * 60 + 30)+'deg) translateY(-30px) rotateX(60deg);"></div>').join('')}
                    
                    <div class="incense"></div><div class="incense2"></div>
                    <div class="candle"></div>
                    <div class="flame" id="flame"></div>
                </div>
            </div>

            <div class="thai-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">"${escapeHtml(data.message).replace(/\n/g, '<br>')}"</div>
                 <div class="m-foot">ขอขมาพระแม่คงคา - ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const krathong = document.getElementById('krathong');
    const flame = document.getElementById('flame');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    const slBox = document.getElementById('slBox');
    
    // Idle bobbing
    gsap.to(krathong, { y: -10, rotationZ: 2, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });

    let isLit = false;

    krathong.addEventListener('click', () => {
        if(isLit) return;
        isLit = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Light the candle visually
        tl.to(flame, { opacity: 1, duration: 1 })
          .call(() => gsap.to(flame, { scale: 1.1, opacity: 0.8, duration: 0.1, yoyo: true, repeat: -1, ease: "rough" }))
          
        // 2. The Krathong floats away up the Z-axis (scaled down and moves up the screen into perspective)
          .to(krathong, {
              y: -500, // Move up screen visually
              scale: 0.2, // shrink to look far away
              duration: 10,
              ease: "power1.inOut"
          }, 1)
          
        // 3. Sky lanterns release in background
          .call(() => {
              for(let i=0; i<30; i++){
                  let L = document.createElement('div');
                  L.className = 'sl';
                  slBox.appendChild(L);
                  
                  gsap.set(L, { x: Math.random()*window.innerWidth, y: window.innerHeight, opacity: 1 });
                  gsap.to(L, {
                      y: -50, x: "+="+(Math.random()-0.5)*200,
                      duration: 10 + Math.random()*10,
                      ease: "none", delay: Math.random()*5
                  });
              }
          }, null, 2)
          
        // 4. Ethereal message glowing reflection fades in
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 3 }, 3)
          .from('.m-head', { y: 30, filter: "blur(5px)", duration: 2, ease: "power2.out" }, 3);
    });
}

function escapeHtml(str) {
    if(!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector('script[src="' + src + '"]')) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}
