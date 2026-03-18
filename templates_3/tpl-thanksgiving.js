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
            @import url('https://fonts.googleapis.com/css2?family=Shrikhand&family=Prompt:wght@400;600&display=swap');
            
            .tkg-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                overflow: hidden; background: linear-gradient(180deg, #d97706, #b45309, #451a03);
                perspective: 1000px;
            }

            /* Autumn falling leaves Box */
            .leaf-box { position: absolute; inset: 0; z-index: 5; pointer-events: none;}
            .leaf { position: absolute; font-size: 2rem; opacity: 0.8; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));}

            /* 3D Dinner Table / Food Cover */
            .table-wrapper {
                position: relative; width: 300px; height: 300px; z-index: 15;
                transform-style: preserve-3d; cursor: pointer; transition: 0.3s;
                margin-bottom: 50px;
            }
            .table-wrapper:hover { transform: scale(1.05); }

            /* Platter Base */
            .platter {
                position: absolute; bottom: 0; width: 300px; height: 100px;
                background: linear-gradient(135deg, #e5e7eb, #9ca3af);
                border-radius: 50%; box-shadow: 0 40px 40px rgba(0,0,0,0.8), inset 0 -10px 10px rgba(0,0,0,0.5);
                transform: rotateX(60deg);
            }

            /* Silver Dome Cover */
            .cloche {
                position: absolute; bottom: 40px; left: 25px; width: 250px; height: 200px;
                background: linear-gradient(90deg, #d1d5db, #f3f4f6, #9ca3af);
                border-radius: 100px 100px 0 0; transform-origin: bottom center;
                box-shadow: inset 20px 0 30px rgba(0,0,0,0.3), inset -20px 0 30px rgba(255,255,255,0.8);
                display: flex; justify-content: center; z-index: 12;
            }
            .cloche-handle {
                position: absolute; top: -15px; width: 30px; height: 30px;
                background: radial-gradient(circle, #fff, #9ca3af); border-radius: 50%;
                box-shadow: 0 5px 5px rgba(0,0,0,0.5);
            }

            .hint-text { position: absolute; bottom: 10vh; color: #fde68a; font-family: 'Prompt', sans-serif; font-size: 1.2rem; letter-spacing: 2px; text-shadow: 0 0 10px #d97706; animation: pulse 2s infinite; font-weight: 600; z-index: 20; pointer-events: none;}
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Thanksgiving Message Overlay */
            .feast-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(180, 83, 9, 0.6), rgba(69, 26, 3, 0.95)); backdrop-filter: blur(2px);
            }
            .m-head { font-family: 'Shrikhand', cursive; font-size: 5rem; color: #fde047; margin-bottom: 20px; text-shadow: 3px 3px 0px #b45309, 0 5px 20px #000; text-transform: capitalize;}
            .m-body { font-family: 'Prompt', sans-serif; font-size: 1.6rem; color: #fffbeb; line-height: 1.8; max-width: 600px; text-align: center; font-weight: 600; background: rgba(0,0,0,0.3); padding: 40px; border-radius: 10px; border-left: 5px solid #ea580c; border-right: 5px solid #ea580c; box-shadow: 0 10px 30px rgba(0,0,0,0.5);}
            .m-foot { font-family: 'Prompt', sans-serif; font-size: 1.2rem; color: #fb923c; margin-top: 40px; letter-spacing: 5px;}

            /* Turkey emoji that sits under cloche */
            .turkey { position: absolute; bottom: 60px; font-size: 10rem; left: 50%; transform: translateX(-50%); z-index: 10; filter: drop-shadow(0 20px 10px rgba(0,0,0,0.5));}

        </style>

        <div class="tkg-scene" id="scene">
            <div class="leaf-box" id="lBox"></div>
            
            <div class="hint-text" id="hint">เปิดฝาครอบอาหารค่ำ</div>

            <div class="table-wrapper" id="table">
                <div class="platter"></div>
                <div class="turkey">🦃</div>
                <div class="cloche" id="cloche"><div class="cloche-handle"></div></div>
            </div>

            <div class="feast-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">"${escapeHtml(data.message).replace(/\n/g, '<br>')}"</div>
                 <div class="m-foot">THANKFUL FOR YOU - ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const table = document.getElementById('table');
    const cloche = document.getElementById('cloche');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const lBox = document.getElementById('lBox');
    
    // Continuous falling leaves
    const leaves = ['🍂', '🍁'];
    function fallLeave() {
        let L = document.createElement('div');
        L.className = 'leaf';
        L.innerHTML = leaves[Math.floor(Math.random()*leaves.length)];
        lBox.appendChild(L);
        
        gsap.set(L, { x: Math.random()*window.innerWidth, y: -50, rotationZ: Math.random()*360 });
        gsap.to(L, {
            y: window.innerHeight + 50,
            x: "+="+(Math.random()-0.5)*300,
            rotationZ: "+="+360,
            duration: 5 + Math.random()*5,
            ease: "none",
            onComplete: ()=>L.remove()
        });
    }
    setInterval(fallLeave, 300);

    let isServed = false;

    table.addEventListener('click', () => {
        if(isServed) return;
        isServed = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Cloche flies up and off screen
        tl.to(cloche, { y: -500, rotationZ: 20, opacity: 0, duration: 1.5, ease: "power2.in" })
          
        // 2. Turkey happily bounces
          .to('.turkey', { scale: 1.2, duration: 0.2, yoyo: true, repeat: 3 }, "-=0.5")
          
        // 3. Zoom into the dish
          .to(table, { scale: 2, y: 150, duration: 2, ease: "power2.inOut" }, "-=1")
          
        // 4. Fall message reveals
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 }, 1)
          .from('.m-body', { scaleY: 0, transformOrigin: "top", duration: 1.5, ease: "power2.out" }, 1.5);
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
