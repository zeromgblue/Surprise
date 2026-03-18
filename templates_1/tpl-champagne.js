export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Prompt:wght@300;600&display=swap');
            .champ-scene {
                position:relative; width:100vw; height:100vh;
                display:flex; align-items:flex-end; justify-content:center;
                overflow:hidden;
                background:linear-gradient(160deg, #0d0d0d, #1a1a1a, #0d0d0d);
            }
            /* Spotlight from top */
            .spotlight {
                position:absolute; top:-100px; left:50%; transform:translateX(-50%);
                width:400px; height:200%;
                background:radial-gradient(ellipse at top, rgba(253,224,71,0.15), transparent 70%);
                pointer-events:none; z-index:2;
            }
            /* Bottle */
            .bottle-wrap {
                position:relative; width:120px; height:380px;
                cursor:pointer; z-index:10; margin-bottom:40px;
                transform-origin:bottom center;
            }
            .bottle-body {
                position:absolute; bottom:0; width:100%; height:80%;
                background:linear-gradient(135deg,#1e3a5f,#2d5986,#1e3a5f);
                border-radius:10px 10px 8px 8px;
                border:2px solid #3b6fa0;
                box-shadow:inset -20px 0 30px rgba(255,255,255,0.1), 0 20px 60px rgba(0,0,0,0.8);
            }
            .bottle-label {
                position:absolute; bottom:25%; left:10%; width:80%; height:35%;
                background:linear-gradient(135deg,#fde047,#ca8a04);
                border:1px solid #78350f; border-radius:4px;
                display:flex; align-items:center; justify-content:center; flex-direction:column;
            }
            .label-brand { font-family:'Great Vibes',cursive; font-size:1.8rem; color:#78350f; }
            .label-year { font-family:'Prompt',sans-serif; font-size:0.7rem; color:#78350f; letter-spacing:3px; }
            .bottle-neck {
                position:absolute; bottom:80%; left:30%; width:40%; height:25%;
                background:linear-gradient(135deg,#1e3a5f,#2d5986,#1e3a5f);
                border-radius:10px 10px 0 0;
                border:2px solid #3b6fa0; border-bottom:none;
            }
            .bottle-cork {
                position:absolute; bottom:105%; left:25%; width:50%; height:15%;
                background:linear-gradient(135deg,#d97706,#92400e);
                border-radius:5px; z-index:15;
            }
            .hint-text { position:absolute; bottom:12vh; color:#fde047; font-family:'Prompt',sans-serif; font-size:1.2rem; letter-spacing:3px; animation:pulse 2s infinite; z-index:20; pointer-events:none; }
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Bubbles */
            .bubble-box { position:absolute; inset:0; pointer-events:none; z-index:3; }
            .bubble { position:absolute; border-radius:50%; border:1px solid rgba(253,224,71,0.4); background:rgba(253,224,71,0.05); }

            /* Foam / Champagne spray */
            .foam-box { position:absolute; inset:0; pointer-events:none; z-index:8; }
            .foam { position:absolute; background:rgba(255,255,255,0.9); border-radius:50%; }

            .champ-msg {
                position:absolute; inset:0; display:flex; flex-direction:column;
                align-items:center; justify-content:center; z-index:50; opacity:0; pointer-events:none;
                background:rgba(0,0,0,0.85); backdrop-filter:blur(10px);
            }
            .m-head { font-family:'Great Vibes',cursive; font-size:6rem; color:#fde047; text-shadow:0 0 30px rgba(253,224,71,0.7); margin-bottom:10px; }
            .m-line { width:250px; height:1px; background:linear-gradient(90deg,transparent,#ca8a04,transparent); margin:15px 0; }
            .m-body { font-family:'Prompt',sans-serif; font-size:1.5rem; color:#f3f4f6; line-height:1.9; max-width:600px; text-align:center; font-weight:300; }
            .m-foot { font-family:'Great Vibes',cursive; font-size:2rem; color:#ca8a04; margin-top:30px; }
        </style>
        <div class="champ-scene" id="scene">
            <div class="spotlight"></div>
            <div class="bubble-box" id="bubbleBox"></div>
            <div class="foam-box" id="foamBox"></div>
            <div class="hint-text" id="hint">กดเปิดขวดแชมเปญ</div>
            <div class="bottle-wrap" id="bottle">
                <div class="bottle-body">
                    <div class="bottle-label">
                        <div class="label-brand">Surprise</div>
                        <div class="label-year">PREMIUM EDITION</div>
                    </div>
                </div>
                <div class="bottle-neck"></div>
                <div class="bottle-cork" id="cork"></div>
            </div>
            <div class="champ-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-line"></div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
                <div class="m-line"></div>
                <div class="m-foot">${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const bottle = document.getElementById('bottle');
    const cork = document.getElementById('cork');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const bubbleBox = document.getElementById('bubbleBox');
    const foamBox = document.getElementById('foamBox');

    // Gentle idle sway
    gsap.to(bottle, {rotationZ:3, duration:1.5, yoyo:true, repeat:-1, ease:'sine.inOut'});

    // Rising bubbles continuously
    function spawnBubble() {
        const b = document.createElement('div');
        b.className = 'bubble';
        const size = 8 + Math.random()*20;
        b.style.cssText = `width:${size}px;height:${size}px;left:${40+Math.random()*20}%;bottom:0;`;
        bubbleBox.appendChild(b);
        gsap.to(b, {y:-(window.innerHeight*0.6+Math.random()*200), x:(Math.random()-0.5)*100, opacity:0, duration:3+Math.random()*3, ease:'power1.out', onComplete:()=>b.remove()});
    }
    setInterval(spawnBubble, 400);

    let popped = false;
    bottle.addEventListener('click', () => {
        if(popped) return;
        popped = true;
        hint.style.display='none';
        const tl = gsap.timeline();
        // Shake the bottle
        tl.to(bottle, {rotation:15,duration:0.1,yoyo:true,repeat:5})
          // Cork pops off
          .to(cork, {y:-400, x:150, rotation:720, opacity:0, duration:1, ease:'power2.in'})
          // Champagne foam explosion
          .call(() => {
              for(let i=0;i<80;i++){
                  const f=document.createElement('div');
                  f.className='foam';
                  const sz=4+Math.random()*12;
                  f.style.cssText=`width:${sz}px;height:${sz}px;left:45%;top:30%;`;
                  foamBox.appendChild(f);
                  gsap.to(f,{
                      x:(Math.random()-0.5)*600, y:-(Math.random()*500),
                      opacity:0, duration:1.5+Math.random()*2, ease:'power2.out',
                      onComplete:()=>f.remove()
                  });
              }
          }, null, '-=0.3')
          // Bottle falls back
          .to(bottle, {y:300, rotation:-20, opacity:0, duration:1.5, ease:'power1.in'}, '+=0.5')
          // Message appears
          .to(msg, {opacity:1, pointerEvents:'auto', duration:2}, '-=0.5')
          .from('.m-head', {scale:0.3, opacity:0, duration:2, ease:'elastic.out(1,0.5)'}, '-=1.5')
          .from('.m-body', {y:30, opacity:0, duration:1.5}, '-=1');
    });
}

function escapeHtml(str) {
    if(!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function loadScript(src) {
    return new Promise((resolve,reject) => {
        if(document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src=src; s.onload=resolve; s.onerror=reject;
        document.head.appendChild(s);
    });
}
