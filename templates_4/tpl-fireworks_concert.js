export async function render(container, data, config) {
    container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#050008;";
    document.body.style.cssText="margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    const W=window.innerWidth, H=window.innerHeight;
    container.innerHTML=`
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Sarabun:wght@300;700&display=swap');
        .fw-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:linear-gradient(to bottom,#050008,#150010);}
        canvas{position:absolute;inset:0;}
        .stage{position:absolute;bottom:0;left:0;right:0;height:100px;background:linear-gradient(to top,#200030,transparent);}
        .stage-lights{position:absolute;bottom:100px;left:0;right:0;height:3px;background:repeating-linear-gradient(to right,#FF006E 0,#FF006E 20px,transparent 20px,transparent 40px,#8338EC 40px,#8338EC 60px,transparent 60px,transparent 80px);}
        .crowd{position:absolute;bottom:80px;left:0;right:0;text-align:center;font-size:1.8rem;letter-spacing:5px;}
        .start-btn{position:absolute;bottom:12%;left:50%;transform:translateX(-50%);padding:14px 40px;background:linear-gradient(135deg,#FF006E,#8338EC);border:none;color:#fff;font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:4px;cursor:pointer;border-radius:4px;box-shadow:0 0 30px rgba(255,0,110,.5);z-index:10;}
        .title{position:absolute;top:8%;width:100%;text-align:center;font-family:'Bebas Neue',sans-serif;font-size:3rem;color:#FF006E;letter-spacing:6px;text-shadow:0 0 30px #FF006E,0 0 60px #8338EC;}
        .msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;background:rgba(5,0,8,.88);}
        .m-head{font-family:'Bebas Neue',sans-serif;font-size:3.5rem;color:#FF006E;text-shadow:0 0 30px #FF006E;letter-spacing:5px;margin-bottom:15px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#f0b0ff;line-height:1.9;max-width:500px;}
        .m-from{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;color:#8338EC;margin-top:20px;letter-spacing:3px;}
    </style>
    <div class="fw-scene" id="scene">
        <canvas id="cvs"></canvas>
        <div class="title">🎆 CONCERT NIGHT</div>
        <div class="crowd">🙌🙌🙌🙌🙌🙌🙌</div>
        <div class="stage"></div>
        <div class="stage-lights"></div>
        <button class="start-btn" id="btn">🎆 LAUNCH SHOW!</button>
        <div class="msg-box" id="msg">
            <div class="m-head">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)} —</div>
        </div>
    </div>`;
    const cvs=document.getElementById('cvs'); cvs.width=W; cvs.height=H;
    const ctx=cvs.getContext('2d');
    const particles=[];
    const hues=[0,30,60,120,200,270,300,330];
    function Particle(x,y,h){
        const speed=3+Math.random()*5, angle=Math.random()*Math.PI*2;
        return{x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:1,h,r:3+Math.random()*3};
    }
    function burst(x,y){
        const h=hues[Math.floor(Math.random()*hues.length)];
        for(let i=0;i<60;i++) particles.push(Particle(x,y,h));
    }
    let animating=false;
    function draw(){
        ctx.fillStyle='rgba(5,0,8,.15)'; ctx.fillRect(0,0,W,H);
        for(let i=particles.length-1;i>=0;i--){
            const p=particles[i];
            p.x+=p.vx; p.y+=p.vy; p.vy+=.08; p.life-=.018; p.vx*=.99;
            if(p.life<=0){particles.splice(i,1);continue;}
            ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2);
            ctx.fillStyle=`hsla(${p.h},100%,65%,${p.life})`; ctx.fill();
        }
        if(animating) requestAnimationFrame(draw);
    }
    let done=false;
    document.getElementById('btn').addEventListener('click',()=>{
        if(done)return; done=true;
        document.getElementById('btn').style.display='none';
        animating=true; draw();
        // crowd animate
        gsap.to('.crowd',{y:-10,duration:.15,yoyo:true,repeat:40,ease:'none'});
        // auto fireworks
        let count=0;
        const iv=setInterval(()=>{
            burst(W*.2+Math.random()*W*.6, H*.1+Math.random()*H*.5);
            count++;
            if(count>20){
                clearInterval(iv);
                setTimeout(()=>{
                    animating=false;
                    gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
                    gsap.from('.m-head',{scale:.3,opacity:0,duration:1.2,ease:'elastic.out(1,.4)'});
                },1500);
            }
        },200);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}