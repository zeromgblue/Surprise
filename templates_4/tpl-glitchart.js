export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#000;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    container.innerHTML = `
    <style>
        *{box-sizing:border-box;}
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Courier New',monospace;}
        .content{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;text-align:center;}
        .pre-text{color:#DDD;font-size:1.1em;font-family:'Georgia',serif;}
        .pre-receiver{font-size:2em;color:#EEE;margin-bottom:12px;letter-spacing:3px;}
        .glitch-wrap{position:relative;display:inline-block;}
        .glitch-layer{position:absolute;top:0;left:0;right:0;bottom:0;opacity:0;}
        .glitch-r{color:#FF0000;mix-blend-mode:screen;}
        .glitch-g{color:#00FF00;mix-blend-mode:screen;}
        .glitch-b{color:#0000FF;mix-blend-mode:screen;}
        .noise-overlay{position:absolute;inset:0;pointer-events:none;opacity:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.15),rgba(0,0,0,0.15) 1px,transparent 1px,transparent 2px);}
        .static-lines{position:absolute;inset:0;pointer-events:none;opacity:0;}
        .static-line{position:absolute;left:0;right:0;background:rgba(255,255,255,0.05);}
        .message-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;padding:40px;background:#000;}
        .msg-receiver{font-size:3em;color:#FFF;text-shadow:0 0 10px rgba(255,255,255,0.5);margin-bottom:20px;letter-spacing:5px;}
        .msg-body{font-size:1.15em;color:#E0E0E0;max-width:580px;text-align:center;line-height:1.9;margin-bottom:28px;font-family:'Georgia',serif;}
        .msg-sender{font-size:1em;color:#AAA;letter-spacing:4px;}
        .click-hint{position:absolute;bottom:6%;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.5);font-size:13px;letter-spacing:4px;animation:gpuls 2s ease-in-out infinite;}
        @keyframes gpuls{0%,100%{opacity:0.3;}50%{opacity:1;}}
    </style>
    <div class="scene" id="glitchScene">
        <div class="content">
            <div class="glitch-wrap" id="glitchWrap">
                <div class="pre-receiver" id="preReceiver">${r}</div>
                <div class="glitch-layer glitch-r" id="gLayerR"><div class="pre-receiver">${r}</div></div>
                <div class="glitch-layer glitch-g" id="gLayerG"><div class="pre-receiver">${r}</div></div>
                <div class="glitch-layer glitch-b" id="gLayerB"><div class="pre-receiver">${r}</div></div>
            </div>
            <div class="pre-text" id="preText" style="margin-top:16px;max-width:580px;line-height:1.8;">${m}</div>
        </div>
        <div class="noise-overlay" id="noiseOverlay"></div>
        <div class="static-lines" id="staticLines">
            ${Array.from({length:20},(_,i)=>`<div class="static-line" style="top:${Math.random()*100}%;height:${1+Math.random()*3}px;opacity:${Math.random()*0.3};"></div>`).join('')}
        </div>
        <div class="click-hint" id="clickHint">◌ CLICK TO GLITCH ◌</div>
        <div class="message-panel" id="msgPanel">
            <div class="msg-receiver">${r}</div>
            <div class="msg-body">${m}</div>
            <div class="msg-sender">— ${s} —</div>
        </div>
    </div>`;

    // Subtle idle glitch
    let idleInterval=setInterval(()=>{
        if(Math.random()>0.7){
            const x=(Math.random()-0.5)*6;
            gsap.to('#gLayerR',{x:x*1.5,y:(Math.random()-0.5)*3,opacity:0.5,duration:0.05,yoyo:true,repeat:1});
            gsap.to('#gLayerB',{x:-x,y:(Math.random()-0.5)*3,opacity:0.5,duration:0.05,yoyo:true,repeat:1});
        }
    },800);

    let clicked=false;
    document.getElementById('glitchScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        clearInterval(idleInterval);
        document.getElementById('clickHint').style.display='none';

        const tl=gsap.timeline();
        // Glitch escalates
        const glitchPhases=[
            {dur:0.05,shift:8},{dur:0.05,shift:15},{dur:0.08,shift:25},{dur:0.05,shift:40},
            {dur:0.05,shift:30},{dur:0.1,shift:50},{dur:0.05,shift:60},{dur:0.08,shift:80}
        ];
        tl.to('#noiseOverlay',{opacity:0.8,duration:0.1});
        tl.to('#staticLines',{opacity:1,duration:0.1},'-=0.05');

        glitchPhases.forEach((ph,i)=>{
            tl.to('#gLayerR',{opacity:0.8,x:ph.shift,y:(Math.random()-0.5)*10,duration:ph.dur});
            tl.to('#gLayerG',{opacity:0.6,x:-ph.shift*0.5,y:(Math.random()-0.5)*10,duration:ph.dur},`<`);
            tl.to('#gLayerB',{opacity:0.7,x:-ph.shift,y:(Math.random()-0.5)*10,duration:ph.dur},`<`);
            tl.to('#glitchWrap',{x:(Math.random()-0.5)*30,duration:ph.dur},`<`);
            // Static lines shift
            tl.to('.static-line',{y:(Math.random()-0.5)*20,duration:ph.dur,stagger:0.005},`<`);
        });
        // Peak chaos
        tl.to('#glitchScene',{filter:'blur(4px)',duration:0.1});
        tl.to('#glitchScene',{filter:'blur(0px)',duration:0.05});
        // Resolve cleanly
        tl.to('#gLayerR,#gLayerG,#gLayerB',{opacity:0,x:0,y:0,duration:0.3,ease:'power2.out'});
        tl.to('#noiseOverlay,#staticLines',{opacity:0,duration:0.3},'-=0.2');
        tl.to('#glitchWrap',{x:0,y:0,duration:0.3},'-=0.3');
        tl.to('.content',{opacity:0,duration:0.3},'+=0.1');
        tl.to('#msgPanel',{opacity:1,duration:1},'+=0.1');
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
