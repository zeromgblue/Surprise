export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#0A0008;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Georgia',serif;}
        .bg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,#150010 0%,#0A0008 60%,#050004 100%);}
        canvas{position:absolute;inset:0;display:block;}
        .center-message{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;opacity:0;pointer-events:none;z-index:5;width:280px;}
        .center-r{font-size:1.8em;color:#FFD700;text-shadow:0 0 15px #FF8800;margin-bottom:10px;letter-spacing:3px;}
        .center-b{font-size:0.8em;color:#FFE0A0;line-height:1.7;margin-bottom:10px;}
        .center-s{font-size:0.75em;color:#FFA030;letter-spacing:2px;}
        .full-msg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;padding:40px;background:rgba(10,0,8,0.9);z-index:20;}
        .full-r{font-size:3em;color:#FFD700;text-shadow:0 0 20px #FF8800;margin-bottom:20px;letter-spacing:5px;}
        .full-b{font-size:1.1em;color:#FFE0A0;max-width:580px;text-align:center;line-height:1.9;margin-bottom:28px;}
        .full-s{font-size:1em;color:#FFA030;letter-spacing:4px;}
        .click-hint{position:absolute;bottom:6%;left:50%;transform:translateX(-50%);color:rgba(255,200,100,0.7);font-size:13px;letter-spacing:4px;animation:sppulse 2s ease-in-out infinite;z-index:10;}
        @keyframes sppulse{0%,100%{opacity:0.3;}50%{opacity:1;}}
    </style>
    <div class="scene" id="sandScene">
        <div class="bg"></div>
        <canvas id="sandCanvas"></canvas>
        <div class="center-message" id="centerMsg">
            <div class="center-r">${r}</div>
            <div class="center-b">${m}</div>
            <div class="center-s">— ${s} —</div>
        </div>
        <div class="click-hint" id="clickHint">✦ Click to Begin Sand Painting ✦</div>
        <div class="full-msg" id="fullMsg">
            <div class="full-r">${r}</div>
            <div class="full-b">${m}</div>
            <div class="full-s">— ${s} —</div>
        </div>
    </div>`;

    const canvas=document.getElementById('sandCanvas');
    const ctx=canvas.getContext('2d');
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    const W=canvas.width, H=canvas.height;
    const cx=W/2, cy=H/2;

    // Sand particle colors
    const sandColors=['#E8A020','#CC7A10','#F0C060','#D4882A','#AA5500','#FF9933','#FFB347','#CC6600'];

    // Mandala ring definitions
    const rings=[
        {r:20,count:8,size:3,color:()=>sandColors[Math.floor(Math.random()*sandColors.length)]},
        {r:50,count:16,size:2.5,color:()=>sandColors[Math.floor(Math.random()*sandColors.length)]},
        {r:80,count:24,size:2,color:()=>['#CC0044','#FF0066','#AA0033'][Math.floor(Math.random()*3)]},
        {r:110,count:32,size:2,color:()=>['#0044CC','#0066FF','#004499'][Math.floor(Math.random()*3)]},
        {r:140,count:40,size:1.8,color:()=>sandColors[Math.floor(Math.random()*sandColors.length)]},
        {r:165,count:48,size:1.5,color:()=>['#00AA44','#00CC55','#009933'][Math.floor(Math.random()*3)]},
        {r:185,count:60,size:1.3,color:()=>['#AA00CC','#CC00FF','#8800AA'][Math.floor(Math.random()*3)]},
    ];

    // Pre-calculate all particle targets
    const allParticles=[];
    rings.forEach(ring=>{
        for(let i=0;i<ring.count;i++){
            const angle=(i/ring.count)*Math.PI*2;
            allParticles.push({
                tx:cx+Math.cos(angle)*ring.r,
                ty:cy+Math.sin(angle)*ring.r,
                x:cx+(Math.random()-0.5)*W*0.8,
                y:cy+(Math.random()-0.5)*H*0.8,
                size:ring.size+Math.random()*1,
                color:ring.color(),
                progress:0,speed:0
            });
        }
    });
    // Shuffle
    allParticles.sort(()=>Math.random()-0.5);

    let animating=false;
    let drawn=0;
    let af;

    function drawFrame(){
        if(!animating) return;
        ctx.fillStyle='rgba(10,0,8,0.08)';
        ctx.fillRect(0,0,W,H);

        allParticles.forEach((p,i)=>{
            if(p.progress>=1) return;
            if(i>drawn) return;
            p.progress=Math.min(1,p.progress+p.speed);
            p.x=p.x+(p.tx-p.x)*0.08;
            p.y=p.y+(p.ty-p.y)*0.08;
            ctx.beginPath();
            ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
            ctx.fillStyle=p.color;
            ctx.fill();
        });

        drawn=Math.min(allParticles.length,drawn+3);

        if(drawn<allParticles.length||allParticles.some(p=>p.progress<1)){
            af=requestAnimationFrame(drawFrame);
        } else {
            // Mandala complete — clear center
            setTimeout(()=>{
                const grad=ctx.createRadialGradient(cx,cy,0,cx,cy,60);
                grad.addColorStop(0,'rgba(10,0,8,1)');
                grad.addColorStop(1,'rgba(10,0,8,0)');
                ctx.fillStyle=grad;
                for(let i=0;i<10;i++) ctx.fillRect(0,0,W,H);
                gsap.to('#centerMsg',{opacity:1,duration:1});
                setTimeout(()=>gsap.to('#fullMsg',{opacity:1,duration:1.2}),3000);
            },500);
        }
    }

    let clicked=false;
    document.getElementById('sandScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        animating=true;
        allParticles.forEach(p=>{p.speed=0.015+Math.random()*0.01;});
        drawn=0;
        drawFrame();
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
