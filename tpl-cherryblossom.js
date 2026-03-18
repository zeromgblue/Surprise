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
            @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Nunito:wght@300;600&display=swap');
            
            .cherry-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                overflow: hidden; background: linear-gradient(180deg, #fdf2f8, #fbcfe8, #f472b6);
            }

            /* Mount Fuji Silhouette bg */
            .fuji {
                position: absolute; bottom: 10vh; width: 600px; height: 300px;
                background: #831843; clip-path: polygon(20% 100%, 45% 20%, 55% 20%, 80% 100%); z-index: 5;
                opacity: 0.8;
            }
            .fuji::after {
                content: ''; position: absolute; top:0; left: 22.5%; width: 55%; height: 80px;
                background: #fdf2f8; clip-path: polygon(40% 0, 60% 0, 100% 100%, 80% 100%, 70% 80%, 50% 100%, 30% 80%, 20% 100%, 0 100%);
            }

            /* Big Cherry Blossom Branch */
            .branch-wrapper {
                position: absolute; top: -50px; right: -100px; width: 600px; height: 500px; z-index: 20;
                transform-origin: top right; cursor: pointer;
            }
            .branch {
                position: absolute; right: 0; top: 0; width: 100%; height: 100%;
                background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M100 0 Q50 20 20 80 M70 10 Q40 40 10 50 M80 30 Q50 60 40 90" stroke="%23451a03" stroke-width="3" fill="none"/></svg>') no-repeat top right;
                background-size: contain; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.3));
            }

            /* Sakura Flowers grouped */
            .flowers { position: absolute; inset: 0;}
            .sakura {
                position: absolute; width: 30px; height: 30px;
                background: radial-gradient(circle at 30% 30%, #fff, #f472b6); border-radius: 50% 50% 0 50%;
                transform: rotate(45deg); box-shadow: inset -5px -5px 10px rgba(219,39,119,0.5);
            }

            /* Falling Petals array */
            .petal {
                position: absolute; width: 15px; height: 15px; background: #fbcfe8;
                border-radius: 50% 0 50% 50%; z-index: 30; pointer-events: none; opacity: 0;
            }

            .hint-btn {
                position: absolute; top: 30vh; background: rgba(131, 24, 67, 0.8); color: #FFF; font-family: 'Nunito', sans-serif;
                font-size: 1.2rem; padding: 10px 20px; border-radius: 30px; cursor: pointer; z-index: 50;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3); border: 2px solid #fbcfe8;
                animation: pulseBtn 2s infinite;
            }
            @keyframes pulseBtn { 0%,100%{transform:scale(1);} 50%{transform:scale(1.05);} }

            /* Spring Message */
            .spring-msg {
                position: absolute; inset: 0; padding: 40px; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 40; opacity: 0; pointer-events: none;
                background: rgba(253, 242, 248, 0.85); backdrop-filter: blur(5px);
            }
            .m-head { font-family: 'Caveat', cursive; font-size: 4.5rem; color: #db2777; margin-bottom: 20px; font-weight: 700; text-align:center; line-height:1;}
            .m-body { font-family: 'Nunito', sans-serif; font-size: 1.5rem; color: #831843; line-height: 1.8; max-width: 600px; text-align: center; font-weight: 600;}
            .m-foot { font-family: 'Caveat', cursive; font-size: 2rem; color: #be185d; margin-top: 30px; font-weight: 700;}

        </style>

        <div class="cherry-scene">
            <div class="fuji"></div>
            
            <div class="hint-btn" id="startBtn">เขย่ากิ่งซากุระ</div>

            <div class="branch-wrapper" id="branchBox">
                <div class="branch"></div>
                <div class="flowers" id="flowersBox">
                    <!-- generate static flowers on branch -->
                    ${Array(15).fill(0).map(()=>`<div class="sakura" style="top:${Math.random()*80}%; left:${Math.random()*80}%; transform: rotate(${Math.random()*360}deg) scale(${0.5 + Math.random()*0.8});"></div>`).join('')}
                </div>
            </div>

            <div class="spring-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">รักเสมอ, ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const branchBox = document.getElementById('branchBox');
    const startBtn = document.getElementById('startBtn');
    const msg = document.getElementById('msg');
    const scene = document.querySelector('.cherry-scene');

    // Idle wind on branch
    gsap.to(branchBox, { rotationZ: 5, duration: 4, yoyo: true, repeat: -1, ease: "sine.inOut" });

    // Background continuous petals
    setInterval(createPetal, 800);

    let isShaken = false;

    startBtn.addEventListener('click', () => {
        if(isShaken) return;
        isShaken = true;
        startBtn.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Shake the branch vigorously
        tl.to(branchBox, { rotationZ: 15, duration: 0.1, yoyo: true, repeat: 10 })
          
        // 2. Heavy petal flurry
          .call(() => {
              for(let i=0; i<60; i++) setTimeout(createPetal, Math.random()*1500);
          })
          
        // 3. Zoom into the background color / fade message
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 }, "+=1");
    });

    function createPetal() {
        let p = document.createElement('div');
        p.className = 'petal';
        scene.appendChild(p);

        let startX = Math.random() * window.innerWidth;
        
        gsap.set(p, { x: startX, y: -50, rotation: Math.random()*360, opacity: 1 });
        
        gsap.to(p, {
            y: window.innerHeight + 50,
            x: startX - 200 - Math.random()*300, // Drift left due to wind
            rotation: "+=" + (180 + Math.random()*360),
            duration: 4 + Math.random()*4,
            ease: "none",
            onComplete: ()=>p.remove()
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
