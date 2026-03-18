export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#000"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;800&family=Bai+Jamjuree:wght@300;600&display=swap');
            
            .bh-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; align-items: center; justify-content: center;
                overflow: hidden; perspective: 1000px;
            }

            /* CSS Black Hole Representation */
            .accretion-disk {
                position: absolute; width: 600px; height: 600px;
                border-radius: 50%;
                background: conic-gradient(from 0deg, rgba(255, 100, 0, 0), rgba(255, 50, 0, 0.8), rgba(200, 0, 255, 0.5), rgba(255, 100, 0, 0));
                filter: blur(20px);
                animation: spinDisk 5s linear infinite;
                transform: rotateX(70deg); z-index: 1;
            }
            @keyframes spinDisk { 100% { transform: rotateX(70deg) rotateZ(360deg); } }

            .event-horizon {
                position: absolute; width: 200px; height: 200px;
                background: #000; border-radius: 50%;
                box-shadow: 0 0 50px #000, 0 0 100px rgba(255,50,0,0.5), inset 0 0 40px rgba(255,255,255,0.1);
                z-index: 5;
                transition: transform 3s ease-in;
            }
            
            .halo {
                position: absolute; width: 250px; height: 250px;
                border-radius: 50%; border: 2px solid rgba(255, 200, 100, 0.5);
                filter: blur(4px); box-shadow: 0 0 40px rgba(255,100,0,0.8), inset 0 0 20px rgba(255,100,0,0.8);
                z-index: 4;
            }

            .ship {
                position: absolute; bottom: 80px; width: 40px; height: 60px;
                clip-path: polygon(50% 0%, 0% 100%, 50% 80%, 100% 100%);
                background: linear-gradient(to bottom, #ccc, #555);
                z-index: 10; filter: drop-shadow(0 0 10px #00FFFF);
                cursor: pointer;
            }
            .ship-flame {
                position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%);
                width: 10px; height: 30px; background: #00FFFF; border-radius: 5px 5px 20px 20px;
                filter: blur(2px); animation: flicker 0.1s infinite alternate;
            }
            @keyframes flicker { 0% { height: 20px; opacity: 0.8; } 100% { height: 35px; opacity: 1; } }

            .hint {
                position: absolute; bottom: 30px; color: #00FFFF;
                font-family: 'Orbitron', sans-serif; letter-spacing: 3px;
                text-shadow: 0 0 10px #00FFFF; pointer-events: none; z-index: 15;
            }

            .msg-wrapper {
                position: absolute; inset:0; background: radial-gradient(circle, #20002E 0%, #000 100%);
                z-index: 50; display:flex; flex-direction:column; align-items:center; justify-content:center;
                opacity: 0; pointer-events: none; padding: 40px; text-align: center;
            }
            
            .neon-text { font-family: 'Orbitron', sans-serif; font-size: 2.5rem; color: #E0B0FF; text-shadow: 0 0 10px #E0B0FF, 0 0 20px #8A2BE2, 0 0 40px #8A2BE2; margin-bottom: 20px; }
            .cyber-body { font-family: 'Bai Jamjuree', sans-serif; font-size: 1.2rem; color: #fff; line-height: 1.8; max-width: 500px; text-shadow: 0 0 5px rgba(255,255,255,0.5); }
        </style>

        <div class="bh-scene" id="scene">
            <div class="accretion-disk"></div>
            <div class="halo"></div>
            <div class="event-horizon" id="blackhole"></div>
            
            <div class="ship" id="ship">
                <div class="ship-flame"></div>
            </div>
            
            <div class="hint" id="hint">แตะเพื่อเข้าสู่ดินแดนลี้ลับ</div>
        </div>

        <div class="msg-wrapper" id="msg">
            <div class="neon-text">ANOMALY DETECTED</div>
            <div class="cyber-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
            <div class="cyber-body" style="font-size: 0.9rem; color:#888; margin-top:30px;">Transmission Origin: ${escapeHtml(data.sender)}</div>
        </div>
    `;

    const ship = document.getElementById('ship');
    const msg = document.getElementById('msg');
    const blackhole = document.getElementById('blackhole');
    let crossed = false;

    // gently float ship
    gsap.to(ship, { y: 10, rotation: 5, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });

    ship.addEventListener('click', () => {
        if(crossed) return;
        crossed = true;
        document.getElementById('hint').style.display = 'none';

        gsap.killTweensOf(ship);

        const tl = gsap.timeline();
        
        // Ship gets sucked in (spaghettification effect using scaleY and scaleX)
        tl.to(ship, {
            y: -250, // move into center
            scaleY: 3, // stretch
            scaleX: 0.1, // squeeze
            rotation: 180,
            opacity: 0,
            duration: 2,
            ease: "power3.in"
        })
        
        // Blackhole expands rapidly to consume screen
        .to(blackhole, { scale: 50, duration: 1.5, ease: "power4.inOut" }, "-=0.5")
        
        // Screen is fully black, now reveal the parallel dimension message
        .to(msg, { opacity: 1, duration: 1, pointerEvents: "auto" });
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
