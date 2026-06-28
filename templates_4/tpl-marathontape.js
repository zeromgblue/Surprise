export async function render(container, data, config) {
    container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#1a0a00;";
    document.body.style.cssText="margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js');
    const W=window.innerWidth;
    container.innerHTML=`
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700&family=Sarabun:wght@300;700&display=swap');
        .marathon-scene{position:relative;width:100vw;height:100vh;background:linear-gradient(to bottom,#87CEEB,#98FB98,#228B22 70%,#1a6b1a);overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;}
        .road{position:absolute;bottom:0;left:0;right:0;height:35%;background:linear-gradient(to top,#555,#666);clip-path:polygon(0 100%,0 0,100% 0,100% 100%);}
        .road-line{position:absolute;bottom:18%;left:0;right:0;height:8px;background:repeating-linear-gradient(to right,#fff 0,#fff 40px,transparent 40px,transparent 80px);}
        .finish-tape{position:absolute;right:12%;top:35%;height:60%;width:10px;background:repeating-linear-gradient(to bottom,#DC2626 0,#DC2626 20px,#fff 20px,#fff 40px);border-radius:2px;}
        .finish-tape2{position:absolute;right:14%;top:35%;height:60%;width:10px;background:repeating-linear-gradient(to bottom,#DC2626 0,#DC2626 20px,#fff 20px,#fff 40px);border-radius:2px;}
        .tape-line{position:absolute;right:12%;top:55%;height:6px;width:3%;background:linear-gradient(to right,#DC2626,#fff,#DC2626);box-shadow:0 0 10px rgba(220,38,38,.5);}
        .runner{position:absolute;bottom:28%;left:-10%;font-size:3rem;filter:drop-shadow(0 5px 10px rgba(0,0,0,.3));}
        .start-btn{padding:14px 40px;background:linear-gradient(135deg,#DC2626,#EF4444);border:none;color:#fff;font-family:'Oswald',sans-serif;font-size:1.2rem;letter-spacing:3px;cursor:pointer;border-radius:4px;box-shadow:0 0 25px rgba(220,38,38,.5);position:relative;z-index:10;}
        .crowd{position:absolute;bottom:35%;left:0;right:20%;display:flex;gap:5px;font-size:1.5rem;}
        .msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:20;padding:40px;text-align:center;background:rgba(26,10,0,.9);}
        .m-head{font-family:'Oswald',sans-serif;font-size:3rem;color:#EF4444;text-shadow:0 0 20px rgba(239,68,68,.6);letter-spacing:3px;margin-bottom:15px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#f0d8c0;line-height:1.9;max-width:500px;}
        .m-from{font-family:'Oswald',sans-serif;font-size:1.1rem;color:#DC2626;margin-top:20px;letter-spacing:2px;}
    </style>
    <div class="marathon-scene" id="scene">
        <div class="road"></div><div class="road-line"></div>
        <div class="finish-tape"></div><div class="finish-tape2"></div>
        <div class="tape-line"></div>
        <div class="crowd" id="crowd">🧍🧍🧍🧍🧍🧍🧍🧍🧍🧍🧍</div>
        <div class="runner" id="runner">🏃</div>
        <button class="start-btn" id="btn">🏃 START RACE!</button>
        <div class="msg-box" id="msg">
            <div class="m-head">🏅 ${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)} —</div>
        </div>
    </div>`;
    let done=false;
    document.getElementById('btn').addEventListener('click',()=>{
        if(done)return; done=true;
        document.getElementById('btn').style.display='none';
        // crowd cheering
        gsap.to('#crowd',{y:-10,duration:.2,yoyo:true,repeat:20,ease:'none'});
        // runner speeds across
        gsap.to('#runner',{left:'90%',duration:3,ease:'power2.in',onComplete:()=>{
            confetti({particleCount:200,spread:120,origin:{x:.85,y:.5},colors:['#DC2626','#fff','#FFD700','#4169E1']});
            setTimeout(()=>{
                gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
                gsap.from('.m-head',{scale:.5,opacity:0,duration:1,ease:'elastic.out(1,.5)'});
            },800);
        }});
        // bouncing animation
        gsap.to('#runner',{y:-15,duration:.25,yoyo:true,repeat:25,ease:'power2.out'});
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}