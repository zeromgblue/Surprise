export async function render(container, data, config) {
    container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#1A0500;";
    document.body.style.cssText="margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML=`
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;700&display=swap');
        .thai-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at 50% 100%,#3D0A00,#1A0500);}
        .gold-border{position:absolute;inset:20px;border:3px solid rgba(212,175,55,.3);border-radius:4px;pointer-events:none;}
        .gold-border::before,.gold-border::after{content:'✦';position:absolute;color:#D4AF37;font-size:1.5rem;}
        .gold-border::before{top:-12px;left:50%;transform:translateX(-50%);}
        .gold-border::after{bottom:-12px;left:50%;transform:translateX(-50%);}
        .petal{position:absolute;font-size:1.2rem;animation:fall-petal linear infinite;opacity:0;}
        @keyframes fall-petal{0%{opacity:0;transform:translateY(-10px) rotate(0deg)}10%{opacity:.8}90%{opacity:.5}100%{opacity:0;transform:translateY(100vh) rotate(360deg)}}
        .dancer{position:absolute;bottom:10%;left:50%;transform:translateX(-50%);font-size:7rem;filter:drop-shadow(0 0 20px rgba(212,175,55,.6));animation:thai-sway 3s ease-in-out infinite;cursor:pointer;}
        @keyframes thai-sway{0%,100%{transform:translateX(-50%) rotate(-3deg)}50%{transform:translateX(-50%) rotate(3deg)}}
        .ornament{position:absolute;font-size:2rem;animation:ornament-spin 6s linear infinite;opacity:.4;}
        .hint{position:absolute;bottom:6%;width:100%;text-align:center;color:#D4AF37;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:3px;animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        .msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:20;padding:40px;text-align:center;background:rgba(26,5,0,.92);}
        .m-head{font-family:'Sarabun',sans-serif;font-size:2.5rem;font-weight:700;color:#D4AF37;text-shadow:0 0 20px rgba(212,175,55,.5);margin-bottom:15px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#f0d8c0;line-height:1.9;max-width:500px;font-weight:300;}
        .m-from{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#D4AF37;margin-top:20px;font-weight:700;}
    </style>
    <div class="thai-scene" id="scene">
        <div class="gold-border"></div>
        <div class="dancer" id="dancer">💃</div>
        <div class="hint" id="hint">🌸 แตะนาฏศิลป์ไทย</div>
        <div class="msg-box" id="msg">
            <div class="m-head">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)}</div>
        </div>
    </div>`;
    // falling petals
    const scene=document.getElementById('scene');
    function spawnPetal(){
        const p=document.createElement('div'); p.className='petal';
        p.textContent=['🌸','🌺','🌼','✿','❀'][Math.floor(Math.random()*5)];
        p.style.cssText=`left:${Math.random()*100}%;top:-20px;animation-duration:${5+Math.random()*4}s;`;
        scene.appendChild(p); setTimeout(()=>p.remove(),9000);
    }
    const iv=setInterval(spawnPetal,400);
    // corner ornaments
    [{t:'5%',l:'5%'},{t:'5%',r:'5%'},{b:'5%',l:'5%'},{b:'5%',r:'5%'}].forEach(pos=>{
        const o=document.createElement('div'); o.className='ornament'; o.textContent='🌸';
        Object.assign(o.style,{position:'absolute',...pos}); scene.appendChild(o);
    });
    let done=false;
    document.getElementById('dancer').addEventListener('click',()=>{
        if(done)return; done=true;
        clearInterval(iv);
        document.getElementById('hint').style.display='none';
        const dancer=document.getElementById('dancer');
        dancer.style.animation='none';
        // spin and expand
        const tl=gsap.timeline();
        tl.to(dancer,{rotation:720,scale:1.5,duration:1.5,ease:'power2.inOut'})
          .to(dancer,{opacity:0,scale:0.5,duration:.4,ease:'power2.in'});
        // petals burst
        for(let i=0;i<30;i++){
            const p=document.createElement('div');
            p.style.cssText='position:absolute;font-size:1.5rem;left:50%;bottom:25%;pointer-events:none;';
            p.textContent=['🌸','🌺','🌼','✨','🌸'][i%5]; scene.appendChild(p);
            gsap.to(p,{x:(Math.random()-.5)*window.innerWidth*.8,y:-(Math.random()*window.innerHeight*.6+50),rotation:Math.random()*720,opacity:0,duration:2+Math.random(),ease:'power2.out',onComplete:()=>p.remove()});
        }
        setTimeout(()=>{
            gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
            gsap.from('.m-head',{scale:.5,opacity:0,duration:1.2,ease:'elastic.out(1,.5)'});
        },1200);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}