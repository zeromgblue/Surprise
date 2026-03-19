export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#02050A"; // Pitch black cave
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Quicksand:wght@300;400&display=swap');
            
            .cave-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden;
            }

            /* Rock texture */
            .cave-bg {
                position: absolute; inset:0;
                background: url('https://www.transparenttextures.com/patterns/black-scales.png'), radial-gradient(circle at center, #0F1A24 0%, #02050A 80%);
                z-index: 1; opacity: 0.5; transition: 2s ease;
            }

            /* The Glowing Crystal */
            .crystal-cluster {
                position: relative; width: 200px; height: 300px;
                display: flex; align-items: flex-end; justify-content: center;
                z-index: 10; cursor: pointer;
            }
            
            .crystal {
                position: absolute; bottom: 0;
                background: linear-gradient(to bottom, #00FFFF, #0055FF);
                clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
                box-shadow: 0 0 20px #00FFFF, inset 0 0 20px #FFF;
                opacity: 0.6; transition: 0.5s;
            }
            .c-main { width: 100px; height: 250px; z-index: 3; filter: drop-shadow(0 0 20px #00FFFF); }
            .c-left { width: 60px; height: 150px; left: 10px; transform: rotate(-20deg); z-index: 2; opacity: 0.4; background: linear-gradient(to bottom, #00E5FF, #0033AA); }
            .c-right { width: 80px; height: 180px; right: 10px; transform: rotate(15deg); z-index: 2; opacity: 0.4; background: linear-gradient(to bottom, #00A6FF, #001188); }

            .crystal-cluster:hover .crystal { opacity: 0.9; filter: drop-shadow(0 0 40px #00FFFF); }

            .hint { position: absolute; top: 20%; color:#00FFFF; font-family:'Cinzel', serif; letter-spacing: 3px; z-index:20; opacity:0.5; pointer-events:none;}

            /* Holographic cave message */
            .cave-msg {
                position: absolute; inset:0; z-index: 20; padding: 40px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none; transform: translateY(-50px);
            }

            .m-head { font-family: 'Cinzel', serif; font-size: 2.5rem; color: #E0FFFF; text-shadow: 0 0 20px #00FFFF, 0 0 40px #0055FF; margin-bottom: 20px; letter-spacing:2px;}
            .m-body { font-family: 'Quicksand', sans-serif; font-size: 1.5rem; color: #FFF; line-height: 1.6; text-shadow: 0 0 10px #00FFFF; max-width: 800px;}
            
        </style>

        <div class="cave-scene">
            <div class="cave-bg" id="bg"></div>
            
            <div class="hint" id="hint">แตะคริสตัล</div>

            <div class="crystal-cluster" id="gem">
                <div class="crystal c-left"></div>
                <div class="crystal c-right"></div>
                <div class="crystal c-main"></div>
            </div>

            <div class="cave-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-head" style="font-size:1.2rem; margin-top:40px; color:#00FFFF; text-shadow:none;">— ${escapeHtml(data.sender)} —</div>
            </div>
        </div>
    `;

    const gem = document.getElementById('gem');
    const bg = document.getElementById('bg');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    let resonating = false;

    // Pulse gentle glow
    gsap.to('.c-main', { filter: "drop-shadow(0 0 40px #00FFFF)", duration: 2, yoyo: true, repeat: -1 });

    gem.addEventListener('click', () => {
        if(resonating) return;
        resonating = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Crystals resonate and glow immensely
        tl.to('.crystal', { background: 'linear-gradient(to bottom, #FFFFFF, #00FFFF)', opacity: 1, duration: 1 })
          .to('.c-main', { scale: 1.1, duration: 1, filter: "drop-shadow(0 0 100px #00FFFF)" }, 0)
          
        // 2. Cave illuminates
          .to(bg, { opacity: 1, background: "url('https://www.transparenttextures.com/patterns/black-scales.png'), radial-gradient(circle at center, rgba(0,255,255,0.4) 0%, #02050A 100%)", duration: 2 }, 0)
          
        // 3. Message materializes globally in the air
          .to(msg, { opacity: 1, y: 0, duration: 2, pointerEvents:'auto', ease:"power2.out" }, 1);
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
