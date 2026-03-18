export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#0A0514"; // Dark purple/night
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const ufoColor = config.from || '#43E97B';

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Creepster&family=Kanit:wght@400;500&display=swap');
            
            .alien-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: space-between;
                overflow: hidden;
            }

            /* The UFO */
            .ufo-wrapper {
                position: absolute; top: -150px; z-index: 20;
                display: flex; flex-direction: column; align-items: center;
            }
            
            .ufo {
                width: 150px; height: 60px; position: relative;
                display:flex; justify-content:center;
            }
            .ufo-dome {
                position: absolute; top: -20px; width: 60px; height: 40px;
                background: rgba(150,255,150,0.5); border-radius: 50% 50% 0 0;
                border: 2px solid #555; border-bottom: none; overflow:hidden;
            }
            .alien-shadow {
                position:absolute; bottom:0; left:50%; transform:translateX(-50%);
                width:20px; height:30px; background:#111; border-radius:50% 50% 0 0;
                clip-path: polygon(50% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%);
            }
            .ufo-body {
                position: absolute; width: 100%; height: 100%;
                background: radial-gradient(ellipse at top, #aaa, #333);
                border-radius: 50%; box-shadow: inset 0 -5px 15px rgba(0,0,0,0.8), 0 10px 20px rgba(0,0,0,0.5);
                border: 3px solid #222; overflow: hidden;
            }
            /* UFO Lights */
            .ufo-lights {
                position:absolute; width:100%; height:10px; top:50%; display:flex; justify-content:space-around;
            }
            .u-light { width:8px; height:8px; background: ${ufoColor}; border-radius:50%; box-shadow: 0 0 10px ${ufoColor}; animation: blink 0.5s infinite alternate; }
            .u-light:nth-child(2) { animation-delay: 0.2s;} .u-light:nth-child(3) { animation-delay: 0.4s;}
            
            @keyframes blink { 0%{opacity:0.2;} 100%{opacity:1;} }

            /* Tractor Beam */
            .tractor-beam {
                position: absolute; top: 50px; width: 200px; height: 100vh;
                background: linear-gradient(to bottom, rgba(67, 233, 123, 0.8), rgba(67, 233, 123, 0.1) 80%, transparent);
                clip-path: polygon(40% 0, 60% 0, 100% 100%, 0 100%);
                transform-origin: top center; transform: scaleY(0);
                opacity: 0; z-index: 10; pointer-events: none; mix-blend-mode: screen;
            }

            /* Ground items (Target to abduct) */
            .target-obj {
                position: absolute; bottom: 50px; font-size: 3rem; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.5));
                cursor: pointer; transition: transform 0.2s; z-index: 15;
            }
            .target-obj:hover { transform: scale(1.1); }

            .hint {
                position: absolute; bottom: 10px; color: #aaa; font-family: sans-serif; letter-spacing: 2px;
                animation: pulse 1.5s infinite; pointer-events:none;
            }

            /* Banner that drops down */
            .alien-banner {
                position: absolute; top: 15vh; width: 85%; max-width: 400px;
                background: repeating-linear-gradient(45deg, #111, #111 10px, #222 10px, #222 20px);
                border: 5px solid ${ufoColor}; box-shadow: 0 0 30px ${ufoColor}, inset 0 0 20px #000;
                padding: 30px; text-align: center; color: white; border-radius: 10px;
                z-index: 5; opacity: 0; transform: translateY(-50px) scale(0.5);
                transform-origin: top center;
            }
            
            .b-title { font-family: 'Creepster', cursive; font-size: 3rem; color: ${ufoColor}; text-shadow: 2px 2px 0 #000; margin-bottom: 20px; letter-spacing: 3px;}
            .b-msg { font-family: 'Kanit', sans-serif; font-size: 1.2rem; line-height: 1.6; text-shadow: 1px 1px 2px #000; }
            
            /* Ground */
            .ground { position:absolute; bottom:0; width:100%; height:80px; background: #0b1a0e; border-top: 2px solid #1c3b21; border-radius: 50% 50% 0 0 / 20px 20px 0 0; z-index: 5;}
            
        </style>

        <div class="alien-scene">
            <!-- Stars background -->
            <div style="position:absolute; inset:0; background:url('https://www.transparenttextures.com/patterns/stardust.png'); opacity:0.3; z-index:1;"></div>

            <div class="ufo-wrapper" id="ufo">
                <div class="ufo">
                    <div class="ufo-dome"><div class="alien-shadow"></div></div>
                    <div class="ufo-body">
                        <div class="ufo-lights"><div class="u-light"></div><div class="u-light"></div><div class="u-light"></div></div>
                    </div>
                </div>
                <div class="tractor-beam" id="beam"></div>
            </div>

            <div class="alien-banner" id="banner">
                <div class="b-title">ABDUCTED!</div>
                <div class="b-msg"><b>ถึง: ${escapeHtml(data.receiver)}</b><br><br>${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="b-msg" style="color:#aaa; font-size:0.9rem; margin-top:20px; border-top:1px dashed #555; padding-top:10px;">End Transmission: ${escapeHtml(data.sender)}</div>
            </div>

            <div class="target-obj" id="cow">🐄</div>
            <div class="ground"></div>
            
            <div class="hint" id="hint">แตะที่วัว</div>
        </div>
    `;

    const ufo = document.getElementById('ufo');
    const beam = document.getElementById('beam');
    const cow = document.getElementById('cow');
    const banner = document.getElementById('banner');
    const hint = document.getElementById('hint');
    
    let isAbducting = false;

    // Hover UFO slightly but keeps it hidden
    gsap.to(ufo, {y: 10, duration: 1.5, yoyo: true, repeat: -1, ease:"sine.inOut"});

    cow.addEventListener('click', () => {
        if(isAbducting) return;
        isAbducting = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. UFO flies in from top
        tl.to(ufo, { top: '15vh', duration: 1.5, ease: "back.out(1)", onComplete: () => {
            // Shake screen feeling
            gsap.to('.alien-scene', { x: 2, y: 2, duration: 0.05, yoyo: true, repeat: 10 });
        }})
        
        // 2. Beam shoots down
        .to(beam, { scaleY: 1, opacity: 1, duration: 0.5, ease: "power2.out" })
        
        // 3. Cow gets sucked up, spinning
        .to(cow, { y: -window.innerHeight + 100, scale: 0.2, rotation: 720, opacity: 0, duration: 2, ease: "power1.in" })
        
        // 4. UFO turns off beam
        .to(beam, { scaleY: 0, opacity: 0, duration: 0.3 })
        
        // 5. UFO flashes brightly
        .to(ufo, { filter: "brightness(3)", duration: 0.1, yoyo: true, repeat: 3 })
        
        // 6. UFO flies away fast
        .to(ufo, { x: window.innerWidth + 200, rotation: 30, duration: 1, ease: "power3.in" })
        
        // 7. Banner drops down from the sky
        .to(banner, { y: 0, scale: 1, opacity: 1, duration: 1, ease: "bounce.out" });
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
