export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Prompt:wght@300&display=swap');
            .vault-scene {
                position:relative; width:100vw; height:100vh;
                display:flex; align-items:center; justify-content:center;
                overflow:hidden; background:radial-gradient(ellipse at 30% 70%, #1a1a2e, #16213e, #0f3460);
            }
            /* Vault door - huge steel circle */
            .vault-door {
                position:relative; width:320px; height:320px; cursor:pointer; z-index:10;
                background:conic-gradient(from 0deg, #374151, #6b7280, #374151, #9ca3af, #374151, #6b7280, #374151);
                border-radius:50%; border:12px solid #4b5563;
                box-shadow: 0 0 60px rgba(0,0,0,0.9), inset 0 0 40px rgba(0,0,0,0.8), 0 0 0 6px #1f2937, 0 0 0 12px #374151;
                display:flex; align-items:center; justify-content:center;
                transform-style:preserve-3d;
            }
            /* Handle wheel */
            .vault-wheel {
                width:80px; height:80px;
                background:conic-gradient(from 0deg, #d97706, #fbbf24, #d97706, #fbbf24);
                border-radius:50%; border:4px solid #78350f;
                box-shadow:0 0 20px rgba(217,119,6,0.6);
                display:flex; align-items:center; justify-content:center; font-size:2rem;
                transition:0.3s;
            }
            .vault-door:hover .vault-wheel { box-shadow:0 0 40px rgba(251,191,36,0.9); }
            /* Bolts around door */
            .bolt { position:absolute; width:16px; height:16px; background:radial-gradient(circle,#9ca3af,#4b5563); border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.8); }

            .hint-text { position:absolute; bottom:14vh; color:#fbbf24; font-family:'Prompt',sans-serif; font-size:1.2rem; letter-spacing:3px; animation:pulse 2s infinite; z-index:20; pointer-events:none; }
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Gold bars behind the door */
            .gold-stack { position:absolute; z-index:5; opacity:0; }
            .gold-bar {
                width:180px; height:40px; margin:5px;
                background:linear-gradient(135deg,#fde047,#ca8a04,#fde047,#ca8a04);
                border-radius:4px; border:2px solid #78350f;
                box-shadow:0 4px 8px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.3);
                display:flex; align-items:center; justify-content:center;
                font-family:'Playfair Display',serif; color:#78350f; font-weight:700; font-size:0.9rem; letter-spacing:2px;
            }

            .vip-msg {
                position:absolute; inset:0; display:flex; flex-direction:column;
                align-items:center; justify-content:center; z-index:50; opacity:0; pointer-events:none;
                background:linear-gradient(135deg,rgba(15,52,96,0.95),rgba(26,26,46,0.98)); backdrop-filter:blur(15px);
            }
            .m-head { font-family:'Playfair Display',serif; font-size:4.5rem; color:#fde047; letter-spacing:5px; text-shadow:0 0 30px rgba(253,224,71,0.6); }
            .m-sub { font-family:'Prompt',sans-serif; font-size:0.9rem; color:#fbbf24; letter-spacing:8px; text-transform:uppercase; margin-bottom:30px; }
            .m-body { font-family:'Prompt',sans-serif; font-size:1.5rem; color:#f3f4f6; line-height:1.9; max-width:560px; text-align:center; font-weight:300; padding:30px 40px; border:1px solid rgba(253,224,71,0.4); background:rgba(0,0,0,0.3); }
            .m-foot { font-family:'Playfair Display',serif; font-size:1.2rem; color:#fbbf24; margin-top:40px; font-style:italic; }
        </style>
        <div class="vault-scene" id="scene">
            <div class="hint-text" id="hint">หมุนวงล้อเพื่อเปิดห้องนิรภัย</div>
            <div class="gold-stack" id="goldStack">
                <div class="gold-bar">GOLD RESERVE</div>
                <div class="gold-bar">GOLD RESERVE</div>
                <div class="gold-bar">GOLD RESERVE</div>
            </div>
            <div class="vault-door" id="vaultDoor">
                <div class="bolt" style="top:10px;left:50%;transform:translateX(-50%)"></div>
                <div class="bolt" style="bottom:10px;left:50%;transform:translateX(-50%)"></div>
                <div class="bolt" style="left:10px;top:50%;transform:translateY(-50%)"></div>
                <div class="bolt" style="right:10px;top:50%;transform:translateY(-50%)"></div>
                <div class="vault-wheel" id="wheel">⚙️</div>
            </div>
            <div class="vip-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-sub">— Private Message —</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
                <div class="m-foot">ด้วยความห่วงใย, ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const vaultDoor = document.getElementById('vaultDoor');
    const wheel = document.getElementById('wheel');
    const goldStack = document.getElementById('goldStack');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');

    // Idle slow rotation of door
    gsap.to(vaultDoor, {rotation:3, duration:2, yoyo:true, repeat:-1, ease:'sine.inOut'});

    let clicked = false;
    vaultDoor.addEventListener('click', () => {
        if(clicked) return;
        clicked = true;
        hint.style.display='none';
        const tl = gsap.timeline();
        // Spin wheel fast
        tl.to(wheel, {rotation:'-=720', duration:1.5, ease:'power2.inOut'})
          // Door swings open (3D perspective)
          .to(vaultDoor, {rotationY:-110, transformOrigin:'left center', duration:2, ease:'power2.inOut'}, '-=0.3')
          // Gold bars revealed
          .to(goldStack, {opacity:1, scale:1, duration:0.5}, '-=0.5')
          .from('.gold-bar', {x:-200, stagger:0.15, duration:0.8, ease:'back.out(2)'}, '-=0.3')
          // Message fades in
          .to(msg, {opacity:1, pointerEvents:'auto', duration:2}, '+=0.5')
          .from('.m-body', {scaleX:0, transformOrigin:'center', duration:1.5, ease:'power2.out'}, '-=1.5');
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
