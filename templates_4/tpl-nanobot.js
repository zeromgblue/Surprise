export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#000A05;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Courier New',monospace;}
        canvas{position:absolute;inset:0;}
        .click-hint{position:absolute;bottom:6%;left:50%;transform:translateX(-50%);color:rgba(0,255,100,0.7);font-size:13px;letter-spacing:4px;animation:nbpulse 2s ease-in-out infinite;pointer-events:none;}
        @keyframes nbpulse{0%,100%{opacity:0.3;}50%{opacity:1;}}
        .message-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;padding:40px;background:rgba(0,10,5,0.9);}
        .msg-receiver{font-size:3em;color:#00FF66;text-shadow:0 0 20px #00FF44;margin-bottom:20px;letter-spacing:5px;}
        .msg-body{font-size:1.1em;color:#A0FFB0;max-width:580px;text-align:center;line-height:1.9;margin-bottom:28px;}
        .msg-sender{font-size:1em;color:#00CC44;letter-spacing:4px;}
    </style>
    <div class="scene" id="nanobotScene">
        <canvas id="nanobotCanvas"></canvas>
        <div class="click-hint" id="clickHint">[ CLICK TO ASSEMBLE ]</div>
        <div class="message-panel" id="msgPanel">
            <div class="msg-receiver">${r}</div>
            <div class="msg-body">${m}</div>
            <div class="msg-sender">— ${s} —</div>
        </div>
    </div>`;

    const canvas = document.getElementById('nanobotCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const PARTICLE_COUNT = 300;
    const particles = [];
    let assembling = false, assembled = false;
    let targetPositions = [];

    // Create target letter positions from receiver name
    function getLetterTargets(text){
        const offscreen = document.createElement('canvas');
        offscreen.width = canvas.width;
        offscreen.height = canvas.height;
        const oc = offscreen.getContext('2d');
        const fontSize = Math.min(80, canvas.width/text.length*1.2);
        oc.font = `bold ${fontSize}px Courier New`;
        oc.fillStyle = '#fff';
        oc.textAlign = 'center';
        oc.textBaseline = 'middle';
        oc.fillText(text, canvas.width/2, canvas.height/2);
        const pixels = oc.getImageData(0,0,canvas.width,canvas.height).data;
        const pts=[];
        for(let y=0;y<canvas.height;y+=4){
            for(let x=0;x<canvas.width;x+=4){
                if(pixels[(y*canvas.width+x)*4+3]>128) pts.push({x,y});
            }
        }
        return pts.sort(()=>Math.random()-0.5).slice(0,PARTICLE_COUNT);
    }

    // Init random particles
    for(let i=0;i<PARTICLE_COUNT;i++){
        particles.push({
            x:Math.random()*canvas.width,
            y:Math.random()*canvas.height,
            vx:(Math.random()-0.5)*1.5,
            vy:(Math.random()-0.5)*1.5,
            r:1+Math.random()*2,
            tx:0,ty:0,
            color:`hsl(${120+Math.random()*40},100%,${50+Math.random()*30}%)`
        });
    }

    function animate(){
        if(assembled) return;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle='rgba(0,10,5,0.15)';
        ctx.fillRect(0,0,canvas.width,canvas.height);

        particles.forEach((p,i)=>{
            if(assembling && targetPositions[i]){
                const dx=targetPositions[i].x-p.x, dy=targetPositions[i].y-p.y;
                p.vx+=dx*0.05; p.vy+=dy*0.05;
                p.vx*=0.85; p.vy*=0.85;
            } else {
                p.vx+=(Math.random()-0.5)*0.3;
                p.vy+=(Math.random()-0.5)*0.3;
                p.vx*=0.99; p.vy*=0.99;
            }
            p.x+=p.vx; p.y+=p.vy;
            if(!assembling){
                if(p.x<0||p.x>canvas.width) p.vx*=-1;
                if(p.y<0||p.y>canvas.height) p.vy*=-1;
            }
            ctx.beginPath();
            ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
            ctx.fillStyle=p.color;
            ctx.shadowBlur=6;
            ctx.shadowColor=p.color;
            ctx.fill();
        });

        if(assembling){
            const allClose=particles.every((p,i)=>targetPositions[i]&&Math.abs(p.x-targetPositions[i].x)<5&&Math.abs(p.y-targetPositions[i].y)<5);
            if(allClose){
                assembled=true;
                setTimeout(()=>{gsap.to('#msgPanel',{opacity:1,duration:1});},800);
                return;
            }
        }
        requestAnimationFrame(animate);
    }

    animate();

    let clicked=false;
    document.getElementById('nanobotScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        targetPositions=getLetterTargets(r);
        while(targetPositions.length<PARTICLE_COUNT) targetPositions.push(targetPositions[Math.floor(Math.random()*targetPositions.length)]||{x:canvas.width/2,y:canvas.height/2});
        assembling=true;
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
