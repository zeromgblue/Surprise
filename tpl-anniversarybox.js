export async function render(container, data, config) {
    // 1. Reset container
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "radial-gradient(circle at center, #2a0845 0%, #6441A5 100%)";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    // 2. Load GSAP and Confetti
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    if (!window.confetti) await loadScript('https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js');

    // 3. Inject HTML Structure
    const boxColor = config.from || '#D4AF37';
    const ribbonColor = config.to || '#C2185B';

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&family=Outfit:wght@400;700&display=swap');
            
            .scene {
                width: 200px; height: 200px; perspective: 800px; z-index: 10;
                cursor: pointer; position: relative;
            }
            .gift-box {
                width: 100%; height: 100%; position: relative;
                transform-style: preserve-3d;
                transform: rotateX(-20deg) rotateY(-45deg);
                transition: transform 0.5s ease;
                animation: floatBox 3s ease-in-out infinite;
            }
            @keyframes floatBox {
                0%, 100% { transform: rotateX(-20deg) rotateY(-45deg) translateY(0); }
                50% { transform: rotateX(-20deg) rotateY(-45deg) translateY(-20px); }
            }
            .gift-box:hover { animation-play-state: paused; transform: rotateX(-15deg) rotateY(-30deg) scale(1.05); }

            .box-face {
                position: absolute; width: 200px; height: 150px;
                background: ${boxColor}; border: 2px solid rgba(0,0,0,0.1);
                bottom: 0; box-shadow: inset 0 0 40px rgba(0,0,0,0.2);
            }
            .box-front  { transform: rotateY(0deg) translateZ(100px); }
            .box-right  { transform: rotateY(90deg) translateZ(100px); }
            .box-back   { transform: rotateY(180deg) translateZ(100px); }
            .box-left   { transform: rotateY(-90deg) translateZ(100px); }
            .box-bottom { width: 200px; height: 200px; transform: rotateX(-90deg) translateZ(0px); bottom:-50px; box-shadow: 0 0 50px rgba(0,0,0,0.5); }
            
            /* Ribbons */
            .box-face::after {
                content: ''; position: absolute; background: ${ribbonColor};
                width: 30px; height: 100%; left: 50%; transform: translateX(-50%);
                box-shadow: 0 0 10px rgba(0,0,0,0.3);
            }

            .lid {
                position: absolute; width: 210px; height: 210px;
                transform-style: preserve-3d;
                top: -50px; left: -5px;
                transform: rotateX(90deg) translateZ(0px);
                transition: transform 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            .lid-top {
                position: absolute; width: 100%; height: 100%;
                background: ${boxColor}; border: 2px solid rgba(0,0,0,0.1);
            }
            .lid-top::before, .lid-top::after {
                content: ''; position: absolute; background: ${ribbonColor};
            }
            .lid-top::before { width: 34px; height: 100%; left: 50%; transform: translateX(-50%); }
            .lid-top::after { height: 34px; width: 100%; top: 50%; transform: translateY(-50%); }

            .lid-side {
                position: absolute; width: 210px; height: 30px;
                background: ${boxColor}; border: 1px solid rgba(0,0,0,0.1); filter: brightness(0.9);
            }
            .lid-front  { transform: rotateX(-90deg) translateZ(105px); top: 90px; }
            .lid-back   { transform: rotateX(90deg) translateZ(105px); top: 90px; }
            .lid-right  { transform: rotateY(90deg) rotateX(-90deg) translateZ(105px); width: 210px; top: 90px; left:0; }
            .lid-left   { transform: rotateY(-90deg) rotateX(-90deg) translateZ(105px); width: 210px; top: 90px; left:0; }

            .tap-hint {
                position: absolute; width: 100%; text-align: center;
                top: -80px; color: white; font-family: 'Outfit', sans-serif;
                font-weight: 700; letter-spacing: 2px;
                animation: pulse 1.5s infinite; text-shadow: 0 2px 10px rgba(0,0,0,0.5);
                pointer-events: none;
            }
            @keyframes pulse { 0%,100%{opacity:0.5; transform:translateY(0);} 50%{opacity:1; transform:translateY(-5px);} }

            /* Message Card */
            .message-card {
                position: absolute; top: 50%; left: 50%;
                width: 90%; max-width: 500px; max-height: 80vh; overflow-y: auto;
                background: rgba(255,255,255,0.95);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 40px; box-sizing: border-box;
                text-align: center; color: #333;
                box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                transform: translate(-50%, -50%) scale(0.5) translateY(200px);
                opacity: 0; pointer-events: none; z-index: 20;
                border: 2px solid ${boxColor};
            }
            .card-title { font-family: 'Outfit', sans-serif; font-size: 1.5rem; color: #777; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; }
            .card-name { font-family: 'Playfair Display', serif; font-size: 3rem; color: ${ribbonColor}; margin-bottom: 20px; font-weight: 600; font-style: italic; line-height: 1.2; }
            .card-msg { font-family: 'Outfit', sans-serif; font-size: 1.1rem; line-height: 1.8; color: #444; margin-bottom: 30px; }
            .card-from { font-family: 'Outfit', sans-serif; font-size: 1.2rem; font-weight: 700; color: ${boxColor}; }
        </style>

        <div class="scene" id="gift-scene">
            <div class="tap-hint" id="hint">แตะเพื่อเปิด</div>
            <div class="gift-box" id="box">
                <div class="box-face box-front"></div>
                <div class="box-face box-right"></div>
                <div class="box-face box-back"></div>
                <div class="box-face box-left"></div>
                <div class="box-face box-bottom"></div>
                
                <div class="lid" id="lid">
                    <div class="lid-top"></div>
                    <div class="lid-side lid-front"></div>
                    <div class="lid-side lid-right"></div>
                    <div class="lid-side lid-back"></div>
                    <div class="lid-side lid-left"></div>
                </div>
            </div>
        </div>

        <div class="message-card" id="card">
            <div class="card-title">Happy Anniversary</div>
            <div class="card-name">${escapeHtml(data.receiver)}</div>
            <div class="card-msg">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
            <div class="card-from">With all my love,<br>${escapeHtml(data.sender)}</div>
        </div>
    `;

    // 4. Interaction Logic
    let opened = false;
    const scene = document.getElementById('gift-scene');
    
    scene.addEventListener('click', () => {
        if (opened) return;
        opened = true;

        document.getElementById('hint').style.display = 'none';

        // Animate Lid opening and flying away
        gsap.to('#lid', {
            rotationX: 180,
            y: -150,
            z: -200,
            duration: 1.5,
            ease: "power2.out"
        });

        // Box scale down and fade out
        gsap.to('#box', {
            scale: 0.8,
            opacity: 0,
            y: 100,
            duration: 1,
            delay: 0.5,
            ease: "power2.in"
        });

        // Fire Confetti explosion from center
        setTimeout(() => {
            confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: [boxColor, ribbonColor, '#ffffff'] });
        }, 300);

        // Reveal the Card
        const card = document.getElementById('card');
        gsap.to(card, {
            scale: 1,
            y: 0,
            opacity: 1,
            duration: 1.5,
            delay: 0.8,
            ease: "elastic.out(1, 0.7)",
            onComplete: () => {
                card.style.pointerEvents = 'auto';
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
