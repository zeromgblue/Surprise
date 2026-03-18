export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#000000";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const colorPrimary = config.from || '#00FF41'; 
    const colorSec = config.to || '#008F11';

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Chakra+Petch:wght@400;600&display=swap');
            
            #matrix-canvas { position: absolute; inset: 0; z-index: 5; pointer-events: none; }
            
            .terminal {
                position: relative; z-index: 10; width: 90%; max-width: 600px;
                background: rgba(0, 20, 0, 0.85); border: 1px solid ${colorSec};
                box-shadow: 0 0 20px rgba(0,255,65,0.2), inset 0 0 15px rgba(0,0,0,0.8);
                padding: 30px; font-family: 'Share Tech Mono', monospace; color: ${colorPrimary};
                text-shadow: 0 0 5px ${colorPrimary}; border-radius: 5px;
                backdrop-filter: blur(3px);
                /* Scanline effect */
                background-image: linear-gradient(rgba(0,255,0,0.03) 50%, rgba(0,0,0,0.25) 50%), linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06));
                background-size: 100% 4px, 6px 100%;
            }
            
            .t-header { font-size: 1.2rem; border-bottom: 1px dashed ${colorSec}; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; }
            .t-content { font-size: 1.1rem; line-height: 1.6; min-height: 150px; font-family: 'Chakra Petch', sans-serif;}
            
            .blinking-cursor { animation: blink 1s step-end infinite; }
            @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

            .glitch-btn {
                margin-top: 30px; display: inline-block; padding: 10px 20px;
                background: transparent; border: 1px solid ${colorPrimary}; color: ${colorPrimary};
                font-family: inherit; font-size: 1.2rem; cursor: pointer; text-transform: uppercase;
                transition: all 0.2s; position: relative; overflow: hidden;
            }
            .glitch-btn:hover { background: ${colorPrimary}; color: #000; box-shadow: 0 0 15px ${colorPrimary}; }
            
            #final-msg { display: none; }
        </style>

        <canvas id="matrix-canvas"></canvas>

        <div class="terminal" id="term">
            <div class="t-header">
                <span>SYSTEM.OVERRIDE_</span>
                <span>[ENCRYPTED_STREAM_FOUND]</span>
            </div>
            <div class="t-content" id="display-area">
                > Analyzing incoming packet...<br>
                > Sender: <span style="background:${colorPrimary};color:#000;">${escapeHtml(data.sender)}</span><br>
                > Status: Encrypted...<br><br>
                <div id="cipher-text" style="color:#00aa00; font-size: 0.9rem; word-break: break-all; opacity: 0.7;"></div>
            </div>
            <button class="glitch-btn" id="btn-decrypt">[ ENTER TO DECRYPT ]</button>
        </div>
        
        <!-- Hidden actual message to be revealed -->
        <div id="final-msg">
            <div style="font-size:1.5rem; color:#fff; margin-bottom:15px;">TARGET: ${escapeHtml(data.receiver)}</div>
            <div>${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
        </div>
    `;

    // Matrix Rain Canvas Effect
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');
    let width, height, columns, drops = [];
    const fontSize = 16;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=<>?/{}[]~";

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        columns = Math.floor(width / fontSize);
        drops = [];
        for(let x = 0; x < columns; x++) drops[x] = Math.random()*-100;
    }
    window.addEventListener('resize', resize);
    resize();

    let matrixRunning = true;
    function drawMatrix() {
        if(!matrixRunning) return;
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = colorPrimary; 
        ctx.font = fontSize + "px monospace";

        for(let i = 0; i < drops.length; i++) {
            const text = chars.charAt(Math.floor(Math.random() * chars.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if(drops[i] * fontSize > height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
        requestAnimationFrame(drawMatrix);
    }
    drawMatrix();

    // Populate random cipher text
    const cipherDiv = document.getElementById('cipher-text');
    let cipherLoops = setInterval(() => {
        let str = "";
        for(let i=0; i<150; i++) str += chars.charAt(Math.floor(Math.random()*chars.length));
        cipherDiv.innerText = str;
    }, 100);

    // Interaction
    const btn = document.getElementById('btn-decrypt');
    const display = document.getElementById('display-area');
    const finalMsg = document.getElementById('final-msg').innerHTML;

    btn.addEventListener('click', () => {
        btn.style.display = 'none';
        clearInterval(cipherLoops);
        cipherDiv.innerText = "";
        
        // Matrix halt
        matrixRunning = false;
        gsap.to(canvas, { opacity: 0, duration: 2 });
        
        // Terminal glitch effect
        const tl = gsap.timeline();
        tl.to('#term', { x: 10, y: -5, duration: 0.05, yoyo: true, repeat: 5 })
          .to('#term', { opacity: 0.5, filter: 'invert(1)', duration: 0.1 })
          .to('#term', { opacity: 1, filter: 'none', duration: 0.1 })
          .call(() => {
              // Start Decrypting Text effect
              display.innerHTML = "> ACCESS GRANTED.<br>> DECRYPTING PAYLOAD...<br><br>";
              const payload = document.createElement('div');
              payload.style.borderLeft = `3px solid ${colorPrimary}`;
              payload.style.paddingLeft = "15px";
              display.appendChild(payload);
              
              // Scramble to reveal text logic
              let htmlData = finalMsg;
              let tempStr = "";
              let charIndex = 0;
              
              // Simplistic scramble: reveal actual HTML chars one by one quickly
              const decryptInterval = setInterval(() => {
                  if (charIndex >= htmlData.length) {
                      clearInterval(decryptInterval);
                      payload.innerHTML = htmlData + '<span class="blinking-cursor">_</span>';
                  } else {
                      // Reveal some chars, scramble the next few
                      let revealed = htmlData.substring(0, charIndex);
                      let scrambled = "";
                      for(let k=0; k<20 && charIndex+k < htmlData.length; k++){
                          scrambled += chars.charAt(Math.floor(Math.random()*chars.length));
                      }
                      payload.innerHTML = revealed + scrambled;
                      charIndex += 2; // speed
                  }
              }, 30);
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
