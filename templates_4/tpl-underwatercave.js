export async function render(container,data,config){
container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#001a2e;";
document.body.style.cssText="margin:0;overflow:hidden;";
await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
const W=window.innerWidth,H=window.innerHeight;
container.innerHTML=`
<style>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
.uw-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at 50% 0%,#003d6b,#001a2e);}
canvas{position:absolute;inset:0;pointer-events:none;}
.cave-opening{position:absolute;top:0;left:0;right:0;height:200px;background:radial-gradient(ellipse at 50% 0%,rgba(0,100,200,.3),transparent);cursor:pointer;}
.diver{position:absolute;font-size:4rem;left:50%;top:15%;transform:translateX(-50%);filter:drop-shadow(0 5px 15px rgba(0,200,255,.4));animation:swim 3s ease-in-out infinite;cursor:pointer;}
@keyframes swim{0%,100%{transform:translateX(-50%) rotate(-5deg)}50%{transform:translateX(-50%) rotate(5deg)}}
.coral{position:absolute;bottom:0;left:0;right:0;text-align:center;font-size:2.5rem;letter-spacing:8px;opacity:.6;}
.hint{position:absolute;bottom:10%;width:100%;text-align:center;color:#0EA5E9;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:3px;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
.msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:10;padding:40px;text-align:center;background:rgba(0,26,46,.9);}
.m-head{font-family:'Sarabun',sans-serif;font-size:2.5rem;font-weight:700;color:#38BDF8;text-shadow:0 0 20px rgba(56,189,248,.6);margin-bottom:15px;}
.m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#bae6fd;line-height:1.9;max-width:500px;font-weight:300;}
.m-from{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#0284C7;margin-top:20px;}
</style>
<div class="uw-scene" id="scene">
<canvas id="cvs"></canvas>
<div class="coral">🐠🪸🐡🦑🐙🪸🐠</div>
<div class="diver" id="diver">🤿</div>
<div class="hint" id="hint">🤿 แตะนักดำน้ำ</div>
<div class="msg-box" id="msg"><div class="m-head">${escapeHtml(data.receiver)}</div><div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div><div class="m-from">— ${escapeHtml(data.sender)}</div></div>
</div>`;
const cvs=document.getElementById('cvs');cvs.width=W;cvs.height=H;
const ctx=cvs.getContext('2d');
const bubbles=[];
function spawnBubble(){bubbles.push({x:W*.3+Math.random()*W*.4,y:H+20,r:3+Math.random()*8,vy:0.5+Math.random()*1.5,life:1});}
let rafId;
function draw(){
    ctx.clearRect(0,0,W,H);
    // caustic light
    for(let i=0;i<5;i++){
        const x=W*(.1+i*.2),bSize=60+Math.sin(Date.now()*.001+i)*20;
        const g=ctx.createRadialGradient(x,100,0,x,100,bSize);
        g.addColorStop(0,'rgba(0,150,255,.05)');g.addColorStop(1,'rgba(0,150,255,0)');
        ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    }
    for(let i=bubbles.length-1;i>=0;i--){
        const b=bubbles[i];b.y-=b.vy;b.life-=.003;
        if(b.y<-20||b.life<=0){bubbles.splice(i,1);continue;}
        ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(100,200,255,${b.life*.4})`;ctx.lineWidth=1.5;ctx.stroke();
        ctx.fillStyle=`rgba(200,240,255,${b.life*.05})`;ctx.fill();
    }
    rafId=requestAnimationFrame(draw);
}
setInterval(spawnBubble,300);draw();
let done=false;
document.getElementById('diver').addEventListener('click',()=>{
    if(done)return;done=true;
    document.getElementById('hint').style.display='none';
    const d=document.getElementById('diver');
    d.style.animation='none';
    gsap.to(d,{top:'80%',duration:2,ease:'power2.inOut'});
    for(let i=0;i<20;i++) bubbles.push({x:W/2+(Math.random()-.5)*50,y:H*.2,r:4+Math.random()*6,vy:2+Math.random()*2,life:1});
    setTimeout(()=>{
        cancelAnimationFrame(rafId);
        gsap.to(cvs,{opacity:.5,duration:1});
        gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
        gsap.from('.m-head',{y:30,opacity:0,duration:1,ease:'back.out'});
    },2000);
});
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}