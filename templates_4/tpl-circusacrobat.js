export async function render(container, data, config) {
    container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#0d0005;";
    document.body.style.cssText="margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML=`
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Sarabun:wght@300;700&display=swap');
        .circus-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at top,#200010,#0d0005);}
        .tent-stripes{position:absolute;inset:0;background:repeating-linear-gradient(135deg,rgba(220,20,60,.05) 0,rgba(220,20,60,.05) 20px,rgba(255,215,0,.03) 20px,rgba(255,215,0,.03) 40px);pointer-events:none;}
        .trapeze-bar{position:absolute;top:10%;left:20%;right:20%;height:8px;background:linear-gradient(to right,#8B4513,#D4AF37,#8B4513);border-radius:4px;box-shadow:0 3px 10px rgba(0,0,0,.5);}
        .rope-left,.rope-right{position:absolute;top:10%;width:3px;background:rgba(180,130,70,.6);}
        .rope-left{left:20%;height:30%;transform-origin:top center;}
        .rope-right{right:20%;height:30%;transform-origin:top center;}
        .acrobat{position:absolute;font-size:4rem;top:35%;left:50%;transform:translateX(-50%);filter:drop-shadow(0 5px 20px rgba(255,100,0,.5));animation:swing 2s ease-in-out infinite;cursor:pointer;}
        @keyframes swing{0%,100%{transform:translateX(-100%) rotate(-20deg)}50%{transform:translateX(0%) rotate(10deg)}}
        .net{position:absolute;bottom:20%;left:0;right:0;height:40px;background:repeating-linear-gradient(to right,rgba(180,130,70,.3) 0,rgba(180,130,70,.3) 2px,transparent 2px,transparent 20px),repeating-linear-gradient(to bottom,rgba(180,130,70,.3) 0,rgba(180,130,70,.3) 2px,transparent 2px,transparent 20px);}
        .spotlight1,.spotlight2{position:absolute;top:0;width:200px;height:100%;background:radial-gradient(ellipse at top,rgba(255,200,100,.06),transparent 60%);pointer-events:none;}
        .spotlight1{left:10%;}.spotlight2{right:10%;}
        .hint{position:absolute;bottom:10%;width:100%;text-align:center;color:#FFD700;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:2px;animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        .msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:20;padding:40px;text-align:center;background:rgba(13,0,5,.92);}
        .m-head{font-family:'Fredoka One',cursive;font-size:2.8rem;color:#FFD700;text-shadow:0 0 20px rgba(255,215,0,.5);margin-bottom:15px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#f0d0c0;line-height:1.9;max-width:500px;}
        .m-from{font-family:'Fredoka One',cursive;font-size:1.4rem;color:#DC143C;margin-top:20px;}
    </style>
    <div class="circus-scene" id="scene">
        <div class="tent-stripes"></div>
        <div class="spotlight1"></div><div class="spotlight2"></div>
        <div class="trapeze-bar"></div>
        <div class="rope-left"></div><div class="rope-right"></div>
        <div class="acrobat" id="acro">🤸</div>
        <div class="net"></div>
        <div class="hint" id="hint">🎪 แตะนักกายกรรม!</div>
        <div class="msg-box" id="msg">
            <div class="m-head">🎪 ${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)}</div>
        </div>
    </div>`;
    let done=false;
    document.getElementById('acro').addEventListener('click',()=>{
        if(done)return; done=true;
        document.getElementById('hint').style.display='none';
        const a=document.getElementById('acro');
        a.style.animation='none';
        // triple flip
        gsap.to(a,{rotation:1080,scale:0.3,top:'90%',duration:1.5,ease:'power2.in',onComplete:()=>{
            a.style.display='none';
            // boom stars from landing
            const scene=document.getElementById('scene');
            ['⭐','🌟','✨','💫','⭐'].forEach((s,i)=>{
                const el=document.createElement('div');
                el.style.cssText='position:absolute;font-size:2rem;left:50%;bottom:15%;pointer-events:none;';
                el.textContent=s; scene.appendChild(el);
                gsap.to(el,{x:(Math.random()-.5)*300,y:-(Math.random()*200+50),opacity:0,duration:1.2,ease:'power2.out',onComplete:()=>el.remove()});
            });
            setTimeout(()=>{
                gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
                gsap.from('.m-head',{scale:1.8,opacity:0,duration:1,ease:'power3.out'});
            },600);
        }});
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}