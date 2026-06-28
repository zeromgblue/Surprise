export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#050010;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    const neonColors=['#FF0080','#FF6600','#FFEE00','#00FF44','#00CCFF','#AA00FF','#FF0044','#FF8800','#00FFAA'];
    const letters=r.toUpperCase().split('');

    const letterDivs=letters.map((ch,i)=>`
        <div class="neon-letter" id="nl${i}" style="--neon-color:${neonColors[i%neonColors.length]};">
            <span class="neon-off">${ch}</span>
            <span class="neon-on" style="color:${neonColors[i%neonColors.length]};text-shadow:0 0 10px ${neonColors[i%neonColors.length]},0 0 20px ${neonColors[i%neonColors.length]},0 0 40px ${neonColors[i%neonColors.length]};display:none;">${ch}</span>
        </div>`).join('');

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Impact','Arial Black',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;}
        .bg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,#0F000F 0%,#050010 60%,#020008 100%);}
        .sign-board{position:relative;background:linear-gradient(to bottom,#0A0A0A,#080808);border:3px solid #222;border-radius:12px;padding:30px 40px;box-shadow:0 0 30px rgba(0,0,0,0.8),inset 0 0 20px rgba(0,0,0,0.5);margin-bottom:40px;text-align:center;}
        .sign-top{height:12px;background:repeating-linear-gradient(90deg,#AA8800,#AA8800 4px,transparent 4px,transparent 16px);margin:-30px -40px 20px;border-radius:9px 9px 0 0;}
        .sign-bottom{height:12px;background:repeating-linear-gradient(90deg,#AA8800,#AA8800 4px,transparent 4px,transparent 16px);margin:20px -40px -30px;border-radius:0 0 9px 9px;}
        .neon-letters-wrap{display:flex;gap:4px;justify-content:center;flex-wrap:wrap;padding:10px 0;}
        .neon-letter{position:relative;font-size:clamp(2.5em,6vw,5em);letter-spacing:2px;display:inline-block;}
        .neon-off{color:#222;text-shadow:none;}
        .neon-on{position:absolute;top:0;left:0;}
        @keyframes neonFlicker{0%{opacity:1;}20%{opacity:0.8;}22%{opacity:1;}40%{opacity:1;}42%{opacity:0.7;}44%{opacity:1;}80%{opacity:1;}82%{opacity:0.9;}84%{opacity:1;}100%{opacity:1;}}
        .neon-letter.lit .neon-off{display:none;}
        .neon-letter.lit .neon-on{display:inline;animation:neonFlicker 4s ease-in-out infinite;}
        .sub-sign{text-align:center;background:#080808;border:1px solid #1A1A1A;border-radius:8px;padding:20px 30px;max-width:600px;}
        .msg-body{font-size:1.1em;color:#C0C0C0;line-height:1.8;margin-bottom:16px;font-family:'Georgia',serif;font-style:italic;opacity:0;}
        .msg-sender{font-size:1em;color:#FF8800;letter-spacing:3px;text-shadow:0 0 8px #FF8800;opacity:0;}
        .click-hint{position:absolute;bottom:5%;left:50%;transform:translateX(-50%);color:rgba(255,200,0,0.6);font-size:13px;letter-spacing:4px;animation:nbpulse 2s ease-in-out infinite;z-index:10;}
        @keyframes nbpulse{0%,100%{opacity:0.3;}50%{opacity:1;}}
        .chain-left,.chain-right{position:absolute;top:-30px;width:6px;height:30px;background:repeating-linear-gradient(0deg,#888,#888 4px,transparent 4px,transparent 8px);border-radius:3px;}
        .chain-left{left:30px;}
        .chain-right{right:30px;}
        .bulb{width:10px;height:10px;border-radius:50%;display:inline-block;background:#222;border:1px solid #333;margin:0 5px;}
        .bulb.on{background:radial-gradient(circle,#FFEE88,#FFCC00);box-shadow:0 0 8px #FFCC00;animation:bulbFlicker 3s ease-in-out infinite;}
        @keyframes bulbFlicker{0%,100%{opacity:1;}50%{opacity:0.8;}75%{opacity:0.95;}}
        .bulb-row{position:absolute;bottom:-20px;left:40px;right:40px;display:flex;justify-content:space-around;}
    </style>
    <div class="scene" id="neonScene">
        <div class="bg"></div>
        <div class="sign-board">
            <div class="chain-left"></div>
            <div class="chain-right"></div>
            <div class="sign-top"></div>
            <div class="neon-letters-wrap" id="neonWrap">${letterDivs}</div>
            <div class="bulb-row">
                ${Array.from({length:8},(_,i)=>`<div class="bulb" id="bulb${i}"></div>`).join('')}
            </div>
            <div class="sign-bottom"></div>
        </div>
        <div class="sub-sign">
            <div class="msg-body" id="msgBody">${m}</div>
            <div class="msg-sender" id="msgSender">— ${s} —</div>
        </div>
        <div class="click-hint" id="clickHint">⚡ Click to Light Up ⚡</div>
    </div>`;

    // Flicker on letters staggered
    let clicked=false;
    document.getElementById('neonScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        const tl=gsap.timeline();
        const letterEls=document.querySelectorAll('.neon-letter');
        letterEls.forEach((el,i)=>{
            tl.add(()=>{
                // Flicker effect: on-off-on
                setTimeout(()=>el.classList.add('lit'),0);
                setTimeout(()=>el.classList.remove('lit'),80);
                setTimeout(()=>el.classList.add('lit'),160);
                setTimeout(()=>el.classList.remove('lit'),220);
                setTimeout(()=>el.classList.add('lit'),320);
            },i*0.15);
        });
        // Bulbs light up
        for(let i=0;i<8;i++){
            tl.add(()=>document.getElementById(`bulb${i}`).classList.add('on'),i*0.1);
        }
        tl.to('#msgBody',{opacity:1,y:0,duration:0.8,ease:'power2.out'},'+=0.4');
        tl.to('#msgSender',{opacity:1,y:0,duration:0.8,ease:'power2.out'},'-=0.3');
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
