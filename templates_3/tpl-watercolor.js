export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#fafafa"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Kanit:wght@300;400&display=swap');
            
            .wc-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: #fff;
            }

            /* Paper Texture */
            .paper-bg {
                position: absolute; inset: 0; background: url('https://www.transparenttextures.com/patterns/rice-paper.png');
                opacity: 0.6; z-index: 1; pointer-events: none;
            }

            /* Container for watercolor splash elements */
            .splash-container {
                position: absolute; inset: 0; z-index: 5; pointer-events: none;
            }

            /* Generic splash blob, highly blurred and organically shaped */
            .wc-blob {
                position: absolute; width: 300px; height: 300px;
                background: radial-gradient(circle at center, var(--c), transparent 70%);
                mix-blend-mode: multiply; opacity: 0; filter: blur(20px) contrast(1.5);
                transform-origin: center;
            }

            .hint-text { position: absolute; bottom: 15vh; color: #a1a1aa; font-family: 'Kanit', sans-serif; font-size: 1.2rem; letter-spacing: 2px; animation: pulse 2s infinite; font-weight: 300; z-index: 20; cursor: pointer;}
            @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

            /* Artistic Handwriting Message Overlay */
            .brush-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
            }
            .m-head { font-family: 'Caveat', cursive; font-size: 5.5rem; color: #ec4899; margin-bottom: 20px; font-weight: 600; text-shadow: 2px 2px 10px rgba(236, 72, 153, 0.3); transform: rotate(-5deg);}
            .m-body { font-family: 'Kanit', sans-serif; font-size: 1.6rem; color: #3f3f46; line-height: 1.8; max-width: 600px; text-align: center; font-weight: 400; background: rgba(255,255,255,0.7); padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);}
            .m-foot { font-family: 'Caveat', cursive; font-size: 2.5rem; color: #0ea5e9; margin-top: 40px; transform: rotate(2deg);}

        </style>

        <div class="wc-scene" id="scene">
            <div class="paper-bg"></div>
            
            <div class="hint-text" id="hint">แตะเพื่อสาดสีน้ำ</div>

            <div class="splash-container" id="sBox"></div>

            <div class="brush-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">Art by ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    const scene = document.getElementById('scene');
    const sBox = document.getElementById('sBox');
    
    const colors = ['#f472b6', '#38bdf8', '#fbbf24', '#a78bfa', '#34d399', '#f87171'];
    let isPainted = false;

    scene.addEventListener('click', () => {
        if(isPainted) return;
        isPainted = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Staggered watercolor splashes
        for(let i=0; i<10; i++) {
            let b = document.createElement('div');
            b.className = 'wc-blob';
            b.style.setProperty('--c', colors[i % colors.length]);
            sBox.appendChild(b);
            
            let size = 200 + Math.random()*300;
            gsap.set(b, {
                width: size, height: size,
                x: (Math.random()-0.5)*(window.innerWidth-100) + window.innerWidth/2 - size/2,
                y: (Math.random()-0.5)*(window.innerHeight-100) + window.innerHeight/2 - size/2,
                scale: 0.1, rotation: Math.random()*360
            });
            
            tl.to(b, {
                opacity: 0.8, scale: 1.5 + Math.random(),
                duration: 1 + Math.random()*2,
                ease: "power2.out"
            }, i * 0.2); // slight stagger
        }

        // 2. Artistic text fades in OVER the paint
        tl.to(msg, { opacity: 1, pointerEvents: 'auto', duration: 3 }, 1.5)
          .from('.m-head', { scale: 1.5, opacity: 0, duration: 2, ease: "power2.out" }, 1.5)
          .from('.m-body', { y: 50, opacity: 0, duration: 1.5, ease: "power2.out" }, 2);
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
