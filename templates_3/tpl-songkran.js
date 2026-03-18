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
            @import url('https://fonts.googleapis.com/css2?family=Mitr:wght@400;600&family=Kanit:wght@300;600&display=swap');
            
            .sk-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                overflow: hidden; background: linear-gradient(180deg, #bae6fd, #38bdf8, #0ea5e9);
            }

            /* Bright summer sun */
            .sun { position: absolute; top: 10vh; right: 10vw; width: 150px; height: 150px; background: #fef08a; border-radius: 50%; box-shadow: 0 0 80px #facc15; }

            /* Water gun in foreground */
            .water-gun {
                position: absolute; bottom: -50px; right: 20px; width: 250px; height: 300px;
                background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="50" width="80" height="40" rx="20" fill="%23ef4444"/><rect x="40" y="90" width="30" height="60" fill="%233b82f6"/><path d="M40 50 L20 10 L40 10 Z" fill="%23facc15"/><rect x="80" y="65" width="20" height="10" fill="%23d1d5db"/><circle cx="55" cy="70" r="10" fill="%23fbbf24"/></svg>') no-repeat bottom right;
                background-size: contain; z-index: 20; transform-origin: bottom right; transition: 0.1s; cursor: pointer;
                filter: drop-shadow(-10px 10px 20px rgba(0,0,0,0.5));
            }
            .water-gun:hover { transform: rotate(-5deg) scale(1.05); }
            .water-gun:active { transform: rotate(-2deg) scale(0.95); }

            .hint-text { position: absolute; bottom: 30vh; right: 5vw; color: #fff; font-family: 'Mitr', sans-serif; font-size: 1.5rem; letter-spacing: 2px; text-shadow: 0 0 10px #0284c7; animation: pulse 1s infinite alternate; font-weight: 600; z-index: 21; pointer-events: none;}
            @keyframes pulse { 0%{opacity:0.4; transform:scale(0.95);} 100%{opacity:1; transform:scale(1.05);} }

            /* Water splash blobs Container */
            .glass-pane {
                position: absolute; inset: 0; z-index: 40; pointer-events: none; overflow: hidden;
            }
            .water-blob {
                position: absolute; background: rgba(255,255,255,0.6); backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.8);
                box-shadow: inset -5px -5px 10px rgba(0,0,0,0.1), inset 5px 5px 10px rgba(255,255,255,0.9), 0 10px 20px rgba(0,0,0,0.1);
                opacity: 0; border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
            }

            /* Songkran Message Overlay (Like writing on foggy glass that was washed away) */
            .festival-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                /* A warm golden overlay after splashing */
                background: radial-gradient(circle, rgba(254, 240, 138, 0.4), rgba(2, 132, 199, 0.8)); backdrop-filter: blur(5px);
            }
            .m-head { font-family: 'Mitr', sans-serif; font-size: 5rem; color: #fff; margin-bottom: 20px; font-weight: 600; text-shadow: 0 5px 15px #0284c7, 0 0 30px #38bdf8;}
            .m-body { font-family: 'Kanit', sans-serif; font-size: 1.6rem; color: #0c4a6e; line-height: 1.8; max-width: 600px; text-align: center; font-weight: 600; background: rgba(255,255,255,0.8); padding: 30px; border-radius: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); border: 4px solid #38bdf8;}
            .m-foot { font-family: 'Mitr', sans-serif; font-size: 1.5rem; color: #fef08a; margin-top: 40px; letter-spacing: 3px; text-shadow: 2px 2px 0px #0c4a6e;}

        </style>

        <div class="sk-scene" id="scene">
            <div class="sun"></div>
            
            <div class="hint-text" id="hint">กดยิงปืนฉีดน้ำเลย!</div>

            <div class="water-gun" id="gun"></div>

            <div class="glass-pane" id="gPane"></div>

            <div class="festival-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">สวัสดีปีใหม่ไทย - ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const gun = document.getElementById('gun');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const gPane = document.getElementById('gPane');
    
    let isSplashed = false;

    gun.addEventListener('click', () => {
        if(isSplashed) return;
        isSplashed = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Gun recoils
        tl.to(gun, { rotation: -30, x: 50, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1 })
          
        // 2. Generate large squirts of water hitting the "camera lens"
          .call(() => {
              for(let i=0; i<8; i++) {
                  let b = document.createElement('div');
                  b.className = 'water-blob';
                  gPane.appendChild(b);
                  
                  let size = 100 + Math.random()*300;
                  gsap.set(b, {
                      width: size, height: size,
                      x: window.innerWidth/2 + (Math.random()-0.5)*window.innerWidth,
                      y: window.innerHeight/2 + (Math.random()-0.5)*window.innerHeight,
                      scale: 0.1, opacity: 1, rotation: Math.random()*360
                  });
                  
                  // splat!
                  gsap.to(b, { scale: 1.5 + Math.random(), duration: 0.3, ease: "back.out(2)" });
                  
                  // drip down slowly
                  gsap.to(b, { y: window.innerHeight + 500, duration: 3 + Math.random()*2, ease: "power1.in", delay: 0.5 });
              }
          }, null, 0.1)
          
        // 3. The gun drops out of view
          .to(gun, { y: 500, duration: 1, ease: "power2.in" }, 1)

        // 4. Clean festive message pops up cleanly after the wash
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5 }, 1.5)
          .from('.m-body', { scale: 0, rotation: 10, duration: 1.5, ease: "elastic.out(1, 0.5)" }, 1.5);
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
