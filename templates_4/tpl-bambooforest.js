export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#041A0D;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);
    const kanjiChars = ['緑','竹','風','光','愛','心','夢','希','望','花'];

    const stalks = Array.from({length:14},(_,i)=>{
        const x = (i/13)*100;
        const h = 60+Math.random()*35;
        const w = 18+Math.random()*14;
        const shade = Math.floor(30+Math.random()*40);
        const kanji = kanjiChars[i % kanjiChars.length];
        return `<div class="stalk" id="stalk${i}" style="left:${x}%;height:${h}vh;width:${w}px;background:linear-gradient(to right,#0A3A1A,rgb(${shade},${shade+30},${shade}) ,#0A3A1A);transform-origin:bottom center;">
            <div class="kanji" style="top:${20+Math.random()*40}%;left:50%;transform:translateX(-50%);">${kanji}</div>
            ${Array.from({length:4},(__,j)=>`<div class="node" style="top:${20+j*20}%;"></div>`).join('')}
        </div>`;
    }).join('');

    container.innerHTML = `
    <style>
        *{box-sizing:border-box;}
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Georgia',serif;}
        .fog{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(4,26,13,0.9) 0%,transparent 30%,transparent 70%,rgba(4,26,13,0.95) 100%);pointer-events:none;z-index:5;}
        .ground{position:absolute;bottom:0;left:0;right:0;height:12vh;background:linear-gradient(to top,#020D06,#041A0D);z-index:3;}
        .stalk{position:absolute;bottom:0;border-radius:4px 4px 0 0;z-index:2;}
        .node{position:absolute;left:-3px;right:-3px;height:8px;background:rgba(0,60,20,0.8);border-radius:3px;}
        .kanji{position:absolute;color:rgba(100,255,120,0.7);font-size:18px;text-shadow:0 0 10px #00FF44;pointer-events:none;}
        .click-hint{position:absolute;bottom:8%;left:50%;transform:translateX(-50%);color:rgba(100,255,120,0.6);font-size:13px;letter-spacing:4px;z-index:10;animation:gpulse 2s ease-in-out infinite;}
        @keyframes gpulse{0%,100%{opacity:0.4;}50%{opacity:0.9;}}
        .message-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;background:rgba(4,10,6,0.92);z-index:20;padding:40px;}
        .msg-receiver{font-size:3em;color:#FFD700;text-shadow:0 0 20px #FFD700,0 0 40px #AA8800;margin-bottom:24px;letter-spacing:5px;}
        .msg-body{font-size:1.15em;color:#C8FFD0;max-width:600px;text-align:center;line-height:1.9;margin-bottom:28px;}
        .msg-sender{font-size:1em;color:#80FF99;letter-spacing:4px;}
        .leaf{position:absolute;width:8px;height:16px;background:#1A6B2A;border-radius:50% 0;opacity:0.7;}
    </style>
    <div class="scene" id="bambooScene">
        <div class="fog"></div>
        ${stalks}
        <div class="ground"></div>
        <div class="click-hint" id="clickHint">❧ CLICK TO FEEL THE WIND ❧</div>
        <div class="message-panel" id="msgPanel">
            <div class="msg-receiver">${r}</div>
            <div class="msg-body">${m}</div>
            <div class="msg-sender">— ${s} —</div>
        </div>
    </div>`;

    // Gentle idle sway
    for(let i=0;i<14;i++){
        gsap.to(`#stalk${i}`,{rotation:()=>(Math.random()-0.5)*4,duration:2+Math.random()*2,yoyo:true,repeat:-1,ease:'sine.inOut',delay:Math.random()*2});
        // Kanji glow pulse
        const k = document.querySelector(`#stalk${i} .kanji`);
        if(k) gsap.to(k,{opacity:0.3+Math.random()*0.7,duration:1.5+Math.random(),yoyo:true,repeat:-1,ease:'sine.inOut',delay:Math.random()*2});
    }

    let clicked = false;
    document.getElementById('bambooScene').addEventListener('click',()=>{
        if(clicked) return; clicked = true;
        document.getElementById('clickHint').style.display='none';
        const tl = gsap.timeline();
        // Wind blows all stalks aside
        for(let i=0;i<14;i++){
            const dir = i < 7 ? -1 : 1;
            tl.to(`#stalk${i}`,{rotation:dir*(25+Math.random()*20),x:dir*(100+Math.random()*80),opacity:0,duration:1.2,ease:'power3.in'},i*0.06);
        }
        tl.to('#msgPanel',{opacity:1,duration:1.2},'-=0.3');
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
