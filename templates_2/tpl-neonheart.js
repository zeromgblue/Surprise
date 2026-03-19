export async function render(container, data, config) {
    // 1. Reset container
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.backgroundColor = config.bg || "#050011";
    // Brick wall texture overlay
    container.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url('https://www.transparenttextures.com/patterns/brick-wall.png')`;
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    // 2. Load GSAP
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const colorMain = config.from || '#FF0055';
    const colorGlow = config.to || '#7700FF';

    // 3. Inject HTML Structure
    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Monoton&family=Open+Sans:wght@700&display=swap');
            
            .neon-container {
                text-align: center;
                opacity: 0.1; /* Initially off */
                transition: opacity 0.5s;
                margin-bottom: 50px;
                padding: 0 20px;
            }
            .neon-text {
                font-family: 'Monoton', cursive;
                font-size: 3.5rem;
                color: #fff;
                margin: 0;
                line-height: 1.2;
                text-transform: uppercase;
                /* Off state shadow */
                text-shadow: 0 0 1px #000;
            }
            .neon-message {
                font-family: 'Open Sans', sans-serif;
                font-size: 1.2rem;
                color: #fff;
                margin-top: 20px;
                /* Off state shadow */
                text-shadow: 0 0 1px #000;
            }
            
            /* ON state classes added by JS */
            .neon-on .neon-text {
                color: #fff;
                text-shadow:
                    0 0 5px #fff,
                    0 0 10px #fff,
                    0 0 20px ${colorMain},
                    0 0 40px ${colorMain},
                    0 0 80px ${colorMain},
                    0 0 90px ${colorMain},
                    0 0 100px ${colorMain},
                    0 0 150px ${colorMain};
            }
            .neon-on .neon-message {
                color: #fff;
                text-shadow:
                    0 0 5px #fff,
                    0 0 10px #fff,
                    0 0 20px ${colorGlow},
                    0 0 40px ${colorGlow},
                    0 0 80px ${colorGlow};
            }

            .power-station {
                position: absolute;
                bottom: 80px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .power-btn {
                width: 80px; height: 80px;
                border-radius: 50%;
                background: #111;
                border: 2px solid #333;
                color: #555;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer;
                box-shadow: 0 10px 20px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.8);
                user-select: none;
                -webkit-tap-highlight-color: transparent;
                transition: transform 0.1s;
                position: relative;
                z-index: 10;
            }
            .power-btn:active {
                transform: scale(0.95);
                background: #0a0a0a;
            }
            .power-btn .material-symbols-rounded {
                font-size: 2.5rem;
            }

            .progress-ring {
                position: absolute;
                top: -10px; left: -10px;
                width: 100px; height: 100px;
                pointer-events: none;
                transform: rotate(-90deg);
            }
            .progress-ring circle {
                fill: transparent;
                stroke: ${colorMain};
                stroke-width: 4;
                stroke-dasharray: 283;
                stroke-dashoffset: 283;
                transition: stroke-dashoffset 0.1s linear;
                filter: drop-shadow(0 0 5px ${colorMain});
            }

            .hint-text {
                margin-top: 15px;
                font-family: 'Open Sans', sans-serif;
                font-size: 0.8rem;
                color: #888;
                letter-spacing: 2px;
                text-transform: uppercase;
                animation: blinkHint 2s infinite;
            }
            @keyframes blinkHint { 0%,100%{opacity:0.4;} 50%{opacity:1;} }

            /* Random Sparkles bg */
            .spark {
                position: absolute; width: 4px; height: 4px; background: white; border-radius: 50%;
                opacity: 0; box-shadow: 0 0 10px white, 0 0 20px ${colorGlow};
            }
        </style>

        <div class="neon-container" id="neon-board">
            <h1 class="neon-text">${escapeHtml(data.receiver)}</h1>
            <div class="neon-message">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
            <div class="neon-message" style="margin-top:30px; font-size:0.9rem; opacity:0.8;">— ${escapeHtml(data.sender)} —</div>
        </div>

        <div class="power-station" id="station">
            <svg class="progress-ring"><circle cx="50" cy="50" r="45" id="ring"></circle></svg>
            <div class="power-btn" id="btn-power">
                <span class="material-symbols-rounded">power_settings_new</span>
            </div>
            <div class="hint-text">HOLD TO POWER ON</div>
        </div>
    `;

    // 4. Interaction - Hold to Power On
    const btn = document.getElementById('btn-power');
    const ring = document.getElementById('ring');
    const board = document.getElementById('neon-board');
    const station = document.getElementById('station');
    
    let pressTimer;
    let progress = 0;
    let isPowered = false;
    const holdDuration = 1500; // ms required to hold
    const circumference = 283;

    function startPress(e) {
        if(isPowered) return;
        e.preventDefault();
        btn.style.color = colorMain;
        btn.style.boxShadow = `0 10px 20px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.8), 0 0 20px ${colorMain}44`;
        
        progress = 0;
        let startTime = Date.now();
        
        pressTimer = setInterval(() => {
            let elapsed = Date.now() - startTime;
            progress = Math.min(elapsed / holdDuration, 1);
            
            // Update Dashoffset
            let offset = circumference - (progress * circumference);
            ring.style.strokeDashoffset = offset;

            // Generate sparks while holding
            if(Math.random() > 0.7) createSpark(btn);

            if (progress >= 1) {
                powerOn();
            }
        }, 30);
    }

    function endPress() {
        if(isPowered) return;
        clearInterval(pressTimer);
        btn.style.color = '#555';
        btn.style.boxShadow = `0 10px 20px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.8)`;
        
        // Rewind progress
        gsap.to(ring, { strokeDashoffset: circumference, duration: 0.3, onUpdate: function() {
            progress = 1 - (this.targets()[0].strokeDashoffset / circumference);
        }});
    }

    // ถึงuch & Mouse events
    btn.addEventListener('mousedown', startPress);
    btn.addEventListener('touchstart', startPress, {passive: false});
    window.addEventListener('mouseup', endPress);
    window.addEventListener('touchend', endPress);

    function powerOn() {
        clearInterval(pressTimer);
        isPowered = true;
        
        // Hide station
        gsap.to(station, { y: 100, opacity: 0, duration: 0.5, ease: "power2.in", onComplete: () => station.remove() });

        board.style.opacity = '1';
        
        // Flicker effect using GSAP timeline
        const tl = gsap.timeline();
        tl.call(() => board.classList.add('neon-on'))
          .to(board, {opacity: 0.3, duration: 0.05, delay: 0.1})
          .to(board, {opacity: 1, duration: 0.05})
          .call(() => board.classList.remove('neon-on'))
          .to(board, {opacity: 0.2, duration: 0.1, delay: 0.1})
          .call(() => board.classList.add('neon-on'))
          .to(board, {opacity: 0.8, duration: 0.05})
          .to(board, {opacity: 1, duration: 0.05})
          .call(() => board.classList.remove('neon-on'))
          .to(board, {opacity: 0.5, duration: 0.2, delay: 0.4})
          .call(() => {
              board.classList.add('neon-on');
              // Setup ambient pulse
              gsap.to(board, { opacity: 0.85, duration: 1.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
          });
    }

    function createSpark(parentObj) {
        const spark = document.createElement('div');
        spark.className = 'spark';
        const rect = parentObj.getBoundingClientRect();
        
        // Origin near button
        const x = rect.left + rect.width/2 + (Math.random()-0.5)*100;
        const y = rect.top + rect.height/2 + (Math.random()-0.5)*100;
        
        spark.style.left = x + 'px';
        spark.style.top = y + 'px';
        container.appendChild(spark);

        gsap.to(spark, {
            y: -100 - Math.random()*100,
            x: '+=' + ((Math.random()-0.5)*100),
            opacity: 1,
            duration: 0.2,
            onComplete: () => {
                gsap.to(spark, { opacity: 0, duration: 0.3, onComplete: () => spark.remove() });
            }
        });
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
