export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#00050d";
    container.style.backgroundImage = "radial-gradient(circle at top, #1D4ED8 0%, #00050d 80%)";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const colorRibbon = config.to || '#7C3AED';

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Sarabun:wght@300;500&display=swap');
            
            .scroll-container {
                position: relative; width: 300px; height: 100px;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; transform-style: preserve-3d;
            }

            .scroll-wrapper {
                position: absolute; width: 100%; height: 80px;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                transition: height 1.5s cubic-bezier(0.25, 1, 0.5, 1);
            }

            .scroll-paper {
                width: 100%; height: 0; background: #fdf5e6;
                background-image: linear-gradient(to right, rgba(0,0,0,0.1) 0%, transparent 5%, transparent 95%, rgba(0,0,0,0.1) 100%);
                box-shadow: inset 0 0 20px rgba(0,0,0,0.1);
                overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center;
                box-sizing: border-box; text-align: center; color: #333; z-index: 5;
            }
            .paper-content { opacity: 0; padding: 30px 20px; transition: opacity 1s; }

            .scroll-roller {
                width: 110%; height: 30px; background: #e8dcc7;
                border-radius: 15px; position: absolute; z-index: 10;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3), inset 0 5px 10px rgba(255,255,255,0.5), inset 0 -5px 10px rgba(0,0,0,0.2);
                background-image: linear-gradient(90deg, #b09b71, #e8dcc7, #b09b71);
            }
            .roller-top { top: 0; }
            .roller-bottom { bottom: 0; }

            .ribbon {
                position: absolute; width: 40px; height: 110%; background: ${colorRibbon};
                z-index: 15; box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                border-left: 2px solid rgba(255,255,255,0.3); border-right: 2px solid rgba(0,0,0,0.3);
            }
            .ribbon-knot {
                position: absolute; width: 50px; height: 50px; background: ${colorRibbon};
                border-radius: 5px; z-index: 16; left: 50%; top: 50%; transform: translate(-50%, -50%) rotate(45deg);
                box-shadow: inset 0 0 10px rgba(0,0,0,0.5), 0 5px 10px rgba(0,0,0,0.5);
            }

            .s-title { font-family: 'Cinzel', serif; font-size: 1.8rem; color: #1D4ED8; margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 10px;}
            .s-msg { font-family: 'Sarabun', sans-serif; font-size: 1.1rem; line-height: 1.8; color: #444; }
            
            .hint-text {
                position: absolute; bottom: -60px; width: 100%; text-align: center;
                color: #fff; font-family: sans-serif; letter-spacing: 2px;
                animation: pulseHint 2s infinite; font-size: 0.9rem;
            }
            @keyframes pulseHint { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Sparkles bg */
            .bg-spark { position: absolute; background: white; border-radius: 50%; opacity: 0; }
        </style>

        <div class="scroll-container" id="scroll-cont">
            <div class="scroll-wrapper" id="wrapper">
                <div class="scroll-roller roller-top" id="rtop"></div>
                <div class="scroll-paper" id="paper">
                    <div class="paper-content" id="content">
                        <div class="s-title">Class of Excellence<br>${escapeHtml(data.receiver)}</div>
                        <div class="s-msg">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                        <div class="s-msg" style="margin-top:20px; font-weight:500;">Congratulations!<br>${escapeHtml(data.sender)}</div>
                    </div>
                </div>
                <div class="scroll-roller roller-bottom" id="rbot"></div>
            </div>
            
            <!-- The tied ribbon -->
            <div class="ribbon" id="ribbon"></div>
            <div class="ribbon-knot" id="knot"></div>
            
            <div class="hint-text" id="hint">แตะเพื่อคลี่ออก</div>
        </div>
    `;

    // Background sparks
    for(let i=0; i<30; i++) {
        let spark = document.createElement('div');
        spark.className = 'bg-spark';
        spark.style.width = Math.random()*4 + 'px';
        spark.style.height = spark.style.width;
        spark.style.left = Math.random()*100 + 'vw';
        spark.style.top = Math.random()*100 + 'vh';
        container.appendChild(spark);
        gsap.to(spark, { opacity: Math.random()*0.8, y: "-=50", duration: 2+Math.random()*2, repeat: -1, yoyo: true });
    }

    const cont = document.getElementById('scroll-cont');
    let isOpened = false;

    cont.addEventListener('click', () => {
        if(isOpened) return;
        isOpened = true;

        document.getElementById('hint').style.display = 'none';

        // 1. Ribbon falls off
        gsap.to('#knot', { y: 300, rotation: 180, opacity: 0, duration: 1, ease: "power2.in" });
        gsap.to('#ribbon', { scaleY: 0, opacity: 0, duration: 0.5, ease: "power2.in" });

        // 2. Scroll unrolls
        setTimeout(() => {
            const wrapper = document.getElementById('wrapper');
            const paper = document.getElementById('paper');
            const content = document.getElementById('content');
            
            const targetHeight = 400; // max height of unrolled scroll
            
            gsap.to(wrapper, { height: targetHeight, duration: 1.5, ease: "power2.out" });
            gsap.to(paper, { height: targetHeight - 30, duration: 1.5, ease: "power2.out" }); // -30 to fit between rollers
            
            // 3. Fade in content
            gsap.to(content, { opacity: 1, duration: 1, delay: 1 });
            
            // Pop effect on whole container
            gsap.to(cont, { scale: 1.05, duration: 1.5, ease: "power1.out" });
            
            // Golden particles emission
            emitGoldParticles();

        }, 400);
    });

    function emitGoldParticles() {
        const rect = cont.getBoundingClientRect();
        for(let i=0; i<40; i++) {
            let p = document.createElement('div');
            p.style.cssText = `position:absolute; width:6px; height:6px; background:#FBBF24; border-radius:50%; box-shadow:0 0 10px #F59E0B; z-index:20;`;
            p.style.left = rect.left + rect.width/2 + 'px';
            p.style.top = rect.top + rect.height/2 + 'px';
            container.appendChild(p);

            gsap.to(p, {
                x: (Math.random()-0.5)*400,
                y: (Math.random()-0.5)*400 - 100,
                opacity: 0,
                duration: 1 + Math.random()*1.5,
                ease: "power2.out",
                onComplete: () => p.remove()
            });
        }
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
