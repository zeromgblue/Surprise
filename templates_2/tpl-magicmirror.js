export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#01000A"; // Pitch black with slight blue hue
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Marcellus&family=Tangerine:wght@700&display=swap');
            
            .mirror-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; align-items: center; justify-content: center;
                overflow: hidden;
            }

            /* The mirror frame */
            .mirror-frame {
                position: relative; width: 380px; height: 550px;
                border-radius: 200px 200px 10px 10px;
                background: linear-gradient(135deg, #1A1A1A, #555, #1A1A1A);
                padding: 15px; box-sizing: border-box;
                box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 0 10px #000;
                display: flex; align-items: center; justify-content: center;
                z-index: 10;
            }
            /* Ornate details using borders and pseudo-elements */
            .mirror-frame::before {
                content:''; position:absolute; top:-20px; width:80px; height:60px;
                background: linear-gradient(135deg, #FFD700, #B8860B);
                clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
                z-index: 12; box-shadow: 0 0 15px #FFD700;
            }

            /* The glass surface */
            .mirror-glass {
                position: relative; width: 100%; height: 100%;
                border-radius: 190px 190px 5px 5px;
                background: linear-gradient(135deg, #A8C2CD, #3F5E6B);
                overflow: hidden; cursor: pointer;
                box-shadow: inset 0 0 30px rgba(0,0,0,0.8);
            }
            .glass-shine {
                position: absolute; top:-50%; left:-50%; width:200%; height:200%;
                background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.8) 50%, transparent 55%);
                transform: translateX(-100%) translateY(-100%);
                transition: 0.5s; pointer-events: none;
            }
            .mirror-glass:hover .glass-shine { transform: translateX(100%) translateY(100%); transition: 1s ease-in-out; }

            /* Fog inside mirror */
            .fog {
                position: absolute; inset:0; background: url('https://www.transparenttextures.com/patterns/dust.png');
                opacity: 0.6; mix-blend-mode: screen; animation: fogDrift 20s infinite linear;
            }
            @keyframes fogDrift { 100% {background-position: 200px 200px;} }

            .hint { position: absolute; bottom: 10%; color:#B8860B; font-family:'Marcellus', serif; letter-spacing: 2px; text-shadow:0 0 10px #000; z-index:5; pointer-events:none;}

            /* Reflection content */
            .reflection-msg {
                position: absolute; inset:0; padding: 40px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none; z-index: 20; transform: scale(0.8);
            }

            .m-head { font-family: 'Marcellus', serif; font-size: 2rem; color: #FFF; text-shadow: 0 0 15px #00FFFF; margin-bottom: 20px;}
            .m-body { font-family: 'Tangerine', cursive; font-size: 3rem; color: #E0FFFF; line-height: 1.2; text-shadow: 2px 2px 4px #000; }
            
        </style>

        <div class="mirror-scene">
            <div class="hint" id="hint">จ้องเข้าไปในกระจก</div>

            <div class="mirror-frame">
                <div class="mirror-glass" id="glass">
                    <div class="glass-shine"></div>
                    <div class="fog" id="fog"></div>
                    
                    <div class="reflection-msg" id="msg">
                        <div class="m-head">${escapeHtml(data.receiver)}</div>
                        <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                        <div class="m-head" style="font-size:1.2rem; margin-top:20px; color:#FFD700;">- ${escapeHtml(data.sender)} -</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const glass = document.getElementById('glass');
    const fog = document.getElementById('fog');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    let revealed = false;

    glass.addEventListener('click', () => {
        if(revealed) return;
        revealed = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Zoom into the mirror
        tl.to('.mirror-frame', { scale: 1.5, duration: 1.5, ease: "power2.inOut" })
          
        // 2. Glass turns dark as if looking into a deep void
          .to(glass, { background: '#000', duration: 1 }, "-=0.5")
          
        // 3. Fog intensifies then dissipates
          .to(fog, { filter: 'brightness(2)', opacity: 1, duration: 0.5 })
          .to(fog, { opacity: 0, duration: 1.5 }, "+=0.2")
          
        // 4. Ghostly message appears from the deep
          .to(msg, { opacity: 1, scale: 1, duration: 2, ease: "back.out(1.2)" });
          
          // Background ambient light
          gsap.to('.mirror-scene', { background: 'radial-gradient(circle, #0F2027, #01000A)', duration: 2 });
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
