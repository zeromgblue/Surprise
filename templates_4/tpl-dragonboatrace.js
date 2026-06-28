export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#001A10;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Georgia',serif;}
        .sky{position:absolute;top:0;left:0;right:0;height:45%;background:linear-gradient(to bottom,#001208,#002A14,#004020);}
        .river{position:absolute;bottom:0;left:0;right:0;height:55%;background:linear-gradient(to bottom,#003018,#001A0C,#000A06);}
        .river-shimmer{position:absolute;bottom:0;left:0;right:0;height:55%;background:repeating-linear-gradient(0deg,transparent,transparent 8px,rgba(0,200,100,0.04) 9px);}
        .mountain{position:absolute;bottom:45%;left:0;right:0;}
        .boat{position:absolute;bottom:52%;display:flex;align-items:flex-end;transform:translateX(-120%);}
        .boat-body{position:relative;}
        .oar-group{position:absolute;bottom:100%;display:flex;gap:8px;}
        .oar{width:3px;height:20px;background:#8B4513;transform-origin:bottom center;border-radius:1px;}
        .drum-pulse{position:absolute;left:50%;top:-60%;transform:translate(-50%,-50%);width:0;height:0;border-radius:50%;border:2px solid rgba(255,100,0,0.7);opacity:0;pointer-events:none;}
        .banner{position:absolute;top:0;left:50%;transform:translateX(-50%);width:85%;max-width:560px;background:linear-gradient(to bottom,#8B0000,#CC0000);clip-path:polygon(0 0,100% 0,100% 100%,50% 85%,0 100%);padding:40px 30px 60px;text-align:center;transform-origin:top center;scaleY:0;opacity:0;}
        .banner-msg-r{font-size:2.2em;color:#FFD700;text-shadow:0 0 15px #FF8800;margin-bottom:12px;letter-spacing:4px;}
        .banner-msg-b{font-size:0.95em;color:#FFE0A0;line-height:1.7;margin-bottom:16px;}
        .banner-msg-s{font-size:0.9em;color:#FFB050;letter-spacing:3px;}
        .click-hint{position:absolute;bottom:6%;left:50%;transform:translateX(-50%);color:rgba(0,255,100,0.7);font-size:13px;letter-spacing:4px;animation:dbpulse 2s ease-in-out infinite;z-index:10;}
        @keyframes dbpulse{0%,100%{opacity:0.4;}50%{opacity:1;}}
        .wave{position:absolute;height:4px;background:rgba(0,200,80,0.2);border-radius:2px;left:0;right:0;}
        .finish-line{position:absolute;right:-5px;bottom:48%;width:5px;height:25%;background:repeating-linear-gradient(0deg,#FFD700,#FFD700 10px,#CC0000 10px,#CC0000 20px);opacity:0;}
    </style>
    <div class="scene" id="dbScene">
        <div class="sky"></div>
        <svg style="position:absolute;bottom:45%;left:0;right:0;width:100%;height:80px;" viewBox="0 0 800 80" preserveAspectRatio="none">
            <polygon points="0,80 0,40 100,10 200,50 350,5 500,40 650,15 800,35 800,80" fill="#001A10"/>
            <polygon points="0,80 0,50 150,20 300,55 480,15 630,45 800,25 800,80" fill="#002A18" opacity="0.6"/>
        </svg>
        <div class="river"></div>
        <div class="river-shimmer"></div>
        ${Array.from({length:6},(_,i)=>`<div class="wave" style="bottom:${52+i*3}%;opacity:${0.1+i*0.05};animation:waveAnim ${2+i*0.3}s linear infinite;left:${-i*10}%;"></div>`).join('')}
        <style>@keyframes waveAnim{from{transform:translateX(0)}to{transform:translateX(10%)}}</style>

        <!-- Boat 1 (top lane) -->
        <div class="boat" id="boat1" style="bottom:58%;">
            <svg width="220" height="55" viewBox="0 0 220 55">
                <path d="M10 40 Q110 20 210 40 L200 55 Q110 48 20 55 Z" fill="#CC1100"/>
                <path d="M5 40 Q110 18 215 40" stroke="#FF4400" stroke-width="2" fill="none"/>
                <circle cx="35" cy="32" r="10" fill="#FFD700" stroke="#AA8800" stroke-width="1"/>
                <path d="M20 32 Q35 22 50 32" stroke="#FF8800" stroke-width="2" fill="none"/>
                ${Array.from({length:7},(_,i)=>`<line x1="${40+i*22}" y1="36" x2="${40+i*22}" y2="24" stroke="#8B0000" stroke-width="1.5"/>`).join('')}
                <text x="110" y="50" text-anchor="middle" fill="#FFD700" font-size="8">龍舟</text>
            </svg>
        </div>

        <!-- Boat 2 (bottom lane) -->
        <div class="boat" id="boat2" style="bottom:50%;left:5%;">
            <svg width="210" height="52" viewBox="0 0 210 52">
                <path d="M10 38 Q105 18 200 38 L192 52 Q105 46 18 52 Z" fill="#005500"/>
                <path d="M5 38 Q105 16 205 38" stroke="#00AA00" stroke-width="2" fill="none"/>
                <circle cx="32" cy="30" r="9" fill="#FFD700" stroke="#AA8800" stroke-width="1"/>
                ${Array.from({length:7},(_,i)=>`<line x1="${38+i*21}" y1="34" x2="${38+i*21}" y2="23" stroke="#003300" stroke-width="1.5"/>`).join('')}
                <text x="105" y="48" text-anchor="middle" fill="#88FF88" font-size="8">競渡</text>
            </svg>
        </div>

        <div class="drum-pulse" id="drumPulse"></div>
        <div class="finish-line" id="finishLine"></div>

        <div class="banner" id="banner">
            <div class="banner-msg-r">${r}</div>
            <div class="banner-msg-b">${m}</div>
            <div class="banner-msg-s">— ${s} —</div>
        </div>
        <div class="click-hint" id="clickHint">🥁 CLICK TO BEAT THE DRUM 🥁</div>
    </div>`;

    // Idle oar animation
    const oapAnim=(id)=>gsap.to(id,{rotation:15,duration:0.4,yoyo:true,repeat:-1,ease:'sine.inOut'});

    let clicked=false;
    document.getElementById('dbScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        const tl=gsap.timeline();
        // Drum pulses
        for(let i=0;i<3;i++){
            tl.to('#drumPulse',{width:80+i*40,height:80+i*40,marginLeft:`-${40+i*20}px`,marginTop:`-${40+i*20}px`,opacity:0.8,duration:0.2},`+=${i*0.4}`);
            tl.to('#drumPulse',{opacity:0,duration:0.3});
        }
        tl.set('#finishLine',{opacity:1,right:'15%'});
        // Boats race across
        tl.to('#boat1',{x:'120vw',duration:3,ease:'power2.in'},'+=0.2');
        tl.to('#boat2',{x:'115vw',duration:3.3,ease:'power2.in'},'-=2.8');
        // Banner drops
        tl.to('#banner',{scaleY:1,opacity:1,duration:0.8,ease:'bounce.out'},'-=0.5');
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
