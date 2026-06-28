export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#050005;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    const rings = Array.from({length:6},(_,i)=>`<div class="tp-ring" id="tpr${i}" style="width:${60+i*40}px;height:${20+i*13}px;border:${2-i*0.2}px solid rgba(${180-i*20},${50+i*20},255,${0.8-i*0.1});border-radius:50%;margin-left:-${30+i*20}px;margin-top:-${10+i*6}px;opacity:0;"></div>`).join('');

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Courier New',monospace;}
        .bg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 100%,#100010 0%,#050005 50%,#020002 100%);}
        .floor{position:absolute;bottom:0;left:0;right:0;height:30vh;background:linear-gradient(to bottom,#0A000A,#050005);border-top:1px solid rgba(150,0,255,0.2);}
        .floor-grid{position:absolute;bottom:0;left:0;right:0;height:30vh;background:repeating-linear-gradient(90deg,rgba(150,0,255,0.08) 0,rgba(150,0,255,0.08) 1px,transparent 1px,transparent 50px),repeating-linear-gradient(0deg,rgba(150,0,255,0.08) 0,rgba(150,0,255,0.08) 1px,transparent 1px,transparent 25px);}
        .tp-pad{position:absolute;bottom:30vh;left:50%;transform:translateX(-50%);width:160px;height:30px;background:radial-gradient(ellipse,rgba(150,0,255,0.4),rgba(100,0,200,0.1));border:2px solid rgba(150,0,255,0.5);border-radius:50%;box-shadow:0 0 20px rgba(150,0,255,0.3);}
        .tp-pad-detail{position:absolute;inset:4px;border-radius:50%;border:1px solid rgba(200,100,255,0.3);}
        .rings-container{position:absolute;left:50%;bottom:30vh;transform:translateX(-50%);}
        .tp-ring{position:absolute;left:50%;top:0;transform-origin:center;}
        .column{position:absolute;left:50%;bottom:30vh;transform:translateX(-50%);width:80px;background:linear-gradient(to top,rgba(200,100,255,0.3),rgba(150,50,255,0.05),transparent);height:0;opacity:0;transform-origin:bottom center;}
        .click-hint{position:absolute;bottom:5%;left:50%;transform:translateX(-50%);color:rgba(200,100,255,0.7);font-size:13px;letter-spacing:4px;animation:tppulse 2s ease-in-out infinite;z-index:10;}
        @keyframes tppulse{0%,100%{opacity:0.3;}50%{opacity:1;}}
        .column-text{position:absolute;left:50%;transform:translateX(-50%);bottom:30vh;width:300px;margin-left:-150px;text-align:center;opacity:0;}
        .col-receiver{font-size:2.8em;color:#FFD700;text-shadow:0 0 20px #CC88FF,0 0 40px #8800FF;margin-bottom:16px;letter-spacing:5px;}
        .col-body{font-size:1em;color:#E0C0FF;line-height:1.8;margin-bottom:16px;}
        .col-sender{font-size:0.9em;color:#AA66FF;letter-spacing:3px;}
        .energy-particle{position:absolute;border-radius:50%;pointer-events:none;background:rgba(200,100,255,0.8);}
        .full-msg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;padding:40px;background:rgba(5,0,5,0.92);}
        .full-r{font-size:3em;color:#FFD700;text-shadow:0 0 20px #CC88FF;margin-bottom:20px;letter-spacing:5px;}
        .full-b{font-size:1.1em;color:#E0C0FF;max-width:580px;text-align:center;line-height:1.9;margin-bottom:28px;}
        .full-s{font-size:1em;color:#AA66FF;letter-spacing:4px;}
    </style>
    <div class="scene" id="tpScene">
        <div class="bg"></div>
        <div class="floor"></div>
        <div class="floor-grid"></div>
        <div class="tp-pad" id="tpPad"><div class="tp-pad-detail"></div></div>
        <div class="rings-container" id="ringsContainer">${rings}</div>
        <div class="column" id="column"></div>
        <div class="column-text" id="columnText">
            <div class="col-receiver">${r}</div>
            <div class="col-body">${m}</div>
            <div class="col-sender">— ${s} —</div>
        </div>
        <div class="click-hint" id="clickHint">⬡ ACTIVATE TELEPORTER ⬡</div>
        <div class="full-msg" id="fullMsg">
            <div class="full-r">${r}</div>
            <div class="full-b">${m}</div>
            <div class="full-s">— ${s} —</div>
        </div>
    </div>`;

    // Pad idle pulse
    gsap.to('#tpPad',{boxShadow:'0 0 40px rgba(150,0,255,0.6)',duration:1.5,yoyo:true,repeat:-1,ease:'sine.inOut'});

    let clicked=false;
    document.getElementById('tpScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        const tl=gsap.timeline();
        // Rings rise
        for(let i=5;i>=0;i--){
            tl.to(`#tpr${i}`,{opacity:1,y:-20-i*25,duration:0.4,ease:'power2.out'},i===5?'+=0':'-=0.25');
            tl.to(`#tpr${i}`,{rotation:360*2,duration:2,ease:'power1.inOut',repeat:-1},'-=0.3');
        }
        // Column forms
        tl.to('#column',{height:'65vh',opacity:1,duration:1.2,ease:'power2.out'},'-=1');
        // Flash
        tl.to('#tpScene',{backgroundColor:'#3A00AA',duration:0.1},'-=0.1');
        tl.to('#tpScene',{backgroundColor:'#050005',duration:0.4});
        // Text materializes letter by letter
        tl.to('#columnText',{opacity:1,duration:0.5});
        // After 2s show full message
        tl.to('#fullMsg',{opacity:1,duration:1.2},'+=2');
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
