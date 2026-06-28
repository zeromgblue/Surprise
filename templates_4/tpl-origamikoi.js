export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#0A1A1A;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Georgia',serif;}
        .pond{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 60%,#0D2828 0%,#061414 50%,#030A0A 100%);}
        .pond-ripple{position:absolute;border-radius:50%;border:1px solid rgba(0,200,160,0.15);pointer-events:none;animation:pondRipple 4s linear infinite;}
        @keyframes pondRipple{0%{transform:scale(0.5);opacity:0.5;}100%{transform:scale(2);opacity:0;}}
        .ink-trail{position:absolute;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(0,200,180,0.3),transparent);}
        .koi-wrap{position:absolute;pointer-events:none;}
        .koi-svg{filter:drop-shadow(0 0 8px rgba(255,140,0,0.5));}
        .scroll{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scaleX(0);background:linear-gradient(to bottom,#F5E6C8,#EDD9A3,#F5E6C8);border-radius:8px;padding:40px 50px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.6);max-width:500px;width:80%;transform-origin:left center;opacity:0;}
        .scroll-top{height:20px;background:linear-gradient(to right,#8B4513,#C67840,#8B4513);border-radius:4px;margin:-40px -50px 20px;position:relative;}
        .scroll-bottom{height:20px;background:linear-gradient(to right,#8B4513,#C67840,#8B4513);border-radius:4px;margin:20px -50px -40px;position:relative;}
        .scroll-receiver{font-size:2.2em;color:#3A1A00;letter-spacing:4px;margin-bottom:14px;font-weight:normal;}
        .scroll-body{font-size:1em;color:#2A1200;line-height:1.9;margin-bottom:16px;}
        .scroll-sender{font-size:0.9em;color:#6B3A00;letter-spacing:3px;font-style:italic;}
        .click-hint{position:absolute;bottom:8%;left:50%;transform:translateX(-50%);color:rgba(0,220,180,0.7);font-size:13px;letter-spacing:4px;animation:okpulse 2s ease-in-out infinite;}
        @keyframes okpulse{0%,100%{opacity:0.4;}50%{opacity:1;}}
        .lily{position:absolute;opacity:0.4;pointer-events:none;}
    </style>
    <div class="scene" id="koiScene">
        <div class="pond"></div>
        ${Array.from({length:5},(_,i)=>`<div class="pond-ripple" style="width:${100+i*80}px;height:${60+i*50}px;left:${20+i*12}%;top:${30+i*10}%;animation-delay:${i*0.8}s;margin-left:-${50+i*40}px;margin-top:-${30+i*25}px;"></div>`).join('')}

        <!-- Lily pads -->
        ${Array.from({length:5},(_,i)=>`<svg class="lily" style="left:${10+i*18}%;top:${20+i*14}%;width:50px;height:40px;" viewBox="0 0 50 40"><ellipse cx="25" cy="22" rx="22" ry="16" fill="#1A4A1A" stroke="#0A2A0A" stroke-width="1"/><path d="M25 22 L25 6" stroke="#0A2A0A" stroke-width="1" fill="none"/><circle cx="25" cy="12" r="4" fill="#FFB0C0" opacity="0.7"/></svg>`).join('')}

        <div class="koi-wrap" id="koiWrap" style="left:50%;top:50%;transform:translate(-50%,-50%);">
            <svg class="koi-svg" id="koiSvg" width="100" height="60" viewBox="0 0 100 60">
                <defs>
                    <linearGradient id="koiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#FF6600"/>
                        <stop offset="40%" style="stop-color:#FFAA00"/>
                        <stop offset="70%" style="stop-color:#FF4400"/>
                        <stop offset="100%" style="stop-color:#FF8800"/>
                    </linearGradient>
                </defs>
                <!-- Body -->
                <path d="M15 30 Q40 10 70 28 Q85 32 95 30 Q85 40 70 34 Q40 52 15 30 Z" fill="url(#koiGrad)"/>
                <!-- Tail fin -->
                <path d="M15 30 Q5 18 0 12 Q8 28 0 46 Q5 42 15 30 Z" fill="#FF6600" opacity="0.8"/>
                <!-- Top fin -->
                <path d="M45 20 Q55 8 65 18" stroke="#FF4400" stroke-width="3" fill="none" stroke-linecap="round"/>
                <!-- Scales (triangles) -->
                <path d="M40 25 L48 18 L56 25" stroke="#FF8800" stroke-width="0.5" fill="rgba(255,200,0,0.2)"/>
                <path d="M55 28 L63 21 L71 28" stroke="#FF8800" stroke-width="0.5" fill="rgba(255,200,0,0.2)"/>
                <!-- Eye -->
                <circle cx="75" cy="29" r="4" fill="#1A0A00"/>
                <circle cx="76" cy="28" r="1.5" fill="#FFD700"/>
                <!-- Whiskers -->
                <path d="M82 27 Q90 22 95 25" stroke="#FFAA00" stroke-width="1" fill="none"/>
                <path d="M82 31 Q90 36 95 33" stroke="#FFAA00" stroke-width="1" fill="none"/>
                <!-- White patches -->
                <ellipse cx="50" cy="28" rx="8" ry="5" fill="rgba(255,255,255,0.2)"/>
            </svg>
        </div>

        <div class="scroll" id="scroll">
            <div class="scroll-top"></div>
            <div class="scroll-receiver">${r}</div>
            <div class="scroll-body">${m}</div>
            <div class="scroll-sender">— ${s} —</div>
            <div class="scroll-bottom"></div>
        </div>

        <div class="click-hint" id="clickHint">〰 Click to unfold the koi 〰</div>
    </div>`;

    const trails = [];
    let angle = 0, cx = 0.5, cy = 0.5;

    // Figure-8 koi swimming
    function swimKoi(){
        const t = Date.now()/2000;
        const x = Math.sin(t)*0.28;
        const y = Math.sin(t*2)*0.14;
        const nx = (0.5+x)*window.innerWidth;
        const ny = (0.5+y)*window.innerHeight;
        const dx = nx-cx, dy = ny-cy;
        cx=nx; cy=ny;
        const a = Math.atan2(dy,dx)*180/Math.PI;
        gsap.set('#koiWrap',{left:nx,top:ny,rotation:a});
        // Add trail dot
        if(Math.random()<0.2){
            const trail=document.createElement('div');
            trail.className='ink-trail';
            const size=8+Math.random()*12;
            trail.style.cssText=`left:${nx}px;top:${ny}px;width:${size}px;height:${size}px;margin-left:-${size/2}px;margin-top:-${size/2}px;`;
            document.getElementById('koiScene').appendChild(trail);
            gsap.to(trail,{opacity:0,scale:2,duration:1.5,ease:'power1.out',onComplete:()=>trail.remove()});
        }
    }
    const swimInterval=setInterval(swimKoi,16);

    let clicked=false;
    document.getElementById('koiScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        clearInterval(swimInterval);
        document.getElementById('clickHint').style.display='none';
        const tl=gsap.timeline();
        tl.to('#koiWrap',{left:'50%',top:'50%',rotation:0,duration:0.8,ease:'power2.out'});
        tl.to('#koiSvg',{scaleX:0.1,duration:0.4,ease:'power2.in'},'-=0.2');
        tl.to('#koiWrap',{opacity:0,duration:0.3});
        tl.to('#scroll',{scaleX:1,opacity:1,duration:0.8,ease:'back.out(1.5)'},'+=0.1');
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
