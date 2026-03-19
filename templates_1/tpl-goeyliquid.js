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
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Prompt:wght@200;600&display=swap');
            
            .fluid-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: #000;
            }

            /* Complex SVG Filter for Goey Liquid Effect */
            .goey-filter { position: absolute; width: 0; height: 0; pointer-events: none;}

            /* Liquid Container */
            .liquid-box {
                position: absolute; inset: 0; filter: url('#goo'); display: flex;
                align-items: center; justify-content: center; z-index: 10;
            }

            .ink-drop {
                position: absolute; border-radius: 50%; background: #3b82f6;
                transition: transform 0.1s; mix-blend-mode: screen; opacity: 0.8;
            }

            /* Golden Swirls */
            .gold-swirl {
                position: absolute; border-radius: 50%; background: radial-gradient(circle, #facc15, #b45309);
                filter: blur(5px); opacity: 0; mix-blend-mode: color-dodge;
            }

            .hint-text { position: absolute; bottom: 15vh; color: #fff; font-family: 'Prompt', sans-serif; font-size: 1.2rem; letter-spacing: 2px; text-shadow: 0 0 10px #3b82f6; animation: pulse 2s infinite; font-weight: 200; z-index: 20;}
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Artistic Message Overlay */
            .art-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(0,0,0,0.5), rgba(0,0,0,0.9)); backdrop-filter: blur(2px);
            }
            .m-head { font-family: 'Cinzel', serif; font-size: 4.5rem; color: #facc15; margin-bottom: 20px; font-weight: 700; text-shadow: 0 0 30px #b45309, 2px 2px 0px #000; letter-spacing: 5px; text-transform: uppercase;}
            .m-body { font-family: 'Prompt', sans-serif; font-size: 1.6rem; color: #e0f2fe; line-height: 1.8; max-width: 700px; text-align: center; font-weight: 200; text-shadow: 0 2px 10px #000;}
            .m-foot { font-family: 'Cinzel', serif; font-size: 1.5rem; color: #93c5fd; margin-top: 40px; letter-spacing: 4px; font-weight: 400;}

        </style>

        <svg class="goey-filter">
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -15" result="goo" />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>

        <div class="fluid-scene" id="scene">
            <div class="liquid-box" id="lBox"></div>
            
            <div class="hint-text" id="hint">ลากนิ้ว/เมาส์เพื่อสร้างงานศิลปะ (แล้วคลิก)</div>

            <div class="art-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const lBox = document.getElementById('lBox');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const scene = document.getElementById('scene');
    
    // Initial big drop in center
    const centerDrop = document.createElement('div');
    centerDrop.className = 'ink-drop';
    centerDrop.style.width = '200px';
    centerDrop.style.height = '200px';
    centerDrop.style.background = '#1e3a8a';
    lBox.appendChild(centerDrop);
    gsap.set(centerDrop, { x: window.innerWidth/2 - 100, y: window.innerHeight/2 - 100 });
    gsap.to(centerDrop, { scale: 1.2, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });

    // Interactive drawing
    let isRevealed = false;
    let drops = [];

    scene.addEventListener('mousemove', draw);
    scene.addEventListener('touchmove', e => {
        let touch = e.touches[0];
        draw({clientX: touch.clientX, clientY: touch.clientY});
    });

    const colors = ['#3b82f6', '#0284c7', '#0ea5e9', '#06b6d4', '#6366f1'];

    function draw(e) {
        if(isRevealed) return;
        
        // limit drop frequency
        if(Math.random() > 0.3) return;

        const d = document.createElement('div');
        d.className = 'ink-drop';
        let size = Math.random() * 80 + 20;
        d.style.width = size + 'px';
        d.style.height = size + 'px';
        d.style.background = colors[Math.floor(Math.random() * colors.length)];
        lBox.appendChild(d);
        
        gsap.set(d, { x: e.clientX - size/2, y: e.clientY - size/2, scale: 0 });
        gsap.to(d, { scale: 1, duration: 1, ease: "elastic.out(1, 0.3)" });
        
        // slowly drift
        gsap.to(d, { x: "+="+(Math.random()-0.5)*50, y: "+="+(Math.random()-0.5)*50, duration: 5, ease: "sine.inOut" });
        drops.push(d);
    }

    scene.addEventListener('click', () => {
        if(isRevealed) return;
        isRevealed = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. All drops suddenly expand and pull to center then explode
        tl.to([...drops, centerDrop], {
            x: window.innerWidth/2 - 50,
            y: window.innerHeight/2 - 50,
            scale: 0.1,
            duration: 1,
            ease: "power2.in"
        })
        .to([...drops, centerDrop], {
            scale: 30, // massive explosion covering screen
            opacity: 0,
            duration: 1.5,
            ease: "power2.out"
        })
        
        // 2. Add some golden swirls behind text
        .call(() => {
            for(let i=0; i<5; i++){
                let g = document.createElement('div');
                g.className = 'gold-swirl';
                let size = 300 + Math.random()*200;
                g.style.width = size+'px'; g.style.height = size+'px';
                scene.appendChild(g);
                gsap.set(g, { x: window.innerWidth/2 - size/2, y: window.innerHeight/2 - size/2 });
                gsap.to(g, { opacity: 0.5, rotation: 360, x: "+="+(Math.random()-0.5)*200, y: "+="+(Math.random()-0.5)*200, duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut" });
            }
        }, null, 1)

        // 3. Reveal elegant message
        .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 }, 1.5);
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
