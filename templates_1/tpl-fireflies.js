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
            @import url('https://fonts.googleapis.com/css2?family=Caveat+Brush&family=Mali:wght@400;600&display=swap');
            
            .forest-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle at center, #064e3b, #022c22, #000);
            }

            /* Tree silhouettes for depth */
            .trees {
                position: absolute; bottom: -50px; width: 120vw; height: 60vh;
                background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><path d="M10 50 L15 20 L20 50 M30 50 L35 10 L40 50 M50 50 L55 30 L60 50 M70 50 L75 15 L80 50 M90 50 L95 25 L100 50" stroke="%23064e3b" stroke-width="5" fill="none"/></svg>') repeat-x bottom center;
                background-size: contain; filter: blur(3px) brightness(0.2); z-index: 5;
            }

            /* Instruction layer */
            .hint-text {
                position: absolute; z-index: 20; color: #a7f3d0; font-family: 'Mali', cursive;
                font-size: 1.5rem; text-shadow: 0 0 10px #34d399; animation: pulse 2s infinite;
                text-align: center; cursor: pointer; padding: 20px;
            }
            @keyframes pulse { 0%,100%{opacity:0.4;} 50%{opacity:1;} }

            /* Fireflies Container */
            .fireflies-box {
                position: absolute; inset: 0; z-index: 10; pointer-events: none;
            }
            .firefly {
                position: absolute; width: 8px; height: 8px; background: #bef264;
                border-radius: 50%; box-shadow: 0 0 15px 5px #a3e635; filter: blur(1px);
                opacity: 0; /* will fade in and flicker */
            }

            /* Glow Message */
            .magic-msg {
                position: absolute; inset: 0; padding: 40px; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
            }
            .m-head { font-family: 'Caveat Brush', cursive; font-size: 4rem; color: #d9f99d; margin-bottom: 20px; text-shadow: 0 0 20px #84cc16; text-align: center; letter-spacing: 2px;}
            .m-body { font-family: 'Mali', sans-serif; font-size: 1.5rem; color: #f0fdf4; line-height: 1.6; max-width: 600px; text-align: center; font-weight: 600; text-shadow: 0 2px 10px #064e3b;}
            .m-foot { font-family: 'Caveat Brush', cursive; font-size: 2rem; color: #bef264; margin-top: 40px; letter-spacing: 1px;}

        </style>

        <div class="forest-scene" id="scene">
            <div class="trees"></div>
            
            <div class="fireflies-box" id="ffBox"></div>

            <div class="hint-text" id="hint">แตะเพื่อเรียกหิ่งห้อย</div>

            <div class="magic-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">MAGIC SENT BY: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const hint = document.getElementById('hint');
    const ffBox = document.getElementById('ffBox');
    const msg = document.getElementById('msg');
    
    // Create random ambient fireflies initially (faded)
    let ambientFlies = [];
    for(let i=0; i<40; i++) {
        let f = document.createElement('div');
        f.className = 'firefly';
        ffBox.appendChild(f);
        
        // Random start positions
        let x = Math.random() * window.innerWidth;
        let y = Math.random() * window.innerHeight;
        gsap.set(f, { x, y, scale: Math.random()*0.5 + 0.5 });
        
        // Slow random movement
        gsap.to(f, {
            x: "+=" + (Math.random()-0.5)*100,
            y: "+=" + (Math.random()-0.5)*100,
            duration: 3 + Math.random()*3,
            yoyo: true, repeat: -1, ease: "sine.inOut"
        });
        
        // Flickering
        gsap.to(f, { opacity: Math.random()*0.6 + 0.2, duration: 0.5 + Math.random(), yoyo: true, repeat: -1 });
        ambientFlies.push(f);
    }

    let isSummoned = false;

    hint.addEventListener('click', () => {
        if(isSummoned) return;
        isSummoned = true;
        
        gsap.to(hint, { opacity: 0, duration: 0.5 });

        const tl = gsap.timeline();

        // 1. All ambient fireflies swarm to the center and get very bright
        ambientFlies.forEach(f => {
            gsap.killTweensOf(f, "opacity"); // Stop old flickering opacity
            tl.to(f, {
                x: window.innerWidth / 2 + (Math.random()-0.5)*300,
                y: window.innerHeight / 2 + (Math.random()-0.5)*300,
                opacity: 1, scale: 1.5,
                duration: 2 + Math.random(),
                ease: "power2.inOut"
            }, 0);
        });

        // 2. Add more new fireflies rapidly to make it super bright
        tl.call(() => {
            for(let i=0; i<60; i++) {
                let f = document.createElement('div');
                f.className = 'firefly';
                ffBox.appendChild(f);
                gsap.set(f, { x: window.innerWidth/2, y: window.innerHeight/2, scale: 0, opacity: 1 });
                gsap.to(f, {
                    x: window.innerWidth/2 + (Math.random()-0.5)*600,
                    y: window.innerHeight/2 + (Math.random()-0.5)*600,
                    scale: Math.random()*2,
                    duration: 2 + Math.random()*2,
                    ease: "power2.out",
                    opacity: 0,
                    onComplete: ()=>f.remove()
                });
            }
        }, null, 1.5);

        // 3. The fireflies form the message!
        tl.to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 }, 1.5);
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
