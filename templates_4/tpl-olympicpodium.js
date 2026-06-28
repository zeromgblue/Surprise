export async function render(container, data, config) {
    container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#020617;";
    document.body.style.cssText="margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js');
    container.innerHTML=`
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700&family=Sarabun:wght@300;700&display=swap');
        .oly-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at top,#0a1628,#020617);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;}
        .rings{position:absolute;top:8%;left:50%;transform:translateX(-50%);display:flex;gap:5px;}
        .ring{width:50px;height:50px;border:5px solid;border-radius:50%;}
        .r1{border-color:#0085C7;} .r2{border-color:#000;} .r3{border-color:#DF0024;} .r4{border-color:#F4C300;} .r5{border-color:#009F6B;}
        .podium-wrap{display:flex;align-items:flex-end;gap:8px;margin-bottom:0;width:80%;max-width:500px;}
        .podium-block{flex:1;border-radius:4px 4px 0 0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:12px;position:relative;cursor:pointer;}
        .p1{height:180px;background:linear-gradient(to top,#C0960C,#FFD700);box-shadow:0 0 30px rgba(255,215,0,.4);}
        .p2{height:140px;background:linear-gradient(to top,#888,#C0C0C0);box-shadow:0 0 20px rgba(192,192,192,.3);}
        .p3{height:110px;background:linear-gradient(to top,#6B3A2A,#CD7F32);box-shadow:0 0 20px rgba(205,127,50,.3);}
        .p-num{font-family:'Oswald',sans-serif;font-size:2rem;font-weight:700;color:rgba(0,0,0,.5);}
        .medal{font-size:2.5rem;position:absolute;top:-45px;}
        .athlete{font-size:2rem;position:absolute;top:-90px;opacity:0;}
        .glow{position:absolute;inset:0;background:radial-gradient(circle,rgba(255,215,0,.1),transparent 70%);pointer-events:none;}
        .msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:20;padding:40px;text-align:center;background:rgba(2,6,23,.92);}
        .m-head{font-family:'Oswald',sans-serif;font-size:3rem;color:#FFD700;text-shadow:0 0 25px rgba(255,215,0,.7);letter-spacing:3px;margin-bottom:15px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#d0d0f0;line-height:1.9;max-width:500px;}
        .m-from{font-family:'Oswald',sans-serif;font-size:1.2rem;color:#C0960C;margin-top:20px;letter-spacing:3px;}
        .anthem{position:absolute;bottom:12%;color:#FFD700;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:2px;animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
    </style>
    <div class="oly-scene" id="scene">
        <div class="glow"></div>
        <div class="rings"><div class="ring r1"></div><div class="ring r2"></div><div class="ring r3"></div><div class="ring r4"></div><div class="ring r5"></div></div>
        <div class="podium-wrap">
            <div class="podium-block p2" id="p2"><div class="medal">🥈</div><div class="athlete" id="a2">🤸</div><div class="p-num">2</div></div>
            <div class="podium-block p1" id="p1"><div class="medal">🥇</div><div class="athlete" id="a1">🏆</div><div class="p-num">1</div></div>
            <div class="podium-block p3" id="p3"><div class="medal">🥉</div><div class="athlete" id="a3">🤸</div><div class="p-num">3</div></div>
        </div>
        <div class="anthem" id="hint">🏅 แตะโพเดียมทองเพื่อรับเหรียญ</div>
        <div class="msg-box" id="msg">
            <div class="m-head">🥇 ${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)} —</div>
        </div>
    </div>`;
    let done=false;
    document.getElementById('p1').addEventListener('click',()=>{
        if(done)return; done=true;
        document.getElementById('hint').style.display='none';
        // raise athletes
        gsap.to('#a1',{opacity:1,y:-20,duration:.8,ease:'back.out(2)',delay:.1});
        gsap.to('#a2',{opacity:1,duration:.6,delay:.3});
        gsap.to('#a3',{opacity:1,duration:.6,delay:.5});
        // spotlight
        gsap.to('.glow',{background:'radial-gradient(circle at 50% 60%,rgba(255,215,0,.3),transparent 60%)',duration:1});
        // confetti
        setTimeout(()=>{
            confetti({particleCount:200,spread:100,origin:{y:.5},colors:['#FFD700','#C0960C','#fff','#4169E1']});
        },500);
        setTimeout(()=>{
            gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5,delay:.3});
            gsap.from('.m-head',{scale:.5,opacity:0,duration:1,delay:.5,ease:'elastic.out(1,.5)'});
        },2000);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}