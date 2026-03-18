export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#050505"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Creepster&family=Kanit:wght@300;600&display=swap');
            
            .hw-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle, #27272a, #050505);
                perspective: 1000px;
            }

            /* 3D Spooky Door */
            .door-frame {
                position: relative; width: 250px; height: 450px;
                background: #18181b; border: 15px solid #27272a; border-bottom: 0;
                box-shadow: 0 0 50px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.8);
                display: flex; justify-content: center; transform-style: preserve-3d;
            }

            .door {
                position: absolute; inset: 0; background: url('https://www.transparenttextures.com/patterns/wood-pattern.png') #451a03;
                border: 2px solid #27272a; transform-origin: left center; transform-style: preserve-3d;
                cursor: pointer; box-shadow: inset 10px 0 20px rgba(0,0,0,0.5);
                display: flex; align-items: center;
            }
            .doorknob {
                position: absolute; right: 20px; width: 25px; height: 25px;
                background: radial-gradient(circle, #facc15, #92400e); border-radius: 50%;
                box-shadow: 2px 5px 5px rgba(0,0,0,0.5);
            }
            /* Wood planks styling */
            .door::before, .door::after {
                content: ''; position: absolute; left: 20px; right: 20px; height: 150px;
                border: 5px solid #27272a; top: 30px;
            }
            .door::after { top: 220px; height: 180px;}

            /* Glowing Eye in darkness (behind door) */
            .dark-room { position: absolute; inset: 0; background: #000; display: flex; align-items: center; justify-content: center; z-index: -1;}
            .creepy-eyes {
                position: relative; width: 100px; height: 30px; display: flex; justify-content: space-between;
                opacity: 0;
            }
            .eye { width: 30px; height: 20px; background: #dc2626; border-radius: 50%; box-shadow: 0 0 20px #ef4444; position: relative;}
            .eye::after { content:''; position: absolute; top:5px; left:12px; height:10px; width:4px; background:#000; border-radius:50%;}

            /* Ghost elements */
            .ghost {
                position: absolute; width: 80px; height: 100px;
                background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg"><path d="M50 0 C20 0 0 30 0 60 L0 120 C10 110 20 120 30 110 C40 120 50 110 60 120 C70 110 80 120 90 110 C100 120 100 60 100 60 C100 30 80 0 50 0 Z" fill="rgba(255,255,255,0.7)"/><circle cx="35" cy="40" r="8" fill="%23000"/><circle cx="65" cy="40" r="8" fill="%23000"/><ellipse cx="50" cy="65" rx="10" ry="15" fill="%23000"/></svg>') no-repeat center;
                background-size: contain; opacity: 0; filter: blur(2px) drop-shadow(0 0 10px #fff); z-index: 40; pointer-events: none;
            }

            .hint-text { position: absolute; bottom: 10vh; color: #ea580c; font-family: 'Kanit', sans-serif; font-size: 1.2rem; letter-spacing: 2px; animation: pulse 2s infinite; font-weight: 600; z-index: 20; pointer-events: none;}
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Spooky Message Overlay */
            .hell-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(0,0,0,0.6), rgba(0,0,0,0.95));
            }
            .m-head { font-family: 'Creepster', cursive; font-size: 5rem; color: #f97316; margin-bottom: 20px; font-weight: 400; text-shadow: 5px 5px 0px #7c2d12, 0 0 30px #ea580c; letter-spacing: 5px;}
            .m-body { font-family: 'Kanit', sans-serif; font-size: 1.6rem; color: #facc15; line-height: 1.8; max-width: 600px; text-align: center; font-weight: 600; background: rgba(0,0,0,0.7); padding: 30px; border-radius: 10px; border: 2px dashed #b45309; box-shadow: 0 0 30px rgba(234, 88, 12, 0.4);}
            .m-foot { font-family: 'Creepster', cursive; font-size: 2rem; color: #ef4444; margin-top: 40px; letter-spacing: 3px; text-shadow: 2px 2px 0px #7f1d1d;}

        </style>

        <div class="hw-scene" id="scene">
            <div class="hint-text" id="hint">เคาะประตูผีสิง</div>

            <div class="door-frame" id="frame">
                <div class="dark-room"><div class="creepy-eyes" id="eyes"><div class="eye"></div><div class="eye"></div></div></div>
                <div class="door" id="door"><div class="doorknob"></div></div>
            </div>

            <!-- Ghosts will spawn here via JS -->

            <div class="hell-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const door = document.getElementById('door');
    const frame = document.getElementById('frame');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const eyes = document.getElementById('eyes');
    const scene = document.getElementById('scene');
    
    // Idle mysterious knock effect
    gsap.to(door, { rotationY: -2, duration: 0.1, yoyo: true, repeat: 3, repeatDelay: 5 });

    let isOpened = false;

    door.addEventListener('click', () => {
        if(isOpened) return;
        isOpened = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Door slowly creaks open in 3D
        tl.to(door, { rotationY: -100, duration: 2.5, ease: "power1.inOut" })
          
        // 2. Eyes blink and vanish in the dark
          .to(eyes, { opacity: 1, duration: 0.2 }, 1)
          .to(eyes, { scaleY: 0, opacity: 0, duration: 0.1, delay: 0.5 }, 1.5)
          
        // 3. Frame pushes into camera (Jump scare feel)
          .to(frame, { scale: 3, y: 300, opacity: 0, duration: 1.5, ease: "power2.in" }, 2)

        // 4. Ghosts fly out at the user!
          .call(summonGhosts, null, 2.2)

        // 5. Bloody bright message fades in
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5 }, 3)
          .from('.m-head', { scale: 3, opacity: 0, duration: 1, ease: "elastic.out(1, 0.5)" }, 3);
    });

    function summonGhosts() {
        for(let i=0; i<6; i++) {
            let g = document.createElement('div');
            g.className = 'ghost';
            scene.appendChild(g);
            
            gsap.set(g, { x: window.innerWidth/2, y: window.innerHeight/2, scale: 0.1, opacity: 1 });
            
            gsap.to(g, {
                x: (Math.random()-0.5)*window.innerWidth*2 + window.innerWidth/2,
                y: -Math.random()*window.innerHeight,
                scale: 5 + Math.random()*5, // Gets huge as it flies at camera
                opacity: 0,
                duration: 1 + Math.random(),
                ease: "power1.in",
                onComplete: ()=>g.remove()
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
