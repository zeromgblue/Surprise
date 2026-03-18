export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#0A2211"; // Casino green table
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Rye&family=Prompt:wght@400;600&display=swap');
            
            .roulette-container {
                position: relative; width: 300px; height: 300px;
                display: flex; align-items: center; justify-content: center;
            }

            .wheel-base {
                width: 280px; height: 280px; border-radius: 50%;
                background: #5c3a21; border: 15px solid #3e2723;
                box-shadow: 0 20px 30px rgba(0,0,0,0.8), inset 0 10px 20px rgba(0,0,0,0.5);
                position: relative; display: flex; align-items: center; justify-content: center;
                overflow: hidden;
            }

            .wheel-spin {
                width: 100%; height: 100%; border-radius: 50%; position: absolute;
                background: conic-gradient(
                    #e63946 0deg 30deg, #1d3557 30deg 60deg,
                    #e63946 60deg 90deg, #1d3557 90deg 120deg,
                    #e63946 120deg 150deg, #1d3557 150deg 180deg,
                    #e63946 180deg 210deg, #1d3557 210deg 240deg,
                    #e63946 240deg 270deg, #1d3557 270deg 300deg,
                    #e63946 300deg 330deg, #f4a261 330deg 360deg /* Jackpot */
                );
            }
            /* Add divisions */
            .wheel-lines {
                position: absolute; width: 100%; height: 100%; border-radius: 50%;
                background: repeating-conic-gradient(from 15deg, transparent 0deg 29deg, rgba(255,255,255,0.2) 29deg 30deg);
                z-index: 2; pointer-events: none;
            }

            .wheel-center {
                width: 60px; height: 60px; background: radial-gradient(circle, #fff, #bbb);
                border-radius: 50%; border: 10px solid #d4a373; z-index: 10;
                box-shadow: 0 5px 10px rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center;
            }

            .ball {
                position: absolute; width: 14px; height: 14px; background: #fff;
                border-radius: 50%; box-shadow: inset -3px -3px 5px rgba(0,0,0,0.3), 2px 2px 5px rgba(0,0,0,0.5);
                z-index: 5; top: 15px; left: 50%; transform: translateX(-50%);
                /* Will animate via GSAP */
            }

            .pointer {
                position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
                width: 0; height: 0; border-left: 15px solid transparent; border-right: 15px solid transparent;
                border-top: 30px solid #ffd700; z-index: 20; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.5));
            }

            .spin-btn {
                position: absolute; bottom: -80px; padding: 15px 40px;
                background: linear-gradient(to bottom, #ffd700, #daa520);
                border: 2px solid #fff; border-radius: 30px;
                font-family: 'Rye', cursive; font-size: 1.5rem; color: #222;
                cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.5);
                transition: transform 0.1s;
            }
            .spin-btn:active { transform: translateY(5px); box-shadow: 0 5px 10px rgba(0,0,0,0.5); }

            /* Chips bg */
            .chip { position:absolute; width:40px; height:40px; border-radius:50%; border:4px dashed #fff; opacity:0.3; }

            .msg-panel {
                position: absolute; inset: 0; z-index: 30;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                background: rgba(10, 34, 17, 0.9); backdrop-filter: blur(5px);
                opacity: 0; pointer-events: none; padding: 30px; text-align: center;
            }
            .p-title { font-family: 'Rye', cursive; font-size: 3rem; color: #ffd700; margin-bottom: 20px; text-shadow: 0 5px 10px rgba(0,0,0,0.8); letter-spacing: 2px;}
            .p-msg { font-family: 'Prompt', sans-serif; font-size: 1.2rem; line-height: 1.6; color: #fff; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px; border: 1px solid #ffd700; }
        </style>

        <div class="msg-panel" id="msg">
            <div class="p-title">แจ็คพอตแตก!</div>
            <div class="p-msg">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
            <div style="font-family:'Prompt'; color:#aaa; font-size:0.9rem; margin-top:20px;">— FROM: ${escapeHtml(data.sender)}</div>
        </div>

        <div class="roulette-container">
            <div class="pointer"></div>
            <div class="wheel-base">
                <div class="wheel-spin" id="wheel"><div class="wheel-lines"></div></div>
                <div class="wheel-center"></div>
                <!-- Ball -->
                <div style="position:absolute; width: 100%; height: 100%; z-index:5;" id="ball-track">
                    <div class="ball" id="ball"></div>
                </div>
            </div>
            
            <button class="spin-btn" id="btn">หมุน!</button>
        </div>
    `;

    // Add some bg chips
    const colors = ['#e63946', '#457b9d', '#ffd700', '#f1faee'];
    for(let i=0; i<8; i++){
        let c = document.createElement('div');
        c.className = 'chip'; c.style.background = colors[i%4];
        c.style.left = Math.random()*100 + 'vw'; c.style.top = Math.random()*100 + 'vh';
        container.appendChild(c);
        gsap.to(c, { rotation: 360, duration: 20+Math.random()*10, repeat: -1, ease:"none"});
    }

    const btn = document.getElementById('btn');
    const wheel = document.getElementById('wheel');
    const track = document.getElementById('ball-track');
    let spinned = false;

    btn.addEventListener('click', () => {
        if(spinned) return;
        spinned = true;
        btn.style.opacity = 0.5; btn.style.pointerEvents = 'none';

        // Wheel spins one way
        // Math: 360*5 + target angle. Target angle for jackpot (orange) is 330-360. Center is 345 deg.
        // We want the wheel to align 345 to top. ถึงp is 0. So wheel needs to rotate such that 345 is at 0 -> rotate -345 or +15.
        // Actually pointer is at top. If we want orange under pointer, wheel rotates 360*5 - 345.
        
        gsap.to(wheel, {
            rotation: 360 * 5 - 345,
            duration: 5, ease: "power4.out"
        });

        // Ball spins the other way, then falls into center
        // Ball rotates inside track
        gsap.to(track, {
            rotation: -(360 * 6),
            duration: 4.8, ease: "power3.out"
        });

        // Ball falls towards center physics
        gsap.to('#ball', {
            top: 100, // Move closer to center (radius = 140, center=140. 100 is inner ring)
            duration: 2, delay: 2.8, ease: "bounce.out",
            onComplete: () => {
                // Flash winner
                setTimeout(()=>{
                    gsap.to('#msg', { opacity: 1, duration: 1, pointerEvents: 'auto', backdropFilter: 'blur(10px)' });
                    
                    // Confetti explosion
                    if (!window.confetti) {
                        loadScript('https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js').then(()=>{
                            confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#ffd700', '#ffffff', '#e63946'] });
                        });
                    } else {
                        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#ffd700', '#ffffff', '#e63946'] });
                    }
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
