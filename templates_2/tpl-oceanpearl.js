export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#082f49"; // deep ocean
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Mali:ital,wght@0,300;0,400;0,700;1,400&display=swap');
            
            .ocean-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: linear-gradient(180deg, #0369a1, #082f49, #020617);
            }

            /* Light rays from surface */
            .sun-rays {
                position: absolute; top: -50%; left: 0; width: 200vw; height: 150vh;
                background: conic-gradient(from 0deg at 50% 0%, transparent 40%, rgba(56, 189, 248, 0.2) 45%, rgba(56, 189, 248, 0.3) 50%, rgba(56, 189, 248, 0.2) 55%, transparent 60%);
                animation: rotateRays 20s infinite linear; transform-origin: top center; z-index: 5; pointer-events: none;
            }
            @keyframes rotateRays { 0% { transform: rotate(-10deg); } 50% { transform: rotate(10deg); } 100% { transform: rotate(-10deg); } }

            /* Pearl / Oyster Shell */
            .shell-wrapper {
                position: relative; width: 200px; height: 200px; z-index: 20; cursor: pointer;
                transition: 0.3s; transform-style: preserve-3d; perspective: 1000px;
            }
            .shell-bottom {
                position: absolute; bottom: 20px; width: 200px; height: 120px;
                background: radial-gradient(ellipse at top, #fde047 10%, #d97706);
                border-radius: 50% 50% 50% 50% / 20% 20% 80% 80%;
                box-shadow: inset 0 -20px 20px rgba(0,0,0,0.5), 0 20px 30px rgba(0,0,0,0.8);
                display: flex; justify-content: center; align-items: center;
            }
            
            /* The Glowing Pearl */
            .pearl {
                width: 60px; height: 60px; border-radius: 50%;
                background: radial-gradient(circle at 30% 30%, #fff, #fef08a, #d97706);
                box-shadow: 0 0 30px #fde047, inset -10px -10px 20px rgba(0,0,0,0.3);
                opacity: 0; transform: scale(0.5); z-index: 22;
            }

            .shell-top {
                position: absolute; top: 10px; width: 200px; height: 140px;
                background: radial-gradient(ellipse at bottom, #fde047 10%, #d97706);
                border-radius: 50% 50% 50% 50% / 80% 80% 20% 20%;
                transform-origin: bottom center; transform: rotateX(10deg);
                box-shadow: inset 0 20px 20px rgba(0,0,0,0.4); z-index: 25;
            }
            
            /* Ridges on shell */
            .shell-top::after, .shell-bottom::after {
                content: ''; position: absolute; inset: 0;
                background: repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(0,0,0,0.2) 20px, rgba(0,0,0,0.2) 25px);
                border-radius: inherit; mix-blend-mode: multiply; opacity: 0.5;
            }

            .hint-text { position: absolute; bottom: -50px; width: 100%; text-align: center; color: #bae6fd; font-family: 'Mali', cursive; font-size: 1.2rem; animation: pulse 2s infinite;}

            /* Bubbles */
            .bubble {
                position: absolute; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0.1));
                border: 1px solid rgba(255,255,255,0.5); border-radius: 50%; z-index: 10; pointer-events: none;
            }

            /* Water Message */
            .ocean-msg {
                position: absolute; inset: 0; padding: 40px; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(8, 47, 73, 0.8), rgba(2, 6, 23, 0.95));
            }
            .m-head { font-family: 'Mali', cursive; font-size: 3rem; color: #fde047; margin-bottom: 20px; font-weight: 700; text-shadow: 0 0 20px #d97706, 0 5px 10px #000; text-align:center;}
            .m-body { font-family: 'Mali', cursive; font-size: 1.4rem; color: #e0f2fe; line-height: 1.6; max-width: 600px; text-align: center; font-weight: 400;}
            .m-foot { font-family: 'Mali', cursive; font-size: 1.2rem; color: #38bdf8; margin-top: 30px; font-weight: 700;}

        </style>

        <div class="ocean-scene">
            <div class="sun-rays"></div>
            
            <div class="shell-wrapper" id="shellBox">
                <div class="shell-bottom">
                    <div class="pearl" id="pearl"></div>
                </div>
                <div class="shell-top" id="shellTop"></div>
                <div class="hint-text" id="hint">แตะเพื่อเปิดเปลือกหอย</div>
            </div>

            <div class="ocean-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const shellBox = document.getElementById('shellBox');
    const shellTop = document.getElementById('shellTop');
    const pearl = document.getElementById('pearl');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const scene = document.querySelector('.ocean-scene');

    // Float shell playfully
    gsap.to(shellBox, { y: -20, rotationZ: 5, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" });

    // Background Bubbles
    setInterval(() => {
        let b = document.createElement('div');
        b.className = 'bubble';
        let size = Math.random() * 20 + 5;
        b.style.width = size + 'px';
        b.style.height = size + 'px';
        b.style.left = Math.random() * 100 + 'vw';
        b.style.bottom = '-50px';
        scene.appendChild(b);

        gsap.to(b, {
            y: -window.innerHeight - 100,
            x: "+=" + (Math.random()-0.5)*100,
            duration: 5 + Math.random()*5,
            ease: "none",
            onComplete: ()=>b.remove()
        });
    }, 500);

    let isOpened = false;

    shellBox.addEventListener('click', () => {
        if(isOpened) return;
        isOpened = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Zoom in slightly
        tl.to(shellBox, { scale: 1.5, y: 50, duration: 1, ease: "power2.inOut" })
          
        // 2. Open top shell
          .to(shellTop, { rotationX: -110, y: -20, duration: 1.5, ease: "bounce.out" })
          
        // 3. Pearl glows and reveals
          .to(pearl, { opacity: 1, scale: 1, duration: 1, ease: "back.out(1.7)" }, "-=1")
          
        // 4. Pearl floats up and expands into message
          .to(pearl, { y: -100, scale: 5, opacity: 0, duration: 1.5, ease: "power2.inOut" }, "+=0.5")
          
        // 5. Show message overlay
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5 }, "-=1");
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
