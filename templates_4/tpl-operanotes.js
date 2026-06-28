export async function render(container, data, config) {
    container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#0A0014;";
    document.body.style.cssText="margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    const W=window.innerWidth, H=window.innerHeight;
    container.innerHTML=`
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,600&family=Sarabun:wght@300;700&display=swap');
        .opera-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at 50% 100%,#1a0030,#0A0014);}
        .note{position:absolute;font-size:2rem;animation:float-note linear infinite;opacity:0;cursor:default;}
        @keyframes float-note{0%{opacity:0;transform:translateY(0) rotate(0deg)}10%{opacity:.8}80%{opacity:.6}100%{opacity:0;transform:translateY(-80vh) rotate(30deg)}}
        .singer{position:absolute;bottom:5%;left:50%;transform:translateX(-50%);font-size:6rem;filter:drop-shadow(0 0 20px rgba(200,100,255,.5));animation:singer-breath 3s ease-in-out infinite;cursor:pointer;}
        @keyframes singer-breath{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.05)}}
        .spotlight{position:absolute;top:0;left:50%;transform:translateX(-50%);width:250px;height:100%;background:radial-gradient(ellipse at top,rgba(255,200,255,.1),transparent 70%);pointer-events:none;}
        .stage-floor{position:absolute;bottom:0;left:0;right:0;height:100px;background:linear-gradient(to top,#0d0020,transparent);}
        .hint{position:absolute;bottom:12%;width:100%;text-align:center;color:#D8A5FF;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:3px;animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
        .msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:20;padding:40px;text-align:center;background:rgba(10,0,20,.92);}
        .m-head{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:3rem;color:#D8A5FF;text-shadow:0 0 20px rgba(216,165,255,.5);margin-bottom:15px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#e0c0ff;line-height:1.9;max-width:500px;font-weight:300;}
        .m-from{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.8rem;color:#9B59B6;margin-top:20px;}
    </style>
    <div class="opera-scene" id="scene">
        <div class="spotlight"></div>
        <div class="stage-floor"></div>
        <div class="singer" id="singer">🎤</div>
        <div class="hint" id="hint">🎵 แตะนักร้องโอเปร่า</div>
        <div class="msg-box" id="msg">
            <div class="m-head">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)}</div>
        </div>
    </div>`;
    // auto floating notes
    const notes=['🎵','🎶','♪','♫','🎼'];
    function spawnNote(){
        const n=document.createElement('div');
        n.className='note'; n.textContent=notes[Math.floor(Math.random()*notes.length)];
        n.style.cssText=`left:${10+Math.random()*80}%;bottom:15%;animation-duration:${4+Math.random()*3}s;animation-delay:0s;`;
        document.getElementById('scene').appendChild(n);
        setTimeout(()=>n.remove(),7000);
    }
    const iv=setInterval(spawnNote,600);
    let done=false;
    document.getElementById('singer').addEventListener('click',()=>{
        if(done)return; done=true;
        clearInterval(iv);
        document.getElementById('hint').style.display='none';
        // big note burst
        const scene=document.getElementById('scene');
        for(let i=0;i<20;i++){
            const n=document.createElement('div');
            n.style.cssText='position:absolute;font-size:2.5rem;left:50%;bottom:20%;pointer-events:none;';
            n.textContent=notes[i%5]; scene.appendChild(n);
            gsap.to(n,{x:(Math.random()-.5)*W*.7,y:-(Math.random()*H*.6+50),rotation:Math.random()*360,opacity:0,duration:2,ease:'power2.out',onComplete:()=>n.remove()});
        }
        gsap.to('#singer',{scale:1.5,duration:.3,yoyo:true,repeat:2,ease:'back.out'});
        setTimeout(()=>{
            gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
            gsap.from('.m-head',{scale:.5,opacity:0,duration:1.2,ease:'elastic.out(1,.5)'});
        },1500);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}