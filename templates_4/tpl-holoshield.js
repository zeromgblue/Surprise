export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#000814;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    // Generate hexagonal grid
    function hexPath(cx,cy,size){
        const pts=[];
        for(let i=0;i<6;i++){
            const a=Math.PI/180*(60*i-30);
            pts.push(`${cx+size*Math.cos(a)},${cy+size*Math.sin(a)}`);
        }
        return `M${pts.join('L')}Z`;
    }

    const HEX_SIZE=38, rows=10, cols_=14;
    let hexagons=[];
    for(let row=0;row<rows;row++){
        for(let col=0;col<cols_;col++){
            const x=col*(HEX_SIZE*1.732)+(row%2===0?0:HEX_SIZE*0.866);
            const y=row*(HEX_SIZE*1.5);
            hexagons.push({x:x-50,y:y-40,path:hexPath(x-50,y-40,HEX_SIZE-2)});
        }
    }

    // Sort from center outward
    const scx=cols_*HEX_SIZE*0.866, scy=rows*HEX_SIZE*0.75;
    hexagons.sort((a,b)=>Math.hypot(b.x-scx,b.y-scy)-Math.hypot(a.x-scx,a.y-scy));

    const hexSVG=hexagons.map((h,i)=>`<path class="hex" id="hex${i}" d="${h.path}" fill="rgba(0,180,220,0.55)" stroke="rgba(0,220,255,0.7)" stroke-width="1"/>`).join('');

    const crackPaths=[
        'M 50% 50% L 40% 35% L 30% 20%','M 50% 50% L 65% 40% L 80% 25%',
        'M 50% 50% L 35% 60% L 20% 75%','M 50% 50% L 60% 65% L 75% 80%'
    ];

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Courier New',monospace;}
        .bg{position:absolute;inset:0;background:#000814;}
        .shield-svg{position:absolute;inset:0;width:100%;height:100%;}
        .hex{transition:none;}
        .crack{position:absolute;pointer-events:none;opacity:0;}
        .crack-line{stroke:#FF4400;stroke-width:3;stroke-linecap:round;fill:none;filter:drop-shadow(0 0 4px #FF4400);}
        .breach-point{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:20px;height:20px;border-radius:50%;background:radial-gradient(circle,#FFF,#FF8800,transparent);opacity:0;pointer-events:none;}
        .click-hint{position:absolute;bottom:6%;left:50%;transform:translateX(-50%);color:rgba(0,220,255,0.8);font-size:13px;letter-spacing:4px;animation:hspulse 2s ease-in-out infinite;z-index:10;}
        @keyframes hspulse{0%,100%{opacity:0.3;}50%{opacity:1;}}
        .message-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;padding:40px;z-index:20;}
        .msg-receiver{font-size:3em;color:#00DDFF;text-shadow:0 0 20px #00AAFF,0 0 40px #0055AA;margin-bottom:20px;letter-spacing:5px;}
        .msg-body{font-size:1.1em;color:#A0E8FF;max-width:580px;text-align:center;line-height:1.9;margin-bottom:28px;}
        .msg-sender{font-size:1em;color:#0099CC;letter-spacing:4px;}
        .scanline{position:absolute;left:0;right:0;height:2px;background:rgba(0,220,255,0.3);pointer-events:none;animation:scanAnim 3s linear infinite;}
        @keyframes scanAnim{0%{top:0;}100%{top:100%;}}
    </style>
    <div class="scene" id="hsScene">
        <div class="bg"></div>
        <div class="scanline"></div>
        <svg class="shield-svg" id="shieldSvg" viewBox="0 0 ${cols_*HEX_SIZE*1.732+40} ${rows*HEX_SIZE*1.5+40}" preserveAspectRatio="xMidYMid slice">
            ${hexSVG}
        </svg>
        <div class="breach-point" id="breachPt"></div>
        <div class="click-hint" id="clickHint">⬡ CLICK TO BREACH SHIELD ⬡</div>
        <div class="message-panel" id="msgPanel">
            <div class="msg-receiver">${r}</div>
            <div class="msg-body">${m}</div>
            <div class="msg-sender">— ${s} —</div>
        </div>
    </div>`;

    // Idle hex shimmer
    hexagons.forEach((_,i)=>{
        gsap.to(`#hex${i}`,{fill:`rgba(0,${180+Math.random()*40},${220+Math.random()*35},${0.4+Math.random()*0.3})`,duration:1.5+Math.random()*2,yoyo:true,repeat:-1,delay:Math.random()*2,ease:'sine.inOut'});
    });

    let clicked=false;
    document.getElementById('hsScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        const tl=gsap.timeline();
        // Breach point appears
        tl.to('#breachPt',{opacity:1,scale:3,duration:0.4,ease:'power4.out'});
        tl.to('#breachPt',{scale:1,duration:0.2});
        // Flash hexes red near center
        tl.add(()=>{
            hexagons.forEach((_,i)=>{
                const el=document.getElementById(`hex${i}`);
                if(el) gsap.killTweensOf(el);
            });
        });
        // Shatter from center outward with stagger
        hexagons.forEach((h,i)=>{
            const dist=Math.hypot(h.x-scx,h.y-scy);
            const delay=dist/800;
            const dir=Math.atan2(h.y-scy,h.x-scx);
            tl.to(`#hex${i}`,{
                x:Math.cos(dir)*150,y:Math.sin(dir)*150,
                opacity:0,rotation:Math.random()*180,
                duration:0.5+Math.random()*0.5,
                ease:'power2.in',delay
            },'+=0');
        });
        tl.to('#msgPanel',{opacity:1,duration:1.2},`+=0.5`);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
