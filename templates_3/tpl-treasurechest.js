export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#140c06"; // Deep dark cave
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@1,700&family=Kanit:wght@300;500&display=swap');
            
            .scene {
                position: relative; width: 350px; height: 350px;
                display: flex; align-items: center; justify-content: center;
                perspective: 800px;
            }

            .chest {
                position: relative; width: 220px; height: 160px;
                transform-style: preserve-3d; cursor: pointer;
                transition: transform 0.2s;
            }
            .chest:active { transform: scale(0.95); }

            .chest-base {
                position: absolute; bottom: 0; width: 100%; height: 100px;
                background: linear-gradient(to bottom, #724022, #4a2812);
                border-radius: 5px; border: 4px solid #b78941; box-sizing: border-box;
                box-shadow: 0 20px 40px rgba(0,0,0,0.8), inset 0 10px 20px rgba(0,0,0,0.5);
            }
            /* Vertical gold bands */
            .chest-base::before, .chest-base::after {
                content: ''; position: absolute; top: 0; width: 15px; height: 100%;
                background: linear-gradient(to right, #d4af37, #f3e5ab, #d4af37);
                border-left: 1px solid #73591c; border-right: 1px solid #73591c;
            }
            .chest-base::before { left: 30px; }
            .chest-base::after { right: 30px; }

            /* Keyhole */
            .keyhole {
                position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
                width: 25px; height: 35px; background: radial-gradient(circle at top, #000, #222);
                border: 3px solid #d4af37; border-radius: 15px 15px 5px 5px; z-index: 5;
                box-shadow: 0 2px 5px rgba(0,0,0,0.5);
                display: flex; flex-direction: column; align-items: center;
            }
            .keyhole::after { content: ''; width: 6px; height: 12px; background: #000; margin-top: 10px; border-radius: 3px; }

            .chest-lid {
                position: absolute; bottom: 100px; width: 100%; height: 80px;
                background: linear-gradient(to top, #724022, #945935);
                border-radius: 110px 110px 0 0; border: 4px solid #b78941; box-sizing: border-box;
                transform-origin: bottom center; z-index: 10;
                box-shadow: inset 0 -5px 10px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.5);
            }
            .chest-lid::before, .chest-lid::after {
                content: ''; position: absolute; bottom: 0; width: 15px; height: 100%;
                background: linear-gradient(to right, #d4af37, #f3e5ab, #d4af37);
                border-left: 1px solid #73591c; border-right: 1px solid #73591c;
            }
            .chest-lid::before { left: 30px; }
            .chest-lid::after { right: 30px; }

            .god-rays {
                position: absolute; top: 50%; left: 50%; width: 100px; height: 100px;
                background: radial-gradient(circle, #fff, transparent 60%);
                transform: translate(-50%, -50%); opacity: 0; pointer-events: none; mix-blend-mode: screen;
            }

            .msg-scroll {
                position: absolute; width: 80%; max-width: 350px;
                background: #fdf5e6; border: 2px solid #d4af37; border-radius: 5px;
                padding: 40px; box-sizing: border-box; text-align: center;
                opacity: 0; transform: translateY(50px) scale(0.5); z-index: 20;
                box-shadow: 0 20px 50px rgba(0,0,0,0.5), inset 0 0 50px rgba(212, 175, 55, 0.2);
            }
            .m-head { font-family: 'Crimson Pro', serif; font-size: 2rem; color: #b78941; margin-bottom: 20px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }
            .m-body { font-family: 'Kanit', sans-serif; font-size: 1.1rem; line-height: 1.6; color: #444; }

            .hint {
                position: absolute; bottom: -50px; width: 100%; text-align: center;
                color: #d4af37; font-family: sans-serif; letter-spacing: 2px;
                animation: pulse 1.5s infinite;
            }
            @keyframes pulse { 0%{opacity:0.4; transform:scale(1);} 100%{opacity:1; transform:scale(1.05);} }
            
            /* Coins popping out */
            .gold-coin { position: absolute; width:15px; height:15px; background: #FFD700; border-radius:50%; border:2px solid #DAA520; opacity:0; z-index: 15;}
        </style>

        <div class="scene" id="scene">
            <div class="msg-scroll" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-body" style="font-size:0.9rem; color:#888; margin-top:20px; border-top:1px solid #ccc; padding-top:10px;">— ${escapeHtml(data.sender)}</div>
            </div>

            <div class="god-rays" id="rays"></div>

            <div class="chest" id="chest">
                <div class="chest-base"><div class="keyhole"></div></div>
                <div class="chest-lid" id="lid"></div>
            </div>
            
            <div class="hint" id="hint">แตะเพื่อปลดล็อก</div>
        </div>
    `;

    const chest = document.getElementById('chest');
    const lid = document.getElementById('lid');
    const msg = document.getElementById('msg');
    const rays = document.getElementById('rays');
    const scene = document.getElementById('scene');
    let opened = false;

    chest.addEventListener('click', () => {
        if(opened) return;
        opened = true;
        document.getElementById('hint').style.display = 'none';

        const tl = gsap.timeline();

        // 1. Shake to unlock
        tl.to(chest, { x: 5, duration: 0.05, yoyo: true, repeat: 5 })
          .to(chest, { x: 0, duration: 0.05 })

        // 2. Lid opens (rotateX backward)
          .to(lid, { rotationX: 110, duration: 0.8, ease: "power2.inOut" })

        // 3. Bright light
          .to(rays, { scale: 15, opacity: 0.8, duration: 1, ease: "power2.out" }, "-=0.4")
          .to(scene, { filter: "brightness(2)", duration: 0.1, yoyo: true, repeat: 3 }, "-=1") // brief flash

        // 4. Coins burst out
          .call(() => {
              for(let i=0; i<30; i++) {
                  let c = document.createElement('div');
                  c.className = 'gold-coin';
                  chest.appendChild(c);
                  // position near middle
                  c.style.left = '100px'; c.style.bottom = '80px';
                  gsap.to(c, {
                      x: (Math.random()-0.5)*300,
                      y: - (Math.random()*200 + 100),
                      opacity: 1, duration: 1 + Math.random(),
                      ease: "power2.out", onComplete: ()=> {
                          gsap.to(c, {y: "+=300", opacity:0, duration: 1, ease:"power2.in"});
                      }
                  });
              }
          })

        // 5. Scroll floats up
          .to(msg, { y: -50, scale: 1, opacity: 1, duration: 1.5, ease: "back.out(1.2)" }, "-=0.5")
          
        // 6. Dim rays slightly to show text better
          .to(rays, { opacity: 0.3, duration: 2 });
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
