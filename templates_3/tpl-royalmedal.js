export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@1,700&family=Prompt:wght@300;600&display=swap');
            .gala-scene {
                position:relative; width:100vw; height:100vh;
                display:flex; align-items:center; justify-content:center;
                overflow:hidden;
                background:radial-gradient(ellipse at center, #1c0a00, #0d0600);
            }
            /* Rotating light rays */
            .rays { position:absolute; inset:-50%; width:200%; height:200%; z-index:1;
                background:conic-gradient(from 0deg, transparent 0%, rgba(212,175,55,0.03) 5%, transparent 10%, transparent 45%, rgba(212,175,55,0.03) 50%, transparent 55%);
                animation:spinRays 30s linear infinite; }
            @keyframes spinRays { 100%{transform:rotate(360deg);} }

            /* Central gold medallion */
            .medallion-wrap {
                position:relative; width:250px; height:250px;
                cursor:pointer; z-index:15;
                animation:floatMed 3s ease-in-out infinite;
            }
            @keyframes floatMed { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-15px) rotate(3deg);} }

            .medallion {
                position:absolute; inset:0; border-radius:50%;
                background:conic-gradient(from 0deg,#78350f,#d97706,#fde047,#ca8a04,#fde047,#d97706,#78350f);
                box-shadow:0 0 80px rgba(212,175,55,0.6), 0 0 40px rgba(212,175,55,0.3), inset 0 0 30px rgba(0,0,0,0.5);
                display:flex; align-items:center; justify-content:center;
                border:4px solid #ca8a04;
            }
            .medallion-inner {
                width:190px; height:190px; border-radius:50%;
                background:radial-gradient(circle at 35% 30%,#2d1810,#1a0d00,#0d0600);
                border:3px solid rgba(212,175,55,0.4);
                display:flex; align-items:center; justify-content:center; flex-direction:column;
            }
            .med-crown { font-size:3.5rem; filter:drop-shadow(0 0 10px rgba(253,224,71,0.8)); }
            .med-text { font-family:'Libre Baskerville',serif; font-size:0.7rem; color:#fde047; letter-spacing:4px; font-style:italic; margin-top:5px; text-align:center; line-height:1.5; }
            /* Rays around medallion */
            .med-ray {
                position:absolute; width:4px; height:50px; background:linear-gradient(180deg,#fde047,transparent);
                transform-origin:bottom center; left:calc(50% - 2px); top:calc(50% - 50px);
            }

            .hint-text { position:absolute; bottom:14vh; color:#d97706; font-family:'Libre Baskerville',serif; font-size:1.1rem; letter-spacing:4px; animation:pulse 2s infinite; z-index:20; pointer-events:none; font-style:italic; text-align:center; }
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Gold dust particles */
            .dust-box { position:absolute; inset:0; z-index:3; pointer-events:none; }
            .dust { position:absolute; width:2px; height:2px; background:#fde047; border-radius:50%; mix-blend-mode:screen; }

            .royal-msg {
                position:absolute; inset:0; display:flex; flex-direction:column;
                align-items:center; justify-content:center; z-index:50; opacity:0; pointer-events:none;
                background:radial-gradient(ellipse,rgba(28,10,0,0.88),rgba(13,6,0,0.97)); backdrop-filter:blur(15px);
            }
            .m-crown-top { font-size:4rem; margin-bottom:10px; filter:drop-shadow(0 0 20px rgba(253,224,71,0.8)); }
            .m-head { font-family:'Libre Baskerville',serif; font-size:4.5rem; color:#fde047; letter-spacing:5px; font-style:italic; text-shadow:0 0 30px rgba(253,224,71,0.6); }
            .m-ornament { color:#ca8a04; font-size:2rem; margin:15px 0; letter-spacing:10px; }
            .m-body { font-family:'Prompt',sans-serif; font-size:1.5rem; color:#fef3c7; line-height:2; max-width:580px; text-align:center; font-weight:300; padding:25px 35px; border:1px solid rgba(202,138,4,0.4); background:rgba(0,0,0,0.3); }
            .m-foot { font-family:'Libre Baskerville',serif; font-size:1.1rem; color:#d97706; margin-top:25px; font-style:italic; letter-spacing:3px; }
        </style>
        <div class="gala-scene" id="scene">
            <div class="rays"></div>
            <div class="dust-box" id="dustBox"></div>
            <div class="hint-text" id="hint">แตะเหรียญทองราชวงศ์</div>
            <div class="medallion-wrap" id="medallion">
                <div class="medallion">
                    <div class="medallion-inner">
                        <div class="med-crown">👑</div>
                        <div class="med-text">ROYAL<br>DECREE</div>
                    </div>
                </div>
            </div>
            <div class="royal-msg" id="msg">
                <div class="m-crown-top">👑</div>
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-ornament">✦ ✦ ✦</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
                <div class="m-foot">— ${escapeHtml(data.sender)} —</div>
            </div>
        </div>
    `;

    const medallion = document.getElementById('medallion');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const dustBox = document.getElementById('dustBox');

    // Gold dust particles
    setInterval(()=>{
        const d=document.createElement('div');
        d.className='dust';
        d.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;`;
        dustBox.appendChild(d);
        gsap.fromTo(d,{opacity:0,scale:0},{opacity:1,scale:3,duration:1,
            onComplete:()=>gsap.to(d,{opacity:0,y:-50,duration:2,onComplete:()=>d.remove()})});
    }, 150);

    // Ray decorations
    const med = document.querySelector('.medallion');
    for(let i=0;i<12;i++){
        const r=document.createElement('div');
        r.className='med-ray';
        r.style.transform=`rotate(${i*30}deg)`;
        med.parentElement.appendChild(r);
    }

    let tapped=false;
    medallion.addEventListener('click',()=>{
        if(tapped) return;
        tapped=true;
        hint.style.display='none';
        const tl=gsap.timeline();
        // Medallion spins and grows
        tl.to(medallion,{rotationY:720,scale:2,duration:2,ease:'power2.inOut'})
          .to(medallion,{scale:0,opacity:0,duration:0.5,ease:'power3.in'})
          // Royal message descends
          .to(msg,{opacity:1,pointerEvents:'auto',duration:2},'-=0.2')
          .from('.m-crown-top',{scale:0,rotation:720,opacity:0,duration:2,ease:'elastic.out(1,0.5)'},'-=1.5')
          .from('.m-head',{y:-50,opacity:0,duration:1.5,ease:'power2.out'},'-=1')
          .from('.m-body',{scaleY:0,transformOrigin:'top',duration:1.5,ease:'power2.out'},'-=0.8')
          .from('.m-ornament',{letterSpacing:'1px',opacity:0,duration:1},'-=1.5');
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
