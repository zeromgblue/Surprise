export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#18181b"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Prompt:wght@300;400&display=swap');
            
            .metal-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle, #27272a, #000);
            }

            /* Complex SVG Filter for Goey Metal Effect */
            .metal-filter { position: absolute; width: 0; height: 0; pointer-events: none;}

            .liquid-container {
                position: absolute; inset: 0; filter: url('#goo-metal'); display: flex;
                align-items: center; justify-content: center; z-index: 10;
            }

            /* Shiny Chrome styling */
            .metal-blob {
                position: absolute; border-radius: 50%;
                background: radial-gradient(circle at 30% 30%, #fff, #94a3b8 30%, #334155 70%, #000 100%);
                box-shadow: inset -10px -10px 20px rgba(0,0,0,0.5), inset 10px 10px 20px rgba(255,255,255,0.8);
                transition: 0.1s; cursor: pointer;
            }

            .main-blob {
                width: 150px; height: 150px; z-index: 15;
            }

            .hint-text { position: absolute; bottom: 20vh; color: #d4d4d8; font-family: 'Prompt', sans-serif; font-size: 1.2rem; letter-spacing: 2px; text-shadow: 0 0 10px #71717a; animation: pulse 2s infinite; font-weight: 300; z-index: 20; pointer-events: none;}
            @keyframes pulse { 0%,100%{opacity:0.4;} 50%{opacity:1;} }

            /* Reveal Message Overlay */
            .chrome-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                /* Glassy dark backdrop */
                background: radial-gradient(circle, rgba(24, 24, 27, 0.7), rgba(0,0,0,0.9)); backdrop-filter: blur(5px);
            }
            .m-head { font-family: 'Cinzel', serif; font-size: 4rem; color: #f4f4f5; margin-bottom: 20px; font-weight: 600; text-shadow: 0 0 10px #e4e4e7, 2px 2px 0 #52525b; letter-spacing: 3px; text-transform: uppercase;}
            .m-body { font-family: 'Prompt', sans-serif; font-size: 1.5rem; color: #a1a1aa; line-height: 1.8; max-width: 600px; text-align: center; font-weight: 300;}
            .m-foot { font-family: 'Cinzel', serif; font-size: 1.2rem; color: #71717a; margin-top: 50px; letter-spacing: 5px; border-top: 1px solid #3f3f46; padding-top: 20px;}

        </style>

        <svg class="metal-filter">
          <defs>
            <filter id="goo-metal">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10" result="goo" />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>

        <div class="metal-scene" id="scene">
            <div class="liquid-container" id="lBox">
                <div class="metal-blob main-blob" id="mainBlob"></div>
            </div>
            
            <div class="hint-text" id="hint">แตะเพื่อหลอมรวมปรอท</div>

            <div class="chrome-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">"${escapeHtml(data.message).replace(/\n/g, '<br>')}"</div>
                 <div class="m-foot">FORGED BY: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const mainBlob = document.getElementById('mainBlob');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const lBox = document.getElementById('lBox');
    
    // Idle wobble for main blob
    gsap.to(mainBlob, { scaleX: 1.1, scaleY: 0.9, duration: 1, yoyo: true, repeat: -1, ease: "sine.inOut" });

    // Spawn tiny droplets around it randomly
    const droplets = [];
    for(let i=0; i<15; i++) {
        let d = document.createElement('div');
        d.className = 'metal-blob';
        let size = Math.random()*40 + 10;
        d.style.width = size+'px'; d.style.height = size+'px';
        lBox.appendChild(d);
        droplets.push(d);

        let angle = Math.random() * Math.PI * 2;
        let dist = 100 + Math.random()*150;
        gsap.set(d, { x: Math.cos(angle)*dist, y: Math.sin(angle)*dist });
        
        // slowly orbit
        gsap.to(d, {
            x: Math.cos(angle + Math.PI)*dist,
            y: Math.sin(angle + Math.PI)*dist,
            duration: 5 + Math.random()*5,
            repeat: -1, yoyo: true, ease: "sine.inOut"
        });
    }

    let isForged = false;

    mainBlob.addEventListener('click', () => {
        if(isForged) return;
        isForged = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. All droplets get sucked rapidly into the main blob
        tl.to(droplets, {
            x: 0, y: 0, duration: 0.8, ease: "back.in(1.5)"
        })
        
        // 2. The main blob grows huge then shatters/explodes into light
        .to(mainBlob, { scale: 3, duration: 0.5, ease: "power2.out" })
        .to(mainBlob, { scale: 0, opacity: 0, duration: 0.3, ease: "power2.in" })
        
        // 3. Reveal the dark chrome elegant message
        .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 }, "+=0.2")
        .from('.m-head', { y: -50, filter: "blur(10px)", duration: 2, ease: "power3.out" }, "-=1.5");
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
