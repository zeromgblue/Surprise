export async function render(container,data,config){
container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#000005;";
document.body.style.cssText="margin:0;overflow:hidden;";
await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
const W=window.innerWidth,H=window.innerHeight;
container.innerHTML=`
<style>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
.cosmic-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:#000005;}
canvas{position:absolute;inset:0;cursor:pointer;}
.hint{position:absolute;bottom:10%;width:100%;text-align:center;color:#7C3AED;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:3px;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
.msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:10;padding:40px;text-align:center;background:rgba(0,0,5,.9);}
.m-head{font-family:'Sarabun',sans-serif;font-size:2.5rem;font-weight:700;color:#A78BFA;text-shadow:0 0 25px rgba(167,139,250,.6);margin-bottom:15px;}
.m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#c4b5fd;line-height:1.9;max-width:500px;font-weight:300;}
.m-from{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#6D28D9;margin-top:20px;}
</style>
<div class="cosmic-scene"><canvas id="cvs"></canvas>
<div class="hint" id="hint">🌌 แตะจุดเพื่อสร้างใยจักรวาล</div>
<div class="msg-box" id="msg"><div class="m-head">${escapeHtml(data.receiver)}</div><div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div><div class="m-from">— ${escapeHtml(data.sender)}</div></div>
</div>`;
const cvs=document.getElementById('cvs');cvs.width=W;cvs.height=H;
const ctx=cvs.getContext('2d');
const nodes=Array.from({length:80},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:1.5+Math.random()*2}));
const hueBase=270;
let clicked=false,clickCount=0,rafId;
function draw(){
    ctx.fillStyle='rgba(0,0,5,.12)';ctx.fillRect(0,0,W,H);
    nodes.forEach(n=>{n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>W)n.vx*=-1;if(n.y<0||n.y>H)n.vy*=-1;});
    for(let i=0;i<nodes.length;i++){
        for(let j=i+1;j<nodes.length;j++){
            const d=Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y);
            if(d<120){
                const a=(1-d/120)*(clicked?.6:.25);
                ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);
                ctx.strokeStyle=`hsla(${hueBase+d/2},80%,65%,${a})`;ctx.lineWidth=a*2;ctx.stroke();
            }
        }
        ctx.beginPath();ctx.arc(nodes[i].x,nodes[i].y,nodes[i].r+(clicked?.5:0),0,Math.PI*2);
        ctx.fillStyle=`hsla(${hueBase+i*3},80%,70%,${clicked?.9:.5})`;ctx.fill();
    }
    rafId=requestAnimationFrame(draw);
}
draw();
let done=false;
cvs.addEventListener('click',e=>{
    if(done)return;
    clickCount++;
    // add node at click
    nodes.push({x:e.clientX,y:e.clientY,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,r:3});
    clicked=true;
    if(clickCount>=3&&!done){
        done=true;document.getElementById('hint').style.display='none';
        // speed up nodes
        nodes.forEach(n=>{n.vx*=3;n.vy*=3;});
        setTimeout(()=>{
            cancelAnimationFrame(rafId);
            gsap.to(cvs,{opacity:.3,duration:1.5});
            gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
            gsap.from('.m-head',{scale:.5,opacity:0,duration:1.2,ease:'elastic.out(1,.5)'});
        },1500);
    }
});
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}