export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#1A0020;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);
    const letters = r.toUpperCase().split('').slice(0,8);
    while(letters.length < 8) letters.push('✦');

    const petalAngles = [0,45,90,135,180,225,270,315];
    const petals = petalAngles.map((angle,i)=>`
        <div class="petal-wrap" id="pw${i}" style="transform:rotate(${angle}deg);transform-origin:50% 50%;position:absolute;left:50%;top:50%;margin-left:-20px;margin-top:-90px;width:40px;height:90px;">
            <div class="petal" id="petal${i}" style="transform:rotateX(80deg);transform-origin:bottom center;">
                <span class="petal-letter">${letters[i]||'✦'}</span>
            </div>
        </div>`).join('');

    const ripples = Array.from({length:5},(_,i)=>`<div class="ripple" id="ripple${i}" style="width:${80+i*60}px;height:${80+i*60}px;margin-left:-${40+i*30}px;margin-top:-${40+i*30}px;animation-delay:${i*0.8}s;"></div>`).join('');

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Georgia',serif;}
        .water{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 60%,#1E003A 0%,#0E0018 50%,#050008 100%);}
        .water-shimmer{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(100,0,200,0.05) 41px);}
        .lotus-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:300px;height:300px;perspective:600px;}
        .bud{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:50px;height:70px;background:radial-gradient(ellipse,#FF88BB,#CC2266);border-radius:50% 50% 40% 40%;z-index:10;box-shadow:0 0 20px rgba(255,100,170,0.6);}
        .petal-wrap{position:absolute;left:50%;top:50%;width:40px;height:90px;transform-origin:bottom center;}
        .petal{width:40px;height:80px;background:linear-gradient(to top,#FF44AA,#FFB0D8,#FFE0EE);border-radius:50% 50% 20% 20%;display:flex;align-items:flex-start;justify-content:center;padding-top:8px;box-shadow:0 -5px 20px rgba(255,100,200,0.4);}
        .petal-letter{color:#fff;font-size:1.1em;font-weight:bold;text-shadow:0 0 8px rgba(255,100,200,0.8);}
        .ripple{position:absolute;left:50%;top:50%;border:1px solid rgba(150,50,200,0.3);border-radius:50%;animation:rippleAnim 4s linear infinite;pointer-events:none;}
        @keyframes rippleAnim{0%{transform:scale(0.8);opacity:0.6;}100%{transform:scale(1.2);opacity:0;}}
        .click-hint{position:absolute;bottom:12%;left:50%;transform:translateX(-50%);color:rgba(255,150,220,0.7);font-size:13px;letter-spacing:4px;animation:ppulse 2s ease-in-out infinite;}
        @keyframes ppulse{0%,100%{opacity:0.4;}50%{opacity:1;}}
        .message-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;padding:40px;}
        .msg-receiver{font-size:2.8em;color:#FFB0D8;text-shadow:0 0 20px #FF44AA;margin-bottom:20px;letter-spacing:5px;}
        .msg-body{font-size:1.15em;color:#F0D0FF;max-width:580px;text-align:center;line-height:1.9;margin-bottom:28px;}
        .msg-sender{font-size:1em;color:#FF88BB;letter-spacing:4px;}
        .stars{position:absolute;inset:0;pointer-events:none;}
        .star{position:absolute;background:#fff;border-radius:50%;animation:twinkle 3s ease-in-out infinite;}
        @keyframes twinkle{0%,100%{opacity:0.2;}50%{opacity:0.8;}}
    </style>
    <div class="scene" id="lotusScene">
        <div class="water"></div>
        <div class="water-shimmer"></div>
        <div class="stars" id="stars"></div>
        <div class="ripple-container" style="position:absolute;left:50%;top:50%;">${ripples}</div>
        <div class="lotus-center">
            ${petals}
            <div class="bud" id="bud"></div>
        </div>
        <div class="click-hint" id="clickHint">✿ Click to Bloom ✿</div>
        <div class="message-panel" id="msgPanel">
            <div class="msg-receiver">${r}</div>
            <div class="msg-body">${m}</div>
            <div class="msg-sender">— ${s} —</div>
        </div>
    </div>`;

    const starsEl = document.getElementById('stars');
    for(let i=0;i<60;i++){
        const star = document.createElement('div');
        star.className='star';
        const size=1+Math.random()*3;
        star.style.cssText=`width:${size}px;height:${size}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*3}s;`;
        starsEl.appendChild(star);
    }

    gsap.to('#bud',{scaleY:1.1,duration:1.5,yoyo:true,repeat:-1,ease:'sine.inOut'});

    let clicked=false;
    document.getElementById('lotusScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        const tl=gsap.timeline();
        tl.to('#bud',{scale:0,opacity:0,duration:0.5,ease:'back.in'});
        for(let i=0;i<8;i++){
            tl.to(`#petal${i}`,{rotateX:0,duration:0.6,ease:'back.out(1.5)'},`-=0.3`);
        }
        tl.to('#msgPanel',{opacity:1,duration:1},`+=0.4`);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
