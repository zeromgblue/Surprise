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
            @import url('https://fonts.googleapis.com/css2?family=Megrim&family=Sarabun:wght@200;600&display=swap');
            
            .wave-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: #000;
            }

            /* Container for Sine Waves */
            .waves-box {
                position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
                filter: blur(1px) drop-shadow(0 0 10px rgba(56, 189, 248, 0.5)); z-index: 10;
            }

            /* SVG Line container */
            svg.sine-svg {
                position: absolute; width: 100%; height: 100%; top: 0; left: 0;
            }

            .path-line {
                fill: none; stroke-width: 2; stroke-linecap: round;
                opacity: 0.6; mix-blend-mode: screen;
            }

            .hint-text { position: absolute; bottom: 15vh; color: #38bdf8; font-family: 'Sarabun', sans-serif; font-size: 1.2rem; letter-spacing: 2px; text-shadow: 0 0 10px #0284c7; animation: pulse 2s infinite; font-weight: 200; z-index: 20;}
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Audio frequency message */
            .freq-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: radial-gradient(ellipse, rgba(0,0,0,0.4), rgba(0,0,0,0.9)); backdrop-filter: blur(3px);
            }
            .m-head { font-family: 'Megrim', cursive; font-size: 5rem; color: #7dd3fc; margin-bottom: 20px; font-weight: 700; text-shadow: 0 0 20px #0284c7, 0 0 40px #38bdf8;}
            .m-body { font-family: 'Sarabun', sans-serif; font-size: 1.5rem; color: #f0f9ff; line-height: 1.8; max-width: 600px; text-align: center; font-weight: 200; letter-spacing: 1px;}
            .m-foot { font-family: 'Megrim', cursive; font-size: 1.5rem; color: #bae6fd; margin-top: 40px; letter-spacing: 5px;}

        </style>

        <div class="wave-scene" id="scene">
            <div class="waves-box" id="wBox">
                <svg class="sine-svg" preserveAspectRatio="none">
                    <!-- generating 5 paths with different colors -->
                    <path class="path-line" stroke="#38bdf8" id="p1" />
                    <path class="path-line" stroke="#818cf8" id="p2" />
                    <path class="path-line" stroke="#c084fc" id="p3" />
                    <path class="path-line" stroke="#f472b6" id="p4" />
                    <path class="path-line" stroke="#fbbf24" id="p5" />
                </svg>
            </div>
            
            <div class="hint-text" id="hint">แตะเพื่อซิงค์คลื่นความถี่</div>

            <div class="freq-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">TUNED BY: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    const paths = [
        document.getElementById('p1'), document.getElementById('p2'),
        document.getElementById('p3'), document.getElementById('p4'), document.getElementById('p5')
    ];
    const scene = document.getElementById('scene');
    
    // Sine wave parameters
    let time = 0;
    let amplitude = 20; // low amplitude initially
    let baseFreq = 0.01;
    let isActive = false;
    let isSynced = false;
    
    // Animation loop for sine waves
    function renderWaves() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const midY = h / 2;
        
        paths.forEach((path, i) => {
            let d = `M 0 ${midY}`;
            let offset = i * 10; // phase offset
            let localAmp = amplitude * (1 + i * 0.2); // slight variations
            let freq = baseFreq * (1 + i * 0.1);
            
            for(let x = 0; x <= w; x += 10) {
                let y = midY + Math.sin(x * freq + time + offset) * localAmp;
                // Add some chaotic noise if not synced
                if(!isSynced) y += (Math.random() - 0.5) * (isActive ? 50 : 5);
                
                d += ` L ${x} ${y}`;
            }
            path.setAttribute('d', d);
        });
        
        // base movement speed
        time += (isSynced ? 0.02 : 0.05);
        if(!isSynced) requestAnimationFrame(renderWaves); // stop loop when fully synced to save CPU
    }
    
    requestAnimationFrame(renderWaves);

    scene.addEventListener('click', () => {
        if(isActive) return;
        isActive = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Waves go chaotic and huge
        gsap.to({amp: amplitude}, { 
            amp: 300, duration: 1, ease: "power2.inOut", 
            onUpdate: function() { amplitude = this.targets()[0].amp; }
        });

        // 2. Waves smooth out perfectly and align
        tl.call(() => {
            gsap.to({amp: amplitude}, { 
                amp: 0, duration: 2, ease: "power4.out", 
                onUpdate: function() { amplitude = this.targets()[0].amp; },
                onComplete: () => {
                    isSynced = true; // stops messy loop
                    // Draw perfectly straight bright lines
                    const w = window.innerWidth;
                    const h = window.innerHeight;
                    paths.forEach(p => p.setAttribute('d', `M 0 ${h/2} L ${w} ${h/2}`));
                    
                    gsap.to(paths, { strokeWidth: 10, opacity: 1, filter: "drop-shadow(0 0 20px #fff)", duration: 1 });
                }
            });
        }, null, 1.5)

        // 3. Message appears like a digital read-out
        .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 }, 3.5)
        .from('.m-head', { letterSpacing: "50px", opacity: 0, duration: 2, ease: "back.out(1)" }, 3.5);
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
