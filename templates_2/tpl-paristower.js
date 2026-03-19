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
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=Parisienne&display=swap');
            
            .paris-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                overflow: hidden; background: linear-gradient(180deg, #1e1b4b, #312e81, #020617);
            }

            .starsBg { position: absolute; inset:0; background: url('https://www.transparenttextures.com/patterns/stardust.png'); opacity: 0.6; z-index: 1;}

            /* Eiffel Tower Silhouette */
            .eiffel {
                position: absolute; bottom: 0; width: 300px; height: 600px;
                background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg"><path d="M48 0 L52 0 L60 80 L70 150 L85 200 L65 200 L55 170 L45 170 L35 200 L15 200 L30 150 L40 80 Z" fill="%230f172a"/><path d="M40 80 L60 80 M45 120 L55 120 M42 100 L58 100 M35 150 L65 150 M30 170 L70 170 M40 170 Q50 150 60 170" stroke="%23334155" stroke-width="1" fill="none"/></svg>') no-repeat bottom center;
                background-size: contain; z-index: 10;
            }

            /* Iron wire details showing illumination */
            .eiffel-lights {
                position: absolute; bottom: 0; width: 300px; height: 600px;
                background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg"><path d="M48 0 L52 0 L60 80 L70 150 L85 200 L65 200 L55 170 L45 170 L35 200 L15 200 L30 150 L40 80 Z" fill="none" stroke="%23fde047" stroke-width="0.5" stroke-dasharray="1 2"/></svg>') no-repeat bottom center;
                background-size: contain; z-index: 15; opacity: 0; transition: opacity 1s;
                filter: drop-shadow(0 0 10px #facc15) drop-shadow(0 0 20px #eab308);
            }

            /* Searchlight beams */
            .beam-left, .beam-right {
                position: absolute; bottom: 580px; left: 50%; transform-origin: bottom center;
                width: 10px; height: 800px; background: linear-gradient(0deg, rgba(253, 224, 71, 0.8), transparent);
                opacity: 0; filter: blur(5px); z-index: 5;
            }
            .beam-left { transform: translateX(-50%) rotate(-45deg); }
            .beam-right { transform: translateX(-50%) rotate(45deg); }

            /* Switch */
            .power-switch {
                position: absolute; top: 20vh; z-index: 50; padding: 15px 40px;
                background: rgba(255, 255, 255, 0.1); border: 2px solid #fde047;
                color: #fde047; font-family: 'Playfair Display', serif; font-size: 1.5rem;
                cursor: pointer; border-radius: 5px; backdrop-filter: blur(5px);
                transition: 0.3s; animation: pulse 2s infinite; text-transform: uppercase;
                letter-spacing: 2px;
            }
            .power-switch:hover { background: rgba(253, 224, 71, 0.2); transform: scale(1.05); box-shadow: 0 0 20px #fde047;}
            @keyframes pulse { 0%,100%{box-shadow: 0 0 5px #fde047;} 50%{box-shadow: 0 0 20px #eab308;} }

            /* Fireworks container */
            .fireworks-box { position: absolute; inset: 0; z-index: 8; pointer-events: none;}
            .fw-particle { position: absolute; width: 4px; height: 4px; border-radius: 50%; background: #fff; filter: blur(1px); opacity: 0; }

            /* Romantic Message Overlay */
            .paris-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 40; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(15, 23, 42, 0.8), rgba(2, 6, 23, 0.95));
            }
            .m-head { font-family: 'Parisienne', cursive; font-size: 5rem; color: #fdf08a; margin-bottom: 20px; font-weight: 700; text-shadow: 0 0 20px #eab308;}
            .m-body { font-family: 'Playfair Display', serif; font-style: italic; font-size: 1.8rem; color: #f1f5f9; line-height: 1.8; max-width: 700px; text-align: center; text-shadow: 0 2px 10px #000;}
            .m-foot { font-family: 'Playfair Display', serif; font-size: 1.2rem; color: #cbd5e1; margin-top: 40px; text-transform: uppercase; letter-spacing: 4px;}

        </style>

        <div class="paris-scene" id="scene">
            <div class="starsBg"></div>

            <div class="beam-left" id="bl"></div>
            <div class="beam-right" id="br"></div>

            <div class="eiffel"></div>
            <div class="eiffel-lights" id="eLights"></div>

            <div class="fireworks-box" id="fwBox"></div>

            <button class="power-switch" id="switch">Illuminate Paris</button>

            <div class="paris-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">"${escapeHtml(data.message).replace(/\n/g, '<br>')}"</div>
                 <div class="m-foot">FROM: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const btn = document.getElementById('switch');
    const eLights = document.getElementById('eLights');
    const bl = document.getElementById('bl');
    const br = document.getElementById('br');
    const msg = document.getElementById('msg');
    const fwBox = document.getElementById('fwBox');

    let isLit = false;

    btn.addEventListener('click', () => {
        if(isLit) return;
        isLit = true;
        
        gsap.to(btn, { opacity: 0, duration: 0.5, onComplete: ()=>btn.style.display = 'none' });

        const tl = gsap.timeline();

        // 1. Tower lights up!
        tl.to(eLights, { opacity: 1, duration: 2 })
          
        // 2. Searchlights turn on and start moving
          .to([bl, br], { opacity: 1, duration: 1 }, "-=1")
          .call(() => {
              gsap.to(bl, { rotation: 0, duration: 4, yoyo: true, repeat: -1, ease: "sine.inOut" });
              gsap.to(br, { rotation: 0, duration: 5, yoyo: true, repeat: -1, ease: "sine.inOut" });
          })
          
        // 3. Fireworks explosion
          .call(launchFireworks, null, "+=0.5")
          
        // 4. Romantic text overlay fades in over the tower
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 3, delay: 2 });
    });

    const fwColors = ['#ef4444', '#f59e0b', '#3b82f6', '#a855f7', '#ec4899'];
    function launchFireworks() {
        for(let f=0; f<5; f++) {
            setTimeout(() => {
                let fwX = window.innerWidth/2 + (Math.random()-0.5)*600;
                let fwY = window.innerHeight/2 - 100 - Math.random()*200;
                let c = fwColors[Math.floor(Math.random()*fwColors.length)];
                
                for(let i=0; i<40; i++) {
                    let p = document.createElement('div');
                    p.className = 'fw-particle';
                    p.style.background = c;
                    p.style.boxShadow = `0 0 10px ${c}`;
                    fwBox.appendChild(p);

                    gsap.set(p, { x: fwX, y: window.innerHeight, opacity: 1 });
                    
                    // Shoot up
                    gsap.to(p, {
                        y: fwY,
                        duration: 1.5,
                        ease: "power2.out",
                        onComplete: () => {
                            // Explode
                            gsap.to(p, {
                                x: "+=" + (Math.random()-0.5)*300,
                                y: "+=" + (Math.random()-0.5)*300,
                                scale: 2, opacity: 0,
                                duration: 1 + Math.random(),
                                ease: "power2.out",
                                onComplete: ()=>p.remove()
                            });
                        }
                    });
                }
            }, f * 600);
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
