export async function render(container, data, config) {
    container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#0d1117;";
    document.body.style.cssText="margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    const W=window.innerWidth, H=window.innerHeight;
    container.innerHTML=`
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700&family=Sarabun:wght@300;700&display=swap');
        .target-scene{position:relative;width:100vw;height:100vh;background:radial-gradient(ellipse at center,#1a1a2e,#0d1117);display:flex;align-items:center;justify-content:center;overflow:hidden;}
        canvas{position:absolute;inset:0;}
        .target-svg{position:absolute;cursor:pointer;filter:drop-shadow(0 0 15px rgba(220,38,38,.3));}
        .arrow-elem{position:absolute;font-size:3rem;right:-10%;top:50%;transform:translateY(-50%);pointer-events:none;filter:drop-shadow(0 0 10px rgba(255,200,0,.5));}
        .hint{position:absolute;bottom:10%;width:100%;text-align:center;color:#DC2626;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:2px;animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        .msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:20;padding:40px;text-align:center;background:rgba(13,17,23,.92);}
        .m-head{font-family:'Oswald',sans-serif;font-size:3rem;color:#DC2626;text-shadow:0 0 25px #DC2626;letter-spacing:3px;margin-bottom:15px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#e0e0e0;line-height:1.9;max-width:500px;}
        .m-from{font-family:'Oswald',sans-serif;font-size:1.1rem;color:#888;margin-top:20px;letter-spacing:2px;}
        .bullseye-flash{position:absolute;width:20px;height:20px;border-radius:50%;background:#DC2626;left:50%;top:50%;transform:translate(-50%,-50%);opacity:0;pointer-events:none;}
    </style>
    <div class="target-scene" id="scene">
        <canvas id="cvs"></canvas>
        <div class="target-svg" id="targetEl" style="left:50%;top:50%;transform:translate(-50%,-50%);">
            <svg width="240" height="240" viewBox="0 0 240 240">
                <circle cx="120" cy="120" r="115" fill="#DC2626" stroke="#8B1A1A" stroke-width="2"/>
                <circle cx="120" cy="120" r="90" fill="#fff" stroke="#ccc" stroke-width="1"/>
                <circle cx="120" cy="120" r="65" fill="#DC2626" stroke="#8B1A1A" stroke-width="1"/>
                <circle cx="120" cy="120" r="40" fill="#fff" stroke="#ccc" stroke-width="1"/>
                <circle cx="120" cy="120" r="18" fill="#DC2626"/>
                <circle cx="120" cy="120" r="6" fill="#000"/>
            </svg>
        </div>
        <div class="arrow-elem" id="arrow">🏹</div>
        <div class="bullseye-flash" id="bflash"></div>
        <div class="hint" id="hint">🎯 แตะเป้าหมาย!</div>
        <div class="msg-box" id="msg">
            <div class="m-head">🎯 ${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)} —</div>
        </div>
    </div>`;
    // pulsing target
    gsap.to('#targetEl',{scale:1.03,duration:1.5,yoyo:true,repeat:-1,ease:'sine.inOut'});
    let done=false;
    document.getElementById('targetEl').addEventListener('click',()=>{
        if(done)return; done=true;
        document.getElementById('hint').style.display='none';
        const arrow=document.getElementById('arrow');
        // shoot arrow
        gsap.to(arrow,{right:'47%',duration:.5,ease:'power4.in',onComplete:()=>{
            arrow.style.display='none';
            // impact flash
            gsap.to('#bflash',{opacity:1,scale:4,duration:.15,ease:'power2.out',onComplete:()=>{
                gsap.to('#bflash',{opacity:0,scale:1,duration:.3});
            }});
            // rings expand
            const scene=document.getElementById('scene');
            for(let i=0;i<4;i++){
                const r=document.createElement('div');
                r.style.cssText='position:absolute;border:3px solid #DC2626;border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;';
                scene.appendChild(r);
                gsap.fromTo(r,{width:20,height:20,opacity:1},{width:300,height:300,opacity:0,duration:1+i*.2,delay:i*.15,ease:'power2.out',onComplete:()=>r.remove()});
            }
            // target breaks
            gsap.to('#targetEl',{scale:0,rotation:45,opacity:0,duration:.5,delay:.2});
            setTimeout(()=>{
                gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5,delay:.2});
                gsap.from('.m-head',{x:-60,opacity:0,duration:1,delay:.4,ease:'back.out'});
            },800);
        }});
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}