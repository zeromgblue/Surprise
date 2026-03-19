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
            @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Prompt:wght@400;600&display=swap');
            
            .egg-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle, #f0fdf4, #bbf7d0, #4ade80);
                perspective: 1000px;
            }

            /* Sunbeams */
            .sunbeams { position: absolute; inset: -50%; width: 200%; height: 200%; background: repeating-conic-gradient(rgba(255,255,255,0.2) 0% 5%, transparent 5% 10%); animation: spinrays 40s linear infinite; pointer-events: none;}
            @keyframes spinrays { 100% { transform: rotate(360deg); } }

            /* 3D Giant Egg */
            .egg-wrapper {
                position: relative; width: 200px; height: 260px; z-index: 15;
                cursor: pointer; transform-style: preserve-3d;
            }

            .egg-half {
                position: absolute; width: 100%; height: 130px;
                background: linear-gradient(135deg, #fbcfe8, #f472b6);
                border: 4px solid #fff; box-sizing: border-box; box-shadow: inset -10px -10px 20px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.2);
                transform-origin: bottom center; transition: 0.3s;
            }
            /* Paint decorations on the egg */
            .egg-half::before { content:''; position: absolute; top:30%; left:0; width:100%; height:20px; background: repeating-linear-gradient(45deg, #fef08a, #fef08a 10px, #60a5fa 10px, #60a5fa 20px);}

            .egg-top { top: 0; border-radius: 100px 100px 0 0; border-bottom: none; clip-path: polygon(0 0, 100% 0, 100% 100%, 80% 80%, 60% 100%, 40% 80%, 20% 100%, 0 80%); z-index: 12;}
            .egg-bottom { bottom: 0; border-radius: 0 0 100px 100px; border-top: none; clip-path: polygon(0 0, 20% 20%, 40% 0, 60% 20%, 80% 0, 100% 20%, 100% 100%, 0 100%); z-index: 10;}

            /* Cute bunny ears hiding behind */
            .ear { position: absolute; top: -60px; width: 30px; height: 80px; background: #fff; border: 4px solid #fbcfe8; border-radius: 50% 50% 0 0; z-index: 5; opacity: 0; transform-origin: bottom; }
            .ear-l { left: 40px; transform: rotate(-20deg); }
            .ear-r { right: 40px; transform: rotate(20deg); }

            .hint-text { position: absolute; bottom: 15vh; color: #166534; font-family: 'Prompt', sans-serif; font-size: 1.2rem; letter-spacing: 2px; text-shadow: 0 0 10px #bbf7d0; animation: pulse 2s infinite; font-weight: 700; z-index: 20; pointer-events: none;}
            @keyframes pulse { 0%,100%{opacity:0.4;} 50%{opacity:1;} }

            /* Pastel Confetti Container */
            .cf-box { position: absolute; inset: 0; z-index: 25; pointer-events: none; }
            .confetti { position: absolute; width: 15px; height: 15px; }

            /* Joyful Message Overlay */
            .spring-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(255,255,255,0.6), rgba(187, 247, 208, 0.95)); backdrop-filter: blur(5px);
            }
            .m-head { font-family: 'Pacifico', cursive; font-size: 5rem; color: #db2777; margin-bottom: 20px; font-weight: 400; text-shadow: 2px 2px 0px #fbcfe8, 4px 4px 0px #fff;}
            .m-body { font-family: 'Prompt', sans-serif; font-size: 1.6rem; color: #166534; line-height: 1.8; max-width: 600px; text-align: center; font-weight: 600; background: #fff; padding: 40px; border-radius: 40px; border: 6px dashed #fcd34d; box-shadow: 0 10px 30px rgba(0,0,0,0.1), inset 0 0 20px #fef08a;}
            .m-foot { font-family: 'Pacifico', cursive; font-size: 1.5rem; color: #0284c7; margin-top: 40px; text-shadow: 1px 1px 0px #fff;}

        </style>

        <div class="egg-scene" id="scene">
            <div class="sunbeams"></div>
            
            <div class="hint-text" id="hint">แตะเพื่อกะเทาะไข่</div>

            <div class="egg-wrapper" id="egg">
                <div class="ear ear-l" id="ear1"></div>
                <div class="ear ear-r" id="ear2"></div>
                
                <div class="egg-half egg-top" id="topEgg"></div>
                <div class="egg-half egg-bottom" id="botEgg"></div>
            </div>

            <div class="cf-box" id="cfBox"></div>

            <div class="spring-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">HOPPY EASTER! FROM: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const egg = document.getElementById('egg');
    const topEgg = document.getElementById('topEgg');
    const ear1 = document.getElementById('ear1');
    const ear2 = document.getElementById('ear2');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const cfBox = document.getElementById('cfBox');

    // Wobble egg
    gsap.to(egg, { rotationZ: 5, duration: 0.1, yoyo: true, repeat: 5, repeatDelay: 2 });

    let crackCount = 0;
    let isHatched = false;

    egg.addEventListener('click', () => {
        if(isHatched) return;
        crackCount++;
        
        const tl = gsap.timeline();

        if(crackCount === 1) {
            // Crack 1: Wobble and shift top part slightly
            tl.to(egg, { rotationZ: -10, duration: 0.1, yoyo: true, repeat: 3 })
              .to(topEgg, { y: -5, rotationZ: 5, duration: 0.2 }, 0);
            hint.innerHTML = "กะเทาะอีกนิด!";
        } 
        else if (crackCount === 2) {
            // Crack 2: Pop ears out!
            tl.to(egg, { rotationZ: 10, duration: 0.1, yoyo: true, repeat: 3 })
              .to(topEgg, { y: -15, rotationZ: -5, duration: 0.2 }, 0)
              .to([ear1, ear2], { opacity: 1, y: -20, duration: 0.5, ease: "back.out(2)" }, 0);
            hint.innerHTML = "ไข่จะแตกแล้ว!";
        }
        else if (crackCount >= 3) {
            isHatched = true;
            hint.style.display = 'none';

            // Hatch fully
            tl.to(topEgg, { y: -300, rotationZ: 45, x: 200, opacity: 0, duration: 1, ease: "power2.in" })
              .to(ear1, { y: -100, x: -100, rotation: -90, opacity: 0, duration: 1 }, 0)
              .to(ear2, { y: -100, x: 100, rotation: 90, opacity: 0, duration: 1 }, 0)
              
            // Confetti explosion
              .call(shootConfetti, null, "-=0.8")
              
            // Bring message down
              .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1 }, 0.5)
              .from('.m-body', { scale: 0, rotationZ: 10, duration: 1.5, ease: "elastic.out(1, 0.5)" }, 0.5);
              
        }
    });

    const colors = ['#fbcfe8', '#fef08a', '#bbf7d0', '#bfdbfe', '#e9d5ff'];
    const shapes = ['50%', '0']; // circle or square
    
    function shootConfetti() {
        for(let i=0; i<60; i++) {
            let s = document.createElement('div');
            s.className = 'confetti';
            s.style.background = colors[Math.floor(Math.random()*colors.length)];
            s.style.borderRadius = shapes[Math.floor(Math.random()*shapes.length)];
            cfBox.appendChild(s);
            
            gsap.set(s, { x: window.innerWidth/2, y: window.innerHeight/2 + 100 });
            
            // fountain explode
            gsap.to(s, {
                x: "+=" + ((Math.random()-0.5)*1000),
                y: -100 - Math.random()*800,
                rotation: Math.random()*720,
                duration: 2 + Math.random()*2,
                ease: "power2.out"
            });
            // gravity back down
            gsap.to(s, {
                y: window.innerHeight + 100,
                duration: 2 + Math.random()*2,
                ease: "power1.in",
                delay: 1 + Math.random()
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
