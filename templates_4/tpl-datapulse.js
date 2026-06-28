export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#000510;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Courier New',monospace;}
        canvas{position:absolute;inset:0;display:block;}
        .click-hint{position:absolute;bottom:6%;left:50%;transform:translateX(-50%);color:rgba(0,150,255,0.8);font-size:13px;letter-spacing:4px;animation:dppulse 2s ease-in-out infinite;pointer-events:none;z-index:5;}
        @keyframes dppulse{0%,100%{opacity:0.3;}50%{opacity:1;}}
        .message-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;padding:40px;z-index:10;}
        .msg-receiver{font-size:3em;color:#00AAFF;text-shadow:0 0 20px #0066FF,0 0 40px #0033AA;margin-bottom:20px;letter-spacing:5px;}
        .msg-body{font-size:1.1em;color:#A0D0FF;max-width:580px;text-align:center;line-height:1.9;margin-bottom:28px;}
        .msg-sender{font-size:1em;color:#0088CC;letter-spacing:4px;}
    </style>
    <div class="scene" id="dpScene">
        <canvas id="dpCanvas"></canvas>
        <div class="click-hint" id="clickHint">◉ CLICK TO CONVERGE DATA ◉</div>
        <div class="message-panel" id="msgPanel">
            <div class="msg-receiver">${r}</div>
            <div class="msg-body">${m}</div>
            <div class="msg-sender">— ${s} —</div>
        </div>
    </div>`;

    const canvas=document.getElementById('dpCanvas');
    const ctx=canvas.getContext('2d');
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    const W=canvas.width, H=canvas.height;
    const cx=W/2, cy=H/2;

    // Network nodes
    const nodes=[];
    const NODE_COUNT=20;
    for(let i=0;i<NODE_COUNT;i++){
        nodes.push({
            x:Math.random()*W*0.85+W*0.075,
            y:Math.random()*H*0.85+H*0.075,
            r:3+Math.random()*4,
            pulse:Math.random()*Math.PI*2
        });
    }
    // Center node
    nodes.push({x:cx,y:cy,r:10,pulse:0,isCenter:true});
    const CENTER=nodes.length-1;

    // Data pulses on connections
    const pulses=[];
    function addPulse(from,to){
        pulses.push({from,to,t:0,speed:0.004+Math.random()*0.004,color:`hsl(${200+Math.random()*40},100%,${60+Math.random()*20}%)`});
    }
    // Create connections
    const conns=[];
    for(let i=0;i<NODE_COUNT;i++){
        const numConns=1+Math.floor(Math.random()*2);
        for(let j=0;j<numConns;j++){
            const target=Math.floor(Math.random()*NODE_COUNT);
            if(target!==i) conns.push([i,target]);
        }
        conns.push([i,CENTER]);
    }

    // Start pulses
    conns.forEach(([a,b])=>addPulse(a,b));

    let converging=false;
    let exploded=false;
    let exploParticles=[];

    function draw(){
        ctx.clearRect(0,0,W,H);
        ctx.fillStyle='rgba(0,5,16,0.25)';
        ctx.fillRect(0,0,W,H);

        // Draw connections
        ctx.strokeStyle='rgba(0,80,180,0.25)';
        ctx.lineWidth=1;
        conns.forEach(([a,b])=>{
            ctx.beginPath();
            ctx.moveTo(nodes[a].x,nodes[a].y);
            ctx.lineTo(nodes[b].x,nodes[b].y);
            ctx.stroke();
        });

        // Draw nodes
        nodes.forEach((n,i)=>{
            n.pulse+=0.05;
            const glow=i===CENTER?20:8;
            const color=i===CENTER?'#00AAFF':'#0055CC';
            ctx.beginPath();
            ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
            ctx.fillStyle=color;
            ctx.shadowBlur=glow;
            ctx.shadowColor=color;
            ctx.fill();
            ctx.shadowBlur=0;
            if(i===CENTER){
                ctx.beginPath();
                ctx.arc(n.x,n.y,n.r+5+Math.sin(n.pulse)*3,0,Math.PI*2);
                ctx.strokeStyle='rgba(0,170,255,0.3)';
                ctx.lineWidth=1;
                ctx.stroke();
            }
        });

        // Move and draw pulses
        pulses.forEach((p,i)=>{
            const from=nodes[p.from], to=converging?nodes[CENTER]:nodes[p.to];
            p.t+=converging?p.speed*3:p.speed;
            if(p.t>1) p.t=0;
            const x=from.x+(to.x-from.x)*p.t;
            const y=from.y+(to.y-from.y)*p.t;
            ctx.beginPath();
            ctx.arc(x,y,3,0,Math.PI*2);
            ctx.fillStyle=p.color;
            ctx.shadowBlur=10;
            ctx.shadowColor=p.color;
            ctx.fill();
            ctx.shadowBlur=0;

            if(converging&&!exploded&&Math.abs(x-cx)<15&&Math.abs(y-cy)<15){
                p.t=0;
            }
        });

        // Explosion particles
        if(exploded){
            let done=true;
            exploParticles.forEach(p=>{
                if(p.life>0){
                    done=false;
                    p.x+=p.vx; p.y+=p.vy; p.life-=0.02;
                    ctx.beginPath();
                    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
                    ctx.fillStyle=`rgba(${p.r2},${p.g2},${p.b2},${p.life})`;
                    ctx.fill();
                }
            });
            if(done){cancelAnimationFrame(af);gsap.to('#msgPanel',{opacity:1,duration:1.2});return;}
        }

        af=requestAnimationFrame(draw);
    }
    let af=requestAnimationFrame(draw);

    let clicked=false;
    document.getElementById('dpScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        converging=true;
        setTimeout(()=>{
            exploded=true;
            for(let i=0;i<80;i++){
                const angle=Math.random()*Math.PI*2;
                const speed=2+Math.random()*6;
                exploParticles.push({
                    x:cx,y:cy,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
                    r:1+Math.random()*3,life:0.8+Math.random()*0.2,
                    r2:Math.floor(Math.random()*100),g2:Math.floor(150+Math.random()*105),b2:255
                });
            }
        },2000);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
