export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#02000A;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    const lasers = Array.from({length:8},(_,i)=>`<div class="laser" id="laser${i}" style="left:${10+i*11}%;transform:rotate(${-30+i*8}deg);background:${['#FF00FF','#00FFFF','#FF0080','#8000FF','#FF4400','#00FF88','#FF00AA','#4400FF'][i]};"></div>`).join('');
    const confettiBits = Array.from({length:60},(_,i)=>`<div class="confetti-bit" id="conf${i}" style="left:${Math.random()*100}%;background:${['#FF00FF','#00FFFF','#FFD700','#FF0080','#00FF88','#FF4400'][Math.floor(Math.random()*6)]};width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;border-radius:${Math.random()>0.5?'50%':'2px'};opacity:0;top:-20px;"></div>`).join('');

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Arial Black',sans-serif;}
        .stage-floor{position:absolute;bottom:0;left:0;right:0;height:35vh;background:linear-gradient(to bottom,#0A0020,#050010);border-top:2px solid rgba(100,0,255,0.3);}
        .stage-grid{position:absolute;bottom:0;left:0;right:0;height:35vh;background:repeating-linear-gradient(90deg,rgba(100,0,255,0.1) 0,rgba(100,0,255,0.1) 1px,transparent 1px,transparent 60px),repeating-linear-gradient(0deg,rgba(100,0,255,0.1) 0,rgba(100,0,255,0.1) 1px,transparent 1px,transparent 30px);}
        .laser{position:absolute;bottom:35vh;width:3px;height:60vh;opacity:0;transform-origin:bottom center;filter:blur(1px);box-shadow:0 0 8px currentColor;}
        .spotlight{position:absolute;bottom:35vh;border-radius:50% 50% 0 0;opacity:0;pointer-events:none;}
        .led-screen{position:absolute;top:8%;left:50%;transform:translateX(-50%);width:70%;max-width:500px;height:220px;background:#000;border:3px solid #333;border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden;}
        .led-text{font-size:2.5em;font-weight:900;letter-spacing:3px;color:#FF00FF;text-shadow:0 0 10px #FF00FF;text-align:center;}
        .countdown{font-size:6em;font-weight:900;color:#FFD700;text-shadow:0 0 30px #FFD700;opacity:0;position:absolute;}
        .confetti-bit{position:absolute;pointer-events:none;}
        .message-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;padding:30px;}
        .msg-receiver{font-size:3em;color:#FF00FF;text-shadow:0 0 20px #FF00FF,0 0 40px #8800AA;margin-bottom:16px;letter-spacing:6px;font-weight:900;}
        .msg-body{font-size:1.1em;color:#E0D0FF;max-width:580px;text-align:center;line-height:1.8;margin-bottom:24px;}
        .msg-sender{font-size:1em;color:#00FFCC;letter-spacing:4px;}
        .click-hint{position:absolute;bottom:5%;left:50%;transform:translateX(-50%);color:rgba(255,0,255,0.7);font-size:13px;letter-spacing:4px;animation:kpulse 1.5s ease-in-out infinite;}
        @keyframes kpulse{0%,100%{opacity:0.3;}50%{opacity:1;}}
    </style>
    <div class="scene" id="kpopScene">
        <div class="stage-floor"></div>
        <div class="stage-grid"></div>
        ${lasers}
        <div class="spotlight" id="spot1" style="left:25%;width:120px;height:45vh;background:radial-gradient(ellipse,rgba(255,0,255,0.15),transparent);"></div>
        <div class="spotlight" id="spot2" style="left:55%;width:120px;height:45vh;background:radial-gradient(ellipse,rgba(0,255,255,0.15),transparent);"></div>
        <div class="led-screen">
            <div class="led-text" id="ledText">♪ LOADING... ♪</div>
            <div class="countdown" id="countdown"></div>
        </div>
        ${confettiBits}
        <div class="click-hint" id="clickHint">▶ CLICK TO START THE SHOW ▶</div>
        <div class="message-panel" id="msgPanel">
            <div class="msg-receiver">${r}</div>
            <div class="msg-body">${m}</div>
            <div class="msg-sender">— ${s} —</div>
        </div>
    </div>`;

    // Idle laser sweep
    for(let i=0;i<8;i++){
        gsap.to(`#laser${i}`,{opacity:()=>0.3+Math.random()*0.5,rotation:`+=${(Math.random()-0.5)*20}`,duration:()=>0.8+Math.random()*0.8,yoyo:true,repeat:-1,ease:'sine.inOut',delay:Math.random()});
    }
    gsap.to('#spot1',{x:80,duration:2,yoyo:true,repeat:-1,ease:'sine.inOut'});
    gsap.to('#spot2',{x:-80,duration:2.3,yoyo:true,repeat:-1,ease:'sine.inOut'});

    let clicked=false;
    document.getElementById('kpopScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        const tl=gsap.timeline();
        tl.to('#ledText',{text:{value:'♪ LOADING... ♪'},duration:0.5});
        tl.to('#ledText',{opacity:0,duration:0.3},'+=0.5');
        // Countdown
        const cdEl=document.getElementById('countdown');
        ['3','2','1'].forEach((n,i)=>{
            tl.set(cdEl,{opacity:1,scale:0.5,text:n},`+=0.1`);
            tl.to(cdEl,{scale:1.5,opacity:0,duration:0.7,ease:'power2.out'});
        });
        // BOOM
        tl.set(cdEl,{opacity:0});
        tl.to('#kpopScene',{backgroundColor:'#FFF',duration:0.1},'+=0.1');
        tl.to('#kpopScene',{backgroundColor:'#02000A',duration:0.3});
        // Lasers go wild
        for(let i=0;i<8;i++) tl.to(`#laser${i}`,{opacity:1,rotation:`+=${(i%2===0?1:-1)*60}`,duration:0.5,ease:'power4.out'},'-=0.4');
        // Confetti rain
        for(let i=0;i<60;i++){
            tl.to(`#conf${i}`,{top:'110%',y:0,rotation:Math.random()*720,x:(Math.random()-0.5)*200,opacity:1,duration:2+Math.random()*2,ease:'power1.in'},`-=${1.5}`);
        }
        tl.to('#msgPanel',{opacity:1,duration:1},'-=1');
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
