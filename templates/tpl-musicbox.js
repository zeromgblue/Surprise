/**
 * Music Box Template
 * A 3D CSS Box that interacts and opens its lid to reveal a message
 */
export async function render(container, data, tpl) {
    const style = document.createElement('style');
    style.textContent = `
        .music-box-scene {
            width: 100%; height: 100vh;
            background: radial-gradient(circle at center, #1a0f05 0%, #000 100%);
            display: flex; align-items: center; justify-content: center;
            perspective: 1200px; overflow: hidden; font-family: 'Outfit', sans-serif;
        }

        .box-wrapper {
            position: relative; width: 300px; height: 300px;
            transform-style: preserve-3d; transition: transform 0.8s ease;
            cursor: pointer; animation: floatBox 4s ease-in-out infinite;
        }

        @keyframes floatBox {
            0%, 100% { transform: rotateY(0deg) translateY(0); }
            50% { transform: rotateY(15deg) translateY(-20px); }
        }

        .box-face {
            position: absolute; width: 300px; height: 180px;
            background: linear-gradient(135deg, #7C2D12, #D97706);
            border: 2px solid rgba(255,255,255,0.1);
            box-shadow: inset 0 0 40px rgba(0,0,0,0.5);
        }

        .face-front  { transform: rotateY(0deg) translateZ(100px); }
        .face-back   { transform: rotateY(180deg) translateZ(100px); }
        .face-left   { transform: rotateY(-90deg) translateZ(100px); width: 200px; }
        .face-right  { transform: rotateY(90deg) translateZ(100px); width: 200px; }
        .face-bottom { transform: rotateX(-90deg) translateZ(90px); height: 200px; background: #331508; }
        
        .box-lid {
            position: absolute; bottom: 180px; width: 300px; height: 200px;
            background: linear-gradient(135deg, #D97706, #7C2D12);
            transform-origin: bottom;
            transform: rotateX(0deg); transition: transform 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            z-index: 10; border: 2px solid rgba(255,255,255,0.2);
        }

        .box-wrapper.open .box-lid { transform: rotateX(-120deg); }
        
        .message-card {
            position: absolute; width: 260px; height: 160px;
            background: white; border-radius: 12px;
            top: 20px; left: 20px; padding: 20px;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            opacity: 0; transform: translateY(0); transition: all 1s ease 0.5s;
            color: #331508; z-index: 5;
        }

        .box-wrapper.open .message-card {
            opacity: 1; transform: translateY(-120px) scale(1.2);
        }

        .decoration {
            position: absolute; width: 40px; height: 40px;
            background: gold; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 0 15px gold;
        }

        .interact-hint {
            position: absolute; bottom: 100px;
            color: rgba(255,255,255,0.6); font-size: 0.9rem;
            text-transform: uppercase; letter-spacing: 2px;
            animation: pulse 1.5s infinite;
        }
    `;
    document.head.appendChild(style);

    const scene = document.createElement('div');
    scene.className = 'music-box-scene';
    scene.innerHTML = `
        <div class="box-wrapper" id="music-box">
            <div class="box-lid"></div>
            <div class="box-face face-front"></div>
            <div class="box-face face-back"></div>
            <div class="box-face face-left"></div>
            <div class="box-face face-right"></div>
            <div class="box-face face-bottom"></div>
            
            <div class="message-card">
                <div style="font-size:0.6rem; font-weight:700; color:${tpl.from}; margin-bottom:10px;">HAPPY SURPRISE</div>
                <div style="font-size:1.4rem; font-weight:800; line-height:1.2; margin-bottom:10px;">${data.receiver}</div>
                <div style="font-size:0.8rem; line-height:1.5; color:#555;">${data.message}</div>
                <div style="font-size:0.75rem; font-weight:700; margin-top:10px;">— ${data.sender}</div>
            </div>
        </div>
        <div class="interact-hint" id="hint">แตะที่กล่องเพื่อเปิด</div>
    `;
    container.appendChild(scene);

    const box = document.getElementById('music-box');
    const hint = document.getElementById('hint');
    box.addEventListener('click', () => {
        box.classList.toggle('open');
        hint.style.display = 'none';
        
        if(box.classList.contains('open')) {
            // Trigger sparkles (simplified for this task)
            const count = 15;
            for(let i=0; i<count; i++) {
                createSparkle(scene);
            }
        }
    });

    function createSparkle(parent) {
        const s = document.createElement('div');
        s.innerHTML = '✦';
        s.style.cssText = `
            position: fixed; top: 50%; left: 50%;
            color: gold; pointer-events: none; z-index: 100;
            font-size: ${Math.random() * 20 + 10}px;
            animation: particleFly 1.5s forwards;
        `;
        parent.appendChild(s);
        const tx = (Math.random() - 0.5) * 400;
        const ty = (Math.random() - 0.8) * 400;
        s.animate([
            { transform: `translate(0, 0)`, opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px)`, opacity: 0 }
        ], { duration: 1500, easing: 'ease-out' });
        setTimeout(() => s.remove(), 1500);
    }
}
