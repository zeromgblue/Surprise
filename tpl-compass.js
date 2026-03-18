export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#1c1917"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Cinzel:wght@500;700&display=swap');
            
            .compass-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle, #44403c, #1c1917);
                perspective: 1500px;
            }

            .hint { position: absolute; top: 15vh; color: #d6d3d1; font-family: 'Cinzel', serif; font-size: 1.5rem; z-index: 50; letter-spacing: 5px; animation: pulse 2s infinite; pointer-events:none;}
            @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

            /* 3D Compass */
            .compass-wrapper {
                position: relative; width: 250px; height: 250px; transform-style: preserve-3d;
                cursor: pointer; z-index: 20; transform: rotateX(20deg); transition: transform 0.5s;
            }

            .compass-base {
                position: absolute; inset: 0; background: radial-gradient(circle, #fcd34d, #b45309);
                border-radius: 50%; box-shadow: inset 0 0 30px rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.6);
                display: flex; align-items: center; justify-content: center; border: 10px solid #78350f;
            }

            /* Golden dial inside containing message */
            .compass-dial {
                width: 90%; height: 90%; background: #000; border-radius: 50%; border: 4px solid #f59e0b;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                padding: 10px; box-sizing: border-box; text-align: center; overflow: hidden;
            }
            .glow-msg {
                font-family: 'Cinzel Decorative', serif; font-size: 1.2rem; color: #fef08a;
                text-shadow: 0 0 10px #facc15; opacity: 0;
            }
            .pointer {
                position: absolute; width: 4px; height: 100px; background: linear-gradient(to bottom, #ef4444 50%, #d1d5db 50%);
                border-radius: 2px; z-index: 5; animation: spinCompass 3s ease-in-out infinite alternate;
            }

            @keyframes spinCompass { 0%{transform:rotate(-45deg);} 100%{transform:rotate(120deg);} }

            /* The Lid */
            .compass-lid {
                position: absolute; inset: -10px; background: radial-gradient(circle, #f59e0b, #78350f);
                border-radius: 50%; transform-origin: top center; z-index: 30;
                box-shadow: inset 0 0 20px rgba(255,255,255,0.3), 0 10px 20px rgba(0,0,0,0.5);
                display: flex; align-items: center; justify-content: center;
                border: 4px solid #b45309; backface-visibility: hidden;
            }
            .compass-lid-inner {
                position: absolute; inset: -10px; background: radial-gradient(circle, #d97706, #92400e);
                border-radius: 50%; transform: rotateX(180deg); transform-origin: top center; z-index: 29;
                border: 4px solid #b45309; flex-direction: column; align-items:center; justify-content:center;
                display: flex; color: #fde047; font-family: 'Cinzel', serif; text-shadow: inset 0 1px 1px #000;
            }
            .lid-star { font-size: 4rem; color: #fcd34d; text-shadow: 0 -1px 1px rgba(0,0,0,0.5); }

            /* Final Expanded Msg Overlay */
            .expanded-msg {
                position: absolute; inset: 0; padding: 40px; z-index: 80;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                background: rgba(28, 25, 23, 0.9); opacity: 0; pointer-events: none; text-align: center;
            }
            .m-head { font-family: 'Cinzel Decorative', serif; font-size: 3rem; color: #fcd34d; margin-bottom: 20px; }
            .m-body { font-family: 'Cinzel', serif; font-size: 1.5rem; color: #fef08a; line-height: 1.8; max-width: 700px; }

        </style>

        <div class="compass-scene">
            <div class="hint" id="hint">เปิดฝาเข็มทิศ</div>

            <div class="compass-wrapper" id="compass">
                <div class="compass-base">
                    <div class="compass-dial" id="dial">
                        <div class="pointer" id="pointer"></div>
                        <div class="glow-msg" id="dialMsg" style="font-size: 0.8rem;">
                            FIND<br>YOUR<br>WAY
                        </div>
                    </div>
                </div>
                <!-- Inner Backface Lid -->
                <div class="compass-lid-inner" id="lidInner">
                    <div class="lid-star">✧</div>
                </div>
                <!-- Outer Frontface Lid -->
                <div class="compass-lid" id="lidOuter">
                    <div class="lid-star" style="color: #451a03;">✧</div>
                </div>
            </div>

            <div class="expanded-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">"${escapeHtml(data.message).replace(/\n/g, '<br>')}"</div>
                <div style="font-family:'Cinzel'; margin-top:30px; color:#b45309; font-size:1.2rem;">GUIDED BY ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const compass = document.getElementById('compass');
    const lidOuter = document.getElementById('lidOuter');
    const lidInner = document.getElementById('lidInner');
    const pointer = document.getElementById('pointer');
    const dialMsg = document.getElementById('dialMsg');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');

    // Float animation
    gsap.to(compass, { y: -15, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });

    let isOpened = false;

    compass.addEventListener('click', () => {
        if(isOpened) return;
        isOpened = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Zoom in object
        tl.to(compass, { scale: 1.5, rotationX: 40, duration: 1, ease: "power2.out" })
          
        // 2. Open Lid (both faces rotate together)
          .to([lidOuter, lidInner], { rotationX: 130, duration: 1.5, ease: "back.out(1.2)" })
          
        // 3. Pointer spins like crazy finding 'true north' and vanishes
          .to(pointer, { rotation: "+=1080", opacity: 0, duration: 2, ease: "power4.inOut" }, "-=0.5")
          
        // 4. Little glowing text shows
          .to(dialMsg, { opacity: 1, duration: 1 }, "-=0.5")
          
        // 5. Expand text to full screen overlay
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5, delay: 1 });
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
