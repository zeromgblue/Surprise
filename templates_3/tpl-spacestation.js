export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#000"; // Deep space
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    // Need an image of Earth curve from space, we'll try to draw a nice CSS one or use a gradient
    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Jura:wght@500;700&family=Exo+2:wght@300;400&display=swap');
            
            .station-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; align-items: center; justify-content: center;
                overflow: hidden;
            }

            /* View out the window */
            .window-view {
                position: absolute; inset:0; background: url('https://www.transparenttextures.com/patterns/stardust.png');
                display: flex; align-items: flex-end; justify-content: center; z-index: 1;
            }

            /* Earth Curve CSS */
            .earth {
                width: 200vw; height: 100vw;
                background: radial-gradient(ellipse at top, #1CB5E0 0%, #000046 60%, #000 100%);
                border-radius: 50% 50% 0 0;
                transform: translateY(60%);
                box-shadow: 0 -20px 100px rgba(28, 181, 224, 0.5), inset 0 -20px 100px rgba(0,0,0,0.8);
                position: relative; overflow: hidden;
            }
            .earth::before { 
                content:''; position:absolute; inset:0; background:url('https://www.transparenttextures.com/patterns/cubes.png'); opacity:0.1;
            }

            /* Window Frame Structure */
            .frame-overlay {
                position: absolute; inset: 0; z-index: 5; pointer-events: none;
                box-shadow: inset 0 0 50px 50px #111;
                border: 40px solid #222; border-radius: 100px; /* rounded spaceship window */
                margin: 20px; box-sizing: border-box;
                display: flex; flex-direction: column; justify-content: space-between;
            }
            /* Struts */
            .frame-overlay::before, .frame-overlay::after {
                content: ''; position: absolute; background: #222; box-shadow: 0 0 20px rgba(0,0,0,0.8);
            }
            .frame-overlay::before { top:0; bottom:0; left:30%; width:20px; }
            .frame-overlay::after { top:0; bottom:0; right:30%; width:20px; }

            /* Console UI at bottom */
            .console {
                position: absolute; bottom: 0; width: 100%; height: 100px;
                background: linear-gradient(to top, #111, #222); border-top: 3px solid #333;
                z-index: 10; display:flex; align-items:center; justify-content:center;
            }

            .btn-receive {
                padding: 15px 40px; background: rgba(0,255,100,0.1); border: 2px solid #00FF66;
                color: #00FF66; font-family: 'Jura', sans-serif; font-size: 1.2rem; cursor: pointer;
                transition: 0.3s; border-radius: 5px; pointer-events: auto; letter-spacing: 2px;
                box-shadow: 0 0 10px rgba(0,255,100,0.2), inset 0 0 10px rgba(0,255,100,0.2);
            }
            .btn-receive:hover { background: #00FF66; color: #000; box-shadow: 0 0 20px #00FF66; }

            /* Holographic Msg floating in window */
            .holo-msg {
                position: absolute; top: 20vh; width: 60%; max-width: 600px;
                background: rgba(28, 181, 224, 0.1); border: 1px solid rgba(28, 181, 224, 0.5);
                backdrop-filter: blur(5px); padding: 30px; text-align: center;
                z-index: 15; opacity: 0; transform: translateY(-30px);
                border-left: 5px solid #1CB5E0; border-right: 5px solid #1CB5E0;
            }
            
            .m-head { font-family: 'Jura', sans-serif; font-size: 2.5rem; color: #fff; text-shadow: 0 0 10px #1CB5E0; margin-bottom: 20px; text-transform:uppercase;}
            .m-body { font-family: 'Exo 2', sans-serif; font-size: 1.2rem; color: #E0F7FA; line-height: 1.6; }
            
        </style>

        <div class="station-scene">
            <div class="window-view">
                <div class="earth" id="earth"></div>
            </div>

            <div class="frame-overlay"></div>

            <div class="console">
                <button class="btn-receive" id="btn">RECEIVE SECURE COMMS</button>
            </div>

            <div class="holo-msg" id="msg">
                <div class="m-head">DATA LINK ESTABLISHED</div>
                <div class="m-body"><b>TO: ${escapeHtml(data.receiver)}</b><br><br>${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-body" style="color:#00FF66; margin-top:20px; font-size:1rem;">> AUTHORIZED BY: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    // Slow rotation of earth
    gsap.to(document.getElementById('earth'), { rotationZ: 10, transformOrigin: '50% 100%', duration: 100, repeat: -1, yoyo: true, ease: "linear" });

    const btn = document.getElementById('btn');
    const msg = document.getElementById('msg');
    let triggered = false;

    btn.addEventListener('click', () => {
        if(triggered) return;
        triggered = true;

        // Button clicks state
        btn.innerText = "LINKING...";
        btn.style.borderColor = "#FFCC00";
        btn.style.color = "#FFCC00";
        btn.style.pointerEvents = "none";

        const tl = gsap.timeline();
        
        // Simulating data loading
        tl.to(btn, { opacity: 0.5, duration: 0.2, yoyo: true, repeat: 5 })
          .call(() => {
              btn.innerText = "CONNECTED";
              btn.style.borderColor = "#1CB5E0";
              btn.style.color = "#1CB5E0";
              btn.style.opacity = 1;
              
              // Flash window light
              gsap.to('.window-view', { filter: "brightness(1.5)", duration: 0.2, yoyo: true, repeat: 1 });
          })
          
        // Msg floats up and fades in
          .to(msg, { opacity: 1, y: 0, duration: 1.5, ease: "power2.out" });

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
