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
            .curtain-scene {
                position:relative; width:100vw; height:100vh;
                display:flex; align-items:center; justify-content:center;
                overflow:hidden; background:#0a0a0a;
            }
            /* Gold ceiling ornament */
            .cornice {
                position:absolute; top:0; left:0; width:100%; height:30px;
                background:linear-gradient(135deg,#78350f,#d97706,#fde047,#d97706,#78350f);
                box-shadow:0 5px 20px rgba(253,224,71,0.4); z-index:20;
            }
            /* Curtain halves */
            .curtain-l, .curtain-r {
                position:absolute; top:0; width:52%; height:100%; z-index:15;
                transform-origin:top;
                display:flex; flex-direction:column;
            }
            .curtain-l { left:0; background:linear-gradient(135deg,#7f1d1d,#b91c1c,#7f1d1d,#991b1b); }
            .curtain-r { right:0; background:linear-gradient(135deg,#991b1b,#7f1d1d,#b91c1c,#7f1d1d); }
            /* Velvet texture folds */
            .curtain-l::before, .curtain-r::before {
                content:''; position:absolute; inset:0;
                background:repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(0,0,0,0.2) 40px,rgba(0,0,0,0.2) 80px);
            }
            /* Gold trim edge */
            .curtain-l::after { content:''; position:absolute; right:0; top:0; width:8px; height:100%; background:linear-gradient(180deg,#fde047,#ca8a04,#fde047); }
            .curtain-r::after { content:''; position:absolute; left:0; top:0; width:8px; height:100%; background:linear-gradient(180deg,#fde047,#ca8a04,#fde047); }

            /* Red carpet floor stripe */
            .carpet {
                position:absolute; bottom:0; left:50%; transform:translateX(-50%);
                width:200px; height:100%; z-index:5;
                background:linear-gradient(90deg,#7f1d1d,#b91c1c,#7f1d1d);
                box-shadow:0 0 40px rgba(185,28,28,0.6);
            }

            /* Spotlights */
            .light-l, .light-r {
                position:absolute; top:-50px; width:300px; height:150%;
                background:radial-gradient(ellipse at top, rgba(253,224,71,0.12), transparent 70%);
                pointer-events:none; z-index:3;
            }
            .light-l { left:10%; animation:sway 3s ease-in-out infinite; }
            .light-r { right:10%; animation:sway 3s ease-in-out infinite reverse; }
            @keyframes sway { 0%,100%{transform:rotate(-5deg);} 50%{transform:rotate(5deg);} }

            .hint-text {
                position:absolute; z-index:25; color:#fde047; font-family:'Cinzel',serif;
                font-size:1.3rem; letter-spacing:4px; animation:pulse 2s infinite; cursor:pointer;
                text-shadow:0 0 20px rgba(253,224,71,0.8); text-transform:uppercase;
            }
            @keyframes pulse { 0%,100%{opacity:0.4;} 50%{opacity:1;} }

            .vip-msg {
                position:absolute; inset:0; display:flex; flex-direction:column;
                align-items:center; justify-content:center; z-index:50; opacity:0; pointer-events:none;
                background:radial-gradient(ellipse,rgba(10,10,10,0.7),rgba(0,0,0,0.9));
            }
            .m-head { font-family:'Cinzel',serif; font-size:4.5rem; color:#fde047; letter-spacing:6px; text-shadow:0 0 40px rgba(253,224,71,0.8), 0 5px 10px #000; text-transform:uppercase; }
            .m-gold-line { width:300px; height:2px; background:linear-gradient(90deg,transparent,#d97706,#fde047,#d97706,transparent); margin:25px 0; }
            .m-body { font-family:'Prompt',sans-serif; font-size:1.5rem; color:#fef3c7; line-height:2; max-width:600px; text-align:center; font-weight:300; }
            .m-foot { font-family:'Cinzel',serif; font-size:1.2rem; color:#ca8a04; margin-top:40px; letter-spacing:5px; }
        </style>
        <div class="curtain-scene" id="scene">
            <div class="cornice"></div>
            <div class="light-l"></div>
            <div class="light-r"></div>
            <div class="carpet"></div>
            <div class="curtain-l" id="curtainL"></div>
            <div class="curtain-r" id="curtainR"></div>
            <div class="hint-text" id="hint">✦ เปิดม่านกำมะหยี่ ✦</div>
            <div class="vip-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-gold-line"></div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
                <div class="m-gold-line"></div>
                <div class="m-foot">${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const curtainL = document.getElementById('curtainL');
    const curtainR = document.getElementById('curtainR');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');

    // Subtle breathing effect on curtains
    gsap.to(curtainL, {scaleX:1.01, duration:2, yoyo:true, repeat:-1, ease:'sine.inOut'});
    gsap.to(curtainR, {scaleX:1.01, duration:2, yoyo:true, repeat:-1, ease:'sine.inOut', delay:1});

    hint.addEventListener('click', () => {
        if(hint.dataset.clicked) return;
        hint.dataset.clicked = '1';
        const tl = gsap.timeline();
        tl.to(hint, {opacity:0, duration:0.5})
          // Curtains sweep open dramatically  
          .to(curtainL, {x:'-100%', duration:2.5, ease:'power3.inOut'})
          .to(curtainR, {x:'100%', duration:2.5, ease:'power3.inOut'}, '<')
          // VIP message grand entrance
          .to(msg, {opacity:1, pointerEvents:'auto', duration:1.5}, '-=0.5')
          .from('.m-head', {letterSpacing:'30px', opacity:0, duration:2, ease:'power2.out'}, '-=1')
          .from('.m-body', {y:60, opacity:0, duration:1.5, ease:'power2.out'}, '-=0.8')
          .from('.m-gold-line', {scaleX:0, duration:1.5, ease:'power2.out', stagger:0.5}, '-=1.5');
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
