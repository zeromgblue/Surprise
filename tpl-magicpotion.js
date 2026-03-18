export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#051A10"; // Dark mystical forest
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    // Create a potion mixing scene
    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Almendra:ital,wght@0,400;0,700;1,400&family=Charm:wght@400;700&display=swap');
            
            .lab-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden;
            }

            /* Mystic shelves background */
            .shelves {
                position: absolute; inset:0; z-index: 1; opacity: 0.2;
                background-image: 
                    radial-gradient(circle at 20% 40%, rgba(50,255,100,0.1) 0%, transparent 20%),
                    radial-gradient(circle at 80% 60%, rgba(200,50,255,0.1) 0%, transparent 20%),
                    linear-gradient(rgba(0,0,0,0.5) 10px, transparent 10px);
                background-size: 100px 100px, 150px 150px, 100% 120px;
            }

            /* The Cauldron / Flask */
            .flask-wrapper {
                position: relative; width: 200px; height: 300px; z-index: 10;
                display:flex; flex-direction:column; align-items:center; justify-content:flex-end;
            }
            .flask-neck { width: 40px; height: 100px; background: rgba(255,255,255,0.1); border: 4px solid rgba(255,255,255,0.3); border-bottom: none; border-radius: 10px 10px 0 0; position:relative; z-index:11; backdrop-filter:blur(2px); }
            .flask-body { width: 200px; height: 200px; border-radius: 50%; background: rgba(255,255,255,0.1); border: 4px solid rgba(255,255,255,0.3); position:relative; overflow:hidden; box-shadow: inset 0 -20px 40px rgba(0,0,0,0.5), 0 20px 50px rgba(0,0,0,0.8); backdrop-filter:blur(2px); z-index:10; }
            
            /* Liquid */
            .liquid {
                position: absolute; bottom: -50px; left: -50%; width: 200%; height: 200px;
                background: #00FF66; opacity: 0.8; border-radius: 40%;
                animation: flow 4s linear infinite; box-shadow: inset 0 20px 20px rgba(255,255,255,0.5);
                transition: background 1s, bottom 1s; mix-blend-mode: color-dodge;
            }
            @keyframes flow { 100% {transform: rotate(360deg);} }

            /* Interactive ingredients */
            .ingredient-tray {
                position: absolute; bottom: 50px; display:flex; gap: 20px; z-index: 20;
            }
            .ing {
                width: 60px; height: 60px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2);
                background: radial-gradient(circle, #fff 0%, #333 100%); display:flex; align-items:center; justify-content:center;
                cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.5); transition:0.3s;
            }
            .ing:hover { transform: translateY(-10px); }
            .ing-1 { background: radial-gradient(circle, #FF0055, #440011); }
            .ing-2 { background: radial-gradient(circle, #00D2FF, #002244); }
            .ing-3 { background: radial-gradient(circle, #FFD700, #443300); }

            .hint { position: absolute; top: 15%; font-family: 'Almendra', serif; color: #A78BFA; font-size: 1.5rem; text-shadow: 0 0 10px #A78BFA; }

            /* Result fumes / Message */
            .fumes-msg {
                position: absolute; inset:0; z-index: 30; padding: 40px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, transparent 70%);
            }

            .m-head { font-family: 'Almendra', serif; font-size: 3rem; color: #FFF; text-shadow: 0 0 20px #FF00FF, 0 0 40px #FF00FF; margin-bottom: 20px;}
            .m-body { font-family: 'Charm', cursive; font-size: 1.8rem; color: #E0E7FF; line-height: 1.5; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); }
            
        </style>

        <div class="lab-scene">
            <div class="shelves"></div>
            
            <div class="hint" id="hint">ใส่ส่วนผสมเพื่อปรุงยา (0/3)</div>

            <div class="flask-wrapper" id="flask">
                <div class="flask-neck"></div>
                <div class="flask-body">
                    <div class="liquid" id="liquid"></div>
                </div>
            </div>

            <div class="ingredient-tray" id="tray">
                <div class="ing ing-1" onclick="addIng(this, '#FF0055')">🌸</div>
                <div class="ing ing-2" onclick="addIng(this, '#00D2FF')">❄️</div>
                <div class="ing ing-3" onclick="addIng(this, '#FFD700')">✨</div>
            </div>
            
            <div class="fumes-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-body" style="font-size:1.2rem; margin-top:30px; color:#A78BFA;">Elixir crafted by: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    let count = 0;
    const liquid = document.getElementById('liquid');
    const hint = document.getElementById('hint');

    window.addIng = function(el, color) {
        if(el.style.opacity === '0.2') return;
        el.style.opacity = '0.2';
        el.style.pointerEvents = 'none';
        
        count++;
        hint.innerText = `ADD INGREDIENTS TO BREW (${count}/3)`;

        // Visual feedback
        liquid.style.background = color;
        gsap.to(liquid, { bottom: parseInt(getComputedStyle(liquid).bottom) + 30 + 'px', duration: 1 });
        
        // Bubbles effect
        for(let i=0; i<5; i++){
            let b = document.createElement('div');
            b.style.cssText = `position:absolute; width:10px; height:10px; border-radius:50%; background:white; opacity:0.8; 
                               left:${Math.random()*60 + 20}%; bottom:0; box-shadow:0 0 10px ${color};`;
            document.querySelector('.flask-body').appendChild(b);
            gsap.to(b, {
                bottom: '100%', opacity: 0, x: (Math.random()-0.5)*50,
                duration: Math.random()*1 + 1, ease: 'power1.in',
                onComplete: () => b.remove()
            });
        }

        if(count >= 3) {
            hint.style.display = 'none';
            document.getElementById('tray').style.display = 'none';
            finishBrew();
        }
    }

    function finishBrew() {
        const tl = gsap.timeline();

        // Liquid turns magical purple/pink and boils
        tl.to(liquid, { background: 'linear-gradient(45deg, #FF00FF, #00FFFF)', duration: 1 })
          .to('#flask', { y: -20, duration: 0.1, yoyo: true, repeat: 10 }, "-=0.5")
          
        // Explosion of fumes
          .call(() => {
              const puff = document.createElement('div');
              puff.style.cssText = "position:absolute; inset:0; background:radial-gradient(circle, #D500F9, #651FFF, #000); z-index:25; mix-blend-mode:screen";
              document.body.appendChild(puff);
              gsap.fromถึง(puff, {opacity:0, scale:0}, {opacity:1, scale:2, duration:1, onComplete:()=> {
                  gsap.to(puff, {opacity:0, duration:2});
              }});
          })
          
        // Hide flask, show message in the smoke
          .to('#flask', { opacity: 0, duration: 0.5 }, "+=0.2")
          .to('#msg', { opacity: 1, pointerEvents:'auto', duration: 2, ease:"power2.out" });
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
