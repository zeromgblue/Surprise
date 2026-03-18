export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#000510"; // Very dark blue/black
    // Grid background for sci-fi feel
    container.style.backgroundImage = "linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px)";
    container.style.backgroundSize = "30px 30px";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const holoColor = config.from || '#00FFF5';

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&family=Share+Tech+Mono&display=swap');
            
            .holo-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
                perspective: 1000px; padding-top: 50px; box-sizing: border-box;
            }

            .drone {
                width: 120px; height: 60px; background: #222; border-radius: 20px 20px 50px 50px;
                box-shadow: inset 0 -10px 20px rgba(0,0,0,0.8), 0 5px 15px rgba(0,255,255,0.2);
                position: relative; z-index: 20; border: 2px solid #555;
                transform: translateY(-200px); /* Hidden initially */
                display: flex; justify-content: center;
            }
            /* Drone wings */
            .drone::before, .drone::after {
                content: ''; position: absolute; top: 10px; width: 60px; height: 10px;
                background: #333; border: 1px solid #666;
            }
            .drone::before { left: -50px; transform: skewY(-10deg); }
            .drone::after { right: -50px; transform: skewY(10deg); }
            
            /* Drone Lens */
            .lens {
                position: absolute; bottom: -5px; width: 30px; height: 30px; border-radius: 50%;
                background: radial-gradient(circle, #fff 10%, #00FFF5 40%, #005555 100%);
                box-shadow: 0 0 10px #00FFF5; border: 3px solid #111;
                transition: box-shadow 0.3s; cursor: pointer;
            }

            /* Hologram Beam */
            .holo-beam {
                position: absolute; top: 85px; width: 300px; height: 60vh;
                background: linear-gradient(to bottom, rgba(0,255,245,0.8) 0%, rgba(0,255,245,0.1) 70%, transparent 100%);
                clip-path: polygon(45% 0, 55% 0, 100% 100%, 0 100%);
                opacity: 0; transform-origin: top center; transform: scaleY(0);
                z-index: 5; pointer-events: none; mix-blend-mode: screen;
            }
            
            /* Scanlines for beam */
            .holo-beam::after {
                content:''; position:absolute; inset:0;
                background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px);
                animation: scan 2s linear infinite;
            }
            @keyframes scan { 0%{background-position: 0 0;} 100%{background-position: 0 20px;} }

            /* Message Container */
            .holo-msg {
                position: absolute; top: 30vh; width: 85%; max-width: 400px;
                display: flex; flex-direction: column; align-items: center; text-align: center;
                opacity: 0; z-index: 10; pointer-events: none;
                transform: rotateX(10deg); filter: drop-shadow(0 0 10px ${holoColor});
            }
            
            .h-name { font-family: 'Rajdhani', sans-serif; font-size: 2.5rem; color: #fff; text-transform: uppercase; letter-spacing: 5px; margin-bottom: 20px; text-shadow: 0 0 10px ${holoColor}, 0 0 20px ${holoColor}; }
            .h-text { font-family: 'Share Tech Mono', monospace; font-size: 1.1rem; line-height: 1.6; color: #E0FFFF; text-shadow: 0 0 5px ${holoColor}; margin-bottom: 30px; padding: 20px; border: 1px solid rgba(0,255,245,0.3); background: rgba(0,255,245,0.05); }
            
            /* Glitch effect layer */
            .glitch-layer { position: absolute; inset:0; pointer-events:none; z-index: 30; opacity: 0; mix-blend-mode: overlay; background: url('https://www.transparenttextures.com/patterns/cubes.png'); }

            .hint {
                position: absolute; bottom: 50px; font-family: 'Share Tech Mono', monospace;
                color: ${holoColor}; letter-spacing: 3px; animation: pulse 1s infinite alternate;
                opacity: 0;
            }
            @keyframes pulse { 0%{opacity:0.3;} 100%{opacity:1;} }
        </style>

        <div class="holo-scene">
            <div class="drone" id="drone">
                <div class="lens" id="lens"></div>
            </div>

            <div class="holo-beam" id="beam"></div>
            
            <div class="holo-msg" id="msg">
                <div class="h-name">${escapeHtml(data.receiver)}</div>
                <div class="h-text">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div style="font-family:'Rajdhani', sans-serif; font-size:1.2rem; color:#00FFF5;">[ LOG: ${escapeHtml(data.sender)} ]</div>
            </div>

            <div class="glitch-layer" id="glitch"></div>
            
            <div class="hint" id="hint">เริ่มการส่งสัญญาณ</div>
        </div>
    `;

    const drone = document.getElementById('drone');
    const lens = document.getElementById('lens');
    const beam = document.getElementById('beam');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const glitch = document.getElementById('glitch');

    let isDeployed = false;

    // 1. Drone flies in
    gsap.to(drone, {
        y: 0, duration: 1.5, ease: "back.out(1.2)",
        onComplete: () => {
            // hover effect
            gsap.to(drone, { y: 10, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });
            gsap.to(hint, { opacity: 1, duration: 1 });
        }
    });

    drone.addEventListener('click', () => {
        if(isDeployed) return;
        isDeployed = true;
        
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // Flash lens
        tl.to(lens, { boxShadow: "0 0 50px #fff, 0 0 100px #00FFF5", duration: 0.2, yoyo: true, repeat: 3 })
          
        // Beam shoots down
          .to(beam, { scaleY: 1, opacity: 1, duration: 0.5, ease: "power2.out" })
          
        // Msg flickers in (hologram boot up)
          .to(glitch, { opacity: 0.5, duration: 0.1, yoyo: true, repeat: 5 })
          .fromถึง(msg, 
              { opacity: 0, scale: 0.8, y: -50 }, 
              { opacity: 1, scale: 1, y: 0, duration: 1, ease: "elastic.out(1, 0.5)" },
              "-=0.5"
          )
          
        // Subtle floating of message inside beam
          .call(() => {
              gsap.to(msg, { rotationY: 10, rotationX: 5, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" });
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
