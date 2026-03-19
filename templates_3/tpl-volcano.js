export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#050014"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Prompt:wght@300;400;700&display=swap');
            
            .volcano-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle at bottom, #450a0a, #050014);
            }

            /* Volcano shape in bg */
            .mountain {
                position: absolute; bottom: -50px; width: 800px; height: 400px;
                background: linear-gradient(180deg, #3f3f46, #09090b);
                clip-path: polygon(20% 100%, 45% 20%, 55% 20%, 80% 100%, 100% 100%, 0 100%);
                z-index: 5;
            }

            /* Lava flows on mountain */
            .lava-flow {
                position: absolute; top: 20%; left: 50%; transform: translateX(-50%);
                width: 60px; height: 300px; background: linear-gradient(180deg, #fef08a, #ef4444, #7f1d1d);
                filter: blur(10px); z-index: 6; opacity: 0.8;
                animation: flowDown 3s infinite alternate ease-in-out;
            }
            @keyframes flowDown { 0% { height: 250px; opacity: 0.6; } 100% { height: 350px; opacity: 1; } }

            /* Interactive Core Area */
            .crater-core {
                position: relative; width: 250px; height: 100px; background: radial-gradient(ellipse, #fcd34d, #dc2626);
                border-radius: 50%; box-shadow: 0 0 50px #ef4444, inset 0 0 20px #fff;
                z-index: 10; cursor: pointer; display: flex; align-items: center; justify-content: center;
                animation: pulseGlow 2s infinite alternate; transform: translateY(50px);
            }
            @keyframes pulseGlow { 0% { box-shadow: 0 0 40px #ef4444; transform: translateY(50px) scale(0.95); } 100% { box-shadow: 0 0 80px #facc15; transform: translateY(50px) scale(1.05); } }

            .hint-text { position: absolute; top: -50px; color: #fef08a; font-family: 'Prompt', sans-serif; font-size: 1.2rem; letter-spacing: 1px; font-weight: 700; text-shadow: 0 2px 5px #000; animation: bounce 2s infinite; pointer-events: none;}
            @keyframes bounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }

            /* Magma particles */
            .magma {
                position: absolute; border-radius: 50%; background: #facc15; box-shadow: 0 0 10px #facc15;
                z-index: 20; opacity: 0; pointer-events: none;
            }

            /* Eruption text overlay */
            .eruption-msg {
                position: absolute; inset: 0; padding: 40px; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(69, 10, 10, 0.8), rgba(0,0,0,0.9));
            }
            .m-head { font-family: 'Cinzel', serif; font-size: 4rem; color: #facc15; margin-bottom: 20px; text-shadow: 0 5px 20px #dc2626; text-align: center; font-weight: 700;}
            .m-body { font-family: 'Prompt', sans-serif; font-size: 1.5rem; color: #fff; line-height: 1.6; max-width: 600px; text-align: center; text-shadow: 0 2px 10px #000; font-weight: 300;}
            .m-foot { font-family: 'Prompt', sans-serif; font-size: 1.2rem; color: #fca5a5; margin-top: 30px; font-weight: 700;}

        </style>

        <div class="volcano-scene">
            <div class="mountain"></div>
            <div class="lava-flow"></div>
            
            <div class="crater-core" id="core">
                <div class="hint-text" id="hint">แตะเพื่อจุดระเบิด</div>
            </div>

            <div class="eruption-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">FROM: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const core = document.getElementById('core');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const scene = document.querySelector('.volcano-scene');

    let erupted = false;

    core.addEventListener('click', () => {
        if(erupted) return;
        erupted = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Rumble
        tl.to(scene, { x: 10, y: -10, duration: 0.1, yoyo: true, repeat: 10 })
          
        // 2. Explode Core
          .to(core, { scale: 3, opacity: 0, duration: 0.5, ease: "power4.in" }, "+=0.2")
          
        // 3. Erupt Magma pieces
          .call(() => startEruption(), null, "-=0.3")
          
        // 4. Fade in message
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 }, "+=1");
    });

    function startEruption() {
        for(let i=0; i<80; i++) {
            let m = document.createElement('div');
            m.className = 'magma';
            let size = Math.random() * 20 + 5;
            m.style.width = size + 'px';
            m.style.height = size + 'px';
            scene.appendChild(m);
            
            let cx = window.innerWidth / 2;
            let cy = window.innerHeight / 2 + 100;
            gsap.set(m, { x: cx, y: cy });

            // Calculate arc
            let throwX = cx + (Math.random()-0.5)*1200;
            let throwY = cy - 400 - Math.random()*400;

            gsap.to(m, {
                opacity: 1,
                duration: 0.2
            });
            
            // Trajectory
            gsap.to(m, {
                x: throwX,
                duration: 2 + Math.random(),
                ease: "power1.out"
            });

            gsap.to(m, {
                y: throwY,
                duration: 1 + Math.random()*0.5,
                ease: "power1.out",
                onComplete: () => {
                    // Fall back down
                    gsap.to(m, {
                        y: window.innerHeight + 100,
                        duration: 1 + Math.random()*1.5,
                        ease: "power2.in",
                        onComplete: ()=>m.remove()
                    });
                }
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
