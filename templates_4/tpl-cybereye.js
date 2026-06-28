export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#000A0A;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    // Build iris segments
    const irisSegs = Array.from({length:12},(_,i)=>
        `<div class="iris-seg" id="iseg${i}" style="transform:rotate(${i*30}deg);"></div>`
    ).join('');

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Courier New',monospace;display:flex;align-items:center;justify-content:center;}
        .bg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,#001818 0%,#000A0A 60%,#000505 100%);}
        .scanlines{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,200,0.03) 4px);pointer-events:none;animation:scanMove 4s linear infinite;}
        @keyframes scanMove{0%{background-position:0 0;}100%{background-position:0 40px;}}
        .eye-container{position:relative;width:340px;height:340px;}
        .eye-outer{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,#001A1A,#003A3A,#001A1A,#002A2A,#001A1A);border:3px solid rgba(0,255,200,0.4);box-shadow:0 0 30px rgba(0,255,200,0.2),inset 0 0 30px rgba(0,0,0,0.5);}
        .iris-ring{position:absolute;inset:20px;border-radius:50%;overflow:hidden;transform:scaleY(0.05);background:#000;}
        .iris-seg{position:absolute;left:50%;top:0;width:2px;height:50%;background:linear-gradient(to bottom,rgba(0,255,180,0.8),rgba(0,180,120,0.3));transform-origin:bottom center;border-radius:1px 1px 0 0;}
        .iris-inner{position:absolute;inset:15px;border-radius:50%;background:radial-gradient(circle,#001010,#003030,#001A1A);border:1px solid rgba(0,255,180,0.2);}
        .pupil{position:absolute;inset:35px;border-radius:50%;background:#000;display:flex;align-items:center;justify-content:center;z-index:5;}
        .scan-laser{position:absolute;left:0;right:0;height:3px;background:linear-gradient(to right,transparent,rgba(0,255,180,0.9),transparent);top:50%;transform:translateY(-50%);opacity:0;box-shadow:0 0 8px rgba(0,255,180,0.7);}
        .scan-text{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;padding:20px;}
        .scan-receiver{font-size:1.1em;color:#00FF88;text-shadow:0 0 8px #00FF44;letter-spacing:3px;text-align:center;margin-bottom:8px;}
        .scan-body{font-size:0.65em;color:#80FFB0;line-height:1.6;text-align:center;max-width:180px;margin-bottom:8px;}
        .scan-sender{font-size:0.6em;color:#00CC66;letter-spacing:2px;}
        .click-hint{position:absolute;bottom:6%;left:50%;transform:translateX(-50%);color:rgba(0,255,180,0.7);font-size:13px;letter-spacing:4px;animation:cepulse 2s ease-in-out infinite;pointer-events:none;}
        @keyframes cepulse{0%,100%{opacity:0.3;}50%{opacity:1;}}
        .hud-ring{position:absolute;border-radius:50%;border:1px solid rgba(0,255,180,0.15);animation:hudRot 10s linear infinite;}
        .full-msg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;padding:40px;background:rgba(0,10,10,0.92);z-index:20;}
        .full-msg-r{font-size:3em;color:#00FF88;text-shadow:0 0 20px #00CC44;margin-bottom:20px;letter-spacing:5px;}
        .full-msg-b{font-size:1.1em;color:#A0FFCC;max-width:580px;text-align:center;line-height:1.9;margin-bottom:28px;}
        .full-msg-s{font-size:1em;color:#00CC66;letter-spacing:4px;}
        @keyframes hudRot{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    </style>
    <div class="scene" id="cyberScene">
        <div class="bg"></div>
        <div class="scanlines"></div>
        ${[180,240,300].map((s2,i)=>`<div class="hud-ring" style="width:${s2}px;height:${s2}px;left:50%;top:50%;margin-left:-${s2/2}px;margin-top:-${s2/2}px;animation-duration:${8+i*3}s;animation-direction:${i%2?'reverse':'normal'};"></div>`).join('')}

        <div class="eye-container">
            <div class="eye-outer"></div>
            <div class="iris-ring" id="irisRing">
                ${irisSegs}
                <div class="iris-inner"></div>
                <div class="pupil" id="pupil">
                    <div class="scan-laser" id="scanLaser"></div>
                    <div class="scan-text" id="scanText">
                        <div class="scan-receiver">${r}</div>
                        <div class="scan-body">${m}</div>
                        <div class="scan-sender">— ${s} —</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="click-hint" id="clickHint">[ BIOMETRIC SCAN READY ]</div>
        <div class="full-msg" id="fullMsg">
            <div class="full-msg-r">${r}</div>
            <div class="full-msg-b">${m}</div>
            <div class="full-msg-s">— ${s} —</div>
        </div>
    </div>`;

    // Pupil twitch idle
    gsap.to('#pupil',{scaleX:0.9,duration:3,yoyo:true,repeat:-1,ease:'sine.inOut'});

    let clicked=false;
    document.getElementById('cyberScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        const tl=gsap.timeline();
        // Iris opens
        tl.to('#irisRing',{scaleY:1,duration:1.5,ease:'power2.out'});
        tl.to('#irisRing',{scaleX:1.05,duration:0.3,yoyo:true,repeat:1},'+=0.1');
        // Scan laser sweeps
        tl.to('#scanLaser',{opacity:1,duration:0.3},'-=0.3');
        tl.to('#scanLaser',{top:'20%',duration:0.8,ease:'power1.inOut'});
        tl.to('#scanLaser',{top:'80%',duration:0.8,ease:'power1.inOut'});
        tl.to('#scanLaser',{top:'50%',duration:0.4,opacity:0});
        // Decrypt text
        tl.to('#scanText',{opacity:1,duration:0.5},'-=0.2');
        // Full reveal after 2s
        tl.to('#fullMsg',{opacity:1,duration:1.2},'+=1.5');
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
