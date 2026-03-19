export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#7CB342"; // Grass green
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Sniglet:wght@800&display=swap');
            
            .mole-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle, #8BC34A, #33691E);
            }

            .hud {
                position: absolute; top: 10vh; width: 100%; display: flex; justify-content: center;
                gap: 50px; font-family: 'Luckiest Guy', cursive; color: #FFF; font-size: 2.5rem;
                text-shadow: 0 5px 0 #1B5E20; z-index: 20;
            }

            /* Game Board */
            .board {
                display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
                padding: 20px; z-index: 10;
            }

            .hole-container {
                position: relative; width: 100px; height: 100px;
                display: flex; justify-content: center; align-items: flex-end;
            }

            .hole {
                position: absolute; bottom: 0; width: 100%; height: 40px;
                background: #3E2723; border-radius: 50%;
                box-shadow: inset 0 10px 20px #000, 0 5px 0 #5D4037;
                z-index: 5;
            }

            /* Mask area for the mole to hide behind the hole */
            .mole-mask {
                position: absolute; bottom: 20px; width: 100%; height: 100px;
                overflow: hidden; display: flex; justify-content: center; align-items: flex-end;
                z-index: 2;
            }

            .mole {
                width: 70px; height: 80px; background: #795548;
                border-radius: 40px 40px 10px 10px; cursor: pointer;
                transform: translateY(100%); transition: transform 0s;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
                padding-top: 10px; box-sizing: border-box;
                box-shadow: inset 0 -10px 10px rgba(0,0,0,0.3);
            }
            .mole-face { width: 40px; height: 20px; display: flex; justify-content: space-between; align-items: center; gap: 5px; }
            .eye { width: 10px; height: 10px; background: #000; border-radius: 50%; }
            .nose { width: 15px; height: 10px; background: #FFA000; border-radius: 50%; }

            /* Message Area */
            .msg-board {
                position: absolute; inset: 0; z-index: 60; padding: 40px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none;
                background: rgba(0,0,0,0.85); backdrop-filter: blur(5px);
            }

            .m-head { font-family: 'Luckiest Guy', cursive; font-size: 4rem; color: #FFEB3B; margin-bottom: 20px; text-shadow: 0 5px 0 #E65100;}
            .m-body { font-family: 'Sniglet', cursive; font-size: 1.8rem; color: #FFF; line-height: 1.6; }
            
        </style>

        <div class="mole-scene" id="scene">
            <div class="hud">
                <div id="scoreDisplay">คะแนน: 0/5</div>
            </div>

            <div class="board" id="board">
                <!-- 9 Holes -->
                ${Array(9).fill().map(() => `
                <div class="hole-container">
                    <div class="mole-mask">
                        <div class="mole" onclick="whack(this)">
                            <div class="mole-face">
                                <div class="eye"></div><div class="nose"></div><div class="eye"></div>
                            </div>
                        </div>
                    </div>
                    <div class="hole"></div>
                </div>
                `).join('')}
            </div>

            <div class="msg-board" id="msg">
                <div class="m-head" style="font-size: 2.5rem; color:#8BC34A;">ผ่านด่านแล้ว!</div>
                <div class="m-head" style="font-size: 2rem;">${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-body" style="font-size:1.2rem; margin-top:40px; color:#FF9800;">จาก: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const scoreDisplay = document.getElementById('scoreDisplay');
    const msg = document.getElementById('msg');
    const moles = Array.from(document.querySelectorAll('.mole'));
    
    let score = 0;
    const targetScore = 5;
    let gameActive = true;
    let activeMoleTimer;

    function randomMole() {
        if(!gameActive) return;
        
        // Hide all
        gsap.to(moles, { y: '100%', duration: 0.2 });

        // Show random 1 or 2
        const numถึงPop = Math.random() > 0.7 ? 2 : 1;
        const shuffled = moles.sort(() => 0.5 - Math.random());
        const selectedMoles = shuffled.slice(0, numถึงPop);

        selectedMoles.forEach(mole => {
            gsap.to(mole, { y: '0%', duration: 0.3, ease: 'back.out(2)' });
        });

        // Loop
        activeMoleTimer = setTimeout(randomMole, Math.random() * 500 + 800);
    }

    // Start
    setTimeout(randomMole, 1000);

    window.whack = function(mole) {
        if(!gameActive || gsap.getProperty(mole, "y") > 50) return; // Prevent hitting if almost hidden
        
        score++;
        scoreDisplay.innerText = `คะแนน: ${score}/${targetScore}`;
        
        // Hit effect
        gsap.killTweensOf(mole);
        gsap.to(mole, { y: '100%', duration: 0.1 });
        
        // Screen shake
        gsap.to('#scene', { x: (Math.random()-0.5)*20, y: (Math.random()-0.5)*20, duration: 0.1, yoyo: true, repeat: 1 });

        if(score >= targetScore) {
            gameActive = false;
            clearTimeout(activeMoleTimer);
            gsap.to(moles, { y: '100%', duration: 0.2 });
            showWin();
        }
    }

    function showWin() {
        setTimeout(() => {
            gsap.to('#board', { scale: 0, opacity: 0, duration: 0.5, ease: "back.in(1)" });
            gsap.to('.hud', { y: -100, opacity: 0, duration: 0.5 });
            gsap.to(msg, { opacity: 1, pointerEvents:'auto', duration: 1, delay: 0.5, ease: "power2.out" });
        }, 500);
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
