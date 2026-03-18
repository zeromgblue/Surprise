export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#2D3748"; // Safe metallic grey
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Kanit:wght@300;600&display=swap');
            
            .vault-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                background: radial-gradient(circle, #4A5568 0%, #1A202C 100%);
                overflow: hidden;
            }

            /* The Vault Door */
            .vault-door {
                position: relative; width: 350px; height: 350px;
                background: linear-gradient(135deg, #718096, #2D3748);
                border-radius: 50%; border: 15px solid #4A5568;
                box-shadow: inset 0 0 20px #000, 0 10px 30px rgba(0,0,0,0.8);
                display: flex; align-items: center; justify-content: center;
                z-index: 10;
            }

            /* Spinning Wheel Dial */
            .dial {
                width: 250px; height: 250px; border-radius: 50%;
                background: linear-gradient(135deg, #A0AEC0, #4A5568);
                border: 10px dashed #2D3748; box-shadow: 0 0 15px rgba(0,0,0,0.5);
                display: flex; align-items: center; justify-content: center;
                cursor: grab; transition: transform 0.1s;
            }
            .dial:active { cursor: grabbing; }

            .dial-handle { width: 40px; height: 40px; background: #E2E8F0; border-radius: 50%; box-shadow: inset 0 -5px 10px rgba(0,0,0,0.3); }

            /* Keypad Display */
            .display-panel {
                position: absolute; top: 15vh;
                background: #000; border: 4px solid #4A5568; border-radius: 10px;
                padding: 10px 30px; color: #48BB78; font-family: 'Share Tech Mono', monospace;
                font-size: 2.5rem; text-shadow: 0 0 10px #48BB78; box-shadow: 0 5px 15px rgba(0,0,0,0.5);
                letter-spacing: 5px; z-index: 15;
            }

            .hint { position: absolute; bottom: 15vh; color: #CBD5E0; font-family: 'Kanit', sans-serif; font-size: 1.2rem; z-index: 20; }

            /* Message Inside Vault */
            .wealth-msg {
                position: absolute; inset: 0; z-index: 30; padding: 40px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(237,137,54,0.1) 0%, #1A202C 100%);
            }

            .m-head { font-family: 'Kanit', sans-serif; font-weight:600; font-size: 2.5rem; color: #F6AD55; text-shadow: 0 0 20px #DD6B20; margin-bottom: 20px;}
            .m-body { font-family: 'Kanit', sans-serif; font-weight:300; font-size: 1.5rem; color: #E2E8F0; line-height: 1.6; }
            
            /* Gold Bars background when open */
            .gold-stack {
                position: absolute; inset:0; z-index:5; opacity:0;
                background: repeating-linear-gradient(45deg, #DD6B20, #DD6B20 20px, #F6AD55 20px, #F6AD55 40px);
                mix-blend-mode: overlay; pointer-events:none;
            }
        </style>

        <div class="vault-scene" id="scene">
            <div class="gold-stack" id="gold"></div>
            
            <div class="display-panel" id="screen">_ _ _</div>
            <div class="hint" id="hint">หมุนเพื่อถอดรหัส (0/3)</div>

            <div class="vault-door" id="door">
                <div class="dial" id="dial">
                    <div class="dial-handle"></div>
                </div>
            </div>

            <div class="wealth-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-head" style="font-size:1.2rem; margin-top:40px; color:#48BB78; text-shadow:none;">อนุญาตโดย: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const dial = document.getElementById('dial');
    const screen = document.getElementById('screen');
    const hint = document.getElementById('hint');
    const door = document.getElementById('door');
    const msg = document.getElementById('msg');
    const gold = document.getElementById('gold');
    
    let isDragging = false;
    let currentAngle = 0;
    let lastX = 0;
    let codesCracked = 0;
    let unlocked = false;

    // Simulate dial spinning interaction
    dial.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('mousemove', e => {
        if(!isDragging || unlocked) return;
        let delta = e.clientX - lastX;
        currentAngle += delta;
        dial.style.transform = `rotate(${currentAngle}deg)`;
        lastX = e.clientX;

        // Arbitrary "cracking" check when they spin enough
        if(Math.abs(delta) > 20 && Math.random() > 0.8) {
            triggerLockTick();
        }
    });

    // ถึงuch support
    dial.addEventListener('touchstart', e => { isDragging = true; lastX = e.touches[0].clientX; });
    window.addEventListener('touchend', () => { isDragging = false; });
    window.addEventListener('touchmove', e => {
        if(!isDragging || unlocked) return;
        let delta = e.touches[0].clientX - lastX;
        currentAngle += delta;
        dial.style.transform = `rotate(${currentAngle}deg)`;
        lastX = e.touches[0].clientX;

        if(Math.abs(delta) > 10 && Math.random() > 0.85) {
            triggerLockTick();
        }
    });

    function triggerLockTick() {
        if(unlocked) return;
        codesCracked++;
        
        // Haptic feedback illusion
        gsap.to(door, { x: 5, duration: 0.05, yoyo: true, repeat: 1 });
        screen.style.color = '#F6E05E'; // yellow flash
        setTimeout(()=> { if(!unlocked) screen.style.color = '#48BB78'; }, 200);

        if(codesCracked === 1) { screen.innerText = '* _ _'; hint.innerText = 'เยี่ยม.. หมุนต่อเลย (1/3)'; }
        if(codesCracked === 2) { screen.innerText = '* * _'; hint.innerText = 'ใกล้แล้ว.. (2/3)'; }
        if(codesCracked >= 3) {
            unlocked = true;
            screen.innerText = '* * *';
            screen.style.color = '#48BB78';
            hint.style.display = 'none';
            openVault();
        }
    }

    function openVault() {
        const tl = gsap.timeline();
        screen.innerText = "ปลดล็อกแล้ว";
        
        tl.to(door, { scale: 1.1, duration: 0.5, ease: "power2.out" })
          .to(door, { x: 500, opacity: 0, duration: 1.5, ease: "power3.in" }, "+=0.5") // Slide door away
          .to(gold, { opacity: 0.3, duration: 1 }, "-=1")
          .to('#screen', { opacity: 0, duration: 0.5 }, "-=1")
          .to(msg, { opacity: 1, pointerEvents:'auto', duration: 1.5, ease:"power2.out" }, "-=0.5");
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
