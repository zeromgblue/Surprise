export async function render(container,data,config){
container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#000a0a;";
document.body.style.cssText="margin:0;overflow:hidden;";
await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
const W=window.innerWidth,H=window.innerHeight;
container.innerHTML=`
<style>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
.chakra-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse,#0a0020,#000a0a);display:flex;align-items:center;justify-content:center;cursor:pointer;}
canvas{position:absolute;inset:0;pointer-events:none;}
.chakra-center{position:relative;z-index:5;}
.chakra-icon{font-size:5rem;animation:chakra-spin 4s linear infinite;filter:drop-shadow(0 0 20px rgba(255,100,100,.5));}
@keyframes chakra-spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
.hint{position:absolute;bottom:10%;width:100%;text-align:center;color:#F59E0B;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:3px;animation:pulse 2s infinite;z-index:5;}
@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
.msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:10;padding:40px;text-align:center;background:rgba(0,10,10,.9);}
.m-head{font-family:'Sarabun',sans-serif;font-size:2.5rem;font-weight:700;color:#F59E0B;text-shadow:0 0 25px rgba(245,158,11,.6);margin-bottom:15px;}
.m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#fde68a;line-height:1.9;max-width:500px;font-weight:300;}
.m-from{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#D97706;margin-top:20px;}
</style>
<div class="chakra-scene" id="scene">
<canvas id="cvs"></canvas>
<div class="chakra-center"><div class="chakra-icon" id="icon">☯️</div></div>
<div class="hint" id="hint">☯️ แตะพลังงานชักรา</div>
<div class="msg-box" id="msg"><div class="m-head">${escapeHtml(data.receiver)}</div><div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div><div class="m-from">— ${escapeHtml(data.sender)}</div></div>
</div>`;
const cvs=document.getElementById('cvs');cvs.width=W;cvs.height=H;
const ctx=cvs.getContext('2d');
const chakraColors=['#EF4444','#F97316','#FACC15','#4ADE80','#3B82F6','#8B5CF6','#EC4899'];
let t=0,rafId;
function draw(){
    ctx.clearRect(0,0,W,H);
    chakraColors.forEach((c,i)=>{
        const r=40+i*30,a=t+i*.5;
        // rotating ring
        ctx.beginPath();ctx.arc(W/2,H/2,r,0,Math.PI*2);
        ctx.strokeStyle=c+'66';ctx.lineWidth=2;ctx.stroke();
        // orbiting dot
        const dx=Math.cos(a*(i%2===0?1:-1))*r,dy=Math.sin(a*(i%2===0?1:-1))*r;
        ctx.beginPath();ctx.arc(W/2+dx,H/2+dy,5,0,Math.PI*2);
        ctx.fillStyle=c;ctx.fill();
        // glow
        const gd=ctx.createRadialGradient(W/2+dx,H/2+dy,0,W/2+dx,H/2+dy,15);
        gd.addColorStop(0,c+'88');gd.addColorStop(1,c+'00');
        ctx.fillStyle=gd;ctx.beginPath();ctx.arc(W/2+dx,H/2+dy,15,0,Math.PI*2);ctx.fill();
    });
    t+=.02;
    rafId=requestAnimationFrame(draw);
}
draw();
let done=false;
document.getElementById('scene').addEventListener('click',()=>{
    if(done)return;done=true;
    document.getElementById('hint').style.display='none';
    // speed up and expand
    const icon=document.getElementById('icon');
    gsap.to(icon,{scale:3,opacity:0,rotation:1080,duration:1.5,ease:'power2.in'});
    // energy burst on canvas
    for(let i=0;i<chakraColors.length;i++){
        setTimeout(()=>{
            const r=100+i*40;
            ctx.beginPath();ctx.arc(W/2,H/2,r,0,Math.PI*2);
            ctx.strokeStyle=chakraColors[i]+'cc';ctx.lineWidth=4;ctx.stroke();
        },i*80);
    }
    setTimeout(()=>{
        cancelAnimationFrame(rafId);
        gsap.to(cvs,{opacity:.3,duration:1});
        gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
        gsap.from('.m-head',{scale:.5,opacity:0,duration:1,ease:'elastic.out(1,.5)'});
    },1800);
});
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}