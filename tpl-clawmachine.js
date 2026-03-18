export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#2C7A7B"; // Arcade teal
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
            
            .claw-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                background: linear-gradient(to bottom, #234E52, #285E61);
                overflow: hidden;
            }

            /* Arcade Machine Frame */
            .machine {
                position: absolute; inset: 20px; border: 20px solid #E53E3E; border-radius: 20px 20px 0 0;
                background: #1A202C; box-shadow: inset 0 0 50px #000;
                display: flex; flex-direction: column; overflow: hidden;
            }
            .machine-glass { flex: 1; position: relative; border-bottom: 20px solid #C53030; }
            .machine-base { height: 100px; background: #C53030; display:flex; align-items:center; justify-content:center; }

            /* Plushies area */
            .plushies {
                position: absolute; bottom: 0; width: 100%; height: 150px;
                background: #4A5568; display: flex; justify-content: center; align-items: flex-end; gap: 10px;
                padding-bottom: 10px;
            }
            .plush { font-size: 3rem; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.5)); transition: 0.3s; }
            
            /* The target capsule */
            .capsule {
                position: relative; width: 60px; height: 60px; border-radius: 50%;
                background: radial-gradient(circle at 30% 30%, #F6AD55, #DD6B20);
                border: 2px solid #C05621; box-shadow: 0 5px 10px rgba(0,0,0,0.5), inset 0 0 10px rgba(255,255,255,0.5);
                display: flex; align-items: center; justify-content: center; z-index: 5;
            }
            .capsule::after { content: ''; position:absolute; top:50%; width:100%; height:2px; background:rgba(0,0,0,0.2); }

            /* The Claw */
            .claw-arm {
                position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
                width: 10px; height: 200px; background: #A0AEC0; z-index: 10;
                display: flex; flex-direction: column; align-items: center;
            }
            .claw-head {
                position: absolute; bottom: -30px; width: 60px; height: 40px; border: 6px solid #CBD5E0;
                border-bottom: none; border-radius: 30px 30px 0 0;
            }

            /* Buttons */
            .joystick-btn {
                background: #FBD38D; border: 4px solid #DD6B20; font-family: 'VT323', monospace;
                font-size: 1.5rem; color: #7B341E; padding: 10px 30px; border-radius: 10px; cursor: pointer;
                box-shadow: 0 10px 0 #DD6B20; text-transform: uppercase; margin: 0 10px;
            }
            .joystick-btn:active { transform: translateY(10px); box-shadow: 0 0 0 #DD6B20; }
            .joystick-btn:disabled { opacity: 0.5; pointer-events: none; }

            .hint { position: absolute; top: 10vh; color: #4FD1C5; font-family: 'VT323', monospace; font-size: 2rem; text-shadow: 0 0 10px #319795; z-index: 20; letter-spacing: 2px; }

            /* Message revealed */
            .prize-msg {
                position: absolute; inset: 0; z-index: 30; padding: 40px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(237,137,54,0.95), #DD6B20);
            }

            .m-head { font-family: 'VT323', monospace; font-size: 3rem; color: #FFF; text-shadow: 2px 2px 0 #C05621; margin-bottom: 20px;}
            .m-body { font-family: 'VT323', monospace; font-size: 2rem; color: #FFF; line-height: 1.5; text-shadow: 1px 1px 0 #C05621; }
            
        </style>

        <div class="claw-scene">
            <div class="machine">
                <div class="machine-glass">
                    <div class="hint" id="hint" style="text-align:center; width:100%;">เลื่อนคีม<br>แล้วกดปล่อย!</div>
                    
                    <div class="claw-arm" id="arm">
                        <div class="claw-head" id="claws"></div>
                    </div>
                    
                    <div class="plushies">
                        <div class="plush">🧸</div>
                        <div class="plush">🦄</div>
                        <div class="capsule" id="target"></div>
                        <div class="plush">🐧</div>
                        <div class="plush">🐶</div>
                    </div>
                </div>
                
                <div class="machine-base">
                    <button class="joystick-btn" id="leftBtn">←</button>
                    <button class="joystick-btn" id="dropBtn">ปล่อย</button>
                    <button class="joystick-btn" id="rightBtn">→</button>
                </div>
            </div>

            <div class="prize-msg" id="msg">
                <div class="m-head">คุณได้รับรางวัล!<br>${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-head" style="font-size:1.5rem; margin-top:40px; color:#FFEBC8;">มอบโดย: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const arm = document.getElementById('arm');
    const target = document.getElementById('target');
    const msg = document.getElementById('msg');
    
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const dropBtn = document.getElementById('dropBtn');
    const hint = document.getElementById('hint');
    
    let armX = window.innerWidth / 2; // pixel center
    let isDropping = false;

    leftBtn.addEventListener('click', () => { if(!isDropping) moveArm(-30); });
    rightBtn.addEventListener('click', () => { if(!isDropping) moveArm(30); });

    function moveArm(dist) {
        armX += dist;
        gsap.to(arm, { left: armX + 'px', duration: 0.2 });
    }

    dropBtn.addEventListener('click', () => {
        if(isDropping) return;
        isDropping = true;
        leftBtn.disabled = true; rightBtn.disabled = true; dropBtn.disabled = true;
        hint.innerText = 'กำลังคีบ...';

        const armRect = document.getElementById('claws').getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        
        // Calculate distance correctly across different screen sizes
        const dropDepth = window.innerHeight - 300; 

        // 1. Drop down
        gsap.to(arm, { top: dropDepth + 'px', duration: 1.5, ease: "power1.inOut", onComplete: () => {
            
            // Check Hit logic: If claw X is close to target X
            // Simplifying for demo: almost always win if they moved it slightly near center
            const dist = Math.abs(armRect.left - targetRect.left);
            const win = dist < 70; // Generous hit box

            if(win) {
                // Grab capsule
                target.style.position = 'absolute';
                target.style.top = '10px';
                target.style.left = '-30px';
                document.getElementById('claws').appendChild(target);
                hint.innerText = 'คีบได้แล้ว!';
                
                // Pull up and win
                gsap.to(arm, { top: '-100px', duration: 1.5, ease: "power1.inOut", delay: 0.5, onComplete: () => {
                    revealMessage();
                }});
            } else {
                // Missed
                hint.innerText = 'พลาด! ลองใหม่';
                gsap.to(arm, { top: '-100px', duration: 1.5, ease: "power1.inOut", delay: 0.5, onComplete: () => {
                    isDropping = false;
                    leftBtn.disabled = false; rightBtn.disabled = false; dropBtn.disabled = false;
                }});
            }
        }});
    });

    function revealMessage() {
        // Pop the capsule open
        const flash = document.createElement('div');
        flash.style.cssText = "position:absolute; inset:0; background:#FFF; z-index:50;";
        document.body.appendChild(flash);
        gsap.to(flash, { opacity:0, duration: 1, onComplete:()=>flash.remove() });
        
        gsap.to(msg, { opacity: 1, pointerEvents:'auto', duration: 1, delay:0.5 });
    }
}

function escapeHtml(str) {
    if(!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}
