export async function render(container, data, config) {
    container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#0f0800;";
    document.body.style.cssText="margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    const W=window.innerWidth, H=window.innerHeight;
    container.innerHTML=`
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Sarabun:wght@300;700&display=swap');
        .bball-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at top,#1a0a00,#0f0800);display:flex;flex-direction:column;align-items:center;justify-content:center;}
        canvas{position:absolute;inset:0;pointer-events:none;}
        .court-bg{position:absolute;bottom:0;left:0;right:0;height:200px;background:linear-gradient(to top,#8B4513,#A0522D);border-top:4px solid #fff;}
        .hoop-wrap{position:absolute;top:15%;left:50%;transform:translateX(-50%);}
        .backboard{width:140px;height:90px;background:#fff;border:3px solid #ccc;border-radius:4px;margin:0 auto;display:flex;align-items:center;justify-content:center;}
        .backboard-inner{width:60px;height:40px;border:3px solid #DC2626;}
        .hoop{width:90px;height:12px;background:transparent;border:6px solid #FF4500;border-radius:50%;margin:0 auto;box-shadow:0 0 15px rgba(255,69,0,.6);}
        .net{width:90px;margin:0 auto;height:50px;background:linear-gradient(to bottom,transparent,rgba(255,255,255,.15));clip-path:polygon(5% 0%,95% 0%,80% 100%,20% 100%);border:1px solid rgba(255,255,255,.3);}
        .ball{position:absolute;font-size:3rem;cursor:pointer;left:50%;bottom:15%;transform:translateX(-50%);filter:drop-shadow(0 5px 10px rgba(255,100,0,.5));}
        .shoot-hint{position:absolute;bottom:8%;width:100%;text-align:center;color:#FF8C00;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:2px;animation:pulse 1.5s infinite;}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        .score{position:absolute;top:5%;left:50%;transform:translateX(-50%);font-family:'Bebas Neue',sans-serif;font-size:4rem;color:#FF8C00;text-shadow:0 0 20px #FF8C00;opacity:0;}
        .msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:20;padding:40px;text-align:center;background:rgba(15,8,0,.92);}
        .m-head{font-family:'Bebas Neue',sans-serif;font-size:3.5rem;color:#FF8C00;text-shadow:0 0 25px #FF8C00;letter-spacing:4px;margin-bottom:15px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#f0e0c0;line-height:1.9;max-width:500px;}
        .m-from{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;color:#FF4500;margin-top:20px;letter-spacing:3px;}
    </style>
    <div class="bball-scene" id="scene">
        <canvas id="cvs"></canvas>
        <div class="court-bg"></div>
        <div class="hoop-wrap">
            <div class="backboard"><div class="backboard-inner"></div></div>
            <div class="hoop"></div>
            <div class="net"></div>
        </div>
        <div class="ball" id="ball">🏀</div>
        <div class="shoot-hint" id="hint">🏀 แตะบอลเพื่อยิงประตู!</div>
        <div class="score" id="score">SCORE!</div>
        <div class="msg-box" id="msg">
            <div class="m-head">🏆 ${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)} —</div>
        </div>
    </div>`;
    const cvs=document.getElementById('cvs'); cvs.width=W; cvs.height=H;
    const ctx=cvs.getContext('2d');
    let done=false;
    document.getElementById('ball').addEventListener('click',()=>{
        if(done)return; done=true;
        document.getElementById('hint').style.display='none';
        const ball=document.getElementById('ball');
        const hoopY=H*.22;
        // arc shot
        gsap.to(ball,{bottom:'78%',left:'50%',duration:0.6,ease:'power2.out'});
        gsap.to(ball,{fontSize:'1.8rem',duration:0.6,ease:'power2.out'});
        gsap.to(ball,{rotation:720,duration:0.6,ease:'none'});
        setTimeout(()=>{
            // net bounce
            gsap.to(ball,{bottom:'65%',duration:.2,ease:'bounce.out'});
            // score flash
            const score=document.getElementById('score');
            gsap.to(score,{opacity:1,scale:1.3,duration:.3,ease:'back.out',onComplete:()=>{
                gsap.to(score,{opacity:0,duration:.5,delay:.5});
            }});
            // particles burst
            for(let i=0;i<30;i++){
                const p=document.createElement('div');
                p.style.cssText='position:absolute;width:8px;height:8px;border-radius:50%;background:#FF8C00;left:50%;top:25%;pointer-events:none;';
                document.getElementById('scene').appendChild(p);
                gsap.to(p,{x:(Math.random()-.5)*300,y:(Math.random()-.5)*200,opacity:0,duration:1.2,ease:'power2.out',onComplete:()=>p.remove()});
            }
            setTimeout(()=>{
                gsap.to(ball,{opacity:0,duration:.3});
                gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5,delay:.3});
                gsap.from('.m-head',{y:-50,opacity:0,duration:1,delay:.5,ease:'back.out(1.7)'});
            },1200);
        },700);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}