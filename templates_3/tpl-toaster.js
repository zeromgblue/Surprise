export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#FFCDB2"; // ถึงast bg
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const toasterColor = config.from || '#E5989B';

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Pangolin&display=swap');
            
            .breakfast-scene {
                position: relative; width: 300px; height: 350px;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
            }

            .bread-slice {
                position: absolute; width: 180px; height: 180px;
                background: #fdf0d5; border-radius: 20px 20px 10px 10px;
                border: 8px solid #d4a373; z-index: 5;
                bottom: 150px; /* Hidden inside */
                display: flex; align-items: center; justify-content: center;
                box-sizing: border-box; padding: 15px; text-align: center;
                /* Burned text effect */
                color: #5c3a21; font-family: 'Pangolin', cursive; font-size: 1.1rem;
                opacity: 0; transform: translateY(100px); /* started pushed down */
            }

            .toaster {
                position: relative; width: 240px; height: 160px;
                background: ${toasterColor}; border-radius: 20px 20px 10px 10px;
                z-index: 10; box-shadow: inset -10px -10px 20px rgba(0,0,0,0.1), 0 20px 30px rgba(0,0,0,0.2);
                border-bottom: 10px solid #6D6875;
                display: flex; justify-content: center;
            }

            .slot {
                width: 160px; height: 20px; background: #333;
                border-radius: 10px; margin-top: 10px;
                box-shadow: inset 0 5px 10px #000;
            }

            .dial {
                position: absolute; right: 20px; bottom: 30px;
                width: 40px; height: 40px; background: #fff; border-radius: 50%;
                box-shadow: 0 5px 10px rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center;
            }
            .dial-dot { width: 10px; height: 10px; background: #6D6875; border-radius: 50%; transform: translateY(-10px); }

            .lever-track {
                position: absolute; left: 20px; top: 30px;
                width: 10px; height: 80px; background: #444; border-radius: 5px; box-shadow: inset 0 2px 5px #000;
            }
            .lever-handle {
                position: absolute; left: -15px; top: -10px;
                width: 40px; height: 20px; background: #6D6875; border-radius: 10px;
                cursor: pointer; box-shadow: 0 5px 10px rgba(0,0,0,0.3); transition: transform 0.1s;
            }
            .lever-handle:active { transform: scale(0.9); }

            .hint {
                position: absolute; bottom: -50px; font-family: sans-serif; letter-spacing: 2px;
                color: #e56b6f; animation: pulse 1.5s infinite;
            }
            @keyframes pulse { 0% { opacity: 0.3; } 100% { opacity: 1; } }
            
            .smoke { position: absolute; width: 40px; height: 40px; background: #fff; border-radius: 50%; filter: blur(10px); opacity: 0; pointer-events: none; z-index: 2;}

        </style>

        <div class="breakfast-scene">
            <div class="bread-slice" id="bread">
                <div style="transform: rotate(-5deg);">
                    <b>${escapeHtml(data.receiver)}</b><br>
                    <span style="font-size:0.9rem;">${escapeHtml(data.message).replace(/\n/g, '<br>')}</span>
                </div>
            </div>

            <div class="toaster" id="t-body">
                <div class="slot"></div>
                <div class="lever-track">
                    <div class="lever-handle" id="btn"></div>
                </div>
                <div class="dial"><div class="dial-dot"></div></div>
            </div>

            <div class="hint" id="hint">กดคันโยก</div>
        </div>
    `;

    const btn = document.getElementById('btn');
    const bread = document.getElementById('bread');
    const toaster = document.getElementById('t-body');
    const scene = document.querySelector('.breakfast-scene');
    let toasting = false;

    btn.addEventListener('click', () => {
        if(toasting) return;
        toasting = true;
        document.getElementById('hint').style.display = 'none';

        // Press lever down
        gsap.to(btn, { y: 60, duration: 0.3, ease: "power2.in" });

        // Bread drops down (wait it's already hidden, let's just make it visible)
        bread.style.opacity = 1;
        gsap.set(bread, { y: 120 }); // Inside toaster

        // ถึงaster vibrates indicating toasting
        gsap.to(toaster, { x: 2, duration: 0.05, yoyo: true, repeat: 40, delay: 0.3 });
        
        // Emulate some smoke/heat waves
        for(let i=0; i<5; i++) {
            setTimeout(() => {
                let s = document.createElement('div');
                s.className = 'smoke';
                s.style.left = '120px'; s.style.top = '100px';
                scene.appendChild(s);
                gsap.to(s, {
                    y: -150, scale: 3, opacity: 0.5, duration: 2,
                    ease: "power1.out", onComplete: ()=>s.remove()
                });
            }, 300 + (i*400));
        }

        // Pop UP! After 2 seconds
        setTimeout(() => {
            // Lever forces up
            gsap.to(btn, { y: 0, duration: 0.1, ease: "bounce.out" });
            
            // Bread pops high
            gsap.to(bread, {
                y: -150, rotation: 10, scale: 1.2,
                duration: 0.8, ease: "elastic.out(1, 0.5)",
                onComplete: () => {
                    // Confetti using simple emoji drops since it's bread? No, let's use stars
                    gsap.to(bread, {boxShadow: "0 20px 40px rgba(0,0,0,0.3)", zIndex: 20});
                }
            });
        }, 2500);
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
