export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#020617"; // Night sky
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;700&display=swap');
            
            .sky-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                overflow: hidden; background: linear-gradient(180deg, #020617, #172554, #1e3a8a);
                perspective: 1000px;
            }

            /* Stars bg */
            .stars { position: absolute; inset:0; background: url('https://www.transparenttextures.com/patterns/stardust.png'); opacity: 0.5; z-index: 1;}

            /* Sky Lantern 3D Cylinder/Box */
            .lantern-wrapper {
                position: absolute; bottom: 10vh; width: 150px; height: 220px;
                transform-style: preserve-3d; cursor: pointer; z-index: 20;
            }

            .l-face { position: absolute; background: rgba(254, 240, 138, 0.8); border: 2px solid #b45309; box-sizing: border-box; box-shadow: inset 0 0 20px rgba(0,0,0,0.2); }
            
            .l-front { width: 150px; height: 220px; transform: translateZ(75px); display: flex; align-items: center; justify-content: center; text-align: center; padding: 10px; border-radius: 20px 20px 0 0; }
            .l-back  { width: 150px; height: 220px; transform: rotateY(180deg) translateZ(75px); border-radius: 20px 20px 0 0;}
            .l-left  { width: 150px; height: 220px; transform: rotateY(-90deg) translateZ(75px); border-radius: 20px 20px 0 0;}
            .l-right { width: 150px; height: 220px; transform: rotateY(90deg) translateZ(75px); border-radius: 20px 20px 0 0;}
            .l-bottom{ width: 150px; height: 150px; transform: rotateX(-90deg) translateZ(110px); background: transparent; border: 4px solid #78350f; border-radius: 50%; box-shadow: 0 0 50px rgba(239, 68, 68, 0.5);}

            /* Fire inside */
            .flame {
                position: absolute; bottom: -80px; left: 50%; transform: translateX(-50%) translateZ(0); width: 40px; height: 60px;
                background: radial-gradient(ellipse at bottom, #fde047 0%, #ef4444 60%, transparent 100%);
                border-radius: 50%; filter: blur(2px); opacity: 0; transition: 1s; animation: flicker 0.1s infinite alternate;
            }
            @keyframes flicker { 0% { opacity: 0.8; transform: translateX(-50%) scale(0.9); } 100% { opacity: 1; transform: translateX(-50%) scale(1.1); } }

            .hint-text { position: absolute; top: 15vh; color: #fde047; font-family: 'Sarabun', sans-serif; font-size: 1.5rem; letter-spacing: 2px; z-index: 30; animation: pulse 2s infinite; font-weight: bold;}
            @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

            /* Lit Glow */
            .glow-field { position: absolute; inset: 0; background: radial-gradient(circle at 50% 80%, rgba(250, 204, 21, 0.3), transparent 60%); opacity: 0; z-index: 15; mix-blend-mode: screen; pointer-events:none;}

            /* Message on the Lantern */
            .lantern-msg { font-family: 'Sarabun', sans-serif; color: #78350f; opacity: 0; word-wrap: break-word;}
            .m-head { font-weight: 700; font-size: 1.2rem; margin-bottom: 5px; }
            .m-body { font-weight: 300; font-size: 1rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden;}

            /* Full screen msg overlay for later */
            .full-msg { position: absolute; inset:0; z-index: 50; display:flex; flex-direction:column; align-items:center; justify-content:center; opacity:0; pointer-events:none; padding:40px; text-align:center;}
            .f-head { font-family: 'Sarabun', sans-serif; font-size: 3rem; color: #fef08a; margin-bottom: 20px; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.8);}
            .f-body { font-family: 'Sarabun', sans-serif; font-size: 1.5rem; color: #fff; line-height: 1.6; max-width: 600px; font-weight: 300; text-shadow: 0 2px 5px rgba(0,0,0,0.8);}
            
            /* Other small lanterns in bg */
            .bg-lantern { position: absolute; width: 30px; height: 40px; background: rgba(254, 240, 138, 0.6); box-shadow: 0 0 10px #facc15; border-radius: 5px 5px 0 0; bottom: -50px; z-index: 5;}

        </style>

        <div class="sky-scene">
            <div class="stars"></div>
            <div class="glow-field" id="glow"></div>
            
            <div class="hint-text" id="hint">จุดโคมลอย (แตะที่โคม)</div>

            <div class="lantern-wrapper" id="lantern">
                <div class="l-face l-back"></div>
                <div class="l-face l-left"></div>
                <div class="l-face l-right"></div>
                <div class="l-face l-bottom"></div>
                <!-- Flame inside -->
                <div class="flame" id="flame" style="z-index: 10;"></div>
                
                <div class="l-face l-front" style="z-index: 20;">
                    <div class="lantern-msg" id="lMsg">
                        <div class="m-head">${escapeHtml(data.receiver)}</div>
                        <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                    </div>
                </div>
            </div>

            <div class="full-msg" id="msg">
                 <div class="f-head">${escapeHtml(data.receiver)}</div>
                 <div class="f-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div style="color:#fde047; margin-top:30px; font-family:'Sarabun';">ด้วยรัก จาก ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const lantern = document.getElementById('lantern');
    const flame = document.getElementById('flame');
    const glow = document.getElementById('glow');
    const hint = document.getElementById('hint');
    const lMsg = document.getElementById('lMsg');
    const msg = document.getElementById('msg');
    
    // Slight bobbing at ground
    gsap.to(lantern, { rotationZ: 2, rotationY: 10, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });

    let isLit = false;

    lantern.addEventListener('click', () => {
        if(isLit) return;
        isLit = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Light the fire
        tl.to(flame, { opacity: 1, duration: 1 })
          .to(glow, { opacity: 1, duration: 2 }, "-=1")
          
        // 2. Text on lantern slowly appears
          .to(lMsg, { opacity: 1, duration: 1.5 })
          
        // 3. Lantern starts floating up
          .to(lantern, { y: -800, scale: 0.5, rotationY: 180, duration: 8, ease: "power1.in" }, "+=1")
          
        // 4. Background lanterns rise too
          .call(createBgLanterns, null, "-=7")
          
        // 5. Full screen text overlay appears gracefully
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 }, "-=4");
    });

    function createBgLanterns() {
        const scene = document.querySelector('.sky-scene');
        for(let i=0; i<15; i++) {
            let l = document.createElement('div');
            l.className = 'bg-lantern';
            scene.appendChild(l);
            
            gsap.set(l, { x: Math.random()*window.innerWidth, scale: Math.random()*0.5 + 0.2, opacity: 0 });
            
            gsap.to(l, {
                y: -window.innerHeight - 100,
                x: "+=" + ((Math.random()-0.5)*200),
                opacity: 1,
                duration: 5 + Math.random()*5,
                ease: "power1.inOut",
                delay: Math.random()*3
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
