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
            @import url('https://fonts.googleapis.com/css2?family=Righteous&family=Kanit:wght@300;400&display=swap');
            
            .holo-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle, #1e1b4b, #000);
            }

            /* Container for liquid gradient rings */
            .rings-box {
                position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
                z-index: 10; pointer-events: none;
            }

            /* Complex gradient shape */
            .fluid-shape {
                position: absolute; width: 300px; height: 300px;
                background: linear-gradient(45deg, #ec4899, #8b5cf6, #3b82f6, #14b8a6);
                background-size: 400% 400%;
                border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
                filter: blur(10px); opacity: 0.8; mix-blend-mode: screen;
                animation: morphShape 10s ease-in-out infinite, flowGradient 5s ease infinite;
            }
            /* Two offset shapes for depth */
            .f2 { width: 400px; height: 400px; animation-direction: reverse; filter: blur(20px); opacity: 0.5; background: linear-gradient(-45deg, #f43f5e, #c084fc, #0ea5e9); background-size: 300% 300%;}

            @keyframes morphShape {
                0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(0deg) scale(1); }
                34% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; transform: rotate(120deg) scale(1.1); }
                67% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; transform: rotate(240deg) scale(0.9); }
                100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(360deg) scale(1); }
            }
            @keyframes flowGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

            .hint-text { position: absolute; bottom: 15vh; color: #e9d5ff; font-family: 'Kanit', sans-serif; font-size: 1.2rem; letter-spacing: 2px; text-shadow: 0 0 10px #c084fc; animation: pulse 2s infinite; font-weight: 300; z-index: 20;}
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Grid background */
            .grid-bg {
                position: absolute; inset:0; z-index: 5;
                background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
                background-size: 50px 50px; perspective: 1000px; transform: rotateX(60deg) translateY(-100px);
                opacity: 0.5;
            }

            /* Holographic Reveal Text */
            .holo-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                backdrop-filter: blur(10px); background: rgba(0,0,0,0.4);
            }
            .m-head { font-family: 'Righteous', cursive; font-size: 4.5rem; color: transparent; margin-bottom: 20px; font-weight: 400; background: linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6); -webkit-background-clip: text; padding: 10px; filter: drop-shadow(0 0 10px rgba(139,92,246,0.8)); text-transform: uppercase;}
            .m-body { font-family: 'Kanit', sans-serif; font-size: 1.5rem; color: #f8fafc; line-height: 1.8; max-width: 600px; text-align: center; font-weight: 300;}
            .m-foot { font-family: 'Righteous', cursive; font-size: 1.2rem; color: #94a3b8; margin-top: 50px; letter-spacing: 5px;}

        </style>

        <div class="holo-scene" id="scene">
            <div class="grid-bg"></div>
            
            <div class="rings-box" id="rBox">
                <div class="fluid-shape"></div>
                <div class="fluid-shape f2"></div>
            </div>
            
            <div class="hint-text" id="hint">คลิกเพื่อให้พลังงานหลอมรวม</div>

            <div class="holo-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">FLUID SOURCE: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    const shape1 = document.querySelector('.fluid-shape');
    const shape2 = document.querySelector('.f2');
    const scene = document.getElementById('scene');
    
    let isFused = false;

    scene.addEventListener('click', () => {
        if(isFused) return;
        isFused = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Shapes expand massively and fuse into a solid glowing backdrop
        tl.to([shape1, shape2], { width: "200vw", height: "200vh", borderRadius: "0%", duration: 3, ease: "power2.inOut" })
          .to('.rings-box', { opacity: 0.6, duration: 2 }, "-=1") // dim the giant flare slightly
          
        // 2. The glassmorphism text overlay slides down and fades in
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 }, "-=1")
          .from('.holo-msg', { backdropFilter: "blur(0px)", duration: 2 }, "-=2")
          .from('.m-head', { scale: 1.2, duration: 2, ease: "back.out(1.5)" }, "-=2");
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
