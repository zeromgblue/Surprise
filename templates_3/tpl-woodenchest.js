export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#000"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Pirata+One&display=swap');
            
            .cave-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle at 50% 80%, #451a03, #000);
                perspective: 1200px;
            }

            /* Golden Glow BG */
            .gold-glow {
                position: absolute; inset: 0; background: radial-gradient(circle, rgba(250, 204, 21, 0.2), transparent 60%);
                opacity: 0; z-index: 1; pointer-events: none; mix-blend-mode: screen;
            }

            /* Treasure Chest 3D */
            .chest-wrapper {
                position: relative; width: 300px; height: 200px;
                transform-style: preserve-3d; transform: rotateX(15deg) rotateY(-10deg);
                z-index: 20; cursor: pointer; transition: 0.3s;
            }

            .face { position: absolute; box-sizing: border-box; background: url('https://www.transparenttextures.com/patterns/wood-pattern.png') #78350f; border: 8px solid #451a03; box-shadow: inset 0 0 30px rgba(0,0,0,0.8); }
            
            /* Base */
            .c-front { width: 300px; height: 120px; transform: translateZ(100px); top: 80px; }
            .c-back  { width: 300px; height: 120px; transform: rotateY(180deg) translateZ(100px); top: 80px; }
            .c-left  { width: 200px; height: 120px; transform: rotateY(-90deg) translateZ(150px); top: 80px; left: 50px; }
            .c-right { width: 200px; height: 120px; transform: rotateY(90deg) translateZ(150px); top: 80px; left: 50px; }
            .c-bottom{ width: 300px; height: 200px; transform: rotateX(-90deg) translateZ(80px); background: #27272a; box-shadow: 0 50px 100px #000;}

            /* Lid */
            .chest-lid {
                position: absolute; width: 300px; height: 200px; top: -120px; transform-style: preserve-3d;
                transform-origin: bottom center; transform: translateZ(-100px) rotateX(0deg); z-index: 25;
            }
            .l-top   { width: 300px; height: 200px; background: url('https://www.transparenttextures.com/patterns/wood-pattern.png') #78350f; border: 8px solid #451a03; transform: rotateX(90deg) translateZ(100px); box-shadow: inset 0 0 30px rgba(0,0,0,0.8); border-radius: 20px 20px 0 0;}
            .l-front { width: 300px; height: 80px; background: url('https://www.transparenttextures.com/patterns/wood-pattern.png') #78350f; border: 8px solid #451a03; transform: translateZ(100px) translateY(120px); border-bottom: none; border-radius: 10px 10px 0 0;}
            .l-left  { width: 200px; height: 80px; background: url('https://www.transparenttextures.com/patterns/wood-pattern.png') #78350f; border: 8px solid #451a03; transform: rotateY(-90deg) translateZ(150px) translateY(120px); border-radius: 10px 10px 0 0;}
            .l-right { width: 200px; height: 80px; background: url('https://www.transparenttextures.com/patterns/wood-pattern.png') #78350f; border: 8px solid #451a03; transform: rotateY(90deg) translateZ(150px) translateY(120px); border-radius: 10px 10px 0 0;}
            .l-back  { width: 300px; height: 80px; background: url('https://www.transparenttextures.com/patterns/wood-pattern.png') #78350f; border: 8px solid #451a03; transform: rotateY(180deg) translateZ(100px) translateY(120px); border-radius: 10px 10px 0 0;}

            /* Lock */
            .lock {
                position: absolute; width: 40px; height: 50px; background: linear-gradient(135deg, #fcd34d, #b45309);
                top: 50px; left: 130px; transform: translateZ(105px); border-radius: 5px; box-shadow: 0 5px 10px rgba(0,0,0,0.5);
                display: flex; align-items: center; justify-content: center;
            }
            .keyhole { width: 10px; height: 15px; background: #000; border-radius: 5px 5px 0 0; position: relative; }
            .keyhole::after { content: ''; position: absolute; bottom: -5px; left: -2px; width: 14px; height: 8px; background: #000; clip-path: polygon(20% 0, 80% 0, 100% 100%, 0 100%); }

            .hint { position: absolute; top: -50px; width: 100%; text-align: center; color: #fef08a; font-family: 'Pirata One', cursive; font-size: 2rem; letter-spacing: 2px; animation: pulse 2s infinite; pointer-events:none; transform: translateZ(100px); text-shadow: 0 5px 10px #000;}
            @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

            /* Treasure inside */
            .chest-inside {
                position: absolute; width: 280px; height: 180px; background: #000;
                transform: rotateX(90deg) translateZ(80px); top: 10px; left: 10px;
                display: flex; align-items: center; justify-content: center; overflow: visible;
                box-shadow: inset 0 0 50px #000; border: 2px solid #b45309;
            }
            .gold-pile {
                width: 90%; height: 90%; border-radius: 10%; background: radial-gradient(circle, #facc15, #854d0e 60%, #000);
                opacity: 0; box-shadow: 0 0 50px #facc15, 0 0 100px #fde047;
            }

            /* Magical Message */
            .treasure-msg {
                position: absolute; inset: 0; padding: 40px; z-index: 50;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none; text-align: center;
                background: radial-gradient(circle, rgba(69, 26, 3, 0.8), rgba(0,0,0,0.9));
            }
            .m-head { font-family: 'Pirata One', cursive; font-size: 4rem; color: #fde047; margin-bottom: 20px; text-shadow: 0 5px 20px #b45309; }
            .m-body { font-family: 'Cinzel', serif; font-size: 1.5rem; color: #fef08a; line-height: 1.8; max-width: 600px; text-shadow: 0 2px 10px #000; }
            .m-foot { font-family: 'Pirata One', cursive; font-size: 2rem; color: #facc15; margin-top: 30px; letter-spacing: 2px;}

            .coin { position: absolute; width: 20px; height: 20px; background: radial-gradient(circle, #fef08a, #ca8a04); border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.5); pointer-events: none; z-index: 45;}

        </style>

        <div class="cave-scene">
            <div class="gold-glow" id="glowBg"></div>
            
            <div class="chest-wrapper" id="chest">
                <div class="face c-bottom"></div>
                <div class="face c-front"></div>
                <div class="face c-back"></div>
                <div class="face c-left"></div>
                <div class="face c-right"></div>

                <div class="chest-inside">
                    <div class="gold-pile" id="gold"></div>
                </div>

                <div class="chest-lid" id="lid">
                    <div class="hint" id="hint">เปิดหีบสมบัติ</div>
                    <div class="l-top"></div>
                    <div class="l-front">
                        <div class="lock" id="lock"><div class="keyhole"></div></div>
                    </div>
                    <div class="l-left"></div>
                    <div class="l-right"></div>
                    <div class="l-back"></div>
                </div>
            </div>

            <div class="treasure-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">"${escapeHtml(data.message).replace(/\n/g, '<br>')}"</div>
                <div class="m-foot">YOURS TRULY, ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const chest = document.getElementById('chest');
    const lid = document.getElementById('lid');
    const lock = document.getElementById('lock');
    const gold = document.getElementById('gold');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const glowBg = document.getElementById('glowBg');

    // Idle animation
    gsap.to(chest, { y: -10, rotationY: -12, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" });

    let isOpened = false;

    chest.addEventListener('click', () => {
        if(isOpened) return;
        isOpened = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Lock drops
        tl.to(lock, { y: 100, rotation: 45, opacity: 0, duration: 0.5, ease: "bounce.out" })
          
        // 2. Chest bursts open
          .to(lid, { rotationX: -110, duration: 1.5, ease: "elastic.out(1, 0.5)" })
          .to(gold, { opacity: 1, duration: 0.5 }, "-=1.2")
          .to(glowBg, { opacity: 1, duration: 1 }, "-=1.2")
          
        // 3. Zoom into the chest and spin slightly
          .to(chest, { scale: 1.5, z: 200, rotationX: 30, rotationY: 0, duration: 1.5, ease: "power2.inOut" }, "-=1")
          
        // 4. Message appears from the gold
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5 })
          .call(eruptCoins, null, "-=1");
    });

    function eruptCoins() {
        const scene = document.querySelector('.cave-scene');
        for(let i=0; i<50; i++) {
            let coin = document.createElement('div');
            coin.className = 'coin';
            scene.appendChild(coin);
            
            gsap.set(coin, { x: window.innerWidth/2, y: window.innerHeight/2 + 100 });
            
            gsap.to(coin, {
                x: window.innerWidth/2 + (Math.random()-0.5)*800,
                y: window.innerHeight/2 - Math.random()*800 - 200,
                rotationX: Math.random()*720,
                rotationY: Math.random()*720,
                duration: 1 + Math.random()*1.5,
                ease: "power4.out",
                onComplete: () => {
                    gsap.to(coin, { y: window.innerHeight + 100, duration: 1 + Math.random(), ease: "power2.in", onComplete: ()=>coin.remove() });
                }
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
