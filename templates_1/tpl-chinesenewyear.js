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
            @import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Prompt:wght@400;700&display=swap');
            
            .cny-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle, #b91c1c, #7f1d1d, #450a0a);
                perspective: 1000px;
            }

            /* Golden Sun rays spinning slowly in bg */
            .sunburst-bg {
                position: absolute; inset: -50%; width: 200%; height: 200%;
                background: repeating-conic-gradient(#b91c1c 0% 5%, #991b1b 5% 10%);
                animation: spinRays 60s linear infinite; opacity: 0.5; z-index: 1;
            }
            @keyframes spinRays { 100% { transform: rotate(360deg); } }

            /* 3D Red Envelope */
            .angpao-wrapper {
                position: relative; width: 180px; height: 260px; z-index: 15;
                transform-style: preserve-3d; transform: rotateY(15deg); cursor: pointer; transition: 0.3s;
                filter: drop-shadow(10px 10px 20px rgba(0,0,0,0.6));
            }
            .angpao-wrapper:hover { transform: rotateY(0deg) scale(1.05); }

            .angpao {
                position: absolute; inset: 0; background: url('https://www.transparenttextures.com/patterns/rice-paper.png') #dc2626;
                border-radius: 5px; border: 2px solid #b91c1c; display: flex; align-items: center; justify-content: center; flex-direction: column;
                box-shadow: inset 0 0 50px rgba(185, 28, 28, 0.8);
            }
            /* The flap of the envelope */
            .angpao-flap {
                position: absolute; top: 0; left: 0; width: 100%; height: 100px; background: url('https://www.transparenttextures.com/patterns/rice-paper.png') #ef4444;
                clip-path: polygon(0 0, 100% 0, 50% 100%); transform-origin: top; border-bottom: 2px solid #b91c1c; z-index: 5;
            }
            /* Golden coin/seal */
            .gold-seal {
                position: absolute; top: 85px; left: 50%; transform: translateX(-50%); width: 40px; height: 40px;
                background: radial-gradient(circle, #fde047, #ca8a04); border-radius: 50%; font-family: 'Ma Shan Zheng', cursive;
                color: #7f1d1d; font-size: 1.5rem; display: flex; align-items: center; justify-content: center;
                box-shadow: 0 4px 6px rgba(0,0,0,0.5), inset 0 0 5px #fef08a; z-index: 6; cursor: pointer; border: 2px solid #facc15;
            }

            .angpao-front-text { font-family: 'Ma Shan Zheng', cursive; font-size: 4rem; color: #facc15; text-shadow: 2px 2px 0px #7f1d1d; transform: translateY(30px);}

            /* Letter pulling out */
            .letter-card {
                position: absolute; width: 160px; height: 240px; background: #fffbeb;
                left: 10px; top: 10px; z-index: 2; border: 1px solid #fde68a;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
                padding: 10px; box-sizing: border-box; box-shadow: inset 0 0 20px rgba(0,0,0,0.1);
            }

            .hint-text { position: absolute; bottom: 15vh; color: #facc15; font-family: 'Prompt', sans-serif; font-size: 1.2rem; letter-spacing: 2px; text-shadow: 0 0 10px #fde047; animation: pulse 2s infinite; font-weight: 600; z-index: 20; pointer-events: none;}
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Fireworks container */
            .fw-box { position: absolute; inset: 0; z-index: 5; pointer-events: none;}
            .fw-spark { position: absolute; width: 4px; height: 4px; border-radius: 50%; }

            /* Fortune Message Overlay */
            .auspicious-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(127, 29, 29, 0.8), rgba(69, 10, 10, 0.95)); backdrop-filter: blur(5px);
            }
            .m-head { font-family: 'Ma Shan Zheng', cursive; font-size: 6rem; color: #fde047; margin-bottom: 20px; text-shadow: 0 5px 20px #ca8a04;}
            .m-body { font-family: 'Prompt', sans-serif; font-size: 1.8rem; color: #fef3c7; line-height: 1.8; max-width: 600px; text-align: center; font-weight: 700; background: rgba(185, 28, 28, 0.5); padding: 30px; border-radius: 10px; border: 4px double #facc15; box-shadow: 0 10px 40px rgba(0,0,0,0.5);}
            .m-foot { font-family: 'Prompt', sans-serif; font-size: 1.2rem; color: #fcd34d; margin-top: 50px; letter-spacing: 2px;}

        </style>

        <div class="cny-scene" id="scene">
            <div class="sunburst-bg"></div>
            <div class="fw-box" id="fwBox"></div>

            <div class="hint-text" id="hint">เปิดซองอั่งเปา</div>

            <div class="angpao-wrapper" id="envelope">
                <div class="angpao">
                    <div class="letter-card" id="card"></div>
                    <div class="angpao-flap" id="flap"></div>
                    <div class="gold-seal" id="seal">福</div>
                    <div class="angpao-front-text">大吉<br>大利</div>
                </div>
            </div>

            <div class="auspicious-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">ส่งมอบโชคลาภโดย: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const envelope = document.getElementById('envelope');
    const flap = document.getElementById('flap');
    const seal = document.getElementById('seal');
    const card = document.getElementById('card');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const fwBox = document.getElementById('fwBox');

    let isOpened = false;

    // Click envelope or seal
    envelope.addEventListener('click', () => {
        if(isOpened) return;
        isOpened = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Center envelope
        tl.to(envelope, { rotationY: 0, scale: 1.2, duration: 1, ease: "power2.out" })
          
        // 2. Tear off the seal and open the flap
          .to(seal, { rotationZ: 720, y: 500, x: 200, opacity: 0, duration: 1, ease: "power1.in" })
          .to(flap, { rotationX: 180, duration: 0.5, ease: "power2.inOut" }, "-=0.5")
          
        // 3. The card pulls out
          .to(card, { y: -200, duration: 1, ease: "back.out(1)" })
          
        // 4. Boom! Fireworks
          .call(() => shootFireworks(window.innerWidth/4, window.innerHeight/3))
          .call(() => shootFireworks(window.innerWidth*0.75, window.innerHeight/4), null, "+=0.3")
          
        // 5. Letter spins and transforms into the giant message
          .to(envelope, { scale: 0, opacity: 0, duration: 0.5, ease: "power2.in" })
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1 }, "-=0.2")
          .from('.m-body', { scale: 0.2, rotationZ: 10, duration: 1.5, ease: "elastic.out(1, 0.5)" }, "-=0.5")
          
        // 6. Continuous fireworks
          .call(() => {
              setInterval(() => shootFireworks(Math.random()*window.innerWidth, Math.random()*window.innerHeight/2), 800);
          }, null, 1);
    });

    const colors = ['#fde047', '#facc15', '#ef4444', '#f97316', '#ffffff'];
    function shootFireworks(cx, cy) {
        for(let i=0; i<40; i++) {
            let s = document.createElement('div');
            s.className = 'fw-spark';
            s.style.background = colors[Math.floor(Math.random()*colors.length)];
            fwBox.appendChild(s);
            
            gsap.set(s, { x: cx, y: cy, scale: 2 });
            
            let angle = Math.random() * Math.PI * 2;
            let vel = 50 + Math.random()*150;
            
            gsap.to(s, {
                x: cx + Math.cos(angle)*vel,
                y: cy + Math.sin(angle)*vel + 50, // gravity effect
                opacity: 0, scale: 0,
                duration: 1 + Math.random(),
                ease: "power2.out",
                onComplete: () => s.remove()
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
