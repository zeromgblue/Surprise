export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;600&family=Prompt:wght@300;600&display=swap');
            .diamond-scene {
                position:relative; width:100vw; height:100vh;
                display:flex; flex-direction:column; align-items:center; justify-content:center;
                overflow:hidden; background:radial-gradient(ellipse at center, #0f0c29, #302b63, #24243e);
                perspective:800px;
            }
            .sparkle-box { position:absolute; inset:0; pointer-events:none; z-index:2; }
            .sp { position:absolute; width:3px; height:3px; border-radius:50%; background:#fff; mix-blend-mode:screen; }

            /* CSS-only 3D Diamond using clip-path polygons */
            .diamond-wrap {
                position:relative; width:220px; height:260px;
                cursor:pointer; z-index:10; transform-style:preserve-3d;
                animation: floatDia 4s ease-in-out infinite;
            }
            @keyframes floatDia { 0%,100%{transform:translateY(0) rotateY(0deg);} 50%{transform:translateY(-20px) rotateY(180deg);} }

            .dia-top {
                position:absolute; top:0; left:0; width:100%; height:50%;
                background:linear-gradient(135deg,#a8edea,#fff,#fed6e3,#c9d6ff);
                clip-path:polygon(10% 100%, 50% 0%, 90% 100%);
                filter:drop-shadow(0 0 30px rgba(168,237,234,0.8));
            }
            .dia-mid-l {
                position:absolute; top:50%; left:0; width:50%; height:50%;
                background:linear-gradient(135deg,#667eea,#764ba2);
                clip-path:polygon(0 0,100% 0,50% 100%);
            }
            .dia-mid-r {
                position:absolute; top:50%; right:0; width:50%; height:50%;
                background:linear-gradient(135deg,#f093fb,#f5576c);
                clip-path:polygon(0 0,100% 0,50% 100%);
            }
            /* Shine overlay */
            .dia-shine {
                position:absolute; inset:0;
                background:linear-gradient(45deg,transparent 30%,rgba(255,255,255,0.5) 50%,transparent 70%);
                animation:shineMove 3s ease-in-out infinite;
            }
            @keyframes shineMove { 0%,100%{background-position:-200%;} 50%{background-position:200%;} }

            .hint-text { position:absolute; bottom:15vh; color:#a8edea; font-family:'Prompt',sans-serif; font-size:1.2rem; letter-spacing:3px; animation:pulse 2s infinite; z-index:20; pointer-events:none; text-align:center; }
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            .luxury-msg {
                position:absolute; inset:0; display:flex; flex-direction:column;
                align-items:center; justify-content:center; z-index:50; opacity:0; pointer-events:none;
                background:radial-gradient(ellipse,rgba(15,12,41,0.9),rgba(36,36,62,0.98)); backdrop-filter:blur(10px);
            }
            .m-head { font-family:'Cormorant Garamond',serif; font-size:5rem; color:#fed6e3; font-weight:300; letter-spacing:8px; text-shadow:0 0 40px rgba(254,214,227,0.8); margin-bottom:10px; }
            .m-divider { width:200px; height:1px; background:linear-gradient(90deg,transparent,#a8edea,transparent); margin:20px 0; }
            .m-body { font-family:'Prompt',sans-serif; font-size:1.5rem; color:#c9d6ff; line-height:2; max-width:550px; text-align:center; font-weight:300; padding:30px; border:1px solid rgba(168,237,234,0.3); }
            .m-foot { font-family:'Cormorant Garamond',serif; font-size:1.3rem; color:#a8edea; margin-top:40px; letter-spacing:5px; font-style:italic; }
        </style>
        <div class="diamond-scene" id="scene">
            <div class="sparkle-box" id="spBox"></div>
            <div class="hint-text" id="hint">แตะเพชรเพื่อไขความลับ</div>
            <div class="diamond-wrap" id="diamond">
                <div class="dia-top"></div>
                <div class="dia-mid-l"></div>
                <div class="dia-mid-r"></div>
                <div class="dia-shine"></div>
            </div>
            <div class="luxury-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-divider"></div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
                <div class="m-foot">— ${escapeHtml(data.sender)} —</div>
            </div>
        </div>
    `;

    const diamond = document.getElementById('diamond');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const spBox = document.getElementById('spBox');

    // Ambient sparkles
    setInterval(() => {
        const s = document.createElement('div');
        s.className = 'sp';
        s.style.left = Math.random()*100+'%';
        s.style.top = Math.random()*100+'%';
        spBox.appendChild(s);
        gsap.fromTo(s, {scale:0,opacity:0},{scale:2+Math.random()*3,opacity:1,duration:0.5,
            onComplete:()=>gsap.to(s,{scale:0,opacity:0,duration:0.5,onComplete:()=>s.remove()})});
    }, 200);

    let clicked = false;
    diamond.addEventListener('click', () => {
        if (clicked) return;
        clicked = true;
        hint.style.display='none';
        const tl = gsap.timeline();
        tl.to(diamond, {rotationY:720, scale:3, duration:2, ease:'power2.inOut'})
          .to(diamond, {scale:0, opacity:0, duration:0.5, ease:'power2.in'}, '-=0.3')
          .to(msg, {opacity:1, pointerEvents:'auto', duration:2}, '-=0.3')
          .from('.m-body', {y:50, opacity:0, duration:1.5, ease:'power2.out'}, '-=1.5')
          .from('.m-divider', {scaleX:0, duration:1, ease:'power2.out'}, '-=2');
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
