export async function render(container,data,config){
container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#0A0200;";
document.body.style.cssText="margin:0;overflow:hidden;";
await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
const W=window.innerWidth,H=window.innerHeight;
container.innerHTML=`
<style>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
.sun-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse,#1a0800,#0A0200);display:flex;align-items:center;justify-content:center;cursor:pointer;}
canvas{position:absolute;inset:0;}
.sun-center{position:relative;z-index:5;animation:sun-pulse 2s ease-in-out infinite;}
.sun-emoji{font-size:6rem;filter:drop-shadow(0 0 30px rgba(250,204,21,.6));}
@keyframes sun-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
.hint{position:absolute;bottom:10%;width:100%;text-align:center;color:#FACC15;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:3px;animation:pulse 2s infinite;z-index:5;}
@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
.msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:10;padding:40px;text-align:center;background:rgba(10,2,0,.9);}
.m-head{font-family:'Sarabun',sans-serif;font-size:2.5rem;font-weight:700;color:#FACC15;text-shadow:0 0 25px rgba(250,204,21,.6);margin-bottom:15px;}
.m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#fef08a;line-height:1.9;max-width:500px;font-weight:300;}
.m-from{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#CA8A04;margin-top:20px;}
</style>
<div class="sun-scene" id="scene"><canvas id="cvs"></canvas>
<div class="sun-center"><div class="sun-emoji" id="sun">☀️</div></div>
<div class="hint" id="hint">☀️ แตะดวงอาทิตย์</div>
<div class="msg-box" id="msg"><div class="m-head">${escapeHtml(data.receiver)}</div><div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div><div class="m-from">— ${escapeHtml(data.sender)}</div></div>
</div>`;
const cvs=document.getElementById('cvs');cvs.width=W;cvs.height=H;
const ctx=cvs.getContext('2d');
let t=0,rafId;
function draw(){
    ctx.clearRect(0,0,W,H);
    // spiral rays
    for(let i=0;i<200;i++){
        const a=i*.3+t,r=20+i*1.8;
        const x=W/2+Math.cos(a)*r,y=H/2+Math.sin(a)*r;
        const alpha=Math.max(0,1-r/(Math.min(W,H)*.45));
        ctx.beginPath();ctx.arc(x,y,2+i*.005,0,Math.PI*2);
        ctx.fillStyle=`hsla(${30+i*.5},100%,60%,${alpha})`;ctx.fill();
    }
    t+=.02;
    rafId=requestAnimationFrame(draw);
}
draw();
let done=false;
document.getElementById('scene').addEventListener('click',()=>{
    if(done)return;done=true;
    document.getElementById('hint').style.display='none';
    gsap.to('#sun',{scale:5,opacity:0,duration:1.5,ease:'power3.in'});
    gsap.to(cvs,{filter:'brightness(3)',duration:.3,yoyo:true,repeat:2,ease:'none',delay:.5});
    setTimeout(()=>{
        cancelAnimationFrame(rafId);
        gsap.to(cvs,{opacity:.3,duration:1});
        gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
        gsap.from('.m-head',{scale:2,opacity:0,duration:1,ease:'power3.out'});
    },1500);
});
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}