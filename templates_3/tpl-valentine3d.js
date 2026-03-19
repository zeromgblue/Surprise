export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#fff"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Sarabun:wght@400;600&display=swap');
            
            .val-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle, #fff1f2, #fecdd3, #f43f5e);
                perspective: 1200px;
            }

            /* Floating Background Hearts */
            .bg-heart { position: absolute; font-size: 2rem; color: #ffe4e6; opacity: 0.5; z-index: 1; pointer-events:none;}

            /* 3D Box Container */
            .box-wrapper {
                position: relative; width: 200px; height: 200px; margin-top: 100px;
                transform-style: preserve-3d; transform: rotateX(60deg) rotateZ(45deg);
                z-index: 10; cursor: pointer; transition: 0.3s;
            }
            .box-wrapper:hover { transform: rotateX(55deg) rotateZ(45deg) scale(1.05); }

            /* A classic velvet box base */
            .box-base {
                position: absolute; inset: 0; background: linear-gradient(135deg, #a11d33, #e11d48);
                box-shadow: 20px 20px 40px rgba(0,0,0,0.5), inset -10px -10px 20px rgba(0,0,0,0.4);
                transform-style: preserve-3d; display: flex; align-items: center; justify-content: center;
            }
            /* Giving it some height */
            .box-base::before, .box-base::after {
                content: ''; position: absolute; background: #881337;
            }
            .box-base::before { width: 100%; height: 40px; top: -40px; transform-origin: bottom; transform: rotateX(90deg); }
            .box-base::after { height: 100%; width: 40px; left: -40px; transform-origin: right; transform: rotateY(-90deg); }

            .box-inner { position: absolute; width: 180px; height: 180px; background: #18181b; box-shadow: inset 0 0 30px #000; transform: translateZ(5px); }

            /* 3D Box Lid */
            .box-lid {
                position: absolute; inset: 0; background: linear-gradient(135deg, #f43f5e, #be123c);
                box-shadow: inset 5px 5px 10px rgba(255,255,255,0.4), 0 0 20px rgba(0,0,0,0.5);
                transform-origin: top right; transform-style: preserve-3d; z-index: 15;
            }
            /* Adding a ribbon */
            .box-lid::before { content:''; position: absolute; width: 30px; height: 100%; left: 85px; background: #fbbf24; top: 0;}
            .box-lid::after { content:''; position: absolute; height: 30px; width: 100%; top: 85px; background: #fbbf24; left: 0;}

            .hint-text { position: absolute; bottom: 15vh; color: #881337; font-family: 'Sarabun', sans-serif; font-size: 1.2rem; letter-spacing: 2px; text-shadow: 0 0 5px #fecdd3; animation: pulse 2s infinite; font-weight: 600; z-index: 20; pointer-events: none;}
            @keyframes pulse { 0%,100%{opacity:0.4;} 50%{opacity:1;} }

            /* Romantic Message Overlay */
            .love-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(255,255,255,0.4), rgba(225, 29, 72, 0.9)); backdrop-filter: blur(5px);
            }
            .m-head { font-family: 'Great Vibes', cursive; font-size: 6rem; color: #be123c; margin-bottom: 20px; font-weight: 400; text-shadow: 2px 2px 5px #fff;}
            .m-body { font-family: 'Sarabun', sans-serif; font-size: 1.6rem; color: #fff; line-height: 1.8; max-width: 600px; text-align: center; font-weight: 600; text-shadow: 0 2px 5px rgba(0,0,0,0.3);}
            .m-foot { font-family: 'Sarabun', sans-serif; font-size: 1.2rem; color: #ffe4e6; margin-top: 50px; letter-spacing: 5px; text-transform: uppercase; border-top: 2px solid #fda4af; padding-top: 20px;}

            /* SVG Popup Hearts Container */
            .p-hearts { position: absolute; inset: 0; z-index: 30; pointer-events: none; }
            .heart-svg { position: absolute; width: 50px; height: 50px; opacity: 0;}
            path.h-fill { fill: #f43f5e; box-shadow: 0 0 10px #e11d48;}

        </style>

        <div class="val-scene" id="scene">
            <!-- Ambient bg hearts -->
            <div id="bgHearts"></div>
            
            <div class="hint-text" id="hint">เปิดกล่องของขวัญ</div>

            <div class="box-wrapper" id="box">
                <div class="box-base"><div class="box-inner"></div></div>
                <div class="box-lid" id="lid"></div>
            </div>

            <div class="p-hearts" id="pBoxes"></div>

            <div class="love-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">"${escapeHtml(data.message).replace(/\n/g, '<br>')}"</div>
                 <div class="m-foot">WITH LOVE, ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const box = document.getElementById('box');
    const lid = document.getElementById('lid');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const pBoxes = document.getElementById('pBoxes');
    const bgHearts = document.getElementById('bgHearts');
    
    // Create soft ambient floating hearts
    for(let i=0; i<15; i++) {
        let h = document.createElement('div');
        h.className = 'bg-heart';
        h.innerHTML = '❤️';
        bgHearts.appendChild(h);
        gsap.set(h, { x: Math.random()*window.innerWidth, y: window.innerHeight + 50, scale: 0.5+Math.random() });
        gsap.to(h, { y: -100, x: "+="+(Math.random()-0.5)*100, duration: 10 + Math.random()*10, repeat: -1, ease: "none", delay: Math.random()*10 });
    }

    let isOpened = false;

    // Heart SVG markup string
    const heartHTML = `<svg class="heart-svg" viewBox="0 0 100 100"><path class="h-fill" d="M50 90 Q10 60 10 30 A20 20 0 0 1 50 20 A20 20 0 0 1 90 30 Q90 60 50 90 Z"/></svg>`;

    box.addEventListener('click', () => {
        if(isOpened) return;
        isOpened = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Box shakes slightly
        tl.to(box, { x: 5, duration: 0.1, yoyo: true, repeat: 5 })
          
        // 2. Lid flies off dramatically and box tilts down to show inside
          .to(lid, { rotationY: 120, rotationX: 45, x: 200, y: -200, opacity: 0, duration: 1.5, ease: "power2.out" }, "+=0.2")
          .to(box, { rotationX: 20, rotationZ: 0, y: 150, scale: 1.2, duration: 1.5, ease: "power2.out" }, "-=1.5")
          
        // 3. Spitting out hundreds of hearts
          .call(eruptHearts, null, "-=1")
          
        // 4. Romantic blurred overlay with text
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 }, "+=1")
          .from('.m-head', { scale: 0.5, rotation: -10, duration: 2, ease: "back.out(1.5)" }, "-=2");
    });

    const colors = ['#f43f5e', '#fb7185', '#e11d48', '#fda4af', '#fff'];
    function eruptHearts() {
        for(let i=0; i<30; i++) {
            pBoxes.insertAdjacentHTML('beforeend', heartHTML);
            let h = pBoxes.lastElementChild;
            let path = h.querySelector('.h-fill');
            path.style.fill = colors[Math.floor(Math.random()*colors.length)];
            
            // start from center
            gsap.set(h, { x: window.innerWidth/2 - 25, y: window.innerHeight/2 + 50, scale: 0 });
            
            // explode outwards
            gsap.to(h, {
                x: "+=" + ((Math.random()-0.5)*800),
                y: -100 - Math.random()*500,
                scale: 1 + Math.random()*2,
                rotation: Math.random()*360,
                opacity: 0,
                duration: 2 + Math.random()*2,
                ease: "power2.out",
                onComplete: ()=>h.remove()
            });
        }
    }
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
