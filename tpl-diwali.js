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
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Playfair+Display:ital,wght@1,600&family=Prompt:wght@400;600&display=swap');
            
            .diwali-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                overflow: hidden; background: radial-gradient(circle at bottom, #7c2d12, #450a0a, #000);
                perspective: 1200px;
            }

            /* Complex Rangoli pattern floor */
            .rangoli-floor {
                position: absolute; bottom: -200px; width: 600px; height: 600px;
                background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="none" stroke="%23fbbf24" stroke-width="2"/><path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke="%23ef4444" stroke-width="2"/><circle cx="50" cy="50" r="25" fill="none" stroke="%233b82f6" stroke-width="2"/><circle cx="50" cy="50" r="5" fill="%23facc15"/></svg>') no-repeat center;
                background-size: cover; z-index: 1; transform: rotateX(70deg) rotateZ(0deg); opacity: 0.3;
                animation: slowSpin 60s linear infinite;
            }
            @keyframes slowSpin { 100%{transform: rotateX(70deg) rotateZ(360deg);} }

            /* A 3D Diya (Clay Lamp) Container */
            .diya-wrapper {
                position: absolute; bottom: 80px; width: 150px; height: 50px;
                cursor: pointer; z-index: 15; transform-style: preserve-3d;
            }

            /* Clay Base */
            .diya-base {
                position: absolute; inset: 0; background: linear-gradient(0deg, #92400e, #d97706);
                border-radius: 50%; box-shadow: inset 0 10px 20px rgba(0,0,0,0.8), 0 20px 20px rgba(0,0,0,0.7);
            }
            .diya-base::after {
                content:''; position: absolute; top: -10px; right: -20px; width: 50px; height: 50px;
                background: #b45309; border-radius: 50%; clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); transform: rotate(45deg);
            }
            /* Flame */
            .flame {
                position: absolute; top: -30px; right: -5px; width: 20px; height: 40px;
                background: radial-gradient(ellipse, #fff, #fef08a, #f97316, transparent);
                border-radius: 50% 50% 20% 20%; filter: blur(2px) drop-shadow(0 0 10px #facc15); opacity: 0;
            }

            .hint-text { position: absolute; bottom: 30vh; color: #fde047; font-family: 'Prompt', sans-serif; font-size: 1.2rem; letter-spacing: 2px; text-shadow: 0 0 10px #facc15; animation: pulse 2s infinite; font-weight: 600; z-index: 20; pointer-events: none;}
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Diwali Message Overlay */
            .festival-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(69, 10, 10, 0.8), rgba(0, 0, 0, 0.9));
            }
            .m-head { font-family: 'Cinzel', serif; font-size: 4rem; color: #facc15; margin-bottom: 20px; text-transform: uppercase; text-shadow: 0 0 20px #eab308, 0 5px 10px #000; letter-spacing: 5px;}
            .m-body { font-family: 'Prompt', sans-serif; font-size: 1.6rem; color: #ffedd5; line-height: 1.8; max-width: 600px; text-align: center; font-weight: 400; padding: 30px; border-top: 2px solid #ea580c; border-bottom: 2px solid #ea580c;}
            .m-foot { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #fb923c; margin-top: 40px; letter-spacing: 2px;}

            /* Fire sparkles box */
            .sp-box { position: absolute; inset: 0; z-index: 5; pointer-events: none; }
            .sparkle { position: absolute; background: #fff; width: 4px; height: 4px; border-radius: 50%; box-shadow: 0 0 10px #facc15; opacity: 0; mix-blend-mode: screen;}

        </style>

        <div class="diwali-scene" id="scene">
            <div class="rangoli-floor"></div>
            
            <div class="hint-text" id="hint">จุดแสงสว่างตะเกียงทิวาลี</div>

            <div class="diya-wrapper" id="diya">
                <div class="diya-base"></div>
                <div class="flame" id="flame"></div>
            </div>

            <div class="sp-box" id="spBox"></div>

            <div class="festival-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">Happy Diwali - ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const diya = document.getElementById('diya');
    const flame = document.getElementById('flame');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    const spBox = document.getElementById('spBox');
    
    // Idle bobbing
    gsap.to(diya, { y: -5, duration: 1.5, yoyo: true, repeat: -1, ease: "sine.inOut" });

    let isLit = false;

    diya.addEventListener('click', () => {
        if(isLit) return;
        isLit = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Light the flame
        tl.to(flame, { opacity: 1, duration: 0.5 })
          .call(() => gsap.to(flame, { scale: 1.2, rotation: 5, duration: 0.1, yoyo: true, repeat: -1, ease: "rough" }))
          
        // 2. Base glows up
          .to('.rangoli-floor', { opacity: 0.8, duration: 2 }, 0.5)
          
        // 3. Ambient magic lighting explodes (thousands of sparkles fly up)
          .call(emitSparkles, null, 1)

        // 4. Diwali message emerges from darkness
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 3 }, 2)
          .from('.m-head', { letterSpacing: "20px", opacity: 0, duration: 2, ease: "power2.out" }, 2);
    });

    const colors = ['#fde047', '#facc15', '#fb923c', '#ea580c', '#fff'];
    function emitSparkles() {
        // Continuous spawn
        setInterval(() => {
            let s = document.createElement('div');
            s.className = 'sparkle';
            s.style.background = colors[Math.floor(Math.random()*colors.length)];
            spBox.appendChild(s);
            
            // start from bottom center (behind diya)
            gsap.set(s, { x: window.innerWidth/2 + (Math.random()-0.5)*200, y: window.innerHeight - 150, opacity: 1 });
            
            // float up like embers
            gsap.to(s, {
                y: -100 - Math.random()*200,
                x: "+=" + ((Math.random()-0.5)*300),
                opacity: 0,
                duration: 2 + Math.random()*3,
                ease: "power1.in",
                onComplete: () => s.remove()
            });
        }, 50);
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
