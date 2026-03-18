export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Prompt:wght@300&display=swap');
            .watch-scene {
                position:relative; width:100vw; height:100vh;
                display:flex; align-items:center; justify-content:center;
                overflow:hidden;
                background:radial-gradient(ellipse at center, #1c1c1e, #000);
            }
            /* Velvet box */
            .box-wrap {
                position:relative; width:280px; height:200px;
                cursor:pointer; z-index:10; transform-style:preserve-3d;
            }
            .box-base {
                position:absolute; bottom:0; width:280px; height:140px;
                background:linear-gradient(135deg,#1a1a1a,#2d2d2d,#1a1a1a);
                border-radius:8px; border:2px solid #3d3d3d;
                box-shadow:0 30px 60px rgba(0,0,0,0.9), inset 0 0 30px rgba(0,0,0,0.5);
                display:flex; align-items:center; justify-content:center;
            }
            .box-lid {
                position:absolute; top:0; width:280px; height:100px;
                background:linear-gradient(135deg,#2d2d2d,#1a1a1a,#2d2d2d);
                border-radius:8px 8px 0 0; border:2px solid #3d3d3d; border-bottom:none;
                transform-origin:bottom; z-index:12;
                display:flex; align-items:center; justify-content:center;
            }
            .lid-logo { font-family:'Cinzel',serif; font-size:1.2rem; color:#ca8a04; letter-spacing:8px; text-transform:uppercase; }
            /* Watch inside box */
            .watch-face {
                width:110px; height:110px; border-radius:50%;
                background:radial-gradient(circle at 30% 30%, #d4af37, #8b6914, #d4af37);
                border:6px solid #78350f;
                box-shadow:0 0 30px rgba(212,175,55,0.6), inset 0 0 20px rgba(0,0,0,0.6);
                display:flex; align-items:center; justify-content:center; position:relative;
                opacity:0;
            }
            .watch-inner { width:80px; height:80px; border-radius:50%; background:radial-gradient(circle,#1c1c1e,#000); border:2px solid #ca8a04; display:flex; align-items:center; justify-content:center; }
            .watch-brand { font-family:'Cinzel',serif; font-size:0.5rem; color:#ca8a04; letter-spacing:3px; text-align:center; line-height:1.5; }
            /* Watch hands */
            .hand { position:absolute; bottom:50%; left:50%; transform-origin:bottom; border-radius:3px; }
            .hour-h { width:4px; height:28px; background:#d4af37; transform:translateX(-50%) rotate(30deg); margin-left:-2px; }
            .min-h { width:3px; height:38px; background:#e2e8f0; transform:translateX(-50%) rotate(150deg); margin-left:-1.5px; animation:tickMin 60s linear infinite; }
            @keyframes tickMin { 100%{transform:translateX(-50%) rotate(510deg);} }
            /* Watch strap */
            .strap { width:40px; height:30px; background:linear-gradient(135deg,#78350f,#92400e); border-radius:3px; position:absolute; }
            .strap-t { top:-28px; left:35px; }
            .strap-b { bottom:-28px; left:35px; }

            .hint-text { position:absolute; bottom:13vh; color:#ca8a04; font-family:'Cinzel',serif; font-size:1.1rem; letter-spacing:4px; animation:pulse 2s infinite; z-index:20; pointer-events:none; text-align:center; }
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            .luxury-msg {
                position:absolute; inset:0; display:flex; flex-direction:column;
                align-items:center; justify-content:center; z-index:50; opacity:0; pointer-events:none;
                background:radial-gradient(ellipse,rgba(28,28,30,0.9),rgba(0,0,0,0.97)); backdrop-filter:blur(15px);
            }
            .m-head { font-family:'Cinzel',serif; font-size:4.5rem; color:#d4af37; letter-spacing:6px; text-shadow:0 0 30px rgba(212,175,55,0.6); }
            .m-hr { width:250px; height:1px; background:linear-gradient(90deg,transparent,#d4af37,transparent); margin:25px 0; }
            .m-body { font-family:'Prompt',sans-serif; font-size:1.5rem; color:#e2e8f0; line-height:2; max-width:560px; text-align:center; font-weight:300; }
            .m-foot { font-family:'Cinzel',serif; font-size:1rem; color:#78350f; margin-top:30px; letter-spacing:5px; }
        </style>
        <div class="watch-scene" id="scene">
            <div class="hint-text" id="hint">เปิดกล่องนาฬิกาหรู</div>
            <div class="box-wrap" id="boxWrap">
                <div class="box-base">
                    <div class="watch-face" id="watchFace">
                        <div class="strap strap-t"></div>
                        <div class="strap strap-b"></div>
                        <div class="watch-inner">
                            <div class="watch-brand">SURPRISE<br>SWISS<br>MADE</div>
                        </div>
                        <div class="hand hour-h"></div>
                        <div class="hand min-h"></div>
                    </div>
                </div>
                <div class="box-lid" id="boxLid"><div class="lid-logo">Surprise</div></div>
            </div>
            <div class="luxury-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-hr"></div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
                <div class="m-hr"></div>
                <div class="m-foot">— ${escapeHtml(data.sender)} —</div>
            </div>
        </div>
    `;

    const boxWrap = document.getElementById('boxWrap');
    const boxLid = document.getElementById('boxLid');
    const watchFace = document.getElementById('watchFace');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');

    // Subtle idle rotation
    gsap.to(boxWrap, {rotationY:5, duration:2, yoyo:true, repeat:-1, ease:'sine.inOut'});

    let opened = false;
    boxWrap.addEventListener('click', () => {
        if(opened) return;
        opened = true;
        hint.style.display='none';
        const tl = gsap.timeline();
        // Lid opens up (rotateX)
        tl.to(boxLid, {rotationX:-130, duration:1.5, ease:'power2.inOut', transformPerspective:600})
          // Watch rises out
          .to(watchFace, {opacity:1, y:-60, duration:1.5, ease:'back.out(1)'}, '-=0.5')
          .to(watchFace, {boxShadow:'0 0 60px rgba(212,175,55,0.9), inset 0 0 20px rgba(0,0,0,0.6)', duration:1}, '-=0.5')
          // Zoom into the watch
          .to(boxWrap, {scale:0, opacity:0, duration:1, ease:'power2.in'}, '+=1.5')
          // Message reveal
          .to(msg, {opacity:1, pointerEvents:'auto', duration:2}, '-=0.5')
          .from('.m-head', {letterSpacing:'20px', opacity:0, duration:2}, '-=1.5')
          .from('.m-body', {y:40, opacity:0, duration:1.5}, '-=1');
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
