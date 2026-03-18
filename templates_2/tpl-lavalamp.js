export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#0f172a"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@700&family=Kanit:wght@300;400&display=swap');
            
            .lava-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: linear-gradient(180deg, #1e1b4b, #312e81, #0f172a);
            }

            /* Container for liquid blobs using SVG filter */
            .lava-lamp {
                position: absolute; bottom: -10vh; width: 80vw; max-width: 600px; height: 120vh;
                filter: url('#lava-goo'); display: flex; align-items: flex-end; justify-content: center;
                z-index: 5;
            }

            .lava-blob {
                position: absolute; border-radius: 50%;
                background: linear-gradient(180deg, #f43f5e, #fb923c);
                opacity: 0.9;
            }

            .base-lava {
                position: absolute; bottom: 0; width: 100%; height: 200px;
                background: #e11d48; border-radius: 50px 50px 0 0;
            }

            .hint-text { position: absolute; bottom: 10vh; color: #fca5a5; font-family: 'Kanit', sans-serif; font-size: 1.2rem; letter-spacing: 2px; text-shadow: 0 0 10px #e11d48; animation: pulse 2s infinite; font-weight: 300; z-index: 20; cursor: pointer;}
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Bubble Message Overlay */
            .float-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(15,23,42,0.6), rgba(2,6,23,0.9));
            }
            .m-head { font-family: 'Comfortaa', cursive; font-size: 4rem; color: #fecdd3; margin-bottom: 20px; font-weight: 700; text-shadow: 0 0 20px #e11d48, 0 5px 10px #000;}
            .m-body { font-family: 'Kanit', sans-serif; font-size: 1.5rem; color: #f8fafc; line-height: 1.8; max-width: 500px; text-align: center; font-weight: 400; padding: 40px; border-radius: 50%; background: radial-gradient(circle, rgba(244, 63, 94, 0.4), rgba(225, 29, 72, 0.1)); border: 2px solid rgba(251, 146, 60, 0.3); box-shadow: inset 0 0 30px rgba(244, 63, 94, 0.5), 0 10px 30px rgba(0,0,0,0.5);}
            .m-foot { font-family: 'Comfortaa', cursive; font-size: 1.5rem; color: #fda4af; margin-top: 40px; letter-spacing: 3px;}

        </style>

        <svg style="position:absolute; width:0; height:0;">
          <defs>
            <filter id="lava-goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 50 -20" result="goo" />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>

        <div class="lava-scene" id="scene">
            <div class="lava-lamp" id="lamp">
                <div class="base-lava"></div>
            </div>
            
            <div class="hint-text" id="hint">เปิดสวิตช์โคมไฟลาวา</div>

            <div class="float-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    const scene = document.getElementById('scene');
    const lamp = document.getElementById('lamp');
    
    let isHeated = false;

    scene.addEventListener('click', () => {
        if(isHeated) return;
        isHeated = true;
        hint.style.display = 'none';

        // 1. Generate floating lava blobs
        for(let i=0; i<8; i++) {
            let b = document.createElement('div');
            b.className = 'lava-blob';
            let size = 50 + Math.random()*150;
            b.style.width = size+'px'; b.style.height = size+'px';
            lamp.appendChild(b);
            
            // start at bottom
            gsap.set(b, {
                x: (Math.random()-0.5)*200,
                y: 100 // inside base
            });
            
            // float up and down continuously
            gsap.to(b, {
                y: -window.innerHeight + 200 + Math.random()*200,
                duration: 8 + Math.random()*10,
                repeat: -1, yoyo: true, ease: "sine.inOut",
                delay: Math.random()*5
            });
            // slight horizontal drift
            gsap.to(b, {
                x: "+="+(Math.random()-0.5)*150,
                duration: 5 + Math.random()*5,
                repeat: -1, yoyo: true, ease: "sine.inOut"
            });
        }

        const tl = gsap.timeline();

        // 2. Light turns on (background glows warmly)
        tl.to(scene, { background: "linear-gradient(180deg, #4c1d95, #701a75, #431407)", duration: 3 })
          
        // 3. Cute bubbly message floats up
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 }, 3)
          .from('.m-body', { scale: 0.5, borderRadius: "10%", duration: 2, ease: "elastic.out(1, 0.5)" }, 3)
          
        // 4. Continues to float slightly
          .call(() => {
              gsap.to('.m-body', { y: 20, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });
          }, null, 5);
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
