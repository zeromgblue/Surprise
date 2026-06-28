export async function render(container, data, config) {
    container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#050510;";
    document.body.style.cssText="margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML=`
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Sarabun:wght@300;700&display=swap');
        .magic-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at 50% 80%,#0d0050,#050510);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;}
        .hat-container{position:relative;display:flex;flex-direction:column;align-items:center;}
        .hat-brim{width:200px;height:20px;background:linear-gradient(to bottom,#1a1a1a,#333);border-radius:50%;box-shadow:0 5px 15px rgba(0,0,0,.5);}
        .hat-body{width:130px;height:160px;background:linear-gradient(to bottom,#111,#222);border-radius:8px 8px 0 0;margin-top:-10px;border:2px solid #333;position:relative;overflow:hidden;}
        .hat-band{position:absolute;bottom:20px;left:0;right:0;height:15px;background:linear-gradient(to right,#8B5CF6,#EC4899);box-shadow:0 0 10px rgba(139,92,246,.5);}
        .hat-star{position:absolute;top:5px;right:10px;font-size:1.2rem;opacity:.5;}
        .rabbit{position:absolute;font-size:4rem;top:100%;left:50%;transform:translateX(-50%);filter:drop-shadow(0 0 15px rgba(255,255,255,.5));z-index:5;}
        .sparkles-layer{position:absolute;inset:0;pointer-events:none;}
        .spark{position:absolute;font-size:1.2rem;opacity:0;}
        .wand{position:absolute;right:-60px;bottom:-20px;font-size:2.5rem;transform:rotate(-30deg);animation:wand-glow 2s infinite alternate;}
        @keyframes wand-glow{0%{filter:drop-shadow(0 0 5px rgba(255,200,0,.3))}100%{filter:drop-shadow(0 0 20px rgba(255,200,0,.8))}}
        .hint{color:#8B5CF6;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:2px;margin-top:24px;animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
        .msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:20;padding:40px;text-align:center;background:rgba(5,5,16,.92);}
        .m-head{font-family:'Cinzel Decorative',cursive;font-size:2rem;color:#D8B4FE;text-shadow:0 0 25px rgba(216,180,254,.5);margin-bottom:15px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#e0d0ff;line-height:1.9;max-width:500px;}
        .m-from{font-family:'Cinzel Decorative',cursive;font-size:1rem;color:#8B5CF6;margin-top:20px;}
    </style>
    <div class="magic-scene" id="scene">
        <div class="hat-container" id="hatWrap">
            <div class="hat-body"><div class="hat-band"></div><div class="hat-star">⭐</div>
                <div class="rabbit" id="rabbit">🐇</div>
            </div>
            <div class="hat-brim"></div>
            <div class="wand">🪄</div>
        </div>
        <div class="hint" id="hint">🎩 แตะหมวกมายากล!</div>
        <div class="sparkles-layer" id="sparks"></div>
        <div class="msg-box" id="msg">
            <div class="m-head">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)}</div>
        </div>
    </div>`;
    const scene=document.getElementById('scene');
    let done=false;
    scene.addEventListener('click',()=>{
        if(done)return; done=true;
        document.getElementById('hint').style.display='none';
        // wand wave
        gsap.to('.wand',{rotation:20,duration:.2,yoyo:true,repeat:5,ease:'sine.inOut'});
        // rabbit pops out
        setTimeout(()=>{
            gsap.to('#rabbit',{top:'-120%',duration:.8,ease:'elastic.out(1,.5)'});
            // sparkle burst
            const sparks=document.getElementById('sparks');
            ['✨','⭐','💫','🌟','✨'].forEach((s,i)=>{
                const el=document.createElement('div'); el.className='spark'; el.textContent=s;
                el.style.cssText='position:absolute;font-size:1.5rem;left:50%;top:40%;';
                sparks.appendChild(el);
                gsap.to(el,{opacity:1,x:(Math.random()-.5)*300,y:(Math.random()-.5)*300,scale:Math.random()*1.5+.5,duration:1,delay:i*.1,ease:'power2.out'});
                gsap.to(el,{opacity:0,duration:.5,delay:.8+i*.1,onComplete:()=>el.remove()});
            });
            for(let i=0;i<30;i++){
                const p=document.createElement('div');
                p.style.cssText='position:absolute;width:6px;height:6px;border-radius:50%;left:50%;top:40%;';
                const colors=['#8B5CF6','#EC4899','#F9A8D4','#C084FC','#FFD700'];
                p.style.background=colors[i%5];
                sparks.appendChild(p);
                gsap.to(p,{x:(Math.random()-.5)*400,y:(Math.random()-.5)*400,opacity:0,duration:1.5+Math.random(),ease:'power2.out',onComplete:()=>p.remove()});
            }
        },300);
        setTimeout(()=>{
            gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
            gsap.from('.m-head',{y:-40,scale:.8,opacity:0,duration:1,ease:'back.out'});
        },1500);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}