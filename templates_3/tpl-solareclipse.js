export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#020617"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Kanit:wght@300;600&display=swap');
            
            .eclipse-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: #000;
            }

            .starsBg { position: absolute; inset:0; background: url('https://www.transparenttextures.com/patterns/stardust.png'); opacity: 0.8; z-index: 1;}

            /* Text instruction */
            .hint-text { position: absolute; top: 15vh; color: #e2e8f0; font-family: 'Kanit', sans-serif; font-size: 1.2rem; letter-spacing: 2px; animation: pulse 2s infinite; z-index: 10; pointer-events: none;}
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* The Sun (Back layer) */
            .sun {
                position: absolute; width: 300px; height: 300px; background: #fff;
                border-radius: 50%; z-index: 5;
                box-shadow: 0 0 100px #facc15, 0 0 200px #ea580c, 0 0 300px #9f1239;
            }

            /* The Moon (Front layer to cover Sun) */
            .moon {
                position: absolute; width: 305px; height: 305px; background: #000;
                border-radius: 50%; z-index: 8; cursor: pointer;
                /* Start off-center for partial eclipse */
                transform: translateX(-150px);
                box-shadow: inset -20px 0 30px rgba(255,255,255,0.1);
            }

            /* Flare effect when total eclipse happens */
            .corona {
                position: absolute; width: 320px; height: 320px; border-radius: 50%;
                background: conic-gradient(from 0deg, transparent, rgba(255,255,255,0.8), transparent, rgba(250,204,21,0.5), transparent);
                z-index: 4; opacity: 0; animation: spinCorona 10s linear infinite; mix-blend-mode: screen;
            }
            @keyframes spinCorona { 100% { transform: rotate(360deg); } }

            /* Cosmic Message */
            .cosmic-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
            }
            .m-head { font-family: 'Space Grotesk', sans-serif; font-size: 3.5rem; color: #fff; margin-bottom: 20px; font-weight: 700; text-shadow: 0 0 20px #facc15; text-align: center; text-transform: uppercase;}
            .m-body { font-family: 'Kanit', sans-serif; font-size: 1.5rem; color: #cbd5e1; line-height: 1.6; max-width: 600px; text-align: center; font-weight: 300;}
            .m-foot { font-family: 'Space Grotesk', sans-serif; font-size: 1.2rem; color: #94a3b8; margin-top: 50px; text-transform: uppercase; letter-spacing: 3px;}

        </style>

        <div class="eclipse-scene">
            <div class="starsBg"></div>
            
            <div class="hint-text" id="hint">ลากดวงจันทร์ให้ทับดวงอาทิตย์ (หรือกดแตะ)</div>

            <div class="sun" id="sun"></div>
            <div class="corona" id="corona"></div>
            <div class="moon" id="moon"></div>

            <div class="cosmic-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">FROM SECTOR: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const moon = document.getElementById('moon');
    const sun = document.getElementById('sun');
    const corona = document.getElementById('corona');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const scene = document.querySelector('.eclipse-scene');

    let isEclipsed = false;

    // A simple click triggers the full eclipse animation
    moon.addEventListener('click', () => {
        if(isEclipsed) return;
        isEclipsed = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Moon slides to cover sun perfectly
        tl.to(moon, { x: 0, duration: 4, ease: "power2.inOut" })
          
        // 2. Brightness changes: background darkens fully, corona erupts
          .to(sun, { boxShadow: "0 0 20px #fff, 0 0 50px #cbd5e1", duration: 2 }, "-=1")
          .to(corona, { opacity: 1, duration: 2 }, "-=1")
          
        // 3. Message appears directly over the black moon (it acts as a canvas)
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 3 });
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
