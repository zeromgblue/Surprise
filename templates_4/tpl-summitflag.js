export async function render(container, data, config) {
    container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#020617;";
    document.body.style.cssText="margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js');
    const W=window.innerWidth, H=window.innerHeight;
    container.innerHTML=`
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700&family=Sarabun:wght@300;700&display=swap');
        .summit-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:linear-gradient(to bottom,#020617 0%,#0c1445 30%,#1a2a6c 50%);}
        canvas{position:absolute;inset:0;pointer-events:none;}
        .mountain{position:absolute;bottom:0;left:50%;transform:translateX(-50%);}
        .flag{position:absolute;font-size:2.5rem;opacity:0;filter:drop-shadow(0 0 15px rgba(255,215,0,.8));}
        .climber{position:absolute;font-size:2rem;filter:drop-shadow(0 3px 8px rgba(0,0,0,.5));}
        .start-btn{position:absolute;bottom:8%;left:50%;transform:translateX(-50%);padding:14px 40px;background:linear-gradient(135deg,#4169E1,#1E40AF);border:none;color:#fff;font-family:'Oswald',sans-serif;font-size:1.1rem;letter-spacing:3px;cursor:pointer;border-radius:4px;box-shadow:0 0 25px rgba(65,105,225,.5);z-index:10;}
        .stars-txt{position:absolute;top:8%;width:100%;text-align:center;font-family:'Oswald',sans-serif;font-size:1.5rem;color:#a0c0ff;letter-spacing:4px;text-shadow:0 0 15px rgba(100,150,255,.5);}
        .msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:20;padding:40px;text-align:center;background:rgba(2,6,23,.92);}
        .m-head{font-family:'Oswald',sans-serif;font-size:3rem;color:#FFD700;text-shadow:0 0 25px rgba(255,215,0,.7);letter-spacing:3px;margin-bottom:15px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#c0d0f0;line-height:1.9;max-width:500px;}
        .m-from{font-family:'Oswald',sans-serif;font-size:1.1rem;color:#4169E1;margin-top:20px;letter-spacing:2px;}
    </style>
    <div class="summit-scene" id="scene">
        <canvas id="cvs"></canvas>
        <div class="stars-txt">⛰️ SUMMIT CHALLENGE</div>
        <svg style="position:absolute;bottom:0;left:0;width:100%;height:70%" viewBox="0 0 800 500" preserveAspectRatio="xMidYMax meet">
            <polygon points="400,20 100,500 700,500" fill="url(#mtnGrad)"/>
            <polygon points="200,180 0,500 400,500" fill="url(#mtnGrad2)"/>
            <polygon points="600,220 400,500 800,500" fill="url(#mtnGrad2)"/>
            <defs>
                <linearGradient id="mtnGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8e8e8"/><stop offset="30%" stop-color="#c0c8d0"/><stop offset="100%" stop-color="#4a5568"/></linearGradient>
                <linearGradient id="mtnGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b0b8c0"/><stop offset="100%" stop-color="#2d3748"/></linearGradient>
            </defs>
        </svg>
        <div class="flag" id="flag" style="left:calc(50% - 12px);bottom:calc(30% + 180px);">🚩</div>
        <div class="climber" id="climber" style="left:calc(50% - 16px);bottom:10%;">🧗</div>
        <button class="start-btn" id="btn">⛰️ SUMMIT!</button>
        <div class="msg-box" id="msg">
            <div class="m-head">🏔️ ${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)} —</div>
        </div>
    </div>`;
    // draw stars
    const cvs=document.getElementById('cvs'); cvs.width=W; cvs.height=H;
    const ctx=cvs.getContext('2d');
    for(let i=0;i<100;i++){ctx.beginPath();ctx.arc(Math.random()*W,Math.random()*H*.5,Math.random()*1.5,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,'+(0.3+Math.random()*.7)+')';ctx.fill();}
    let done=false;
    document.getElementById('btn').addEventListener('click',()=>{
        if(done)return; done=true;
        document.getElementById('btn').style.display='none';
        const climber=document.getElementById('climber');
        const flag=document.getElementById('flag');
        const bH=parseFloat(getComputedStyle(climber).bottom);
        const targetB=parseFloat(getComputedStyle(flag).bottom)+30;
        // wobble climb
        gsap.to(climber,{bottom:targetB+'px',duration:3,ease:'power1.inOut'});
        gsap.to(climber,{x:5,duration:.2,yoyo:true,repeat:30,ease:'none'});
        setTimeout(()=>{
            gsap.to(flag,{opacity:1,duration:.5,ease:'back.out'});
            gsap.to(flag,{rotation:10,duration:.3,yoyo:true,repeat:8,ease:'sine.inOut'});
            confetti({particleCount:150,spread:60,origin:{x:.5,y:.35},colors:['#FFD700','#fff','#4169E1']});
            setTimeout(()=>{
                gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
                gsap.from('.m-head',{y:-40,opacity:0,duration:1,ease:'back.out'});
            },1000);
        },3200);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}