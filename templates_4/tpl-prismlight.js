export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#000;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const r = escapeHtml(data.receiver), m = escapeHtml(data.message), s = escapeHtml(data.sender);

    // Split message into 7 chunks for the rainbow beams
    const words=m.split(' ');
    const chunkSize=Math.ceil(words.length/7)||1;
    const chunks=[];
    for(let i=0;i<7;i++) chunks.push(words.slice(i*chunkSize,(i+1)*chunkSize).join(' '));

    const rainbowColors=['#FF0000','#FF7700','#FFEE00','#00FF00','#0099FF','#4400FF','#8800AA'];
    const angles=[-42,-28,-14,0,14,28,42]; // spread angles

    const beams=rainbowColors.map((color,i)=>`
        <div class="beam-wrap" id="bw${i}" style="position:absolute;left:50%;top:50%;transform-origin:left center;transform:rotate(${angles[i]}deg);opacity:0;">
            <div class="beam" style="background:linear-gradient(to right,${color},rgba(${parseInt(color.slice(1,3),16)},${parseInt(color.slice(3,5),16)},${parseInt(color.slice(5,7),16)},0));width:0;height:${16-Math.abs(angles[i])*0.1}px;border-radius:0 8px 8px 0;box-shadow:0 0 ${8+Math.abs(angles[i])*0.2}px ${color};margin-top:-${(16-Math.abs(angles[i])*0.1)/2}px;" id="beam${i}"></div>
            <div class="beam-text" id="bt${i}" style="position:absolute;left:55vw;top:-0.8em;color:${color};font-size:0.85em;white-space:nowrap;opacity:0;text-shadow:0 0 8px ${color};font-family:'Courier New',monospace;transform:rotate(${-angles[i]}deg);letter-spacing:2px;max-width:200px;">${chunks[i]}</div>
        </div>`).join('');

    container.innerHTML = `
    <style>
        .scene{width:100%;height:100vh;position:relative;overflow:hidden;cursor:pointer;font-family:'Courier New',monospace;background:#000;}
        .dark-room{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,#050500 0%,#000 60%);}
        .white-beam{position:absolute;top:50%;left:0;height:4px;background:linear-gradient(to right,rgba(255,255,255,0),rgba(255,255,255,0.9),rgba(255,255,255,0.7));width:0;transform:translateY(-50%);box-shadow:0 0 10px #FFF;border-radius:0 2px 2px 0;}
        .prism{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);}
        .click-hint{position:absolute;bottom:6%;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.5);font-size:13px;letter-spacing:4px;animation:plpulse 2s ease-in-out infinite;z-index:20;}
        @keyframes plpulse{0%,100%{opacity:0.3;}50%{opacity:1;}}
        .message-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;padding:40px;background:rgba(0,0,0,0.92);z-index:30;}
        .msg-receiver{font-size:3em;background:linear-gradient(90deg,#FF0000,#FF7700,#FFEE00,#00FF00,#0099FF,#8800AA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:20px;letter-spacing:5px;font-weight:bold;}
        .msg-body{font-size:1.1em;color:#E0E0E0;max-width:580px;text-align:center;line-height:1.9;margin-bottom:28px;}
        .msg-sender{font-size:1em;color:#AAA;letter-spacing:4px;}
    </style>
    <div class="scene" id="prismScene">
        <div class="dark-room"></div>
        <div class="white-beam" id="whiteBeam"></div>
        ${beams}
        <div class="prism">
            <svg width="80" height="100" viewBox="0 0 80 100">
                <defs>
                    <linearGradient id="prismGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:rgba(200,220,255,0.6)"/>
                        <stop offset="50%" style="stop-color:rgba(255,255,255,0.9)"/>
                        <stop offset="100%" style="stop-color:rgba(180,200,255,0.5)"/>
                    </linearGradient>
                </defs>
                <polygon points="40,5 75,90 5,90" fill="url(#prismGrad)" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"/>
                <polygon points="40,5 75,90 5,90" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/>
                <line x1="40" y1="5" x2="40" y2="90" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
            </svg>
        </div>
        <div class="click-hint" id="clickHint">◈ Click to Disperse Light ◈</div>
        <div class="message-panel" id="msgPanel">
            <div class="msg-receiver">${r}</div>
            <div class="msg-body">${m}</div>
            <div class="msg-sender">— ${s} —</div>
        </div>
    </div>`;

    let clicked=false;
    document.getElementById('prismScene').addEventListener('click',()=>{
        if(clicked) return; clicked=true;
        document.getElementById('clickHint').style.display='none';
        const W=window.innerWidth;
        const tl=gsap.timeline();
        // White beam enters from left
        tl.to('#whiteBeam',{width:'50%',duration:0.8,ease:'power2.out'});
        // Prism flash
        tl.to('.prism svg polygon',{fill:'rgba(255,255,255,0.95)',duration:0.1},'+=0.1');
        tl.to('.prism svg polygon',{fill:'url(#prismGrad)',duration:0.3});
        // Rainbow beams fan out
        rainbowColors.forEach((_,i)=>{
            tl.to(`#bw${i}`,{opacity:1,duration:0.2},'+=0');
            tl.to(`#beam${i}`,{width:'50vw',duration:0.8,ease:'power2.out'},'-=0.15');
            tl.to(`#bt${i}`,{opacity:1,duration:0.5},'-=0.3');
        });
        // After showing beams, transition to full message
        tl.to('.beam-wrap',{opacity:0,duration:0.5},'+=1.5');
        tl.to('#whiteBeam',{opacity:0,duration:0.5},'-=0.5');
        tl.to('#msgPanel',{opacity:1,duration:1.2},'+=0.2');
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
