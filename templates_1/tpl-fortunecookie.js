export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#1A120B";
    container.style.backgroundImage = "radial-gradient(circle at center, #3A220B 0%, #1A120B 100%)";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const colorCookie = config.from || '#F6AA1C';

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Noto+Sans+Thai:wght@400;600&display=swap');
            
            .cookie-scene {
                position: relative; width: 300px; height: 300px;
                display: flex; align-items: center; justify-content: center;
                cursor: grab; touch-action: none;
            }
            .cookie-scene:active { cursor: grabbing; }

            /* Paper slip inside */
            .fortune-slip {
                position: absolute; width: 20px; height: 60px;
                background: #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                border: 1px solid #ddd;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                padding: 10px; font-family: 'Caveat', cursive; font-size: 1.2rem; color: #d00;
                opacity: 0; transform: scale(0.1); z-index: 5;
                transition: width 0.5s, height 0.5s, transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                text-align: center;
            }
            /* Actual message element */
            .slip-content { display: none; width: 100%; height: 100%; flex-direction: column; justify-content: center; }
            .s-to { font-size: 1.5rem; color: #111; margin-bottom: 10px; font-weight: bold;}
            .s-msg { font-family: 'Noto Sans Thai', sans-serif; font-size: 1rem; color: #333; line-height: 1.6; }
            .luck-num { margin-top: 15px; font-size: 0.8rem; color: #d00; letter-spacing: 3px; font-family: monospace; border-top: 1px dashed #ccc; padding-top: 5px;}

            /* Cookie Halves */
            .cookie-half {
                position: absolute; width: 140px; height: 180px;
                background: radial-gradient(circle at 70% 30%, #FAD689 0%, ${colorCookie} 80%, #BC3908 100%);
                border-radius: 100px 0 0 100px; z-index: 10;
                box-shadow: inset 10px 0 20px rgba(255,255,255,0.5), inset -10px -10px 20px rgba(0,0,0,0.5), 10px 10px 20px rgba(0,0,0,0.5);
                transform-origin: right center;
            }
            .cookie-left { left: 10px; transform: perspective(300px) rotateY(-20deg); }
            /* Right half is mirrored */
            .cookie-right {
                right: 10px; border-radius: 0 100px 100px 0;
                background: radial-gradient(circle at 30% 30%, #FAD689 0%, ${colorCookie} 80%, #BC3908 100%);
                box-shadow: inset -10px 0 20px rgba(255,255,255,0.5), inset 10px -10px 20px rgba(0,0,0,0.5), 10px 10px 20px rgba(0,0,0,0.5);
                transform-origin: left center; transform: perspective(300px) rotateY(20deg);
            }

            .hint {
                position: absolute; bottom: -50px; width: 100%; text-align: center;
                color: #FAD689; font-family: sans-serif; letter-spacing: 2px;
                animation: swipeAnim 2s infinite; font-size: 0.9rem; pointer-events: none;
            }
            @keyframes swipeAnim {
                0% { transform: scale(1); opacity: 0.5;}
                50% { transform: scale(1.1); opacity: 1;}
                100% { transform: scale(1); opacity: 0.5;}
            }

            /* Crumbs */
            .crumb { position: absolute; background: ${colorCookie}; border-radius: 50%; z-index: 1; }
        </style>

        <div class="cookie-scene" id="scene">
            <div class="fortune-slip" id="slip">
                <div class="slip-content" id="slip-content">
                    <div class="s-to">${escapeHtml(data.receiver)}</div>
                    <div class="s-msg">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                    <div class="luck-num">LUCKY: ${Math.floor(Math.random()*99)}, ${Math.floor(Math.random()*99)}, ${Math.floor(Math.random()*99)}</div>
                    <div style="font-size: 0.7rem; color: #888; margin-top:10px;">FROM: ${escapeHtml(data.sender)}</div>
                </div>
            </div>
            
            <div class="cookie-half cookie-left" id="c-left"></div>
            <div class="cookie-half cookie-right" id="c-right"></div>
            
            <div class="hint" id="hint">&larr; ดึงออก &rarr;</div>
        </div>
    `;

    const scene = document.getElementById('scene');
    const cLeft = document.getElementById('c-left');
    const cRight = document.getElementById('c-right');
    const slip = document.getElementById('slip');
    const sContent = document.getElementById('slip-content');
    
    let isDragging = false;
    let startX = 0;
    let dist = 0;
    let broken = false;

    function onStart(e) {
        if(broken) return;
        isDragging = true;
        startX = e.clientX || e.touches[0].clientX;
        document.getElementById('hint').style.opacity = 0;
    }

    function onMove(e) {
        if(!isDragging || broken) return;
        const currentX = e.clientX || e.touches[0].clientX;
        dist = Math.abs(currentX - startX); // Absolute pull distance
        
        // Visual feedback before breaking
        if(dist < 100) {
            cLeft.style.transform = `perspective(300px) rotateY(-20deg) translateX(${-dist/2}px) rotateZ(${-dist/10}deg)`;
            cRight.style.transform = `perspective(300px) rotateY(20deg) translateX(${dist/2}px) rotateZ(${dist/10}deg)`;
        } else {
            breakCookie();
        }
    }

    function onEnd() {
        if(!isDragging || broken) return;
        isDragging = false;
        if(dist < 100) {
            // snap back
            gsap.to(cLeft, { x: 0, rotationZ: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
            gsap.to(cRight, { x: 0, rotationZ: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
            document.getElementById('hint').style.opacity = 1;
        }
        dist = 0;
    }

    function breakCookie() {
        if(broken) return;
        broken = true;
        document.getElementById('hint').remove();
        
        // SNAP pieces away
        gsap.to(cLeft, { x: -250, y: 100, rotationZ: -45, opacity: 0, duration: 0.8, ease: "power2.in" });
        gsap.to(cRight, { x: 250, y: 100, rotationZ: 45, opacity: 0, duration: 0.8, ease: "power2.in" });

        // Generate crumbs
        for(let i=0; i<15; i++){
            let crumb = document.createElement('div');
            crumb.className = 'crumb';
            crumb.style.width = Math.random()*8+4 + 'px';
            crumb.style.height = crumb.style.width;
            crumb.style.left = '150px'; crumb.style.top = '150px';
            scene.appendChild(crumb);
            gsap.to(crumb, {
                x: (Math.random()-0.5)*200, y: Math.random()*200, rotation: Math.random()*360, opacity: 0,
                duration: 1+Math.random(), ease: "power1.in", onComplete: ()=>crumb.remove()
            });
        }

        // Unfold Paper Slip
        slip.style.opacity = 1;
        
        const tl = gsap.timeline();
        tl.to(slip, { scale: 1, duration: 0.5, ease: "back.out(1.5)" }) // pop
          .to(slip, { width: 340, height: 400, padding: 30, duration: 1, ease: "power2.inOut" }, "+=0.2") // unfold
          .call(() => {
                sContent.style.display = 'flex';
                gsap.from(sContent, { opacity: 0, duration: 0.5 });
                slip.style.boxShadow = "0 20px 50px rgba(0,0,0,0.5)";
          });
    }

    scene.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    scene.addEventListener('touchstart', onStart, {passive:false});
    window.addEventListener('touchmove', onMove, {passive:false});
    window.addEventListener('touchend', onEnd);
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
