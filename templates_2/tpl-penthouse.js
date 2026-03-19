export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,400&family=Prompt:wght@300&display=swap');
            .penthouse-scene {
                position:relative; width:100vw; height:100vh;
                overflow:hidden;
                background:#0a0a0a;
            }
            /* City skyline panorama */
            .skyline {
                position:absolute; inset:0; z-index:1;
                background:linear-gradient(180deg,
                    #0a0a23 0%,
                    #1a1a3e 30%,
                    #2d2d5e 50%,
                    #1a1a3e 70%,
                    #0d0d1a 100%
                );
            }
            /* Building silhouettes */
            .buildings { position:absolute; bottom:0; width:100%; height:60%; z-index:2; display:flex; align-items:flex-end; }
            .bld { background:#0d0d1a; border:1px solid #1a1a3e; position:relative; flex-shrink:0; }
            /* Window grids on buildings */
            .bld::before {
                content:''; position:absolute; inset:10px;
                background:repeating-linear-gradient(0deg,transparent,transparent 12px,rgba(253,224,71,0.08) 12px,rgba(253,224,71,0.08) 14px),
                           repeating-linear-gradient(90deg,transparent,transparent 10px,rgba(253,224,71,0.08) 10px,rgba(253,224,71,0.08) 12px);
            }

            /* Floor-to-ceiling glass window frame */
            .window-frame {
                position:absolute; inset:0; z-index:5;
                border:30px solid rgba(20,20,40,0.95);
                box-shadow:inset 0 0 80px rgba(0,0,0,0.8);
                pointer-events:none;
            }
            /* Glass reflections */
            .window-frame::after {
                content:''; position:absolute; top:0; left:30px; width:3px; height:100%;
                background:linear-gradient(180deg,transparent,rgba(255,255,255,0.05),transparent);
            }

            /* Stars */
            .star-box { position:absolute; top:0; width:100%; height:55%; z-index:3; pointer-events:none; }
            .star { position:absolute; width:2px; height:2px; background:#fff; border-radius:50%; }

            /* Moon */
            .moon {
                position:absolute; top:8%; right:15%; width:70px; height:70px; z-index:4;
                background:radial-gradient(circle at 35% 35%,#fef9c3,#fde047,#d97706);
                border-radius:50%; box-shadow:0 0 50px rgba(253,224,71,0.4);
            }

            /* City reflection on floor */
            .floor-reflection {
                position:absolute; bottom:0; width:100%; height:30%; z-index:6;
                background:linear-gradient(0deg,rgba(10,10,10,0.95),transparent);
            }

            /* Wine glass on ledge */
            .wine-glass { position:absolute; bottom:12%; right:10%; z-index:8; font-size:4rem; filter:drop-shadow(0 10px 20px rgba(0,0,0,0.8)); cursor:pointer; }
            .wine-glass:hover { transform:scale(1.1); transition:0.3s; }

            .hint-text { position:absolute; bottom:8%; left:50%; transform:translateX(-50%); color:#fde047; font-family:'Cormorant Garamond',serif; font-size:1.4rem; letter-spacing:5px; animation:pulse 2s infinite; z-index:20; pointer-events:none; text-align:center; white-space:nowrap; font-style:italic; }
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            .pent-msg {
                position:absolute; inset:0; display:flex; flex-direction:column;
                align-items:center; justify-content:center; z-index:50; opacity:0; pointer-events:none;
                background:rgba(0,0,0,0.75); backdrop-filter:blur(20px);
            }
            .m-head { font-family:'Cormorant Garamond',serif; font-size:5rem; color:#fef3c7; font-weight:300; letter-spacing:8px; text-shadow:0 0 40px rgba(254,243,199,0.5); }
            .m-body { font-family:'Prompt',sans-serif; font-size:1.5rem; color:#e2e8f0; line-height:2; max-width:600px; text-align:center; font-weight:300; margin:30px 0; font-style:italic; }
            .m-divider { width:200px; height:1px; background:linear-gradient(90deg,transparent,#ca8a04,transparent); }
            .m-foot { font-family:'Cormorant Garamond',serif; font-size:1.3rem; color:#ca8a04; margin-top:20px; font-style:italic; letter-spacing:4px; }
        </style>
        <div class="penthouse-scene" id="scene">
            <div class="skyline"></div>
            <div class="star-box" id="starBox"></div>
            <div class="moon"></div>
            <div class="buildings" id="buildings"></div>
            <div class="floor-reflection"></div>
            <div class="window-frame"></div>
            <div class="wine-glass" id="wine">🍷</div>
            <div class="hint-text" id="hint">ชมวิวกลางคืนจากเพนท์เฮาส์สูง 80 ชั้น</div>
            <div class="pent-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-divider"></div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
                <div class="m-divider"></div>
                <div class="m-foot">— ${escapeHtml(data.sender)} —</div>
            </div>
        </div>
    `;

    const starBox = document.getElementById('starBox');
    const buildings = document.getElementById('buildings');
    const wine = document.getElementById('wine');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');

    // Generate stars
    for(let i=0;i<120;i++){
        const s=document.createElement('div');
        s.className='star';
        s.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;opacity:${0.3+Math.random()*0.7};`;
        starBox.appendChild(s);
        // Twinkle
        gsap.to(s,{opacity:Math.random()*0.5,duration:1+Math.random()*3,yoyo:true,repeat:-1,ease:'sine.inOut'});
    }

    // Generate buildings skyline
    const bldData = [
        {w:60,h:200},{w:80,h:300},{w:50,h:180},{w:100,h:350},{w:70,h:260},
        {w:90,h:320},{w:55,h:220},{w:75,h:280},{w:65,h:240},{w:110,h:380},
        {w:45,h:170},{w:85,h:310},{w:60,h:200},{w:95,h:340},{w:55,h:190},
    ];
    bldData.forEach(d=>{
        const b=document.createElement('div');
        b.className='bld';
        b.style.cssText=`width:${d.w}px;height:${d.h}px;margin-right:${2+Math.random()*5}px;`;
        buildings.appendChild(b);
    });

    // Slow pan up effect on scene
    gsap.from('#scene',{y:50, duration:3, ease:'power1.out'});

    // Wine glass click to trigger message
    wine.addEventListener('click',()=>{
        if(wine.dataset.clicked) return;
        wine.dataset.clicked='1';
        hint.style.display='none';
        const tl=gsap.timeline();
        tl.to(wine,{rotation:-20,y:-20,duration:0.3,ease:'power2.out'})
          .to(wine,{opacity:0,duration:0.5},'-=0.1')
          .to(msg,{opacity:1,pointerEvents:'auto',duration:2})
          .from('.m-head',{y:-60,opacity:0,duration:2,ease:'power2.out'},'-=1.5')
          .from('.m-body',{y:40,opacity:0,duration:1.5},'-=1')
          .from('.m-divider',{scaleX:0,duration:1.5,stagger:0.3},'-=1.8');
    });

    // Auto-animate wine glass gently
    gsap.to(wine,{y:-8,duration:2,yoyo:true,repeat:-1,ease:'sine.inOut'});
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
