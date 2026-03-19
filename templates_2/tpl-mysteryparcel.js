export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#E9ECEF"; 
    // Cardboard texture
    container.style.backgroundImage = "url('https://www.transparenttextures.com/patterns/cardboard-flat.png')";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;700&family=Kanit:wght@300;400&display=swap');
            
            .scene {
                position: relative; width: 300px; height: 300px;
                display: flex; align-items: center; justify-content: center;
                perspective: 1000px;
            }

            .parcel-box {
                position: relative; width: 220px; height: 160px;
                background: #D4A373; border-radius: 5px; cursor: pointer;
                box-shadow: 0 20px 30px rgba(0,0,0,0.3), inset 0 -20px 20px rgba(0,0,0,0.1);
                border: 2px solid #b38860; transform-style: preserve-3d;
                transition: transform 0.2s;
            }
            .parcel-box:active { transform: scale(0.95); }

            /* Shipping Label */
            .p-label {
                position: absolute; top: 20px; left: 20px; width: 100px; height: 70px;
                background: #fff; border-radius: 2px; padding: 5px; box-sizing: border-box;
                font-family: monospace; font-size: 0.55rem; color: #333; line-height: 1.2;
                box-shadow: 1px 1px 3px rgba(0,0,0,0.1); transform: rotate(-3deg);
            }
            .p-barcode { width: 100%; height: 15px; background: repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 4px, #000 4px, #000 5px, #fff 5px, #fff 7px); margin-bottom: 5px;}

            /* Tape */
            .p-tape {
                position: absolute; top: 0; left: 50%; transform: translateX(-50%);
                width: 40px; height: 100%; background: rgba(255, 235, 180, 0.4);
                backdrop-filter: blur(2px); border-left: 1px solid rgba(255,255,255,0.2); border-right: 1px solid rgba(255,255,255,0.2);
                z-index: 5;
            }
            
            /* Box flaps (ถึงp) for opening anim */
            .flap {
                position: absolute; top: 0; width: 100%; height: 50%; background: #c89562;
                transform-origin: top; border-bottom: 2px solid #a87b4f; z-index: 4;
            }
            .flap.front { height: 100%; transform-origin: bottom; bottom: 0; top: auto; border-bottom:none; border-top: 2px solid #a87b4f; }

            .hint-text {
                position: absolute; bottom: -60px; width: 100%; text-align: center;
                color: #6C757D; font-family: 'Chakra Petch', sans-serif; font-size: 1rem;
                letter-spacing: 2px; animation: flash 1.5s infinite;
            }
            @keyframes flash { 0%,100%{opacity:0.4;} 50%{opacity:1;} }

            /* Packing Peanuts */
            .peanut { position: absolute; background: #fff; border-radius: 10px; width:15px; height:25px; box-shadow: 1px 1px 2px rgba(0,0,0,0.1); z-index: 10;}

            .msg-card {
                position: absolute; width: 80%; height: auto; background: #fff;
                border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                padding: 30px; display: flex; flex-direction: column; align-items: center;
                opacity: 0; z-index: 20; text-align: center;
                border-top: 5px solid #E63946;
            }
            .c-brand { font-family: 'Chakra Petch', sans-serif; font-size: 1.5rem; color: #E63946; margin-bottom: 20px; font-weight: 700;}
            .c-text { font-family: 'Kanit', sans-serif; font-size: 1.1rem; line-height: 1.6; color: #333; }
        </style>

        <div class="scene" id="scene">
            <div class="parcel-box" id="box">
                <div class="flap top"></div>
                <div class="p-label">
                    <div class="p-barcode"></div>
                    <b>DELIVER TO:</b><br>${escapeHtml(data.receiver)}<br>
                    <b>PRIORITY</b>
                </div>
                <div class="p-tape" id="tape"></div>
            </div>
            
            <div class="msg-card" id="card">
                <div class="c-brand">✨ SURPRISE! ✨</div>
                <div class="c-text">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="c-text" style="font-size:0.9rem; color:#888; margin-top:20px; border-top: 1px dashed #ccc; padding-top:10px;">— FROM: ${escapeHtml(data.sender)}</div>
            </div>

            <div class="hint-text" id="hint">แตะเพื่อแกะกล่อง</div>
        </div>
    `;

    const box = document.getElementById('box');
    const tape = document.getElementById('tape');
    const scene = document.getElementById('scene');
    const card = document.getElementById('card');
    
    let opened = false;

    box.addEventListener('click', () => {
        if(opened) return;
        opened = true;
        document.getElementById('hint').style.display = 'none';

        const tl = gsap.timeline();

        // 1. Shake/Rattle
        tl.to(box, { rotation: 5, duration: 0.1, yoyo: true, repeat: 5 })
          .to(box, { rotation: 0, duration: 0.1 })
          
        // 2. Rip tape
          .to(tape, { height: 0, opacity: 0, duration: 0.3, ease: "power1.in" })
          
        // 3. Poof particles (packing peanuts)
          .call(() => {
              for(let i=0; i<20; i++) {
                  let p = document.createElement('div');
                  p.className = 'peanut';
                  p.style.left = '100px'; p.style.top = '50px';
                  box.appendChild(p);
                  gsap.to(p, {
                      x: (Math.random()-0.5)*300, y: - (Math.random()*150 + 50),
                      rotation: Math.random()*360, duration: 1 + Math.random(),
                      ease: "power2.out", opacity: 0, onComplete: ()=>p.remove()
                  });
              }
          })
          
        // 4. Box drops away slightly
          .to(box, { y: 200, opacity: 0, rotationX: 45, duration: 0.8, ease: "power2.in" }, "+=0.2")

        // 5. Card floats up
          .fromถึง(card, 
              { y: 50, scale: 0.8, opacity: 0 },
              { y: -20, scale: 1, opacity: 1, duration: 1, ease: "back.out(1.2)" },
              "-=0.4"
          );
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
