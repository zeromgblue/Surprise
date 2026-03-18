export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#111";
    // Nightclub lights bg
    container.style.backgroundImage = "radial-gradient(circle at top right, #3a0050, transparent 40%), radial-gradient(circle at bottom left, #002244, transparent 40%)";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const drinkColor = config.from || '#F9A826';

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Mitr:wght@400;500&display=swap');
            
            .scene {
                position: relative; width: 300px; height: 300px;
                display: flex; align-items: center; justify-content: center; z-index: 10;
            }

            .glass {
                position: absolute; width: 60px; height: 120px;
                border: 4px solid rgba(255,255,255,0.4); border-top: none;
                border-radius: 5px 5px 20px 20px;
                background: linear-gradient(to bottom, transparent 30%, rgba(255,255,255,0.1) 30%);
                box-shadow: inset 0 -10px 20px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.5);
                overflow: hidden;
            }
            .glass::after { /* The Drink */
                content:''; position: absolute; bottom:0; left:0; width:100%; height:70%;
                background: ${drinkColor}; opacity: 0.9;
                box-shadow: inset 10px 0 10px rgba(255,255,255,0.3);
            }
            .glass::before { /* Foam/Highlights */
                content:''; position: absolute; bottom: 70%; left:0; width:100%; height: 10px;
                background: #fff; border-radius: 50% 50% 0 0; opacity: 0.8; z-index: 2;
            }

            .g-left { left: 20px; transform: rotate(-15deg); }
            .g-right { right: 20px; transform: rotate(15deg); }

            /* Bubble layer */
            #bubble-canvas {
                position: absolute; top:0; left:0; width:100%; height:100%; z-index: 20; pointer-events: none;
            }

            .hint {
                position: absolute; bottom: -50px; width: 100%; text-align: center;
                color: #fff; font-family: sans-serif; letter-spacing: 2px;
                animation: pulse 1s infinite alternate; cursor: pointer;
            }
            @keyframes pulse { 0%{transform:scale(1);} 100%{transform:scale(1.1);} }

            .msg-panel {
                position: absolute; inset:0; z-index: 30;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                background: rgba(0,0,0,0.7); backdrop-filter: blur(5px);
                opacity: 0; pointer-events: none; padding: 40px; text-align: center; color: white;
            }
            .m-head { font-family: 'Fredoka One', cursive; font-size: 3rem; color: ${drinkColor}; margin-bottom: 20px; text-shadow: 2px 2px 0px rgba(255,255,255,0.2); letter-spacing: 2px; }
            .m-body { font-family: 'Mitr', sans-serif; font-size: 1.2rem; line-height: 1.6; color: #fff; }
        </style>

        <canvas id="bubble-canvas"></canvas>

        <div class="scene" id="toast-scene">
            <div class="glass g-left" id="g1"></div>
            <div class="glass g-right" id="g2"></div>
            <div class="hint" id="hint">แตะเพื่อชนแก้ว!</div>
        </div>

        <div class="msg-panel" id="msg">
            <div class="m-head">CHEERS!</div>
            <div class="m-body" style="font-size: 1.8rem; font-weight: 500; margin-bottom: 10px; color: #F67280;">แด่ ${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
            <div class="m-body" style="opacity: 0.6; font-size: 1rem; margin-top:30px;">~ ${escapeHtml(data.sender)}</div>
        </div>
    `;

    const canvas = document.getElementById('bubble-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();

    let bubbles = [];
    let isExploding = false;

    function renderBubbles() {
        ctx.clearRect(0,0,width,height);
        bubbles.forEach((b, i) => {
            b.y -= b.vy;
            b.x += Math.sin(b.y/20)*2; // wiggle
            
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
            ctx.fillStyle = `rgba(255,255,255,${b.a})`;
            ctx.fill();
            
            // Highlight
            ctx.beginPath();
            ctx.arc(b.x - b.r/3, b.y - b.r/3, b.r/4, 0, Math.PI*2);
            ctx.fillStyle = `rgba(255,255,255,0.8)`;
            ctx.fill();

            if(b.y < -50) bubbles.splice(i, 1);
        });

        // Add passive bubbles if exploding
        if(isExploding && Math.random() > 0.2) {
            bubbles.push({
                x: Math.random()*width,
                y: height + 50,
                r: Math.random()*15 + 5,
                vy: Math.random()*5 + 3,
                a: Math.random()*0.5 + 0.1
            });
        }
        requestAnimationFrame(renderBubbles);
    }
    renderBubbles();

    const scene = document.getElementById('toast-scene');
    let toasted = false;

    scene.addEventListener('click', () => {
        if(toasted) return;
        toasted = true;
        document.getElementById('hint').style.display = 'none';

        // Animate clink
        const tl = gsap.timeline();
        tl.to('#g1', { x: 40, rotation: 5, duration: 0.3, ease: "power2.in" }, 0)
          .to('#g2', { x: -40, rotation: -5, duration: 0.3, ease: "power2.in" }, 0)
          .call(() => {
              // Impact!
              gsap.to('.scene', { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1 });
              scene.style.filter = "brightness(1.5)";
              setTimeout(()=> scene.style.filter = "none", 100);
              
              // Explode bubbles from center
              for(let i=0; i<80; i++) {
                  bubbles.push({
                      x: width/2 + (Math.random()-0.5)*100,
                      y: height/2 + (Math.random()-0.5)*100,
                      r: Math.random()*20 + 5,
                      vy: Math.random()*15 + 5,
                      vx: (Math.random()-0.5)*15,
                      a: Math.random()*0.6 + 0.2
                  });
              }
              // Set mode to continuous explosion
              isExploding = true;
          })
          .to('#g1', { x: -200, y: 200, rotation: -45, opacity: 0, duration: 1, ease: "power2.out", delay: 0.2 }, 0.4)
          .to('#g2', { x: 200, y: 200, rotation: 45, opacity: 0, duration: 1, ease: "power2.out", delay: 0.2 }, 0.4)
          .call(() => {
              // Show message
              const msg = document.getElementById('msg');
              gsap.to(msg, { opacity: 1, duration: 1.5, onComplete: () => msg.style.pointerEvents = 'auto' });
          });
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
