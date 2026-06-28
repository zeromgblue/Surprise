export async function render(container,data,config){
container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#000008;";
document.body.style.cssText="margin:0;overflow:hidden;";
await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
const W=window.innerWidth,H=window.innerHeight;
container.innerHTML=`
<style>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
.geo-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:#000008;display:flex;align-items:center;justify-content:center;cursor:pointer;}
canvas{position:absolute;inset:0;}
.hint{position:absolute;bottom:10%;color:#F59E0B;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:3px;animation:pulse 2s infinite;z-index:5;}
@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
.msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:10;padding:40px;text-align:center;background:rgba(0,0,8,.9);}
.m-head{font-family:'Sarabun',sans-serif;font-size:2.5rem;font-weight:700;color:#FBBF24;text-shadow:0 0 25px rgba(251,191,36,.6);margin-bottom:15px;}
.m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#fde68a;line-height:1.9;max-width:500px;font-weight:300;}
.m-from{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#D97706;margin-top:20px;}
</style>
<div class="geo-scene" id="scene"><canvas id="cvs"></canvas>
<div class="hint" id="hint">⭐ แตะเพื่อสร้างเรขาคณิตศักดิ์สิทธิ์</div>
<div class="msg-box" id="msg"><div class="m-head">${escapeHtml(data.receiver)}</div><div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div><div class="m-from">— ${escapeHtml(data.sender)}</div></div>
</div>`;
const cvs=document.getElementById('cvs');cvs.width=W;cvs.height=H;
const ctx=cvs.getContext('2d');
const cx=W/2,cy=H/2;
let progress=0,animating=false,rafId;
function polygon(x,y,r,sides,a=0,color='#F59E0B',alpha=1){
    ctx.beginPath();
    for(let i=0;i<=sides;i++){const ang=a+i/sides*Math.PI*2;ctx.lineTo(x+Math.cos(ang)*r,y+Math.sin(ang)*r);}
    ctx.strokeStyle=color+(Math.round(alpha*255).toString(16).padStart(2,'0'));ctx.lineWidth=1.5;ctx.stroke();
}
function drawFrame(p){
    ctx.clearRect(0,0,W,H);
    // flower of life circles
    const r=60*p;
    ctx.globalAlpha=p*.8;
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;polygon(cx+Math.cos(a)*r,cy+Math.sin(a)*r,r,60,0,'#F59E0B',.4);}
    polygon(cx,cy,r,60,0,'#F59E0B',.4);
    // Sri yantra triangles
    for(let i=0;i<5;i++){polygon(cx,cy,(40+i*30)*p,3,i*.2,'#F59E0B',.6-i*.05);}
    for(let i=0;i<4;i++){polygon(cx,cy,(50+i*30)*p,3,i*.2+Math.PI,'#EC4899',.5-i*.05);}
    // Metatron's cube
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;for(let j=0;j<6;j++){const b=j/6*Math.PI*2;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*120*p,cy+Math.sin(a)*120*p);ctx.lineTo(cx+Math.cos(b)*120*p,cy+Math.sin(b)*120*p);ctx.strokeStyle=`rgba(100,150,255,${.2*p})`;ctx.lineWidth=.5;ctx.stroke();}}
    ctx.globalAlpha=1;
}
drawFrame(.3);
let done=false;
document.getElementById('scene').addEventListener('click',()=>{
    if(done)return;done=true;
    document.getElementById('hint').style.display='none';
    animating=true;
    function animate(){
        if(progress<1){progress=Math.min(1,progress+.008);drawFrame(progress);rafId=requestAnimationFrame(animate);}
        else{setTimeout(()=>{gsap.to(cvs,{opacity:.4,duration:1});gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});gsap.from('.m-head',{scale:.5,opacity:0,duration:1.2,ease:'elastic.out(1,.5)'},'-=1');},500);}
    }
    animate();
});
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}