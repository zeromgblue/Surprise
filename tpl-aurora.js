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
            
            .aurora-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: #020617;
            }

            /* Stars */
            .stars-bg { position: absolute; inset:0; background: url('https://www.transparenttextures.com/patterns/stardust.png'); opacity: 0.6; z-index: 1;}

            /* Silhouette Mountain */
            .snow-mountain {
                position: absolute; bottom: 0; width: 100vw; height: 30vh;
                background: #0f172a; clip-path: polygon(0 100%, 15% 40%, 30% 80%, 50% 20%, 75% 90%, 90% 45%, 100% 100%);
                z-index: 10;
            }

            /* Aurora Waves */
            .aurora-wave {
                position: absolute; top: -20vh; left: -20vw; width: 140vw; height: 80vh;
                background: linear-gradient(180deg, transparent, rgba(52, 211, 153, 0.4), rgba(16, 185, 129, 0.1), transparent);
                filter: blur(40px); opacity: 0; z-index: 5; transform-origin: center; mix-blend-mode: screen;
            }
            .a-purple { background: linear-gradient(180deg, transparent, rgba(167, 139, 250, 0.4), rgba(139, 92, 246, 0.1), transparent); }
            
            /* Compass/trigger area */
            .sky-trigger {
                position: absolute; top: 40%; width: 100vw; height: 200px;
                z-index: 20; cursor: pointer; display: flex; align-items: center; justify-content: center;
            }
            .hint-text { color: #a7f3d0; font-family: 'Sarabun', sans-serif; font-size: 1.2rem; letter-spacing: 2px; text-shadow: 0 0 10px #10b981; animation: pulse 2s infinite;}
            @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

            /* Message Overlay */
            .northern-msg {
                position: absolute; inset: 0; padding: 40px; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
            }
            .m-head { font-family: 'Sarabun', sans-serif; font-size: 3rem; color: #a7f3d0; margin-bottom: 20px; font-weight: 700; text-shadow: 0 0 20px #10b981, 0 5px 10px #000; text-align:center;}
            .m-body { font-family: 'Sarabun', sans-serif; font-size: 1.4rem; color: #f8fafc; line-height: 1.6; max-width: 600px; text-align: center; text-shadow: 0 2px 5px #000; font-weight: 300;}
            .m-foot { font-family: 'Sarabun', sans-serif; font-size: 1.2rem; color: #6ee7b7; margin-top: 30px; font-weight: 700; letter-spacing: 1px;}

        </style>

        <div class="aurora-scene">
            <div class="stars-bg"></div>
            
            <!-- Aurora Waves -->
            <div class="aurora-wave" id="w1" style="transform: rotate(5deg);"></div>
            <div class="aurora-wave a-purple" id="w2" style="top: -10vh; transform: rotate(-10deg) scaleY(0.8);"></div>
            <div class="aurora-wave" id="w3" style="top: 0vh; transform: rotate(15deg) scaleY(0.6);"></div>

            <div class="snow-mountain"></div>
            
            <div class="sky-trigger" id="trigger">
                <div class="hint-text" id="hint">แตะท้องฟ้าเพื่อเรียกแสงเหนือ</div>
            </div>

            <div class="northern-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">FROM: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const trigger = document.getElementById('trigger');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const w1 = document.getElementById('w1');
    const w2 = document.getElementById('w2');
    const w3 = document.getElementById('w3');

    let isActive = false;

    trigger.addEventListener('click', () => {
        if(isActive) return;
        isActive = true;
        hint.style.display = 'none';
        trigger.style.pointerEvents = 'none';

        const tl = gsap.timeline();

        // Reveal waves with undulating motion
        tl.to(w1, { opacity: 1, x: -100, scaleY: 1.2, duration: 4, ease: "sine.inOut" })
          .to(w2, { opacity: 0.8, x: 100, scaleY: 1.1, duration: 5, ease: "sine.inOut" }, "-=3")
          .to(w3, { opacity: 0.9, y: 50, scaleY: 1.3, duration: 6, ease: "sine.inOut" }, "-=4")
          
        // Fade in message
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 }, "-=2");

        // Set up infinite wave loops
        gsap.to(w1, { x: 100, y: 30, rotation: 2, duration: 8, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 4 });
        gsap.to(w2, { x: -50, y: -20, rotation: -5, duration: 10, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 5 });
        gsap.to(w3, { x: 80, y: -40, rotation: 8, duration: 7, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 6 });
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
