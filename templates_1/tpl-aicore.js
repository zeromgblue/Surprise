export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#050f05"; // Dark green tech background
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const coreColor = config.to || '#00FF00';

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
            
            .lab-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                perspective: 800px;
                background: radial-gradient(circle at center, rgba(0, 255, 0, 0.05) 0%, #000 70%);
            }

            /* Tech grid in background */
            .grid-bg {
                position: absolute; inset:0;
                background-image: 
                    linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px);
                background-size: 40px 40px;
                transform: rotateX(60deg) translateY(0);
                transform-origin: bottom center;
                animation: gridMove 5s linear infinite; opacity: 0.3;
            }
            @keyframes gridMove { 0%{background-position: 0 0;} 100%{background-position: 0 40px;} }

            /* AI Core Sphere */
            .core-container {
                position: relative; width: 250px; height: 250px; cursor: pointer; z-index: 10;
                display:flex; align-items:center; justify-content:center;
            }
            .core-orb {
                position: absolute; width: 150px; height: 150px; border-radius: 50%;
                background: radial-gradient(circle, #fff 10%, ${coreColor} 40%, #003300 100%);
                box-shadow: 0 0 50px ${coreColor}, inset 0 0 30px #fff;
                animation: pulseOrb 2s infinite alternate;
                z-index: 5;
            }
            @keyframes pulseOrb { 0%{transform:scale(0.9); box-shadow: 0 0 30px ${coreColor};} 100%{transform:scale(1.1); box-shadow: 0 0 80px ${coreColor};} }

            /* Rings around core */
            .ring {
                position: absolute; border-radius: 50%;
                border: 2px solid rgba(0, 255, 0, 0.5); border-top: 2px solid #fff;
                box-shadow: 0 0 10px ${coreColor};
            }
            .ring-1 { width: 220px; height: 220px; animation: spinX 6s linear infinite; }
            .ring-2 { width: 240px; height: 240px; border-color: rgba(0,255,0,0.3); border-right:2px solid #fff; animation: spinY 8s linear infinite reverse; }
            .ring-3 { width: 260px; height: 260px; border-color: rgba(0,255,0,0.1); border-bottom:2px solid #fff; animation: spinZ 10s linear infinite; }
            
            @keyframes spinX { 100% { transform: rotateX(360deg) rotateY(180deg); } }
            @keyframes spinY { 100% { transform: rotateY(360deg) rotateZ(180deg); } }
            @keyframes spinZ { 100% { transform: rotateZ(360deg) rotateX(180deg); } }

            .hint { position: absolute; bottom: 10vh; font-family: 'VT323', monospace; color: ${coreColor}; font-size: 1.5rem; letter-spacing: 5px; animation: blink 1s infinite; pointer-events:none;}
            @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }

            /* Decoding message interface */
            .decode-screen {
                position: absolute; inset:0; background: rgba(0,20,0,0.9);
                z-index: 20; display:flex; flex-direction:column; align-items:center; justify-content:center;
                padding: 40px; opacity: 0; pointer-events: none;
            }
            
            .code-line { font-family: 'VT323', monospace; color: ${coreColor}; font-size: 1.5rem; margin-bottom: 10px; text-shadow: 0 0 5px ${coreColor}; width:100%; max-width:600px; text-align:left;}
            .highlight { color: #fff; background: ${coreColor}; padding: 0 5px; }

            .msg-chunk { font-family: 'VT323', monospace; font-size: 2rem; color: #fff; text-shadow: 0 0 10px ${coreColor}; text-align: center; margin-top: 30px; line-height:1.5; opacity:0;}
        </style>

        <div class="lab-scene">
            <div class="grid-bg"></div>
            
            <div class="core-container" id="core">
                <div class="ring ring-1"></div><div class="ring ring-2"></div><div class="ring ring-3"></div>
                <div class="core-orb" id="orb"></div>
            </div>

            <div class="hint" id="hint">ระบบรอการทำงาน - คลิกเพื่อปลุก AI</div>
            
            <div class="decode-screen" id="decode">
                <div class="code-line" id="line1">> INITIATING PROTOCOL... OK</div>
                <div class="code-line" id="line2">> DECRYPTING NEURAL PATHWAYS <span class="highlight">#04XF9</span></div>
                <div class="code-line" id="line3">> TARGET ENTITY: <span style="color:#FFF;">${escapeHtml(data.receiver)}</span></div>
                <div class="code-line" id="matrixText" style="opacity:0.5; font-size:1.2rem; word-break:break-all; margin-top:20px;"></div>
                
                <div class="msg-chunk" id="finalMsg">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="code-line" style="text-align:right; margin-top:40px; font-size:1.2rem;" id="senderLine">>> จาก: [ ${escapeHtml(data.sender)} ]</div>
            </div>
        </div>
    `;

    const core = document.getElementById('core');
    const orb = document.getElementById('orb');
    const decode = document.getElementById('decode');
    const matrixText = document.getElementById('matrixText');
    const hint = document.getElementById('hint');

    let activated = false;

    core.addEventListener('click', () => {
        if(activated) return;
        activated = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Orb Overloads
        tl.to(orb, { scale: 0.5, duration: 0.5, ease: "power2.in" })
          .to(orb, { scale: 50, duration: 1.5, ease: "power4.inOut" }) // Flash bang screen green
          
        // 2. Cut to decryption screen
          .call(() => {
              decode.style.opacity = 1;
              decode.style.pointerEvents = 'auto';
              core.style.display = 'none';
          })
          
        // 3. Command line animations
          .fromถึง('#line1', {opacity:0, x:-20}, {opacity:1, x:0, duration:0.3})
          .fromถึง('#line2', {opacity:0, x:-20}, {opacity:1, x:0, duration:0.3}, "+=0.3")
          .fromถึง('#line3', {opacity:0, x:-20}, {opacity:1, x:0, duration:0.3}, "+=0.3")
          
        // 4. Matrix decode effect
          .call(() => {
                let dur = 3000;
                let steps = dur/50;
                let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>";
                let inter = setInterval(() => {
                    let randStr = "";
                    for(let i=0; i<100; i++) randStr += chars.charAt(Math.floor(Math.random()*chars.length));
                    matrixText.innerText = randStr;
                }, 50);
                
                setTimeout(() => {
                    clearInterval(inter);
                    matrixText.style.display = 'none';
                    // 5. Reveal final message block
                    gsap.to('#finalMsg', { opacity: 1, y: -20, duration: 1, ease: "power2.out" });
                    gsap.fromถึง('#senderLine', {opacity:0}, {opacity:1, duration:1, delay:1});
                }, dur);
          });
    });

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
