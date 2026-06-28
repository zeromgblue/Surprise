export async function render(container,data,config){
container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#000008;";
document.body.style.cssText="margin:0;overflow:hidden;";
await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
const W=window.innerWidth,H=window.innerHeight;
container.innerHTML=`
<style>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
.mandala-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse,#080020,#000008);display:flex;align-items:center;justify-content:center;}
canvas{position:absolute;inset:0;}
.hint{position:absolute;bottom:10%;color:#C084FC;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:3px;animation:pulse 2s infinite;z-index:5;}
@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
.msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:10;padding:40px;text-align:center;background:rgba(0,0,8,.9);}
.m-head{font-family:'Sarabun',sans-serif;font-size:2.5rem;font-weight:700;color:#C084FC;text-shadow:0 0 25px rgba(192,132,252,.6);margin-bottom:15px;}
.m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#e0d0ff;line-height:1.9;max-width:500px;font-weight:300;}
.m-from{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#7C3AED;margin-top:20px;}
</style>
<div class="mandala-scene" id="scene"><canvas id="cvs"></canvas>
<div class="hint" id="hint">✨ แตะจอเพื่อเบ่งแมนดาลา</div>
<div class="msg-box" id="msg"><div class="m-head">${escapeHtml(data.receiver)}</div><div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div><div class="m-from">— ${escapeHtml(data.sender)}</div></div>
</div>`;
const cvs=document.getElementById('cvs');cvs.width=W;cvs.height=H;
const ctx=cvs.getContext('2d');
let angle=0,scale=0,expanding=false,done=false;
const hues=[270,300,240,200,330,260];
function drawMandala(cx,cy,sc,a){
    ctx.clearRect(0,0,W,H);
    ctx.save();ctx.translate(cx,cy);ctx.scale(sc,sc);
    const layers=6,petals=12;
    for(let l=0;l<layers;l++){
        const r=40+l*40,h=hues[l%hues.length];
        ctx.save();ctx.rotate(a+l*.3);
        for(let p=0;p<petals;p++){
            ctx.rotate(Math.PI*2/petals);
            ctx.beginPath();
            ctx.ellipse(r,0,18,8,0,0,Math.PI*2);
            ctx.fillStyle=`hsla(${h},80%,65%,${.6-l*.06})`;
            ctx.fill();
            // inner dot
            ctx.beginPath();ctx.arc(r,0,4,0,Math.PI*2);
            ctx.fillStyle=`hsla(${h+30},100%,85%,.8)`;ctx.fill();
        }
        ctx.restore();
    }
    // center circle
    for(let r=80;r>0;r-=20){
        ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);
        ctx.fillStyle=`hsla(${270+r},70%,${30+r/3}%,${.5-r/200})`;ctx.fill();
    }
    ctx.restore();
}
let rafId;
function animate(){
    angle+=.005;
    if(expanding&&scale<1) scale=Math.min(1,scale+.012);
    drawMandala(W/2,H/2,scale*(Math.min(W,H)/300),angle);
    rafId=requestAnimationFrame(animate);
}
scale=.3;animate();
document.getElementById('scene').addEventListener('click',()=>{
    if(done)return;done=true;
    document.getElementById('hint').style.display='none';
    expanding=true;
    setTimeout(()=>{
        cancelAnimationFrame(rafId);
        gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
        gsap.from('.m-head',{scale:.5,opacity:0,duration:1.2,ease:'elastic.out(1,.5)'});
    },2500);
});
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}