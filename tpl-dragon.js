export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#050000"; // Very dark red/black
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=MedievalSharp&family=Cinzel:wght@600&display=swap');
            
            .dragon-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; perspective: 1000px;
            }

            /* Gold pile background */
            .gold-bg {
                position: absolute; bottom: -50px; width: 120%; height: 300px;
                background: radial-gradient(ellipse at top, #3A2500 0%, #150D00 50%, transparent 100%);
                border-radius: 50% 50% 0 0; z-index: 1; filter: blur(5px);
            }

            .gold-coins {
                position: absolute; bottom: 0; left: 0; width: 100%; height: 100%;
                background: url('https://www.transparenttextures.com/patterns/gold-scale.png');
                opacity: 0.3; z-index: 2; mix-blend-mode: color-dodge;
                animation: shimmer 10s infinite linear;
            }
            @keyframes shimmer { 100%{background-position: 100px 0;} }

            /* Dragon Silhouette */
            .dragon {
                position: absolute; width: 500px; height: 400px;
                background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="%23000" d="M10,90 Q30,50 80,10 Q60,40 90,50 Q60,70 10,90 Z"/></svg>') no-repeat center/contain; /* Placeholder shape */
                filter: drop-shadow(0 0 20px #FF3300); opacity: 0; z-index: 5;
                transform: scale(2) translateY(-50px); pointer-events: none;
            }

            /* The molten gold message block */
            .treasure-block {
                position: relative; width: 300px; height: 400px;
                background: linear-gradient(135deg, #1A0000 0%, #330000 100%);
                border: 4px solid #5C0000; border-radius: 20px;
                box-shadow: 0 0 50px rgba(0,0,0,0.9), inset 0 0 30px rgba(0,0,0,0.8);
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                z-index: 10; cursor: pointer; transition: 0.3s;
                overflow: hidden;
            }
            .treasure-block:hover { transform: scale(1.05); box-shadow: 0 0 50px rgba(255,50,0,0.4), inset 0 0 30px rgba(0,0,0,0.8); }

            /* Melting overlay */
            .melt {
                position: absolute; top:0; left:0; width:100%; height:100%;
                background: #FF4500; opacity: 0; z-index: 15; pointer-events:none;
            }

            .hint-text { font-family: 'MedievalSharp', cursive; color: #FF8800; font-size: 1.2rem; letter-spacing: 2px; text-shadow: 2px 2px 4px #000; z-index: 20; }
            
            .msg-content {
                position: absolute; inset:0; z-index: 20; padding: 40px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none; /* revealed after melt */
            }

            .m-head { font-family: 'Cinzel', serif; font-size: 2.2rem; color: #FFD700; text-shadow: 0 0 10px #FF8C00, 2px 2px 5px #000; margin-bottom: 20px;}
            .m-body { font-family: 'MedievalSharp', cursive; font-size: 1.3rem; color: #FFE4B5; line-height: 1.6; text-shadow: 2px 2px 4px #000; }
            
        </style>

        <div class="dragon-scene">
            <div class="gold-bg">
                <div class="gold-coins"></div>
            </div>

            <div class="dragon" id="dragon"></div>

            <div class="treasure-block" id="block">
                <div class="melt" id="melt"></div>
                <div class="hint-text" id="hint">แตะเพื่อปลุกมังกร</div>
                
                <div class="msg-content" id="msg">
                    <div class="m-head">${escapeHtml(data.receiver)}</div>
                    <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                    <div class="m-body" style="font-size:0.9rem; color:#AA4400; margin-top:20px;">~ ${escapeHtml(data.sender)} ~</div>
                </div>
            </div>
        </div>
    `;

    const block = document.getElementById('block');
    const dragon = document.getElementById('dragon');
    const melt = document.getElementById('melt');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    let triggered = false;

    block.addEventListener('click', () => {
        if(triggered) return;
        triggered = true;
        
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Scene gets red and vibrating
        tl.to('.dragon-scene', { background: '#220000', duration: 1 })
          .to(block, { x: 5, y: -5, duration: 0.05, yoyo: true, repeat: 20 }, 0)
          
        // 2. Dragon swoop in silhouette
          .to(dragon, { opacity: 0.8, scale: 1, duration: 2, ease: "power2.out" }, 0.5)
          
        // 3. Fire breath (screen flashes orange/yellow)
          .call(() => {
              const fire = document.createElement('div');
              fire.style.cssText = "position:absolute; inset:0; background:radial-gradient(circle, #fff, #FFCC00, #FF3300); z-index:30; mix-blend-mode:screen";
              document.body.appendChild(fire);
              gsap.fromถึง(fire, {opacity:0, scale:0.5}, {opacity:1, scale:2, duration:0.5, yoyo:true, repeat:1, onComplete:()=>fire.remove()});
          })
          
        // 4. Melt the block
          .to(block, { borderColor: '#FF4500', background: 'transparent', duration: 0.5 }, "+=0.2")
          .to(melt, { opacity: 0.8, duration: 0.2, yoyo: true, repeat: 3 })
          .to(block, { boxShadow: '0 0 100px #FFCC00', duration: 1 })
          
        // 5. Reveal message inside
          .to(melt, { display: 'none' })
          .to(msg, { opacity: 1, pointerEvents:'auto', duration: 2, ease:"power2.inOut" });
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
