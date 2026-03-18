export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#fff"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Creepster&family=Jolly+Lodger&family=Permanent+Marker&display=swap');
            
            .horror-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: #000;
            }

            /* Static TV Noise */
            .tv-noise {
                position: absolute; inset: 0; z-index: 10;
                background: url('https://www.transparenttextures.com/patterns/tv-noise.png');
                opacity: 0.1; pointer-events: none; animation: tvFlicker 0.1s infinite alternate;
            }
            @keyframes tvFlicker { 0% { opacity: 0.1; } 100% { opacity: 0.3; } }

            .room-bg {
                position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, #1f2937, #000);
                opacity: 0.8; z-index: 5;
            }

            .flashlight-area {
                position: absolute; inset: 0; z-index: 20; cursor: crosshair;
                background: radial-gradient(circle 150px at 50% 50%, transparent 0%, rgba(0,0,0,0.98) 100%);
            }

            .hint { position: absolute; top: 10vh; color: #FFF; font-family: 'Permanent Marker', cursive; font-size: 1.5rem; z-index: 30; letter-spacing: 2px; text-shadow: 2px 2px 10px #000; pointer-events:none;}

            /* The hidden blood message on the wall */
            .blood-msg {
                position: absolute; z-index: 15; padding: 40px; text-align: center; width: 80%; max-width: 600px;
            }

            .m-head { font-family: 'Creepster', cursive; font-size: 4rem; color: #991B1B; margin-bottom: 20px; text-shadow: 2px 2px 5px #000; }
            .m-body { font-family: 'Jolly Lodger', cursive; font-size: 3rem; color: #EF4444; line-height: 1.2; text-shadow: 2px 2px 5px #000;}

            /* Jumpscare overlay */
            .scare-flash { position: absolute; inset: 0; background: #FFF; opacity: 0; z-index: 50; pointer-events:none;}

        </style>

        <div class="horror-scene" id="scene">
            <div class="room-bg"></div>
            <div class="tv-noise"></div>
            
            <div class="blood-msg" id="msg">
                <div class="m-head" id="headTarget">ARE YOU THERE?</div>
                <div class="m-body" id="bodyTarget" style="display:none;">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-body" id="footTarget" style="display:none; font-size: 1.5rem; margin-top:30px;">- ${escapeHtml(data.sender)}</div>
            </div>

            <div class="flashlight-area" id="lightLayer"></div>
            <div class="hint" id="hint">ส่องไฟฉายหาความลับในความมืด...</div>
            <div class="scare-flash" id="flash"></div>
        </div>
    `;

    const lightLayer = document.getElementById('lightLayer');
    const msg = document.getElementById('msg');
    const headTarget = document.getElementById('headTarget');
    const bodyTarget = document.getElementById('bodyTarget');
    const footTarget = document.getElementById('footTarget');
    const hint = document.getElementById('hint');
    const flash = document.getElementById('flash');

    // Move flashlight with mouse/touch
    function updateLight(e) {
        let x = e.touches ? e.touches[0].clientX : e.clientX;
        let y = e.touches ? e.touches[0].clientY : e.clientY;
        lightLayer.style.background = `radial-gradient(circle 120px at ${x}px ${y}px, transparent 0%, rgba(0,0,0,0.98) 100%)`;
    }

    window.addEventListener('mousemove', updateLight);
    window.addEventListener('touchmove', updateLight, {passive:false});

    // Interaction trigger
    let found = false;

    // Hover over the message div triggers the reveal
    msg.addEventListener('mouseenter', triggerReveal);
    msg.addEventListener('touchstart', triggerReveal, {passive:true});

    function triggerReveal() {
        if(found) return;
        found = true;
        
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Lightning Jumpscare Flash
        tl.to(flash, { opacity: 0.8, duration: 0.05, yoyo: true, repeat: 3 })
          // 2. Lights turn on abruptly (red emergency lights)
          .call(() => {
              lightLayer.style.background = 'rgba(153, 27, 27, 0.4)'; // red tint overlay
              headTarget.innerText = escapeHtml(data.receiver);
              bodyTarget.style.display = 'block';
              footTarget.style.display = 'block';
              window.removeEventListener('mousemove', updateLight);
              window.removeEventListener('touchmove', updateLight);
          })
          // 3. Shake text
          .fromTo(msg, { scale: 0.9, rotation: -2 }, { scale: 1, rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
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
