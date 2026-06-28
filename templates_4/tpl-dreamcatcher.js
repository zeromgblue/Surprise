export async function render(container,data,config){
container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#0a0500;";
document.body.style.cssText="margin:0;overflow:hidden;";
await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
const W=window.innerWidth,H=window.innerHeight;
container.innerHTML=`
<style>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
.dc-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at top,#1a0a00,#0a0500);display:flex;flex-direction:column;align-items:center;justify-content:center;}
canvas{position:absolute;inset:0;pointer-events:none;}
.catcher{position:relative;cursor:pointer;z-index:5;display:flex;flex-direction:column;align-items:center;}
.ring{width:160px;height:160px;border-radius:50%;border:4px solid #D97706;box-shadow:0 0 20px rgba(217,119,6,.4),inset 0 0 20px rgba(217,119,6,.1);display:flex;align-items:center;justify-content:center;animation:sway 4s ease-in-out infinite;}
@keyframes sway{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
.web-center{font-size:3rem;filter:drop-shadow(0 0 10px rgba(217,119,6,.6));}
.feathers{display:flex;gap:20px;margin-top:-5px;}
.feather{font-size:1.8rem;animation:feather-float 3s ease-in-out infinite;}
.feather:nth-child(2){animation-delay:-.5s;font-size:2.2rem;}
.feather:nth-child(3){animation-delay:-1s;}
@keyframes feather-float{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(8px) rotate(3deg)}}
.hint{color:#D97706;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:3px;margin-top:20px;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
.msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:10;padding:40px;text-align:center;background:rgba(10,5,0,.9);}
.m-head{font-family:'Sarabun',sans-serif;font-size:2.5rem;font-weight:700;color:#F59E0B;text-shadow:0 0 20px rgba(245,158,11,.5);margin-bottom:15px;}
.m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#fde68a;line-height:1.9;max-width:500px;font-weight:300;}
.m-from{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#D97706;margin-top:20px;}
</style>
<div class="dc-scene" id="scene">
<canvas id="cvs"></canvas>
<div class="catcher" id="catcher">
<div class="ring"><div class="web-center">🕸️</div></div>
<div class="feathers"><div class="feather">🪶</div><div class="feather">🪶</div><div class="feather">🪶</div></div>
</div>
<div class="hint" id="hint">🌙 แตะดรีมแคตเชอร์</div>
<div class="msg-box" id="msg"><div class="m-head">${escapeHtml(data.receiver)}</div><div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div><div class="m-from">— ${escapeHtml(data.sender)}</div></div>
</div>`;
// draw stars
const cvs=document.getElementById('cvs');cvs.width=W;cvs.height=H;
const ctx=cvs.getContext('2d');
for(let i=0;i<100;i++){ctx.beginPath();ctx.arc(Math.random()*W,Math.random()*H,Math.random()*1.2,0,Math.PI*2);ctx.fillStyle=`rgba(255,220,150,${.2+Math.random()*.5})`;ctx.fill();}
let done=false;
document.getElementById('catcher').addEventListener('click',()=>{
    if(done)return;done=true;
    document.getElementById('hint').style.display='none';
    const c=document.getElementById('catcher');
    c.style.animation='none';
    gsap.to('.ring',{rotation:720,scale:2,opacity:0,duration:1.5,ease:'power2.in'});
    gsap.to('.feathers',{y:200,opacity:0,duration:1,delay:.3});
    // star dust
    for(let i=0;i<40;i++){
        const p=document.createElement('div');
        p.style.cssText='position:absolute;font-size:1rem;left:50%;top:45%;pointer-events:none;z-index:6;';
        p.textContent=['✨','⭐','🌟','💫','✦'][i%5];
        document.getElementById('scene').appendChild(p);
        gsap.to(p,{x:(Math.random()-.5)*W*.8,y:(Math.random()-.5)*H*.8,opacity:0,duration:1.8,ease:'power2.out',onComplete:()=>p.remove()});
    }
    setTimeout(()=>{
        gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
        gsap.from('.m-head',{y:-40,opacity:0,duration:1,ease:'back.out'});
    },1200);
});
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}