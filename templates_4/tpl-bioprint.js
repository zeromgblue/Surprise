export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#001A10;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    // Print layers — each line of text gets printed layer by layer
    const lines = [r, '', m, '', `— ${s} —`];
    const layerDivs = lines.map((line,i)=>`<div class="print-layer" id="layer${i}" style="opacity:0;transform:scaleY(0);transform-origin:bottom center;">${line||'&nbsp;'}</div>`).join('');

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Courier New',monospace;}
        .bg{position:absolute;inset:0;background:linear-gradient(to bottom,#001A10,#000E08,#001208);}
        .grid{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,200,80,0.05) 0,rgba(0,200,80,0.05) 1px,transparent 1px,transparent 20px),repeating-linear-gradient(90deg,rgba(0,200,80,0.05) 0,rgba(0,200,80,0.05) 1px,transparent 1px,transparent 20px);}
        .printer-track{position:absolute;top:0;left:0;right:0;height:8px;background:rgba(0,80,40,0.5);border-bottom:1px solid rgba(0,200,80,0.2);}
        .nozzle{position:absolute;top:0;left:-40px;width:40px;height:30px;z-index:10;}
        .nozzle-body{width:100%;height:20px;background:linear-gradient(to bottom,#1A3A1A,#0A2A0A);border-radius:4px;border:1px solid rgba(0,200,80,0.4);}
        .nozzle-tip{width:8px;height:12px;background:#00AA44;border-radius:0 0 4px 4px;margin:0 auto;box-shadow:0 0 8px #00FF66;}
        .nozzle-glow{position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);width:20px;height:6px;background:radial-gradient(ellipse,rgba(0,255,100,0.8),transparent);border-radius:50%;}
        .print-area{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:80%;max-width:580px;text-align:center;}
        .print-layer{color:#00FF66;line-height:1.9;overflow:hidden;}
        .print-layer:first-child{font-size:2.8em;letter-spacing:5px;text-shadow:0 0 15px #00FF44;margin-bottom:12px;}
        .print-layer:nth-child(3){font-size:1.05em;color:#80FF99;}
        .print-layer:last-child{font-size:0.95em;color:#00CC44;letter-spacing:3px;margin-top:16px;}
        .layer-glow{position:absolute;left:0;right:0;height:2px;background:linear-gradient(to right,transparent,rgba(0,255,100,0.8),transparent);opacity:0;pointer-events:none;}
        .progress-bar{position:absolute;bottom:0;left:0;height:3px;background:linear-gradient(to right,#00FF66,#00AA44);width:0%;box-shadow:0 0 8px #00FF44;}
        .click-hint{position:absolute;bottom:8%;left:50%;transform:translateX(-50%);color:rgba(0,255,100,0.7);font-size:13px;letter-spacing:4px;animation:bppulse 2s ease-in-out infinite;z-index:10;}
        @keyframes bppulse{0%,100%{opacity:0.3;}50%{opacity:1;}}
        .status{position:absolute;top:15px;right:20px;color:rgba(0,200,80,0.6);font-size:11px;letter-spacing:2px;}
    </style>
    <div class="scene" id="bpScene">
        <div class="bg"></div>
        <div class="grid"></div>
        <div class="printer-track" id="printerTrack">
            <div class="nozzle" id="nozzle">
                <div class="nozzle-body"></div>
                <div class="nozzle-tip"></div>
                <div class="nozzle-glow" id="nozzleGlow"></div>
            </div>
        </div>
        <div class="print-area" id="printArea">${layerDivs}</div>
        <div class="layer-glow" id="layerGlow"></div>
        <div class="progress-bar" id="progressBar"></div>
        <div class="status" id="status">SYSTEM READY</div>
        <div class="click-hint" id="clickHint">▶ CLICK TO BEGIN BIOPRINT ▶</div>
    </div>`;

    const scene=document.getElementById('bpScene');
    const nozzle=document.getElementById('nozzle');
    const printArea=document.getElementById('printArea');
    const layerGlow=document.getElementById('layerGlow');
    const track=document.getElementById('printerTrack');

    let clicked=false;
    document.getElementById('bpScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        document.getElementById('status').textContent='PRINTING...';

        const tl=gsap.timeline();
        const areaTop=printArea.getBoundingClientRect().top;
        const trackH=track.offsetHeight;

        // Calculate Y positions for each layer relative to viewport
        const layerEls=Array.from(document.querySelectorAll('.print-layer'));
        const totalLayers=layerEls.length;

        layerEls.forEach((el,i)=>{
            const elTop=()=>{
                const rect=el.getBoundingClientRect();
                return rect.top + rect.height/2 - trackH;
            };
            // Nozzle sweeps to this layer's Y, then prints it
            tl.to(nozzle.parentElement,{top:()=>elTop(),duration:0.6,ease:'power2.inOut'},`+=0.2`);
            tl.to(nozzle,{x:'calc(100vw + 40px)',duration:1.2,ease:'linear'},'<');
            tl.add(()=>{
                gsap.to(`#layer${i}`,{opacity:1,scaleY:1,duration:0.3,ease:'power2.out'});
                gsap.set(layerGlow,{top:()=>el.getBoundingClientRect().top+el.offsetHeight/2,opacity:1});
                gsap.to(layerGlow,{opacity:0,duration:0.3});
            },'<+=0.6');
            tl.set(nozzle,{x:'-40px'});
            tl.to('#progressBar',{width:`${((i+1)/totalLayers)*100}%`,duration:0.3},'-=0.5');
        });

        tl.set(nozzle,{opacity:0});
        tl.to('#status',{duration:0.1,onComplete:()=>{document.getElementById('status').textContent='PRINT COMPLETE ✓';}});
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
