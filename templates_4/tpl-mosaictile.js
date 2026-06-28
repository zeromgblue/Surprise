export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#1A1A2E;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    const COLS=16, ROWS=12;
    const tileColors=[
        '#E63946','#457B9D','#1D3557','#A8DADC','#F1FAEE',
        '#E9C46A','#F4A261','#E76F51','#264653','#2A9D8F',
        '#8338EC','#3A86FF','#FB5607','#FFBE0B','#FF006E'
    ];

    const tiles=[];
    for(let row=0;row<ROWS;row++){
        for(let col=0;col<COLS;col++){
            const color=tileColors[Math.floor(Math.random()*tileColors.length)];
            const dist=Math.hypot(col-COLS/2,row-ROWS/2);
            tiles.push({row,col,color,dist,id:`tile_${row}_${col}`});
        }
    }
    // Sort center-first for reveal
    const sorted=[...tiles].sort((a,b)=>a.dist-b.dist);

    const tileHTML=tiles.map(t=>`<div class="tile" id="${t.id}" style="grid-column:${t.col+1};grid-row:${t.row+1};background:${t.color};transform:rotateY(180deg);backface-visibility:hidden;"></div>`).join('');

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Georgia',serif;}
        .bg{position:absolute;inset:0;background:linear-gradient(135deg,#1A1A2E,#16213E,#0F3460);}
        .tile-grid{position:absolute;inset:0;display:grid;grid-template-columns:repeat(${COLS},1fr);grid-template-rows:repeat(${ROWS},1fr);gap:2px;padding:2px;}
        .tile{border-radius:2px;transition:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1);}
        .tile.face-up{transform:rotateY(0deg)!important;transition:transform 0.4s ease;}
        .click-hint{position:absolute;bottom:6%;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.7);font-size:13px;letter-spacing:4px;animation:mtpulse 2s ease-in-out infinite;z-index:20;}
        @keyframes mtpulse{0%,100%{opacity:0.3;}50%{opacity:1;}}
        .message-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;padding:40px;background:rgba(26,26,46,0.92);z-index:30;}
        .msg-receiver{font-size:3em;color:#FFE066;text-shadow:0 0 20px #FF8800;margin-bottom:20px;letter-spacing:5px;}
        .msg-body{font-size:1.15em;color:#E0E0FF;max-width:580px;text-align:center;line-height:1.9;margin-bottom:28px;}
        .msg-sender{font-size:1em;color:#A89FC0;letter-spacing:4px;}
    </style>
    <div class="scene" id="mosaicScene">
        <div class="bg"></div>
        <div class="tile-grid" id="tileGrid">${tileHTML}</div>
        <div class="click-hint" id="clickHint">◈ Click to Reveal the Mosaic ◈</div>
        <div class="message-panel" id="msgPanel">
            <div class="msg-receiver">${r}</div>
            <div class="msg-body">${m}</div>
            <div class="msg-sender">— ${s} —</div>
        </div>
    </div>`;

    // Subtle tile shimmer idle
    tiles.forEach((t,i)=>{
        gsap.to(`#${t.id}`,{opacity:0.6+Math.random()*0.4,duration:1+Math.random()*2,yoyo:true,repeat:-1,delay:Math.random()*2});
    });

    let clicked=false;
    document.getElementById('mosaicScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        tiles.forEach(t=>gsap.killTweensOf(`#${t.id}`));

        const tl=gsap.timeline({onComplete:()=>{
            setTimeout(()=>gsap.to('#msgPanel',{opacity:1,duration:1.2}),400);
        }});

        sorted.forEach((t,i)=>{
            tl.add(()=>{
                const el=document.getElementById(t.id);
                if(el) el.classList.add('face-up');
            },i*0.018);
        });
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
