export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#0A0400;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Georgia',serif;}
        .sky{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 60%,#FF6B00 0%,#CC2200 40%,#1A0800 80%,#0A0400 100%);}
        .sun{position:absolute;left:50%;top:55%;transform:translate(-50%,-50%);width:120px;height:120px;background:radial-gradient(circle,#FFD700,#FF8C00);border-radius:50%;box-shadow:0 0 60px #FFD700,0 0 120px #FF6B00;}
        .ray{position:absolute;left:50%;top:55%;width:4px;height:180px;background:linear-gradient(to top,rgba(255,200,0,0.6),transparent);transform-origin:bottom center;border-radius:2px;}
        .torii{position:absolute;left:50%;top:0;transform:translateX(-50%);width:340px;height:100vh;}
        .torii svg{width:100%;height:100%;}
        .ground{position:absolute;bottom:0;left:0;right:0;height:25vh;background:linear-gradient(to bottom,#2A1000,#1A0800);}
        .path{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:80px;height:25vh;background:linear-gradient(to bottom,rgba(255,180,0,0.3),rgba(255,120,0,0.1));border-left:1px solid rgba(255,180,0,0.2);border-right:1px solid rgba(255,180,0,0.2);}
        .petal{position:absolute;width:10px;height:14px;border-radius:50% 0 50% 0;opacity:0;pointer-events:none;}
        .click-hint{position:absolute;bottom:15%;left:50%;transform:translateX(-50%);color:rgba(255,200,100,0.7);font-size:14px;letter-spacing:3px;animation:pulse 2s ease-in-out infinite;}
        @keyframes pulse{0%,100%{opacity:0.5;}50%{opacity:1;}}
        .message-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;background:rgba(10,4,0,0.85);}
        .msg-receiver{font-size:2.8em;color:#FFD700;text-shadow:0 0 20px #FF8C00;margin-bottom:20px;letter-spacing:4px;}
        .msg-body{font-size:1.2em;color:#FFE0A0;max-width:600px;text-align:center;line-height:1.8;margin-bottom:30px;padding:0 20px;}
        .msg-sender{font-size:1em;color:#FF8C00;letter-spacing:3px;}
    </style>
    <div class="scene" id="toriiScene">
        <div class="sky"></div>
        <div class="sun" id="sun"></div>
        ${Array.from({length:16},(_,i)=>`<div class="ray" id="ray${i}" style="transform:translateX(-50%) rotate(${i*22.5}deg);transform-origin:bottom center;top:55%;left:50%;position:absolute;height:200px;"></div>`).join('')}
        <div class="ground"></div>
        <div class="path"></div>
        <div class="torii">
            <svg viewBox="0 0 340 600" preserveAspectRatio="xMidYMid meet">
                <rect x="40" y="80" width="260" height="18" rx="9" fill="#CC1100" stroke="#880000" stroke-width="2"/>
                <rect x="20" y="110" width="300" height="14" rx="7" fill="#CC1100" stroke="#880000" stroke-width="2"/>
                <path d="M20 124 Q170 140 320 124" stroke="#CC1100" stroke-width="12" fill="none" stroke-linecap="round"/>
                <rect x="70" y="124" width="24" height="440" rx="5" fill="#CC1100"/>
                <rect x="246" y="124" width="24" height="440" rx="5" fill="#CC1100"/>
                <rect x="80" y="200" width="180" height="10" rx="5" fill="#CC1100" opacity="0.8"/>
                <text x="170" y="192" text-anchor="middle" fill="#FFD700" font-size="11" font-family="serif" opacity="0.9">鳥居</text>
            </svg>
        </div>
        <div class="click-hint" id="clickHint">✦ クリック ✦</div>
        <div class="message-panel" id="msgPanel">
            <div class="msg-receiver">${r}</div>
            <div class="msg-body">${m}</div>
            <div class="msg-sender">— ${s} —</div>
        </div>
    </div>`;

    const scene = document.getElementById('toriiScene');
    const petals = [];
    const petalColors = ['#FFB7C5','#FF8FA3','#FFC0CB','#FFD1DC','#FFAABB'];

    for(let i=0;i<40;i++){
        const p = document.createElement('div');
        p.className = 'petal';
        p.style.cssText = `left:${Math.random()*100}%;top:-20px;background:${petalColors[Math.floor(Math.random()*petalColors.length)]};transform:rotate(${Math.random()*360}deg);`;
        scene.appendChild(p);
        petals.push(p);
    }

    gsap.to('.ray',{opacity:0.4,duration:2,stagger:0.1,yoyo:true,repeat:-1,ease:'sine.inOut'});
    gsap.to('#sun',{boxShadow:'0 0 80px #FFD700, 0 0 160px #FF6B00',duration:2,yoyo:true,repeat:-1,ease:'sine.inOut'});

    let clicked = false;
    scene.addEventListener('click',()=>{
        if(clicked) return; clicked = true;
        document.getElementById('clickHint').style.display='none';
        const tl = gsap.timeline();
        tl.to('#toriiScene',{scale:2.5,duration:2.5,ease:'power2.in',transformOrigin:'50% 70%'});
        tl.to('#toriiScene',{opacity:0,duration:0.5},'-=0.3');
        tl.set('#toriiScene',{scale:1,opacity:1});
        tl.to('#msgPanel',{opacity:1,duration:1});
        petals.forEach((p,i)=>{
            gsap.to(p,{top:'110%',x:()=>(Math.random()-0.5)*300,rotation:Math.random()*720,opacity:1,duration:3+Math.random()*3,delay:i*0.1,ease:'power1.in',repeat:-1,repeatRefresh:true});
            gsap.set(p,{top:'-5%',opacity:1,delay:i*0.1});
        });
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
