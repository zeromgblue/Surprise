export async function render(container,data,config){
container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#0d0500;";
document.body.style.cssText="margin:0;overflow:hidden;";
await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
const W=window.innerWidth,H=window.innerHeight;
container.innerHTML=`
<style>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
.camp-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at 50% 100%,#1a0800,#0d0500);}
canvas{position:absolute;inset:0;pointer-events:none;}
.ground{position:absolute;bottom:0;left:0;right:0;height:30%;background:linear-gradient(to top,#1a0a00,transparent);}
.log-wrap{position:absolute;bottom:22%;left:50%;transform:translateX(-50%);}
.logs{font-size:3rem;margin-bottom:-10px;}
.fire{font-size:4rem;animation:fire-flicker .2s infinite alternate;cursor:pointer;filter:drop-shadow(0 0 20px rgba(255,100,0,.8));}
@keyframes fire-flicker{0%{transform:scale(1) skewX(-2deg)}100%{transform:scale(1.05) skewX(2deg)}}
.stars-text{position:absolute;top:5%;width:100%;text-align:center;font-size:1.5rem;letter-spacing:10px;opacity:.5;}
.hint{position:absolute;bottom:10%;width:100%;text-align:center;color:#F97316;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:3px;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
.msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:10;padding:40px;text-align:center;background:rgba(13,5,0,.9);}
.m-head{font-family:'Sarabun',sans-serif;font-size:2.5rem;font-weight:700;color:#F97316;text-shadow:0 0 20px rgba(249,115,22,.6);margin-bottom:15px;}
.m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#fed7aa;line-height:1.9;max-width:500px;font-weight:300;}
.m-from{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#EA580C;margin-top:20px;}
</style>
<div class="camp-scene" id="scene">
<canvas id="cvs"></canvas>
<div class="stars-text">⭐ ✦ ⭐ ✦ ⭐ ✦ ⭐</div>
<div class="ground"></div>
<div class="log-wrap"><div class="fire" id="fire">🔥</div><div class="logs">🪵🪵</div></div>
<div class="hint" id="hint">🔥 แตะกองไฟ</div>
<div class="msg-box" id="msg"><div class="m-head">${escapeHtml(data.receiver)}</div><div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div><div class="m-from">— ${escapeHtml(data.sender)}</div></div>
</div>`;
// particle embers
const cvs=document.getElementById('cvs');cvs.width=W;cvs.height=H;
const ctx=cvs.getContext('2d');
const embers=[];
let rafId;
function spawnEmber(){embers.push({x:W/2+(Math.random()-.5)*40,y:H*.75,vx:(Math.random()-.5)*.8,vy:-(1+Math.random()*2),life:1,r:1.5+Math.random()*2.5,h:20+Math.random()*30});}
function drawEmbers(){
    ctx.clearRect(0,0,W,H);
    // ambient glow
    const g=ctx.createRadialGradient(W/2,H*.72,10,W/2,H*.72,180);
    g.addColorStop(0,'rgba(255,100,0,.12)');g.addColorStop(1,'rgba(255,100,0,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    for(let i=embers.length-1;i>=0;i--){
        const e=embers[i];e.x+=e.vx;e.y+=e.vy;e.vy-=.02;e.life-=.012;
        if(e.life<=0){embers.splice(i,1);continue;}
        ctx.beginPath();ctx.arc(e.x,e.y,e.r*e.life,0,Math.PI*2);
        ctx.fillStyle=`hsla(${e.h},100%,60%,${e.life})`;ctx.fill();
    }
    rafId=requestAnimationFrame(drawEmbers);
}
setInterval(spawnEmber,50);
drawEmbers();
let done=false;
document.getElementById('fire').addEventListener('click',()=>{
    if(done)return;done=true;
    document.getElementById('hint').style.display='none';
    gsap.to('#fire',{scale:3,opacity:0,duration:1,ease:'power2.in'});
    // big ember burst
    for(let i=0;i<50;i++) embers.push({x:W/2+(Math.random()-.5)*30,y:H*.72,vx:(Math.random()-.5)*5,vy:-(3+Math.random()*6),life:1,r:3+Math.random()*4,h:10+Math.random()*40});
    setTimeout(()=>{
        cancelAnimationFrame(rafId);
        gsap.to(cvs,{opacity:.4,duration:1});
        gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
        gsap.from('.m-head',{y:30,opacity:0,duration:1,ease:'back.out'});
    },1500);
});
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}