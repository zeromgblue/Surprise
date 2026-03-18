export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#FFC8DD"; // Cute pink pastel
    container.style.backgroundImage = "radial-gradient(circle at center, #FFAFCC 0%, #FFC8DD 100%)";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;700&family=Mali:wght@400;600&display=swap');
            
            .scene {
                position: relative; width: 300px; height: 350px;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
            }

            .gift-box {
                position: relative; width: 200px; height: 150px;
                background: linear-gradient(to bottom, #A2D2FF, #BDE0FE);
                border: 3px solid #6c757d; border-radius: 10px;
                box-shadow: 0 15px 20px rgba(0,0,0,0.2), inset 0 20px 20px rgba(255,255,255,0.4);
                cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center;
                transition: transform 0.1s;
            }
            .gift-box:active { transform: scale(0.95); }

            /* Ribbon */
            .gift-box::before {
                content: ''; position: absolute; width: 40px; height: 100%;
                background: #FFB5A7; border-left: 3px solid #6c757d; border-right: 3px solid #6c757d;
            }

            .lid {
                position: absolute; top: -30px; left: -10px; width: 220px; height: 40px;
                background: linear-gradient(to bottom, #A2D2FF, #8eb4db);
                border: 3px solid #6c757d; border-radius: 5px; z-index: 11;
                transform-origin: top left;
                box-shadow: 0 5px 10px rgba(0,0,0,0.2);
            }
            .lid::before {
                content: ''; position: absolute; left: 50%; transform: translateX(-50%);
                width: 40px; height: 100%; background: #FFB5A7;
                border-left: 3px solid #6c757d; border-right: 3px solid #6c757d;
            }
            /* Bow */
            .bow { position: absolute; top: -50px; left: 50%; transform: translateX(-50%); font-size: 4rem; text-shadow: 0 5px 5px rgba(0,0,0,0.2); pointer-events:none;}

            /* The Cat */
            .pop-cat {
                position: absolute; bottom: 80px; width: 150px; height: auto;
                z-index: 5; transform: scale(0) translateY(100px); opacity: 0;
            }

            .msg-bubble {
                position: absolute; bottom: 250px; background: #fff;
                border: 3px solid #333; border-radius: 20px; padding: 20px;
                font-family: 'Mali', cursive; text-align: center; color: #333;
                box-shadow: 0 10px 20px rgba(0,0,0,0.2); max-width: 250px;
                opacity: 0; transform: scale(0.5); z-index: 15;
            }
            .msg-bubble::after {
                content: ''; position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%);
                border-width: 20px 20px 0; border-style: solid;
                border-color: #fff transparent transparent transparent;
                filter: drop-shadow(0 4px 0px #333);
            }

            .hint {
                position: absolute; bottom: -40px; font-family: 'Fredoka', sans-serif;
                color: #555; letter-spacing: 2px;
                animation: pulse 1s infinite alternate; pointer-events: none;
            }
            @keyframes pulse { 0%{transform:scale(1);} 100%{transform:scale(1.1);} }
            
            /* Background scattered items */
            .confetti-piece { position:absolute; pointer-events:none; z-index:1;}
        </style>

        <div class="msg-bubble" id="msg">
            <div style="font-size: 1.2rem; font-weight: 600; color: #FF006E; margin-bottom: 5px;">MEOOOW!</div>
            <div>${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
            <div style="font-size: 0.8rem; color: #888; margin-top: 10px;">— ${escapeHtml(data.sender)}</div>
        </div>

        <div class="scene" id="scene">
            <img src="https://cdn-icons-png.flaticon.com/512/1864/1864514.png" class="pop-cat" id="cat" alt="cat">
            
            <div class="gift-box" id="box">
                <div class="lid" id="lid">
                    <div class="bow">🎀</div>
                </div>
            </div>
            
            <div class="hint" id="hint">แตะเพื่อเปิด</div>
        </div>
    `;

    const box = document.getElementById('box');
    const lid = document.getElementById('lid');
    const cat = document.getElementById('cat');
    const msg = document.getElementById('msg');
    let opened = false;

    box.addEventListener('click', () => {
        if(opened) return;
        opened = true;
        document.getElementById('hint').style.display = 'none';

        const tl = gsap.timeline();

        // Warning shake
        tl.to(box, { rotation: 5, duration: 0.05, yoyo: true, repeat: 7 })
          .to(box, { rotation: 0, duration: 0.05 })
          
        // Lid pops off
          .to(lid, { y: -150, x: -100, rotation: -90, duration: 0.5, ease: "power2.inOut" })
          
        // Cat pops up
          .to(cat, { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" })
          
        // Happy bounce cat
          .to(cat, { y: -20, duration: 0.3, yoyo: true, repeat: -1, ease: "sine.inOut" }, "-=0.2")

        // Bubble appears
          .to(msg, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.5)" });

        // Throw little cat paws or hearts around
        for(let i=0; i<15; i++) {
            let p = document.createElement('div');
            p.className = 'confetti-piece';
            p.innerText = Math.random() > 0.5 ? '🐾' : '❤️';
            p.style.left = '50%'; p.style.top = '50%'; p.style.fontSize = '1.5rem';
            document.body.appendChild(p);
            
            gsap.to(p, {
                x: (Math.random()-0.5)*window.innerWidth,
                y: -(Math.random()*window.innerHeight/2 + 100),
                rotation: Math.random()*360, duration: 1+Math.random()*1.5,
                ease: "power2.out", opacity: 0, onComplete: ()=>p.remove()
            });
        }
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
