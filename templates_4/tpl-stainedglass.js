export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#0A0008;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    const panels=[
        {d:'M200,50 L260,80 L260,160 L200,180 L140,160 L140,80 Z',fill:'#8B00BB',stroke:'#440066',id:'p0'},
        {d:'M200,50 L260,80 L320,50 L320,20 L200,20 Z',fill:'#0044CC',stroke:'#002288',id:'p1'},
        {d:'M260,80 L340,100 L360,180 L260,160 Z',fill:'#009944',stroke:'#006622',id:'p2'},
        {d:'M260,160 L360,180 L320,260 L200,260 Z',fill:'#CC4400',stroke:'#882200',id:'p3'},
        {d:'M200,180 L260,160 L200,260 L140,260 Z',fill:'#CC8800',stroke:'#885500',id:'p4'},
        {d:'M140,160 L200,180 L140,260 L80,220 Z',fill:'#009999',stroke:'#005555',id:'p5'},
        {d:'M140,80 L200,50 L140,20 L80,50 Z',fill:'#990044',stroke:'#660022',id:'p6'},
        {d:'M80,50 L140,80 L80,160 L40,120 Z',fill:'#DD6600',stroke:'#884400',id:'p7'},
        {d:'M80,160 L140,160 L80,220 L40,200 Z',fill:'#4400AA',stroke:'#220066',id:'p8'},
        {d:'M260,80 L320,50 L360,100 L340,100 Z',fill:'#00AA44',stroke:'#006622',id:'p9'},
    ];

    const rays=panels.map((p,i)=>`
        <polygon class="ray-beam" id="ray${i}" points="200,140 ${300+i*30},${-100+i*20} ${350+i*20},${-50+i*25}"
            fill="${p.fill}" opacity="0" style="pointer-events:none;filter:blur(3px);mix-blend-mode:screen;"/>`).join('');

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Georgia',serif;}
        .dark-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,#0D0010 0%,#0A0008 50%,#050004 100%);}
        .window-container{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);}
        .glass-panel{opacity:0.15;transition:none;}
        .click-hint{position:absolute;bottom:6%;left:50%;transform:translateX(-50%);color:rgba(200,100,255,0.7);font-size:13px;letter-spacing:4px;animation:sgpulse 2s ease-in-out infinite;z-index:10;}
        @keyframes sgpulse{0%,100%{opacity:0.3;}50%{opacity:1;}}
        .light-flood{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(255,230,150,0.0),transparent);pointer-events:none;}
        .message-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;padding:40px;background:rgba(10,0,8,0.85);}
        .msg-receiver{font-size:3em;color:#FFD700;text-shadow:0 0 20px #FFAA00,0 0 40px #FF8800;margin-bottom:20px;letter-spacing:5px;}
        .msg-body{font-size:1.15em;color:#FFE8A0;max-width:580px;text-align:center;line-height:1.9;margin-bottom:28px;}
        .msg-sender{font-size:1em;color:#FFAA30;letter-spacing:4px;}
        .window-frame{position:absolute;inset:-5px;pointer-events:none;}
    </style>
    <div class="scene" id="sgScene">
        <div class="dark-bg" id="darkBg"></div>
        <div class="light-flood" id="lightFlood"></div>

        <svg style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);" width="400" height="300" viewBox="0 50 400 280">
            ${rays}
        </svg>

        <div class="window-container">
            <svg width="400" height="280" viewBox="0 0 400 280">
                <defs>
                    <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                <!-- Window arch outer -->
                <path d="M40,280 L40,100 Q40,20 200,20 Q360,20 360,100 L360,280 Z" fill="none" stroke="#3A2A1A" stroke-width="8"/>
                <!-- Glass panels -->
                ${panels.map(p=>`<path class="glass-panel" id="${p.id}" d="${p.d}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="3"/>`).join('')}
                <!-- Lead lines (dark) -->
                ${panels.map(p=>`<path d="${p.d}" fill="none" stroke="#1A1A1A" stroke-width="4"/>`).join('')}
                <!-- Center rose -->
                <circle cx="200" cy="140" r="20" fill="#FFD700" stroke="#AA8800" stroke-width="3" opacity="0.2" id="centerRose"/>
                <!-- Window frame -->
                <path d="M40,280 L40,100 Q40,20 200,20 Q360,20 360,100 L360,280 Z" fill="none" stroke="#5A3A1A" stroke-width="6"/>
                <line x1="200" y1="20" x2="200" y2="280" stroke="#5A3A1A" stroke-width="4"/>
                <path d="M40,140 Q120,130 200,135 Q280,130 360,140" stroke="#5A3A1A" stroke-width="4" fill="none"/>
            </svg>
        </div>

        <div class="click-hint" id="clickHint">✦ Click to Let the Light In ✦</div>
        <div class="message-panel" id="msgPanel">
            <div class="msg-receiver">${r}</div>
            <div class="msg-body">${m}</div>
            <div class="msg-sender">— ${s} —</div>
        </div>
    </div>`;

    // Very faint idle panel breathing
    panels.forEach((p,i)=>gsap.to(`#${p.id}`,{opacity:0.2+Math.random()*0.1,duration:2+Math.random(),yoyo:true,repeat:-1,ease:'sine.inOut',delay:Math.random()*2}));

    let clicked=false;
    document.getElementById('sgScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        const tl=gsap.timeline();
        // Kill idle animations
        panels.forEach(p=>gsap.killTweensOf(`#${p.id}`));
        // Light each panel sequentially
        panels.forEach((p,i)=>{
            tl.to(`#${p.id}`,{opacity:0.85,duration:0.4,ease:'power2.out'},i*0.15);
            tl.to(`#ray${i}`,{opacity:0.4,scaleX:3,duration:0.6,ease:'power2.out'},i*0.15);
        });
        tl.to('#centerRose',{opacity:1,scale:1.3,duration:0.5,ease:'back.out(2)'},'-=0.3');
        // Background lightens
        tl.to('#darkBg',{background:'radial-gradient(ellipse at 50% 40%,#2A1A10 0%,#1A0A18 50%,#0A0008 100%)',duration:1},'-=0.5');
        tl.to('#lightFlood',{background:'radial-gradient(ellipse at 50% 40%,rgba(255,230,150,0.15),transparent)',duration:1},'-=0.5');
        tl.to('#msgPanel',{opacity:1,duration:1.2},'+=0.5');
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
