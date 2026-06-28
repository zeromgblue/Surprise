export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#1C1C1C;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);
    const tagColors=['#FF2200','#FF8800','#FFEE00','#00FF44','#00AAFF','#AA00FF','#FF00AA'];
    const tagColor=tagColors[Math.floor(Math.random()*tagColors.length)];
    const shadowColor=tagColors[(tagColors.indexOf(tagColor)+2)%tagColors.length];

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Arial Black','Impact',sans-serif;}
        .wall{position:absolute;inset:0;background:
            repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(0,0,0,0.15) 40px),
            repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(0,0,0,0.12) 80px),
            linear-gradient(160deg,#2A2A2A,#1C1C1C,#222,#1A1A1A);}
        .brick-row{position:absolute;left:0;right:0;height:40px;pointer-events:none;}
        .spray-can{position:absolute;width:30px;height:70px;right:20%;bottom:60%;z-index:15;transform-origin:bottom center;}
        .can-body{width:100%;height:50px;background:linear-gradient(to right,#888,#CCC,#888);border-radius:5px 5px 3px 3px;}
        .can-nozzle{width:10px;height:12px;background:#AAA;margin:0 auto;border-radius:3px 3px 0 0;}
        .spray-cloud{position:absolute;top:-10px;left:-15px;width:60px;height:40px;border-radius:50%;opacity:0;pointer-events:none;filter:blur(8px);}
        .graffiti-name{position:absolute;left:50%;top:30%;transform:translate(-50%,-50%);font-size:clamp(60px,10vw,120px);font-weight:900;color:${tagColor};text-shadow:4px 4px 0 ${shadowColor},-2px -2px 0 #000,6px 0 0 rgba(0,0,0,0.3);letter-spacing:8px;opacity:0;text-stroke:2px #000;-webkit-text-stroke:2px #000;white-space:nowrap;pointer-events:none;}
        .drip{position:absolute;width:6px;border-radius:0 0 6px 6px;pointer-events:none;background:${tagColor};opacity:0;top:0;}
        .message-area{position:absolute;left:50%;top:65%;transform:translate(-50%,-50%);text-align:center;width:80%;opacity:0;}
        .msg-body-graffiti{font-size:1.2em;color:#F0F0F0;text-shadow:1px 1px 0 #000,2px 2px 8px rgba(0,0,0,0.8);line-height:1.8;margin-bottom:16px;font-family:'Georgia',serif;font-style:italic;}
        .msg-sender-graffiti{font-size:1em;color:${tagColor};text-shadow:2px 2px 0 ${shadowColor};letter-spacing:4px;font-weight:900;}
        .click-hint{position:absolute;bottom:6%;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.6);font-size:13px;letter-spacing:4px;animation:gfpulse 2s ease-in-out infinite;z-index:20;}
        @keyframes gfpulse{0%,100%{opacity:0.3;}50%{opacity:1;}}
        .outline-tag{position:absolute;left:50%;top:30%;transform:translate(-50%,-50%);font-size:clamp(60px,10vw,120px);font-weight:900;color:transparent;-webkit-text-stroke:3px rgba(255,255,255,0.05);letter-spacing:8px;pointer-events:none;white-space:nowrap;}
    </style>
    <div class="scene" id="gfScene">
        <div class="wall"></div>

        <!-- Aged brick texture via SVG -->
        <svg style="position:absolute;inset:0;width:100%;height:100%;opacity:0.08;pointer-events:none;" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
            ${Array.from({length:15},(_,row)=>
                Array.from({length:8},(__,col)=>{
                    const xOff=(row%2)*50;
                    return `<rect x="${col*100+xOff}" y="${row*38}" width="92" height="34" rx="2" fill="none" stroke="#555" stroke-width="1"/>`;
                }).join('')
            ).join('')}
        </svg>

        <div class="outline-tag">${r}</div>
        <div class="spray-can" id="sprayCan">
            <div class="can-nozzle"></div>
            <div class="can-body"></div>
        </div>
        <div class="spray-cloud" id="sprayCloud" style="background:${tagColor};"></div>
        <div class="graffiti-name" id="graffitiName">${r}</div>

        <!-- Drips -->
        ${Array.from({length:8},(_,i)=>`<div class="drip" id="drip${i}" style="left:calc(10% + ${i*11}%);height:${20+Math.random()*60}px;"></div>`).join('')}

        <div class="message-area" id="msgArea">
            <div class="msg-body-graffiti">${m}</div>
            <div class="msg-sender-graffiti">— ${s} —</div>
        </div>

        <div class="click-hint" id="clickHint">✦ CLICK TO TAG THE WALL ✦</div>
    </div>`;

    // Can idle bob
    gsap.to('#sprayCan',{y:-5,duration:1.5,yoyo:true,repeat:-1,ease:'sine.inOut'});

    let clicked=false;
    document.getElementById('gfScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        const tl=gsap.timeline();
        // Can swings into position
        tl.to('#sprayCan',{right:'75%',bottom:'35%',rotation:-30,duration:0.8,ease:'power2.out'});
        // Spray cloud appears
        tl.to('#sprayCloud',{opacity:0.7,scale:1.5,duration:0.3},'+=0.1');
        // Name appears with spray
        tl.to('#graffitiName',{opacity:1,duration:0.8,ease:'power2.out'},'-=0.2');
        tl.to('#sprayCloud',{opacity:0,duration:0.3});
        // Can moves across while spraying
        tl.to('#sprayCan',{right:'10%',duration:1.5,ease:'linear'},'-=0.1');
        tl.to('#sprayCloud',{opacity:0.5,x:-80,duration:1.5},'-=1.5');
        tl.to('#sprayCloud',{opacity:0,duration:0.3});
        // Drips appear
        for(let i=0;i<8;i++){
            tl.to(`#drip${i}`,{opacity:1,scaleY:1,duration:0.3+Math.random()*0.3,ease:'power1.in'},'-=0.8');
            tl.to(`#drip${i}`,{top:()=>`${25+Math.random()*15}%`,duration:0.4+Math.random()*0.4,ease:'power1.in'},`-=${0.3+Math.random()*0.2}`);
        }
        tl.to('#sprayCan',{opacity:0,duration:0.4},'+=0.2');
        tl.to('#msgArea',{opacity:1,duration:1},'+=0.3');
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
