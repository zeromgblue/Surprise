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
            @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Mali:wght@400;700&display=swap');
            
            .rio-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                overflow: hidden; background: linear-gradient(180deg, #3b82f6, #0ea5e9, #38bdf8);
                transition: background 2s;
            }

            .sun {
                position: absolute; top: 20vh; width: 120px; height: 120px;
                background: #fde047; border-radius: 50%; box-shadow: 0 0 50px #fef08a;
                z-index: 1; transition: 2s;
            }

            /* Corcovado Mountain Silhouette */
            .mountain {
                position: absolute; bottom: 0; width: 800px; height: 350px;
                background: #064e3b; border-radius: 50% 50% 0 0 / 100% 100% 0 0;
                z-index: 5; box-shadow: 0 -10px 30px rgba(0,0,0,0.5);
            }

            /* Christ the Redeemer Silhouette */
            .christ-statue {
                position: absolute; bottom: 330px; width: 120px; height: 150px;
                background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg"><path d="M45 0 L55 0 L55 30 L85 35 L85 45 L55 45 L55 120 L45 120 L45 45 L15 45 L15 35 L45 30 Z" fill="%23d1d5db"/><circle cx="50" cy="15" r="10" fill="%23d1d5db"/></svg>') no-repeat bottom center;
                background-size: contain; z-index: 10; cursor: pointer;
                filter: drop-shadow(0 0 10px rgba(255,255,255,0.3)); transition: 0.3s;
            }
            .christ-statue:hover { filter: drop-shadow(0 0 20px #fff); transform: scale(1.05); }

            .hint-text { position: absolute; bottom: 10vh; color: #fff; font-family: 'Mali', cursive; font-size: 1.5rem; letter-spacing: 2px; text-shadow: 0 0 10px #064e3b; animation: pulse 2s infinite; font-weight: 700; z-index: 20; pointer-events: none;}
            @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

            /* Confetti Container */
            .confetti-box { position: absolute; inset: 0; z-index: 15; pointer-events: none; overflow: hidden; }
            .confetti { position: absolute; width: 10px; height: 20px; opacity: 0; }

            /* Carnival Message Overlay */
            .carnival-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(134, 25, 143, 0.8), rgba(2, 6, 23, 0.9));
            }
            .m-head { font-family: 'Fredoka One', cursive; font-size: 4.5rem; color: #4ade80; margin-bottom: 20px; text-shadow: 3px 3px 0px #166534, 0 0 20px #22c55e; letter-spacing: 2px; text-transform: uppercase;}
            .m-body { font-family: 'Mali', cursive; font-size: 1.6rem; color: #fef08a; line-height: 1.6; max-width: 600px; text-align: center; font-weight: 700; text-shadow: 2px 2px 5px #000; padding: 20px; background: rgba(0,0,0,0.4); border-radius: 20px; border: 3px solid #fbbf24;}
            .m-foot { font-family: 'Fredoka One', cursive; font-size: 1.5rem; color: #60a5fa; margin-top: 30px; letter-spacing: 2px; text-shadow: 2px 2px 0px #1e40af;}

        </style>

        <div class="rio-scene" id="scene">
            <div class="sun" id="sun"></div>
            <div class="mountain"></div>
            
            <div class="christ-statue" id="statue"></div>
            <div class="hint-text" id="hint">เริ่มงานคาร์นิวัล</div>

            <div class="confetti-box" id="cBox"></div>

            <div class="carnival-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">FESTIVAL BY: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const statue = document.getElementById('statue');
    const sun = document.getElementById('sun');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const scene = document.getElementById('scene');
    const cBox = document.getElementById('cBox');

    let isParty = false;

    statue.addEventListener('click', () => {
        if(isParty) return;
        isParty = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Sun sets, sky shifts to vibrant sunset/evening
        tl.to(scene, { background: "linear-gradient(180deg, #701a75, #db2777, #f59e0b)", duration: 2 })
          .to(sun, { top: "60vh", background: "#f43f5e", boxShadow: "0 0 50px #e11d48", duration: 2 }, 0)
          
        // 2. Statue raises slightly (or pulsates)
          .to(statue, { filter: "drop-shadow(0 0 30px #fff)", duration: 1 }, 1)
          
        // 3. Carnival Confetti EXPLOSION!
          .call(launchConfetti, null, 1.5)
          
        // 4. Vibrant colorful message appears
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5, scale: 1 }, 2.5);
          
        gsap.from(msg, { scale: 0.5, duration: 1.5, ease: "back.out(1)", delay: 2.5 });
    });

    const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#c084fc', '#f472b6'];
    function launchConfetti() {
        for(let i=0; i<150; i++) {
            let c = document.createElement('div');
            c.className = 'confetti';
            c.style.background = colors[Math.floor(Math.random()*colors.length)];
            cBox.appendChild(c);
            
            gsap.set(c, {
                x: window.innerWidth/2,
                y: window.innerHeight - 100,
                opacity: 1,
                rotation: Math.random()*360
            });
            
            gsap.to(c, {
                x: "+=" + (Math.random()-0.5)*1500,
                y: -100 - Math.random()*800,
                rotation: "+=" + (Math.random()*720),
                opacity: 0,
                duration: 2 + Math.random()*2,
                ease: "power2.out",
                onComplete: ()=>c.remove()
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
