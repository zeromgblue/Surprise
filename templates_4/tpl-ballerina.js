export async function render(container, data, config) {
    container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#0A0014;";
    document.body.style.cssText="margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    const W=window.innerWidth, H=window.innerHeight;
    container.innerHTML=`
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,600&family=Sarabun:wght@300&display=swap');
        .ballet-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at 50% 120%,#2d0050,#0A0014);display:flex;align-items:center;justify-content:center;}
        .stage-floor{position:absolute;bottom:0;left:0;right:0;height:180px;background:linear-gradient(to top,#1a0030,transparent);}
        .spotlight{position:absolute;width:400px;height:600px;background:radial-gradient(ellipse at top,rgba(255,200,255,.08),transparent 70%);left:50%;top:0;transform:translateX(-50%);pointer-events:none;}
        .dancer-wrap{position:relative;cursor:pointer;display:flex;flex-direction:column;align-items:center;}
        .dancer{font-size:6rem;animation:spin-slow 4s linear infinite,levitate 2s ease-in-out infinite alternate;filter:drop-shadow(0 0 20px rgba(255,100,255,.5));}
        @keyframes spin-slow{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes levitate{0%{transform:translateY(0)}100%{transform:translateY(-20px)}}
        .petals-ring{position:absolute;width:200px;height:200px;border-radius:50%;pointer-events:none;}
        .petal{position:absolute;font-size:1.2rem;opacity:.6;animation:orbit 5s linear infinite;}
        @keyframes orbit{from{transform:rotate(var(--a)) translateX(90px) rotate(calc(-1*var(--a)))} to{transform:rotate(calc(var(--a)+360deg)) translateX(90px) rotate(calc(-1*(var(--a)+360deg)))}}
        .hint{color:#D8A5FF;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:3px;margin-top:20px;animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
        .msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:20;padding:40px;text-align:center;background:rgba(10,0,20,.92);}
        .m-head{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:3rem;color:#D8A5FF;text-shadow:0 0 25px rgba(216,165,255,.5);margin-bottom:15px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#e0c8ff;line-height:1.9;max-width:500px;font-weight:300;}
        .m-from{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.8rem;color:#9B59B6;margin-top:20px;}
    </style>
    <div class="ballet-scene" id="scene">
        <div class="stage-floor"></div>
        <div class="spotlight"></div>
        <div class="dancer-wrap" id="dw">
            <div class="petals-ring" id="pring"></div>
            <div class="dancer" id="dancer">🩰</div>
            <div class="hint" id="hint">💫 แตะนางระบำ</div>
        </div>
        <div class="msg-box" id="msg">
            <div class="m-head">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)}</div>
        </div>
    </div>`;
    // petal ring
    const ring=document.getElementById('pring');
    ['🌸','🌺','✨','🌷','💮','🌸','✨','🌺'].forEach((p,i)=>{
        const el=document.createElement('div'); el.className='petal'; el.textContent=p;
        el.style.setProperty('--a',i*45+'deg');
        el.style.animationDelay=i*-.6+'s';
        ring.appendChild(el);
    });
    // confetti petals
    let done=false;
    document.getElementById('dw').addEventListener('click',()=>{
        if(done)return; done=true;
        document.getElementById('hint').style.display='none';
        // speed up spin then explode
        const tl=gsap.timeline();
        tl.to('#dancer',{duration:1,filter:'drop-shadow(0 0 40px rgba(255,100,255,.9))'})
          .to('#dancer',{scale:1.5,duration:.3,ease:'power2.in'})
          .to('#dancer',{scale:0,opacity:0,duration:.3,ease:'power2.in'});
        // petals burst
        const scene=document.getElementById('scene');
        for(let i=0;i<40;i++){
            const p=document.createElement('div');
            p.style.cssText='position:absolute;font-size:1.5rem;left:50%;top:50%;pointer-events:none;';
            p.textContent=['🌸','🌺','🌷','✨','💮'][i%5];
            scene.appendChild(p);
            gsap.to(p,{x:(Math.random()-.5)*W*.8,y:(Math.random()-.5)*H*.8,rotation:Math.random()*720,opacity:0,duration:2+Math.random(),ease:'power2.out',onComplete:()=>p.remove()});
        }
        setTimeout(()=>{
            gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
            gsap.from('.m-head',{scale:.5,opacity:0,duration:1.2,ease:'elastic.out(1,.5)'});
        },800);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}