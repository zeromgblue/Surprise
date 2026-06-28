export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#FAFAFA;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;font-family:'Georgia',serif;background:#FAFAFA;}
        .paper{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 38px,rgba(0,0,0,0.04) 39px),linear-gradient(to bottom right,#FAFAFA,#F0EDE8);}
        .paper-edge{position:absolute;left:8%;right:8%;top:4%;bottom:4%;border:1px solid rgba(0,0,0,0.08);box-shadow:2px 4px 20px rgba(0,0,0,0.08),inset 0 0 40px rgba(0,0,0,0.02);}
        .brush-stroke{position:absolute;}
        .svg-container{position:absolute;inset:0;pointer-events:none;}
        .content-area{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;width:80%;max-width:600px;}
        .msg-receiver{font-size:3.2em;color:#1A1A1A;letter-spacing:6px;margin-bottom:16px;opacity:0;font-weight:normal;}
        .msg-body{font-size:1.1em;color:#2A2A2A;line-height:2;margin-bottom:24px;opacity:0;}
        .msg-sender{font-size:0.95em;color:#555;letter-spacing:4px;opacity:0;font-style:italic;}
        .brush-img{position:absolute;width:60px;height:180px;pointer-events:none;transform-origin:top center;}
        .ink-splash{position:absolute;border-radius:50%;background:rgba(0,0,0,0.06);pointer-events:none;}
        .haiku-line{font-size:0.85em;color:#666;letter-spacing:3px;margin-bottom:8px;opacity:0;font-style:italic;}
        .divider{width:80px;height:2px;background:linear-gradient(to right,transparent,#1A1A1A,transparent);margin:16px auto;opacity:0;}
    </style>
    <div class="scene" id="haikuScene">
        <div class="paper"></div>
        <div class="paper-edge"></div>
        <svg class="svg-container" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
            <path id="stroke1" d="M 100 80 Q 200 60 320 90 Q 420 110 500 80" stroke="#1A1A1A" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="400" stroke-dashoffset="400" opacity="0.7"/>
            <path id="stroke2" d="M 600 120 Q 650 200 620 300 Q 590 380 640 440" stroke="#1A1A1A" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="350" stroke-dashoffset="350" opacity="0.5"/>
            <path id="stroke3" d="M 80 500 Q 180 520 300 510 Q 450 498 560 515 Q 660 528 720 510" stroke="#1A1A1A" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-dasharray="650" stroke-dashoffset="650" opacity="0.4"/>
            <circle id="dot1" cx="90" cy="85" r="5" fill="#1A1A1A" opacity="0"/>
            <circle id="dot2" cx="645" cy="445" r="4" fill="#1A1A1A" opacity="0"/>
        </svg>
        <div class="content-area">
            <div class="haiku-line" id="haiku1">古池や — 静かなる夜</div>
            <div class="haiku-line" id="haiku2">心から　心へ</div>
            <div class="divider" id="divider"></div>
            <div class="msg-receiver" id="msgR">${r}</div>
            <div class="msg-body" id="msgB">${m}</div>
            <div class="divider" id="divider2"></div>
            <div class="msg-sender" id="msgS">— ${s} —</div>
        </div>
    </div>`;

    const tl = gsap.timeline({delay:0.5});
    // Draw decorative brush strokes
    tl.to('#stroke1',{strokeDashoffset:0,duration:1.5,ease:'power2.inOut'});
    tl.to('#dot1',{opacity:0.7,duration:0.3},'-=0.1');
    tl.to('#stroke2',{strokeDashoffset:0,duration:1.2,ease:'power2.inOut'},'-=0.5');
    tl.to('#stroke3',{strokeDashoffset:0,duration:1.8,ease:'power2.inOut'},'-=0.3');
    tl.to('#dot2',{opacity:0.5,duration:0.3},'-=0.2');
    tl.to('#haiku1',{opacity:1,y:0,duration:0.8,ease:'power2.out'},'+=0.3');
    tl.to('#haiku2',{opacity:1,y:0,duration:0.8,ease:'power2.out'},'-=0.3');
    tl.to('#divider',{opacity:1,scaleX:1,duration:0.6},'+=0.2');
    // Typewriter-style name reveal
    tl.to('#msgR',{opacity:1,duration:0.1},'+=0.3');
    const nameEl = document.getElementById('msgR');
    const nameText = r;
    nameEl.textContent = '';
    tl.add(()=>{
        let idx=0;
        const typeIt=setInterval(()=>{
            nameEl.textContent += nameText[idx]||'';
            idx++;
            if(idx>=nameText.length) clearInterval(typeIt);
        },80);
    });
    tl.to('#msgB',{opacity:1,duration:1.2,ease:'power2.out'},`+=1`);
    tl.to('#divider2',{opacity:1,duration:0.6},'-=0.3');
    tl.to('#msgS',{opacity:1,duration:0.8,ease:'power2.out'},'-=0.2');

    // Add ink splash drops
    const scene = document.getElementById('haikuScene');
    [
        {left:'15%',top:'30%',w:40,h:25},{left:'75%',top:'65%',w:30,h:20},
        {left:'60%',top:'20%',w:20,h:15},{left:'25%',top:'75%',w:35,h:22}
    ].forEach(pos=>{
        const splash=document.createElement('div');
        splash.className='ink-splash';
        splash.style.cssText=`left:${pos.left};top:${pos.top};width:${pos.w}px;height:${pos.h}px;`;
        scene.appendChild(splash);
        gsap.from(splash,{scale:0,opacity:0,duration:0.5,delay:0.5+Math.random()*2});
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
