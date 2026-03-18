export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#020011"; // Deep void
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Quicksand:wght@400;600&display=swap');
            
            .portal-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; align-items: center; justify-content: center;
                overflow: hidden; perspective: 1000px;
            }

            /* Portal container */
            .p-ring-wrapper {
                position: absolute; width: 300px; height: 300px;
                display:flex; align-items:center; justify-content:center;
                cursor: pointer; z-index: 10;
            }

            /* The sparkling rings */
            .p-ring {
                position: absolute; border-radius: 50%;
                border: 5px solid transparent; 
                border-top-color: #00E8FC; border-bottom-color: #B100E8;
                filter: drop-shadow(0 0 10px #00E8FC); mix-blend-mode: screen;
            }
            .pr-1 { width: 100%; height: 100%; animation: pSpin 3s linear infinite; }
            .pr-2 { width: 85%; height: 85%; border-top-color: #B100E8; border-bottom-color: #00E8FC; animation: pSpin 2s linear infinite reverse; }
            .pr-3 { width: 70%; height: 70%; border-left-color: #fff; border-right-color:#00E8FC; animation: pSpin 4s ease-in-out infinite alternate; }

            /* Center of the portal (starts closed, expands) */
            .p-core {
                position: absolute; width: 0; height: 0; border-radius: 50%;
                background: radial-gradient(circle, #fff 0%, #00E8FC 20%, #B100E8 60%, transparent 100%);
                box-shadow: 0 0 50px #00E8FC, inset 0 0 50px #B100E8;
                opacity: 0.5; transition: 1s ease;
            }

            @keyframes pSpin { 100% { transform: rotate(360deg); } }

            .hint { position: absolute; bottom: 10%; color:#fff; font-family:'Quicksand', sans-serif; letter-spacing: 2px; animation: pulse 1s infinite alternate; pointer-events:none;}
            @keyframes pulse { 0%{opacity:0.4;} 100%{opacity:1;} }

            /* Message that comes out of the portal */
            .msg-panel {
                position: absolute; inset:0; z-index: 20;
                display:flex; flex-direction:column; align-items:center; justify-content:center;
                opacity: 0; pointer-events: none; padding: 40px; text-align: center;
                transform: translateZ(-200px) scale(0.1); /* starts deep inside portal */
            }

            .m-head { font-family: 'Cinzel', serif; font-size: 3rem; color: #00E8FC; text-shadow: 0 0 20px #00E8FC, 0 0 40px #B100E8; margin-bottom: 20px;}
            .m-body { font-family: 'Quicksand', sans-serif; font-size: 1.3rem; color: #fff; line-height: 1.6; max-width: 600px; text-shadow: 1px 1px 5px rgba(0,0,0,0.8); }
            
        </style>

        <div class="portal-scene">
            <div class="p-ring-wrapper" id="portal">
                <div class="p-ring pr-1"></div>
                <div class="p-ring pr-2"></div>
                <div class="p-ring pr-3"></div>
                <div class="p-core" id="core"></div>
            </div>
            
            <div class="hint" id="hint">แตะเพื่อเปิดรอยแยกมิติเวลา</div>

            <div class="msg-panel" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-body" style="color:#B100E8; font-size:1rem; margin-top:30px;">[ Transmission from: ${escapeHtml(data.sender)} ]</div>
            </div>
        </div>
    `;

    const portal = document.getElementById('portal');
    const core = document.getElementById('core');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');

    let opened = false;

    // gentle hover
    gsap.to(portal, { scale: 1.1, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });

    portal.addEventListener('click', () => {
        if(opened) return;
        opened = true;
        hint.style.display = 'none';

        gsap.killTweensOf(portal);

        const tl = gsap.timeline();

        // 1. Portal expands massively
        tl.to(core, { width: 1000, height: 1000, opacity: 1, duration: 1.5, ease: "power4.in" })
          .to(portal, { scale: 5, duration: 1.5, ease: "power4.in" }, "-=1.5")
          
        // 2. We เข้าสู่มิติ (screen white/purple wash)
          .call(() => {
              document.querySelector('.portal-scene').style.background = "radial-gradient(circle, #fff, #B100E8, #000)";
              portal.style.display = 'none'; // hide rings now that we are inside
          })
          
        // 3. Message zooms out from the depth to the viewer
          .to(msg, {
              opacity: 1,
              z: 0,
              scale: 1,
              duration: 2,
              ease: "expo.out",
              pointerEvents: "auto"
          });
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
