export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#0f172a"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Mali:wght@400;600&display=swap');
            
            .taj-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                overflow: hidden; background: linear-gradient(180deg, #1e1b4b, #312e81, #0f172a);
                perspective: 1200px;
            }

            .moonBg {
                position: absolute; top: 15vh; width: 120px; height: 120px;
                background: #f1f5f9; border-radius: 50%; box-shadow: 0 0 50px #fff;
                z-index: 1; opacity: 0.9;
            }

            /* Taj Mahal Silhouette */
            .taj-महल {
                position: absolute; bottom: 0; width: 400px; height: 350px;
                background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><path d="M100 10 Q110 50 130 60 Q130 100 130 150 L70 150 Q70 100 70 60 Q90 50 100 10 Z" fill="%23f8fafc"/><path d="M40 80 Q45 100 55 105 L55 150 L25 150 L25 105 Q35 100 40 80 Z" fill="%23e2e8f0"/><path d="M160 80 Q155 100 145 105 L145 150 L175 150 L175 105 Q165 100 160 80 Z" fill="%23e2e8f0"/><rect x="10" y="50" width="10" height="100" fill="%23cbd5e1"/><rect x="180" y="50" width="10" height="100" fill="%23cbd5e1"/></svg>') no-repeat bottom center;
                background-size: contain; z-index: 10;
                filter: drop-shadow(0 10px 20px rgba(0,0,0,0.8)); transition: 2s; cursor: pointer;
            }

            /* Reflection Pool */
            .pool {
                position: absolute; bottom: 0; width: 100vw; height: 20vh;
                background: linear-gradient(0deg, #020617, #1e293b); z-index: 5;
                border-top: 2px solid #475569;
            }
            .reflection {
                position: absolute; bottom: -20vh; width: 400px; height: 350px;
                background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><path d="M100 10 Q110 50 130 60 Q130 100 130 150 L70 150 Q70 100 70 60 Q90 50 100 10 Z" fill="%23f8fafc"/><path d="M40 80 Q45 100 55 105 L55 150 L25 150 L25 105 Q35 100 40 80 Z" fill="%23e2e8f0"/><path d="M160 80 Q155 100 145 105 L145 150 L175 150 L175 105 Q165 100 160 80 Z" fill="%23e2e8f0"/><rect x="10" y="50" width="10" height="100" fill="%23cbd5e1"/><rect x="180" y="50" width="10" height="100" fill="%23cbd5e1"/></svg>') no-repeat top center;
                background-size: contain; transform: scaleY(-0.5); opacity: 0.3; filter: blur(5px);
                z-index: 6; pointer-events: none;
            }

            .hint-text { position: absolute; top: 30vh; color: #bae6fd; font-family: 'Mali', sans-serif; font-size: 1.5rem; letter-spacing: 2px; text-shadow: 0 0 10px #0284c7; animation: pulse 2s infinite; font-weight: 700; z-index: 20; pointer-events: none;}
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Petals overlay */
            .petal { position: absolute; width: 15px; height: 15px; background: #fda4af; border-radius: 50% 0 50% 50%; opacity: 0; z-index: 30;}

            /* Love Message Overlay */
            .india-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(131, 24, 67, 0.8), rgba(15, 23, 42, 0.95));
            }
            .m-head { font-family: 'Cinzel', serif; font-size: 4rem; color: #fecdd3; margin-bottom: 20px; font-weight: 700; text-shadow: 0 0 20px #e11d48;}
            .m-body { font-family: 'Mali', sans-serif; font-size: 1.6rem; color: #fff; line-height: 1.6; max-width: 600px; text-align: center; font-weight: 400; text-shadow: 0 2px 5px #000;}
            .m-foot { font-family: 'Cinzel', serif; font-size: 1.2rem; color: #f43f5e; margin-top: 40px; letter-spacing: 3px; font-weight: 700;}

        </style>

        <div class="taj-scene" id="scene">
            <div class="moonBg" id="moon"></div>
            
            <div class="hint-text" id="hint">แตะเพื่อมอบความรักนิรันดร์</div>

            <div class="taj-महल" id="taj"></div>
            
            <div class="pool"></div>
            <div class="reflection"></div>

            <div class="india-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">"${escapeHtml(data.message).replace(/\n/g, '<br>')}"</div>
                 <div class="m-foot">ETERNAL LOVE FROM: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const taj = document.getElementById('taj');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const scene = document.querySelector('.taj-scene');
    const moon = document.getElementById('moon');

    let isTouched = false;

    taj.addEventListener('click', () => {
        if(isTouched) return;
        isTouched = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Taj Mahal glows radiantly pink/gold
        tl.to(taj, { filter: "drop-shadow(0 0 50px #fb7185) drop-shadow(0 0 100px #e11d48)", duration: 2 })
          .to(moon, { background: "#ffe4e6", boxShadow: "0 0 100px #fda4af", duration: 2 }, 0)
          
        // 2. Cascade of rose petals
          .call(() => {
              for(let i=0; i<50; i++) {
                  let p = document.createElement('div');
                  p.className = 'petal';
                  scene.appendChild(p);
                  gsap.set(p, { x: Math.random() * window.innerWidth, y: -50, rotation: Math.random()*360, opacity: 1 });
                  gsap.to(p, {
                      y: window.innerHeight,
                      x: "+=" + (Math.random()-0.5)*200,
                      rotation: "+=360",
                      duration: 3 + Math.random()*3,
                      ease: "none", delay: Math.random()*2,
                      onComplete: ()=>p.remove()
                  });
              }
          })
          
        // 3. Message gracefully fades in
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 3, delay: 1 });
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
