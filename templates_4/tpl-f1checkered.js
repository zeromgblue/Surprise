export async function render(container, data, config) {
    container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#0a0a0a;";
    document.body.style.cssText="margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    const W=window.innerWidth, H=window.innerHeight;
    container.innerHTML=`
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Russo+One&family=Sarabun:wght@300;700&display=swap');
        .f1-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:#0a0a0a;}
        canvas{position:absolute;inset:0;}
        .track-overlay{position:absolute;bottom:0;left:0;right:0;height:120px;background:linear-gradient(to top,#1a1a1a,transparent);}
        .car{position:absolute;font-size:3rem;bottom:60px;left:-10%;filter:drop-shadow(0 0 15px #DC2626);transition:none;}
        .flag{position:absolute;right:10%;top:50%;transform:translateY(-50%);font-size:5rem;opacity:0;filter:drop-shadow(0 0 20px #fff);}
        .start-btn{position:absolute;bottom:12%;left:50%;transform:translateX(-50%);padding:14px 40px;background:linear-gradient(135deg,#DC2626,#FF4444);border:none;color:#fff;font-family:'Russo One',sans-serif;font-size:1.2rem;letter-spacing:3px;cursor:pointer;border-radius:4px;box-shadow:0 0 30px rgba(220,38,38,.5);z-index:10;}
        .title{position:absolute;top:10%;width:100%;text-align:center;font-family:'Russo One',sans-serif;font-size:2.5rem;color:#DC2626;letter-spacing:5px;text-shadow:0 0 30px #DC2626;}
        .msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:20;padding:40px;text-align:center;background:rgba(10,10,10,.92);}
        .m-head{font-family:'Russo One',sans-serif;font-size:3rem;color:#DC2626;text-shadow:0 0 30px #DC2626;letter-spacing:4px;margin-bottom:15px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#f0f0f0;line-height:1.9;max-width:500px;}
        .m-from{font-family:'Russo One',sans-serif;font-size:1rem;color:#888;margin-top:20px;letter-spacing:3px;}
        .checkered{position:absolute;top:0;left:0;right:0;height:40px;background-image:repeating-conic-gradient(#fff 0% 25%,#000 0% 50%);background-size:20px 20px;}
    </style>
    <div class="f1-scene" id="scene">
        <div class="checkered"></div>
        <canvas id="cvs"></canvas>
        <div class="track-overlay"></div>
        <div class="title">🏎️ F1 RACE</div>
        <div class="car" id="car">🏎️</div>
        <div class="flag" id="flag">🏁</div>
        <button class="start-btn" id="startBtn">▶ START RACE</button>
        <div class="msg-box" id="msg">
            <div class="m-head">🏆 ${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)} —</div>
        </div>
    </div>`;
    const cvs=document.getElementById('cvs'); cvs.width=W; cvs.height=H;
    const ctx=cvs.getContext('2d');
    // draw track lines
    function drawTrack(){
        ctx.clearRect(0,0,W,H);
        ctx.fillStyle='#1a1a1a';
        ctx.fillRect(0,H-130,W,130);
        ctx.strokeStyle='#555'; ctx.lineWidth=2; ctx.setLineDash([30,20]);
        ctx.beginPath(); ctx.moveTo(0,H-65); ctx.lineTo(W,H-65); ctx.stroke();
        ctx.setLineDash([]);
        // speed lines
        for(let i=0;i<8;i++){
            const y=H-130+i*18;
            ctx.fillStyle=`rgba(220,38,38,${0.03+i*0.01})`;
            ctx.fillRect(0,y,W,2);
        }
    }
    drawTrack();
    let done=false;
    document.getElementById('startBtn').addEventListener('click',()=>{
        if(done)return; done=true;
        document.getElementById('startBtn').style.display='none';
        const car=document.getElementById('car');
        const flag=document.getElementById('flag');
        // speed line particles
        let frame=0;
        const speedLines=[];
        function animate(){
            ctx.clearRect(0,0,W,H-130);
            drawTrack();
            // speed line particles
            if(frame%3===0) speedLines.push({x:W*.4,y:H-80+Math.random()*30,w:60+Math.random()*80,op:1});
            speedLines.forEach((l,i)=>{l.x-=15;l.op-=0.05;ctx.fillStyle=`rgba(220,38,38,${l.op})`;ctx.fillRect(l.x,l.y,l.w,2);});
            speedLines.splice(0,speedLines.filter(l=>l.op<=0).length);
            frame++;
            if(frame<120) requestAnimationFrame(animate);
        }
        animate();
        // car race
        gsap.to(car,{left:'85%',duration:2.5,ease:'power3.in',onComplete:()=>{
            gsap.to(flag,{opacity:1,scale:1.3,duration:.3,yoyo:true,repeat:3,ease:'power2.inOut'});
            setTimeout(()=>{
                gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
                gsap.from('.m-head',{scale:2,opacity:0,duration:1,ease:'power3.out'});
            },1000);
        }});
        // shake on speed burst
        gsap.to('#scene',{x:5,duration:0.05,yoyo:true,repeat:20,ease:'none',delay:.5});
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}