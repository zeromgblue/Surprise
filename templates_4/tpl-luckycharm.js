export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#1A0500;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    const sparkles = Array.from({length:30},(_,i)=>`<div class="sparkle" id="sp${i}" style="left:${Math.random()*100}%;top:${Math.random()*100}%;width:${4+Math.random()*6}px;height:${4+Math.random()*6}px;animation-delay:${Math.random()*3}s;"></div>`).join('');

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Georgia',serif;display:flex;align-items:center;justify-content:center;}
        .bg-glow{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,#3A0E00 0%,#1A0500 50%,#0A0200 100%);}
        .coin-container{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);perspective:800px;}
        .coin{width:220px;height:220px;position:relative;transform-style:preserve-3d;border-radius:50%;}
        .coin-face,.coin-back{position:absolute;inset:0;border-radius:50%;backface-visibility:hidden;}
        .coin-face{background:radial-gradient(ellipse at 35% 35%,#FFE566,#FFB800,#CC8800,#7A5000);box-shadow:0 0 40px rgba(255,180,0,0.5),inset 0 0 20px rgba(255,255,100,0.2);}
        .coin-back{background:radial-gradient(ellipse at 35% 35%,#FFE566,#FFB800,#CC8800,#7A5000);transform:rotateY(180deg);box-shadow:0 0 40px rgba(255,180,0,0.5);display:flex;align-items:center;justify-content:center;flex-direction:column;}
        .coin-hole{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:60px;height:60px;border-radius:4px;background:#1A0500;box-shadow:0 0 10px rgba(0,0,0,0.8),inset 0 0 5px rgba(255,180,0,0.2);}
        .coin-text-front{position:absolute;left:50%;top:25%;transform:translateX(-50%);text-align:center;}
        .coin-text-front span{font-size:28px;color:#7A5000;text-shadow:1px 1px 2px rgba(255,220,0,0.5);}
        .coin-inner-ring{position:absolute;inset:8px;border:3px solid rgba(200,130,0,0.5);border-radius:50%;}
        .coin-outer-ring{position:absolute;inset:0;border:4px solid rgba(255,200,0,0.3);border-radius:50%;}
        .red-string{position:absolute;left:50%;top:0;transform:translateX(-50%);width:4px;height:140px;background:linear-gradient(to bottom,#CC0000,#880000);border-radius:2px;z-index:5;transform-origin:top center;}
        .string-bow{position:absolute;left:50%;top:-20px;transform:translateX(-50%);width:50px;height:30px;}
        .sparkle{position:absolute;border-radius:50%;background:radial-gradient(circle,#FFD700,rgba(255,200,0,0));animation:sparkAnim 2s ease-in-out infinite;}
        @keyframes sparkAnim{0%,100%{transform:scale(0.5);opacity:0.3;}50%{transform:scale(1.5);opacity:1;}}
        .click-hint{position:absolute;bottom:8%;left:50%;transform:translateX(-50%);color:rgba(255,180,50,0.7);font-size:13px;letter-spacing:4px;animation:lcpulse 2s ease-in-out infinite;z-index:10;}
        @keyframes lcpulse{0%,100%{opacity:0.4;}50%{opacity:1;}}
        .back-message{text-align:center;padding:10px;display:none;}
        .back-receiver{font-size:1.3em;color:#FFD700;letter-spacing:3px;margin-bottom:8px;text-shadow:0 0 8px #FF8800;}
        .back-body{font-size:0.7em;color:#FFE0A0;line-height:1.6;max-width:160px;margin:0 auto 8px;}
        .back-sender{font-size:0.65em;color:#FFA030;letter-spacing:2px;}
        .full-message{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;padding:40px;background:rgba(26,5,0,0.95);}
        .full-msg-r{font-size:3em;color:#FFD700;text-shadow:0 0 20px #FF8800;margin-bottom:20px;letter-spacing:5px;}
        .full-msg-b{font-size:1.15em;color:#FFE0A0;max-width:580px;text-align:center;line-height:1.9;margin-bottom:28px;}
        .full-msg-s{font-size:1em;color:#FFA030;letter-spacing:4px;}
    </style>
    <div class="scene" id="lcScene">
        <div class="bg-glow"></div>
        ${sparkles}
        <div class="red-string" id="redString">
            <svg class="string-bow" viewBox="0 0 50 30" style="position:absolute;top:-25px;left:-23px;">
                <path d="M25 15 Q5 0 0 10 Q5 20 25 15" fill="#CC0000"/>
                <path d="M25 15 Q45 0 50 10 Q45 20 25 15" fill="#AA0000"/>
                <circle cx="25" cy="15" r="5" fill="#FF2200"/>
            </svg>
        </div>
        <div class="coin-container">
            <div class="coin" id="coin">
                <div class="coin-face">
                    <div class="coin-outer-ring"></div>
                    <div class="coin-inner-ring"></div>
                    <div class="coin-hole"></div>
                    <div class="coin-text-front">
                        <span>福</span>
                    </div>
                    <svg style="position:absolute;inset:0;width:100%;height:100%;" viewBox="0 0 220 220">
                        <text x="110" y="175" text-anchor="middle" fill="rgba(100,60,0,0.4)" font-size="12" font-family="serif">開運招財</text>
                        <text x="110" y="55" text-anchor="middle" fill="rgba(100,60,0,0.4)" font-size="12" font-family="serif">萬事如意</text>
                    </svg>
                </div>
                <div class="coin-back">
                    <div class="coin-outer-ring"></div>
                    <div class="coin-inner-ring"></div>
                    <div class="coin-hole" style="border-radius:4px;"></div>
                    <div class="back-message" id="backMsg">
                        <div class="back-receiver">${r}</div>
                        <div class="back-body">${m}</div>
                        <div class="back-sender">— ${s} —</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="click-hint" id="clickHint">☯ Click to flip the coin ☯</div>
        <div class="full-message" id="fullMsg">
            <div class="full-msg-r">${r}</div>
            <div class="full-msg-b">${m}</div>
            <div class="full-msg-s">— ${s} —</div>
        </div>
    </div>`;

    // Idle coin spin
    gsap.to('#coin',{rotateY:15,duration:2,yoyo:true,repeat:-1,ease:'sine.inOut'});
    gsap.to('.coin-container',{y:-10,duration:2.5,yoyo:true,repeat:-1,ease:'sine.inOut'});
    gsap.to('#redString',{rotation:3,duration:2,yoyo:true,repeat:-1,ease:'sine.inOut',transformOrigin:'top center'});

    let clicked=false;
    document.getElementById('lcScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        const tl=gsap.timeline();
        tl.to('#coin',{rotateY:540,duration:1.2,ease:'power2.in'});
        tl.add(()=>{document.getElementById('backMsg').style.display='block';});
        tl.to('#coin',{rotateY:720,duration:0.8,ease:'elastic.out(1,0.5)'});
        // Sparkle burst
        for(let i=0;i<30;i++) tl.to(`#sp${i}`,{scale:3,opacity:0,duration:0.5,ease:'power2.out'},'-=0.6');
        tl.to('#fullMsg',{opacity:1,duration:1.2},'-=0.2');
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
