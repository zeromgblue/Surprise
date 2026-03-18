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
            @import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Prompt:wght@300;600&display=swap');
            
            .wall-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                overflow: hidden; background: linear-gradient(180deg, #fef08a, #f97316, #b45309);
            }

            /* Mountains Background */
            .mountains {
                position: absolute; bottom: 20vh; width: 200vw; height: 40vh;
                background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><path d="M0 50 L10 20 L25 40 L40 10 L60 45 L75 15 L90 40 L100 20 L100 50 Z" fill="%2378350f" opacity="0.6"/></svg>') repeat-x;
                background-size: auto 100%; z-index: 5;
            }

            /* The Great Wall silhouette */
            .great-wall {
                position: absolute; bottom: 0; width: 100vw; height: 35vh;
                background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><path d="M0 40 L0 25 L5 25 L5 20 L15 20 L15 25 L20 25 L20 20 L30 20 L30 25 L35 25 L35 40 Z" fill="%23451a03"/><path d="M40 40 L40 25 L45 25 L45 20 L55 20 L55 25 L60 25 L60 20 L70 20 L70 25 L75 25 L75 40 Z" fill="%234b2005"/><path d="M80 40 L80 25 L85 25 L85 20 L95 20 L95 25 L100 25 L100 40 Z" fill="%233e1602"/></svg>') repeat-x bottom;
                background-size: auto 100%; z-index: 10;
                box-shadow: 0 -10px 30px rgba(0,0,0,0.5);
            }

            /* Dragon Silhouette (hidden initially) */
            .dragon {
                position: absolute; top: 10vh; right: -300px; width: 250px; height: 100px;
                background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><path d="M80 20 Q90 10 100 20 Q90 30 80 20 Q70 10 60 20 Q50 30 40 20 Q30 10 20 20 Q10 30 0 20" stroke="%23facc15" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="95" cy="15" r="3" fill="%23ef4444"/></svg>') no-repeat center;
                filter: drop-shadow(0 0 10px #facc15); z-index: 8; opacity: 0;
            }

            .hint-btn {
                position: absolute; top: 40vh; z-index: 50; padding: 15px 40px;
                background: #b45309; border: 2px solid #facc15;
                color: #fef08a; font-family: 'Prompt', sans-serif; font-size: 1.2rem;
                cursor: pointer; border-radius: 5px; box-shadow: 0 5px 15px rgba(0,0,0,0.5);
                transition: 0.3s; animation: pulse 2s infinite; font-weight: 700;
            }
            .hint-btn:hover { background: #92400e; transform: scale(1.05); }
            @keyframes pulse { 0%,100%{box-shadow: 0 0 5px #facc15;} 50%{box-shadow: 0 0 20px #fde047;} }

            /* Chinese Scroll Message Overlay */
            .scroll-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 40; opacity: 0; pointer-events: none;
                background: rgba(0,0,0,0.8);
            }
            .scroll-paper {
                background: #fef3c7; width: 80%; max-width: 500px; padding: 40px 20px;
                border-left: 20px solid #78350f; border-right: 20px solid #78350f;
                box-shadow: 0 10px 30px rgba(0,0,0,0.8); display: flex; flex-direction: column; align-items: center;
                position: relative; overflow: hidden; height: 0; /* Animated to full height */
            }
            .scroll-end {
                position: absolute; left: -30px; right: -30px; height: 20px; background: #451a03;
                border-radius: 10px; z-index: 2;
            }
            .scroll-top { top: 0; } .scroll-bottom { bottom: 0; }

            .m-head { font-family: 'Ma Shan Zheng', cursive; font-size: 3rem; color: #b45309; margin-top: 20px; margin-bottom: 20px; font-weight: 700; text-align: center;}
            .m-body { font-family: 'Prompt', sans-serif; font-size: 1.2rem; color: #451a03; line-height: 1.6; text-align: center; font-weight: 600; margin-bottom: 20px;}
            .m-foot { font-family: 'Ma Shan Zheng', cursive; font-size: 1.5rem; color: #78350f; margin-top: 10px;}

            .lantern { position: absolute; bottom: -50px; width: 30px; height: 40px; background: #ef4444; border-radius: 10px 10px 5px 5px; opacity: 0; z-index: 15; box-shadow: 0 0 15px #ef4444;}
            .lantern::after { content:''; position:absolute; bottom:-10px; left:12px; width:6px; height:10px; background:#facc15;}

        </style>

        <div class="wall-scene" id="scene">
            <div class="mountains"></div>
            <div class="dragon" id="dragon"></div>
            <div class="great-wall"></div>

            <button class="hint-btn" id="startBtn">อัญเชิญมังกรทอง</button>

            <div class="scroll-msg" id="msg">
                <div class="scroll-paper" id="paper">
                    <div class="scroll-end scroll-top"></div>
                    <div class="m-head">${escapeHtml(data.receiver)}</div>
                    <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                    <div class="m-foot">FROM: ${escapeHtml(data.sender)}</div>
                    <div class="scroll-end scroll-bottom"></div>
                </div>
            </div>
        </div>
    `;

    const btn = document.getElementById('startBtn');
    const dragon = document.getElementById('dragon');
    const msg = document.getElementById('msg');
    const paper = document.getElementById('paper');
    const scene = document.getElementById('scene');

    let isSummoned = false;

    btn.addEventListener('click', () => {
        if(isSummoned) return;
        isSummoned = true;
        
        gsap.to(btn, { opacity: 0, scale: 0.5, duration: 0.5, onComplete: ()=>btn.style.display = 'none' });

        const tl = gsap.timeline();

        // 1. Dragon flies majestically across the screen
        tl.to(dragon, { opacity: 1, duration: 0.5 })
          .to(dragon, {
              x: -window.innerWidth - 600,
              y: -100,
              duration: 5,
              ease: "sine.inOut"
          })
          
        // 2. Small floating lanterns rise from the wall
          .call(() => {
              for(let i=0; i<15; i++) {
                  let L = document.createElement('div');
                  L.className = 'lantern';
                  scene.appendChild(L);
                  gsap.set(L, { x: Math.random() * window.innerWidth, y: 0, opacity: 1 });
                  gsap.to(L, {
                      y: -window.innerHeight,
                      x: "+=" + (Math.random()-0.5)*100,
                      duration: 4 + Math.random()*3,
                      ease: "power1.in",
                      delay: Math.random()*2,
                      onComplete: ()=>L.remove()
                  });
              }
          }, null, 1)

        // 3. Unroll the scroll message
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1 }, 2)
          .to(paper, { height: 'auto', minHeight: '300px', duration: 1.5, ease: "power2.out" }, 2.5);
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
