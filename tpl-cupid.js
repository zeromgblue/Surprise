export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#1a0b16";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    if (!window.confetti) await loadScript('https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js');

    const color1 = config.from || '#FF758F';
    const color2 = config.to || '#C9184A';

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Prompt:wght@300;500&display=swap');
            
            .heart-target {
                position: relative; width: 150px; height: 150px; z-index: 10;
                cursor: crosshair; animation: heartbeat 1.5s infinite;
            }
            .heart-target::before, .heart-target::after {
                content: ""; position: absolute; top: 0; width: 75px; height: 120px;
                border-radius: 75px 75px 0 0; background: ${color1};
                box-shadow: 0 0 30px ${color2};
            }
            .heart-target::before { left: 75px; transform: rotate(-45deg); transform-origin: 0 100%; }
            .heart-target::after { left: 0; transform: rotate(45deg); transform-origin: 100% 100%; }
            
            @keyframes heartbeat {
                0% { transform: scale(1); }
                15% { transform: scale(1.1); }
                30% { transform: scale(1); }
                45% { transform: scale(1.1); }
                60% { transform: scale(1); }
            }

            .bow-arrow {
                position: absolute; bottom: -100px; left: 50%; width: 10px; height: 100px;
                background: linear-gradient(to top, #8B4513, #CD853F); transform: translateX(-50%);
                z-index: 20; pointer-events: none; border-radius: 5px;
            }
            .bow-arrow::after { /* Arrowhead */
                content:''; position: absolute; top: -15px; left: -10px;
                border-left: 15px solid transparent; border-right: 15px solid transparent; border-bottom: 20px solid #ddd;
            }

            .hint {
                position: absolute; top: 15%; width: 100%; text-align: center;
                color: #fff; font-family: sans-serif; font-size: 1rem;
                letter-spacing: 2px; text-transform: uppercase; opacity: 0.7;
            }

            .msg-overlay {
                position: absolute; inset:0; z-index: 5;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; transform: scale(0.8); pointer-events: none;
                padding: 30px; text-align: center; color: white;
            }
            .m-title { font-family: 'Dancing Script', cursive; font-size: 3.5rem; color: ${color1}; margin-bottom: 20px; text-shadow: 2px 2px 10px rgba(0,0,0,0.5); }
            .m-text { font-family: 'Prompt', sans-serif; font-size: 1.2rem; font-weight: 300; line-height: 1.6; }
        </style>

        <div class="hint" id="hint">แตะหัวใจเพื่อยิง</div>
        
        <div class="heart-target" id="target"></div>
        <div class="bow-arrow" id="arrow"></div>

        <div class="msg-overlay" id="msg">
            <div class="m-title">ถึง: ${escapeHtml(data.receiver)}</div>
            <div class="m-text">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
            <div class="m-text" style="opacity: 0.7; font-size: 1rem; margin-top:20px;">— ${escapeHtml(data.sender)}</div>
        </div>
    `;

    const target = document.getElementById('target');
    const arrow = document.getElementById('arrow');
    let shot = false;

    target.addEventListener('click', () => {
        if(shot) return;
        shot = true;
        document.getElementById('hint').style.display='none';

        const targetRect = target.getBoundingClientRect();
        const arrowRect = arrow.getBoundingClientRect();
        
        // Stop heartbeat
        target.style.animation = 'none';

        // Shoot Arrow
        const dist = arrowRect.top - targetRect.top - (targetRect.height/2);
        
        gsap.to(arrow, {
            y: -dist - 50, duration: 0.3, ease: "power1.in",
            onComplete: () => {
                // Heart Break effect
                gsap.to(target, { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1 });
                
                // Explode
                setTimeout(() => {
                    target.style.display = 'none';
                    arrow.style.display = 'none';
                    
                    // Confetti petals
                    const duration = 3000;
                    const end = Date.now() + duration;
                    (function frame() {
                        confetti({
                            particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FF758F', '#C9184A', '#ffebf0']
                        });
                        confetti({
                            particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FF758F', '#C9184A', '#ffebf0']
                        });
                        if (Date.now() < end) requestAnimationFrame(frame);
                    }());

                    // Show message
                    const msg = document.getElementById('msg');
                    gsap.to(msg, { scale: 1, opacity: 1, duration: 1.5, ease: "elastic.out(1, 0.5)", onComplete: () => msg.style.pointerEvents = 'auto' });
                }, 100);
            }
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
