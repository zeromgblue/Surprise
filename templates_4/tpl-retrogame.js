export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;overflow:hidden;background:#000;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Sarabun:wght@300&display=swap');
        .rg-scene{width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#000;padding:20px;}
        .screen{width:min(360px,90vw);background:#001a00;border:4px solid #22C55E;border-radius:4px;padding:30px;text-align:center;box-shadow:0 0 30px rgba(34,197,94,.3);}
        .title{font-family:'Press Start 2P',cursive;font-size:1.2rem;color:#22C55E;margin-bottom:20px;animation:blink-txt 1s infinite;}
        @keyframes blink-txt{0%,100%{opacity:1}50%{opacity:.3}}
        .insert{font-family:'Press Start 2P',cursive;font-size:.6rem;color:#22C55E;margin:10px 0;}
        .start-btn{margin-top:20px;padding:12px 24px;background:#22C55E;color:#000;border:none;font-family:'Press Start 2P',cursive;font-size:.6rem;cursor:pointer;border-radius:2px;}
        .msg-box{display:none;text-align:left;}
        .msg-line{font-family:'Press Start 2P',cursive;font-size:.55rem;color:#22C55E;margin:8px 0;line-height:1.8;}
        .msg-name{font-size:.8rem;color:#FACC15;margin-bottom:15px;}
    </style>
    <div class="rg-scene">
        <div class="screen" id="screen">
            <div class="title">SURPRISE RPG</div>
            <div class="insert">INSERT COIN</div>
            <div class="insert" style="animation:none;opacity:.6">PRESS START</div>
            <button class="start-btn" id="startBtn">▶ START GAME</button>
            <div class="msg-box" id="msgBox">
                <div class="msg-name">${escapeHtml(data.receiver)}</div>
                <div class="msg-line" id="msgLine"></div>
                <div class="msg-line" style="color:#aaa;margin-top:15px;">— ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    </div>`;
    document.getElementById('startBtn').addEventListener('click',()=>{
        document.getElementById('startBtn').style.display='none';
        document.querySelector('.title').style.display='none';
        document.querySelector('.insert').style.display='none';
        document.querySelectorAll('.insert').forEach(e=>e.style.display='none');
        document.getElementById('msgBox').style.display='block';
        const text=data.message||'';
        const el=document.getElementById('msgLine');
        let i=0;
        const interval=setInterval(()=>{
            if(i>=text.length){clearInterval(interval);return;}
            el.textContent+=text[i]; i++;
        },50);
    });
}
function escapeHtml(str) {
    if(!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function loadScript(src) {
    return new Promise((resolve,reject) => {
        if(document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src=src; s.onload=resolve; s.onerror=reject;
        document.head.appendChild(s);
    });
}