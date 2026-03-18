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
            @import url('https://fonts.googleapis.com/css2?family=Jura:wght@600;700&family=Kanit:wght@300;500&display=swap');
            
            .meteor-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                overflow: hidden; background: linear-gradient(180deg, #020617, #0f172a, #1e293b);
            }

            .starsBg { position: absolute; inset:0; background: url('https://www.transparenttextures.com/patterns/stardust.png'); opacity: 0.8; z-index: 1;}

            /* Landscape */
            .ground {
                position: absolute; bottom: 0; width: 100vw; height: 15vh;
                background: #020617; border-top: 2px solid #334155; z-index: 10;
            }

            /* Meteor Wrapper */
            .meteor {
                position: absolute; top: -200px; right: -200px;
                width: 100px; height: 100px; z-index: 20; transform: rotate(45deg);
                display: flex; align-items: center;
            }

            .rock {
                width: 40px; height: 40px; background: #fb923c; border-radius: 50%;
                box-shadow: 0 0 20px #f97316, inset -5px -5px 10px #7c2d12;
                position: relative; z-index: 2;
            }

            .tail {
                position: absolute; right: 20px; width: 150px; height: 20px;
                background: linear-gradient(90deg, transparent, #ea580c 50%, #fef08a);
                filter: blur(5px); border-radius: 50%; opacity: 0.8;
            }

            /* Flash overlay */
            .flash {
                position: absolute; inset:0; background: #fff; z-index: 40; opacity: 0; pointer-events: none;
            }

            /* Crater Message */
            .crater-msg {
                position: absolute; bottom: 10vh; z-index: 30; display: flex; flex-direction: column;
                align-items: center; text-align: center; opacity: 0; /* will fade in */
                filter: drop-shadow(0 0 20px #ea580c);
            }
            .m-head { font-family: 'Jura', sans-serif; font-size: 3rem; color: #fcd34d; margin-bottom: 10px; font-weight: 700; text-transform: uppercase;}
            .m-body { font-family: 'Kanit', sans-serif; font-size: 1.5rem; color: #fff; line-height: 1.6; max-width: 600px; font-weight: 300;}
            .m-foot { font-family: 'Jura', sans-serif; font-size: 1.2rem; color: #fb923c; margin-top: 20px; font-weight: 700; letter-spacing: 2px;}

            /* Target hint */
            .target {
                position: absolute; bottom: 15vh; width: 60px; height: 60px;
                border: 2px dashed #94a3b8; border-radius: 50%; z-index: 15;
                display: flex; align-items: center; justify-content: center;
                animation: rotateT 4s linear infinite; cursor: pointer;
            }
            .target::after { content: 'แตะเพื่อเรียกดาวตก'; position: absolute; bottom: -30px; width: 200px; text-align: center; font-family:'Kanit'; font-size:1rem; color: #94a3b8; animation: pulse 2s infinite;}
            @keyframes rotateT { 100% { transform: rotate(360deg); } }
            @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

        </style>

        <div class="meteor-scene" id="scene">
            <div class="starsBg"></div>
            <div class="ground"></div>

            <div class="target" id="target"></div>

            <div class="meteor" id="meteor">
                <div class="tail"></div>
                <div class="rock"></div>
            </div>

            <div class="flash" id="flash"></div>

            <div class="crater-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">IMPACT FROM: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const meteor = document.getElementById('meteor');
    const flash = document.getElementById('flash');
    const msg = document.getElementById('msg');
    const target = document.getElementById('target');
    const scene = document.getElementById('scene');
    
    // Set initial position of meteor far top right
    gsap.set(meteor, { x: window.innerWidth + 200, y: -window.innerHeight, scale: 0.5 });

    let isFalling = false;

    target.addEventListener('click', () => {
        if(isFalling) return;
        isFalling = true;
        target.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Meteor strike animation!
        tl.to(meteor, {
            x: 0, y: 0, scale: 2, /* landing near center bottom */
            duration: 1.2, ease: "power2.in"
        })
          
        // 2. Huge flash
          .to(flash, { opacity: 1, duration: 0.1 })
          .call(rumble, null)
          .set(meteor, { display: 'none' }) // Meteor is gone, destroyed!
          .to(flash, { opacity: 0, duration: 1.5, ease: "power2.out" })
          
        // 3. Glowing message reveals from the crater dust
          .to(msg, { opacity: 1, y: -50, duration: 2, ease: "power1.out" }, "-=1");
    });

    function rumble() {
        gsap.to(scene, { x: 20, y: -20, rotationZ: 1, duration: 0.05, yoyo: true, repeat: 20 });
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
