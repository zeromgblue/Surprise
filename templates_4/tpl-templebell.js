export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#0A0600;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    const rings = Array.from({length:6},(_,i)=>`<div class="ring" id="ring${i}" style="width:${80+i*90}px;height:${80+i*90}px;margin-left:-${40+i*45}px;margin-top:-${40+i*45}px;border:${3-i*0.3}px solid rgba(255,${180-i*20},${50-i*5},${0.7-i*0.1});opacity:0;"></div>`).join('');

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Georgia',serif;display:flex;flex-direction:column;align-items:center;}
        .bg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,#1A0E00 0%,#0A0600 60%,#050300 100%);}
        .beam-frame{position:absolute;top:0;left:50%;transform:translateX(-50%);width:60px;height:120px;background:linear-gradient(to bottom,#4A2800,#2A1400);border-radius:0 0 8px 8px;}
        .chain{position:absolute;top:120px;left:50%;transform:translateX(-50%);width:6px;background:linear-gradient(to bottom,#AA8840,#8B6920);border-radius:3px;}
        .bell-wrap{position:absolute;top:160px;left:50%;transform:translateX(-50%);transform-origin:top center;}
        .bell-svg{filter:drop-shadow(0 10px 30px rgba(180,120,0,0.4));}
        .striker{position:absolute;left:50%;top:260px;transform:translateX(-50%);width:14px;height:70px;background:linear-gradient(to bottom,#5A3800,#3A2200);border-radius:7px 7px 14px 14px;transform-origin:top center;}
        .rings-container{position:absolute;top:50%;left:50%;pointer-events:none;}
        .ring{position:absolute;border-radius:50%;top:0;left:0;}
        .click-hint{position:absolute;bottom:10%;left:50%;transform:translateX(-50%);color:rgba(255,180,50,0.7);font-size:13px;letter-spacing:4px;animation:bpulse 2s ease-in-out infinite;}
        @keyframes bpulse{0%,100%{opacity:0.4;}50%{opacity:1;}}
        .message-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;padding:40px;background:rgba(10,6,0,0.9);}
        .msg-receiver{font-size:3em;color:#FFD700;text-shadow:0 0 20px #FF8800;margin-bottom:20px;letter-spacing:5px;}
        .msg-body{font-size:1.15em;color:#FFE0A0;max-width:580px;text-align:center;line-height:1.9;margin-bottom:28px;}
        .msg-sender{font-size:1em;color:#FFA030;letter-spacing:4px;}
        .stars-bg{position:absolute;inset:0;pointer-events:none;}
        .star-dot{position:absolute;background:#FFE0A0;border-radius:50%;animation:stwink 3s ease-in-out infinite;}
        @keyframes stwink{0%,100%{opacity:0.1;}50%{opacity:0.6;}}
    </style>
    <div class="scene" id="bellScene">
        <div class="bg"></div>
        <div class="stars-bg" id="starsBg"></div>

        <div class="beam-frame"></div>
        <div class="chain" id="chain" style="height:40px;top:120px;"></div>

        <div class="bell-wrap" id="bellWrap">
            <svg class="bell-svg" width="160" height="200" viewBox="0 0 160 200">
                <!-- Bell shape (bonshō) -->
                <defs>
                    <linearGradient id="bellGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#6B4500;stop-opacity:1"/>
                        <stop offset="30%" style="stop-color:#B07830;stop-opacity:1"/>
                        <stop offset="50%" style="stop-color:#D4A050;stop-opacity:1"/>
                        <stop offset="70%" style="stop-color:#B07830;stop-opacity:1"/>
                        <stop offset="100%" style="stop-color:#6B4500;stop-opacity:1"/>
                    </linearGradient>
                </defs>
                <path d="M80 10 C80 10 60 15 45 35 C30 55 20 80 18 110 C16 140 18 165 20 185 L140 185 C142 165 144 140 142 110 C140 80 130 55 115 35 C100 15 80 10 80 10 Z" fill="url(#bellGrad)"/>
                <!-- Horizontal decorative bands -->
                <path d="M22 90 Q80 85 138 90" stroke="#8B6020" stroke-width="2" fill="none"/>
                <path d="M20 130 Q80 125 140 130" stroke="#8B6020" stroke-width="2" fill="none"/>
                <!-- Bottom rim -->
                <path d="M20 185 Q80 195 140 185" stroke="#5A3A00" stroke-width="3" fill="none"/>
                <!-- Top knob -->
                <ellipse cx="80" cy="12" rx="15" ry="8" fill="#8B6020"/>
                <!-- Engravings -->
                <text x="80" y="115" text-anchor="middle" fill="rgba(200,150,50,0.4)" font-size="20" font-family="serif">梵鐘</text>
                <!-- Strike spot -->
                <circle cx="80" cy="155" r="12" fill="rgba(0,0,0,0.3)" stroke="#AA8030" stroke-width="1"/>
            </svg>
        </div>

        <div class="striker" id="striker"></div>
        <div class="rings-container" id="ringsContainer">${rings}</div>

        <div class="click-hint" id="clickHint">〜 Click to Strike the Bell 〜</div>
        <div class="message-panel" id="msgPanel">
            <div class="msg-receiver">${r}</div>
            <div class="msg-body">${m}</div>
            <div class="msg-sender">— ${s} —</div>
        </div>
    </div>`;

    const starsBg=document.getElementById('starsBg');
    for(let i=0;i<50;i++){
        const d=document.createElement('div');d.className='star-dot';
        const sz=1+Math.random()*2;
        d.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*3}s;`;
        starsBg.appendChild(d);
    }

    // Gentle idle bell sway
    gsap.to('#bellWrap',{rotation:1.5,duration:3,yoyo:true,repeat:-1,ease:'sine.inOut'});

    let clicked=false;
    document.getElementById('bellScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        const tl=gsap.timeline();
        // Striker swings
        tl.to('#striker',{rotation:-40,duration:0.3,ease:'power2.in'});
        tl.to('#striker',{rotation:15,duration:0.15,ease:'power4.out'});
        // Bell sways
        tl.to('#bellWrap',{rotation:-12,duration:0.2,ease:'power4.out'},'-=0.1');
        tl.to('#bellWrap',{rotation:8,duration:0.6,ease:'elastic.out(1,0.3)'},'-=0.05');
        // Flash
        tl.to('.bg',{background:'radial-gradient(ellipse at 50% 40%,#3A2000 0%,#1A0E00 60%,#0A0600 100%)',duration:0.1},'-=0.5');
        tl.to('.bg',{background:'radial-gradient(ellipse at 50% 40%,#1A0E00 0%,#0A0600 60%,#050300 100%)',duration:0.5});
        // Rings ripple outward
        for(let i=0;i<6;i++){
            tl.to(`#ring${i}`,{opacity:0.8,duration:0.1},`-=${0.4}`);
            tl.to(`#ring${i}`,{scale:1.3,opacity:0,duration:1.5+i*0.3,ease:'power1.out'},`-=0.05`);
        }
        tl.to('#bellWrap',{rotation:0,duration:2,ease:'elastic.out(1,0.2)'},'-=1.5');
        tl.to('#striker',{rotation:0,duration:1},'-=2');
        tl.to('#msgPanel',{opacity:1,duration:1.2},'-=0.5');
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
