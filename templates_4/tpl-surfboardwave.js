export async function render(container, data, config) {
    container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#0c2a4a;";
    document.body.style.cssText="margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    const W=window.innerWidth, H=window.innerHeight;
    container.innerHTML=`
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Sarabun:wght@300;700&display=swap');
        .wave-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:linear-gradient(to bottom,#0c2a4a,#1a5276,#117A65);}
        canvas{position:absolute;inset:0;}
        .surfer{position:absolute;font-size:3.5rem;bottom:28%;left:-15%;filter:drop-shadow(0 5px 15px rgba(0,200,255,.5));}
        .sun{position:absolute;top:8%;right:10%;width:80px;height:80px;background:radial-gradient(#FFF176,#FFC107);border-radius:50%;box-shadow:0 0 40px rgba(255,193,7,.6);}
        .start-btn{position:absolute;bottom:10%;left:50%;transform:translateX(-50%);padding:14px 40px;background:linear-gradient(135deg,#0EA5E9,#06B6D4);border:none;color:#fff;font-family:'Pacifico',cursive;font-size:1.1rem;cursor:pointer;border-radius:30px;box-shadow:0 0 25px rgba(14,165,233,.5);z-index:10;}
        .title{position:absolute;top:8%;left:50%;transform:translateX(-50%);font-family:'Pacifico',cursive;font-size:2rem;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.5);white-space:nowrap;}
        .msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:20;padding:40px;text-align:center;background:rgba(12,42,74,.88);}
        .m-head{font-family:'Pacifico',cursive;font-size:2.5rem;color:#38BDF8;text-shadow:0 0 20px rgba(56,189,248,.6);margin-bottom:15px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#b0d8f8;line-height:1.9;max-width:500px;}
        .m-from{font-family:'Pacifico',cursive;font-size:1.2rem;color:#06B6D4;margin-top:20px;}
    </style>
    <div class="wave-scene" id="scene">
        <div class="sun"></div>
        <div class="title">🏄 Surf's Up!</div>
        <canvas id="cvs"></canvas>
        <div class="surfer" id="surfer">🏄</div>
        <button class="start-btn" id="startBtn">🌊 DROP IN!</button>
        <div class="msg-box" id="msg">
            <div class="m-head">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)}</div>
        </div>
    </div>`;
    const cvs=document.getElementById('cvs'); cvs.width=W; cvs.height=H;
    const ctx=cvs.getContext('2d');
    let t=0, animating=false;
    function drawWaves(){
        ctx.clearRect(0,0,W,H);
        for(let w=0;w<3;w++){
            const offset=w*0.8, alpha=0.3-w*0.08, yBase=H*(0.65+w*0.07);
            ctx.beginPath();
            ctx.moveTo(0,yBase);
            for(let x=0;x<=W;x+=5){
                const y=yBase+Math.sin((x/W*4+t+offset)*Math.PI*2)*30*(1-w*.2);
                ctx.lineTo(x,y);
            }
            ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
            const grad=ctx.createLinearGradient(0,yBase-30,0,H);
            grad.addColorStop(0,`rgba(${30-w*5},${120-w*20},${200-w*30},${alpha+.4})`);
            grad.addColorStop(1,`rgba(10,50,100,.8)`);
            ctx.fillStyle=grad;
            ctx.fill();
            // wave crest foam
            ctx.strokeStyle=`rgba(255,255,255,${alpha})`;
            ctx.lineWidth=2;
            ctx.stroke();
        }
    }
    function loop(){
        t+=0.012; drawWaves();
        if(animating) requestAnimationFrame(loop);
    }
    animating=true; loop();
    let done=false;
    document.getElementById('startBtn').addEventListener('click',()=>{
        if(done)return; done=true;
        document.getElementById('startBtn').style.display='none';
        const s=document.getElementById('surfer');
        gsap.to(s,{left:'110%',bottom:'36%',duration:3,ease:'power1.inOut',onComplete:()=>{
            gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
            gsap.from('.m-head',{y:-40,opacity:0,duration:1,ease:'back.out'});
            animating=false;
        }});
        // bob with wave
        gsap.to(s,{y:-20,duration:0.8,yoyo:true,repeat:8,ease:'sine.inOut'});
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}