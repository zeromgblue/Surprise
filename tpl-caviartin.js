export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;0,700&family=Prompt:wght@300;600&display=swap');
            .caviar-scene {
                position:relative; width:100vw; height:100vh;
                display:flex; align-items:center; justify-content:center;
                overflow:hidden;
                background:radial-gradient(ellipse, #0a0a0a, #1a1a1a);
            }
            /* Marble table surface */
            .table-bg {
                position:absolute; bottom:0; width:100%; height:45%;
                background:repeating-linear-gradient(45deg,#e5e7eb,#e5e7eb 1px,#d1d5db 1px,#d1d5db 20px),
                           repeating-linear-gradient(-45deg,#e5e7eb,#e5e7eb 1px,#f3f4f6 1px,#f3f4f6 20px);
                opacity:0.15; z-index:1;
            }
            /* Tin container */
            .tin-wrap {
                position:relative; width:200px; height:200px;
                cursor:pointer; z-index:10; transform-style:preserve-3d;
            }
            .tin-body {
                position:absolute; bottom:0; width:200px; height:150px;
                background:conic-gradient(from 0deg,#1a1a1a,#2d2d2d,#0a0a0a,#374151,#1a1a1a);
                border-radius:10px; border:3px solid #374151;
                box-shadow:0 20px 60px rgba(0,0,0,0.9), inset 0 2px 4px rgba(255,255,255,0.1);
                display:flex; align-items:center; justify-content:center; flex-direction:column;
            }
            .tin-gold-band { width:100%; height:12px; background:linear-gradient(90deg,#78350f,#d97706,#fde047,#d97706,#78350f); margin:5px 0; }
            .tin-label-text { font-family:'Playfair Display',serif; color:#fde047; font-size:1rem; letter-spacing:3px; font-style:italic; }
            .tin-label-sub { font-family:'Prompt',sans-serif; color:#ca8a04; font-size:0.6rem; letter-spacing:4px; margin-top:2px; }
            /* Lid */
            .tin-lid {
                position:absolute; top:0; width:200px; height:60px;
                background:conic-gradient(from 0deg,#2d2d2d,#374151,#0a0a0a,#4b5563,#2d2d2d);
                border-radius:10px 10px 0 0; border:3px solid #374151; border-bottom:none;
                z-index:12; display:flex; align-items:center; justify-content:center;
                box-shadow:0 -5px 20px rgba(0,0,0,0.8);
            }
            .caviar-inside {
                position:absolute; bottom:0; width:200px; height:150px; border-radius:10px;
                background:radial-gradient(circle,#1a1a1a,#000);
                display:flex; align-items:center; justify-content:center; overflow:hidden; z-index:8; opacity:0;
            }
            /* Caviar beads */
            .bead { position:absolute; border-radius:50%; background:radial-gradient(circle at 30% 30%,#374151,#000); border:1px solid #4b5563; }

            /* Pearl spoon */
            .spoon-wrap { position:absolute; right:-60px; bottom:50px; z-index:15; opacity:0; }
            .spoon { font-size:3rem; transform:rotate(-30deg); filter:drop-shadow(0 5px 10px rgba(0,0,0,0.8)); }

            .hint-text { position:absolute; bottom:13vh; color:#ca8a04; font-family:'Playfair Display',serif; font-size:1.1rem; letter-spacing:4px; animation:pulse 2s infinite; z-index:20; pointer-events:none; font-style:italic; }
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            .elite-msg {
                position:absolute; inset:0; display:flex; flex-direction:column;
                align-items:center; justify-content:center; z-index:50; opacity:0; pointer-events:none;
                background:linear-gradient(135deg,rgba(10,10,10,0.92),rgba(26,26,26,0.97)); backdrop-filter:blur(15px);
            }
            .m-head { font-family:'Playfair Display',serif; font-size:5rem; color:#fde047; letter-spacing:4px; font-style:italic; text-shadow:0 0 30px rgba(253,224,71,0.5); }
            .m-border { border:1px solid rgba(212,175,55,0.4); padding:35px 40px; max-width:620px; margin:20px 0; }
            .m-body { font-family:'Prompt',sans-serif; font-size:1.5rem; color:#f3f4f6; line-height:2; text-align:center; font-weight:300; }
            .m-foot { font-family:'Playfair Display',serif; font-size:1.2rem; color:#ca8a04; margin-top:20px; font-style:italic; }
        </style>
        <div class="caviar-scene" id="scene">
            <div class="table-bg"></div>
            <div class="hint-text" id="hint">เปิดฝากระป๋องคาเวียร์</div>
            <div class="tin-wrap" id="tinWrap">
                <div class="caviar-inside" id="inside"></div>
                <div class="tin-body">
                    <div class="tin-gold-band"></div>
                    <div class="tin-label-text">CAVIAR</div>
                    <div class="tin-label-sub">PREMIUM SELECT</div>
                    <div class="tin-gold-band"></div>
                </div>
                <div class="tin-lid" id="lid">
                    <div class="tin-label-text" style="font-size:0.8rem">SURPRISE</div>
                </div>
                <div class="spoon-wrap" id="spoon"><div class="spoon">🥄</div></div>
            </div>
            <div class="elite-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-border"><div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div></div>
                <div class="m-foot">— ${escapeHtml(data.sender)} —</div>
            </div>
        </div>
    `;

    const tinWrap = document.getElementById('tinWrap');
    const lid = document.getElementById('lid');
    const inside = document.getElementById('inside');
    const spoon = document.getElementById('spoon');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');

    // Generate caviar beads inside
    for(let i=0;i<60;i++){
        const b=document.createElement('div');
        b.className='bead';
        const sz=6+Math.random()*8;
        b.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*90}%;top:${Math.random()*90}%;`;
        inside.appendChild(b);
    }

    // Gentle tilt
    gsap.to(tinWrap,{rotationY:8,duration:2,yoyo:true,repeat:-1,ease:'sine.inOut'});

    let opened=false;
    tinWrap.addEventListener('click',()=>{
        if(opened) return;
        opened=true;
        hint.style.display='none';
        const tl=gsap.timeline();
        tl.to(lid,{rotationX:-150,transformOrigin:'bottom',duration:1.5,ease:'power2.inOut',transformPerspective:600})
          .to(inside,{opacity:1,duration:0.5},'-=0.5')
          .to(spoon,{opacity:1,x:-20,duration:1,ease:'back.out(1)'},'-=0.5')
          .to(tinWrap,{scale:0,opacity:0,duration:1,ease:'power2.in'},'+=1.5')
          .to(msg,{opacity:1,pointerEvents:'auto',duration:2},'-=0.5')
          .from('.m-head',{scale:0.5,opacity:0,duration:2,ease:'power2.out'},'-=1.5')
          .from('.m-border',{scaleY:0,transformOrigin:'top',duration:1.5,ease:'power2.out'},'-=1');
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
