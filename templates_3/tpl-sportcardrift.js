export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Russo+One&family=Prompt:wght@400;700&display=swap');
            .drift-scene {
                position:relative; width:100vw; height:100vh;
                display:flex; align-items:center; justify-content:center;
                overflow:hidden;
                background:radial-gradient(ellipse at 50% 80%, #18181b, #09090b);
                perspective:1000px;
            }
            /* Road grid */
            .road {
                position:absolute; bottom:-50px; width:400px; height:300px;
                background:repeating-linear-gradient(0deg,#27272a,#27272a 4px,transparent 4px,transparent 40px),
                            repeating-linear-gradient(90deg,#27272a,#27272a 4px,transparent 4px,transparent 80px);
                transform:rotateX(70deg); z-index:1; opacity:0.6;
            }
            /* The car - CSS only */
            .car-wrap {
                position:absolute; width:200px; height:100px;
                cursor:pointer; z-index:10;
                bottom:20%; left:50%; transform:translateX(-50%);
            }
            .car-body {
                position:absolute; bottom:20px; width:200px; height:55px;
                background:linear-gradient(135deg,#dc2626,#b91c1c,#dc2626);
                border-radius:10px 30px 5px 5px;
                box-shadow:0 10px 40px rgba(220,38,38,0.8), inset 0 5px 10px rgba(255,255,255,0.1);
                border:2px solid #ef4444;
            }
            .car-cabin {
                position:absolute; bottom:55px; left:40px; width:110px; height:45px;
                background:linear-gradient(135deg,#b91c1c,#7f1d1d);
                border-radius:10px 15px 0 0; border:2px solid #ef4444; border-bottom:none;
            }
            .car-window {
                position:absolute; top:8px; left:10px; width:90px; height:25px;
                background:linear-gradient(135deg,rgba(186,230,253,0.8),rgba(125,211,252,0.5));
                border-radius:5px;
            }
            .wheel {
                position:absolute; bottom:5px; width:30px; height:30px;
                background:radial-gradient(circle,#374151,#111827); border-radius:50%;
                border:4px solid #6b7280;
                animation:wheelSpin 0.5s linear infinite paused;
            }
            @keyframes wheelSpin { 100%{transform:rotate(360deg);} }
            .w1{ left:20px; }
            .w2{ right:20px; }
            /* Headlights */
            .headlight {
                position:absolute; bottom:25px; width:15px; height:10px;
                background:#fde047; border-radius:2px; filter:blur(2px);
                box-shadow:0 0 30px 10px rgba(253,224,71,0.5);
            }
            .hl1{ right:-10px; }
            /* Exhaust smoke */
            .smoke-box { position:absolute; bottom:30px; left:-10px; pointer-events:none; }
            /* Skid marks */
            .skid { position:absolute; width:20px; height:4px; background:rgba(0,0,0,0.8); border-radius:2px; }

            .hint-text { position:absolute; bottom:10vh; color:#fbbf24; font-family:'Russo One',sans-serif; font-size:1.2rem; letter-spacing:3px; animation:pulse 1.5s infinite; z-index:20; pointer-events:none; text-transform:uppercase;}
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            .race-msg {
                position:absolute; inset:0; display:flex; flex-direction:column;
                align-items:center; justify-content:center; z-index:50; opacity:0; pointer-events:none;
                background:rgba(0,0,0,0.88); backdrop-filter:blur(10px);
            }
            .m-head { font-family:'Russo One',sans-serif; font-size:5rem; color:#dc2626; letter-spacing:4px; text-transform:uppercase; text-shadow:0 0 30px rgba(220,38,38,0.9), 0 5px 10px #000; }
            .m-sub { font-family:'Russo One',sans-serif; font-size:1rem; color:#f97316; letter-spacing:8px; margin-bottom:30px; }
            .tyre-marks {
                width:80%; height:4px; margin:5px 0;
                background:repeating-linear-gradient(90deg,#27272a 0,#27272a 80px,transparent 80px,transparent 100px);
            }
            .m-body { font-family:'Prompt',sans-serif; font-size:1.5rem; color:#f3f4f6; line-height:2; max-width:600px; text-align:center; font-weight:400; padding:20px; }
            .m-foot { font-family:'Russo One',sans-serif; font-size:1rem; color:#6b7280; letter-spacing:5px; margin-top:30px; }
        </style>
        <div class="drift-scene" id="scene">
            <div class="road"></div>
            <div class="hint-text" id="hint">แตะคาร์เพื่อดริฟต์</div>
            <div class="car-wrap" id="car">
                <div class="car-cabin"><div class="car-window"></div></div>
                <div class="car-body">
                    <div class="wheel w1" id="w1"></div>
                    <div class="wheel w2" id="w2"></div>
                    <div class="headlight hl1"></div>
                </div>
                <div class="smoke-box" id="smokeBox"></div>
            </div>
            <div class="race-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-sub">— MESSAGE UNLOCKED —</div>
                <div class="tyre-marks"></div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
                <div class="tyre-marks"></div>
                <div class="m-foot">FROM: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const car = document.getElementById('car');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const smokeBox = document.getElementById('smokeBox');
    const wheels = document.querySelectorAll('.wheel');
    const scene = document.getElementById('scene');

    // Idle engine rumble
    gsap.to(car, {y:2, duration:0.1, yoyo:true, repeat:-1});

    // Spawn smoke
    function puffSmoke() {
        const s = document.createElement('div');
        s.style.cssText = `position:absolute;width:${15+Math.random()*20}px;height:${15+Math.random()*20}px;background:rgba(200,200,200,0.4);border-radius:50%;left:0;bottom:0;`;
        smokeBox.appendChild(s);
        gsap.to(s, {x:-60-Math.random()*40, y:-30-Math.random()*20, opacity:0, scale:2, duration:1+Math.random(), ease:'power1.out', onComplete:()=>s.remove()});
    }
    const smokeInterval = setInterval(puffSmoke, 200);

    let drifted = false;
    car.addEventListener('click', () => {
        if(drifted) return;
        drifted = true;
        hint.style.display='none';
        clearInterval(smokeInterval);

        // Spin wheels
        wheels.forEach(w => w.style.animationPlayState = 'running');

        const tl = gsap.timeline();
        tl // Screech and drift across screen
          .to(car, {x:window.innerWidth*0.6, rotation:-30, duration:0.8, ease:'power3.in'})
          .to(car, {x:-window.innerWidth*0.6, rotation:30, duration:1.5, ease:'power2.inOut'})
          // Big spin-out at center
          .to(car, {x:0, rotation:720, duration:1.2, ease:'power2.out'})
          // Wheels lock and screech
          .to(car, {scale:1.5, duration:0.2, ease:'power2.out'})
          // Car disintegrates into letters
          .to(car, {scale:10, opacity:0, duration:0.5, ease:'power3.in'})
          // Message 
          .to(msg, {opacity:1, pointerEvents:'auto', duration:1.5}, '-=0.2')
          .from('.m-head', {x:-200, opacity:0, duration:1, ease:'power2.out'}, '-=1')
          .from('.m-body', {y:50, opacity:0, duration:1, ease:'power2.out'}, '-=0.5');
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
