export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#e0f2fe"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Itim&family=Sarabun:wght@300;600&display=swap');
            
            .rainbow-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                overflow: hidden; background: linear-gradient(180deg, #94a3b8, #cbd5e1);
                transition: background 3s ease;
            }

            /* Sun hiding initially */
            .sun {
                position: absolute; top: -100px; right: -100px; width: 200px; height: 200px;
                background: #fde047; border-radius: 50%; box-shadow: 0 0 100px #fef08a; z-index: 5;
                transition: 3s ease;
            }

            /* Rain */
            .rain { position: absolute; inset:0; background: url('https://www.transparenttextures.com/patterns/rain.png'); opacity: 0.5; animation: raining 0.3s linear infinite; z-index: 10; pointer-events: none; transition: opacity 2s;}
            @keyframes raining { 0% { background-position: 0 0; } 100% { background-position: -10px 100px; } }

            /* Rainbow Arc (CSS clip and gradients) */
            .rainbow {
                position: absolute; bottom: -10vh; width: 90vw; height: 100vw; max-width: 800px; max-height: 800px;
                background: radial-gradient(circle at center 100%, 
                    transparent 40%, 
                    #8b5cf6 41%, #8b5cf6 44%, 
                    #3b82f6 45%, #3b82f6 48%, 
                    #10b981 49%, #10b981 52%, 
                    #facc15 53%, #facc15 56%, 
                    #f97316 57%, #f97316 60%, 
                    #ef4444 61%, #ef4444 64%, 
                    transparent 65%);
                border-radius: 50% 50% 0 0 / 100% 100% 0 0;
                clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%); /* Hidden from bottom */
                z-index: 15; opacity: 0.8; mix-blend-mode: overlay;
            }

            .hint-btn {
                position: absolute; top: 40vh; background: rgba(51, 65, 85, 0.8); color: #FFF; font-family: 'Itim', cursive;
                font-size: 1.5rem; padding: 15px 30px; border-radius: 50px; cursor: pointer; z-index: 50;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3); border: 2px solid #cbd5e1;
                animation: pulseBtn 2s infinite;
            }
            @keyframes pulseBtn { 0%,100%{transform:scale(1);} 50%{transform:scale(1.05);} }

            /* Message in the clouds */
            .sky-msg {
                position: absolute; top: 20vh; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 40; opacity: 0; pointer-events: none;
                width: 100%; text-align: center;
            }
            .m-head { font-family: 'Itim', cursive; font-size: 3.5rem; color: #1e40af; margin-bottom: 20px; font-weight: 700; text-shadow: 2px 2px 5px #fff;}
            .m-body { font-family: 'Sarabun', sans-serif; font-size: 1.5rem; color: #0f172a; line-height: 1.6; max-width: 600px; margin: 0 auto; font-weight: 600; background: rgba(255,255,255,0.5); padding: 20px; border-radius: 20px;}
            .m-foot { font-family: 'Itim', cursive; font-size: 1.5rem; color: #f59e0b; margin-top: 30px; font-weight: 700;}

        </style>

        <div class="rainbow-scene" id="scene">
            <div class="sun" id="sun"></div>
            <div class="rain" id="rain"></div>
            
            <div class="rainbow" id="rainbow"></div>

            <div class="hint-btn" id="startBtn">ปัดเป่าเมฆฝนให้สดใส</div>

            <div class="sky-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">ด้วยรักและความสดใสจาก ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const startBtn = document.getElementById('startBtn');
    const rain = document.getElementById('rain');
    const sun = document.getElementById('sun');
    const rainbow = document.getElementById('rainbow');
    const msg = document.getElementById('msg');
    const scene = document.getElementById('scene');

    let isCleared = false;

    startBtn.addEventListener('click', () => {
        if(isCleared) return;
        isCleared = true;
        
        // Hide button
        gsap.to(startBtn, { opacity: 0, duration: 0.5, onComplete: ()=>startBtn.style.display='none' });

        const tl = gsap.timeline();

        // 1. Rain stops, bg becomes sky blue, Sun appears
        tl.to(rain, { opacity: 0, duration: 2 })
          .call(() => { scene.style.background = 'linear-gradient(180deg, #38bdf8, #e0f2fe)'; }, null, "-=2")
          .to(sun, { top: "50px", right: "50px", duration: 3, ease: "back.out(1.2)" }, "-=1")
          
        // 2. Rainbow grows upward
          .to(rainbow, { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 3, ease: "power1.inOut" }, "-=1")
          
        // 3. Sky message fades in gently
          .to(msg, { opacity: 1, y: -20, pointerEvents: 'auto', duration: 2 }, "-=1");
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
