export async function render(container, data, config) {
    container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#1A0A00;";
    document.body.style.cssText="margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML=`
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Sarabun:wght@300;700&display=swap');
        .puppet-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at top,#3B1E00,#1A0A00);}
        .theater-top{position:absolute;top:0;left:0;right:0;height:80px;background:linear-gradient(to bottom,#8B0000,#6B0000);border-bottom:5px solid #FFD700;display:flex;align-items:center;justify-content:center;}
        .theater-title{font-family:'Fredoka One',cursive;font-size:1.8rem;color:#FFD700;letter-spacing:3px;}
        .curtain-left,.curtain-right{position:absolute;top:80px;width:42%;height:calc(100% - 80px);cursor:pointer;z-index:10;}
        .curtain-left{left:0;background:linear-gradient(to right,#8B0000,#DC143C);transform-origin:left center;}
        .curtain-right{right:0;background:linear-gradient(to left,#8B0000,#DC143C);transform-origin:right center;}
        .cl-fold{position:absolute;right:0;top:0;width:30%;height:100%;background:rgba(0,0,0,.2);}
        .cr-fold{position:absolute;left:0;top:0;width:30%;height:100%;background:rgba(0,0,0,.2);}
        .curtain-fringe{position:absolute;bottom:0;left:0;right:0;height:20px;background:repeating-linear-gradient(to right,#FFD700 0,#FFD700 15px,transparent 15px,transparent 25px);}
        .stage-inner{position:absolute;top:80px;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(ellipse at center,#2a1000,#1A0A00);}
        .puppet-chars{display:flex;gap:40px;margin-bottom:20px;}
        .puppet{font-size:4rem;animation:puppet-bob 1s ease-in-out infinite alternate;}
        .puppet:nth-child(2){animation-delay:-.5s;}
        @keyframes puppet-bob{0%{transform:translateY(0)}100%{transform:translateY(-15px)}}
        .strings{position:absolute;top:90px;left:50%;transform:translateX(-50%);display:flex;gap:80px;}
        .string{width:1px;height:120px;background:rgba(200,150,50,.4);}
        .hint{color:#FFD700;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:2px;margin-top:15px;animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        .msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:20;padding:40px;text-align:center;background:rgba(26,10,0,.92);}
        .m-head{font-family:'Fredoka One',cursive;font-size:2.8rem;color:#FFD700;text-shadow:0 0 20px rgba(255,215,0,.5);margin-bottom:15px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#f0d0a0;line-height:1.9;max-width:500px;}
        .m-from{font-family:'Fredoka One',cursive;font-size:1.4rem;color:#DC143C;margin-top:20px;}
    </style>
    <div class="puppet-scene" id="scene">
        <div class="theater-top"><div class="theater-title">🎭 THE GRAND PUPPET THEATER</div></div>
        <div class="stage-inner">
            <div class="strings"><div class="string"></div><div class="string"></div></div>
            <div class="puppet-chars"><div class="puppet">🎭</div><div class="puppet">🪆</div></div>
            <div class="hint" id="hint">🎭 แตะม่านเพื่อเปิดโรงละคร</div>
        </div>
        <div class="curtain-left" id="cl"><div class="cl-fold"></div><div class="curtain-fringe"></div></div>
        <div class="curtain-right" id="cr"><div class="cr-fold"></div><div class="curtain-fringe"></div></div>
        <div class="msg-box" id="msg">
            <div class="m-head">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)}</div>
        </div>
    </div>`;
    let done=false;
    function openCurtains(){
        if(done)return; done=true;
        document.getElementById('hint').style.display='none';
        gsap.to('#cl',{xPercent:-100,duration:2,ease:'power2.inOut'});
        gsap.to('#cr',{xPercent:100,duration:2,ease:'power2.inOut'});
        setTimeout(()=>{
            gsap.to('.puppet',{scale:1.3,duration:.3,yoyo:true,repeat:3,stagger:.2,ease:'back.out'});
        },1500);
        setTimeout(()=>{
            gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
            gsap.from('.m-head',{y:-30,opacity:0,duration:1,ease:'back.out'});
        },3000);
    }
    document.getElementById('cl').addEventListener('click',openCurtains);
    document.getElementById('cr').addEventListener('click',openCurtains);
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}