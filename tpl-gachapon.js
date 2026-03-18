export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#FF6B6B"; // Pastel red/pink
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@700;800&display=swap');
            
            .gacha-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle, #FFE66D 0%, #FF6B6B 80%);
            }

            /* Machine body */
            .machine {
                position: relative; width: 300px; height: 450px;
                background: #FFF; border-radius: 40px 40px 10px 10px;
                border: 8px solid #333; box-shadow: 0 20px 0 rgba(0,0,0,0.1);
                display: flex; flex-direction: column; align-items: center; z-index: 10;
            }

            /* Glass dome */
            .glass {
                width: 260px; height: 260px; background: rgba(255,255,255,0.8);
                border: 4px solid #DFDFDF; border-radius: 50%; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;
                margin-top: 20px; position: relative; overflow: hidden;
                box-shadow: inset 10px 10px 20px rgba(255,255,255,0.9), inset -10px -10px 20px rgba(0,0,0,0.1);
            }

            /* Capsules inside glass */
            .c-small {
                position: absolute; width: 50px; height: 50px; border-radius: 50%;
                border: 2px solid #333; box-shadow: inset -5px -5px 10px rgba(0,0,0,0.2);
            }
            .cs-1 { background: linear-gradient(to bottom, #FF9F1C 50%, #FFF 50%); bottom: 10px; left: 20px; transform: rotate(20deg); }
            .cs-2 { background: linear-gradient(to bottom, #2EC4B6 50%, #FFF 50%); bottom: 15px; right: 30px; transform: rotate(-40deg); }
            .cs-3 { background: linear-gradient(to bottom, #E71D36 50%, #FFF 50%); bottom: 40px; left: 80px; transform: rotate(80deg); }
            .cs-4 { background: linear-gradient(to bottom, #9D4EDD 50%, #FFF 50%); bottom: 50px; right: 70px; transform: rotate(10deg); }
            .cs-5 { background: linear-gradient(to bottom, #FF006E 50%, #FFF 50%); bottom: 80px; left: 40px; transform: rotate(-70deg); }
            .cs-6 { background: linear-gradient(to bottom, #FFBE0B 50%, #FFF 50%); bottom: 90px; right: 30px; transform: rotate(120deg); }

            /* Mechanism */
            .crank-box {
                width: 150px; height: 100px; background: #FF9F1C; border-radius: 10px;
                margin-top: 20px; border: 4px solid #333; display: flex; align-items: center; justify-content: center;
                position: relative;
            }
            .crank {
                width: 60px; height: 60px; background: #E71D36; border-radius: 50%;
                border: 4px solid #333; position: relative; cursor: pointer;
                box-shadow: 0 5px 0 #333; display: flex; align-items: center; justify-content: center;
            }
            .crank-handle { width: 40px; height: 10px; background: #333; border-radius: 5px; }

            /* Dispenser */
            .dispense-hole {
                position: absolute; bottom: 20px; left: 20px; width: 60px; height: 80px;
                background: #333; border-radius: 30px 30px 10px 10px; overflow: hidden;
            }

            .hint { position: absolute; top: 8vh; color: #FFF; font-family: 'M PLUS Rounded 1c', sans-serif; font-weight: 800; font-size: 2rem; text-shadow: 0 5px 0 #E71D36; z-index: 20; letter-spacing: 2px; }

            /* Winning Capsule */
            .win-capsule {
                position: absolute; width: 150px; height: 150px; border-radius: 50%;
                background: linear-gradient(to bottom, #FFD700 50%, #FFF 50%);
                border: 4px solid #333; box-shadow: 0 20px 40px rgba(0,0,0,0.5), inset -10px -10px 20px rgba(0,0,0,0.2);
                z-index: 50; display: flex; align-items: center; justify-content: center;
                transform: scale(0); opacity: 0; cursor: pointer; top: 40%;
            }
            .win-star { font-size: 4rem; color: #FF9F1C; }

            /* Message Area */
            .prize-msg {
                position: absolute; inset: 0; z-index: 60; padding: 40px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none;
                background: rgba(255, 230, 109, 0.95); backdrop-filter: blur(5px);
            }

            .m-head { font-family: 'M PLUS Rounded 1c', sans-serif; font-weight: 800; font-size: 3rem; color: #E71D36; text-shadow: 2px 2px 0 #FFF; margin-bottom: 20px;}
            .m-body { font-family: 'M PLUS Rounded 1c', sans-serif; font-weight: 700; font-size: 1.8rem; color: #333; line-height: 1.5; }
            
        </style>

        <div class="gacha-scene">
            <div class="hint" id="hint">หมุนเลย!</div>

            <div class="machine" id="machine">
                <div class="glass" id="glass">
                    <div class="c-small cs-1"></div>
                    <div class="c-small cs-2"></div>
                    <div class="c-small cs-3"></div>
                    <div class="c-small cs-4"></div>
                    <div class="c-small cs-5"></div>
                    <div class="c-small cs-6"></div>
                </div>
                
                <div class="crank-box">
                    <div class="dispense-hole"></div>
                    <div class="crank" id="crank">
                        <div class="crank-handle"></div>
                    </div>
                </div>
            </div>

            <div class="win-capsule" id="winCap">
                <div class="win-star">★</div>
            </div>

            <div class="prize-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-body" style="font-size:1.2rem; margin-top:30px; color:#9D4EDD;">จาก: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const crank = document.getElementById('crank');
    const machine = document.getElementById('machine');
    const winCap = document.getElementById('winCap');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    
    let isSpinning = false;

    crank.addEventListener('click', () => {
        if(isSpinning) return;
        isSpinning = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Turn crank
        tl.to(crank, { rotation: "+=360", duration: 1, ease: "back.inOut(1.5)" })
          
        // 2. Machine shake & capsules bounce
          .to(machine, { y: -10, duration: 0.1, yoyo: true, repeat: 9 }, 0.5)
          .to('.c-small', { y: -30, rotation: "+=90", duration: 0.2, yoyo: true, repeat: 4, stagger: 0.05 }, 0.5)
          
        // 3. Drop sound/illusion (Dim machine)
          .to(machine, { filter: 'brightness(0.5)', duration: 0.5, ease: "power2.out" }, "+=0.2")
          
        // 4. BIG Capsule springs out
          .to(winCap, { scale: 1, opacity: 1, y: 50, rotation: 360, duration: 1, ease: "bounce.out" })
          
        // 5. Add prompt to click capsule
          .call(() => {
             hint.innerText = "แตะเพื่อเปิด!";
             hint.style.display = "block";
             hint.style.top = "20vh";
             hint.style.color = "#FF9F1C";
          });
    });

    winCap.addEventListener('click', () => {
        hint.style.display = 'none';
        
        // Pop open the capsule
        gsap.to(winCap, { scale: 1.5, opacity: 0, duration: 0.3, onComplete: () => winCap.style.display='none' });
        
        // White flash
        const flash = document.createElement('div');
        flash.style.cssText = "position:absolute; inset:0; background:#FFF; z-index:55;";
        document.body.appendChild(flash);
        gsap.to(flash, { opacity:0, duration: 1, onComplete:()=>flash.remove() });
        
        // Show message
        gsap.to(msg, { opacity: 1, pointerEvents:'auto', duration: 1, ease:"back.out(1.2)" });
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
