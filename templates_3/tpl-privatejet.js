export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Prompt:wght@300&display=swap');
            .jet-scene {
                position:relative; width:100vw; height:100vh;
                display:flex; align-items:center; justify-content:center;
                overflow:hidden;
                background:linear-gradient(180deg, #082032 0%, #334756 50%, #FF4C29 100%);
            }
            /* Fast-moving clouds */
            .cloud-box { position:absolute; inset:0; pointer-events:none; z-index:2; }
            .cloud { position:absolute; background:rgba(255,255,255,0.15); border-radius:50%; filter:blur(20px); }

            /* Jet plane CSS */
            .jet-wrap {
                position:relative; width:280px; height:100px;
                z-index:15; cursor:pointer;
                transform:translateX(-100vw);
            }
            /* Fuselage */
            .fuselage {
                position:absolute; top:30px; left:0; width:200px; height:35px;
                background:linear-gradient(135deg,#e2e8f0,#94a3b8,#e2e8f0);
                border-radius:50% 80% 80% 50%; border:1px solid #64748b;
                box-shadow:0 5px 20px rgba(0,0,0,0.5);
            }
            /* Cockpit nose */
            .nose {
                position:absolute; top:25px; right:-15px; width:50px; height:45px;
                background:linear-gradient(135deg,#bae6fd,#7dd3fc);
                border-radius:0 80% 80% 0; border:1px solid #64748b;
            }
            /* Main wing */
            .wing-main {
                position:absolute; top:50px; left:60px; width:150px; height:60px;
                background:linear-gradient(135deg,#cbd5e1,#94a3b8);
                clip-path:polygon(20% 0,100% 30%,80% 100%,0 90%);
                box-shadow:0 10px 20px rgba(0,0,0,0.4);
            }
            /* Tail wing */
            .wing-tail {
                position:absolute; top:5px; left:10px; width:70px; height:50px;
                background:linear-gradient(135deg,#94a3b8,#64748b);
                clip-path:polygon(0 100%,100% 50%,90% 100%);
            }
            /* Engines */
            .engine {
                position:absolute; width:30px; height:16px;
                background:linear-gradient(90deg,#374151,#6b7280,#374151);
                border-radius:5px; box-shadow:0 4px 8px rgba(0,0,0,0.5);
            }
            .e1 { top:65px; left:80px; }
            .e2 { top:68px; left:110px; }
            /* Engine glow */
            .engine::after { content:''; position:absolute; left:-8px; top:3px; width:12px; height:10px; background:rgba(251,191,36,0.8); border-radius:50%; filter:blur(3px); }
            /* Company livery stripe */
            .livery { position:absolute; top:38px; left:0; width:200px; height:5px; background:linear-gradient(90deg,#dc2626,#f97316,#facc15); }

            /* Banner towed behind */
            .banner-wrap {
                position:absolute; top:55px; right:-250px; z-index:14;
                display:flex; align-items:center; opacity:0;
            }
            .banner-rope { width:60px; height:2px; background:#e2e8f0; opacity:0.7; }
            .banner-flag {
                width:200px; min-height:80px; background:rgba(255,255,255,0.92);
                border:3px solid #dc2626; border-radius:4px; padding:10px;
                display:flex; flex-direction:column; align-items:center; justify-content:center;
                box-shadow:5px 5px 20px rgba(0,0,0,0.5);
            }
            .flag-name { font-family:'Orbitron',sans-serif; font-size:1.2rem; color:#0f172a; font-weight:700; text-align:center; letter-spacing:2px; }
            .flag-msg { font-family:'Prompt',sans-serif; font-size:0.75rem; color:#374151; margin-top:5px; text-align:center; }

            .hint-text { position:absolute; bottom:15vh; color:#fbbf24; font-family:'Orbitron',sans-serif; font-size:1rem; letter-spacing:3px; animation:pulse 2s infinite; z-index:20; pointer-events:none; text-transform:uppercase; text-align:center; }
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            .final-msg {
                position:absolute; inset:0; display:flex; flex-direction:column;
                align-items:center; justify-content:center; z-index:50; opacity:0; pointer-events:none;
                background:linear-gradient(135deg,rgba(8,32,50,0.92),rgba(51,71,86,0.95)); backdrop-filter:blur(10px);
            }
            .m-head { font-family:'Orbitron',sans-serif; font-size:4rem; color:#fbbf24; letter-spacing:5px; text-shadow:0 0 30px rgba(251,191,36,0.7); }
            .m-sub { font-family:'Orbitron',sans-serif; font-size:0.9rem; color:#94a3b8; letter-spacing:6px; margin-bottom:30px; }
            .m-body { font-family:'Prompt',sans-serif; font-size:1.5rem; color:#f0f9ff; line-height:2; max-width:580px; text-align:center; font-weight:300; padding:30px; border:1px solid rgba(251,191,36,0.3); }
            .m-foot { font-family:'Orbitron',sans-serif; font-size:0.9rem; color:#64748b; margin-top:30px; letter-spacing:5px; }
        </style>
        <div class="jet-scene" id="scene">
            <div class="cloud-box" id="cloudBox"></div>
            <div class="hint-text" id="hint">รอชมเครื่องบินส่วนตัว</div>
            <div class="jet-wrap" id="jet">
                <div class="wing-tail"></div>
                <div class="fuselage"><div class="livery"></div></div>
                <div class="nose"></div>
                <div class="wing-main"></div>
                <div class="engine e1"></div>
                <div class="engine e2"></div>
                <div class="banner-wrap" id="banner">
                    <div class="banner-rope"></div>
                    <div class="banner-flag">
                        <div class="flag-name">${escapeHtml(data.receiver)}</div>
                        <div class="flag-msg">${escapeHtml(data.message).substring(0,60)}...</div>
                    </div>
                </div>
            </div>
            <div class="final-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-sub">— PRIVATE MESSAGE —</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
                <div class="m-foot">FROM: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const jet = document.getElementById('jet');
    const banner = document.getElementById('banner');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const cloudBox = document.getElementById('cloudBox');

    // Spawn clouds moving right
    function spawnCloud() {
        const c = document.createElement('div');
        c.className = 'cloud';
        const sz = 80 + Math.random()*150;
        c.style.cssText = `width:${sz}px;height:${sz*0.6}px;left:${Math.random()*100}%;top:${Math.random()*80}%;`;
        cloudBox.appendChild(c);
        gsap.fromTo(c, {x:200},{x:-300, duration:8+Math.random()*6, ease:'none', onComplete:()=>c.remove()});
    }
    const cloudTimer = setInterval(spawnCloud, 800);
    spawnCloud(); spawnCloud(); spawnCloud();

    const tl = gsap.timeline({delay:1});
    hint.style.display='none';

    // 1. Jet flies in from left
    tl.to(jet, {x:0, duration:3, ease:'power2.out'})
      // 2. Banner unfurls
      .to(banner, {opacity:1, duration:0.5}, '-=1')
      .from('.banner-flag', {scaleX:0, transformOrigin:'left', duration:0.8, ease:'back.out(1)'}, '-=0.3')
      // 3. Fly past slowly
      .to(jet, {x:window.innerWidth*0.3, duration:6, ease:'none'})
      // 4. Banner flutters (wiggle)
      .to('.banner-flag', {rotationZ:5, duration:0.3, yoyo:true, repeat:10}, '-=5')
      // 5. Jet zooms off screen
      .to(jet, {x:window.innerWidth+300, duration:1.5, ease:'power2.in'})
      // 6. Full message appears
      .to(msg, {opacity:1, pointerEvents:'auto', duration:2}, '-=0.5')
      .from('.m-head', {y:-80, opacity:0, duration:1.5, ease:'power2.out'}, '-=1.5')
      .from('.m-body', {y:50, opacity:0, duration:1.5}, '-=1')
      .call(()=>clearInterval(cloudTimer));
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
