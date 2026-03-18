export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#6B46C1"; // Purple arcade
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Bungee+Inline&family=Poppins:wght@700&display=swap');
            
            .wheel-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: repeating-conic-gradient(from 0deg, #553C9A 0deg 15deg, #6B46C1 15deg 30deg);
            }

            /* Wheel container */
            .wheel-container {
                position: relative; width: 300px; height: 300px;
                border-radius: 50%; border: 15px solid #F6E05E;
                box-shadow: 0 20px 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.5);
                overflow: hidden; z-index: 10;
            }

            /* The wheel itself */
            .wheel {
                width: 100%; height: 100%; position: absolute;
                border-radius: 50%;
                background: conic-gradient(
                    #F56565 0deg 60deg, 
                    #ED8936 60deg 120deg, 
                    #ECC94B 120deg 180deg, 
                    #48BB78 180deg 240deg, 
                    #4299E1 240deg 300deg, 
                    #9F7AEA 300deg 360deg
                );
                transform: rotate(0deg); transition: transform 0s;
            }
            .wheel::after {
                content: ''; position: absolute; inset: 40px; background: #FFF; border-radius: 50%;
                box-shadow: 0 0 20px rgba(0,0,0,0.3);
            }
            
            /* Center Button */
            .spin-btn {
                position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                width: 80px; height: 80px; background: #E53E3E; border-radius: 50%;
                border: 4px solid #FFF; font-family: 'Bungee Inline', cursive; color: #FFF; font-size: 1.2rem;
                display: flex; align-items: center; justify-content: center; z-index: 15;
                cursor: pointer; box-shadow: 0 5px 10px rgba(0,0,0,0.5); transition: 0.1s;
            }
            .spin-btn:active { transform: translate(-50%, -45%); box-shadow: 0 0 0 rgba(0,0,0,0.5); }
            .spin-btn:disabled { background: #718096; pointer-events: none; }

            /* Pointer */
            .pointer {
                position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
                width: 0; height: 0; border-left: 20px solid transparent; border-right: 20px solid transparent; border-top: 40px solid #FFF;
                z-index: 20; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.5));
            }

            .hint { position: absolute; bottom: 10vh; color: #FFF; font-family: 'Bungee Inline', cursive; font-size: 2.5rem; text-shadow: 0 5px 0 #2D3748; z-index: 20; letter-spacing: 2px; text-align:center;}

            /* Message Area */
            .prize-msg {
                position: absolute; inset: 0; z-index: 60; padding: 40px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none;
                background: rgba(255,255,255,0.9); backdrop-filter: blur(5px);
            }

            .m-head { font-family: 'Bungee Inline', cursive; font-size: 3.5rem; color: #D53F8C; margin-bottom: 20px; text-shadow: 2px 2px 0 #FFF, 4px 4px 0 #CBD5E0;}
            .m-body { font-family: 'Poppins', sans-serif; font-size: 1.5rem; color: #2D3748; line-height: 1.6; max-width:600px; }
            
        </style>

        <div class="wheel-scene">
            <div class="hint" id="hint">หมุนวงล้อ!</div>

            <div class="pointer"></div>
            <div class="wheel-container">
                <div class="wheel" id="wheel"></div>
                <button class="spin-btn" id="spinBtn">หมุน</button>
            </div>

            <div class="prize-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-body" style="font-size:1.2rem; margin-top:40px; color:#D53F8C;">ผู้มอบรางวัล: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const wheel = document.getElementById('wheel');
    const spinBtn = document.getElementById('spinBtn');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    
    let isSpinning = false;

    spinBtn.addEventListener('click', () => {
        if(isSpinning) return;
        isSpinning = true;
        spinBtn.disabled = true;
        hint.style.display = 'none';

        // Rotate many times then stop
        // 5 full rotations + random angle
        const randomAngle = Math.floor(Math.random() * 360);
        const totalRotation = (360 * 5) + randomAngle;

        gsap.to(wheel, { 
            rotation: totalRotation, 
            duration: 4, 
            ease: "circ.out", 
            onComplete: () => {
                // Popping confetti effect
                setTimeout(() => {
                    const flash = document.createElement('div');
                    flash.style.cssText = "position:absolute; inset:0; background:#FFF; z-index:55; mix-blend-mode:screen;";
                    document.body.appendChild(flash);
                    gsap.to(flash, { opacity:0, duration: 1, onComplete:()=>flash.remove() });
                    
                    // Show message
                    gsap.to(msg, { opacity: 1, pointerEvents:'auto', duration: 1, ease:"power2.out" });
                }, 500);
            }
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
