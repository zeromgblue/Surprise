export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#F8FAFC;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    // Build SVG path for receiver name text outline via canvas trick
    // We'll use a pre-defined abstract continuous line art path that ends forming a frame
    const W=800, H=600;

    // Complex abstract continuous path that traverses the canvas
    const abstractPath=`M 50,50 C 100,20 200,80 150,150 C 100,220 50,180 80,250 C 110,320 200,280 180,350 C 160,420 80,400 100,470 C 120,540 200,520 250,550 C 300,580 350,560 400,550 C 450,540 500,560 550,540 C 600,520 650,480 700,470 C 750,460 780,490 760,540 C 740,590 700,580 720,520 C 740,460 780,430 750,370 C 720,310 680,340 700,280 C 720,220 770,200 740,140 C 710,80 660,100 640,50 C 620,0 650,-20 600,30 C 550,80 520,60 480,100 C 440,140 450,180 420,200 C 390,220 360,200 330,180 C 300,160 290,130 260,110 C 230,90 200,110 180,80 C 160,50 170,20 140,40 C 110,60 90,40 70,80 C 50,120 80,160 60,200 C 40,240 10,230 30,280 C 50,330 100,320 90,370 C 80,420 40,430 60,480 C 80,530 130,530 150,480 C 170,430 140,390 160,350 C 180,310 220,320 240,280 C 260,240 250,200 280,170 C 310,140 350,150 380,130 C 410,110 420,80 460,70 C 500,60 530,80 560,60`;

    const totalLen=3000; // approximate
    const nameFontSize=Math.min(100, Math.floor(700/r.length));

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;font-family:'Georgia',serif;background:#F8FAFC;}
        .paper{position:absolute;inset:0;background:linear-gradient(135deg,#F8FAFC,#F0F2F5,#F8FAFC);}
        .paper-texture{position:absolute;inset:0;opacity:0.4;background:
            repeating-linear-gradient(0deg,transparent,transparent 29px,rgba(0,0,0,0.03) 30px),
            repeating-linear-gradient(90deg,transparent,transparent 29px,rgba(0,0,0,0.03) 30px);}
        .svg-art{position:absolute;inset:0;width:100%;height:100%;}
        .art-path{stroke-dasharray:${totalLen};stroke-dashoffset:${totalLen};fill:none;stroke:#1A1A2A;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
        .name-svg{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);overflow:visible;}
        .name-path{stroke-dasharray:2000;stroke-dashoffset:2000;stroke:#1A1A2A;stroke-width:2;fill:none;}
        .name-fill{opacity:0;}
        .message-area{position:absolute;left:50%;top:62%;transform:translateX(-50%);text-align:center;width:80%;max-width:580px;opacity:0;}
        .msg-divider{width:100px;height:2px;background:linear-gradient(to right,transparent,#1A1A2A,transparent);margin:0 auto 20px;}
        .msg-body{font-size:1.05em;color:#2A2A2A;line-height:1.9;margin-bottom:16px;font-style:italic;}
        .msg-sender{font-size:0.9em;color:#555;letter-spacing:4px;}
        .dot{position:absolute;width:6px;height:6px;border-radius:50%;background:#1A1A2A;pointer-events:none;opacity:0;}
        .name-text{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);font-size:${nameFontSize}px;font-family:'Georgia',serif;font-weight:normal;color:#1A1A2A;letter-spacing:8px;white-space:nowrap;opacity:0;text-align:center;}
    </style>
    <div class="scene" id="lineScene">
        <div class="paper"></div>
        <div class="paper-texture"></div>
        <svg class="svg-art" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
            <path class="art-path" id="artPath" d="${abstractPath}"/>
            <!-- Secondary decorative spirals -->
            <path class="art-path" id="artPath2" d="M400,300 C380,280 350,290 360,310 C370,330 400,325 410,310 C420,295 410,270 390,265 C370,260 345,275 340,300 C335,325 350,350 375,355 C400,360 425,345 430,320 C435,295 420,265 395,255 C370,245 340,260 330,290 C320,320 335,355 365,365 C395,375 430,360 440,330" stroke="rgba(26,26,42,0.4)" stroke-width="1.5" stroke-dasharray="600" stroke-dashoffset="600" fill="none" stroke-linecap="round"/>
        </svg>
        <div class="name-text" id="nameText">${r}</div>
        <div class="message-area" id="msgArea">
            <div class="msg-divider"></div>
            <div class="msg-body">${m}</div>
            <div class="msg-sender">— ${s} —</div>
        </div>
    </div>`;

    const tl=gsap.timeline({delay:0.3});
    // Draw abstract path
    tl.to('#artPath',{strokeDashoffset:0,duration:4,ease:'power1.inOut'});
    tl.to('#artPath2',{strokeDashoffset:0,duration:2,ease:'power2.inOut'},'-=2');
    // Fade in name text
    tl.to('#nameText',{opacity:1,duration:1,ease:'power2.out'},'+=0.3');
    // Name letter-by-letter via clip reveal
    tl.to('#nameText',{letterSpacing:'12px',duration:0.8,ease:'power2.out'},'-=0.5');
    // Message fades in
    tl.to('#msgArea',{opacity:1,duration:1.2,ease:'power2.out'},'+=0.5');

    // Ink drop dots at key intersections
    const scene=document.getElementById('lineScene');
    [[100,80],[200,150],[350,50],[600,100],[700,300],[650,480],[400,550],[200,520],[80,400],[80,250]].forEach(([x,y])=>{
        const dot=document.createElement('div');
        dot.className='dot';
        dot.style.cssText=`left:${x/800*100}%;top:${y/600*100}%;`;
        scene.appendChild(dot);
        gsap.to(dot,{opacity:0.6,duration:0.2,delay:0.3+Math.random()*3});
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
