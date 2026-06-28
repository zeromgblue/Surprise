export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;overflow:hidden;background:#0A1400;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;500;700&display=swap');
        .scene{width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(ellipse at center,#EC489922,#0A1400);}
        .main-icon{font-size:8rem;cursor:pointer;animation:float 3s ease-in-out infinite;filter:drop-shadow(0 10px 20px #EC489944);}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
        .hint{color:#EC4899;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:2px;margin-top:16px;animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        .msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;padding:40px;text-align:center;background:#0A1400ee;}
        .m-head{font-family:'Sarabun',sans-serif;font-size:2.5rem;font-weight:700;color:#EC4899;text-shadow:0 0 20px #EC489988;margin-bottom:15px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#e0e0e0;line-height:1.9;max-width:480px;font-weight:300;}
        .m-from{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#EC4899bb;margin-top:20px;}
    </style>
    <div class="scene">
        <div class="main-icon" id="icon">🌷</div>
        <div class="hint" id="hint">ทุ่งทิวลิปบาน</div>
        <div class="msg-box" id="msg">
            <div class="m-head">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message||'').replace(/\\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)}</div>
        </div>
    </div>`;
    let done=false;
    document.getElementById('icon').addEventListener('click',()=>{
        if(done)return; done=true;
        document.getElementById('hint').style.display='none';
        gsap.to('#icon',{scale:0,opacity:0,duration:.5,ease:'power2.in'});
        gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5,delay:.3});
        gsap.from('.m-head',{y:-30,opacity:0,duration:1,delay:.5,ease:'back.out'});
        gsap.from('.m-body',{y:20,opacity:0,duration:1,delay:.8});
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