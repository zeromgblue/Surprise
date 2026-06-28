export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#0A0014;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Georgia',serif;}
        .bg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,#1A0030 0%,#0A0014 60%,#050008 100%);}
        canvas{position:absolute;inset:0;}
        .brain-left{position:absolute;left:5%;top:50%;transform:translateY(-50%);width:160px;height:160px;opacity:0.7;}
        .brain-right{position:absolute;right:5%;top:50%;transform:translateY(-50%);width:160px;height:160px;opacity:0.7;}
        .heart{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:60px;opacity:0;filter:drop-shadow(0 0 20px #FF44AA);}
        .click-hint{position:absolute;bottom:6%;left:50%;transform:translateX(-50%);color:rgba(200,100,255,0.7);font-size:13px;letter-spacing:4px;animation:mlpulse 2s ease-in-out infinite;z-index:10;pointer-events:none;}
        @keyframes mlpulse{0%,100%{opacity:0.3;}50%{opacity:1;}}
        .message-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;padding:40px;background:rgba(10,0,20,0.9);z-index:20;}
        .msg-receiver{font-size:3em;color:#FF88CC;text-shadow:0 0 20px #FF44AA,0 0 40px #AA0066;margin-bottom:20px;letter-spacing:5px;}
        .msg-body{font-size:1.1em;color:#F0C0FF;max-width:580px;text-align:center;line-height:1.9;margin-bottom:28px;}
        .msg-sender{font-size:1em;color:#CC44AA;letter-spacing:4px;}
    </style>
    <div class="scene" id="mlScene">
        <div class="bg"></div>
        <canvas id="mlCanvas"></canvas>

        <svg class="brain-left" viewBox="0 0 160 160">
            <path d="M80 20 C40 20 20 50 25 80 C20 100 30 130 60 140 C70 145 80 145 80 145 L80 20Z" fill="rgba(180,80,255,0.3)" stroke="rgba(200,100,255,0.5)" stroke-width="1.5"/>
            <path d="M40 60 Q50 50 60 60 Q50 70 40 60" stroke="rgba(200,100,255,0.3)" stroke-width="1" fill="none"/>
            <path d="M35 85 Q48 75 55 88" stroke="rgba(200,100,255,0.3)" stroke-width="1" fill="none"/>
            <path d="M45 110 Q58 100 65 112" stroke="rgba(200,100,255,0.3)" stroke-width="1" fill="none"/>
        </svg>
        <svg class="brain-right" viewBox="0 0 160 160">
            <path d="M80 20 C120 20 140 50 135 80 C140 100 130 130 100 140 C90 145 80 145 80 145 L80 20Z" fill="rgba(180,80,255,0.3)" stroke="rgba(200,100,255,0.5)" stroke-width="1.5"/>
            <path d="M120 60 Q110 50 100 60 Q110 70 120 60" stroke="rgba(200,100,255,0.3)" stroke-width="1" fill="none"/>
            <path d="M125 85 Q112 75 105 88" stroke="rgba(200,100,255,0.3)" stroke-width="1" fill="none"/>
            <path d="M115 110 Q102 100 95 112" stroke="rgba(200,100,255,0.3)" stroke-width="1" fill="none"/>
        </svg>

        <div class="heart" id="heart">♥</div>
        <div class="click-hint" id="clickHint">♡ Click to Connect Minds ♡</div>
        <div class="message-panel" id="msgPanel">
            <div class="msg-receiver">${r}</div>
            <div class="msg-body">${m}</div>
            <div class="msg-sender">— ${s} —</div>
        </div>
    </div>`;

    const canvas=document.getElementById('mlCanvas');
    const ctx=canvas.getContext('2d');
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    const W=canvas.width,H=canvas.height;

    // Synapse connections between two brain centers
    const leftBrainX=W*0.12, rightBrainX=W*0.88, brainY=H/2;
    const synapses=[];
    const pulseParticles=[];
    let converging=false;

    for(let i=0;i<12;i++){
        const wobbleY=brainY+(Math.random()-0.5)*H*0.4;
        const ctrlX=W/2+(Math.random()-0.5)*W*0.3;
        const ctrlY=brainY+(Math.random()-0.5)*H*0.5;
        synapses.push({
            x1:leftBrainX+(Math.random()-0.5)*60,
            y1:brainY+(Math.random()-0.5)*80,
            x2:rightBrainX+(Math.random()-0.5)*60,
            y2:brainY+(Math.random()-0.5)*80,
            cx:ctrlX,cy:ctrlY,
            hue:280+Math.random()*80
        });
    }

    // Pulses travelling along synapses
    synapses.forEach((syn,i)=>{
        pulseParticles.push({synIdx:i,t:Math.random(),speed:0.003+Math.random()*0.003,dir:Math.random()>0.5?1:-1});
    });

    function bezierPoint(t,x1,y1,cx,cy,x2,y2){
        const mt=1-t;
        return{
            x:mt*mt*x1+2*mt*t*cx+t*t*x2,
            y:mt*mt*y1+2*mt*t*cy+t*t*y2
        };
    }

    let heartVisible=false;
    function draw(){
        ctx.clearRect(0,0,W,H);
        ctx.fillStyle='rgba(10,0,20,0.2)';
        ctx.fillRect(0,0,W,H);

        // Draw synapse curves
        synapses.forEach(syn=>{
            ctx.beginPath();
            ctx.moveTo(syn.x1,syn.y1);
            ctx.quadraticCurveTo(syn.cx,syn.cy,syn.x2,syn.y2);
            ctx.strokeStyle=`hsla(${syn.hue},100%,60%,0.2)`;
            ctx.lineWidth=1;
            ctx.stroke();
        });

        // Move and draw pulses
        pulseParticles.forEach(p=>{
            const syn=synapses[p.synIdx];
            if(converging){
                // Converge to center
                p.t+=p.speed*3;
                if(p.t>0.5) p.t=0;
                p.synIdx=(p.synIdx+1)%synapses.length;
            } else {
                p.t+=p.speed*p.dir;
                if(p.t>1||p.t<0){p.dir*=-1;p.t=Math.max(0,Math.min(1,p.t));}
            }
            const pt=bezierPoint(p.t,syn.x1,syn.y1,syn.cx,syn.cy,syn.x2,syn.y2);
            ctx.beginPath();
            ctx.arc(pt.x,pt.y,3,0,Math.PI*2);
            ctx.fillStyle=`hsla(${syn.hue},100%,80%,0.9)`;
            ctx.shadowBlur=12;
            ctx.shadowColor=`hsla(${syn.hue},100%,60%,1)`;
            ctx.fill();
            ctx.shadowBlur=0;

            if(converging&&!heartVisible&&Math.abs(pt.x-W/2)<30&&Math.abs(pt.y-H/2)<30){
                heartVisible=true;
                gsap.to('#heart',{opacity:1,scale:1.3,duration:0.5,ease:'back.out(2)',yoyo:true,repeat:2,onComplete:()=>{
                    gsap.to('#heart',{scale:1,opacity:1,duration:0.3});
                    setTimeout(()=>gsap.to('#msgPanel',{opacity:1,duration:1.2}),500);
                }});
            }
        });
        requestAnimationFrame(draw);
    }
    draw();

    let clicked=false;
    document.getElementById('mlScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        converging=true;
        gsap.to('.brain-left,.brain-right',{opacity:1,duration:0.5});
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
