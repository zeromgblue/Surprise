export async function render(container, data, config) {
    container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#F5E6C8;";
    document.body.style.cssText="margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    const W=window.innerWidth, H=window.innerHeight;
    container.innerHTML=`
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
        .shadow-scene{position:relative;width:100vw;height:100vh;background:#F5E6C8;overflow:hidden;display:flex;align-items:center;justify-content:center;}
        .screen{width:min(500px,90vw);height:min(350px,60vw);background:#fff;border:8px solid #8B4513;border-radius:4px;box-shadow:0 0 40px rgba(139,69,19,.3),inset 0 0 20px rgba(255,200,100,.1);position:relative;overflow:hidden;cursor:pointer;}
        .lamp-glow{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 80%,rgba(255,200,100,.3),transparent 70%);pointer-events:none;}
        .shadow-char{position:absolute;bottom:0;left:30%;font-size:5rem;filter:brightness(0) contrast(1);animation:shadow-bob 2s ease-in-out infinite;}
        .shadow-char2{position:absolute;bottom:0;right:25%;font-size:4rem;filter:brightness(0) contrast(1);animation:shadow-bob 2.5s ease-in-out infinite reverse;}
        @keyframes shadow-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .frame-top,.frame-bottom{position:absolute;left:0;right:0;height:20px;background:#8B4513;}
        .frame-top{top:0;} .frame-bottom{bottom:0;}
        .oil-lamp{position:absolute;bottom:-60px;left:50%;transform:translateX(-50%);font-size:3rem;filter:drop-shadow(0 0 10px rgba(255,150,0,.6));}
        .hint{position:absolute;bottom:10%;width:100%;text-align:center;color:#8B4513;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:2px;animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        .msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:20;padding:40px;text-align:center;background:rgba(245,230,200,.96);}
        .m-head{font-family:'Sarabun',sans-serif;font-size:2.5rem;font-weight:700;color:#5D1F00;text-shadow:2px 2px 0 rgba(139,69,19,.3);margin-bottom:15px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#3D1A00;line-height:1.9;max-width:500px;font-weight:300;}
        .m-from{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#8B4513;margin-top:20px;font-weight:700;}
    </style>
    <div class="shadow-scene" id="scene">
        <div style="display:flex;flex-direction:column;align-items:center;">
            <div class="screen" id="screen">
                <div class="lamp-glow"></div>
                <div class="frame-top"></div>
                <div class="shadow-char">🐉</div>
                <div class="shadow-char2">🦅</div>
                <div class="frame-bottom"></div>
            </div>
            <div class="oil-lamp">🪔</div>
        </div>
        <div class="hint" id="hint">🌑 แตะฉากหนังตะลุง</div>
        <div class="msg-box" id="msg">
            <div class="m-head">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)}</div>
        </div>
    </div>`;
    let done=false;
    document.getElementById('screen').addEventListener('click',()=>{
        if(done)return; done=true;
        document.getElementById('hint').style.display='none';
        // fade to black first
        gsap.to('.shadow-char',{x:200,opacity:0,duration:.8});
        gsap.to('.shadow-char2',{x:-200,opacity:0,duration:.8,delay:.1});
        gsap.to('.lamp-glow',{opacity:3,duration:.5});
        gsap.to('#screen',{background:'#fff',duration:.5,delay:.5});
        setTimeout(()=>{
            gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
            gsap.from('.m-head',{scale:.8,opacity:0,duration:1,ease:'back.out'});
        },1000);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}